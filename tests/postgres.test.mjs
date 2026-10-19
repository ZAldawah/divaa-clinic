import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { randomBytes,randomUUID } from 'node:crypto';
import { testStore } from './postgres-fixture.mjs';
import { openStore,seedSynthetic,readSettings,limit } from '../src/lib/booking/store.mjs';
import { book,reconcile,deliver,resolveReservation,availability } from '../src/lib/booking/service.mjs';
import { calendar } from '../src/lib/booking/calendar.mjs';
import { clientKey } from '../src/lib/booking/abuse.mjs';
process.env.BOOKING_ENCRYPTION_KEY=randomBytes(32).toString('base64');
process.env.BOOKING_CALENDAR_MODE='mock';process.env.BOOKING_ALLOW_SYNTHETIC='true';
const now=Date.now();
const future=new Date(now+3*86400000);
while([0,6].includes(future.getUTCDay()))future.setUTCDate(future.getUTCDate()+1);
const futureDate=future.toISOString().slice(0,10);
const request=()=>({serviceId:'synthetic-consultation',start:`${futureDate}T15:15:00.000Z`,name:'Avery Example',email:'avery@example.test',key:randomUUID()});
function worker(db,msg){return new Promise((resolve,reject)=>{
 const child=fork(new URL('./postgres-worker.mjs',import.meta.url),[],{env:{...process.env,DATABASE_URL:db.testUrl,BOOKING_SYNTHETIC_DATABASE_URL:db.testUrl},stdio:['ignore','ignore','pipe','ipc'],windowsHide:true});
 let answer,stderr='';child.stderr.on('data',v=>stderr+=v);child.on('error',reject);
 child.on('message',v=>{if(v.ready)child.send(msg);else answer=v;});
 child.on('exit',code=>{if(answer)resolve(answer);else if([71,72].includes(code))resolve({crashed:code});else reject(new Error(`Worker failed ${code}: ${stderr}`));});
});}
async function fixture(){const db=await testStore();await seedSynthetic(db);return db;}
test('real PostgreSQL separate processes: collision, replay, restart, adjacency, direct constraint',async()=>{
 const db=await fixture();try{
 const a=request(),b=request();const r=await Promise.all([worker(db,{input:a,now}),worker(db,{input:b,now})]);
 assert.equal(r.filter(v=>v.ok).length,1);assert.equal(r.filter(v=>v.status===409).length,1);
 const winner=r[0].ok?a:b;const retry=await worker(db,{input:winner,now});assert.equal(retry.result.status,'confirmed');
 const same={...request(),start:`${futureDate}T17:15:00.000Z`};const replay=await Promise.all([worker(db,{input:same,now}),worker(db,{input:same,now})]);assert(replay.every(v=>v.ok));assert.equal(replay[0].result.reference,replay[1].result.reference);
 assert.equal((await db.query('SELECT count(*) n FROM booking_mock_events')).rows[0].n,2);
 assert.equal((await worker(db,{input:{...winner,name:'Different'},now})).status,409);
 const adjacent=await worker(db,{input:{...request(),start:`${futureDate}T16:15:00.000Z`},now});assert.equal(adjacent.ok,true);
 await assert.rejects(db.query(`INSERT INTO booking_reservations(id,request_hash,service_id,start,"end",occupied_start,occupied_end,status,created_at)
 SELECT 'direct-overlap',request_hash,service_id,start,"end",occupied_start,occupied_end,'pending',created_at FROM booking_reservations LIMIT 1`),{code:'23P01'});
 }finally{await db.end();}
});
for(const crash of ['pending','inserted'])test(`process termination after ${crash}: durable recovery without duplicate event`,async()=>{
 const db=await fixture();try{
 assert.equal((await worker(db,{input:request(),now,crash})).crashed,crash==='pending'?71:72);
 assert.equal((await db.query('SELECT count(*) n FROM booking_jobs')).rows[0].n,1);
 assert.equal((await worker(db,{action:'recover'})).result.visited,0); // Live lease cannot be stolen.
 await db.query("UPDATE booking_jobs SET lease_until=clock_timestamp()-interval '1 second'");
 assert.equal((await worker(db,{action:'recover'})).result.confirmed,1);
 assert.equal((await db.query('SELECT count(*) n FROM booking_mock_events')).rows[0].n,1);
 assert.equal((await db.query('SELECT status FROM booking_reservations')).rows[0].status,'confirmed');
 }finally{await db.end();}
});
test('205 durable jobs drain beyond first 100; keyset reconciliation visits all holds',async()=>{
 const db=await fixture();try{
 const {settings}=await readSettings(db);settings.timezone='UTC';settings.noticeMinutes=0;settings.incrementMinutes=5;
 settings.weekly=Array.from({length:7},()=>[{start:'00:00',end:'23:59'}]);
 settings.services=[{id:'synthetic',name:'Synthetic',enabled:true,duration:5,before:0,after:0}];
 await db.query('UPDATE booking_settings SET body=$1,version=version+1',[JSON.stringify(settings)]);
 const base=Date.parse(`${futureDate}T00:00:00Z`);
 await db.query(`INSERT INTO booking_reservations(id,request_hash,service_id,start,"end",occupied_start,occupied_end,status,created_at)
 SELECT lpad(i::text,64,'0'),'hash','synthetic',$1::bigint+i*300000,$1::bigint+(i+1)*300000,$1::bigint+i*300000,$1::bigint+(i+1)*300000,'pending',0 FROM generate_series(1,205)i`,[base]);
 await db.query('INSERT INTO booking_jobs(reservation_id) SELECT id FROM booking_reservations');
 for(const count of [100,100,5])assert.equal((await worker(db,{action:'recover'})).result.visited,count);
 let cursor='',visited=0;do{const r=await reconcile(db,calendar(db),{cursor,max:100});visited+=r.visited;cursor=r.nextCursor;}while(cursor);
 assert.equal(visited,205);assert.equal((await db.query('SELECT count(*) n FROM booking_mock_events')).rows[0].n,205);
 }finally{await db.end();}
});
test('stale worker result cannot overwrite newer recovery; uncertainty preserves hold and audit',async()=>{
 const db=await fixture();try{
 let resume,entered;const reached=new Promise(r=>entered=r),gate=new Promise(r=>resume=r);
 const cal=calendar(db),insert=cal.insert.bind(cal);cal.insert=async(e,authorize)=>{await insert(e,authorize);entered();await gate;throw new Error('lost response');};
 const booking=book(db,cal,request(),now);await reached;
 const {rows:[row]}=await db.query('SELECT * FROM booking_reservations');
 await db.query("UPDATE booking_jobs SET lease_until=clock_timestamp()-interval '1 second'");
 assert.equal((await worker(db,{action:'recover'})).result.confirmed,1);resume();await booking;
 assert.equal((await db.query('SELECT status FROM booking_reservations')).rows[0].status,'confirmed');
 await db.query('DELETE FROM booking_mock_events');
 const r=await resolveReservation(db,calendar(db),row.id,'synthetic-admin');assert.equal(r.status,'review');assert.equal(r.holdReleased,false);
 assert.equal((await db.query('SELECT count(*) n FROM booking_audit')).rows[0].n,2);
 }finally{await db.end();}
});
test('settings race invalidates stale slot; outage creates no side effects',async()=>{
 const db=await fixture();try{
 const cal=calendar(db);cal.busy=async()=>{await db.query('UPDATE booking_settings SET version=version+1');return [];};
 await assert.rejects(book(db,cal,request(),now),{status:409});
 assert.equal((await db.query('SELECT count(*) n FROM booking_reservations')).rows[0].n,0);
 const offline=openStore('postgresql://age11_test@127.0.0.1:55442/postgres');try{await assert.rejects(availability(offline,calendar(db),'2026-10-08','synthetic-consultation',now));}finally{await offline.end();}
 assert.throws(()=>openStore(),/DATABASE_URL/);
 assert.throws(()=>openStore('postgresql://example.test/database'),/certificate/);
 }finally{await db.end();}
});
test('atomic cross-process quotas isolate clients; denial commits; trusted headers fail closed',async()=>{
 const db=await fixture();try{
 const r=await Promise.all(Array.from({length:6},()=>worker(db,{action:'limit',key:'auth:client-a',max:3})));
 assert.equal(r.filter(v=>v.ok).length,3);assert.equal(r.filter(v=>v.status===429).length,3);
 await limit(db,'auth:client-b',3);assert.equal((await db.query("SELECT count FROM booking_limits WHERE key='auth:client-a'")).rows[0].count,6);
 const env={VERCEL:'1',BOOKING_TRUSTED_EDGE:'vercel',BOOKING_RATE_KEY:'x'.repeat(32)};
 const req=new Request('https://example.test',{headers:{'x-forwarded-for':'1.1.1.1','x-vercel-forwarded-for':'192.0.2.1'}});
 const key=clientKey(req,env);req.headers.set('x-forwarded-for','2.2.2.2');assert.equal(clientKey(req,env),key);
 assert.throws(()=>clientKey(req,{...env,VERCEL:'0'}),{status:503});
 req.headers.delete('x-vercel-forwarded-for');assert.throws(()=>clientKey(req,env),{status:503});
 req.headers.set('x-vercel-forwarded-for','1.1.1.1, 2.2.2.2');assert.throws(()=>clientKey(req,env),{status:503});
 }finally{await db.end();}
});

test('OAuth state consumed once across processes and bound to live session',async()=>{
 const db=await fixture();try{
 await db.query('INSERT INTO booking_oauth_state VALUES($1,$2,$3,$4)',['hash','session','sealed-verifier',Date.now()+60000]);
 assert.equal((await worker(db,{action:'oauth',hash:'hash',session:'other'})).result,false);
 const results=await Promise.all([worker(db,{action:'oauth',hash:'hash',session:'session'}),worker(db,{action:'oauth',hash:'hash',session:'session'})]);
 assert.equal(results.filter(r=>r.result).length,1);
 await db.query('INSERT INTO booking_oauth_state VALUES($1,$2,$3,$4)',['expired','session','sealed-verifier',Date.now()-1000]);
 assert.equal((await worker(db,{action:'oauth',hash:'expired',session:'session'})).result,false);
 }finally{await db.end();}
});
test('Better Auth sessions persist across processes; allowlist revocation and expiry enforced',async()=>{
 const db=await fixture();try{
 const {hashPassword}=await import('better-auth/crypto');
 process.env.BETTER_AUTH_URL='http://127.0.0.1:3111';process.env.BETTER_AUTH_SECRET=randomBytes(48).toString('base64');
 const password=randomBytes(24).toString('base64'),id=randomUUID();
 await db.query('INSERT INTO "user"(id,name,email,"emailVerified") VALUES($1,$2,$3,true)',[id,'Synthetic','staff@example.test']);
 await db.query('INSERT INTO account(id,"accountId","providerId","userId",password,"updatedAt") VALUES($1,$2,$3,$4,$5,clock_timestamp())',[randomUUID(),id,'credential',id,await hashPassword(password)]);
 await db.query('INSERT INTO booking_admins VALUES($1)',[id]);
 const login=await worker(db,{action:'login',email:'staff@example.test',password});assert.equal(login.result.status,200);
 const cookie=login.result.cookie.split(';')[0];
 assert.equal((await worker(db,{action:'session',cookie})).result.userId,id);
 await db.query('DELETE FROM booking_admins');assert.equal((await worker(db,{action:'session',cookie})).status,403);
 await db.query('INSERT INTO booking_admins VALUES($1)',[id]);await db.query('UPDATE session SET "expiresAt"=clock_timestamp()-interval \'1 second\'');
 assert.equal((await worker(db,{action:'session',cookie})).status,401);
 }finally{await db.end();}
});
