import { timingSafeEqual } from 'node:crypto';
import { getStore, limit } from '@/lib/booking/store.mjs';
import { runNotificationWorker } from '@/lib/booking/confirmation-email.mjs';
import { json } from '@/lib/booking/http.mjs';

export const runtime = 'nodejs';
export const maxDuration = 30;
export async function POST(request) {
  try {
    const secret = process.env.BOOKING_EMAIL_JOB_SECRET || '';
    const actual = request.headers.get('authorization') || '';
    const expected = `Bearer ${secret}`;
    if (secret.length < 32) return json({ error: 'Unavailable.' }, 503);
    if (actual.length !== expected.length || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return json({ error: 'Denied.' }, 401);
    const db = getStore();
    await limit(db, 'booking-notification-worker', 10);
    return json(await runNotificationWorker(db, { max: 10 }));
  } catch {
    return json({ error: 'Unavailable.' }, 503);
  }
}
