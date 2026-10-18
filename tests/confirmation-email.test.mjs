import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmationMessage, sendConfirmation } from '../src/lib/booking/confirmation-email.mjs';

test('confirmation content is minimal and idempotent per confirmed reference', () => {
  const message = confirmationMessage({ reference: 'synthetic-ref', start: '2026-10-24T15:00:00.000Z', email: 'person@example.test' });
  assert.equal(message.to, 'person@example.test');
  assert.match(message.text, /received your appointment request/);
  assert.equal(message.idempotencyKey, 'booking-confirmation:synthetic-ref');
  assert.equal(Object.isFrozen(message), true);
});

test('invalid or missing confirmation fields fail closed', () => {
  assert.throws(() => confirmationMessage({ reference: '', start: 'bad', email: '' }), TypeError);
});

test('provider is never invoked while sending is disabled, even if supplied', async () => {
  let calls = 0;
  assert.deepEqual(await sendConfirmation({}, { enabled: false, transport: async () => { calls++; } }), { status: 'disabled' });
  assert.deepEqual(await sendConfirmation({}, { enabled: true, transport: async () => { calls++; } }), { status: 'disabled' });
  assert.equal(calls, 0);
});
