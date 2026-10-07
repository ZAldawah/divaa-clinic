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
  title: "Dermal Fillers (Lip, Cheek, Under-Eye) | Divaa Beauty Clinic Houston",
  description:
    "Enhance your natural beauty with premium hyaluronic acid dermal fillers. Specialized treatments for lips, cheeks, and under-eyes in Katy & Houston, TX.",
  keywords: [
    "dermal fillers",
    "lip filler Houston",
    "cheek filler Katy TX",
    "under-eye filler",
    "tear trough filler",
    "hyaluronic acid filler",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "Dermal Fillers | Divaa Beauty Clinic",
    description: "Enhance your natural beauty with premium hyaluronic acid dermal fillers for lips, cheeks, and under-eyes.",
    url: "https://divaabeautyclinic.com/filler",
    type: "website",
  },
};

const faqs = [
  {
    q: "Are dermal filler injections painful?",
    a: "Most clients experience minimal discomfort. Our premium fillers contain lidocaine (a built-in anesthetic), and we also apply a high-potency topical numbing cream prior to treatment to ensure your utmost comfort.",
  },
  {
    q: "When will I see results?",
    a: "Results are visible immediately after your treatment! You will notice instant volume and contouring, though full integration and softening of the filler typically takes about 2 weeks as any initial swelling subsides.",
  },
  {
    q: "How long do dermal fillers last?",
    a: "The longevity depends on the treatment area and your body's metabolism. Generally, lip fillers last 6–9 months, under-eye (tear trough) fillers last 9–12 months, and structural cheek fillers can last 12–18 months.",
  },
  {
    q: "What is the difference between Lip, Cheek, and Under-Eye filler?",
    a: "We use different formulations of hyaluronic acid depending on the area. Lips require a softer, more flexible filler for natural movement. Cheeks require a robust, structural filler to lift and contour. Under-eyes require a very fine, lightweight filler to smoothly correct hollowness.",
  },
  {
    q: "What is the recovery or downtime after treatment?",
    a: "Downtime is minimal. You may experience mild swelling, redness, or bruising for 3–5 days. We recommend avoiding strenuous exercise, excessive heat, and alcohol for 24-48 hours post-treatment to minimize swelling.",
  },
];

const benefits = [
  { icon: "✦", label: "Immediate volume and natural enhancement" },
  { icon: "✦", label: "Plumps and defines lips for a perfect pout" },
  { icon: "✦", label: "Restores mid-face volume and lifts cheeks" },
  { icon: "✦", label: "Erases under-eye shadows and hollowness" },
  { icon: "✦", label: "Hydrates tissue from within using Hyaluronic Acid" },
  { icon: "✦", label: "Fully reversible and highly customizable" },
];

const stats = [
  { value: "45 min", label: "Appointment time" },
  { value: "Instant", label: "Visible results" },
  { value: "6–18 mo", label: "Lasting duration" },
  { value: "3–5 days", label: "Recovery time" },
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
          style={{ backgroundImage: "url(/pictures/lip-filler.JPG)" }}
        />
        <div className="clg-hero-content">
          <span className="clg-eyebrow">HYALURONIC ACID ENHANCEMENT</span>
          <h1 className="clg-hero-title">
            Dermal Fillers <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($400)</span>
          </h1>
          <p className="clg-hero-sub">
            Restore lost volume, enhance facial contours, and plump lips with premium 
            hyaluronic acid fillers tailored exactly to your unique facial structure.
          </p>
          <a
            href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Dermal%20Filler%20services%20at%20Divaa"
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
          <h2 className="clg-section-title">Artistic Volume Restoration</h2>
          <p className="clg-body">
            Dermal fillers are gel-like substances injected beneath the skin to restore lost 
            volume, smooth lines, and enhance facial contours. We utilize premium hyaluronic acid 
            (HA) formulations, a naturally occurring substance in the body that helps keep skin 
            plump and hydrated.
          </p>
          <p className="clg-body">
            Whether you desire the perfect pout with <strong>Lip Filler</strong>, structural lift 
            and definition with <strong>Cheek Filler</strong>, or a refreshed, awakened look by 
            erasing dark circles with <strong>Under-Eye Filler</strong> — our master injectors 
            approach every treatment with artistic precision to ensure results that are striking, 
            yet completely natural.
          </p>
        </div>
        <div className="clg-about-img-wrap">
          <img
            src="/pictures/cheek-filler.JPG"
            alt="Dermal Filler treatment at Divaa Beauty Clinic"
            className="clg-about-img"
          />
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────────── */}
      <section className="clg-benefits">
        <p className="clg-section-tag">CLINICAL INDICATIONS</p>
        <h2 className="clg-section-title">What It Treats</h2>
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
        <h2 className="clg-bottom-cta-title">Ready to refine your features?</h2>
        <p className="clg-bottom-cta-sub">
          Schedule your complimentary consultation today and let our experts
          design a tailored filler plan for your aesthetic goals.
        </p>
        <a
          href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Dermal%20Filler%20services%20at%20Divaa"
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
