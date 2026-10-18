import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from '../src/lib/booking/service.mjs';

// Pure query-double: exercise the actual confirmed reconciliation branch while
// avoiding PostgreSQL fixtures, booking creation, and external calendar access.
test('reconciliation confirms a matching event without a missing isMock dependency', async () => {
  const statements=[];
  const db={async connect(){return {query:db.query.bind(db),release(){}}},async query(sql,params=[]) {
    statements.push(sql);
    if(sql.startsWith("SELECT id FROM booking_reservations WHERE status!='rejected'")) return {rows:[{id:'existing-reference'}]};
    if(sql.includes('WITH candidate AS')) return {rows:[{reservation_id:'existing-reference',lease_token:'lease-1',attempted:true}]};
    if(sql.includes('SELECT * FROM booking_reservations')) return {rows:[{id:'existing-reference',start:1792854000000,end:1792855800000,occupied_start:1792854000000,occupied_end:1792855800000,status:'pending',service_id:'consulting'}]};
    if(sql.includes('FROM booking_mock_events WHERE id=$1')) return {rows:[{body:JSON.stringify({id:'existing-reference',start:1792854000000,end:1792855800000})}]};
    if(sql.includes('UPDATE booking_jobs SET lease_token=NULL')) return {rowCount:1,rows:[]};
    if(sql.includes('UPDATE booking_reservations SET status=$2')) return {rows:[{id:'existing-reference',start:1792854000000,status:'confirmed',contact:null,service_id:'consulting'}]};
    if(sql.includes('SELECT * FROM booking_settings')) return {rows:[{version:1,body:JSON.stringify({timezone:'America/Chicago',services:[{id:'consulting',name:'Consultation'}]})}]};
    if(sql.includes('SELECT id FROM booking_reservations WHERE status')) return {rows:[{id:'existing-reference'}]};
    return {rows:[]};
  }};
  process.env.BOOKING_CALENDAR_MODE='mock';
  process.env.BOOKING_ALLOW_SYNTHETIC='true';
  const result=await reconcile(db,{async get(){return {start:1792854000000,end:1792855800000};}}, {cursor:'',max:1});
  assert.deepEqual(statements,statements);
  assert.equal(result.confirmed,1);
  assert(statements.some(sql=>sql.includes('UPDATE booking_reservations SET status=$2')));
});
