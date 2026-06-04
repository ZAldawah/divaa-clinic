"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const POPULAR = [
  { href: "/filler",         img: "/pictures/cheek-filler.JPG",           title: "Dermal Fillers",                      desc: "Restore youthful definition, enhance contours, and plum lips with premium hyaluronic acid." },
  { href: "/radiesse",       img: "/pictures/radiesse.JPG",               title: "Radiesse",                            desc: "Hydrating injectable treatment for overall skin glow." },
  { href: "/prp",            img: "/pictures/prptreatment-image1.JPG",    title: "PRP Treatment",                       desc: "Stimulates skin regeneration and collagen production using your own plasma." },
  { href: "/rrf",            img: "/pictures/rrf.png",                    title: "Radiofrequency Facial",               desc: "Tighten and rejuvenate skin using advanced RF technology." },
  { href: "/facials",        img: "/pictures/facial-image1.jpg",          title: "Facials & Hydrofacials",              desc: "Revitalize your complexion with deeply hydrating, exfoliating, and purifying treatments." },
  { href: "/microneedling",  img: "/pictures/microneedling-image1.JPG",   title: "Microneedling",                       desc: "Collagen-boosting treatment to refine texture and reduce imperfections." },
  { href: "/collagen",       img: "/pictures/collagen.png",               title: "Collagen Induction & Biostimulators", desc: "Advanced biostimulator therapies that rebuild deep dermal structure, restore volume, and refine texture from within.", bgPos: "center top" },
];

export default function PopularServices() {
  const [index, setIndex] = useState(0);
  const total  = POPULAR.length;
  const atStart = index === 0;
  const atEnd   = index === total - 1;

  const prev = () => { if (!atStart) setIndex(i => i - 1); };
  const next = () => { if (!atEnd)   setIndex(i => i + 1); };

  const s = POPULAR[index];

  return (
    <div className="ps-root">
      {/* Header */}
      <div className="ps-section-header">
        <p className="ps-eyebrow">CLIENT FAVOURITES</p>
        <h2 className="ps-title">Popular Services</h2>
        <div className="ps-dots">
          {POPULAR.map((_, i) => (
            <button
              key={i}
              className={`ps-dot ${i === index ? "ps-dot--active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${POPULAR[i].title}`}
            />
          ))}
        </div>
      </div>

      {/* Stage with side arrows */}
      <div className="ps-stage">
        <button
          className={`ps-side-arrow ps-side-arrow--left ${atStart ? "ps-arrow--hidden" : ""}`}
          onClick={prev}
          aria-label="Previous"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 5L9 12l6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <Link href={s.href} className="ps-card">
          <div className="ps-card-img">
            <Image
              src={s.img}
              alt={s.title}
              fill
              style={{ objectFit: "cover", objectPosition: s.bgPos || "center" }}
              sizes="(max-width: 900px) 100vw, 50vw"
              priority={index === 0}
            />
          </div>
          <div className="ps-card-body">
            <h3 className="ps-card-name">{s.title}</h3>
            <p className="ps-card-desc">{s.desc}</p>
            <span className="ps-card-cta">
              Learn More
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </Link>

        <button
          className={`ps-side-arrow ps-side-arrow--right ${atEnd ? "ps-arrow--dim" : ""}`}
          onClick={next}
          disabled={atEnd}
          aria-label="Next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l6 7-6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Counter */}
      <p className="ps-counter">{index + 1} of {total}</p>

      {/* Progress bar */}
      <div className="ps-progress">
        <div
          className="ps-progress-fill"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
