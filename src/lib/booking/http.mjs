import 'server-only';
import { ZodError } from 'zod';
import { getStore, limit } from './store.mjs';
import { clientLimit } from './abuse.mjs';
import { requireAdmin } from './auth.mjs';
import { fail } from './service.mjs';
export function origin(request) {
  const expected=process.env.BETTER_AUTH_URL && new URL(process.env.BETTER_AUTH_URL).origin;
  if(!expected || request.headers.get('origin')!==expected || request.headers.get('sec-fetch-site')==='cross-site') fail(403,'Request origin denied.');
}
export async function body(request) {
  if(!request.headers.get('content-type')?.startsWith('application/json')) fail(415,'JSON required.');
  const reader=request.body?.getReader();if(!reader) fail(400,'Request body required.');
  const parts=[];let size=0;
  while(true) {const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>32768){await reader.cancel();fail(413,'Request is too large.');}parts.push(value);}
  try {return JSON.parse(Buffer.concat(parts).toString('utf8'));} catch {fail(400,'Invalid JSON.');}
}
export const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function endpoint(fn,{admin=false,write=false,bucket='read',max=120}={}) {
  return async request=>{
    try {
      if(write) origin(request);
      const session=admin?await requireAdmin(request.headers):null;
      if(session) await limit(getStore(),`${bucket}:${session.user.id}`,max);
      else await clientLimit(getStore(),request,bucket,max);
      return await fn(request,session);
    } catch(e) {
      if(e instanceof ZodError) return json({error:'Check the supplied fields and try again.',
        ...(e.code==='BOOKING_CONTACT_INVALID'?{code:e.code,fields:e.fields}:{})},400);
      const status=[400,401,403,409,413,415,429,503].includes(e.status)?e.status:503;
      return json({error:status===503?'This service is temporarily unavailable. Please try again or contact the clinic.':e.message},status);
    }
  };
}
