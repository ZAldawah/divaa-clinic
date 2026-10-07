// Privacy boundary: only static values may cross into the GA4 transport.
const SERVICE_PATHS = new Set([
  '/botox', '/filler', '/radiesse', '/sculptra', '/prp', '/rrf',
  '/facials', '/microneedling', '/collagen',
]);
const ACTIONS = new Set(['call_click', 'sms_click', 'booking_start']);

export function safePage(pathname) {
  if (pathname === '/') return { page_type: 'home', page_location: 'https://www.divaabeauty.net/', page_title: 'Home', page_referrer: '' };
  if (SERVICE_PATHS.has(pathname)) return { page_type: 'services', page_location: 'https://www.divaabeauty.net/services', page_title: 'Services', page_referrer: '' };
  return null;
}

// Pass only a protocol, never href, textContent, service name, or form data.
export function launchEvent(protocol) {
  if (protocol === 'tel:') return 'call_click';
  if (protocol === 'sms:') return 'sms_click';
  return null;
}

export function createAnalytics({ send, stop = () => {} }) {
  let consent = false;
  let path = null;
  let lastViewedPath = null;

  function emit(name) {
    const page = safePage(path);
    if (!consent || !page) return false;
    try {
      send(name, { ...page });
      return true;
    } catch {
      // Analytics must never interrupt a navigation or contact action.
      return false;
    }
  }

  function pageview() {
    if (lastViewedPath === path || !emit('page_view')) return false;
    lastViewedPath = path;
    return true;
  }

  return {
    navigate(pathname) {
      // Caller supplies usePathname(), never location.href or search params.
      if (path !== pathname) lastViewedPath = null;
      path = pathname;
      if (!safePage(path)) {
        try { stop(); } catch { /* fail closed in the transport */ }
        return false;
      }
      return pageview();
    },
    setConsent(choice) {
      consent = choice === 'accepted';
      if (!consent) {
        // Revocation does not replay the same page when reaccepted.
        try { stop(); } catch { /* transport must stop synchronously */ }
        return false;
      }
      return pageview();
    },
    action(name) {
      return ACTIONS.has(name) ? emit(name) : false;
    },
  };
}
