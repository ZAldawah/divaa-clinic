import { endpoint, json } from '@/lib/booking/http.mjs';
import { readSettings } from '@/lib/booking/store.mjs';
import { isMock } from '@/lib/booking/calendar.mjs';
import { previewCatalog } from '@/lib/booking/preview-catalog.mjs';
export const runtime='nodejs';
export const GET=endpoint(async()=>{const {settings:s}=await readSettings();const synthetic=isMock();return json({timezone:s.timezone,synthetic,services:s.services.filter(v=>v.enabled).map(({id,name,duration})=>({id,name,duration,...(synthetic?{durationNote:previewCatalog.find(v=>v.id===id)?.durationNote || 'Test duration; clinic timing unconfirmed.',priceNote:'Price not configured; test placeholder, no payment collected.'}:{})})),horizonDays:s.horizonDays});});
