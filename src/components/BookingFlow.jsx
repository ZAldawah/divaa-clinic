'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
export async function api(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || data.message || 'Please try again.'), { status: response.status });
  return data;
}
export const write = (method, value) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
export function when(value, zone) { return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: zone }).format(new Date(value)); }
const steps = ['Service', 'Date and time', 'Your details', 'Review'];
export default function BookingFlow() {
  const [config, setConfig] = useState(null), [service, setService] = useState(''), [date, setDate] = useState('');
  const [slots, setSlots] = useState([]), [slot, setSlot] = useState(null), [step, setStep] = useState(0);
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [error, setError] = useState('');
  const [loading, setLoading] = useState(false), [result, setResult] = useState(null), [retry, setRetry] = useState(0);
  const [requestedUnavailable, setRequestedUnavailable] = useState(false), [fieldErrors, setFieldErrors] = useState({});
  const [slotsLoaded, setSlotsLoaded] = useState(false), [conflict, setConflict] = useState(false);
  const snapshot = useRef(null), heading = useRef(null), errorSummary = useRef(null), submitting = useRef(false);
  useEffect(() => {
    if (config) return;
    let current = true;
    api('/api/booking/config').then(value => {
      if (!current) return;
      setConfig(value); setError('');
      const requested = new URLSearchParams(window.location.search).get('service');
      if (value.services.some(item => item.id === requested)) setService(requested);
      else if (requested) setRequestedUnavailable(true);
    }).catch(() => { if (current) setError('We could not load appointment options. Try again or contact the clinic.'); });
    return () => { current = false; };
  }, [retry, config]);
  useEffect(() => {
    if (!date || !service) return;
    const controller = new AbortController();
    setLoading(true); setSlotsLoaded(false); setSlots([]); setSlot(null); setError('');
    api('/api/booking/slots?date=' + encodeURIComponent(date) + '&service=' + encodeURIComponent(service), { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) { setSlots(value.slots); setSlotsLoaded(true); } })
      .catch(error => { if (!controller.signal.aborted && error.name !== 'AbortError') setError('We could not load appointment times. Try again or choose another date.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [date, service, retry]);
  useEffect(() => { heading.current?.focus(); }, [step, result]);
  useEffect(() => { if (error || Object.keys(fieldErrors).length) errorSummary.current?.focus(); }, [error, fieldErrors]);
  const chosen = config?.services.find(item => item.id === service);
  function detailsSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!name.trim()) errors.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
    setFieldErrors(errors);
    if (!Object.keys(errors).length) { setName(name.trim()); setEmail(email.trim()); setStep(3); }
  }
  async function submit() {
    if (submitting.current) return;
    submitting.current = true; setLoading(true); setError('');
    // Uncertain outcomes must replay the identical body/key, never a new booking.
    if (!snapshot.current) snapshot.current = { serviceId: service, start: slot.start, name, email, key: crypto.randomUUID() };
    try { setResult(await api('/api/booking/reserve', write('POST', snapshot.current))); }
    catch (error) {
      if (error.status === 409) {
        snapshot.current = null; setResult(null); setSlot(null); setStep(1); setRetry(value => value + 1);
        setConflict(true);
      } else setError('We could not confirm the outcome. Keep this page open and check confirmation using the same request. Do not make another booking.');
    } finally { submitting.current = false; setLoading(false); }
  }
  return <main id="main-content" tabIndex={-1} className="booking-shell">
    <p className="eyebrow">Divaa Beauty · Appointments</p>
    <h1>{result?.status === 'confirmed' ? (config?.synthetic ? 'Test appointment confirmed' : 'Appointment confirmed') : result ? 'Confirmation pending' : 'Book an appointment'}</h1>
    {config?.synthetic && <details className="test-disclosure"><summary>Test booking · no real appointment or email</summary><p>This local preview uses a synthetic database and mock calendar. Saturday 10am–4pm, America/Chicago, is for testing only. Displayed durations are test slot lengths, not approved clinic durations. No payment is collected.</p></details>}
    <noscript><p>Online scheduling requires JavaScript. <a href="tel:+18329929422">Call the clinic</a> for help.</p></noscript>
    {(error || Object.keys(fieldErrors).length > 0) && <div className="notice error-notice" role="alert" tabIndex={-1} ref={errorSummary}>
      {error && <p>{error}</p>}
      {Object.entries(fieldErrors).map(([field, message]) => <p key={field}><a href={'#booking-' + field}>{message}</a></p>)}
      {error && !snapshot.current && <button className="secondary" onClick={() => setRetry(value => value + 1)}>Retry</button>}
    </div>}
    {!config ? <section className="surface loading-surface"><h2>{error ? 'Scheduling unavailable' : 'Getting appointment options'}</h2><p role="status">{error ? 'Please retry or call 832-992-9422 for help.' : 'Loading appointment options…'}</p></section> : result ? <section className="surface result-surface">
      <h2 ref={heading} tabIndex={-1}>{result.status === 'confirmed' ? 'Your booking details' : 'Your appointment is not confirmed yet'}</h2>
      <p>{result.status === 'confirmed' ? (config.synthetic ? 'Test appointment confirmed. No real appointment or email was created.' : 'Your time is reserved.') : 'Keep this page open and check confirmation. Do not submit a new booking.'}</p>
      <p className="reference">Reference: {result.reference}</p><p>{when(result.start, config.timezone)}</p>
      {result.status !== 'confirmed' && <button disabled={loading} onClick={submit}>{loading ? 'Checking confirmation…' : 'Check confirmation'}</button>}
      <p><a href="sms:8329929422">Text the clinic</a> with questions about your request.</p><Link href="/">Return home</Link>
    </section> : !config.services.length ? <section className="surface"><h2>No appointments available</h2><p>Online appointment options are unavailable. <a href="tel:+18329929422">Call the clinic</a> for help.</p></section> : <>
      <ol className="progress" aria-label="Booking progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span aria-hidden="true">{index + 1}</span>{label}</li>)}</ol>
      <div className="booking-grid"><section className="surface booking-form">
        <p className="step-label">Step {step + 1} of 4</p>
        <h2 ref={heading} tabIndex={-1}>{['Choose your appointment', 'Find a time', 'Your details', 'Review your appointment'][step]}</h2>
        {step === 0 && <form onSubmit={event => { event.preventDefault(); setStep(1); }}>
          {requestedUnavailable && <p className="notice" role="status">The requested option is unavailable. Please choose an appointment below.</p>}
          <fieldset><legend>Available services</legend><div className="appointment-options">{config.services.map(item => <label className="choice" key={item.id}><input type="radio" name="service" value={item.id} checked={service === item.id} required onChange={() => { setService(item.id); setSlot(null); setRequestedUnavailable(false); }}/><span>{item.name}<small>{config.synthetic ? 'Test slot: ' : ''}{item.duration} minutes</small>{!config.synthetic && item.priceNote && <small>{item.priceNote}</small>}</span></label>)}</div></fieldset>
          <button disabled={!service}>Choose date and time</button>
        </form>}
        {step === 1 && <form onSubmit={event => { event.preventDefault(); setStep(2); }}>
          <label htmlFor="booking-date">Date</label><input id="booking-date" type="date" required value={date} onChange={event => { setDate(event.target.value); setSlotsLoaded(false); setSlot(null); }}/>
          {conflict && <p className="notice" role="alert">That time is no longer available. Choose another appointment time.</p>}<p>Clinic timezone: <strong>{config.timezone}</strong></p>
          <p role="status">{loading ? 'Checking available times…' : date && slotsLoaded && !slots.length && !error ? 'No appointments are available on this date. Choose another date.' : ''}</p>
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
          <dl className="review-details"><div><dt>Appointment</dt><dd>{chosen.name} · {config.synthetic ? 'test slot: ' : ''}{chosen.duration} minutes</dd></div><div><dt>When</dt><dd>{when(slot.start, config.timezone)}<br/>Until {when(slot.end, config.timezone)}</dd></div><div><dt>Your details</dt><dd>{name}<br/>{email}</dd></div><div><dt>Clinic</dt><dd>26077 Nelson Way, Katy, TX 77494</dd></div></dl>
          <p>Your time is checked again when you confirm. Contact the clinic for appointment policies. No payment is collected here.</p>
          {!snapshot.current && <div className="edit-actions"><button className="secondary" onClick={() => setStep(1)}>Edit time</button><button className="secondary" onClick={() => setStep(2)}>Edit details</button></div>}
          <button disabled={loading} onClick={submit}>{loading ? 'Checking confirmation…' : snapshot.current ? 'Check confirmation' : config.synthetic ? 'Confirm test appointment' : 'Confirm appointment'}</button>
          {snapshot.current && <p>Keep this page open until the outcome is known. Checking confirmation uses the identical request. Reloading will lose this recovery action.</p>}
        </section>}
        {step > 0 && !snapshot.current && <button className="secondary" onClick={() => { setFieldErrors({}); setStep(step - 1); }}>Back</button>}
      </section><aside className="surface summary" aria-label="Appointment summary"><p className="eyebrow">Your selection</p><h2>{chosen?.name || 'Your appointment'}</h2>{chosen && <p>{config.synthetic ? 'Test slot: ' : ''}{chosen.duration} minutes</p>}<p>{slot ? when(slot.start, config.timezone) : 'Choose a date and time'}</p><p>Timezone: {config.timezone}</p>{step > 0 && !snapshot.current && <button className="secondary" onClick={() => { setFieldErrors({}); setStep(0); }}>Change service</button>}<p>Need help? <a href="tel:+18329929422">Call the clinic</a></p></aside></div>
    </>}
  </main>;
}
