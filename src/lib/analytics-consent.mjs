export const CONSENT_KEY = 'divaa.analytics.v1';
// Session-only until the owner approves a persistent consent lifetime.
export function readConsent(storage) {
  try {
    const value = storage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : 'unknown';
  } catch { return 'unknown'; }
}
export function saveConsent(storage, choice) {
  if (choice !== 'accepted' && choice !== 'rejected') return false;
  try { storage.setItem(CONSENT_KEY, choice); return true; }
  catch { return false; }
}
