import { getStore } from '../src/lib/booking/store.mjs';
const db=getStore();
const result=await db.query('UPDATE booking_reservations SET contact=NULL WHERE contact IS NOT NULL AND "end"<$1',[Date.now()-30*86400000]);
await db.query('DELETE FROM booking_limits WHERE expires<clock_timestamp()');
await db.query('DELETE FROM booking_oauth_state WHERE expires<$1',[Date.now()]);
console.log(`Purged contact blobs from ${result.rowCount} expired records. Calendar contains no contact data.`);
await db.end();
