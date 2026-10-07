'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
export async function api(url,options) {
  const response=await fetch(url,{cache:'no-store',...options});
  const data=await response.json();if(!response.ok) throw Object.assign(new Error(data.error || data.message || 'Please try again.'),{status:response.status});return data;
}
export const write=(method,value)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
export function when(value,zone) {return new Intl.DateTimeFormat('en-US',{dateStyle:'full',timeStyle:'long',timeZone:zone}).format(new Date(value));}
export default function BookingFlow() {
  const [config,setConfig]=useState(null),[service,setService]=useState(''),[date,setDate]=useState(''),[slots,setSlots]=useState([]),[slot,setSlot]=useState(null);
  const [step,setStep]=useState(0),[name,setName]=useState(''),[email,setEmail]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false),[result,setResult]=useState(null),[retry,setRetry]=useState(0);
  const key=useRef(null),snapshot=useRef(null),heading=useRef(null);
  useEffect(()=>{let current=true;api('/api/booking/config').then(v=>{if(current){setConfig(v);const requested=new URLSearchParams(window.location.search).get('service');if(v.services.some(s=>s.id===requested))setService(requested);}}).catch(e=>{if(current)setError(e.message);});return()=>{current=false;};},[retry]);
  useEffect(()=>{
    if(!date || !service)return;
    const controller=new AbortController();setLoading(true);setSlots([]);setSlot(null);setError('');
    api(`/api/booking/slots?date=${date}&service=${encodeURIComponent(service)}`,{signal:controller.signal}).then(v=>setSlots(v.slots)).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[date,service,retry]);
  useEffect(()=>{heading.current?.focus();},[step,result]);
  const chosen=config?.services.find(s=>s.id===service);
  async function submit() {
    setLoading(true);setError('');
    // After an unknown network outcome, retain exact body/key; never create a second booking.
    if(!snapshot.current) {key.current=crypto.randomUUID();snapshot.current={serviceId:service,start:slot.start,name,email,key:key.current};}
    try {const v=await api('/api/booking/reserve',write('POST',snapshot.current));setResult(v);}
    catch(e) {setError(e.message);if(e.status===409){snapshot.current=null;setSlot(null);setStep(1);setRetry(v=>v+1);} /* Unknown outcomes preserve the same request. */}
    finally{setLoading(false);}
  }
  return <main className="booking-shell">
    <p className="eyebrow">DIVAA BEAUTY · APPOINTMENTS</p>
    <h1 ref={heading} tabIndex={-1}>{result?.status==='confirmed'?'Appointment confirmed':result?'Confirmation pending':'Book an appointment'}</h1>
    {config?.synthetic && <p className="notice">Synthetic preview. No real appointment or email will be created.</p>}
    <noscript><p>Online scheduling requires JavaScript. <a href="sms:8329929422">Text the clinic</a> to request an appointment.</p></noscript>
    {error && <div className="notice" role="alert"><p>{error}</p>{!snapshot.current && <button onClick={()=>setRetry(v=>v+1)}>Retry</button>}</div>}
    {!config?<p role="status">{error?'Scheduling is unavailable.':'Loading appointment options…'}</p>:result?<section className="surface">
      <p>{result.status==='confirmed'?'Your time is reserved. No confirmation email is sent by this preview.':'We have not confirmed your appointment. Keep this reference and check again using the same request. Do not make another booking.'}</p>
      <p className="reference">Reference: {result.reference}</p><p>{when(result.start,config.timezone)}</p>
      {result.status!=='confirmed' && <button disabled={loading} onClick={submit}>Check confirmation</button>}
      <p><a href="sms:8329929422">Text the clinic</a> to change, cancel or ask about your request.</p><Link href="/">Return home</Link>
    </section>:<>
      <ol className="progress" aria-label="Booking progress">{['Service','Date and time','Your details','Review'].map((v,i)=><li key={v} aria-current={step===i?'step':undefined}>{i+1}. {v}</li>)}</ol>
      <div className="booking-grid"><section className="surface">
        {step===0 && <form onSubmit={e=>{e.preventDefault();setStep(1);}}><h2>Choose your appointment</h2><fieldset><legend>Available services</legend>{config.services.map(s=><label className="choice" key={s.id}><input type="radio" name="service" value={s.id} checked={service===s.id} required onChange={()=>{setService(s.id);setSlot(null);}}/><span>{s.name}<small>{s.duration} minutes</small></span></label>)}</fieldset><button disabled={!service}>Choose date and time</button></form>}
        {step===1 && <form onSubmit={e=>{e.preventDefault();setStep(2);}}><h2>Find a time</h2><label>Date<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label><p>Times are in clinic time: <strong>{config.timezone}</strong>. Buffers and booking rules are included in availability.</p><div role="status">{loading?'Checking available times…':date && !slots.length && !error?'No appointments on this date. Choose another date.':''}</div><fieldset><legend>Available times</legend><div className="slot-grid">{slots.map(s=><label className="choice" key={s.start}><input type="radio" name="slot" required checked={slot?.start===s.start} onChange={()=>setSlot(s)}/><span>{new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZoneName:'short',timeZone:config.timezone}).format(new Date(s.start))}</span></label>)}</div></fieldset><button disabled={!slot || loading}>Continue</button></form>}
        {step===2 && <form onSubmit={e=>{e.preventDefault();setStep(3);}}><h2>Your details</h2><p>We use your name and email to manage your appointment. Please do not include medical information.</p><label>Name<input autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label><button>Review appointment</button></form>}
        {step===3 && <section><h2>Review your appointment</h2><p>{chosen.name} · {chosen.duration} minutes</p><p>{when(slot.start,config.timezone)}</p><p>Until {when(slot.end,config.timezone)}</p><p>{name}<br/>{email}</p><p>26077 Nelson Way, Katy, TX 77494</p><p>Your time is checked again when you confirm. Contact the clinic for appointment policies. This flow does not collect payment.</p><button disabled={loading} onClick={submit}>{loading?'Confirming your appointment…':snapshot.current?'Retry same request':'Confirm appointment'}</button>{snapshot.current && <p>Keep this page open until the outcome is known. Retrying uses the same request.</p>}</section>}
        {step>0 && !snapshot.current && <button className="secondary" onClick={()=>setStep(step-1)}>Back</button>}
      </section><aside className="surface summary"><h2>Your appointment</h2><p>{chosen?.name || 'Choose a service'}</p>{chosen && <p>{chosen.duration} minutes</p>}<p>{slot?when(slot.start,config.timezone):'Choose a date and time'}</p><p>Clinic timezone: {config.timezone}</p><p>Need help? <a href="sms:8329929422">Text the clinic</a></p></aside></div>
    </>}
  </main>;
}
