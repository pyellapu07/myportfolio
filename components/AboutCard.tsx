"use client";

import { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";

const THICKNESS = 12; // number of stacked layers = visual depth in px

export default function AboutCard() {
  const cardRef    = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  /* ── Spring tilt ── */
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-26, 26]), { stiffness: 100, damping: 18 });
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [18, -18]), { stiffness: 100, damping: 18 });

  /* ── Photo parallax ── */
  const photoX = useSpring(useTransform(rawX, [-1, 1], [20, -20]), { stiffness: 80, damping: 20 });
  const photoY = useSpring(useTransform(rawY, [-1, 1], [14, -14]), { stiffness: 80, damping: 20 });

  /* ── Glare ── */
  const glareXPct = useTransform(rawX, [-1, 1], [12, 88]);
  const glareYPct = useTransform(rawY, [-1, 1], [8,  92]);
  const glareBg   = useMotionTemplate`radial-gradient(circle at ${glareXPct}% ${glareYPct}%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.18) 22%, transparent 52%)`;

  /* ── Foil — blues, purples, pinks ── */
  const hueShift   = useTransform(rawX, [-1, 1], [-30, 60]);
  const foilFilter = useTransform(hueShift, (h) => `hue-rotate(${h}deg) saturate(1.6) brightness(1.08) contrast(1.04)`);

  /* ── Track mouse across the ENTIRE about section ── */
  useEffect(() => {
    sectionRef.current = document.getElementById("about") as HTMLElement | null;

    function onMove(e: MouseEvent) {
      const section = sectionRef.current;
      const card    = cardRef.current;
      if (!section || !card) return;

      const sr = section.getBoundingClientRect();
      // Only active while inside the section
      if (e.clientY < sr.top || e.clientY > sr.bottom) {
        rawX.set(0); rawY.set(0); return;
      }

      // Normalise relative to the card's centre so tilt "aims" at the card
      const cr = card.getBoundingClientRect();
      const cx = cr.left + cr.width  / 2;
      const cy = cr.top  + cr.height / 2;

      // Range: half the section width/height → gives a gentle, natural feel
      const rx = Math.max(-1, Math.min(1, (e.clientX - cx) / (sr.width  * 0.55)));
      const ry = Math.max(-1, Math.min(1, (e.clientY - cy) / (sr.height * 0.55)));
      rawX.set(rx);
      rawY.set(ry);
    }

    function onLeave() { rawX.set(0); rawY.set(0); }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [rawX, rawY]);

  return (
    <SectionWrapper id="about" alternate>
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">

        {/* ── 3D Card ── */}
        <div
          className="w-full max-w-[300px] shrink-0 mx-auto md:mx-0"
          style={{ perspective: "900px", overflow: "visible" }}
        >
          <motion.div
            ref={cardRef}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", aspectRatio: "3/4" }}
            className="relative w-full cursor-pointer flex flex-col"
          >
            {/* ── Thickness layers (stacked behind front face) ── */}
            {Array.from({ length: THICKNESS }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-[24px]"
                style={{
                  transform: `translateZ(-${(i + 1) * 1.1}px)`,
                  background: i % 2 === 0
                    ? `hsl(0,0%,${62 - i * 2}%)`
                    : `hsl(0,0%,${70 - i * 2}%)`,
                  borderRadius: 24,
                }}
              />
            ))}

            {/* ── Front face ── */}
            <div
              className="relative flex flex-col w-full h-full overflow-hidden rounded-[24px]"
              style={{ transform: "translateZ(0)" }}
            >
              {/* Chrome metallic base — bright silver */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(145deg, #c8c8c8 0%, #f8f8f8 18%, #d8d8d8 35%, #ffffff 50%, #d0d0d0 66%, #f5f5f5 82%, #e0e0e0 100%)",
                }}
              />

              {/* Holographic foil — orange + violet theme */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(115deg, #ff6600bb 0%, #cc44ffbb 20%, #ff4400bb 38%, #9922ffbb 55%, #ff8833bb 72%, #aa33ffbb 88%, #ff6600bb 100%)",
                  backgroundSize: "220% 220%",
                  filter: foilFilter,
                  mixBlendMode: "overlay",
                  opacity: 0.32,
                }}
              />

              {/* Photo (flex-1 fills remaining height) */}
              <div className="relative overflow-hidden rounded-[16px] mx-3 mt-3 flex-1">
                <motion.div
                  className="absolute"
                  style={{ width: "136%", height: "136%", top: "-18%", left: "-18%", x: photoX, y: photoY }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/About m/Landscapeonroad.jpeg"
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

              {/* Bottom info panel */}
              <div
                className="relative z-10 mx-3 mb-3 mt-2 rounded-[14px] px-3 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.38)",
                }}
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[9px] font-bold tracking-wider" style={{ color: "rgba(80,60,180,0.85)" }}>
                    Lv.3
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-800">
                    Product Designer
                  </span>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-1.5 font-mono text-[9px] leading-tight text-neutral-500 italic">
                  Owns more action figures than design books
                </p>
              </div>

              {/* Full card glare overlay */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{ background: glareBg, mixBlendMode: "soft-light", opacity: 0.65 }}
              />

              {/* Groove border */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[24px]"
                style={{
                  boxShadow:
                    "inset 0 1.5px 0 rgba(255,255,255,0.78), inset 0 -1.5px 0 rgba(0,0,0,0.14), inset 1.5px 0 rgba(255,255,255,0.48), inset -1.5px 0 rgba(0,0,0,0.1)",
                  border: "1.5px solid rgba(150,150,150,0.55)",
                }}
              />
            </div>

          </motion.div>
        </div>

        {/* ── Right side ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex-1 overflow-hidden md:overflow-visible"
        >
          {/* Platinum star sticker — top-right, cropped on mobile */}
          <div
            className="pointer-events-none select-none absolute"
            style={{
              top: "-12px",
              right: "-18px",
              width: "88px",
              transform: "rotate(45deg)",
              filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.15))",
              zIndex: 10,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/platinum-star-sticker.png" alt="Platinum" draggable={false} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

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
            Grew up in coastal Vizag, India. Started designing for a startup clothing brand when a friend handed me his idea and zero budget. The first real call was drawing a hanger icon from scratch because no one puts clothes in a cart. That decision set everything in motion.
          </p>
          <p className="mt-4 text-[15.5px] leading-[1.85] text-text-secondary">
            Now at <strong className="text-text">University of Maryland</strong> doing MS in Data Science + UX Research. Built tools for NASA, shipped a full product redesign at a San Francisco AI startup, creative-directed an esports org, and got flown to{" "}
            <strong className="text-text">Nairobi, Kenya</strong> to train professionals on the system I designed.
          </p>
          <p className="mt-4 text-[15.5px] leading-[1.85] text-text-secondary">
            Off the clock: a Marvel and Star Wars figure collection I&apos;ve been building since age five, Lego sets my dad started me on, and photographing Hot Wheels like they&apos;re full editorial shoots. The collection is slightly out of hand.
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
