"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createAnalytics, launchEvent, safePage } from '../lib/analytics.mjs';
import { restoreConsent, chooseConsent } from '../lib/analytics-consent.mjs';
import { createGa4Transport } from '../lib/ga4-transport.mjs';
import styles from './AnalyticsConsent.module.css';

// Mounted only in the public document root, behind the release configuration.
// Keep this component out of any root shared with admin or booking screens.
export default function AnalyticsConsent() {
  const pathname = usePathname();
  const runtime = useRef(null);
  const settingsButton = useRef(null);
  const firstChoice = useRef(null);
  const [choice, setChoice] = useState('unknown');
  const [open, setOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    // Defer startup so React's development effect replay cannot enqueue a
    // pageview and immediately erase it while a tag script is still loading.
    const startup = setTimeout(() => {
      const transport = createGa4Transport(window, document, {
        preview: process.env.NEXT_PUBLIC_ANALYTICS_PREVIEW === 'true',
      });
      const analytics = createAnalytics(transport);
      runtime.current = { transport, analytics };
      analytics.navigate(window.location.pathname);
      let stored = 'unknown';
      try { stored = restoreConsent(runtime.current, window.sessionStorage); } catch { /* fail closed */ }
      setChoice(stored);
      setOpen(stored === 'unknown');

    }, 0);
    function onClick(event) {
      if (event.defaultPrevented || event.detail > 1) return;
      const anchor = event.target.closest?.('a');
      const name = launchEvent(anchor?.protocol);
      if (name) runtime.current?.analytics.action(name);
      // booking_start remains reserved until an actual booking entry exists.
    }
    function suspend() {
      runtime.current?.analytics.setConsent('rejected');
      setChoice('rejected');
    }
    function resume(event) {
      if (!event.persisted || !runtime.current) return;
      suspend();
      let stored = 'unknown';
      try { stored = restoreConsent(runtime.current, window.sessionStorage); } catch { /* fail closed */ }
      setChoice(stored);
      setOpen(stored === 'unknown');
    }
    window.addEventListener('pagehide', suspend);
    window.addEventListener('pageshow', resume);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('pagehide', suspend);
      window.removeEventListener('pageshow', resume);
      document.removeEventListener('click', onClick);
      clearTimeout(startup);
      runtime.current?.transport.stop();
      runtime.current = null;
    };
  }, []);

  useEffect(() => { runtime.current?.analytics.navigate(pathname); }, [pathname]);

  function choose(next) {
    if (!runtime.current) return;
    // Accessing sessionStorage itself can throw. The runtime is stopped first.
    runtime.current.analytics.setConsent('rejected');
    let result = { choice: 'rejected', saved: false };
    try { result = chooseConsent(runtime.current, window.sessionStorage, next); } catch { /* fail closed */ }
    setStorageError(!result.saved);
    setChoice(result.choice);
    if (!result.saved) { setOpen(true); return; }
    setOpen(false);
    settingsButton.current?.focus();
  }

  if (!safePage(pathname)) return null;
  return <aside className={styles.container} aria-label="Analytics privacy settings">
    <button ref={settingsButton} className={styles.button} aria-expanded={open}
      aria-controls="analytics-settings" onClick={() => {
        setOpen(true);
        requestAnimationFrame(() => firstChoice.current?.focus());
      }}>Privacy settings</button>
    <p role="status">{process.env.NEXT_PUBLIC_ANALYTICS_PREVIEW === 'true'
      ? (choice === 'accepted' ? 'Preview choice: accepted. Google Analytics collection is still disabled.' : 'Review preview: Google Analytics collection is disabled.')
      : (choice === 'accepted' ? 'Analytics is on. You can turn it off in Privacy settings.' : 'Analytics is off.')}</p>
    {open && <section id="analytics-settings" className={styles.panel} aria-labelledby="analytics-heading">
      <h2 id="analytics-heading">Optional analytics</h2>
      <p>With your permission, DivaaBeauty uses Google Analytics to measure grouped public page views and contact-link clicks. Analytics uses browser-session cookies and generated identifiers. Google receives analytics data. You can reject analytics or withdraw your permission through Privacy settings. If your browser saves your rejection, we remember it for this tab’s browsing session. If you accept, analytics turns off when you reload the page or leave and return. To turn analytics on again, choose Accept analytics. You can keep browsing with analytics off.</p>
      <p>We do not send contact-form contents, appointment details, contact information or individual treatment labels. Withdrawing permission stops future analytics collection; it does not delete data already collected.</p>
      {process.env.NEXT_PUBLIC_ANALYTICS_PREVIEW === 'true' && <p>Review preview: this is draft disclosure awaiting owner approval. Google collection is disabled; accepting only exercises local interface behavior.</p>}
      <div className={styles.actions}>
        <button ref={firstChoice} className={styles.button} onClick={() => choose('accepted')}>Accept analytics</button>
        <button className={styles.button} onClick={() => choose('rejected')}>{choice === 'accepted' ? 'Withdraw analytics consent' : 'Reject analytics'}</button>
      </div>
      {storageError && <p role="status">Analytics is off. We could not confirm that your browser saved your choice. You may see this message or be asked to choose again when you return. Analytics will stay off unless you choose Accept analytics and your browser saves that choice.</p>}
      {choice !== 'unknown' && <button className={styles.button} onClick={() => { setOpen(false); settingsButton.current?.focus(); }}>Close settings</button>}
    </section>}
  </aside>;
}
