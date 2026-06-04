"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const BEST_SELLERS = [
  {
    href: "/filler",
    img: "/pictures/lip-filler.JPG",
    title: "Dermal Fillers",
    tag: "BEST SELLER",
    desc: "Restore lost volume, enhance facial contours, and plump lips with premium hyaluronic acid fillers.",
  },
  {
    href: "/botox",
    img: "/pictures/botox-image1.JPG",
    title: "Botox & Dysport",
    tag: "BEST SELLER",
    desc: "Smooth dynamic lines and restore a refreshed, youthful appearance. Our precision injection technique delivers results that never look overdone.",
  },
  {
    href: "/sculptra",
    img: "/pictures/sculptra.JPG",
    title: "Sculptra",
    tag: "BEST SELLER",
    desc: "Restore lost volume and stimulate your skin's own collagen over time. Long-lasting results that improve naturally over months — up to two years.",
  },
];

export default function BestSellers() {
  const [index, setIndex] = useState(0);
  const total = BEST_SELLERS.length;
  const atStart = index === 0;
  const atEnd   = index === total - 1;

  const prev = () => { if (!atStart) setIndex(i => i - 1); };
  const next = () => { if (!atEnd)   setIndex(i => i + 1); };

  const s = BEST_SELLERS[index];

  return (
    <div className="bs-root">
      {/* Section label */}
      <div className="bs-section-header">
        <p className="bs-eyebrow">MOST REQUESTED</p>
        <h2 className="bs-title">Best Sellers</h2>
        {/* Dot indicators */}
        <div className="bs-dots">
          {BEST_SELLERS.map((_, i) => (
            <button
              key={i}
              className={`bs-dot ${i === index ? "bs-dot--active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${BEST_SELLERS[i].title}`}
            />
          ))}
        </div>
      </div>

      {/* Card wrapper with side arrows */}
      <div className="bs-stage">
        {/* Left arrow — hidden at start */}
        <button
          className={`bs-side-arrow bs-side-arrow--left ${atStart ? "bs-arrow--hidden" : ""}`}
          onClick={prev}
          aria-label="Previous"
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M17 5L9 13l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* The card */}
        <Link href={s.href} className="bs-card">
          <div className="bs-card-img">
            <Image
              src={s.img}
              alt={s.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 100vw, 50vw"
              priority={index === 0}
            />
          </div>
          <div className="bs-card-body">
            <span className="bs-card-tag">{s.tag}</span>
            <h3 className="bs-card-name">{s.title}</h3>
            <p className="bs-card-desc">{s.desc}</p>
            <span className="bs-card-cta">
              Book a Consultation
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </Link>

        {/* Right arrow — grayed at end */}
        <button
          className={`bs-side-arrow bs-side-arrow--right ${atEnd ? "bs-arrow--dim" : ""}`}
          onClick={next}
          disabled={atEnd}
          aria-label="Next"
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M9 5l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="bs-progress">
        <div
          className="bs-progress-fill"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
