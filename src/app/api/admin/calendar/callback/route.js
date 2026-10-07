import { requireAdmin } from '@/lib/booking/auth.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { oauthClient, scopes } from '@/lib/booking/calendar.mjs';
import { digest, seal, unseal } from '@/lib/booking/crypto.mjs';
export const runtime='nodejs';
export async function GET(request) {
  let ok=false;
  try {
    const session=await requireAdmin(request.headers),p=new URL(request.url).searchParams;
    const state=p.get('state'),code=p.get('code');
    if(!state || state.length>128 || !code || code.length>2048) throw new Error();
    const db=getStore();
    const row=db.transaction(()=>{
      const r=db.prepare('SELECT * FROM booking_oauth_state WHERE hash=? AND session_id=? AND expires>?').get(digest(state),session.session.id,Date.now());
      if(!r)throw new Error();db.prepare('DELETE FROM booking_oauth_state WHERE hash=?').run(digest(state));return r;
    }).immediate();
    const {tokens}=await oauthClient().getToken({code,codeVerifier:unseal(row.verifier)});
    if(!tokens.refresh_token || !scopes.every(s=>tokens.scope?.split(' ').includes(s))) throw new Error();
    db.prepare('INSERT INTO booking_tokens VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').run(seal(tokens.refresh_token));ok=true;
  } catch { /* No codes, tokens or provider error bodies in logs. */ }
  return Response.redirect(new URL(`/admin/availability?calendar=${ok?'connected':'failed'}`,process.env.BETTER_AUTH_URL),303);
}
