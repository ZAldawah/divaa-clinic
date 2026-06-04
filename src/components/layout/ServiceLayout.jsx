import { Cormorant_Garamond, Inter } from "next/font/google";
import Image from "next/image";

const cormorant = Cormorant_Garamond({
  variable: "--clg-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--clg-sans",
  subsets: ["latin"],
});

export default function ServiceLayout({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroBgPosition = "center",
  smsBody,
  stats,
  aboutTitle,
  aboutBody,
  aboutImage,
  benefits,
  faqs,
  ctaTitle,
  ctaSub,
  faqSchema,
}) {
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
          style={{ backgroundImage: `url(${heroImage})`, backgroundPosition: heroBgPosition }}
        />
        <div className="clg-hero-content">
          <span className="clg-eyebrow">{eyebrow}</span>
          <h1 className="clg-hero-title">{title}</h1>
          <p className="clg-hero-sub">{subtitle}</p>
          <a
            href={`sms:8329929422?&body=${encodeURIComponent(smsBody)}`}
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
          <h2 className="clg-section-title">{aboutTitle}</h2>
          <div className="clg-body-container">
            {aboutBody}
          </div>
        </div>
        <div className="clg-about-img-wrap">
          <Image
            src={aboutImage}
            alt={aboutTitle}
            className="clg-about-img"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
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
        <h2 className="clg-bottom-cta-title">{ctaTitle}</h2>
        <p className="clg-bottom-cta-sub">{ctaSub}</p>
        <a
          href={`sms:8329929422?&body=${encodeURIComponent(smsBody)}`}
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
}
