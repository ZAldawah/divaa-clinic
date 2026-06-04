import ServiceLayout from "@/components/layout/ServiceLayout";

export const metadata = {
  title: "Microneedling Collagen Induction | Divaa Beauty Clinic Houston",
  description:
    "Stimulate collagen and improve skin texture with medical-grade microneedling. Treat acne scars, fine lines, and enlarged pores in Katy & Houston, TX.",
  keywords: [
    "microneedling Houston",
    "collagen induction therapy Katy TX",
    "acne scar treatment",
    "skin resurfacing",
    "Divaa Beauty Clinic",
  ],
  openGraph: {
    title: "Microneedling Therapy | Divaa Beauty Clinic",
    description: "Stimulate collagen naturally to improve skin texture, reduce scars, and minimize pores.",
    url: "https://divaabeautyclinic.com/microneedling",
    type: "website",
  },
};

const faqs = [
  {
    q: "Does microneedling hurt?",
    a: "We apply a medical-grade topical numbing cream to the treatment area for 30-45 minutes before starting. Most clients report feeling only mild vibration or pressure, with little to no actual pain.",
  },
  {
    q: "How many treatments will I need?",
    a: "For general skin rejuvenation and maintenance, we recommend 3 treatments. For deeper acne scarring or stretch marks, a series of 4 to 6 treatments spaced 4 weeks apart may be necessary for optimal collagen remodeling.",
  },
  {
    q: "What is the downtime like?",
    a: "Expect your skin to look noticeably red—similar to a moderate sunburn—for the first 24 to 48 hours. By day 3, the redness usually fades into a slight pink hue, and you may experience mild peeling or flaking as the old skin turns over.",
  },
  {
    q: "Can microneedling be combined with other treatments?",
    a: "Absolutely. Microneedling is frequently combined with PRP/PRF ('Vampire Facial') or specific serums. The micro-channels created during the treatment allow these potent regenerative products to penetrate deep into the dermis for exponentially better results.",
  },
];

const benefits = [
  { icon: "✦", label: "Significantly reduces acne scars and pitted texture" },
  { icon: "✦", label: "Smooths fine lines and early signs of aging" },
  { icon: "✦", label: "Minimizes the appearance of enlarged pores" },
  { icon: "✦", label: "Fades hyperpigmentation and sun damage" },
  { icon: "✦", label: "Increases product absorption up to 3000%" },
  { icon: "✦", label: "Safe for all skin types and tones" },
];

const stats = [
  { value: "3–6", label: "Recommended sessions" },
  { value: "4 wks", label: "Between sessions" },
  { value: "60 min", label: "Appointment time" },
  { value: "2–4 days", label: "Recovery time" },
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
      eyebrow="COLLAGEN INDUCTION THERAPY"
      title={
        <>
          Microneedling <span style={{ color: "#A6824F", fontSize: "0.8em" }}>($250)</span>
        </>
      }
      subtitle="Achieve a flawless complexion from the inside out. Microneedling triggers the skin's natural healing cascade to smooth scars, refine pores, and erase fine lines."
      heroImage="/pictures/microneedling-image1.JPG"
      smsBody="Hi I'm interested in Microneedling services at Divaa"
      stats={stats}
      aboutTitle="Micro-Injuries, Macro Results"
      aboutBody={
        <>
          <p className="clg-body">
            Also known as Collagen Induction Therapy (CIT), Microneedling uses an FDA-cleared 
            device equipped with fine, sterile needles to create thousands of invisible, 
            controlled micro-injuries in the top layer of the skin.
          </p>
          <p className="clg-body">
            This highly controlled process commands the body's innate wound-healing cascade to 
            activate. Fibroblasts rush to the surface, breaking down old, damaged tissue (like 
            acne scars or hyperpigmentation) and weaving fresh, new Type I and Type III collagen 
            and elastin networks. The result is thicker, smoother, and more structurally sound skin.
          </p>
        </>
      }
      aboutImage="/pictures/microneedling-image1.JPG"
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Ready for flawless texture?"
      ctaSub="Schedule your complimentary consultation today and let our experts design a tailored microneedling plan for your skin goals."
      faqSchema={faqSchema}
    />
  );
}