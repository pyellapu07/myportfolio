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

export default function AboutCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  /* ── Tilt ── */
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-22, 22]), { stiffness: 110, damping: 18 });
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [16, -16]), { stiffness: 110, damping: 18 });

  /* ── Photo parallax ── */
  const photoX = useSpring(useTransform(rawX, [-1, 1], [18, -18]), { stiffness: 80, damping: 20 });
  const photoY = useSpring(useTransform(rawY, [-1, 1], [12, -12]), { stiffness: 80, damping: 20 });

  /* ── Glare ── */
  const glareXPct = useTransform(rawX, [-1, 1], [15, 85]);
  const glareYPct = useTransform(rawY, [-1, 1], [10, 90]);
  const glareBg   = useMotionTemplate`radial-gradient(circle at ${glareXPct}% ${glareYPct}%, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.16) 22%, transparent 52%)`;

  /* ── Holographic foil — less green, more chrome blues/pinks ── */
  const hueShift   = useTransform(rawX, [-1, 1], [0, 140]);
  const foilFilter = useTransform(hueShift, (h) => `hue-rotate(${h}deg) saturate(1.2) brightness(1.06)`);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width  * 2 - 1);
    rawY.set((e.clientY - rect.top)  / rect.height * 2 - 1);
  }
  function onMouseLeave() { rawX.set(0); rawY.set(0); }

  return (
    <SectionWrapper id="about" alternate>
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">

        {/* ── 3D Holographic Card ─────────────────────────────────── */}
        <div
          ref={containerRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="w-full max-w-[240px] shrink-0 mx-auto md:mx-0"
          style={{ perspective: "900px" }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", aspectRatio: "3/4" }}
            className="relative w-full rounded-[24px] overflow-hidden cursor-pointer flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 1 — Chrome metallic base */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(145deg, #9a9a9a 0%, #e8e8e8 20%, #c0c0c0 38%, #f5f5f5 52%, #b8b8b8 68%, #ececec 84%, #d0d0d0 100%)",
              }}
            />

            {/* 2 — Holographic foil: blues, purples, pinks — minimal green */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(118deg, #ff66cc99 0%, #9966ff99 20%, #66aaff99 40%, #cc44ff99 60%, #ff88aa99 80%, #ff66cc99 100%)",
                backgroundSize: "180% 180%",
                filter: foilFilter,
                mixBlendMode: "overlay",
              }}
            />

            {/* 3 — Photo (takes ~65% of card height) */}
            <div className="relative overflow-hidden rounded-[16px] mx-3 mt-3 flex-1">
              <motion.div
                className="absolute"
                style={{ width: "136%", height: "136%", top: "-18%", left: "-18%", x: photoX, y: photoY }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/About m/Me smiling in the safari van 2.JPEG"
                  alt="Pradeep"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </motion.div>

              {/* Matte layer */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.18) 100%)",
                }}
              />

              {/* Photo shine */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: glareBg, mixBlendMode: "overlay" }}
              />
            </div>

            {/* 4 — Bottom info panel */}
            <div
              className="relative z-10 mx-3 mb-3 mt-2 rounded-[14px] px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.38)",
              }}
            >
              {/* Level + title */}
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-mono text-[9px] font-bold tracking-wider"
                  style={{ color: "rgba(80,60,180,0.85)" }}
                >
                  Lv.3
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-800">
                  Product Designer
                </span>
              </div>

              {/* Stars */}
              <div className="mt-1 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Fun fact */}
              <p className="mt-1.5 font-mono text-[9px] leading-tight text-neutral-500 italic">
                Owns more action figures than design books 🤖
              </p>
            </div>

            {/* 5 — Full card glare */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ background: glareBg, mixBlendMode: "soft-light", opacity: 0.65 }}
            />

            {/* 6 — Groove border */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[24px]"
              style={{
                boxShadow:
                  "inset 0 1.5px 0 rgba(255,255,255,0.75), inset 0 -1.5px 0 rgba(0,0,0,0.12), inset 1.5px 0 rgba(255,255,255,0.45), inset -1.5px 0 rgba(0,0,0,0.08)",
                border: "1.5px solid rgba(160,160,160,0.5)",
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
