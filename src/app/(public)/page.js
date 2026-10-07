import Link from "next/link";
import ServiceTicker from "@/components/ServiceTicker";
import BestSellers from "@/components/BestSellers";
import PopularServices from "@/components/PopularServices";

export default function Home() {
  return (
    <>
      <main>
        {/* ── HERO ─────────────────────────────────────── */}
        <div id="home" className="hero-section">
          <div className="hero">
            <div className="hero-text">
              <h1 className="hero-text-hook">Your Beauty, Our Expertise</h1>
              <p className="hero-text-hook2">Beauty awaits—are you ready to embrace it?</p>
              <p className="hero-text-introduction">
                At Divaa Beauty Clinic, we combine artistic precision with the latest aesthetic
                advancements, delivering personalized treatments that enhance your natural beauty
                and confidence. Recognized as Houston&apos;s top-rated Med Spa, we specialize in
                Botox, Dermal Fillers, Skin Rejuvenation, and so much more. Schedule your
                complimentary consultation today.
              </p>
              <a
                href="/book"
                className="contact-button"
              >
                Book appointment
              </a>
            </div>
          </div>
        </div>

        {/* ── SERVICE TICKER ───────────────────────────── */}
        <div className="ticker-section">
          <p className="ticker-section-label">ALL OUR SERVICES</p>
          <ServiceTicker />
        </div>

        {/* ── BEST SELLERS ─────────────────────────────── */}
        <div className="services-section">
          <div className="container">
            <BestSellers />
          </div>
        </div>

        {/* ── POPULAR SERVICES ─────────────────────────── */}
        <div className="services-section services-section--popular">
          <div className="container">
            <PopularServices />
          </div>
        </div>

      </main>
    </>
  );
}
