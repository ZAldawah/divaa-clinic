import ServiceImage from '@/components/ServiceImage';
import EditorialPortrait from '@/components/EditorialPortrait';
import { services } from '@/lib/services.mjs';
export const metadata = { alternates: { canonical: '/' } };
export default function Home() {
  return <main id="main-content" tabIndex={-1}>
    <section className="home-hero content-width editorial-hero">
      <div className="hero-copy"><p className="eyebrow">Houston, Texas · Divaa Beauty</p><h1>Divaa Beauty<br/><em>Clinic</em></h1><p className="hero-intro">Explore our services. Text us for help booking, understanding your options, or asking a question.</p><div className="action-row"><a className="button" href="sms:8329929422?body=Hi%20Divaa%20Beauty%20Clinic%2C%20I%E2%80%99m%20interested%20in%20booking%20a%20service%20or%20learning%20about%20my%20options.%20Could%20you%20help%20me%3F">Text us <span aria-hidden="true">↗</span></a><a className="text-link" href="#services">Explore services <span aria-hidden="true">↓</span></a></div></div>
      <EditorialPortrait priority />
    </section>
    <section className="services-section section-space editorial-section" id="services" aria-labelledby="services-heading"><div className="content-width">
      <div className="section-heading"><div><p className="eyebrow">Our services</p><h2 id="services-heading">Explore the possibilities.</h2></div><p>Not sure what you need? Text us at <a className="text-link" href="sms:8329929422">832-992-9422</a> for help choosing a service.</p></div>
      <div className="service-directory"><div className="service-grid">{services.map(service => <a className="service-card service-card-image" href={'/' + service.id} key={service.id}><ServiceImage serviceId={service.id} card /><div className="service-card-label"><h3>{service.name}</h3><span className="card-action" aria-hidden="true">↗</span></div></a>)}</div></div>
    </div></section>
    <section className="content-width consultation-section section-space editorial-section"><p className="eyebrow">A place to begin</p><h2>Unsure what you need?<br/><em>Text us.</em></h2><p>Tell us what you’re considering, and we can help you find the right place to start.</p><a className="button" href="sms:8329929422">Text us <span aria-hidden="true">↗</span></a></section>
    <section className="contact-section" id="contact"><div className="content-width contact-grid"><div><p className="eyebrow">Find Divaa</p><h2>Here in Houston.</h2></div><address>Divaa Beauty Clinic<br/>11777 Katy Fwy<br/>Houston, TX 77079</address><div><a className="contact-phone" href="tel:+18329929422">832-992-9422</a><a className="text-link" href="sms:8329929422">Text the clinic <span aria-hidden="true">↗</span></a></div></div></section>
  </main>;
}
