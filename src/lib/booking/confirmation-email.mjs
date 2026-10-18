// Provider-free confirmation contract. Sending is intentionally disabled until
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
