"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";

const STATS = [
  { value: "5+",   label: "Years"     },
  { value: "750+", label: "Users"     },
  { value: "9",    label: "Countries" },
];

export default function AboutCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Raw mouse position: -1 → 1 ── */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  /* ── Smooth spring tilt ── */
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-22, 22]), { stiffness: 110, damping: 18 });
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [16, -16]), { stiffness: 110, damping: 18 });

  /* ── Photo parallax — shifts opposite to tilt, reveals hidden area ── */
  const photoX = useSpring(useTransform(rawX, [-1, 1], [18, -18]), { stiffness: 80, damping: 20 });
  const photoY = useSpring(useTransform(rawY, [-1, 1], [12, -12]), { stiffness: 80, damping: 20 });

  /* ── Glare spot ── */
  const glareXPct = useTransform(rawX, [-1, 1], [15, 85]);
  const glareYPct = useTransform(rawY, [-1, 1], [10, 90]);
  const glareBg   = useMotionTemplate`radial-gradient(circle at ${glareXPct}% ${glareYPct}%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.18) 22%, transparent 52%)`;

  /* ── Holographic foil hue shifts with cursor X ── */
  const hueShift  = useTransform(rawX, [-1, 1], [0, 180]);
  const foilFilter = useTransform(hueShift, (h) => `hue-rotate(${h}deg) saturate(1.4) brightness(1.08)`);

  /* ── Shadow depth follows tilt ── */
  const shadowX = useTransform(rawX, [-1, 1], [-24, 24]);
  const shadowY = useTransform(rawY, [-1, 1], [-16, 16]);
  const cardShadow = useMotionTemplate`${shadowX}px ${shadowY}px 60px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.18)`;

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width  * 2 - 1);
    rawY.set((e.clientY - rect.top)  / rect.height * 2 - 1);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <SectionWrapper id="about" alternate>
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">

        {/* ── 3D Holographic Card ─────────────────────────────────── */}
        <div
          ref={containerRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="w-full max-w-[260px] shrink-0 mx-auto md:mx-0"
          style={{ perspective: "900px" }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", boxShadow: cardShadow }}
            className="relative w-full rounded-[28px] overflow-hidden cursor-pointer"
            initial={{ opacity: 0, y: 24, rotateY: -6 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 1 — Silver metallic base */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(128deg, #b0b0b0 0%, #efefef 18%, #c8c8c8 34%, #f7f7f7 50%, #c4c4c4 66%, #f0f0f0 82%, #d4d4d4 100%)",
              }}
            />

            {/* 2 — Holographic rainbow foil (shifts hue with cursor) */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(115deg, #ff006688 0%, #ffaa0088 16%, #00ff6688 33%, #0077ff88 50%, #cc00ff88 66%, #ff006688 100%)",
                backgroundSize: "200% 200%",
                filter: foilFilter,
                mixBlendMode: "overlay",
              }}
            />

            {/* 3 — Top bar label */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{
                  background: "rgba(255,255,255,0.28)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              >
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white drop-shadow">
                  ✦ Rare
                </span>
              </div>
              <span className="font-mono text-[9px] text-white/50">UX / Research</span>
            </div>

            {/* 4 — Photo with parallax */}
            <div
              className="relative mx-3 overflow-hidden rounded-[18px]"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Oversized image so tilt reveals hidden edges */}
              <motion.div
                className="absolute"
                style={{
                  width: "136%",
                  height: "136%",
                  top: "-18%",
                  left: "-18%",
                  x: photoX,
                  y: photoY,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/About m/Me smiling in the safari van 2.JPEG"
                  alt="Pradeep"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </motion.div>

              {/* Matte/depth overlay on photo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.22) 100%)",
                }}
              />

              {/* Shine on photo — follows cursor */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: glareBg, mixBlendMode: "overlay" }}
              />
            </div>

            {/* 5 — Stats bar */}
            <div className="relative z-10 mx-3 mb-3 mt-3 grid grid-cols-3 gap-1.5">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl px-2 py-2.5 text-center"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <p className="font-heading text-[15px] font-bold text-white drop-shadow-sm">{s.value}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-white/55">{s.label}</p>
                </div>
              ))}
            </div>

            {/* 6 — Full card glare (on top of everything) */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[28px]"
              style={{ background: glareBg, mixBlendMode: "soft-light", opacity: 0.7 }}
            />

            {/* 7 — Card edge highlight */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px]"
              style={{
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.08)",
              }}
            />
          </motion.div>
        </div>

        {/* ── Right side ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
            About Me
          </span>

          <h2 className="mt-4 font-heading text-4xl font-bold leading-tight text-text md:text-[3rem]">
            Hii! I&apos;m Pradeep.
          </h2>
          <p className="mt-2 font-mono text-sm tracking-wide text-text-secondary">
            Product Designer &amp; Researcher &nbsp;·&nbsp; Seeking Full-time roles
          </p>

          <p className="mt-7 text-[15.5px] leading-[1.85] text-text-secondary">
            Grew up in coastal Vizag, India. Started designing for a startup clothing brand — drew a hanger icon from scratch because nobody puts clothes in a cart. That one decision started everything.
          </p>
          <p className="mt-4 text-[15.5px] leading-[1.85] text-text-secondary">
            Now at <strong className="text-text">University of Maryland</strong> doing MS in Data Science + UX Research. Built tools for NASA, shipped products at an AI startup, creative-directed an esports org — and got sponsored to fly to{" "}
            <strong className="text-text">Nairobi, Kenya</strong> to train professionals on the system I designed.
          </p>
          <p className="mt-4 text-[15.5px] leading-[1.85] text-text-secondary">
            Off the clock: Marvel action figures, Lego sets, and photographing Hot Wheels like they&apos;re full editorial shoots. Priorities. 🏎️
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-text/90"
            >
              Full Story
            </Link>
            <a
              href="https://linkedin.com/in/pradeepyellapu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-text transition-all hover:-translate-y-px hover:bg-neutral-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
