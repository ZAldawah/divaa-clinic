import test from 'node:test';
import assert from 'node:assert/strict';
import { CONSENT_KEY, readConsent, saveConsent, restoreConsent, chooseConsent } from '../src/lib/analytics-consent.mjs';
import { createAnalytics } from '../src/lib/analytics.mjs';

function storageHarness() {
  let value = 'accepted';
  const faults = { write: false, remove: false, read: false, noop: false };
  return {
    faults, value: () => value,
    getItem(key) { assert.equal(key, CONSENT_KEY); if (faults.read) throw Error('read denied'); return value; },
    setItem(key, next) { assert.equal(key, CONSENT_KEY); if (faults.write) throw Error('write denied'); if (!faults.noop) value = next; },
    removeItem(key) { assert.equal(key, CONSENT_KEY); if (faults.remove) throw Error('remove denied'); value = null; },
  };
}
function runtimeHarness() {
  const evidence = { starts: 0, events: [], running: false };
  const transport = {
    start() { evidence.starts++; evidence.running = true; },
    stop() { evidence.running = false; },
    send(name) { if (evidence.running) evidence.events.push(name); },
  };
  const analytics = createAnalytics(transport);
  analytics.navigate('/');
  return { transport, analytics, evidence };
}
for (const removeFails of [false, true]) {
  test(`withdrawal write throws, reads succeed, removal failure=${removeFails}: reload/back stay off`, () => {
    const storage = storageHarness();
    const runtime = runtimeHarness();
    assert.equal(chooseConsent(runtime, storage, 'accepted').saved, true);
    assert.equal(runtime.evidence.starts, 1);
    storage.faults.write = true;
    storage.faults.remove = removeFails;
    assert.deepEqual(chooseConsent(runtime, storage, 'rejected'), { choice: 'rejected', saved: false });
    assert.equal(runtime.evidence.running, false);
    assert.equal(storage.value(), removeFails ? 'accepted' : null);
    const reload = runtimeHarness();
    assert.equal(restoreConsent(reload, storage), 'unknown');
    reload.analytics.navigate('/botox'); reload.analytics.action('call_click');
    assert.equal(reload.evidence.starts, 0);
    assert.deepEqual(reload.evidence.events, []);
    // Previously accepted BFCache runtime uses the same restoration function.
    restoreConsent(runtime, storage);
    runtime.analytics.navigate('/filler'); runtime.analytics.action('sms_click');
    assert.equal(runtime.evidence.starts, 1);
    assert.deepEqual(runtime.evidence.events, ['page_view']);
    storage.faults.write = false; storage.faults.remove = false;
    assert.equal(restoreConsent(reload, storage), 'unknown');
    assert.equal(reload.evidence.starts, 0);
    assert.deepEqual(chooseConsent(reload, storage, 'accepted'), { choice: 'accepted', saved: true });
    assert.equal(reload.evidence.starts, 1);
    assert.deepEqual(reload.evidence.events, ['page_view']);
  });
}
test('normal reject persists and explicit reacceptance starts only current document', () => {
  const storage = storageHarness(); const runtime = runtimeHarness();
  assert.deepEqual(chooseConsent(runtime, storage, 'rejected'), { choice: 'rejected', saved: true });
  assert.equal(readConsent(storage), 'rejected');
  assert.equal(restoreConsent(runtimeHarness(), storage), 'rejected');
  assert.equal(chooseConsent(runtime, storage, 'accepted').saved, true);
  const reload = runtimeHarness();
  assert.equal(restoreConsent(reload, storage), 'unknown');
  assert.equal(reload.evidence.starts, 0);
});
test('silent writes, read failures, and invalid choices cannot claim saved consent', () => {
  const storage = storageHarness(); storage.faults.noop = true;
  assert.equal(saveConsent(storage, 'rejected'), false);
  assert.equal(storage.value(), null);
  assert.equal(saveConsent(storage, 'accepted'), false);
  storage.faults.noop = false; storage.faults.read = true;
  const runtime = runtimeHarness();
  assert.equal(chooseConsent(runtime, storage, 'accepted').saved, false);
  assert.equal(runtime.evidence.starts, 0);
  assert.equal(readConsent(storage), 'unknown');
  assert.equal(saveConsent(storage, 'invalid'), false);
});
