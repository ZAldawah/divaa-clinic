import ServiceLayout from "@/components/layout/ServiceLayout";

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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Page() {
  return (
    <ServiceLayout
      eyebrow="DEEP CLEANSING & EXFOLIATION"
      title={
        <>
          Facials &amp; Hydrofacials <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($150)</span>
        </>
      }
      subtitle="Revitalize your complexion with our signature treatments. From deeply hydrating bespoke facials to advanced Hydrofacial exfoliation, achieve the radiant, healthy skin you deserve."
      heroImage="/pictures/hydrofacial.png"
      heroBgPosition="center 20%"
      smsBody="Hi I'm interested in Facial services at Divaa"
      stats={stats}
      aboutTitle="The Foundation of Radiant Skin"
      aboutBody={
        <>
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
        </>
      }
      aboutImage="/pictures/facial-image1.jpg"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready for your glow?"
      ctaSub="Schedule your complimentary consultation today and let our estheticians curate the perfect facial experience for your skin."
      faqSchema={faqSchema}
    />
  );
}
