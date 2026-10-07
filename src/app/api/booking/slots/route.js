import { endpoint, json } from '@/lib/booking/http.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { calendar } from '@/lib/booking/calendar.mjs';
import { availability } from '@/lib/booking/service.mjs';
export const runtime='nodejs';
export const GET=endpoint(async request=>{const p=new URL(request.url).searchParams;return json({slots:await availability(getStore(),calendar(),p.get('date'),p.get('service'))});},{bucket:'availability',max:90});
