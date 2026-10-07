import { getStore } from '../src/lib/booking/store.mjs';
const result=getStore().prepare('UPDATE booking_reservations SET contact=NULL WHERE contact IS NOT NULL AND end<?').run(Date.now()-30*86400000);
console.log(`Purged contact blobs from ${result.changes} expired records. Calendar contains no contact data.`);
