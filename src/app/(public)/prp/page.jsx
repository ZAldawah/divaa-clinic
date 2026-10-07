import ServiceLayout from "@/components/layout/ServiceLayout";

export const metadata = {
  title: "PRP & PRF Therapy | Divaa Beauty Clinic Houston",
  description:
    "Harness the healing power of your own plasma with Platelet-Rich Fibrin (PRF) and PRP therapies for hair restoration and skin rejuvenation in Katy & Houston, TX.",
  keywords: [
    "PRP treatment",
    "PRF therapy Houston",
    "hair restoration Katy TX",
    "vampire facial",
    "plasma skin rejuvenation",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "PRP & PRF Therapy | Divaa Beauty Clinic",
    description: "Natural skin rejuvenation and hair restoration using the growth factors found in your own plasma.",
    url: "https://divaabeautyclinic.com/prp",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is the difference between PRP and PRF?",
    a: "Both utilize your own blood to extract growth factors, but PRF (Platelet-Rich Fibrin) is the next-generation of PRP. It is spun at a lower speed, which preserves more white blood cells and stem cells, and forms a fibrin scaffold that releases growth factors much more slowly and steadily into the tissue for superior results.",
  },
  {
    q: "Does the treatment hurt?",
    a: "Discomfort is minimal. For facial injections or microneedling with PRF, we apply a strong topical numbing cream beforehand. The blood draw is exactly like a routine lab test.",
  },
  {
    q: "How many sessions are recommended?",
    a: "For skin rejuvenation, we typically recommend a series of 3 to 4 treatments spaced 4 weeks apart. For hair restoration, a series of 4 to 6 treatments is usually required to see optimal follicle stimulation.",
  },
  {
    q: "When will I see results?",
    a: "Because PRF relies on stimulating cellular turnover and collagen production, results are not immediate. You will begin noticing improved skin texture or reduced hair shedding within 4 to 6 weeks, with peak results manifesting at 3 to 6 months.",
  },
];

const benefits = [
  { icon: "✦", label: "Stimulates collagen and elastin production naturally" },
  { icon: "✦", label: "Accelerates tissue healing and regeneration" },
  { icon: "✦", label: "Reduces dark under-eye circles and hollowness" },
  { icon: "✦", label: "Improves overall skin tone and texture" },
  { icon: "✦", label: "Highly effective for stimulating dormant hair follicles" },
  { icon: "✦", label: "100% natural and biocompatible (no risk of allergy)" },
];

const stats = [
  { value: "3–6", label: "Recommended sessions" },
  { value: "4–6 wks", label: "Visible results start" },
  { value: "45 min", label: "Appointment time" },
  { value: "1–2 days", label: "Recovery time" },
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
      eyebrow="NATURAL CELLULAR REGENERATION"
      title={
        <>
          PRP &amp; PRF Therapy <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($400)</span>
        </>
      }
      subtitle="Harness the healing power of your own biology. PRF uses a high concentration of your own platelets, stem cells, and growth factors to naturally rejuvenate skin and stimulate hair growth."
      heroImage="/pictures/prptreatment-image1.JPG"
      smsBody="Hi I'm interested in PRF services at Divaa"
      stats={stats}
      aboutTitle="The Ultimate Biological Bio-Filler"
      aboutBody={
        <>
          <p className="clg-body">
            Platelet-Rich Fibrin (PRF) is widely considered the next-generation of PRP. 
            The process begins with a simple, standard blood draw. We then spin the blood 
            in a specialized centrifuge to separate and concentrate the red blood cells from 
            the platelets, white blood cells, and mesenchymal stem cells.
          </p>
          <p className="clg-body">
            This "liquid gold" is then either injected strategically into areas of volume 
            loss (like the under-eyes or scalp) or micro-needled into the skin. Once in 
            the tissue, it forms a fibrin matrix that slowly and continuously releases 
            growth factors over several weeks, instructing your body to heal, regenerate 
            collagen, and sprout new, healthy cells.
          </p>
        </>
      }
      aboutImage="/pictures/prptreatment-image1.JPG"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready for cellular renewal?"
      ctaSub="Schedule your complimentary consultation today and let our experts design a tailored PRF protocol for your aesthetic goals."
      faqSchema={faqSchema}
    />
  );
}