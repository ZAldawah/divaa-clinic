import ServiceImage, { hasServiceImage } from '../ServiceImage';
import EditorialPortrait from '../EditorialPortrait';
import { services } from '@/lib/services.mjs';
import ServiceFaq from '../ServiceFaq';
export default function ServiceLayout({ serviceId }) {
  const service = services.find(item => item.id === serviceId);
  return <main id="main-content" tabIndex={-1}>
    <div className="content-width"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#services">Services</a><span aria-hidden="true">/</span><span aria-current="page">{service.name}</span></nav></div>
    <section className="service-hero content-width editorial-hero"><div><p className="eyebrow">Divaa Beauty Clinic · Houston</p><h1>{service.name}</h1><p className="hero-intro">Explore {service.name} at Divaa Beauty Clinic.</p><a href="sms:8329929606" className="button">Text us <span aria-hidden="true">↗</span></a></div>{hasServiceImage(serviceId) ? <ServiceImage serviceId={serviceId} /> : <EditorialPortrait placement="detail" priority />}</section>
    <ServiceFaq service={service} />
    <section className="service-next"><div className="content-width service-next-grid"><div><p className="eyebrow">Your next step</p><h2>Unsure what you need?<br/><em>Text us.</em></h2></div><div><p>Text us with your questions about {service.name}.</p><div className="action-row"><a className="button" href="sms:8329929606">Text us <span aria-hidden="true">↗</span></a><a className="text-link" href="tel:+18329929606">Call the clinic</a></div></div></div></section>
    <section className="content-width section-space"><div className="section-heading"><h2>Keep exploring.</h2><a className="text-link" href="/#services">All services <span aria-hidden="true">↗</span></a></div><nav className="related-services" aria-label="Other services">{services.filter(item => item.id !== serviceId).map(item => <a href={'/' + item.id} key={item.id}>{item.name}<span aria-hidden="true">↗</span></a>)}</nav></section>
  </main>;
}
