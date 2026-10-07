import { z } from 'zod';
import { endpoint, json, body } from '@/lib/booking/http.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { calendar } from '@/lib/booking/calendar.mjs';
import { reconcile, resolveReservation } from '@/lib/booking/service.mjs';
export const runtime='nodejs';
export const maxDuration=120;
const input=z.object({cursor:z.string().regex(/^[a-f0-9]{64}$/).optional(),reference:z.string().regex(/^[a-f0-9]{64}$/).optional()}).strict();
export const POST=endpoint(async(request,session)=>{
 const v=input.parse(await body(request));
 return json(v.reference?await resolveReservation(getStore(),calendar(),v.reference,session.user.id):await reconcile(getStore(),calendar(),{cursor:v.cursor}));
},{admin:true,write:true,bucket:'reconcile',max:30});
