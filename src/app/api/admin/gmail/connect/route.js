import { endpoint, json } from '@/lib/booking/http.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { gmailConnectUrl } from '@/lib/booking/confirmation-email.mjs';

export const runtime = 'nodejs';
export const POST = endpoint(async (_request, session) => {
  return json({ url: await gmailConnectUrl(getStore(), session.session.id) });
}, { admin: true, write: true, bucket: 'gmail-oauth', max: 5 });
