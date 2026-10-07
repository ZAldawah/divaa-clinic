import { randomBytes } from 'node:crypto';
import { endpoint, json } from '@/lib/booking/http.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { oauthClient, scopes } from '@/lib/booking/calendar.mjs';
import { digest, seal } from '@/lib/booking/crypto.mjs';
export const runtime='nodejs';
export const POST=endpoint(async(request,session)=>{
  const client=oauthClient(),state=randomBytes(32).toString('hex');
  const {codeVerifier,codeChallenge}=await client.generateCodeVerifierAsync();
  const db=getStore();await db.query('DELETE FROM booking_oauth_state WHERE expires<$1',[Date.now()]);
  await db.query('INSERT INTO booking_oauth_state VALUES($1,$2,$3,$4)',[digest(state),session.session.id,seal(codeVerifier),Date.now()+600000]);
  return json({url:client.generateAuthUrl({access_type:'offline',prompt:'consent',scope:scopes,state,code_challenge:codeChallenge,code_challenge_method:'S256',include_granted_scopes:false})});
},{admin:true,write:true,bucket:'oauth',max:5});
