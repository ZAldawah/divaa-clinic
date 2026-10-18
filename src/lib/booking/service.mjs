import { Temporal } from '@js-temporal/polyfill';
import { randomUUID } from 'node:crypto';
import { bookingSchema, dateSchema } from './schema.mjs';
import { readSettings, reservations, transaction } from './store.mjs';
import { dayBounds, slotsFor } from './slots.mjs';
import { digest, seal } from './crypto.mjs';
import { enqueueBookingNotification } from './confirmation-email.mjs';
export const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export async function availability(db,upstream,date,serviceId,now=Date.now()) {
 dateSchema.parse(date);
 const {settings}=await readSettings(db),[min,max]=dayBounds(date,settings.timezone);
 const today=Temporal.Instant.fromEpochMilliseconds(now).toZonedDateTimeISO(settings.timezone).toPlainDate();
 if(Temporal.PlainDate.compare(date,today)<0 || Temporal.PlainDate.compare(date,today.add({days:settings.horizonDays}))>0) return [];
 const busy=await upstream.busy(min,max);
 return slotsFor({settings,date,serviceId,now,busy:[...busy,...await reservations(db,min,max)]});
}
function result(row) {return {reference:row.id,status:row.status,start:new Date(row.start).toISOString(),end:new Date(row.end).toISOString()};}
async function find(db,id){return (await db.query('SELECT * FROM booking_reservations WHERE id=$1',[id])).rows[0];}
function replay(row,hash){if(row.request_hash!==hash)fail(409,'This request reference was already used.');if(row.status==='rejected')fail(409,'That time is no longer available. Please choose another.');return result(row);}
export async function book(db,upstream,input,now=Date.now()) {
 const parsed=bookingSchema.safeParse(input);
 if(!parsed.success) {
  // Only this pre-write contact rejection authorizes editing a submitted request.
  // Never tag downstream Zod/provider errors as proof of non-creation.
  if(parsed.error.issues.every(issue=>['name','email'].includes(issue.path[0]))) {
   Object.assign(parsed.error,{code:'BOOKING_CONTACT_INVALID',fields:[...new Set(parsed.error.issues.map(issue=>issue.path[0]))]});
  }
  throw parsed.error;
 }
 const data=parsed.data,id=digest(data.key),hash=digest(JSON.stringify({...data,email:data.email.toLowerCase()}));
 const existing=await find(db,id);if(existing)return replay(existing,hash);
 const {settings,version}=await readSettings(db),start=Date.parse(data.start);
 const date=Temporal.Instant.fromEpochMilliseconds(start).toZonedDateTimeISO(settings.timezone).toPlainDate().toString();
 const available=await availability(db,upstream,date,data.serviceId,now);
 if(!available.some(s=>s.start===data.start)){const concurrent=await find(db,id);if(concurrent)return replay(concurrent,hash);fail(409,'That time is no longer available. Please choose another.');}
 const s=settings.services.find(s=>s.id===data.serviceId),end=start+s.duration*60000;
 try {
  await transaction(db,async c=>{
   // Same lock as settings UPDATE, before rechecking the version/idempotency.
   const current=await readSettings(c,true);
   const prior=await find(c,id);if(prior){replay(prior,hash);return;}
   if(current.version!==version)fail(409,'Availability changed. Please choose a time again.');
   await c.query(`INSERT INTO booking_reservations(id,request_hash,service_id,start,"end",occupied_start,occupied_end,status,contact,created_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9)`,[id,hash,data.serviceId,start,end,start-s.before*60000,end+s.after*60000,seal(JSON.stringify({name:data.name,email:data.email})),now]);
   await c.query('INSERT INTO booking_jobs(reservation_id) VALUES($1)',[id]);
  });
 }catch(e){if(['23P01','23505'].includes(e.code)){const r=await find(db,id);if(r)return replay(r,hash);fail(409,'That time is no longer available. Please choose another.');}throw e;}
 await deliver(db,upstream,id);
 return replay(await find(db,id),hash);
}
// Claim one job at a time: bounded batches never pre-lease work that may expire in a queue.
async function claim(db,id) {
 const token=randomUUID();
 const {rows:[job]}=await db.query(`WITH candidate AS (
  SELECT j.reservation_id FROM booking_jobs j JOIN booking_reservations r ON r.id=j.reservation_id
  WHERE (j.lease_until IS NULL OR j.lease_until<clock_timestamp())
  AND ($1::text IS NULL OR j.reservation_id=$1) AND ($1::text IS NOT NULL OR
    (j.next_at<=clock_timestamp() AND r.status!='rejected' AND
     (r.status!='confirmed' OR r.occupied_end>extract(epoch FROM clock_timestamp())*1000)))
  ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'review' THEN 1 ELSE 2 END,j.next_at,j.reservation_id
  FOR UPDATE OF j SKIP LOCKED LIMIT 1)
  UPDATE booking_jobs j SET lease_token=$2,lease_until=clock_timestamp()+interval '90 seconds',attempts=attempts+1
  FROM candidate c WHERE j.reservation_id=c.reservation_id RETURNING j.*`,[id??null,token]);
 return job;
}
async function finish(db,job,status) {
 return transaction(db,async c=>{
  // Fence all result writes. An expired worker cannot clobber a newer observation.
  const {rowCount}=await c.query(`UPDATE booking_jobs SET lease_token=NULL,lease_until=NULL,
   next_at=clock_timestamp()+CASE WHEN $3='confirmed' THEN interval '1 hour' WHEN $3='rejected' THEN interval '100 years' ELSE interval '5 minutes' END
   WHERE reservation_id=$1 AND lease_token=$2 AND lease_until>clock_timestamp()`,[job.reservation_id,job.lease_token,status]);
  if(!rowCount)return false;
  if(status) {
   const {rows:[reservation]}=await c.query(`UPDATE booking_reservations SET status=$2,version=version+1,contact=CASE WHEN $2='rejected' THEN NULL ELSE contact END WHERE id=$1 AND status!='rejected' RETURNING id,start,status,contact`,[job.reservation_id,status]);
   if(status==='confirmed' && reservation?.status==='confirmed' && reservation.contact) {
    const contact=JSON.parse(unseal(reservation.contact));
    await enqueueBookingNotification(c,{reference:reservation.id,start:new Date(reservation.start).toISOString(),email:contact.email});
   }
  }
  return true;
 });
}
async function runJob(db,upstream,job) {
 const row=await find(db,job.reservation_id);
 try {
  if(row.status==='rejected')return await finish(db,job,'rejected')?'rejected':'stale';
  const event=await upstream.get(row.id);
  const matches=event?.start===row.occupied_start && event?.end===row.occupied_end;
  if(matches){return await finish(db,job,'confirmed')?'confirmed':'stale';}
  // Once insert may have been sent, absence is never proof it failed. Hold for review.
  if(event || job.attempted || row.status!=='pending'){return await finish(db,job,'review')?'review':'stale';}
  const busy=await upstream.busy(row.occupied_start,row.occupied_end);
  if(busy.some(b=>b.start<row.occupied_end && b.end>row.occupied_start)){return await finish(db,job,'rejected')?'rejected':'stale';}
  // Revalidate AFTER upstream checks. Serialize current policy and insert intent
  // with settings writes; database time is authoritative, not a request timestamp.
  let intent;
  const beforeSend=async()=>{
   if(intent)throw new Error('Insert authorization must only run once.');
   intent=await transaction(db,async c=>{
    const {settings}=await readSettings(c,true);
    // Acquire the job lock before reading time: UPDATE predicates alone may be
    // evaluated before waiting for an unchanged row locked by another transaction.
    const {rows:[current]}=await c.query('SELECT * FROM booking_jobs WHERE reservation_id=$1 FOR UPDATE',[row.id]);
    if(!current || current.lease_token!==job.lease_token || current.attempted)return 'stale';
    const {rows:[clock]}=await c.query('SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint AS now');
    const service=settings.services.find(s=>s.id===row.service_id && s.enabled);
    const date=Temporal.Instant.fromEpochMilliseconds(row.start).toZonedDateTimeISO(settings.timezone).toPlainDate().toString();
    const eligible=service && row.end===row.start+service.duration*60000 &&
     row.occupied_start===row.start-service.before*60000 && row.occupied_end===row.end+service.after*60000 &&
     slotsFor({settings,date,serviceId:row.service_id,now:clock.now}).some(s=>Date.parse(s.start)===row.start);
    if(!eligible)return 'ineligible';
    // Recheck the cutoff in the intent statement, including time spent computing
    // slots or waiting for a job lock. Strictly precede both start and buffer.
    const cutoff=Math.min(row.start-settings.noticeMinutes*60000,row.occupied_start,row.start);
    const {rowCount}=await c.query(`UPDATE booking_jobs SET attempted=true
     WHERE reservation_id=$1 AND lease_token=$2 AND lease_until>clock_timestamp() AND attempted=false
     AND extract(epoch FROM clock_timestamp())*1000<$3`,[row.id,job.lease_token,cutoff]);
    return rowCount?'ready':'ineligible';
   });
   return intent==='ready';
  };
  // Adapter calls this gate after credential refresh, immediately before send.
  const inserted=await upstream.insert({id:row.id,start:row.occupied_start,end:row.occupied_end},beforeSend);
  if(intent==='stale')return 'stale';
  if(intent==='ineligible')return await finish(db,job,'rejected')?'rejected':'stale';
  if(intent!=='ready')throw new Error('Missing insert authorization.');
  const status=inserted?.start===row.occupied_start && inserted?.end===row.occupied_end?'confirmed':'review';
  return await finish(db,job,status)?status:'stale';
 }catch{return await finish(db,job,null)?'pending':'stale';}
}
export async function deliver(db,upstream,id){const job=await claim(db,id);return job?runJob(db,upstream,job):'leased';}
export async function recover(db,upstream,{max=10,budgetMs=20000}={}) {
 let visited=0;const counts={},deadline=Date.now()+budgetMs;
 while(visited<Math.min(max,100) && Date.now()<deadline){const job=await claim(db);if(!job)break;const status=await runJob(db,upstream,job);counts[status]=(counts[status]||0)+1;visited++;}
 return {visited,...counts};
}
// Counts only; never expose reservation identifiers or contacts to the scheduler.
export async function recoveryHealth(db) {
 const {rows:[health]}=await db.query(`SELECT
  count(*) FILTER(WHERE r.status IN ('pending','review')) AS unresolved,
  count(*) FILTER(WHERE j.lease_until<clock_timestamp()) AS expired_leases,
  count(*) FILTER(WHERE j.next_at<=clock_timestamp() AND (j.lease_until IS NULL OR j.lease_until<clock_timestamp())
    AND r.status!='rejected' AND (r.status!='confirmed' OR r.occupied_end>extract(epoch FROM clock_timestamp())*1000)) AS due
  FROM booking_jobs j JOIN booking_reservations r ON r.id=j.reservation_id`);
 return health;
}
// Keyset pagination includes every reservation, including old uncertain holds.
export async function reconcile(db,upstream,{cursor='',max=10}={}) {
 const rows=(await db.query("SELECT id FROM booking_reservations WHERE status!='rejected' AND id>$1 ORDER BY id LIMIT $2",[cursor,Math.min(max,100)+1])).rows;
 const page=rows.slice(0,max);let confirmed=0,review=0,leased=0,visited=0,last=cursor;const deadline=Date.now()+20000;
 for(const row of page){if(Date.now()>=deadline)break;visited++;last=row.id;const status=await deliver(db,upstream,row.id);if(status==='confirmed')confirmed++;if(status==='review')review++;if(status==='leased')leased++;}
 return {confirmed,review,leased,visited,nextCursor:rows.length>visited?last:null};
}
export async function resolveReservation(db,upstream,id,actor) {
 if(!await find(db,id))fail(409,'Reservation is not available.');
 // Safe operator resolution: re-observe by stable event id; never discard an uncertain hold.
 await db.query('INSERT INTO booking_audit(actor,reservation_id,action) VALUES($1,$2,$3)',[actor,id,'requested-verification']);
 const status=await deliver(db,upstream,id);
 await db.query('INSERT INTO booking_audit(actor,reservation_id,action) VALUES($1,$2,$3)',[actor,id,`verification-${status}`]);
 return {status,holdReleased:(await find(db,id)).status==='rejected'};
}
