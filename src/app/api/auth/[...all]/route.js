import { getAuth } from '@/lib/booking/auth.mjs';
import { origin, json } from '@/lib/booking/http.mjs';
export const runtime='nodejs';
async function handler(request) {
  try { if(request.method==='POST') origin(request); return await getAuth().handler(request); }
  catch {return json({error:'Sign in is unavailable or the request was denied.'},403);}
}
export const GET=handler;
export const POST=handler;
