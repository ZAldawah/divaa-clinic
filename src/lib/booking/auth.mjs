import { betterAuth } from 'better-auth';
import { getStore } from './store.mjs';

let auth;
export function getAuth() {
  if(auth) return auth;
  const baseURL=process.env.BETTER_AUTH_URL, secret=process.env.BETTER_AUTH_SECRET;
  if(!baseURL || !secret || secret.length<32) throw new Error('Authentication is not configured.');
  const secure=new URL(baseURL).protocol==='https:';
  if(!secure && !['localhost','127.0.0.1'].includes(new URL(baseURL).hostname)) throw new Error('HTTPS required.');
  auth=betterAuth({
    appName:'Divaa Beauty Staff', baseURL, secret, database:getStore(), trustedOrigins:[new URL(baseURL).origin],
    emailAndPassword:{enabled:true,disableSignUp:true,minPasswordLength:14},
    session:{expiresIn:3600,disableSessionRefresh:true,cookieCache:{enabled:false}},
    advanced:{useSecureCookies:secure,defaultCookieAttributes:{httpOnly:true,sameSite:'lax',secure}},
    rateLimit:{enabled:true,storage:'database',window:60,max:15},
    logger:{disabled:true},
  }); return auth;
}
export async function requireAdmin(headers) {
  const session=await getAuth().api.getSession({headers});
  if(!session) throw Object.assign(new Error('Sign in to continue.'),{status:401});
  if(!getStore().prepare('SELECT user_id FROM booking_admins WHERE user_id=?').get(session.user.id)) throw Object.assign(new Error('Access denied.'),{status:403});
  return session;
}
