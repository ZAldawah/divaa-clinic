import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { seedSynthetic,readSettings,reservations,limit } from '../src/lib/booking/store.mjs';
import { testStore } from './postgres-fixture.mjs';
import { slotsFor,dayBounds } from '../src/lib/booking/slots.mjs';
import { settingsSchema,syntheticSettings } from '../src/lib/booking/schema.mjs';
import { availability,book,reconcile } from '../src/lib/booking/service.mjs';
import { seal,unseal } from '../src/lib/booking/crypto.mjs';
process.env.BOOKING_ENCRYPTION_KEY=randomBytes(32).toString('base64');
const now=Date.parse('2026-10-07T12:00:00Z');
async function fixture(){const db=await testStore();await seedSynthetic(db);const events=new Map();const cal={async busy(){return [...events.values()];},async get(id){return events.get(id)||null;},async insert(e,gate){if(!await gate())return null;events.set(e.id,e);return e;}};return {db,cal,events};}
const future=new Date(Date.now()+3*86400000);
while([0,6].includes(future.getUTCDay()))future.setUTCDate(future.getUTCDate()+1);
const request=()=>({serviceId:'synthetic-consultation',start:future.toISOString().slice(0,10)+'T15:15:00.000Z',name:'Avery Example',email:'avery@example.test',key:randomUUID()});
test('buffers, notice, horizon, lunch, overrides and all-day busy',()=>{
  const s=structuredClone(syntheticSettings), args={settings:s,date:'2026-10-08',serviceId:s.services[0].id,now};
  let slots=slotsFor(args);assert.equal(slots[0].start,'2026-10-08T14:15:00.000Z');assert.equal(slots.at(-1).end,'2026-10-08T21:45:00.000Z');
  s.overrides=[{date:args.date,intervals:[]}];assert.equal(slotsFor(args).length,0);
  s.overrides=[{date:args.date,intervals:[{start:'09:00',end:'12:00'},{start:'13:00',end:'17:00'}]}];
  slots=slotsFor(args);assert(!slots.some(v=>v.start==='2026-10-08T17:00:00.000Z'));
  const [start,end]=dayBounds(args.date,s.timezone);assert.equal(slotsFor({...args,busy:[{start,end}]}).length,0);
  assert.equal(slotsFor({...args,date:'2027-10-08'}).length,0);
  assert.equal(slotsFor({...args,now:Date.parse('2026-10-08T20:00Z')}).length,0);
});
test('DST excludes ambiguous/nonexistent times and crossing offset changes',()=>{
  const s=structuredClone(syntheticSettings);s.noticeMinutes=0;s.weekly=Array.from({length:7},()=>[{start:'00:00',end:'05:00'}]);s.services[0]={...s.services[0],before:0,after:0,duration:30};
  for(const date of ['2026-03-08','2026-11-01']){
    const slots=slotsFor({settings:s,date,serviceId:s.services[0].id,now:Date.parse(`${date}T00:00Z`)});
    assert(slots.length>0);
    const local=slots.map(v=>new Intl.DateTimeFormat('en-US',{hour:'2-digit',hourCycle:'h23',timeZone:s.timezone}).format(new Date(v.start)));
    assert(!local.includes(date.includes('03-08')?'02':'01'));
  }
});
test('schema rejects overlapping hours, duplicate exceptions, invalid zone and health fields',async()=>{
  const s=structuredClone(syntheticSettings);s.weekly[0]=[{start:'09:00',end:'12:00'},{start:'11:00',end:'13:00'}];assert.equal(settingsSchema.safeParse(s).success,false);
  assert.equal(settingsSchema.safeParse({...syntheticSettings,timezone:'invalid'}).success,false);
  const {db,cal}=await fixture();await assert.rejects(book(db,cal,{...request(),medicalNotes:'not accepted'},now));await db.end();
});
test('concurrent clients cannot reserve overlapping spans; retries preserve one event',async()=>{
  const {db,cal,events}=await fixture(),a=request();
  const result=await Promise.allSettled([book(db,cal,a),book(db,cal,request())]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal(events.size,1);
  const retry=await book(db,cal,a);assert.equal(retry.status,'confirmed');assert.equal(events.size,1);
  await assert.rejects(book(db,cal,{...a,name:'Changed'}),{status:409});
  const notices=await db.query('SELECT reference,status,idempotency_key FROM booking_notification_outbox');
  assert.equal(notices.rows.length,1);assert.equal(notices.rows[0].status,'disabled');assert.equal(notices.rows[0].idempotency_key,`booking-confirmation:${retry.reference}`);
  const stored=(await db.query('SELECT contact FROM booking_reservations')).rows[0].contact;assert(!stored.includes('Avery'));assert.equal(JSON.parse(unseal(stored)).name,'Avery Example');await db.end();
});
test('invalid contact writes nothing; corrected double submit creates one reservation and event',async()=>{
  const {db,cal,events}=await fixture();
  try {
    await assert.rejects(book(db,cal,{...request(),email:'avery..example@example.test'}),error=>error.code==='BOOKING_CONTACT_INVALID' && error.fields.includes('email'));
    assert.equal((await db.query('SELECT COUNT(*) n FROM booking_reservations')).rows[0].n,0);
    assert.equal((await db.query('SELECT COUNT(*) n FROM booking_jobs')).rows[0].n,0);
    assert.equal(events.size,0);
    const corrected=request();
    await Promise.all([book(db,cal,corrected),book(db,cal,corrected)]);
    assert.equal((await book(db,cal,corrected)).status,'confirmed');
    assert.equal((await db.query('SELECT COUNT(*) n FROM booking_reservations')).rows[0].n,1);
    assert.equal(events.size,1);
  } finally { await db.end(); }
});
test('notification failure rolls back confirmation, and recovery enqueues once after confirmation',async()=>{
  const {db,cal,events}=await fixture();
  try {
    const input=request();
    await db.query(`CREATE FUNCTION reject_test_notice() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic outbox failure'; END $$`);
    await db.query('CREATE TRIGGER reject_test_notice BEFORE INSERT ON booking_notification_outbox FOR EACH ROW EXECUTE FUNCTION reject_test_notice()');
    const pending=await book(db,cal,input);
    assert.equal(pending.status,'pending');
    assert.equal(events.size,1,'upstream event remains available for reconciliation');
    assert.equal((await db.query('SELECT status FROM booking_reservations')).rows[0].status,'pending','confirmation and outbox write share one rollback boundary');
    assert.equal((await db.query('SELECT COUNT(*) AS n FROM booking_notification_outbox')).rows[0].n,0);
    await db.query('DROP TRIGGER reject_test_notice ON booking_notification_outbox');
    await db.query('DROP FUNCTION reject_test_notice()');
    await db.query("UPDATE booking_jobs SET next_at=clock_timestamp()-interval '1 second'");
    const recovery=await reconcile(db,cal);
    assert.equal(recovery.confirmed,1);
    const replay=await book(db,cal,input);
    assert.equal(replay.status,'confirmed');
    assert.equal(events.size,1,'replay observes the existing event instead of inserting a second');
    const notices=(await db.query('SELECT reference,status,idempotency_key FROM booking_notification_outbox')).rows;
    assert.equal(notices.length,1);
    assert.equal(notices[0].reference,replay.reference);
    assert.equal(notices[0].status,'disabled');
    assert.equal(notices[0].idempotency_key,`booking-confirmation:${replay.reference}`);
  } finally { await db.end(); }
});
test('upstream failure creates no reservation; lost insert response retains hold and reconciles',async()=>{
  const {db,cal,events}=await fixture();
  await assert.rejects(availability(db,{busy:async()=>{throw new Error('outage');}},'2026-10-08','synthetic-consultation',now));
  assert.equal((await db.query('SELECT COUNT(*) n FROM booking_reservations')).rows[0].n,0);
  cal.insert=async(e,gate)=>{if(!await gate())return null;events.set(e.id,e);throw new Error('response lost');};
  const r=await book(db,cal,request());assert.equal(r.status,'pending');assert.equal((await reservations(db,0,Infinity)).length,1);
  const check=await reconcile(db,cal);assert.equal(check.confirmed,1);assert.equal((await db.query('SELECT status FROM booking_reservations')).rows[0].status,'confirmed');
  assert.equal((await db.query('SELECT status FROM booking_notification_outbox')).rows[0].status,'disabled');await db.end();
});
test('external edits retain conflict holds; encryption detects tampering; rate limiting persists',async()=>{
  const {db,cal,events}=await fixture();const r=await book(db,cal,request());events.delete(r.reference);const check=await reconcile(db,cal);assert.equal(check.review,1);assert.equal((await reservations(db,0,Infinity)).length,1);
  const cipher=seal('private');const b=Buffer.from(cipher,'base64');b[30]^=1;assert.throws(()=>unseal(b.toString('base64')));
  await limit(db,'x',1);await assert.rejects(limit(db,'x',1),{status:429});assert.equal((await readSettings(db)).version,1);await db.end();
});
