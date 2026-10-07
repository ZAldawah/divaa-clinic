import { endpoint, json } from '@/lib/booking/http.mjs';
import { readSettings } from '@/lib/booking/store.mjs';
import { isMock } from '@/lib/booking/calendar.mjs';
export const runtime='nodejs';
export const GET=endpoint(async()=>{const {settings:s}=await readSettings();return json({timezone:s.timezone,synthetic:isMock(),services:s.services.filter(v=>v.enabled).map(({id,name,duration})=>({id,name,duration})),horizonDays:s.horizonDays});});
