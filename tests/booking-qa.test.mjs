import test from 'node:test';

import assert from 'node:assert/strict';

import { readFileSync } from 'node:fs';

import { bookingQaEnabled } from '../src/lib/booking/qa-guard.mjs';

import { createQaTransport } from '../src/lib/booking/qa-transport.mjs';

test('QA fails closed except explicit development + synthetic + mock', () => {

  for (const NODE_ENV of ['production', 'test', 'development', undefined])

    for (const BOOKING_ALLOW_SYNTHETIC of ['true', 'false', undefined])

      for (const BOOKING_CALENDAR_MODE of ['mock', 'google', undefined]) {

        assert.equal(bookingQaEnabled({ NODE_ENV, BOOKING_ALLOW_SYNTHETIC, BOOKING_CALENDAR_MODE }), NODE_ENV === 'development' && BOOKING_ALLOW_SYNTHETIC === 'true' && BOOKING_CALENDAR_MODE === 'mock');

      }

  assert.equal(bookingQaEnabled({ NODE_ENV: 'development', BOOKING_ALLOW_SYNTHETIC: 'true', BOOKING_CALENDAR_MODE: 'mock', BOOKING_QA_DISABLED: 'true' }), false);

});

for (const scenario of ['contact', 'timeout', 'json', 'unavailable', 'pending', 'review', 'conflict', 'confirmed']) test(`${scenario}: deterministic isolated reservation simulation`, async () => {

  let evidence;

  const transport = createQaTransport(scenario, value => { evidence = value; }, 0);

  const body = JSON.stringify({ key: 'synthetic-key', name: 'Synthetic QA', email: 'synthetic@example.test', serviceId: 'consulting', start: '2026-10-10T15:30:00.000Z' });

  const options = { method: 'POST', body };

  const first = await transport('/api/booking/reserve', options).catch(error => error);

  if (scenario === 'contact') { assert.equal(first.status, 400); assert.equal(first.code, 'BOOKING_CONTACT_INVALID'); }

  if (scenario === 'conflict') assert.equal(first.status, 409);

  if (['pending', 'review'].includes(scenario)) assert.equal(first.status, scenario);

  assert.equal(evidence.simulatedReservations, ['contact', 'conflict'].includes(scenario) ? 0 : 1);

  const second = await transport('/api/booking/reserve', options);

  assert.equal(second.status, 'confirmed'); assert.equal(evidence.simulatedReservations, 1);

  assert.equal(evidence.ledger[0].body, evidence.ledger[1].body); assert.equal(evidence.realServiceCalls, 0);

});

test('availability empty/failure/retry and conflict refresh', async () => {

  const url = '/api/booking/slots?date=2026-10-10&service=consulting';

  assert.deepEqual(await createQaTransport('empty')(url), { slots: [] });

  const failing = createQaTransport('slotsFailure'); await assert.rejects(failing(url)); assert.equal((await failing(url)).slots.length, 1);

  const conflict = createQaTransport('conflict', () => {}, 0);

  const before = await conflict(url);

  await assert.rejects(conflict('/api/booking/reserve', { method: 'POST', body: '{"key":"synthetic"}' }));

  assert.notEqual((await conflict(url)).slots[0].start, before.slots[0].start);

});

test('unknown URLs fail closed with global network forbidden; transport has no imports', async () => {

  const original = globalThis.fetch; globalThis.fetch = () => { throw new Error('Network forbidden'); };

  try {

    const transport = createQaTransport('confirmed');

    assert.equal((await transport('/api/booking/config')).synthetic, true);

    await assert.rejects(transport('https://example.test/api/booking/config'));

    await assert.rejects(transport('/api/admin/config'));

  } finally { globalThis.fetch = original; }

  const source = readFileSync(new URL('../src/lib/booking/qa-transport.mjs', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /\bimport\b|\bfetch\s*\(|XMLHttpRequest|sendBeacon/);

});


test('actual server page refuses production before loading QA client', async () => {
  const source = readFileSync(new URL('../src/app/(private)/qa/booking/page.jsx', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('  if (!bookingQaEnabled'), source.indexOf('  return <BookingQa'));
  const run = new Function('bookingQaEnabled', 'process', 'notFound', 'return async () => {' + body + '}');
  const sentinel = new Error('404');
  const page = run(bookingQaEnabled, { env: { NODE_ENV: 'production', BOOKING_ALLOW_SYNTHETIC: 'true', BOOKING_CALENDAR_MODE: 'mock' } }, () => { throw sentinel; });
  await assert.rejects(page(), error => error === sentinel);
});
