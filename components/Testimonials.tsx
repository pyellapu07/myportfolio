"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

/* ── Data ─────────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Erica Javadpour",
    role: "Creative & Info Lead, Terps Esports",
    company: "University of Maryland",
    period: "March 31, 2026",
    avatar: "/Erica.jpeg",
    accentColor: "#E63946",
    defaultRotate: -22,
    defaultX: -340,
    defaultY: 30,
    quote:
      "Pradeep is an extremely talented, thorough, and wildly creative graphic designer. He consistently thinks outside of the box to elevate our program's brand. Any company will be beyond lucky to have Pradeep on their team.",
    fullQuote:
      "Pradeep is an extremely talented, thorough, and wildly creative graphic designer. He consistently thinks outside of the box to elevate our program's brand, while still maintaining within the creative guidelines. More importantly though, he is a diligent, communicative worker who is eager to learn and grow, both as a creative but also as a budding professional. He takes feedback and incorporates it immediately into his work, to the point where the change is evident and reflected instantaneously. Although bittersweet that he leaves our team as he graduates from UMD, I'm excited to see where he takes his talents in this next chapter. Any company will be beyond lucky to have Pradeep on their team.",
  },
  {
    name: "Bhushan Suryavanshi",
    role: "Founder & CEO",
    company: "MarketCrunch AI",
    period: "Summer 2025",
    avatar: "/bhushan marketcrunch.jpeg",
    accentColor: "#FF6B6B",
    defaultRotate: -9,
    defaultX: -113,
    defaultY: 10,
    quote:
      "Pradeep became the backbone of our product redesign. His UX audit was thorough, his prototypes polished. The numbers speak for themselves.",
    fullQuote:
      "Pradeep joined us as a design intern and quickly became the backbone of our product redesign. His UX audit was thorough, his prototypes were polished, and his ability to run usability sessions and translate findings into actionable improvements was beyond what we expected. The numbers speak for themselves.",
  },
  {
    name: "Catherine Nakalembe (Ph.D.)",
    role: "NASA Harvest Africa Director",
    company: "Univ. of Maryland",
    period: "2025 – Present",
    avatar: "/catherine nakalembe.webp",
    accentColor: "#A78BFA",
    defaultRotate: 9,
    defaultX: 113,
    defaultY: 10,
    quote:
      "He made complex geospatial data intuitive for analysts across 9 countries. A rare blend of design and technical depth.",
    fullQuote:
      "Working with Pradeep has been a genuine pleasure. He brought a rare blend of design sensibility and technical understanding to a domain that most designers shy away from: geospatial, climate, and agricultural data. He didn't just make things look good; he made complex information intuitive for analysts across 9 countries.",
  },
  {
    name: "Ravi Kumar",
    role: "Service Delivery Manager",
    company: "Computacenter UK",
    period: "2023 – 2024",
    avatar: "/ravi kumar.jpeg",
    accentColor: "#34D399",
    defaultRotate: 22,
    defaultX: 340,
    defaultY: 30,
    quote:
      "Never delayed on any task. A true team player, and a creative artist when it comes to editing or drawing.",
    fullQuote:
      "Happy to write this recommendation for Pradeep, post working very closely for 18 months. He joined us as an intern from SRM College and later got converted to permanent employment. He is a knowledgeable person and easy going. Never delayed on any task assigned to him. A true team player, and a creative artist as well when it comes to editing or drawing. I wish him the best for his masters in the states. All the best and keep doing what you do!",
  },
];

/* ── Full testimonial modal ────────────────────────────────────────────── */
function TestimonialModal({
  t,
  onClose,
}: {
  t: (typeof TESTIMONIALS)[0];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-[24px] bg-white p-8 shadow-2xl"
          style={{ border: "1px solid #e5e7eb" }}
        >

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:bg-neutral-200 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Person */}
          <div className="mb-6 flex items-center gap-3">
            <div
              className="relative h-12 w-12 overflow-hidden rounded-full"
              style={{ boxShadow: `0 0 0 2px ${t.accentColor}` }}
            >
              <Image src={t.avatar} alt={t.name} fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{t.name}</p>
              <p className="font-mono text-[11px]" style={{ color: t.accentColor }}>{t.role}</p>
              <p className="font-mono text-[10px] text-neutral-400">{t.company} · {t.period}</p>
            </div>
          </div>

          {/* Full quote */}
          <p className="text-[14px] leading-[1.8] text-neutral-600">
            &ldquo;{t.fullQuote}&rdquo;
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Component ─────────────────────────────────────────────────────────── */
export default function Testimonials() {
  const [hovered, setHovered]   = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

  function getCardStyle(i: number) {
    const t = TESTIMONIALS[i];
    const isActive = hovered === i;
    const isIdle   = hovered === null;

    if (isActive) {
      return { rotate: 0, x: t.defaultX, y: t.defaultY - 16, scale: 1.04, zIndex: 50 };
    }
    if (isIdle) {
      return { rotate: t.defaultRotate, x: t.defaultX, y: t.defaultY, scale: 1, zIndex: 10 - i };
    }
    const diff = i - hovered!;
    const sign = diff > 0 ? 1 : -1;
    return {
      rotate: t.defaultRotate + sign * 8,
      x: t.defaultX + sign * 60,
      y: t.defaultY + 14,
      scale: 0.95,
      zIndex: 5 - Math.abs(diff),
    };
  }

  return (
    <SectionWrapper id="testimonials">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 flex items-start gap-4"
      >
        <div>
          <h2 className="font-heading text-3xl font-bold text-text md:text-4xl">
            What others say!
          </h2>
          <p className="mt-1 text-sm italic text-text-secondary">
            I didn&apos;t come up with these, I swear
          </p>
        </div>
      </motion.div>

      {/* ── Mobile: horizontal swipe snap ─────────────────────────────── */}
      <div
        className="md:hidden mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.name}
            className="w-[78vw] max-w-[300px] shrink-0 snap-center rounded-[22px] border border-neutral-200 bg-white p-5"
            style={{ boxShadow: "0 4px 18px rgba(0,0,0,0.07)" }}
          >
            <p className="mb-3 text-right font-mono text-[10px] text-neutral-400">{t.period}</p>
            <div className="mb-4 flex items-center gap-3">
              <div
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
                style={{ boxShadow: `0 0 0 2px ${t.accentColor}` }}
              >
                <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-tight text-neutral-900">{t.name}</p>
                <p className="text-[10px] font-mono" style={{ color: t.accentColor }}>{t.role}</p>
                <p className="text-[9px] font-mono text-neutral-400">{t.company}</p>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-neutral-500">&ldquo;{t.quote}&rdquo;</p>
            <button
              onClick={() => setExpanded(i)}
              className="mt-4 font-mono text-[10px] font-semibold text-neutral-400 underline underline-offset-2"
            >
              read full testimonial →
            </button>
          </div>
        ))}
      </div>
      <p className="md:hidden mt-3 text-center font-mono text-[11px] text-text-secondary/40">
        swipe to read more
      </p>

      {/* ── Desktop: fan deck ──────────────────────────────────────────── */}
      <div
        className="relative hidden items-center justify-center md:flex"
        style={{ height: 500, marginTop: 40 }}
      >
        {TESTIMONIALS.map((t, i) => {
          const style    = getCardStyle(i);
          const isActive = hovered === i;

          return (
            <motion.div
              key={t.name}
              animate={style}
              initial={{ rotate: t.defaultRotate, x: t.defaultX, y: t.defaultY, scale: 1, zIndex: 10 - i }}
              transition={SPRING}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              className="absolute cursor-pointer select-none"
              style={{
                width: isActive ? 290 : 260,
                pointerEvents: hovered !== null && hovered !== i ? "none" : "auto",
              }}
            >
              <div
                className="relative overflow-hidden rounded-[22px] p-6"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow: isActive
                    ? "0 16px 40px rgba(0,0,0,0.11)"
                    : "0 4px 18px rgba(0,0,0,0.07)",
                }}
              >
                <p className="mb-4 text-right font-mono text-[10px] text-neutral-400">{t.period}</p>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
                    style={{
                      filter: isActive ? "grayscale(0%)" : "grayscale(100%)",
                      boxShadow: isActive ? `0 0 0 2px ${t.accentColor}` : "0 0 0 2px #e5e7eb",
                      transition: "filter 0.4s, box-shadow 0.3s",
                    }}
                  >
                    <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold leading-tight text-neutral-900">{t.name}</p>
                    <p
                      className="text-[10px] font-mono"
                      style={{ color: isActive ? t.accentColor : "#9ca3af", transition: "color 0.3s" }}
                    >
                      {t.role}
                    </p>
                    <p className="text-[9px] font-mono text-neutral-400">{t.company}</p>
                  </div>
                </div>
                <p className="text-[12px] leading-relaxed text-neutral-500">&ldquo;{t.quote}&rdquo;</p>
                <div style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.25s" }} className="mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(i); }}
                    className="font-mono text-[10px] font-semibold text-neutral-400 underline underline-offset-2 hover:text-neutral-700 transition-colors"
                  >
                    read full testimonial →
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-6 hidden text-center font-mono text-[11px] text-text-secondary/40 md:block">
        hover a card to read · click to expand
      </p>

      {/* Full testimonial modal */}
      {expanded !== null && (
        <TestimonialModal t={TESTIMONIALS[expanded]} onClose={() => setExpanded(null)} />
      )}
    </SectionWrapper>
  );
}
