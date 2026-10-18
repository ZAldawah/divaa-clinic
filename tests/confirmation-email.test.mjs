import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmationMessage, enqueueBookingNotification, sendConfirmation } from '../src/lib/booking/confirmation-email.mjs';
import { randomBytes } from 'node:crypto';
process.env.BOOKING_ENCRYPTION_KEY=randomBytes(32).toString('base64');

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

test('confirmed booking creates one encrypted, disabled notification outbox record', async () => {
  const calls=[];
  const db={async query(sql,params){calls.push({sql,params});if(sql.startsWith('SELECT'))return {rows:[{reference:'ref-1',status:'disabled',idempotency_key:'booking-confirmation:ref-1'}]};return {rows:[]};}};
  const result=await enqueueBookingNotification(db,{reference:'ref-1',start:'2026-10-24T15:00:00.000Z',email:'person@example.test'});
  assert.equal(result.status,'disabled');assert.equal(calls[0].params[1].includes('person@example.test'),false);
  assert.match(calls[0].sql,/ON CONFLICT \(reference\) DO NOTHING/);
  assert.equal(calls[0].params[2],'booking-confirmation:ref-1');
});
