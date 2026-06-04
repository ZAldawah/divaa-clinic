import ServiceLayout from "@/components/layout/ServiceLayout";

export const metadata = {
  title: "Botox & Dysport Treatments | Divaa Beauty Clinic Houston",
  description:
    "Diminish fine lines and wrinkles with expertly placed neurotoxin injections (Botox, Dysport, Letybo) in Katy & Houston, TX. Keep your natural expression.",
  keywords: [
    "Botox Houston",
    "Dysport Katy TX",
    "Letybo injections",
    "neurotoxin filler",
    "anti-aging",
    "wrinkle relaxer",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "Botox & Dysport | Divaa Beauty Clinic",
    description: "Expert neurotoxin injections to soften lines while preserving your natural expression.",
    url: "https://divaabeautyclinic.com/botox",
    type: "website",
  },
};

const faqs = [
  {
    q: "Are Botox and Dysport injections painful?",
    a: "Most clients describe Botox injections as a quick pinch. We use ultra-fine needles, and if you're sensitive, we can apply numbing cream to keep you perfectly comfortable.",
  },
  {
    q: "How long do Botox and Dysport last?",
    a: "Results typically last 3-4 months. With consistent, scheduled treatments, your facial muscles become trained to relax, and results may last longer over time.",
  },
  {
    q: "When will I see results?",
    a: "You may start to see a smoothing effect within 3 to 5 days, with the final, fully settled result appearing around 10 to 14 days after treatment.",
  },
  {
    q: "Will my face look frozen?",
    a: "Not at all. Our master injectors specialize in 'sprinkle' and conservative techniques that diminish fine lines while completely preserving your natural ability to express emotion.",
  },
];

const benefits = [
  { icon: "✦", label: "Softens forehead creases and worry lines" },
  { icon: "✦", label: "Eliminates glabella lines (the '11s' between brows)" },
  { icon: "✦", label: "Smooths crow's feet around the eyes" },
  { icon: "✦", label: "Relieves jaw tension from overactive masseter muscles" },
  { icon: "✦", label: "Creates a subtle, natural brow lift" },
  { icon: "✦", label: "Customized strictly to your facial anatomy" },
];

const stats = [
  { value: "15-30 min", label: "Treatment time" },
  { value: "3-5 days", label: "Visible results" },
  { value: "3-4 mos", label: "Lasting duration" },
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
      eyebrow="NEUROTOXIN WRINKLE RELAXERS"
      title={
        <>
          Botox &amp; Dysport <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($13 / unit)</span>
          <br />
          <span style={{ fontSize: "0.45em", fontWeight: "300", letterSpacing: "1px", color: "rgba(255,255,255,0.7)", display: "block", marginTop: "12px" }}>LETYBO: $9 / UNIT</span>
        </>
      }
      subtitle="Diminish fine lines and wrinkles with expertly placed neurotoxin injections that relax facial muscles while preserving your natural expression."
      heroImage="/pictures/botox-image1.JPG"
      smsBody="Hi I'm interested in Botox services at Divaa"
      stats={stats}
      aboutTitle="The Gold Standard in Anti-Aging"
      aboutBody={
        <>
          <p className="clg-body">
            Botox, Dysport, and Letybo are FDA-approved injectable neuromodulators used to soften the 
            appearance of dynamic lines caused by repetitive facial movements. By temporarily 
            relaxing the underlying muscles, the skin above has a chance to smooth out and 
            regenerate without being continuously creased.
          </p>
          <p className="clg-body">
            These treatments are ideal for anyone looking to refresh their look, prevent 
            future deep static wrinkles from forming, and maintain a vibrant, youthful 
            aesthetic without losing natural facial expressiveness.
          </p>
        </>
      }
      aboutImage="/pictures/botox-image1.JPG"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready to refresh your look?"
      ctaSub="Schedule your complimentary consultation today and let our experts design a tailored neurotoxin plan for your aesthetic goals."
      faqSchema={faqSchema}
    />
  );
}