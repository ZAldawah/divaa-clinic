import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from '../src/lib/booking/service.mjs';
import { seal, unseal } from '../src/lib/booking/crypto.mjs';
import { syntheticSettings } from '../src/lib/booking/schema.mjs';

// In-memory query double exercises the actual confirmed reconciliation branch
// without PostgreSQL fixtures, booking creation, or external calendar access.
test('reconciliation confirms an existing matching mock event and enqueues one encrypted TEST notification', async () => {
  const key = Buffer.alloc(32, 7).toString('base64');
  const previous = {
    key: process.env.BOOKING_ENCRYPTION_KEY,
    mode: process.env.BOOKING_CALENDAR_MODE,
    synthetic: process.env.BOOKING_ALLOW_SYNTHETIC,
  };
  process.env.BOOKING_ENCRYPTION_KEY = key;
  process.env.BOOKING_CALENDAR_MODE = 'mock';
  process.env.BOOKING_ALLOW_SYNTHETIC = 'true';

  const start = Date.now() + 3 * 24 * 60 * 60 * 1000;
  const end = start + 30 * 60 * 1000;
  const encryptedContact = seal(JSON.stringify({ name: 'Synthetic QA', email: 'synthetic@example.test' }));
  const settings = structuredClone(syntheticSettings);
  settings.services = [{ ...settings.services[0], id: 'consulting', name: 'Synthetic consultation' }];
  const statements = [];
  const outbox = new Map();
  let inserts = 0;
  let matchingEventReads = 0;
  let confirmationWrites = 0;

  const db = {
    async connect() { return { query: db.query.bind(db), release() {} }; },
    async query(sql, params = []) {
      statements.push(sql);
      if (sql.startsWith("SELECT id FROM booking_reservations WHERE status!='rejected'")) {
        return { rows: [{ id: 'existing-reference' }] };
      }
      if (sql.includes('WITH candidate AS')) {
        return { rows: [{ reservation_id: 'existing-reference', lease_token: 'lease-1', attempted: true }] };
      }
      if (sql.includes('SELECT * FROM booking_reservations')) {
        return { rows: [{ id: 'existing-reference', start, end, occupied_start: start, occupied_end: end,
          status: 'pending', service_id: 'consulting' }] };
      }
      if (sql.includes('UPDATE booking_jobs SET lease_token=NULL')) return { rowCount: 1, rows: [] };
      if (sql.includes('UPDATE booking_reservations SET status=$2')) {
        confirmationWrites++;
        return { rows: [{ id: 'existing-reference', start, status: 'confirmed', contact: encryptedContact,
          service_id: 'consulting' }] };
      }
      if (sql.includes('SELECT * FROM booking_settings')) {
        return { rows: [{ version: 1, body: JSON.stringify(settings) }] };
      }
      if (sql.includes('INSERT INTO booking_notification_outbox')) {
        const [reference, payload, idempotencyKey] = params;
        if (!outbox.has(reference)) outbox.set(reference, { reference, payload, idempotencyKey, status: 'disabled' });
        return { rows: [] };
      }
      if (sql.includes('SELECT reference,status,idempotency_key FROM booking_notification_outbox')) {
        const row = outbox.get(params[0]);
        return { rows: row ? [{ reference: row.reference, status: row.status, idempotency_key: row.idempotencyKey }] : [] };
      }
      return { rows: [] };
    },
  };

  try {
    const result = await reconcile(db, {
      async get() { matchingEventReads++; return { start, end }; },
      async insert() { inserts++; throw new Error('matching event must not be inserted again'); },
    }, { cursor: '', max: 1 });
    assert.equal(result.confirmed, 1);
    assert.equal(matchingEventReads, 1);
    assert.equal(inserts, 0);
    assert.equal(confirmationWrites, 1);
    assert.equal(outbox.size, 1);
    const [notice] = outbox.values();
    assert.equal(notice.reference, 'existing-reference');
    assert.equal(notice.status, 'disabled');
    assert.equal(notice.idempotencyKey, 'booking-confirmation:existing-reference');
    const message = JSON.parse(unseal(notice.payload));
    assert.equal(message.to, 'synthetic@example.test');
    assert.equal(message.subject, 'TEST: DivaaBeauty booking confirmation');
    assert.match(message.text, /TEST ONLY/);
    assert.match(message.text, /not a real appointment/i);
    assert.match(message.text, /Synthetic consultation/);
    assert.match(message.text, /America\/Chicago/);
    assert.match(message.text, /2026/);
    assert(statements.some(sql => sql.includes('UPDATE booking_reservations SET status=$2')));
  } finally {
    for (const [name, value] of Object.entries({
      BOOKING_ENCRYPTION_KEY: previous.key,
      BOOKING_CALENDAR_MODE: previous.mode,
      BOOKING_ALLOW_SYNTHETIC: previous.synthetic,
    })) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
