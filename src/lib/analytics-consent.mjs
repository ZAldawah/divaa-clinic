// Optional analytics collection is disabled. Retain legacy exports for safe callers.
export const CONSENT_KEY = 'divaa.analytics.v1';
export function readConsent() { return 'rejected'; }
export function saveConsent(storage) {
  try { storage.removeItem(CONSENT_KEY); } catch { /* collection stays off */ }
  return true;
}
export function restoreConsent(runtime, storage) {
  saveConsent(storage);
  runtime.analytics.setConsent('rejected');
  return 'rejected';
}
export function chooseConsent(runtime, storage) {
  runtime.analytics.setConsent('rejected');
  saveConsent(storage);
  return { choice: 'rejected', saved: true };
}
