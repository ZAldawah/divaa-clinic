import ServiceLayout from "@/components/layout/ServiceLayout";

export const metadata = {
  title: "Radiesse Dermal Filler & Biostimulator | Divaa Beauty Clinic Houston",
  description:
    "Restore facial volume and stimulate collagen with Radiesse. Advanced CaHA biostimulator treatments in Katy & Houston, TX.",
  keywords: [
    "Radiesse Houston",
    "Radiesse injections Katy TX",
    "calcium hydroxylapatite",
    "collagen stimulator",
    "dermal biostimulators",
    "facial volume restoration",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "Radiesse Biostimulator | Divaa Beauty Clinic",
    description: "Rebuild your skin's collagen network with Radiesse, the dual-action volumizer and biostimulator.",
    url: "https://divaabeautyclinic.com/radiesse",
    type: "website",
  },
};

const faqs = [
  {
    q: "How does Radiesse differ from Sculptra or HA fillers?",
    a: "Radiesse is unique because it provides the immediate volumizing lift of a traditional hyaluronic acid (HA) filler, while simultaneously acting as a biostimulator (like Sculptra) to trigger your body's own collagen and elastin production over time.",
  },
  {
    q: "When will I see results?",
    a: "You will notice an immediate lifting and volumizing effect as soon as you leave the clinic. As the gel carrier is absorbed over the next few months, your body's newly produced collagen takes its place, maintaining the volume and improving skin texture.",
  },
  {
    q: "How many sessions of Radiesse do I need?",
    a: "Many clients achieve their desired contouring and volume in just one session! However, depending on the amount of volume loss or if used for hyperdilute skin rejuvenation, 1 to 3 sessions may be recommended.",
  },
  {
    q: "How long do the results last?",
    a: "Radiesse is known for its durability. Thanks to the robust collagen stimulation, results typically last 12 to 18 months, and in some cases even longer.",
  },
];

const benefits = [
  { icon: "✦", label: "Immediate volumizing and lifting effect" },
  { icon: "✦", label: "Long-term collagen and elastin stimulation" },
  { icon: "✦", label: "Ideal for deep nasolabial folds and marionette lines" },
  { icon: "✦", label: "Defines and contours the jawline and chin" },
  { icon: "✦", label: "Hyperdilute Radiesse available for skin tightening" },
  { icon: "✦", label: "Results lasting 12 to 18 months" },
];

const stats = [
  { value: "1–2", label: "Recommended sessions" },
  { value: "Instant", label: "Visible results" },
  { value: "12–18 mo", label: "Lasting duration" },
  { value: "2–3 days", label: "Recovery time" },
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
      eyebrow="DUAL-ACTION BIOSTIMULATOR"
      title={
        <>
          Radiesse <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($500)</span>
        </>
      }
      subtitle="Experience the best of both worlds. Radiesse provides an immediate lifting and volumizing effect while actively stimulating your body's own collagen and elastin for long-term rejuvenation."
      heroImage="/pictures/radiesse.JPG"
      smsBody="Hi I'm interested in Radiesse services at Divaa"
      stats={stats}
      aboutTitle="Immediate Lift, Lasting Collagen"
      aboutBody={
        <>
          <p className="clg-body">
            Radiesse® is an FDA-approved dermal filler made of Calcium Hydroxylapatite (CaHA) 
            microspheres suspended in an aqueous gel carrier. Upon injection, the gel provides 
            immediate volume and correction for moderate to severe facial wrinkles and folds, 
            as well as robust structural support for jawline and chin contouring.
          </p>
          <p className="clg-body">
            Over time, the gel carrier is naturally absorbed by the body, but the CaHA microspheres 
            remain behind, acting as a scaffold that triggers your fibroblasts to produce thick, 
            healthy Type I collagen and elastin. This ensures your skin remains firm, elastic, 
            and youthfully contoured long after the initial treatment.
          </p>
        </>
      }
      aboutImage="/pictures/radiesse.JPG"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready for immediate lift?"
      ctaSub="Schedule your complimentary consultation today and let our experts design a tailored Radiesse plan for your aesthetic goals."
      faqSchema={faqSchema}
    />
  );
}