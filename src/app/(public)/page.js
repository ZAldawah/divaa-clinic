import EditorialPortrait from '@/components/EditorialPortrait';
import { services } from '@/lib/services.mjs';
export const metadata = { alternates: { canonical: '/' } };
export default function Home() {
  return <main id="main-content" tabIndex={-1}>
    <section className="home-hero content-width editorial-hero">
      <div className="hero-copy"><p className="eyebrow">Katy, Texas · Divaa Beauty</p><h1>Divaa Beauty<br/><em>Clinic</em></h1><p className="hero-intro">Explore our services and book a consultation.</p><div className="action-row"><a className="button" href="/book?service=consulting">Book a consultation <span aria-hidden="true">↗</span></a><a className="text-link" href="#services">Explore services <span aria-hidden="true">↓</span></a></div></div>
      <EditorialPortrait priority />
    </section>
    <section className="services-section section-space editorial-section" id="services" aria-labelledby="services-heading"><div className="content-width">
      <div className="section-heading"><div><p className="eyebrow">Our services</p><h2 id="services-heading">Explore the possibilities.</h2></div><p>Find a service, or start with a consultation to discuss your questions.</p></div>
      <div className="service-directory"><EditorialPortrait variant="natural" placement="directory" /><div className="service-grid">{services.map(service => <a className="service-card" href={'/' + service.id} key={service.id}><h3>{service.name}</h3><span className="card-action" aria-hidden="true">↗</span></a>)}</div></div>
    </div></section>
    <section className="content-width consultation-section section-space editorial-section"><p className="eyebrow">A place to begin</p><h2>Have questions?<br/><em>Start a conversation.</em></h2><p>Choose Consulting in our appointment options, or contact the clinic.</p><a className="button" href="/book?service=consulting">Book a consultation <span aria-hidden="true">↗</span></a></section>
    <section className="contact-section" id="contact"><div className="content-width contact-grid"><div><p className="eyebrow">Find Divaa</p><h2>Here in Katy.</h2></div><address>Divaa Beauty Clinic<br/>26077 Nelson Way<br/>Katy, TX 77494</address><div><a className="contact-phone" href="tel:+18329929422">832-992-9422</a><a className="text-link" href="sms:8329929422">Text the clinic <span aria-hidden="true">↗</span></a></div></div></section>
  </main>;
}
