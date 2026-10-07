import { endpoint, json } from '@/lib/booking/http.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { calendar } from '@/lib/booking/calendar.mjs';
import { reconcile } from '@/lib/booking/service.mjs';
export const runtime='nodejs';
export const POST=endpoint(async()=>json(await reconcile(getStore(),calendar())),{admin:true,write:true,bucket:'reconcile',max:5});
