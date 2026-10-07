// Synthetic commands must never inherit the real database from .env.local.
export function assertLocalDatabase(value, { named = true } = {}) {
  if (!value) throw new Error('Explicit isolated synthetic database URL is required.');
  let url;
  try { url = new URL(value); } catch { throw new Error('Invalid synthetic database URL.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
      !['127.0.0.1', '[::1]'].includes(url.hostname) || !url.port ||
      url.search || url.hash ||
      (named && !/^\/(?:divaa_synthetic_|age11_test_)[a-z0-9_]+$/.test(url.pathname))) {
    throw new Error('Synthetic database must use an explicit loopback IP/port and isolated database name; URL options are forbidden.');
  }
  return value;
}

export function syntheticDatabase(env = process.env) {
  if (env.BOOKING_ALLOW_SYNTHETIC !== 'true') throw new Error('Synthetic setup must be explicitly enabled.');
  return assertLocalDatabase(env.BOOKING_SYNTHETIC_DATABASE_URL);
}

export function databaseUrl(env = process.env) {
  if (env.BOOKING_ALLOW_SYNTHETIC === 'true' || env.BOOKING_CALENDAR_MODE === 'mock' || env.BOOKING_SYNTHETIC_DATABASE_URL !== undefined) {
    return syntheticDatabase(env);
  }
  return env.DATABASE_URL;
}
