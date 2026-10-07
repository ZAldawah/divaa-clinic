import { timingSafeEqual } from 'node:crypto';
import { getStore, limit } from '@/lib/booking/store.mjs';
import { recover, recoveryHealth } from '@/lib/booking/service.mjs';
import { calendar } from '@/lib/booking/calendar.mjs';
import { json } from '@/lib/booking/http.mjs';
export const runtime='nodejs';
export const maxDuration=120;
export async function POST(request) {
 try {
  const secret=process.env.BOOKING_JOB_SECRET,actual=request.headers.get('authorization')||'';
  if(!secret || secret.length<32)return json({error:'Unavailable.'},503);
  const expected=`Bearer ${secret}`;
  if(actual.length!==expected.length || !timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return json({error:'Denied.'},401);
  await limit(getStore(),'recovery-scheduler',10);
  const result=await recover(getStore(),calendar());
  return json({...result,health:await recoveryHealth(getStore())});
 }catch{return json({error:'Unavailable.'},503);}
}
