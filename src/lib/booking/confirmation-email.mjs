import { randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { seal, unseal, digest } from './crypto.mjs';
import { getStore, transaction } from './store.mjs';

// Provider-free booking notification contract. Delivery remains disabled until
// a separately approved provider, sender identity and credential path exist.
export function confirmationMessage({ reference, start, email, serviceName = 'Appointment', timezone = 'UTC' }) {
  if (!reference || !Number.isFinite(Date.parse(start)) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || !serviceName || !timezone) {
    throw new TypeError('A confirmed reservation reference, service, start time, timezone and valid email are required.');
  }
  const localTime = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short', timeZone: timezone }).format(new Date(start));
  return Object.freeze({
    to: email,
    subject: 'Your DivaaBeauty booking is confirmed',
    text: `Booking confirmed: ${serviceName}, ${localTime} (${timezone}). Reference: ${reference}. Email delivery is separate from your confirmed calendar reservation.`,
    idempotencyKey: `booking-confirmation:${reference}`,
  });
}

export async function sendConfirmation(_message, { enabled = false, transport } = {}) {
  if (!enabled || typeof transport !== 'function') return { status: 'disabled' };
  return transport(_message);
}

// Gmail API's least-privilege send-only scope. This transport is deliberately
// unavailable until explicit provider configuration and credentials exist.
export const gmailSendScope = 'https://www.googleapis.com/auth/gmail.send';

function gmailClient() {
  const { BOOKING_GMAIL_CLIENT_ID, BOOKING_GMAIL_CLIENT_SECRET, BETTER_AUTH_URL } = process.env;
  if (!BOOKING_GMAIL_CLIENT_ID || !BOOKING_GMAIL_CLIENT_SECRET || !BETTER_AUTH_URL) throw new Error('Gmail is not configured.');
  return new OAuth2Client({ clientId: BOOKING_GMAIL_CLIENT_ID, clientSecret: BOOKING_GMAIL_CLIENT_SECRET,
    redirectUri: new URL('/api/admin/gmail/callback', BETTER_AUTH_URL).href, transporterOptions: { timeout: 10000, retry: false } });
}

export async function gmailConnectUrl(db, sessionId) {
  const client = gmailClient(), state = randomBytes(32).toString('hex'), sender = process.env.BOOKING_GMAIL_SENDER;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender || '')) throw new Error('Gmail sender configuration is required.');
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
  await db.query('DELETE FROM booking_gmail_oauth_state WHERE expires < $1', [Date.now()]);
  await db.query('INSERT INTO booking_gmail_oauth_state(hash,session_id,verifier,sender,expires) VALUES($1,$2,$3,$4,$5)',
    [digest(state), sessionId, seal(codeVerifier), sender, Date.now() + 600000]);
  return client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: [gmailSendScope], state,
    code_challenge: codeChallenge, code_challenge_method: 'S256', include_granted_scopes: false, login_hint: sender });
}

export async function saveGmailGrant(db, sessionId, state, code) {
  if (!state || state.length > 128 || !code || code.length > 2048) throw new Error('Invalid Gmail authorization response.');
  const row = await transaction(db, async c => {
    const { rows: [value] } = await c.query(`DELETE FROM booking_gmail_oauth_state
      WHERE hash=$1 AND session_id=$2 AND expires>$3 RETURNING verifier,sender`, [digest(state), sessionId, Date.now()]);
    return value;
  });
  if (!row || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.sender || '')) throw new Error('Gmail authorization state expired.');
  const client = gmailClient();
  const { tokens } = await client.getToken({ code, codeVerifier: unseal(row.verifier) });
  if (!tokens.refresh_token || !tokens.scope?.split(' ').includes(gmailSendScope)) throw new Error('Gmail send-only authorization was not granted.');
  await db.query(`INSERT INTO booking_gmail_credentials(id,sender,refresh_token,created_at,updated_at)
    VALUES(1,$1,$2,clock_timestamp(),clock_timestamp()) ON CONFLICT(id) DO UPDATE
    SET sender=excluded.sender,refresh_token=excluded.refresh_token,updated_at=clock_timestamp()`, [row.sender, seal(tokens.refresh_token)]);
}

export async function gmailTransport(message, db) {
  if (process.env.BOOKING_EMAIL_ENABLED !== 'true' || process.env.BOOKING_EMAIL_PROVIDER !== 'gmail'
    || !process.env.BOOKING_GMAIL_CLIENT_ID || !process.env.BOOKING_GMAIL_CLIENT_SECRET || !process.env.BETTER_AUTH_URL) return { status: 'disabled' };
  db ||= getStore();
  const { rows: [stored] } = await db.query('SELECT sender,refresh_token FROM booking_gmail_credentials WHERE id=1');
  if (!stored || !stored.sender || !stored.refresh_token) return { status: 'disabled' };
  const client = gmailClient();
  client.setCredentials({ refresh_token: unseal(stored.refresh_token) });
  const token = await client.getAccessToken();
  if (!token.token) throw new Error('Gmail access token unavailable.');
  const raw = [
    `To: ${message.to}`,
    `From: ${stored.sender}`,
    `Subject: ${message.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    message.text,
  ].join('\r\n');
  const encoded = Buffer.from(raw, 'utf8').toString('base64url');
  // Address the configured mailbox explicitly so a mismatched OAuth grant
  // fails at the provider instead of silently sending as another account.
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(stored.sender)}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: encoded }),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Gmail delivery failed.');
  const result = await response.json();
  if (!result.id) throw new Error('Gmail did not confirm message acceptance.');
  return { status: 'sent', providerMessageId: result.id };
}

export async function deliverNotification(db, reference, { enabled = process.env.BOOKING_EMAIL_ENABLED === 'true', transport = gmailTransport } = {}) {
  if (!enabled) return { status: 'disabled' };
  // One conditional UPDATE is the atomic claim; concurrent workers cannot both
  // transition the same row from queued/disabled to sending.
  const { rows: [row] } = await db.query(`UPDATE booking_notification_outbox SET status='sending',updated_at=clock_timestamp()
    WHERE reference=$1 AND status IN ('disabled','queued') RETURNING encrypted_payload`, [reference]);
  if (!row) return { status: 'missing' };
  let message;
  try { message = JSON.parse(unseal(row.encrypted_payload)); }
  catch { await db.query(`UPDATE booking_notification_outbox SET status='failed' WHERE reference=$1 AND status='sending'`, [reference]); return { status: 'failed' }; }
  try {
    const result = await sendConfirmation(message, { enabled, transport: transport === gmailTransport ? value => gmailTransport(value, db) : transport });
    if (result.status !== 'sent') {
      await db.query(`UPDATE booking_notification_outbox SET status='disabled',updated_at=clock_timestamp() WHERE reference=$1 AND status='sending'`, [reference]);
      return result;
    }
    await db.query(`UPDATE booking_notification_outbox SET status='sent',sent_at=clock_timestamp(),provider_message_id=$2,updated_at=clock_timestamp() WHERE reference=$1 AND status='sending'`, [reference,result.providerMessageId]);
    return { status: 'sent', providerMessageId: result.providerMessageId };
  } catch {
    // Provider acceptance may have happened before a timeout; never auto-resend.
    await db.query(`UPDATE booking_notification_outbox SET status='uncertain',updated_at=clock_timestamp() WHERE reference=$1 AND status='sending'`, [reference]);
    return { status: 'uncertain' };
  }
}

// Bounded one-shot worker entrypoint for an approved scheduler/operator. Sending
// remains disabled unless separately configured; uncertain sends are never retried.
export async function runNotificationWorker(db, { max = 10, enabled = process.env.BOOKING_EMAIL_ENABLED === 'true', transport = gmailTransport } = {}) {
  if (!enabled) return { processed: 0, status: 'disabled' };
  let processed = 0, sent = 0, uncertain = 0, failed = 0;
  // A worker crash after claiming may have happened before or after provider
  // acceptance. Fence it as uncertain; never make it eligible for auto-resend.
  const stale = await db.query(`UPDATE booking_notification_outbox SET status='uncertain',updated_at=clock_timestamp()
    WHERE status='sending' AND updated_at < clock_timestamp()-interval '2 minutes'`);
  uncertain += stale.rowCount || 0;
  while (processed < Math.min(Math.max(max, 0), 10)) {
    const { rows: [candidate] } = await db.query(`SELECT reference FROM booking_notification_outbox
      WHERE status IN ('disabled','queued') ORDER BY created_at,reference LIMIT 1`);
    if (!candidate) break;
    const result = await deliverNotification(db, candidate.reference, { enabled, transport });
    processed++;
    if (result.status === 'sent') sent++;
    else if (result.status === 'uncertain') uncertain++;
    else if (result.status === 'failed') failed++;
  }
  return { processed, sent, uncertain, failed };
}

export async function enqueueBookingNotification(db, { reference, start, email }) {
  const message = confirmationMessage({ reference, start, email });
  await db.query(`INSERT INTO booking_notification_outbox(reference,encrypted_payload,idempotency_key,status)
    VALUES($1,$2,$3,'disabled') ON CONFLICT (reference) DO NOTHING`,
  [reference, seal(JSON.stringify(message)), message.idempotencyKey]);
  const { rows: [record] } = await db.query('SELECT reference,status,idempotency_key FROM booking_notification_outbox WHERE reference=$1',[reference]);
  return record;
}
