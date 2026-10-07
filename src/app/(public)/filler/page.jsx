import ServiceLayout from "@/components/layout/ServiceLayout";

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
      eyebrow="HYALURONIC ACID ENHANCEMENT"
      title={
        <>
          Dermal Fillers <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($400)</span>
        </>
      }
      subtitle="Restore lost volume, enhance facial contours, and plump lips with premium hyaluronic acid fillers tailored exactly to your unique facial structure."
      heroImage="/pictures/lip-filler.JPG"
      smsBody="Hi I'm interested in Dermal Filler services at Divaa"
      stats={stats}
      aboutTitle="Artistic Volume Restoration"
      aboutBody={
        <>
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
        </>
      }
      aboutImage="/pictures/cheek-filler.JPG"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready to refine your features?"
      ctaSub="Schedule your complimentary consultation today and let our experts design a tailored filler plan for your aesthetic goals."
      faqSchema={faqSchema}
    />
  );
}
