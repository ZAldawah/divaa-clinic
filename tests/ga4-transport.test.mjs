import test from 'node:test';
import assert from 'node:assert/strict';
import { createGa4Transport, MEASUREMENT_ID } from '../src/lib/ga4-transport.mjs';
import { safePage } from '../src/lib/analytics.mjs';
import { readConsent, saveConsent } from '../src/lib/analytics-consent.mjs';

function harness(pathname = '/') {
  const scripts = [], cookies = [];
  const win = { location: { pathname } };
  const doc = { createElement: () => ({}), head: { appendChild: s => scripts.push(s) }, set cookie(v) { cookies.push(v); } };
  return { win, scripts, cookies, transport: createGa4Transport(win, doc), commands: () => win.dataLayer.map(v => [...v]) };
}
test('constructing and rejecting never loads Google; accepting uses verified ID without referrer', () => {
  const h = harness();
  h.transport.send('page_view', safePage('/'));
  h.transport.stop();
  assert.equal(h.scripts.length, 0);
  h.transport.start();
  assert.equal(h.scripts.length, 1);
  assert.equal(h.scripts[0].referrerPolicy, 'no-referrer');
  assert.equal(h.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`);
  const config = h.commands().find(c => c[0] === 'config')[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.campaign_source, '');
  assert.equal(config.cookie_expires, 0);
});
test('transport rebuilds allowlisted payloads and excludes arbitrary events and private routes', () => {
  const h = harness('/prp'); h.transport.start();
  h.transport.send('sms_click', { ...safePage('/prp'), email: 'synthetic@example.test', page_location: 'sms:123?body=private' });
  h.transport.send('booking_confirmed', safePage('/prp'));
  const events = h.commands().filter(c => c[0] === 'event');
  assert.equal(events.length, 1);
  assert.deepEqual(events[0][2], { ...safePage('/prp'), send_to: MEASUREMENT_ID });
  h.win.location.pathname = '/admin';
  h.transport.send('page_view', safePage('/'));
  assert.equal(h.win[`ga-disable-${MEASUREMENT_ID}`], true);
  assert.equal(h.commands().filter(c => c[0] === 'event').length, 0);
  const privateStart = harness('/booking'); privateStart.transport.start();
  assert.equal(privateStart.scripts.length, 0);
});
test('revoke synchronously disables collection, clears delayed commands and expires GA cookies', () => {
  const h = harness(); h.transport.start(); h.transport.send('page_view', safePage('/'));
  h.transport.stop();
  assert.equal(h.win[`ga-disable-${MEASUREMENT_ID}`], true);
  assert.deepEqual(h.commands().map(c => c[0]), ['consent']);
  assert.equal(h.cookies.length, 6);
  h.transport.send('sms_click', safePage('/'));
  assert.equal(h.commands().length, 1);
  h.transport.start(); assert.equal(h.scripts.length, 1);
});
test('session choice validation and storage failures fail closed', () => {
  let value;
  const storage = { getItem: () => value, setItem: (k, v) => { value = v; } };
  assert.equal(readConsent(storage), 'unknown');
  assert.equal(saveConsent(storage, 'accepted'), true);
  assert.equal(readConsent(storage), 'accepted');
  value = '{"accepted":true}'; assert.equal(readConsent(storage), 'unknown');
  const broken = { getItem() { throw Error(); }, setItem() { throw Error(); } };
  assert.equal(readConsent(broken), 'unknown');
  assert.equal(saveConsent(broken, 'accepted'), false);
});
