 'use client';
import { useState } from 'react';
import BookingFlow from './BookingFlow';
import { createQaTransport, scenarios } from '@/lib/booking/qa-transport.mjs';
function Run({ scenario }) {
  const [evidence, setEvidence] = useState({ ledger: [], simulatedReservations: 0, realServiceCalls: 0 });
  const [transport] = useState(() => createQaTransport(scenario, setEvidence));
  return <><BookingFlow transport={transport} simulation /><section className="booking-shell" aria-label="Simulation request ledger">
    <h2>In-memory request/key ledger</h2><p>Simulated reservations: {evidence.simulatedReservations}. Reservation/Calendar service calls: {evidence.realServiceCalls}. These are simulation counters, not database evidence.</p>
    <p>Only synthetic names and example.test emails. Request bodies stay in this tab and clear on reset/reload.</p>
    <ol>{evidence.ledger.map(row => <li key={row.attempt}><p>Attempt {row.attempt}: {row.simulatedOutcome}</p><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{row.body}</pre></li>)}</ol>
  </section></>;
}
export default function BookingQa() {
  const [scenario, setScenario] = useState('confirmed'), [run, setRun] = useState(0);
  return <><section className="booking-shell" aria-label="Local QA controls">
    <h2>SIMULATION ONLY — booking UI validation</h2>
    <p>No real appointment, database write, Calendar request or email. Responses are deterministic in-memory simulations, not end-to-end server proof. Normal booking remains at /book.</p>
    <label htmlFor="qa-scenario">Scenario (changing resets the flow)</label>
    <select id="qa-scenario" value={scenario} onChange={event => { setScenario(event.target.value); setRun(value => value + 1); }}>{Object.entries(scenarios).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
    <button onClick={() => setRun(value => value + 1)}>Reset simulation and ledger</button>
    <p>Select October 10, 2026 with the native date picker. Use Synthetic QA and synthetic@example.test. The contact scenario deliberately rejects the first valid contact to exercise authoritative-rejection UI; it does not bypass validation.</p>
  </section><Run key={run} scenario={scenario} /></>;
}
