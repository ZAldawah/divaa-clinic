import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, safePage, launchEvent } from '../src/lib/analytics.mjs';

function harness() {
  const events = [];
  let stops = 0;
  const analytics = createAnalytics({ send: (name, params) => events.push({ name, params }), stop: () => stops++ });
  return { analytics, events, stopped: () => stops };
}

test('all pages and actions remain non-collecting regardless of legacy consent calls', () => {
  const { analytics: a, events } = harness();
  a.navigate('/'); a.setConsent('accepted'); a.action('sms_click'); a.navigate('/botox');
  assert.deepEqual(events, []);
});

test('only fixed public path metadata is recognized; private and dynamic paths fail closed', () => {
  assert.equal(safePage('/').page_type, 'home');
  for (const path of ['/admin', '/admin/patients', '/booking', '/login', '/api', '/filler/patient', '/?email=x', '/prp?name=x', '/PRP', '//botox', '/botox/', null]) assert.equal(safePage(path), null);
});

test('contact launch classification remains non-collecting and rejects arbitrary destinations', () => {
  const { analytics: a, events } = harness();
  assert.equal(launchEvent('tel:'), 'call_click');
  assert.equal(launchEvent('sms:'), 'sms_click');
  assert.equal(launchEvent('sms:123?body=private'), null);
  assert.equal(a.action('booking_complete'), false);
  a.action('call_click'); a.action('sms_click');
  assert.deepEqual(events, []);
});
