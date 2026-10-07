import { getAuth } from '@/lib/booking/auth.mjs';
import { origin, json } from '@/lib/booking/http.mjs';
import { clientLimit } from '@/lib/booking/abuse.mjs';
import { getStore } from '@/lib/booking/store.mjs';
export const runtime='nodejs';
async function handler(request) {
  try { if(request.method==='POST') origin(request); await clientLimit(getStore(),request,'auth',15); return await getAuth().handler(request); }
  catch(e) {return json({error:'Sign in is unavailable or the request was denied.'},[403,429].includes(e.status)?e.status:503);}
}
export const GET=handler;
export const POST=handler;
