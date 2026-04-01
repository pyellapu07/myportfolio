"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SectionWrapper from "./SectionWrapper";

/* ── Data ─────────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Erica Javadpur",
    role: "Esports Coordinator",
    company: "University of Maryland",
    period: "2024 – Present",
    avatar: "/Erica.jpeg",
    accentColor: "#E63946",
    defaultRotate: -22,
    defaultX: -240,
    defaultY: 30,
    quote:
      "This website is incredibly impressive, engaging, and interesting. This will hook anyone in to really go through your site. One of the coolest portfolios I've ever seen.",
  },
  {
    name: "Bhushan Suryavanshi",
    role: "Founder & CEO",
    company: "MarketCrunch AI",
    period: "Summer 2025",
    avatar: "/bhushan marketcrunch.jpeg",
    accentColor: "#FF6B6B",
    defaultRotate: -9,
    defaultX: -80,
    defaultY: 10,
    quote:
      "Pradeep became the backbone of our product redesign. His UX audit was thorough, his prototypes polished, and his ability to run usability sessions and translate findings into improvements was beyond what we expected. The numbers speak for themselves.",
  },
  {
    name: "Catherine Nakalembe (Ph.D.)",
    role: "NASA Harvest Africa Director",
    company: "Univ. of Maryland",
    period: "2025 – Present",
    avatar: "/catherine nakalembe.webp",
    accentColor: "#A78BFA",
    defaultRotate: 9,
    defaultX: 80,
    defaultY: 10,
    quote:
      "He made complex geospatial and climate data intuitive for analysts across 9 countries. A rare blend of design sensibility and technical depth that most designers shy away from.",
  },
  {
    name: "Ravi Kumar",
    role: "Service Delivery Manager",
    company: "Computacenter UK",
    period: "2023 – 2024",
    avatar: "/ravi kumar.jpeg",
    accentColor: "#34D399",
    defaultRotate: 22,
    defaultX: 240,
    defaultY: 30,
    quote:
      "Never delayed on any task assigned to him. A true team player, and a creative artist when it comes to editing or drawing. I wish him the best for his masters in the states.",
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */
export default function Testimonials() {
  const [hovered, setHovered] = useState<number | null>(null);

  const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

  function getCardStyle(i: number) {
    const t = TESTIMONIALS[i];
    const isActive = hovered === i;
    const isIdle   = hovered === null;

    if (isActive) {
      // Straighten exactly where the card sits — no x movement at all
      return { rotate: 0, x: t.defaultX, y: t.defaultY - 16, scale: 1.04, zIndex: 50 };
    }

    if (isIdle) {
      return { rotate: t.defaultRotate, x: t.defaultX, y: t.defaultY, scale: 1, zIndex: 10 - i };
    }

    // Fan slightly further away from the hovered card, staying in their lane
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg-alt text-2xl">
          💬
        </div>
        <div>
          <h2 className="font-heading text-3xl font-bold text-text md:text-4xl">
            What others say!
          </h2>
          <p className="mt-1 text-sm italic text-text-secondary">
            I didn&apos;t come up with these, I swear
          </p>
        </div>
      </motion.div>

      {/* ── Deck ──────────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center"
           style={{ height: 480, marginTop: 40 }}>
        {TESTIMONIALS.map((t, i) => {
          const style = getCardStyle(i);
          const isActive = hovered === i;

          return (
            <motion.div
              key={t.name}
              animate={style}
              initial={{
                rotate: t.defaultRotate,
                x: t.defaultX,
                y: t.defaultY,
                scale: 1,
                zIndex: 10 - i,
              }}
              transition={SPRING}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              className="absolute cursor-pointer select-none"
              style={{
                width: isActive ? 290 : 260,
                pointerEvents: hovered !== null && hovered !== i ? "none" : "auto",
              }}
            >
              {/* Card */}
              <div
                className="relative overflow-hidden rounded-[22px] p-6"
                style={{
                  background: "#111116",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isActive
                    ? "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)"
                    : "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                {/* Accent top bar */}
                <div
                  className="absolute left-0 top-0 h-[2px] w-full transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, ${t.accentColor}, transparent)`,
                    opacity: isActive ? 1 : 0.3,
                  }}
                />

                {/* Top row: period */}
                <p className="mb-4 font-mono text-[10px] text-white/30 text-right">
                  {t.period}
                </p>

                {/* Avatar */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full transition-all duration-500"
                    style={{
                      filter: isActive ? "grayscale(0%)" : "grayscale(100%)",
                      boxShadow: isActive ? `0 0 0 2px ${t.accentColor}` : "0 0 0 2px rgba(255,255,255,0.1)",
                    }}
                  >
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white leading-tight">{t.name}</p>
                    <p
                      className="text-[10px] font-mono transition-colors duration-300"
                      style={{ color: isActive ? t.accentColor : "rgba(255,255,255,0.35)" }}
                    >
                      {t.role}
                    </p>
                    <p className="text-[9px] font-mono text-white/20">{t.company}</p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-[12px] leading-relaxed text-white/50">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Hover: subtle glow */}
                {isActive && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[22px]"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${t.accentColor}18 0%, transparent 65%)`,
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hint */}
      <p className="mt-6 text-center font-mono text-[11px] text-text-secondary/40">
        hover a card to read
      </p>
    </SectionWrapper>
  );
}
