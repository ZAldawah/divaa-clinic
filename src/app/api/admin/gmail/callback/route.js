import { requireAdmin } from '@/lib/booking/auth.mjs';
import { getStore } from '@/lib/booking/store.mjs';
import { saveGmailGrant } from '@/lib/booking/confirmation-email.mjs';

export const runtime = 'nodejs';
export async function GET(request) {
  let connected = false;
  try {
    const session = await requireAdmin(request.headers);
    const params = new URL(request.url).searchParams;
    await saveGmailGrant(getStore(), session.session.id, params.get('state'), params.get('code'));
    connected = true;
  } catch {
    // Authorization codes, tokens and provider error bodies are never logged or returned.
  }
  const base = process.env.BETTER_AUTH_URL;
  if (!base) return new Response('Unavailable.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  return Response.redirect(new URL(`/admin/availability?gmail=${connected ? 'connected' : 'failed'}`, base), {
    status: 303, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}
