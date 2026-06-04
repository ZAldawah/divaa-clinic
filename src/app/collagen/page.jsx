import ServiceLayout from "@/components/layout/ServiceLayout";

export const metadata = {
  title: "Collagen Induction & Dermal Biostimulators | Divaa Beauty Clinic Houston",
  description:
    "Rebuild skin structure, restore volume, and tighten skin naturally with expert Collagen Induction & Biostimulator therapies (Sculptra®, Radiesse®) in Katy & Houston, TX.",
  keywords: [
    "collagen induction therapy",
    "dermal biostimulators",
    "Sculptra Houston",
    "Radiesse Katy TX",
    "collagen biostimulator injections",
    "skin tightening Katy",
    "Houston med spa biostimulators",
    "Divaa Beauty Clinic",
    "anti-aging treatments Houston",
  ],
  openGraph: {
    title: "Collagen Induction & Dermal Biostimulators | Divaa Beauty Clinic",
    description:
      "Rejuvenate your skin by stimulating its natural collagen production using advanced biostimulator therapies.",
    url: "https://divaabeautyclinic.com/collagen",
    type: "website",
  },
};

const faqs = [
  {
    q: "Are collagen biostimulator treatments painful?",
    a: "Most collagen biostimulation therapies involve minimal discomfort. For treatments like microneedling or injectable biostimulators (Sculptra®, Radiesse®), we apply a high-potency topical numbing cream beforehand to ensure you remain completely relaxed and comfortable throughout the procedure.",
  },
  {
    q: "When will I see results?",
    a: "Because these treatments stimulate your skin's natural regenerative cycle, results develop gradually. You'll start noticing improvements in skin texture and tone within 4 to 6 weeks, with full benefits appearing over 2 to 3 months as new collagen fibers form and strengthen the dermal matrix.",
  },
  {
    q: "How long do collagen biostimulator results last?",
    a: "Since the treatment rebuilds your own natural collagen network, results are exceptionally long-lasting — often remaining visible for 1 to 2 years or more. Periodic maintenance treatments (typically once a year) help preserve your youthful contour and dermal density.",
  },
  {
    q: "What is the difference between dermal fillers and collagen biostimulators?",
    a: "Traditional dermal fillers (like hyaluronic acid) provide immediate volume by placing a gel-like substance under the skin. Collagen biostimulators (like Sculptra® or Radiesse®) work gradually by encouraging your body to produce its own collagen — producing results that are more gradual, natural-looking, and typically last much longer.",
  },
  {
    q: "What is the recovery or downtime after treatment?",
    a: "Downtime is minimal. You may experience mild swelling, redness, or tenderness at the injection or treatment sites, which typically resolves within 2 to 5 days. Most clients return to normal activities immediately, although we advise avoiding strenuous exercise for 24–48 hours.",
  },
  {
    q: "How many sessions are typically required?",
    a: "While some see benefits after a single treatment, we generally recommend a series of 2 to 3 sessions spaced 4 to 6 weeks apart for optimal collagen remodeling and structural support. Your provider will design a custom plan during your consultation.",
  },
];

const benefits = [
  { icon: "✦", label: "Gradual, natural-looking volume restoration" },
  { icon: "✦", label: "Rebuilding temple, cheek & jawline structure" },
  { icon: "✦", label: "Smoothing fine lines, wrinkles & crepiness" },
  { icon: "✦", label: "Enhancing skin thickness, firmness & elasticity" },
  { icon: "✦", label: "Improvement in acne scars & stretch marks" },
  { icon: "✦", label: "Long-term rejuvenation lasting up to 2 years" },
];

const stats = [
  { value: "2–3", label: "Recommended sessions" },
  { value: "4–6 wks", label: "Between sessions" },
  { value: "1–2 yrs", label: "Lasting results" },
  { value: "~5 days", label: "Recovery time" },
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
      eyebrow="FEATURED CLINICAL THERAPY"
      title={
        <>
          Collagen Induction<br />&amp; Biostimulators <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($TBD)</span>
        </>
      }
      subtitle="Rebuild your skin's structural foundation from within. Advanced dermal biostimulators naturally trigger collagen synthesis to restore deep volume, smooth fine lines, and firm lax skin."
      heroImage="/pictures/collagen.png"
      smsBody="Hi I'm interested in collagen biostimulator services at Divaa"
      stats={stats}
      aboutTitle="Advanced Dermal Biostimulation"
      aboutBody={
        <>
          <p className="clg-body">
            Unlike traditional dermal fillers that simply fill space, collagen
            biostimulators — such as Sculptra® and Radiesse® — stimulate your
            body's own regenerative mechanisms. By triggering a targeted response
            in the deep dermis, these medical-grade injectables encourage
            production of Type I and Type III collagen, gradually re-establishing
            the youthful bounce, texture, and density of your skin.
          </p>
          <p className="clg-body">
            The result is a progressively refined appearance that looks
            completely natural, because it <em>is</em> — your own biology, optimised.
          </p>
        </>
      }
      aboutImage="/pictures/collagen.png"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready to rebuild from within?"
      ctaSub="Schedule your complimentary consultation today and let our providers design a plan tailored exclusively to your skin."
      faqSchema={faqSchema}
    />
  );
}
