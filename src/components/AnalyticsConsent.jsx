"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createAnalytics, launchEvent, safePage } from '../lib/analytics.mjs';
import { readConsent, saveConsent } from '../lib/analytics-consent.mjs';
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
      const transport = createGa4Transport(window, document);
      const analytics = createAnalytics(transport);
      runtime.current = { transport, analytics };
      analytics.navigate(window.location.pathname);
      let stored = 'unknown';
      try { stored = readConsent(window.sessionStorage); } catch { /* fail closed */ }
      setChoice(stored);
      setOpen(stored === 'unknown');
      if (stored === 'accepted') {
        transport.start();
        analytics.setConsent(stored);
      }
    }, 0);
    function onClick(event) {
      if (event.defaultPrevented || event.detail > 1) return;
      const anchor = event.target.closest?.('a');
      const name = launchEvent(anchor?.protocol);
      if (name) runtime.current?.analytics.action(name);
      // booking_start remains reserved until an actual booking entry exists.
    }
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      clearTimeout(startup);
      runtime.current?.transport.stop();
      runtime.current = null;
    };
  }, []);

  useEffect(() => { runtime.current?.analytics.navigate(pathname); }, [pathname]);

  function choose(next) {
    if (!runtime.current) return;
    const { transport, analytics } = runtime.current;
    if (next !== 'accepted') analytics.setConsent('rejected');
    let saved = false;
    try { saved = saveConsent(window.sessionStorage, next); } catch { /* fail closed */ }
    setStorageError(!saved);
    if (!saved) {
      analytics.setConsent('rejected');
      setChoice('rejected');
      return;
    }
    if (next === 'accepted') {
      transport.start();
      analytics.setConsent(next);
    }
    setChoice(next);
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
    {open && <section id="analytics-settings" className={styles.panel} aria-labelledby="analytics-heading">
      <h2 id="analytics-heading">Optional analytics</h2>
      <p>With your permission, Google Analytics uses cookies to measure grouped public page views and contact-link clicks. Your choice applies to this browser tab. You can reject or withdraw permission here at any time.</p>
      <div className={styles.actions}>
        <button ref={firstChoice} className={styles.button} onClick={() => choose('accepted')}>Accept analytics</button>
        <button className={styles.button} onClick={() => choose('rejected')}>{choice === 'accepted' ? 'Withdraw analytics consent' : 'Reject analytics'}</button>
      </div>
      {storageError && <p role="status">Analytics is off. Your browser could not save this choice.</p>}
      {choice !== 'unknown' && <button className={styles.button} onClick={() => { setOpen(false); settingsButton.current?.focus(); }}>Close settings</button>}
    </section>}
  </aside>;
}
