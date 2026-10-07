import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { testStore } from './postgres-fixture.mjs';
import { seedSynthetic,readSettings } from '../src/lib/booking/store.mjs';
import { deliver,resolveReservation } from '../src/lib/booking/service.mjs';
import { calendar } from '../src/lib/booking/calendar.mjs';
process.env.BOOKING_CALENDAR_MODE='mock';process.env.BOOKING_ALLOW_SYNTHETIC='true';
async function save(db,settings){await db.query('UPDATE booking_settings SET body=$1,version=version+1',[JSON.stringify(settings)]);}
async function fixture(){
 const db=await testStore();await seedSynthetic(db);
 const {settings}=await readSettings(db);
 settings.timezone='UTC';settings.noticeMinutes=0;settings.incrementMinutes=5;
 settings.weekly=Array.from({length:7},()=>[{start:'00:00',end:'23:59'}]);
 settings.services=[{id:'synthetic',name:'Synthetic',enabled:true,duration:30,before:0,after:0}];
 await save(db,settings);return {db,settings,cal:calendar(db)};
}
async function queued(db,start,{attempted=false}={}){
 const id=randomUUID();
 await db.query(`INSERT INTO booking_reservations(id,request_hash,service_id,start,"end",occupied_start,occupied_end,status,contact,created_at)
 VALUES($1,'hash','synthetic',$2,$3,$2,$3,'pending','synthetic-contact',0)`,[id,start,start+1800000]);
 await db.query('INSERT INTO booking_jobs(reservation_id,attempted) VALUES($1,$2)',[id,attempted]);return id;
}
const future=()=>Date.parse(new Date(Date.now()+3*86400000).toISOString().slice(0,10)+'T12:00:00Z');
async function rejected(db,cal,id){
 assert.equal(await deliver(db,cal,id),'rejected');
 const {rows:[r]}=await db.query('SELECT r.status,r.contact,j.attempted FROM booking_reservations r JOIN booking_jobs j ON j.reservation_id=r.id WHERE r.id=$1',[id]);
 assert.deepEqual(r,{status:'rejected',contact:null,attempted:false});
 assert.equal((await db.query('SELECT count(*) n FROM booking_mock_events')).rows[0].n,0);
 assert.deepEqual(await resolveReservation(db,cal,id,'synthetic-admin'),{status:'rejected',holdReleased:true});
}
for(const minutes of [5,60])test(`unattempted job recovered ${minutes} minutes after start cannot insert`,async()=>{
 const {db,cal}=await fixture();try{
 const start=Math.floor((Date.now()-minutes*60000)/300000)*300000;
 await rejected(db,cal,await queued(db,start));
 }finally{await db.end();}
});
for(const change of ['closure','hours','removed','disabled','duration','before','after','notice','horizon','grid'])test(`current ${change} policy rejects queued first delivery`,async()=>{
 const {db,cal,settings}=await fixture();try{
 const start=future()+(change==='grid'?300000:0),id=await queued(db,start);
 if(change==='closure')settings.overrides=[{date:new Date(start).toISOString().slice(0,10),intervals:[]}];
 if(change==='hours')settings.weekly=Array.from({length:7},()=>[{start:'14:00',end:'15:00'}]);
 if(change==='removed')settings.services[0].id='other';
 if(change==='disabled')settings.services[0].enabled=false;
 if(['duration','before','after'].includes(change))settings.services[0][change]+=5;
 if(change==='notice')settings.noticeMinutes=43200;
 if(change==='horizon')settings.horizonDays=1;
 if(change==='grid')settings.incrementMinutes=15;
 await save(db,settings);await rejected(db,cal,id);
 }finally{await db.end();}
});
test('policy change during upstream lookup is read before first delivery',async()=>{
 const {db,cal,settings}=await fixture();try{
 const id=await queued(db,future());cal.busy=async()=>{settings.weekly=Array.from({length:7},()=>[]);await save(db,settings);return [];};
 await rejected(db,cal,id);
 }finally{await db.end();}
});
test('settings lock serializes concurrent closure before durable intent',async()=>{
 const {db,cal,settings}=await fixture();const writer=await db.connect();try{
 const id=await queued(db,future());let saving;
 cal.busy=async()=>{
  await writer.query('BEGIN');await writer.query('SELECT * FROM booking_settings FOR UPDATE');
  settings.weekly=Array.from({length:7},()=>[]);await save(writer,settings);
  saving=new Promise((resolve,reject)=>setTimeout(()=>writer.query('COMMIT').then(resolve,reject),100));return [];
 };
 await rejected(db,cal,id);await saving;
 }finally{await writer.query('ROLLBACK');writer.release();await db.end();}
});
test('slow upstream checks and credential preparation crossing notice cutoff cannot insert',async()=>{
 const {db,cal,settings}=await fixture();const second=await fixture();try{
 const {rows:[clock]}=await db.query('SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint AS now');
 // At most one minute to the boundary, regardless of wall-clock start. Run both
 // paths concurrently so this is one real database-clock wait, not a fake clock.
 const cutoff=(Math.floor(clock.now/60000)+1)*60000;
 const start=Math.ceil((cutoff+3600000)/300000)*300000;
 settings.noticeMinutes=(start-cutoff)/60000;await save(db,settings);await save(second.db,settings);
 const id=await queued(db,start);
 const wait=async()=>{await new Promise(r=>setTimeout(r,Math.max(0,cutoff-Date.now()+50)));};
 // First slow busy check: cutoff is passed before eligibility is evaluated.
 cal.busy=async()=>{await wait();return [];};
 // Credential preparation may also be slow. No gate runs until preparation ends.
 const cal2=second.cal,insert=cal2.insert.bind(cal2);
 cal2.insert=async(e,gate)=>{await wait();return insert(e,gate);};
 const id2=await queued(second.db,start);
 assert(Date.now()<cutoff,'Both jobs must begin before eligibility expires');
 await Promise.all([rejected(db,cal,id),rejected(second.db,cal2,id2)]);
 }finally{await db.end();await second.db.end();}
});
test('expired or changed attempted writes stay held; exact upstream evidence can confirm',async()=>{
 const {db,cal,settings}=await fixture();try{
 const start=Math.floor((Date.now()-3600000)/300000)*300000,id=await queued(db,start,{attempted:true});
 settings.weekly=Array.from({length:7},()=>[]);await save(db,settings);
 let sends=0;cal.insert=async()=>{sends++;throw new Error('Must not resend');};
 assert.equal(await deliver(db,cal,id),'review');assert.equal(sends,0);
 assert.equal((await db.query('SELECT contact FROM booking_reservations WHERE id=$1',[id])).rows[0].contact,'synthetic-contact');
 await assert.rejects(queued(db,start),{code:'23P01'});
 await db.query('INSERT INTO booking_mock_events VALUES($1,$2)',[id,JSON.stringify({id,start,end:start+1800000})]);
 assert.equal(await deliver(db,cal,id),'confirmed');assert.equal(sends,0);
 }finally{await db.end();}
});
