import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { limit } from './store.mjs';
export function clientKey(request,env=process.env) {
 let ip;
 if(env.BOOKING_TRUSTED_EDGE==='vercel' && env.VERCEL==='1') ip=request.headers.get('x-vercel-forwarded-for');
 else if(env.BOOKING_ALLOW_SYNTHETIC==='true' && ['localhost','127.0.0.1'].includes(new URL(env.BETTER_AUTH_URL).hostname)) ip='127.0.0.1';
 if(!ip || !isIP(ip))throw Object.assign(new Error('Trusted client identity unavailable.'),{status:503});
 if(!env.BOOKING_RATE_KEY || env.BOOKING_RATE_KEY.length<32)throw new Error('Rate key is required.');
 // Normalize IPv6 textual variants, group at /64 to limit trivial address rotation.
 if(isIP(ip)===6) {
  const canonical=new URL(`http://[${ip}]/`).hostname.slice(1,-1),sides=canonical.split('::');
  const left=sides[0]?sides[0].split(':'):[],right=sides[1]?sides[1].split(':'):[];
  const words=sides.length===2?[...left,...Array(8-left.length-right.length).fill('0'),...right]:left;
  ip=words.slice(0,4).map(v=>parseInt(v,16).toString(16)).join(':');
 }
 return createHmac('sha256',env.BOOKING_RATE_KEY).update(ip).digest('hex');
}
export async function clientLimit(db,request,bucket,max) {await limit(db,`${bucket}:${clientKey(request)}`,max);}
