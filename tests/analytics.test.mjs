import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, safePage, launchEvent } from '../src/lib/analytics.mjs';

function harness() {
  const events = [];
  let stops = 0;
  const analytics = createAnalytics({ send: (name, params) => events.push({ name, params }), stop: () => stops++ });
  return { analytics, events, stopped: () => stops };
}

test('unknown and rejected consent send nothing; acceptance sends current page once', () => {
  const { analytics: a, events } = harness();
  a.navigate('/'); a.action('sms_click'); a.setConsent('rejected'); a.navigate('/botox');
  assert.equal(events.length, 0);
  a.setConsent('accepted'); a.setConsent('accepted'); a.navigate('/botox');
  assert.equal(events.length, 1);
});

test('initial, client transitions and back navigation count once each', () => {
  const { analytics: a, events } = harness();
  a.setConsent('accepted'); a.navigate('/'); a.navigate('/'); a.navigate('/botox'); a.navigate('/filler'); a.navigate('/');
  assert.equal(events.length, 4);
  assert.equal(events[1].params.page_location, events[2].params.page_location);
});

test('revocation blocks actions and navigation; reacceptance does not replay an unchanged page', () => {
  const { analytics: a, events, stopped } = harness();
  a.navigate('/'); a.setConsent('accepted'); a.setConsent('rejected'); a.action('call_click');
  a.setConsent('accepted');
  assert.equal(events.length, 1);
  a.setConsent('rejected'); a.navigate('/botox'); a.setConsent('accepted');
  assert.equal(events.length, 2);
  assert.equal(stopped(), 2);
});

test('all private, unknown, dynamic, query-bearing and malformed paths fail closed', () => {
  const { analytics: a, events } = harness();
  a.setConsent('accepted');
  for (const path of ['/admin', '/admin/patients', '/booking', '/booking/manage', '/login', '/api', '/filler/patient', '/?email=synthetic@example.test', '/prp?name=Test', '/PRP', '//botox', '/botox/', null, undefined]) {
    assert.equal(safePage(path), null);
    a.navigate(path); a.action('sms_click');
  }
  assert.deepEqual(events, []);
});

test('payloads contain only static fields; service names and extra action arguments never escape', () => {
  const { analytics: a, events } = harness();
  a.navigate('/prp'); a.setConsent('accepted');
  a.action('sms_click', { name: 'Synthetic', href: 'sms:123?body=private' });
  for (const { params } of events) assert.deepEqual(params, {
    page_location: 'https://www.divaabeauty.net/services', page_title: 'Services', page_referrer: '',
  });
});

test('launch semantics never imply completion; arbitrary event names are rejected', () => {
  const { analytics: a, events } = harness();
  a.navigate('/'); a.setConsent('accepted');
  assert.equal(launchEvent('tel:'), 'call_click');
  assert.equal(launchEvent('sms:'), 'sms_click');
  assert.equal(launchEvent('https:'), null);
  assert.equal(launchEvent('sms:123?body=private'), null);
  for (const event of ['booking_complete', 'generate_lead', 'form_submit', 'enquiry_confirmed']) assert.equal(a.action(event), false);
  a.action('call_click'); a.action('sms_click'); a.action('booking_start');
  assert.deepEqual(events.map(e => e.name), ['page_view', 'call_click', 'sms_click', 'booking_start']);
});

test('broken transport cannot break core journeys and can retry a pageview', () => {
  let failing = true;
  const a = createAnalytics({ send() { if (failing) throw Error('offline'); }, stop() { throw Error('offline'); } });
  a.navigate('/'); assert.equal(a.setConsent('accepted'), false);
  failing = false; assert.equal(a.navigate('/'), true);
  assert.doesNotThrow(() => a.setConsent('rejected'));
});
