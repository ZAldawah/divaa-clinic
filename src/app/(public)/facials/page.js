import { Cormorant_Garamond, Inter } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--clg-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--clg-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Facials & Hydrofacials | Divaa Beauty Clinic Houston",
  description:
    "Rejuvenate your skin with our signature customized facials and deeply exfoliating Hydrofacials. Achieve a radiant, healthy glow in Katy & Houston, TX.",
  keywords: [
    "facials Houston",
    "hydrofacial Katy TX",
    "deep cleansing facial",
    "exfoliating facial",
    "skin rejuvenation",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "Facials & Hydrofacials | Divaa Beauty Clinic",
    description: "Rejuvenate your complexion with deeply hydrating and exfoliating facials tailored to your unique skin.",
    url: "https://divaabeautyclinic.com/facials",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is a Hydrofacial?",
    a: "A Hydrofacial is a multi-step treatment that uses patented technology to cleanse, exfoliate, extract, and treat the skin. It clears dead skin cells, loosens pores, and preps them for extraction using a mix of glycolic acid, salicylic acid, and botanical extracts.",
  },
  {
    q: "How often should I get a facial or Hydrofacial?",
    a: "For optimal skin health, we recommend a professional facial every 4 to 6 weeks. This aligns with your skin's natural regeneration cycle, keeping it consistently clear, hydrated, and glowing.",
  },
  {
    q: "Are your facials customized?",
    a: "Yes! Every facial at Divaa Beauty Clinic begins with a thorough skin analysis. We customize the products, serums, and techniques used to address your specific concerns, whether that's acne, dryness, aging, or hyperpigmentation.",
  },
  {
    q: "Is there any downtime after a facial?",
    a: "No! Facials and Hydrofacials are zero-downtime procedures. You may experience a slight, healthy flush immediately after treatment due to increased circulation, but you will leave the clinic with a radiant, glowing complexion ready for any event.",
  },
];

const benefits = [
  { icon: "✦", label: "Deeply cleanses and minimizes congested pores" },
  { icon: "✦", label: "Exfoliates dead skin cells for a brighter complexion" },
  { icon: "✦", label: "Infuses skin with intensive hydration and antioxidants" },
  { icon: "✦", label: "Improves skin texture, tone, and elasticity" },
  { icon: "✦", label: "Customizable for acne, aging, or sensitivity" },
  { icon: "✦", label: "Instant, radiant glow with zero downtime" },
];

const stats = [
  { value: "45–60 min", label: "Treatment time" },
  { value: "Instant", label: "Visible glow" },
  { value: "4–6 wks", label: "Between sessions" },
  { value: "None", label: "Recovery time" },
];

const Page = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className={`clg-root ${cormorant.variable} ${inter.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="clg-hero">
        <div className="clg-hero-overlay" />
        <div 
          className="clg-hero-img" 
          style={{ backgroundImage: "url(/pictures/hydrofacial.png)", backgroundPosition: "center 20%" }}
        />
        <div className="clg-hero-content">
          <span className="clg-eyebrow">DEEP CLEANSING & EXFOLIATION</span>
          <h1 className="clg-hero-title">
            Facials &amp; Hydrofacials <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($150)</span>
          </h1>
          <p className="clg-hero-sub">
            Revitalize your complexion with our signature treatments. From deeply 
            hydrating bespoke facials to advanced Hydrofacial exfoliation, achieve 
            the radiant, healthy skin you deserve.
          </p>
          <a
            href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Facial%20services%20at%20Divaa"
            className="clg-cta"
          >
            Book a Consultation
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── STAT STRIP ───────────────────────────────────────────────── */}
      <section className="clg-stats">
        {stats.map((s) => (
          <div key={s.label} className="clg-stat">
            <span className="clg-stat-value">{s.value}</span>
            <span className="clg-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── DESCRIPTION ──────────────────────────────────────────────── */}
      <section className="clg-about">
        <div className="clg-about-text">
          <p className="clg-section-tag">WHAT IS IT?</p>
          <h2 className="clg-section-title">The Foundation of Radiant Skin</h2>
          <p className="clg-body">
            A great skincare routine starts in the clinic. Our signature <strong>Facials</strong> are 
            fully tailored to your unique skin type, combining clinical-grade products with expert 
            techniques to treat acne, hyperpigmentation, dullness, or dehydration.
          </p>
          <p className="clg-body">
            For a more advanced resurfacing experience, our <strong>Hydrofacial</strong> uses patented 
            vortex technology to simultaneously extract impurities from your pores while bathing the 
            newly exfoliated skin in intensive hydrating serums. It is the ultimate treatment for an 
            instant, red-carpet-ready glow with absolutely zero downtime.
          </p>
        </div>
        <div className="clg-about-img-wrap">
          <img
            src="/pictures/facial-image1.jpg"
            alt="Facial treatment at Divaa Beauty Clinic"
            className="clg-about-img"
          />
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────────── */}
      <section className="clg-benefits">
        <p className="clg-section-tag">CLINICAL INDICATIONS</p>
        <h2 className="clg-section-title">Why You Need It</h2>
        <div className="clg-benefits-grid">
          {benefits.map((b) => (
            <div key={b.label} className="clg-benefit-card">
              <span className="clg-benefit-icon">{b.icon}</span>
              <span className="clg-benefit-label">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="clg-faq">
        <div className="clg-faq-header">
          <p className="clg-section-tag">COMMON QUESTIONS</p>
          <h2 className="clg-section-title">Frequently Asked</h2>
        </div>
        <div className="clg-faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="clg-faq-item">
              <summary className="clg-faq-summary">
                <span>{f.q}</span>
                <span className="clg-faq-icon">+</span>
              </summary>
              <p className="clg-faq-answer">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section className="clg-bottom-cta">
        <h2 className="clg-bottom-cta-title">Ready for your glow?</h2>
        <p className="clg-bottom-cta-sub">
          Schedule your complimentary consultation today and let our estheticians
          curate the perfect facial experience for your skin.
        </p>
        <a
          href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Facial%20services%20at%20Divaa"
          className="clg-cta clg-cta--dark"
        >
          CONSULT NOW: (832) 992-9422
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </section>
    </main>
  );
};

export default Page;