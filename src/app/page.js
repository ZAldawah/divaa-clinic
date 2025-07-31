import Image from "next/image";
import Link from "next/link";
const services = [
  {
    href: "/botox",
    className: "service-botox",
    title: "Botox and Dysport",
    desc: "Effective wrinkle reduction and youthful skin enhancement.",
  },
  {
    href: "/lip-filler",
    className: "service-filler-lips",
    title: "Lip Filler",
    desc: "Enhance volume and contour for fuller, natural-looking lips.",
  },
  {
    href: "/cheek-filler",
    className: "service-filler-cheeks",
    title: "Cheek Filler",
    desc: "Restore youthful definition and lift through subtle cheek enhancement.",
  },
  {
    href: "/undereye-filler",
    className: "service-filler-under-eye",
    title: "Under-Eye Filler",
    desc: "Reduce hollowness and dark circles for a refreshed look.",
  },
  {
    href: "/radiesse",
    className: "service-radiesse",
    title: "Radiesse",
    desc: "Hydrating injectable treatment for overall skin glow.",
  },
  {
    href: "/sculptra",
    className: "service-sculptra",
    title: "Sculptra",
    desc: "Deep revitalization and skin elasticity improvement.",
  },
  {
    href: "/prp",
    className: "service-prptreatment",
    title: "PRP Treatment",
    desc: "Stimulates skin regeneration and collagen production using your own plasma.",
  },
  {
    href: "/rrf",
    className: "service-rrf",
    title: "Radiofrequency Facial",
    desc: "Tighten and rejuvenate skin using advanced RF technology.",
  },
  {
    href: "/facials",
    className: "service-facials",
    title: "Facials",
    desc: "Product Use",
  },
  {
    href: "/hydrofacial",
    className: "service-hydrofacial",
    title: "Hydrofacial",
    desc: "Deep cleansing, exfoliation, and hydration for radiant skin.",
  },
  {
    href: "/microneedling",
    className: "service-microneedling",
    title: "Microneedling",
    desc: "Product Use",
  },
];
export default function Home() {
  return (
    <>
      <main>
        <div id="home" className="hero-section">
          <div className="hero">
            <div className="hero-text">
              <h1 className="hero-text-hook">Your Beauty, Our Expertise</h1>
              <p className="hero-text-hook2">
                Beauty awaits-are you ready to embrace it?
              </p>
              <p className="hero-text-introduction">
                At Divaa Beauty Clinic, we combine artistic precision with the
                latest aesthetic advancements, delivering personalized
                treatments that enhance your natural beauty and confidence.
                Recognized as Houston&apos;s top-rated Med Spa, we specialize in
                Botox, Dermal Fillers, Skin Rejuvenation, and so much more. We
                ensure every experience is tailored uniquely for you—because
                exceptional care should never be a luxury. Schedule your
                complimentary consultation today, and take the first step toward
                revealing your most radiant self.
              </p>
              <a
                href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Botox%20services%20at%20Divaa"
                className="contact-button"
              >
                CONSULT NOW: (832) 992-9422
              </a>
            </div>
          </div>
        </div>
        <div className="services-section">
          <div className="container">
            <div className="services">
              <h2 className="section-title">Our Services</h2>
              <div className="service-list">
                {services.map(({ href, className, title, desc }) => (
                  <Link key={href} href={href} className="service-link">
                    <div className={`service-item ${className}`}>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
