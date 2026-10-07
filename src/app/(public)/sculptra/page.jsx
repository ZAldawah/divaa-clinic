import ServiceLayout from "@/components/layout/ServiceLayout";

export const metadata = {
  title: "Sculptra Aesthetic Injections | Divaa Beauty Clinic Houston",
  description:
    "Restore facial volume naturally with Sculptra Aesthetic. A premier collagen biostimulator treatment in Katy & Houston, TX.",
  keywords: [
    "Sculptra Houston",
    "Sculptra injections Katy TX",
    "collagen stimulator",
    "dermal biostimulators",
    "facial volume restoration",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "Sculptra Aesthetic | Divaa Beauty Clinic",
    description: "Rebuild your skin's inner structure with Sculptra, the leading collagen biostimulator.",
    url: "https://divaabeautyclinic.com/sculptra",
    type: "website",
  },
};

const faqs = [
  {
    q: "How does Sculptra differ from traditional fillers?",
    a: "Unlike traditional hyaluronic acid fillers which provide immediate volume by taking up space under the skin, Sculptra is made of poly-L-lactic acid (PLLA). It acts as a bio-activator, stimulating your body to produce its own natural collagen over time, leading to gradual, long-lasting structural support.",
  },
  {
    q: "When will I see results?",
    a: "Because Sculptra relies on your body's natural collagen production, results develop gradually. You will begin to notice improvements within 4 to 6 weeks, with optimal volume and structural enhancement visible at 3 to 6 months.",
  },
  {
    q: "How many sessions of Sculptra do I need?",
    a: "Most clients achieve their desired results with a series of 2 to 3 treatments, spaced about 4 to 6 weeks apart.",
  },
  {
    q: "How long do the results last?",
    a: "Sculptra results are exceptionally long-lasting. Clinical studies show that results can last for up to 2 years, making it an excellent investment for long-term facial rejuvenation.",
  },
];

const benefits = [
  { icon: "✦", label: "Gradual, undetectable, natural-looking volume" },
  { icon: "✦", label: "Rebuilds structural support in cheeks and temples" },
  { icon: "✦", label: "Improves overall skin thickness and elasticity" },
  { icon: "✦", label: "Stimulates Type I and Type III collagen" },
  { icon: "✦", label: "Long-lasting results up to 2 years" },
  { icon: "✦", label: "Addresses the underlying causes of facial aging" },
];

const stats = [
  { value: "2–3", label: "Recommended sessions" },
  { value: "4–6 wks", label: "Visible results start" },
  { value: "Up to 2 yrs", label: "Lasting duration" },
  { value: "None", label: "Downtime" },
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
      eyebrow="PLLA COLLAGEN BIOSTIMULATOR"
      title={
        <>
          Sculptra Aesthetic <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($500)</span>
        </>
      }
      subtitle="Rebuild your skin's structural foundation from within. Sculptra triggers your body's natural collagen synthesis to restore deep volume and firm lax skin."
      heroImage="/pictures/sculptra.JPG"
      smsBody="Hi I'm interested in Sculptra services at Divaa"
      stats={stats}
      aboutTitle="The Foundation of Youth"
      aboutBody={
        <>
          <p className="clg-body">
            Sculptra® Aesthetic is an FDA-approved injectable that helps gradually replace lost 
            collagen—the most common protein in the body that is used to form a framework to support 
            cells and tissue. Made with poly-L-lactic acid (PLLA), Sculptra works subtly and 
            gradually over time for a more youthful-looking appearance.
          </p>
          <p className="clg-body">
            Unlike hyaluronic acid fillers, which provide immediate but temporary volume, Sculptra 
            acts as a "seed" that commands your own body to produce its own collagen, ensuring that 
            your rejuvenated facial structure looks and feels entirely natural.
          </p>
        </>
      }
      aboutImage="/pictures/sculptra.JPG"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready for lasting volume?"
      ctaSub="Schedule your complimentary consultation today and let our experts design a tailored Sculptra plan for your aesthetic goals."
      faqSchema={faqSchema}
    />
  );
}