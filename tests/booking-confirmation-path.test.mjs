import test from 'node:test';
import assert from 'node:assert/strict';
import { book } from '../src/lib/booking/service.mjs';
import { digest, seal, unseal } from '../src/lib/booking/crypto.mjs';
import { syntheticSettings } from '../src/lib/booking/schema.mjs';

// Exercise the public request replay path without PostgreSQL or external Calendar access.
test('book status replay recovers matching pending event once; wrong hash cannot trigger recovery', async () => {
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
  const service = { ...settings.services[0], id: 'synthetic-consultation', name: 'Synthetic consultation' };
  settings.services = [service];
  const input = {
    key: '8f52b6c3-75f8-4c0c-aed3-e4a11c80362a',
    serviceId: service.id,
    start: new Date(start).toISOString(),
    name: 'Synthetic QA',
    email: 'synthetic@example.test',
  };
  const reference = digest(input.key);
  const requestHash = digest(JSON.stringify({
    serviceId: input.serviceId, start: input.start, name: input.name, email: input.email, key: input.key,
  }));
  let row = {
    id: reference, request_hash: requestHash, start, end, occupied_start: start, occupied_end: end,
    status: 'pending', service_id: service.id, contact: encryptedContact,
  };
  const statements = [];
  const outbox = new Map();
  let inserts = 0;
  let matchingEventReads = 0;
  let claims = 0;
  let confirmationWrites = 0;

  const db = {
    async connect() { return { query: db.query.bind(db), release() {} }; },
    async query(sql, params = []) {
      statements.push(sql);
      if (sql.includes('WITH candidate AS')) {
        claims++;
        return { rows: row.status === 'pending' ? [{ reservation_id: reference, lease_token: 'lease-1', attempted: true }] : [] };
      }
      if (sql.includes('SELECT * FROM booking_reservations')) return { rows: [row] };
      if (sql.includes('UPDATE booking_jobs SET lease_token=NULL')) return { rowCount: 1, rows: [] };
      if (sql.includes('UPDATE booking_reservations SET status=$2')) {
        confirmationWrites++;
        row = { ...row, status: params[1] };
        return { rows: [row] };
      }
      if (sql.includes('SELECT * FROM booking_settings')) {
        return { rows: [{ version: 1, body: JSON.stringify(settings) }] };
      }
      if (sql.includes('INSERT INTO booking_notification_outbox')) {
        const [noticeReference, payload, idempotencyKey] = params;
        if (!outbox.has(noticeReference)) outbox.set(noticeReference, {
          reference: noticeReference, payload, idempotencyKey, status: 'disabled',
        });
        return { rows: [] };
      }
      if (sql.includes('SELECT reference,status,idempotency_key FROM booking_notification_outbox')) {
        const notice = outbox.get(params[0]);
        return { rows: notice ? [{ reference: notice.reference, status: notice.status,
          idempotency_key: notice.idempotencyKey }] : [] };
      }
      return { rows: [] };
    },
  };

  try {
    const upstream = {
      async get() { matchingEventReads++; return { start, end }; },
      async insert() { inserts++; throw new Error('matching event must not be inserted again'); },
    };

    await assert.rejects(book(db, upstream, { ...input, name: 'Different payload' }), { status: 409 });
    assert.equal(row.status, 'pending');
    assert.equal(claims, 0, 'hash mismatch must be rejected before claiming recovery');
    assert.equal(matchingEventReads, 0, 'hash mismatch must not read the upstream event');
    assert.equal(inserts, 0);
    assert.equal(confirmationWrites, 0);
    assert.equal(outbox.size, 0);
    assert.equal(statements.some(sql => /INSERT INTO booking_(reservations|jobs)/.test(sql)), false,
      'recovery must not create another reservation or job');

    const result = await book(db, upstream, input);
    assert.equal(result.status, 'confirmed');
    assert.equal(result.reference, reference);
    assert.equal(matchingEventReads, 1);
    assert.equal(inserts, 0);
    assert.equal(confirmationWrites, 1);
    assert.equal(claims, 1);
    assert.equal(outbox.size, 1);

    const [notice] = outbox.values();
    assert.equal(notice.reference, reference);
    assert.equal(notice.status, 'disabled');
    assert.equal(notice.idempotencyKey, `booking-confirmation:${reference}`);
    const message = JSON.parse(unseal(notice.payload));
    assert.equal(message.to, 'synthetic@example.test');
    assert.equal(message.subject, 'TEST: DivaaBeauty booking confirmation');
    assert.match(message.text, /TEST ONLY/);
    assert.match(message.text, /not a real appointment/i);
    assert.match(message.text, /Synthetic consultation/);
    assert.match(message.text, /America\/Chicago/);
    assert(statements.some(sql => sql.includes('UPDATE booking_reservations SET status=$2')));

    const replayed = await book(db, upstream, input);
    assert.deepEqual(replayed, result, 'same valid input replay must return the stable confirmation');
    assert.equal(row.status, 'confirmed');
    assert.equal(claims, 1, 'confirmed replay must not claim recovery again');
    assert.equal(matchingEventReads, 1, 'confirmed replay must not re-read the matching event');
    assert.equal(inserts, 0);
    assert.equal(confirmationWrites, 1);
    assert.equal(outbox.size, 1, 'same-input replay must retain exactly one notice');
    assert.equal([...outbox.values()].filter(notice => notice.reference === reference).length, 1);
    assert.equal(statements.some(sql => /INSERT INTO booking_(reservations|jobs)/.test(sql)), false,
      'recovery and replay must not insert a reservation or job');
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
