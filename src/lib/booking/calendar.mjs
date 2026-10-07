import { OAuth2Client } from 'google-auth-library';
import { getStore } from './store.mjs';
import { unseal } from './crypto.mjs';

export const scopes=['https://www.googleapis.com/auth/calendar.events.owned','https://www.googleapis.com/auth/calendar.events.freebusy'];
export function oauthClient() {
  const {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,BETTER_AUTH_URL}=process.env;
  if(!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !BETTER_AUTH_URL) throw new Error('Calendar is not configured.');
  return new OAuth2Client({clientId:GOOGLE_CLIENT_ID,clientSecret:GOOGLE_CLIENT_SECRET,redirectUri:new URL('/api/admin/calendar/callback',BETTER_AUTH_URL).href,transporterOptions:{timeout:10000,retry:false}});
}
export function isMock() {
  if(process.env.BOOKING_CALENDAR_MODE!=='mock') return false;
  if(process.env.BOOKING_ALLOW_SYNTHETIC!=='true') throw new Error('Synthetic mode is not enabled.');
  return true;
}
function upstream() { return Object.assign(new Error('We cannot check availability right now. Try again or contact the clinic.'),{status:503}); }
export function calendar(db=getStore()) {
  if(isMock()) return {
    async busy(min,max) { return (await db.query('SELECT body FROM booking_mock_events')).rows.map(r=>JSON.parse(r.body)).filter(e=>e.start<max && e.end>min).map(({start,end})=>({start,end})); },
    async get(id) { const r=(await db.query('SELECT body FROM booking_mock_events WHERE id=$1',[id])).rows[0]; return r?JSON.parse(r.body):null; },
    async insert(event) { await db.query('INSERT INTO booking_mock_events VALUES($1,$2) ON CONFLICT DO NOTHING',[event.id,JSON.stringify(event)]); return this.get(event.id); },
  };
  const id=process.env.GOOGLE_CALENDAR_ID;
  if(!id) throw upstream();
  const base=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events`;
  async function request(url,method='GET',body) {
    try {
      const stored=(await db.query('SELECT value FROM booking_tokens WHERE id=1')).rows[0];
      if(!stored) throw upstream();
      const client=oauthClient(); client.setCredentials({refresh_token:unseal(stored.value)});
      const token=await client.getAccessToken();
      if(!token.token) throw upstream();
      // Never retry insert blindly; callers reconcile by stable event ID.
      const response=await fetch(url,{method,headers:{Authorization:`Bearer ${token.token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000),cache:'no-store'});
      if(response.status===404 && method==='GET') return null;
      if(!response.ok) throw upstream();
      return await response.json();
    } catch { throw upstream(); }
  }
  function eventValue(e) {
    if(!e) return null;
    const start=Date.parse(e.start?.dateTime),end=Date.parse(e.end?.dateTime);
    if(e.status==='cancelled' || !Number.isFinite(start) || !Number.isFinite(end)) return {id:e.id,start:0,end:0};
    return {id:e.id,start,end};
  }
  return {
    async busy(min,max) {
      const data=await request('https://www.googleapis.com/calendar/v3/freeBusy','POST',{timeMin:new Date(min).toISOString(),timeMax:new Date(max).toISOString(),items:[{id}]});
      const c=data?.calendars?.[id];
      if(!c || c.errors?.length || !Array.isArray(c.busy)) throw upstream();
      return c.busy.map(b=>{const start=Date.parse(b.start),end=Date.parse(b.end);if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start) throw upstream();return {start,end};});
    },
    async get(eventId) {return eventValue(await request(`${base}/${eventId}`));},
    async insert(event) {
      const result=await request(`${base}?sendUpdates=none`,'POST',{id:event.id,summary:'Reserved appointment',visibility:'private',transparency:'opaque',start:{dateTime:new Date(event.start).toISOString()},end:{dateTime:new Date(event.end).toISOString()},extendedProperties:{private:{bookingReference:event.id}}});
      return eventValue(result);
    },
  };
}
