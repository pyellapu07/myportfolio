"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";

const STATS = [
  { value: "5+",   label: "Years"     },
  { value: "750+", label: "Users"     },
  { value: "9",    label: "Countries" },
];

export default function AboutCard() {
  return (
    <SectionWrapper id="about" alternate>
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">

        {/* ── NFT Card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          whileHover={{ rotate: 0, y: -6 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[260px] shrink-0 cursor-default"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-[#0d0d12] p-3.5 shadow-[0_24px_64px_rgba(0,0,0,0.28)]">

            {/* Top row */}
            <div className="mb-3 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-3 py-[5px]">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white">✦ Rare</span>
              </div>
              <span className="font-mono text-[10px] text-white/30">UX / Research</span>
            </div>

            {/* Photo */}
            <div className="aspect-[3/4] overflow-hidden rounded-[18px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/About m/Me smiling in the safari van 2.JPEG"
                alt="Pradeep in Nairobi, Kenya"
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* Stats bar */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 px-0.5">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/[0.06] px-2 py-2.5 text-center"
                >
                  <p className="font-heading text-[15px] font-bold text-white">{s.value}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-white/35">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Subtle inner glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px]"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)",
              }}
            />
          </div>
        </motion.div>

        {/* ── Right side ───────────────────────────────────────────────── */}
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
