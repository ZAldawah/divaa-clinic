import { safePage } from './analytics.mjs';

export const MEASUREMENT_ID = 'G-J4889EXEE3';
const EVENTS = new Set(['page_view', 'call_click', 'sms_click', 'booking_start']);
const DENIED = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

// Draft adapter. Mount only inside a public-only document root after review.
// No browser globals are accessed until explicitly constructed by that root.
export function createGa4Transport(win, doc) {
  let enabled = false;
  let loaded = false;
  const disableKey = `ga-disable-${MEASUREMENT_ID}`;
  win[disableKey] = true;
  win.dataLayer = win.dataLayer || [];
  function gtag() { win.dataLayer.push(arguments); }
  function stop() {
    enabled = false;
    win[disableKey] = true;
    // Drop queued events before a delayed script can execute after withdrawal.
    win.dataLayer.length = 0;
    gtag('consent', 'update', DENIED);
    for (const name of ['_ga', '_ga_J4889EXEE3']) {
      for (const domain of ['', '; domain=www.divaabeauty.net', '; domain=divaabeauty.net']) {
        doc.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax; Secure`;
      }
    }
  }
  return {
    start() {
      enabled = true;
      win[disableKey] = false;
      gtag('consent', loaded ? 'update' : 'default', { ...DENIED, analytics_storage: 'granted' });
      const page = safePage(win.location.pathname);
      if (!page) { stop(); return; }
      gtag('set', { ...page, allow_google_signals: false, allow_ad_personalization_signals: false });
      gtag('js', new Date());
      gtag('config', MEASUREMENT_ID, {
        ...page, send_page_view: false, allow_google_signals: false,
        allow_ad_personalization_signals: false, ignore_referrer: true,
        cookie_domain: 'none', cookie_path: '/', cookie_flags: 'SameSite=Lax;Secure',
        cookie_expires: 0, cookie_update: false,
        campaign_source: '', campaign_medium: '', campaign_name: '',
        campaign_id: '', campaign_term: '', campaign_content: '',
      });
      if (!loaded) {
        const script = doc.createElement('script');
        script.async = true;
        script.referrerPolicy = 'no-referrer';
        script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
        doc.head.appendChild(script);
        loaded = true;
      }
    },
    send(name, fields) {
      if (!enabled || !EVENTS.has(name)) return;
      const current = safePage(win.location.pathname);
      if (!current) { stop(); return; }
      // Reconstruct from static constants; caller fields cannot extend payloads.
      const page = fields?.page_type === current.page_type ? current : null;
      if (!page) return;
      gtag('set', page); // Also sanitize defaults used by automatic events.
      gtag('event', name, { ...page, send_to: MEASUREMENT_ID });
    },
    stop,
  };
}
