import { seal } from './crypto.mjs';

// Provider-free booking notification contract. Delivery remains disabled until
// a separately approved provider, sender identity and credential path exist.
export function confirmationMessage({ reference, start, email }) {
  if (!reference || !Number.isFinite(Date.parse(start)) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
    throw new TypeError('A confirmed reservation reference, start time and valid email are required.');
  }
  return Object.freeze({
    to: email,
    subject: 'Your DivaaBeauty appointment request',
    text: `We received your appointment request (${reference}) for ${new Date(start).toISOString()}. The clinic will follow up if needed.`,
    idempotencyKey: `booking-confirmation:${reference}`,
  });
}

export async function sendConfirmation(_message, { enabled = false, transport } = {}) {
  if (!enabled || typeof transport !== 'function') return { status: 'disabled' };
  return { status: 'disabled' };
}

export async function enqueueBookingNotification(db, { reference, start, email }) {
  const message = confirmationMessage({ reference, start, email });
  await db.query(`INSERT INTO booking_notification_outbox(reference,encrypted_payload,idempotency_key,status)
    VALUES($1,$2,$3,'disabled') ON CONFLICT (reference) DO NOTHING`,
  [reference, seal(JSON.stringify(message)), message.idempotencyKey]);
  const { rows: [record] } = await db.query('SELECT reference,status,idempotency_key FROM booking_notification_outbox WHERE reference=$1',[reference]);
  return record;
}
