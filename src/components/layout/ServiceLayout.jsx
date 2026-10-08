import { services } from '@/lib/services.mjs';
export default function ServiceLayout({ serviceId }) {
  const service = services.find(item => item.id === serviceId);
  return <main id="main-content" tabIndex={-1}>
    <div className="content-width"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#services">Services</a><span aria-hidden="true">/</span><span aria-current="page">{service.name}</span></nav></div>
    <section className="service-hero content-width"><div><p className="eyebrow">Divaa Beauty Clinic · Katy</p><h1>{service.name}</h1><p className="hero-intro">Explore {service.name} at Divaa Beauty Clinic. Book a consultation to discuss your questions.</p><a href="/book?service=consulting" className="button">Book a consultation <span aria-hidden="true">↗</span></a></div><div className="service-mark" aria-hidden="true"><span>{String(services.indexOf(service) + 1).padStart(2, '0')}</span><p>DIVAA<br/>BEAUTY</p></div></section>
    <section className="service-next"><div className="content-width service-next-grid"><div><p className="eyebrow">Your next step</p><h2>Let’s talk about<br/><em>your questions.</em></h2></div><div><p>Start with a consultation, explore our other services, or contact the clinic directly.</p><div className="action-row"><a className="button" href="/book?service=consulting">Book a consultation <span aria-hidden="true">↗</span></a><a className="text-link" href="tel:+18329929422">Call the clinic</a></div></div></div></section>
    <section className="content-width section-space"><div className="section-heading"><h2>Keep exploring.</h2><a className="text-link" href="/#services">All services <span aria-hidden="true">↗</span></a></div><nav className="related-services" aria-label="Other services">{services.filter(item => item.id !== serviceId).map(item => <a href={'/' + item.id} key={item.id}>{item.name}<span aria-hidden="true">↗</span></a>)}</nav></section>
  </main>;
}
