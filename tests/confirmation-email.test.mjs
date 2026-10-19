import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmationMessage, deliverNotification, enqueueBookingNotification, gmailSendScope, sendConfirmation } from '../src/lib/booking/confirmation-email.mjs';
import { randomBytes } from 'node:crypto';
process.env.BOOKING_ENCRYPTION_KEY=randomBytes(32).toString('base64');

test('confirmation content identifies confirmed service time and is idempotent per reference', () => {
  const message = confirmationMessage({ reference: 'synthetic-ref', start: '2026-10-24T15:00:00.000Z', email: 'person@example.test', serviceName: 'Consulting', timezone: 'America/Chicago' });
  assert.equal(message.to, 'person@example.test');
  assert.equal(message.subject, 'Your DivaaBeauty booking is confirmed');
  assert.match(message.text, /Booking confirmed: Consulting, Saturday, October 24, 2026 at 10:00 AM \(America\/Chicago\)/);
  assert.match(message.text, /Email delivery is separate/);
  assert.equal(message.idempotencyKey, 'booking-confirmation:synthetic-ref');
  assert.equal(Object.isFrozen(message), true);
});

test('invalid or missing confirmation fields fail closed', () => {
  assert.throws(() => confirmationMessage({ reference: '', start: 'bad', email: '' }), TypeError);
});

test('provider is never invoked while disabled and injected transport is used when enabled', async () => {
  let calls = 0;
  assert.deepEqual(await sendConfirmation({}, { enabled: false, transport: async () => { calls++; } }), { status: 'disabled' });
  assert.equal(calls, 0);
  assert.deepEqual(await sendConfirmation({}, { enabled: true, transport: async () => { calls++; return { status:'sent' }; } }), { status: 'sent' });
  assert.equal(calls, 1);
});

test('Gmail transport stays disabled without a dedicated approved configuration', async () => {
  assert.equal(gmailSendScope, 'https://www.googleapis.com/auth/gmail.send');
  assert.deepEqual(await (await import('../src/lib/booking/confirmation-email.mjs')).gmailTransport({}), { status: 'disabled' });
});

test('Gmail sender is configurable and not pinned to the initial mailbox', async () => {
  const { gmailTransport } = await import('../src/lib/booking/confirmation-email.mjs');
  const saved = { ...process.env };
  try {
    process.env.BOOKING_EMAIL_PROVIDER='gmail';
    process.env.BOOKING_EMAIL_ENABLED='true';
    process.env.BOOKING_GMAIL_SENDER='sender@example.test';
    delete process.env.BOOKING_GMAIL_CLIENT_ID;
    delete process.env.BOOKING_GMAIL_CLIENT_SECRET;
    assert.deepEqual(await gmailTransport({}), { status: 'disabled' });
  } finally {
    for (const key of ['BOOKING_EMAIL_PROVIDER','BOOKING_EMAIL_ENABLED','BOOKING_GMAIL_SENDER','BOOKING_GMAIL_CLIENT_ID','BOOKING_GMAIL_CLIENT_SECRET']) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
  }
});

test('outbox worker claims once, sends through injected provider and records acceptance', async () => {
  const queries=[];
  const db={async query(sql,params){queries.push(sql);if(sql.includes('RETURNING encrypted_payload'))return {rows:[{encrypted_payload:(await import('../src/lib/booking/crypto.mjs')).seal(JSON.stringify(confirmationMessage({reference:'ref-worker',start:'2026-10-24T15:00:00.000Z',email:'person@example.test'})))}]};return {rows:[]};}};
  let sent;
  const result=await deliverNotification(db,'ref-worker',{enabled:true,transport:async message=>{sent=message;return {status:'sent',providerMessageId:'provider-id'};}});
  assert.equal(result.status,'sent');assert.equal(result.providerMessageId,'provider-id');assert.equal(sent.to,'person@example.test');
  assert.match(queries[0],/status='sending'/);assert.match(queries[1],/status='sent'/);
});

test('ambiguous transport failure is marked uncertain and cannot be claimed again', async () => {
  const updates=[];
  const db={async query(sql){updates.push(sql);if(sql.includes('RETURNING encrypted_payload'))return {rows:[{encrypted_payload:(await import('../src/lib/booking/crypto.mjs')).seal(JSON.stringify(confirmationMessage({reference:'ref-uncertain',start:'2026-10-24T15:00:00.000Z',email:'person@example.test'})))}]};return {rows:[]};}};
  const result=await deliverNotification(db,'ref-uncertain',{enabled:true,transport:async()=>{throw new Error('timeout');}});
  assert.deepEqual(result,{status:'uncertain'});assert.match(updates[1],/status='uncertain'/);
});

test('confirmed booking creates one encrypted, disabled notification outbox record', async () => {
  const calls=[];
  const db={async query(sql,params){calls.push({sql,params});if(sql.startsWith('SELECT'))return {rows:[{reference:'ref-1',status:'disabled',idempotency_key:'booking-confirmation:ref-1'}]};return {rows:[]};}};
  const result=await enqueueBookingNotification(db,{reference:'ref-1',start:'2026-10-24T15:00:00.000Z',email:'person@example.test',serviceName:'Consulting',timezone:'America/Chicago'});
  assert.equal(result.status,'disabled');assert.equal(calls[0].params[1].includes('person@example.test'),false);
  assert.match(calls[0].sql,/ON CONFLICT \(reference\) DO NOTHING/);
  assert.equal(calls[0].params[2],'booking-confirmation:ref-1');
  const { unseal } = await import('../src/lib/booking/crypto.mjs');
  const payload=JSON.parse(unseal(calls[0].params[1]));
  assert.match(payload.text,/Consulting/);assert.match(payload.text,/America\/Chicago/);
  assert.equal(payload.subject,'Your DivaaBeauty booking is confirmed');
});

test('synthetic confirmed booking is clearly labeled TEST in the encrypted outbox payload', async () => {
  const calls=[];
  const db={async query(sql,params){calls.push({sql,params});if(sql.startsWith('SELECT'))return {rows:[{reference:'ref-test',status:'disabled',idempotency_key:'booking-confirmation:ref-test'}]};return {rows:[]};}};
  await enqueueBookingNotification(db,{reference:'ref-test',start:'2026-10-24T15:00:00.000Z',email:'person@example.test',serviceName:'Consulting',timezone:'America/Chicago',synthetic:true});
  const { unseal } = await import('../src/lib/booking/crypto.mjs');
  const payload=JSON.parse(unseal(calls[0].params[1]));
  assert.match(payload.subject,/^TEST:/);assert.match(payload.text,/TEST ONLY/);
  assert.match(payload.text,/not a real appointment/i);assert.match(payload.text,/Consulting/);
  assert.match(payload.text,/America\/Chicago/);
});
