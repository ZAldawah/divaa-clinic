"use client";
import Link from "next/link";
import Image from "next/image";

const ALL_SERVICES = [
  { href: "/botox",          img: "/pictures/botox-image1.JPG",        title: "Botox & Dysport" },
  { href: "/filler",         img: "/pictures/lip-filler.JPG",          title: "Dermal Fillers" },
  { href: "/radiesse",       img: "/pictures/radiesse.JPG",            title: "Radiesse" },
  { href: "/sculptra",       img: "/pictures/sculptra.JPG",            title: "Sculptra" },
  { href: "/prp",            img: "/pictures/prptreatment-image1.JPG", title: "PRP Treatment" },
  { href: "/rrf",            img: "/pictures/rrf.png",                 title: "Radiofrequency Facial" },
  { href: "/facials",        img: "/pictures/facial-image1.jpg",       title: "Facials & Hydrofacials" },
  { href: "/microneedling",  img: "/pictures/microneedling-image1.JPG",title: "Microneedling" },
  { href: "/collagen",       img: "/pictures/collagen.png",            title: "Collagen & Biostimulators" },
];

// Duplicate for seamless loop
const ITEMS = [...ALL_SERVICES, ...ALL_SERVICES];

export default function ServiceTicker() {
  return (
    <div className="ticker-root">
      <div className="ticker-fade-left" />
      <div className="ticker-fade-right" />
      <div className="ticker-track">
        {ITEMS.map((s, i) => (
          <Link key={i} href={s.href} className="ticker-card">
            <div className="ticker-card-img">
              <Image
                src={s.img}
                alt={s.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 150px, 200px"
              />
            </div>
            <span className="ticker-card-label">{s.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
