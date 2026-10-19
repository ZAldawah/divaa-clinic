import content from '../lib/service-faqs.json';

function Answer({ entry }) {
  if (!entry.link) return entry.answer;
  const [before, after] = entry.answer.split(entry.link.text);
  return <>{before}<a href={content.sources[entry.link.sourceId].url}>{entry.link.text}</a>{after}</>;
}

export default function ServiceFaq({ service }) {
  const entries = content.services[service.id];
  const headingId = `${service.id}-faq-heading`;
  return <section className="service-faq content-width section-space" aria-labelledby={headingId}>
    <div className="faq-intro">
      <p className="eyebrow">Before you decide</p>
      <h2 id={headingId}>{service.name} FAQs</h2>
      <p>General information for your consultation. Individual experiences vary; these answers do not replace a clinician’s assessment or the full treatment safety information.</p>
    </div>
    <div className="faq-answers">
      {entries.map(entry => <article className="faq-answer" key={entry.id} aria-labelledby={`${service.id}-faq-${entry.id}`}>
        <h3 id={`${service.id}-faq-${entry.id}`}>{entry.question}</h3>
        <p><Answer entry={entry} /></p>
        {entry.id === 6 && <a className="text-link" href={`sms:8329929422?body=${encodeURIComponent(`Hi Divaa Beauty Clinic, I’m interested in ${service.name} and have a question.`)}`}>Text us about {service.name} <span aria-hidden="true">↗</span></a>}
      </article>)}
    </div>
  </section>;
}
