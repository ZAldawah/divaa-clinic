// Deliberately dependency-free: no fetch, API fallback, DB, Calendar or persistence.
export const scenarios = {
  confirmed: 'Confirmed (delayed response / double-submit check)',
  contact: '400 authoritative contact rejection, then corrected success',
  timeout: 'Uncertain timeout, then same-request success',
  json: 'Uncertain invalid JSON, then same-request success',
  unavailable: 'Uncertain 503, then same-request success',
  pending: '202 pending, then same-request success',
  review: '202 review, then same-request success',
  conflict: '409 conflict, refresh times, then success',
  empty: 'No slots',
  slotsFailure: 'Availability failure, Retry succeeds',
};
export function createQaTransport(scenario, publish = () => {}, delay = 600) {
  if (!Object.hasOwn(scenarios, scenario)) throw new Error('Unknown QA scenario');
  let attempts = 0, slotCalls = 0;
  const ledger = [], reservations = new Map();
  const fail = (message, status, extra = {}) => Object.assign(new Error(message), { status, ...extra });
  async function transport(url, options = {}) {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const parsed = new URL(url, 'http://qa.invalid');
    if (parsed.origin !== 'http://qa.invalid') throw new Error('QA external URL forbidden');
    if (parsed.pathname === '/api/booking/config' && !options.method) return {
      synthetic: true, timezone: 'America/Chicago', services: [{ id: 'consulting', name: 'Consulting', duration: 30 }],
    };
    if (parsed.pathname === '/api/booking/slots' && !options.method) {
      slotCalls++;
      if (scenario === 'slotsFailure' && slotCalls === 1) throw fail('Simulated availability failure', 503);
      if (scenario === 'empty') return { slots: [] };
      const date = parsed.searchParams.get('date');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw fail('Invalid simulated date', 400);
      // Fixed UTC fixture: use October 10, 2026 for the documented Chicago times.
      const hour = scenario === 'conflict' && attempts ? '16' : '15';
      return { slots: [{ start: `${date}T${hour}:30:00.000Z`, end: `${date}T${Number(hour) + 1}:00:00.000Z` }] };
    }
    if (parsed.pathname !== '/api/booking/reserve' || options.method !== 'POST') throw new Error('QA route forbidden; no network fallback');
    const body = JSON.parse(options.body);
    attempts++;
    const first = attempts === 1;
    const outcome = first ? scenario : 'confirmed';
    ledger.push({ attempt: attempts, key: body.key, body: options.body, simulatedOutcome: outcome });
    if (!(first && ['contact', 'conflict'].includes(scenario))) reservations.set(body.key, body);
    publish({ ledger: [...ledger], simulatedReservations: reservations.size, realServiceCalls: 0 });
    await new Promise(resolve => setTimeout(resolve, delay));
    if (first && scenario === 'contact') throw fail('Simulated authoritative rejection', 400, { code: 'BOOKING_CONTACT_INVALID', fields: ['email'] });
    if (first && scenario === 'conflict') throw fail('Simulated conflict', 409);
    if (first && scenario === 'timeout') throw new Error('Simulated timeout');
    if (first && scenario === 'json') throw new SyntaxError('Simulated invalid JSON');
    if (first && scenario === 'unavailable') throw fail('Simulated unavailable', 503);
    return { status: first && ['pending', 'review'].includes(scenario) ? scenario : 'confirmed', reference: 'SIMULATED-' + body.key, start: body.start };
  }
  return transport;
}
