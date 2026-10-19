'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { contactSchema } from '@/lib/booking/contact-schema.mjs';
export async function api(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || data.message || 'Please try again.'), { status: response.status, code: data.code, fields: data.fields });
  return data;
}
export const write = (method, value) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
export function when(value, zone) { return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: zone }).format(new Date(value)); }
const steps = ['Service', 'Date and time', 'Your details', 'Review'];
export default function BookingFlow({ transport = api, simulation = false } = {}) {
  const [config, setConfig] = useState(null), [service, setService] = useState(''), [date, setDate] = useState('');
  const [slots, setSlots] = useState([]), [slot, setSlot] = useState(null), [step, setStep] = useState(0);
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [error, setError] = useState('');
  const [loading, setLoading] = useState(false), [result, setResult] = useState(null), [retry, setRetry] = useState(0);
  const [requestedUnavailable, setRequestedUnavailable] = useState(false), [fieldErrors, setFieldErrors] = useState({});
  const [slotsLoaded, setSlotsLoaded] = useState(false), [conflict, setConflict] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'America/Chicago' }).format(new Date()));
  const [focusedCalendarDate, setFocusedCalendarDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]), [calendarLoading, setCalendarLoading] = useState(false), [calendarError, setCalendarError] = useState('');
  const snapshot = useRef(null), heading = useRef(null), errorSummary = useRef(null), submitting = useRef(false), calendarButtons = useRef(new Map());
  useEffect(() => {
    if (config) return;
    let current = true;
    transport('/api/booking/config').then(value => {
      if (!current) return;
      setConfig(value); setError('');
      setCalendarMonth(new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: value.timezone }).format(new Date()));
      const requested = new URLSearchParams(window.location.search).get('service');
      if (value.services.some(item => item.id === requested)) setService(requested);
      else if (requested) setRequestedUnavailable(true);
    }).catch(() => { if (current) setError('We could not load appointment options. Try again or contact the clinic.'); });
    return () => { current = false; };
  }, [retry, config, transport]);
  useEffect(() => {
    if (!date || !service) return;
    const controller = new AbortController();
    setLoading(true); setSlotsLoaded(false); setSlots([]); setSlot(null); setError('');
    transport('/api/booking/slots?date=' + encodeURIComponent(date) + '&service=' + encodeURIComponent(service), { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) { setSlots(value.slots); setSlotsLoaded(true); } })
      .catch(error => { if (!controller.signal.aborted && error.name !== 'AbortError') setError('We could not load appointment times. Try again or choose another date.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [date, service, retry, transport]);
  useEffect(() => {
    if (step !== 1 || !service) return;
    const controller = new AbortController();
    setCalendarLoading(true); setCalendarError(''); setAvailableDates([]);
    transport('/api/booking/calendar?month=' + encodeURIComponent(calendarMonth) + '&service=' + encodeURIComponent(service), { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setAvailableDates(value.availableDates); })
      .catch(error => { if (!controller.signal.aborted && error.name !== 'AbortError') setCalendarError('We could not check dates right now. Try again.'); })
      .finally(() => { if (!controller.signal.aborted) setCalendarLoading(false); });
    return () => controller.abort();
  }, [step, service, calendarMonth, retry, transport]);
  useEffect(() => { heading.current?.focus(); }, [step, result]);
  useEffect(() => { if (error || Object.keys(fieldErrors).length) errorSummary.current?.focus(); }, [error, fieldErrors]);
  useEffect(() => { if (focusedCalendarDate) calendarButtons.current.get(focusedCalendarDate)?.focus(); }, [focusedCalendarDate, calendarMonth]);
  const chosen = config?.services.find(item => item.id === service);
  const calendarFirst = new Date(`${calendarMonth}-01T00:00:00Z`);
  const gridStart = new Date(calendarFirst);
  gridStart.setUTCDate(gridStart.getUTCDate() - ((gridStart.getUTCDay() + 6) % 7));
  const calendarDays = Array.from({length: 42}, (_, index) => {
    const day = new Date(gridStart); day.setUTCDate(day.getUTCDate() + index);
    return { date: day.toISOString().slice(0, 10), day: day.getUTCDate(), inMonth: day.getUTCMonth() === calendarFirst.getUTCMonth() };
  });
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(calendarFirst);
  function shiftMonth(amount) {
    const next = new Date(calendarFirst); next.setUTCMonth(next.getUTCMonth() + amount);
    setCalendarMonth(next.toISOString().slice(0, 7)); setDate(''); setSlot(null); setSlotsLoaded(false);
  }
  function moveCalendarFocus(item, key) {
    const delta = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? -7 : key === 'ArrowDown' ? 7 : key === 'Home' ? -((new Date(`${item.date}T00:00:00Z`).getUTCDay() + 6) % 7) : key === 'End' ? 6 - ((new Date(`${item.date}T00:00:00Z`).getUTCDay() + 6) % 7) : 0;
    if (!delta) return;
    const next = new Date(`${item.date}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + delta);
    const nextDate = next.toISOString().slice(0, 10);
    setFocusedCalendarDate(nextDate);
    const nextMonth = nextDate.slice(0, 7);
    if (nextMonth !== calendarMonth) setCalendarMonth(nextMonth);
  }
  function detailsSubmit(event) {
    event.preventDefault();
    const errors = {};
    const parsed = contactSchema.safeParse({ name: name.trim(), email: email.trim() });
    if (!parsed.success) for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'name') errors.name = 'Enter your name (up to 100 characters).';
      if (issue.path[0] === 'email') errors.email = 'Enter a valid email address.';
    }
    setFieldErrors(errors);
    if (!Object.keys(errors).length) { setName(name.trim()); setEmail(email.trim()); setStep(3); }
  }
  async function submit() {
    if (submitting.current) return;
    submitting.current = true; setLoading(true); setError('');
    // Uncertain outcomes must replay the identical body/key, never a new booking.
    if (!snapshot.current) snapshot.current = { serviceId: service, start: slot.start, name, email, key: crypto.randomUUID() };
    try { setResult(await transport('/api/booking/reserve', write('POST', snapshot.current))); }
    catch (error) {
      if (error.status === 400 && error.code === 'BOOKING_CONTACT_INVALID' &&
          Array.isArray(error.fields) && error.fields.length && error.fields.every(field => ['name', 'email'].includes(field))) {
        snapshot.current = null; setResult(null); setStep(2);
        setFieldErrors(Object.fromEntries(error.fields.map(field => [field, field === 'email' ? 'Enter a valid email address. No appointment was created.' : 'Enter your name (up to 100 characters). No appointment was created.'])));
      } else if (error.status === 409) {
        snapshot.current = null; setResult(null); setSlot(null); setStep(1); setRetry(value => value + 1);
        setConflict(true);
      } else setError('We could not confirm the outcome. Keep this page open and check request status using the same request. Do not make another booking.');
    } finally { submitting.current = false; setLoading(false); }
  }
  return <main id="main-content" tabIndex={-1} className="booking-shell">
    <p className="eyebrow">Divaa Beauty · Appointments</p>
    <h1>{result?.status === 'confirmed' && !config?.synthetic ? 'Booking confirmed' : result?.status === 'confirmed' ? 'TEST request received' : result ? 'Request pending' : 'Request an appointment'}</h1>
    {simulation && <p className="notice">QA simulation: in-memory responses only. No database, Calendar or email is contacted.</p>}
    <noscript><p>Online scheduling requires JavaScript. <a href="tel:+18329929422">Call the clinic</a> for help.</p></noscript>
    {(error || Object.keys(fieldErrors).length > 0) && <div className="notice error-notice" role="alert" tabIndex={-1} ref={errorSummary}>
      {error && <p>{error}</p>}
      {Object.entries(fieldErrors).map(([field, message]) => <p key={field}><a href={'#booking-' + field}>{message}</a></p>)}
      {error && !snapshot.current && <button className="secondary" onClick={() => setRetry(value => value + 1)}>Retry</button>}
    </div>}
    {!config ? <section className="surface loading-surface"><h2>{error ? 'Scheduling unavailable' : 'Getting appointment options'}</h2><p role="status">{error ? 'Please retry or call 832-992-9422 for help.' : 'Loading appointment options…'}</p></section> : result ? <section className="surface result-surface">
      <h2 ref={heading} tabIndex={-1}>{result.status === 'confirmed' && !config.synthetic ? 'Booking confirmed' : result.status === 'confirmed' ? 'Test reservation confirmed' : 'Your request is still being checked'}</h2>
      <p>{result.status === 'confirmed' && !config.synthetic ? 'Your reservation is confirmed on the clinic calendar.' : result.status === 'confirmed' ? 'TEST ONLY — this synthetic reservation is not a real appointment.' : 'Calendar processing is still pending. Keep this page open and check request status; do not submit another booking.'}</p>
      {result.status === 'confirmed' && <p><strong>{chosen?.name || 'Appointment'}</strong><br />{when(result.start, config.timezone)}<br />Timezone: {config.timezone}</p>}
      <p className="reference">Reference: {result.reference}</p>{result.status !== 'confirmed' && <p>{when(result.start, config.timezone)}</p>}
      {result.status !== 'confirmed' && <button disabled={loading} onClick={submit}>{loading ? 'Checking request status…' : 'Check request status'}</button>}
      <p><a href="sms:8329929422">Text the clinic</a> with questions about your request.</p><Link href="/">Return home</Link>
    </section> : !config.services.length ? <section className="surface"><h2>No appointments available</h2><p>Online appointment options are unavailable. <a href="tel:+18329929422">Call the clinic</a> for help.</p></section> : <>
      <ol className="progress" aria-label="Booking progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span aria-hidden="true">{index + 1}</span>{label}</li>)}</ol>
      <div className="booking-grid"><section className="surface booking-form">
        <p className="step-label">Step {step + 1} of 4</p>
        <h2 ref={heading} tabIndex={-1}>{['Choose your appointment', 'Find a time', 'Your details', 'Review your appointment'][step]}</h2>
        {step === 0 && <form onSubmit={event => { event.preventDefault(); setStep(1); }}>
          {requestedUnavailable && <p className="notice" role="status">The requested option is unavailable. Please choose an appointment below.</p>}
          <fieldset><legend>Available services</legend><div className="appointment-options">{config.services.map(item => <label className="choice" key={item.id}><input type="radio" name="service" value={item.id} checked={service === item.id} required onChange={() => { setService(item.id); setDate(''); setSlot(null); setRequestedUnavailable(false); }}/><span>{item.name}{!config.synthetic && <small>{item.duration} minutes</small>}{!config.synthetic && item.priceNote && <small>{item.priceNote}</small>}</span></label>)}</div></fieldset>
          <p className="booking-text-help">Not sure which service? <a href="sms:8329929422">Text us</a></p>
          <button disabled={!service}>Choose date and time</button>
        </form>}
        {step === 1 && <form onSubmit={event => { event.preventDefault(); setStep(2); }}>
          <div className="booking-text-help">Not sure which service? <a href="sms:8329929422">Text us</a></div>
          <section className="availability-calendar" aria-label="Appointment availability calendar">
            <div className="calendar-heading"><button className="secondary" type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} disabled={calendarLoading}>‹</button><h3 aria-live="polite">{monthLabel}</h3><button className="secondary" type="button" aria-label="Next month" onClick={() => shiftMonth(1)} disabled={calendarLoading}>›</button></div>
            <p className="calendar-key"><span aria-hidden="true">●</span> Available <span aria-hidden="true">—</span> Unavailable</p>
            <div className="calendar-grid" role="group" aria-label={`${monthLabel}; dates with available times are marked Available`}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, index) => <span className="calendar-weekday" aria-hidden="true" key={day}>{day}</span>)}
              {calendarDays.map(item => {
                const available = availableDates.includes(item.date);
                const selected = date === item.date;
                return <button key={item.date} ref={node => node ? calendarButtons.current.set(item.date,node) : calendarButtons.current.delete(item.date)} type="button" className={`calendar-day${available ? ' is-available' : ''}${selected ? ' is-selected' : ''}${!item.inMonth ? ' outside-month' : ''}`} tabIndex={focusedCalendarDate ? (focusedCalendarDate === item.date ? 0 : -1) : (selected || item.inMonth && item.day === 1 ? 0 : -1)} aria-pressed={selected} aria-label={`${new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(`${item.date}T00:00:00Z`))}, ${available ? 'available' : calendarLoading ? 'checking availability' : 'unavailable'}`} onFocus={() => setFocusedCalendarDate(item.date)} onKeyDown={event => { if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) { event.preventDefault(); moveCalendarFocus(item,event.key); } if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); shiftMonth(event.key === 'PageUp' ? -1 : 1); } }} onClick={() => { if (!available || calendarLoading) return; setDate(item.date); setSlotsLoaded(false); setSlot(null); setError(''); }}>
                  <span>{item.day}</span><small>{available ? 'Available' : '—'}</small>
                </button>;
              })}
            </div>
            <p role="status" aria-live="polite">{calendarLoading ? 'Checking available dates…' : calendarError || (availableDates.length === 0 ? 'No appointment dates are available in this month. Choose another month or text us for help.' : `${availableDates.length} dates have available times.`)}</p>
            {calendarError && <button className="secondary" type="button" onClick={() => setRetry(value => value + 1)}>Retry date check</button>}
          </section>
          {conflict && <p className="notice" role="alert">That time is no longer available. Choose another appointment time.</p>}<p>Clinic timezone: <strong>{config.timezone}</strong></p>
          <p role="status">{loading ? 'Checking available times…' : error ? error : !date ? 'Select an available date to see times.' : slotsLoaded && !slots.length ? 'No appointments are available on this date. Choose another date.' : ''}</p>
          <fieldset><legend>Available times</legend><div className="slot-grid">{slots.map(item => <label className="choice" key={item.start}><input type="radio" name="slot" required checked={slot?.start === item.start} onChange={() => { setSlot(item); setConflict(false); }}/><span>{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: config.timezone }).format(new Date(item.start))}</span></label>)}</div></fieldset>
          <button disabled={!slot || loading}>Continue</button>
        </form>}
        {step === 2 && <form noValidate onSubmit={detailsSubmit}>
          <p>Enter your name and email for this appointment. Please do not include medical information.</p>
          <label htmlFor="booking-name">Name</label><input id="booking-name" autoComplete="name" required maxLength={100} value={name} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? 'name-error' : undefined} onChange={event => setName(event.target.value)}/>
          {fieldErrors.name && <p id="name-error" className="field-error">{fieldErrors.name}</p>}
          <label htmlFor="booking-email">Email</label><input id="booking-email" type="email" autoComplete="email" required maxLength={254} value={email} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'email-error' : undefined} onChange={event => setEmail(event.target.value)}/>
          {fieldErrors.email && <p id="email-error" className="field-error">{fieldErrors.email}</p>}
          <button>Review appointment</button>
        </form>}
        {step === 3 && <section aria-label="Review details">
          <dl className="review-details"><div><dt>Appointment</dt><dd>{chosen.name}{!config.synthetic && <> {chosen.duration} minutes</>}</dd></div><div><dt>When</dt><dd>{when(slot.start, config.timezone)}{!config.synthetic && <><br/>Until {when(slot.end, config.timezone)}</>}</dd></div><div><dt>Your details</dt><dd>{name}<br/>{email}</dd></div><div><dt>Clinic</dt><dd>11777 Katy Fwy, Houston, TX 77079</dd></div></dl>
          <p>Availability is checked again when you send your request. Contact the clinic for appointment policies. No payment is collected here.</p>
          {!snapshot.current && <div className="edit-actions"><button className="secondary" onClick={() => setStep(1)}>Edit time</button><button className="secondary" onClick={() => setStep(2)}>Edit details</button></div>}
          <button disabled={loading} onClick={submit}>{loading ? 'Checking request status…' : snapshot.current ? 'Check request status' : 'Send appointment request'}</button>
          {snapshot.current && <p>Keep this page open until the outcome is known. Checking request status uses the identical request. Reloading will lose this recovery action.</p>}
        </section>}
        {step > 0 && !snapshot.current && <button className="secondary" onClick={() => { setFieldErrors({}); setStep(step - 1); }}>Back</button>}
      </section><aside className="surface summary" aria-label="Appointment summary"><p className="eyebrow">Your selection</p><h2>{chosen?.name || 'Your appointment'}</h2>{chosen && !config.synthetic && <p>{chosen.duration} minutes</p>}<p>{slot ? when(slot.start, config.timezone) : 'Choose a date and time'}</p><p>Timezone: {config.timezone}</p>{step > 0 && !snapshot.current && <button className="secondary" onClick={() => { setFieldErrors({}); setStep(0); }}>Change service</button>}<p>Need help? <a href="tel:+18329929422">Call the clinic</a></p></aside></div>
    </>}
  </main>;
}
