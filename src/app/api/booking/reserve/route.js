import { endpoint, json, body } from '@/lib/booking/http.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { calendar } from '@/lib/booking/calendar.mjs';
import { book } from '@/lib/booking/service.mjs';
export const runtime='nodejs';
export const POST=endpoint(async request=>{const result=await book(getStore(),calendar(),await body(request));return json(result,result.status==='confirmed'?200:202);},{write:true,bucket:'reserve',max:15});
