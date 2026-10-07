export const CONSENT_KEY = 'divaa.analytics.v1';
// Persist refusals only as authority. A stored acceptance can be stale after
// storage denies BOTH a withdrawal write and removal. No storage-only probe
// can distinguish that value on a later document, so require a fresh opt-in.
export function readConsent(storage) {
  try { return storage.getItem(CONSENT_KEY) === 'rejected' ? 'rejected' : 'unknown'; }
  catch { return 'unknown'; }
}
export function saveConsent(storage, choice) {
  if (choice !== 'accepted' && choice !== 'rejected') return false;
  try {
    storage.setItem(CONSENT_KEY, choice);
    if (storage.getItem(CONSENT_KEY) === choice) return true;
  } catch { /* invalidate any previous acceptance below */ }
  try { storage.removeItem(CONSENT_KEY); } catch { /* never restore acceptance */ }
  // Removal is not a saved refusal. Keep the disclosure visible, even when
  // invalidation worked; silent/no-op writes must not claim persistence either.
  return false;
}

export function restoreConsent(runtime, storage) {
  const choice = readConsent(storage);
  runtime.analytics.setConsent(choice);
  return choice;
}

export function chooseConsent(runtime, storage, next) {
  // Stop first, including when storage access or verification fails.
  runtime.analytics.setConsent('rejected');
  const saved = saveConsent(storage, next);
  const choice = saved ? next : 'rejected';
  if (choice === 'accepted') {
    runtime.transport.start();
    runtime.analytics.setConsent(choice);
  }
  return { choice, saved };
}
