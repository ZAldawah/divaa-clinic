import ServiceLayout from "@/components/layout/ServiceLayout";

export const metadata = {
  title: "Radiofrequency (RF) Microneedling | Divaa Beauty Clinic Houston",
  description:
    "Tighten, lift, and remodel your skin with advanced Radiofrequency Microneedling (Morpheus-style treatments) in Katy & Houston, TX.",
  keywords: [
    "RF microneedling Houston",
    "Morpheus8 alternative Katy TX",
    "radiofrequency skin tightening",
    "collagen remodeling",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "RF Microneedling | Divaa Beauty Clinic",
    description: "Advanced skin tightening and deep collagen remodeling using fractional radiofrequency technology.",
    url: "https://divaabeautyclinic.com/rrf",
    type: "website",
  },
};

const faqs = [
  {
    q: "How does RF Microneedling differ from standard microneedling?",
    a: "Standard microneedling strictly creates mechanical micro-injuries on the surface to stimulate healing. RF Microneedling adds a powerful secondary element: it delivers fractional radiofrequency heat energy deep into the dermal layers through the needles. This melts underlying fat and causes profound tissue contraction and lifting that standard microneedling cannot achieve.",
  },
  {
    q: "Is the treatment painful?",
    a: "Because this treatment penetrates deeper and delivers heat energy, it can be more intense than standard microneedling. We utilize a highly potent compounded numbing cream prior to treatment and take our time to ensure your comfort throughout the procedure.",
  },
  {
    q: "How many sessions are recommended?",
    a: "For optimal skin tightening and remodeling, a series of 3 sessions spaced 4 to 6 weeks apart is highly recommended. Annual maintenance sessions will help sustain your results.",
  },
  {
    q: "What is the downtime?",
    a: "You will experience redness, mild swelling, and possible grid marks from the needles for 3 to 5 days. The skin will feel like it has a sunburn, and as it heals, you will notice a lifting and tightening effect as the new collagen forms.",
  },
];

const benefits = [
  { icon: "✦", label: "Tightens and lifts mild to moderate skin laxity" },
  { icon: "✦", label: "Melts submental (under-chin) fat and sculpts jawline" },
  { icon: "✦", label: "Dramatically smooths deep acne scars and texture" },
  { icon: "✦", label: "Reduces the appearance of deep wrinkles and folds" },
  { icon: "✦", label: "Stimulates deep-dermis collagen remodeling" },
  { icon: "✦", label: "Safe and effective for all Fitzpatrick skin types" },
];

const stats = [
  { value: "3", label: "Recommended sessions" },
  { value: "4–6 wks", label: "Between sessions" },
  { value: "60–90 min", label: "Appointment time" },
  { value: "3–5 days", label: "Recovery time" },
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
      eyebrow="ADVANCED TISSUE REMODELING"
      title={
        <>
          RF Microneedling <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($250)</span>
        </>
      }
      subtitle="The ultimate non-surgical facelift. Radiofrequency microneedling penetrates deep into the subdermal layer to remodel collagen, melt fat, and dramatically tighten lax skin."
      heroImage="/pictures/rrf.png"
      smsBody="Hi I'm interested in RF Microneedling services at Divaa"
      stats={stats}
      aboutTitle="Deep Subdermal Remodeling"
      aboutBody={
        <>
          <p className="clg-body">
            Radiofrequency (RF) Microneedling bridges the gap between minimally invasive 
            procedures and surgical facelifts. This highly advanced treatment uses gold-plated 
            micro-pins to safely deliver fractional radiofrequency heat energy deep into the 
            dermis and subdermal adipose (fat) layers.
          </p>
          <p className="clg-body">
            This intense thermal energy causes immediate contraction of the tissue (instant 
            tightening), whilst simultaneously melting small, localized pockets of fat—making 
            it the gold-standard treatment for sculpting the jawline, reducing jowls, and 
            smoothing deep, cystic acne scars that standard treatments cannot reach.
          </p>
        </>
      }
      aboutImage="/pictures/rrf.png"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready to lift and tighten?"
      ctaSub="Schedule your complimentary consultation today and let our experts design a tailored RF Microneedling protocol for your aesthetic goals."
      faqSchema={faqSchema}
    />
  );
}