import test from 'node:test';
import assert from 'node:assert/strict';
import { testStore } from './postgres-fixture.mjs';
import { recover, recoveryHealth } from '../src/lib/booking/service.mjs';

test('historical confirmed jobs do not consume capacity; expired uncertain holds stay recoverable', async()=>{
 const db=await testStore();
 try {
  await db.query(`INSERT INTO booking_reservations(id,request_hash,service_id,start,"end",occupied_start,occupied_end,status,created_at)
   SELECT 'old-'||i,'hash','synthetic',i*60000,(i+1)*60000,i*60000,(i+1)*60000,'confirmed',0 FROM generate_series(1,500)i`);
  await db.query(`INSERT INTO booking_reservations(id,request_hash,service_id,start,"end",occupied_start,occupied_end,status,created_at)
   VALUES('uncertain','hash','synthetic',60000000,60060000,60000000,60060000,'review',0)`);
  await db.query('INSERT INTO booking_jobs(reservation_id) SELECT id FROM booking_reservations');
  await db.query("UPDATE booking_jobs SET attempted=true,lease_until=clock_timestamp()-interval '1 minute' WHERE reservation_id='uncertain'");
  let calls=0;const upstream={async get(id){calls++;assert.equal(id,'uncertain');return null;}};
  const before=await recoveryHealth(db);assert.equal(before.due,1);assert.equal(before.expired_leases,1);
  const started=Date.now();const result=await recover(db,upstream);assert.equal(result.visited,1);assert.equal(result.review,1);assert.equal(calls,1);
  assert.equal((await db.query("SELECT status FROM booking_reservations WHERE id='uncertain'")).rows[0].status,'review');
  assert.equal((await recoveryHealth(db)).due,0);
  assert.equal((await recoveryHealth(db)).unresolved,1);
  console.log(`Synthetic lifecycle: 500 past confirmations + 1 expired uncertain lease; ${Date.now()-started}ms, ${calls} provider lookup, hold retained.`);
 } finally {await db.end();}
});
test('provider outage delays retry and preserves uncertain holds without resending', async()=>{
 const db=await testStore();
 try{
  await db.query(`INSERT INTO booking_reservations(id,request_hash,service_id,start,"end",occupied_start,occupied_end,status,created_at)
   VALUES('held','hash','synthetic',60000000,60060000,60000000,60060000,'review',0)`);
  await db.query("INSERT INTO booking_jobs(reservation_id,attempted) VALUES('held',true)");
  const result=await recover(db,{async get(){throw new Error('synthetic quota outage');},async insert(){assert.fail('must not resend');}});
  assert.equal(result.pending,1);assert.equal((await recoveryHealth(db)).due,0);
  assert.equal((await db.query("SELECT status FROM booking_reservations WHERE id='held'")).rows[0].status,'review');
 }finally{await db.end();}
});
