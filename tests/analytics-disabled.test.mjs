import test from 'node:test';
import assert from 'node:assert/strict';
import { CONSENT_KEY, readConsent, restoreConsent, chooseConsent } from '../src/lib/analytics-consent.mjs';
import { createAnalytics } from '../src/lib/analytics.mjs';

function setup(initial = 'accepted') {
  let stored = initial;
  const events = [];
  const storage = { getItem: key => { assert.equal(key, CONSENT_KEY); return stored; }, removeItem: key => { assert.equal(key, CONSENT_KEY); stored = null; } };
  const analytics = createAnalytics({ send: name => events.push(name), stop() {} });
  const runtime = { analytics, transport: { start() { events.push('transport-start'); } } };
  return { storage, runtime, events, stored: () => stored };
}

test('legacy accepted storage is cleared and cannot restore optional analytics', () => {
  const h = setup();
  assert.equal(restoreConsent(h.runtime, h.storage), 'rejected');
  h.runtime.analytics.navigate('/');
  h.runtime.analytics.action('sms_click');
  assert.equal(h.stored(), null);
  assert.deepEqual(h.events, []);
});

test('consent API remains fail closed for stale callers and never starts transport', () => {
  const h = setup('rejected');
  assert.deepEqual(chooseConsent(h.runtime, h.storage, 'accepted'), { choice: 'rejected', saved: true });
  assert.equal(h.stored(), null);
  h.runtime.analytics.navigate('/');
  h.runtime.analytics.action('call_click');
  assert.deepEqual(h.events, []);
});
