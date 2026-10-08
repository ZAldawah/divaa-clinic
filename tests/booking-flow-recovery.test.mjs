import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { contactSchema } from '../src/lib/booking/contact-schema.mjs';
import { book } from '../src/lib/booking/service.mjs';

// Execute the real component handlers with state/ref doubles, not a browser.
// JSX and effects (including focus) remain host acceptance work.
const source = readFileSync(new URL('../src/components/BookingFlow.jsx', import.meta.url), 'utf8');
const handlerSource = source.slice(0, source.indexOf('  return <main'))
  .replace(/^import .*;\r?\n/gm, '').replaceAll('export default ', '').replaceAll('export ', '');
const create = new Function('useState', 'useRef', 'useEffect', 'fetch', 'crypto', 'contactSchema',
  handlerSource + '\nreturn { submit, detailsSubmit, snapshot, step, result, error, fieldErrors, loading, slot, retry, conflict, setName, setEmail, setStep };\n}\nreturn BookingFlow;');
const input = () => ({ serviceId: 'synthetic-consultation', start: '2026-10-12T15:15:00.000Z', name: 'Avery Example', email: 'avery@example.test', key: randomUUID() });
function harness(fetch) {
  const values = [], refs = []; let cursor = 0, refCursor = 0;
  const initial = { 1: 'synthetic-consultation', 4: { start: input().start }, 5: 3, 6: 'Avery Example', 7: 'avery@example.test' };
  const component = create(value => {
    const index = cursor++;
    if (!(index in values)) values[index] = index in initial ? initial[index] : value;
    return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next; }];
  }, value => { const index = refCursor++; return refs[index] ??= { current: value }; }, () => {}, fetch, { randomUUID }, contactSchema);
  return () => { cursor = 0; refCursor = 0; return component(); };
}
// Exercise the real HTTP error mapper while replacing infrastructure guards.
const http = readFileSync(new URL('../src/lib/booking/http.mjs', import.meta.url), 'utf8');
const endpoint = new Function('ZodError', 'json', 'origin', 'requireAdmin', 'limit', 'getStore', 'clientLimit',
  http.slice(http.indexOf('export function endpoint')).replace('export ', '') + '\nreturn endpoint;')(
  ZodError, (value, status) => Response.json(value, { status }), () => {}, () => {}, () => {}, () => {}, () => {});
const confirmed = { status: 'confirmed', reference: 'synthetic', start: input().start };

test('shared client validation rejects server-invalid email before review', () => {
  const render = harness(() => { throw new Error('No network expected'); });
  render().setStep(2); render().setEmail('avery..example@example.test');
  render().detailsSubmit({ preventDefault() {} });
  assert.equal(render().step, 2); assert.match(render().fieldErrors.email, /valid email/);
  assert.equal(render().snapshot.current, null);
});

test('authoritative pre-write rejection returns editable details; corrected request confirms once', async () => {
  let writes = 0, databaseCalls = 0; const requests = [];
  const reject = endpoint(async request => book({ query() { databaseCalls++; throw new Error('Must not access DB'); } }, {}, await request.json()));
  const render = harness(async (_url, options) => {
    requests.push(JSON.parse(options.body));
    if (requests.length === 1) return reject(new Request('http://synthetic.test/reserve', options));
    writes++; return Response.json(confirmed);
  });
  // Bypass client validation to exercise server authority (old/stale client).
  render().setEmail('avery..example@example.test'); await render().submit();
  assert.equal(databaseCalls, 0); assert.equal(writes, 0);
  assert.equal(render().step, 2); assert.equal(render().snapshot.current, null);
  assert.match(render().fieldErrors.email, /No appointment was created/);
  render().setEmail('avery@example.test'); render().detailsSubmit({ preventDefault() {} });
  assert.equal(render().step, 3); assert.deepEqual(render().fieldErrors, {});
  await render().submit(); assert.equal(writes, 1); assert.equal(render().result.status, 'confirmed');
  assert.notEqual(requests[0].key, requests[1].key); assert.equal(requests[1].email, 'avery@example.test');
});

for (const [label, response] of [
  ['timeout', () => { throw new Error('timeout'); }],
  ['invalid JSON', () => new Response('unreadable', { status: 200 })],
  ['503', () => Response.json({ error: 'unavailable', code: 'BOOKING_CONTACT_INVALID', fields: ['email'] }, { status: 503 })],
  ['unclassified 400', () => Response.json({ error: 'invalid request' }, { status: 400 })],
  ['invalid validation contract', () => Response.json({ code: 'BOOKING_CONTACT_INVALID', fields: ['unexpected'] }, { status: 400 })],
]) test(`${label} retains identical body/key and locked review for recovery`, async () => {
  const bodies = []; const render = harness(async (_url, options) => { bodies.push(options.body); return response(); });
  await render().submit(); const snapshot = render().snapshot.current;
  await render().submit();
  assert.equal(bodies.length, 2); assert.equal(bodies[0], bodies[1]);
  assert.equal(render().snapshot.current, snapshot); assert.equal(render().step, 3);
  assert.match(render().error, /same request/); assert.equal(render().loading, false);
});

test('double submit sends only one request while in flight', async () => {
  let calls = 0, release;
  const render = harness(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  const first = render().submit(); await render().submit(); assert.equal(calls, 1);
  release(Response.json(confirmed)); await first;
  assert.equal(render().result.status, 'confirmed'); assert.equal(render().loading, false);
});

for (const status of ['pending', 'review']) test(`202 ${status} keeps recovery snapshot`, async () => {
  const bodies = []; const render = harness(async (_url, options) => { bodies.push(options.body); return Response.json({ ...confirmed, status }, { status: 202 }); });
  await render().submit(); await render().submit();
  assert.equal(render().result.status, status); assert.ok(render().snapshot.current);
  assert.equal(bodies[0], bodies[1]); assert.equal(render().step, 3);
});

test('409 clears selection and refreshes availability', async () => {
  const render = harness(async () => Response.json({ error: 'That time is no longer available.' }, { status: 409 }));
  await render().submit();
  assert.equal(render().snapshot.current, null); assert.equal(render().slot, null);
  assert.equal(render().step, 1); assert.equal(render().retry, 1); assert.equal(render().conflict, true);
});

test('generic schema errors never acquire the pre-write contact marker', async () => {
  const invalid = endpoint(async () => contactSchema.parse({ name: '', email: 'bad' }));
  const response = await invalid({}); assert.equal(response.status, 400);
  assert.equal((await response.json()).code, undefined);
  await assert.rejects(book({}, {}, { ...input(), start: 'bad', email: 'bad' }), error => error instanceof ZodError && error.code === undefined);
});
