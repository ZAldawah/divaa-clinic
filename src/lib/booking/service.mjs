import { Temporal } from '@js-temporal/polyfill';
import { bookingSchema, dateSchema } from './schema.mjs';
import { readSettings, reservations } from './store.mjs';
import { dayBounds, slotsFor } from './slots.mjs';
import { digest, seal } from './crypto.mjs';

export const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export async function availability(db,upstream,date,serviceId,now=Date.now()) {
  dateSchema.parse(date);
  const {settings}=readSettings(db),[min,max]=dayBounds(date,settings.timezone);
  // Bound expensive upstream work to the configured scheduling horizon.
  const today=Temporal.Instant.fromEpochMilliseconds(now).toZonedDateTimeISO(settings.timezone).toPlainDate();
  if(Temporal.PlainDate.compare(date,today)<0 || Temporal.PlainDate.compare(date,today.add({days:settings.horizonDays}))>0) return [];
  const busy=await upstream.busy(min,max);
  return slotsFor({settings,date,serviceId,now,busy:[...busy,...reservations(db,min,max)]});
}
function result(row) {return {reference:row.id,status:row.status,start:new Date(row.start).toISOString(),end:new Date(row.end).toISOString()};}
export async function book(db,upstream,input,now=Date.now()) {
  const data=bookingSchema.parse(input), id=digest(data.key),hash=digest(JSON.stringify({...data,email:data.email.toLowerCase()}));
  const existing=db.prepare('SELECT * FROM booking_reservations WHERE id=?').get(id);
  if(existing) {if(existing.request_hash!==hash) fail(409,'This request reference was already used.');if(existing.status==='rejected')fail(409,'That time is no longer available. Please choose another.'); return result(existing);}
  const {settings,version}=readSettings(db), start=Date.parse(data.start);
  const date=Temporal.Instant.fromEpochMilliseconds(start).toZonedDateTimeISO(settings.timezone).toPlainDate().toString();
  const available=await availability(db,upstream,date,data.serviceId,now);
  if(!available.some(s=>s.start===data.start)) fail(409,'That time is no longer available. Please choose another.');
  const s=settings.services.find(s=>s.id===data.serviceId),end=start+s.duration*60000;
  const occupiedStart=start-s.before*60000,occupiedEnd=end+s.after*60000;
  const contact=seal(JSON.stringify({name:data.name,email:data.email}));
  const inserted=db.transaction(()=>{
    const prior=db.prepare('SELECT * FROM booking_reservations WHERE id=?').get(id);
    if(prior) {if(prior.request_hash!==hash) fail(409,'This request reference was already used.');return false;}
    if(readSettings(db).version!==version) fail(409,'Availability changed. Please choose a time again.');
    if(reservations(db,occupiedStart,occupiedEnd).length) fail(409,'That time is no longer available. Please choose another.');
    db.prepare('INSERT INTO booking_reservations VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,hash,data.serviceId,start,end,occupiedStart,occupiedEnd,'pending',contact,now);return true;
  }).immediate();
  if(inserted) {
    try {
      // Hold exists before this second upstream check: concurrent application writers cannot pass it.
      const busy=await upstream.busy(occupiedStart,occupiedEnd);
      if(busy.some(b=>b.start<occupiedEnd && b.end>occupiedStart)) {
        db.prepare("UPDATE booking_reservations SET status='rejected',contact=NULL WHERE id=?").run(id);
        fail(409,'That time is no longer available. Please choose another.');
      }
      const event=await upstream.insert({id,start:occupiedStart,end:occupiedEnd});
      if(event?.start===occupiedStart && event?.end===occupiedEnd) db.prepare("UPDATE booking_reservations SET status='confirmed' WHERE id=?").run(id);
    } catch(e) {if(e.status===409) throw e; /* Unknown outcome stays reserved; no raw error/contact logging. */}
  }
  return result(db.prepare('SELECT * FROM booking_reservations WHERE id=?').get(id));
}
export async function reconcile(db,upstream) {
  let confirmed=0,review=0;
  for(const row of db.prepare("SELECT * FROM booking_reservations WHERE status IN ('pending','confirmed','review') AND occupied_end>? LIMIT 100").all(Date.now()-86400000)) {
    const e=await upstream.get(row.id);
    if(e?.start===row.occupied_start && e?.end===row.occupied_end) {db.prepare("UPDATE booking_reservations SET status='confirmed' WHERE id=?").run(row.id);confirmed++;}
    else { db.prepare("UPDATE booking_reservations SET status='review' WHERE id=?").run(row.id);review++; }
  }
  return {confirmed,review}; // Missing/changed events require manual review; never release uncertain reservations automatically.
}
