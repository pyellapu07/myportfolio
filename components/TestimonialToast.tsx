"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ── Data ──────────────────────────────────────────────────────────── */
interface Testimonial {
  name: string;
  role: string;
  sub: string;
  avatar: string | null;
  initials?: string;
  rotate: number;
  top: string;  // distance from top of viewport
  right: string; // distance from right edge
  short: string;
  full: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Bhushan Suryavanshi",
    role: "Founder, CEO - MarketCrunch AI",
    sub: "x-Amazon, Wharton, CMU",
    avatar: "/bhushan marketcrunch.jpeg",
    rotate: -2.5,
    top: "22%",
    right: "6rem",
    short:
      "Pradeep redesigned our platform end-to-end. The 167% engagement lift wasn't luck, it was craft.",
    full:
      "Pradeep joined us as a design intern and quickly became the backbone of our product redesign. His UX audit was thorough, his prototypes were polished, and his ability to run usability sessions and translate findings into actionable improvements was beyond what we expected. The numbers speak for themselves.",
  },
  {
    name: "Catherine Nakalembe (Ph.D.)",
    role: "NASA Harvest Africa Director, UMD",
    sub: "2025 TED Fellow, Africa Food Prize",
    avatar: "/catherine nakalembe.webp",
    rotate: 2,
    top: "38%",
    right: "7.5rem",
    short:
      "He makes satellite data feel human. Our users finally understand what they're looking at.",
    full:
      "Working with Pradeep has been a genuine pleasure. He brought a rare blend of design sensibility and technical understanding to a domain that most designers shy away from - geospatial, climate, and agricultural data. He didn't just make things look good; he made complex information intuitive for analysts across 9 countries.",
  },
  {
    name: "Ravi Kumar",
    role: "Service Delivery Manager, Computacenter",
    sub: "Managed Pradeep directly - 18 months",
    avatar: "/ravi kumar.jpeg",
    rotate: -1.5,
    top: "28%",
    right: "5rem",
    short:
      "Never delayed on any task assigned to him. A true team player, and a creative artist when it comes to editing or drawing!",
    full:
      "Happy to write this recommendation for Pradeep, post working very closely for 18 months. He joined us as an intern from SRM College and later got converted to permanent employment. He is a knowledgeable person and easy going. Never delayed on any task assigned to him. A true team player, and a creative artist as well when it comes to editing or drawing. I wish him the best for his masters in the states. All the best and keep doing what you do!",
  },
];

/* ── Component ─────────────────────────────────────────────────────── */
export default function TestimonialToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Appear after initial page-load animations settle */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3400);
    return () => clearTimeout(t);
  }, []);

  /* Auto-cycle — pauses while expanded */
  useEffect(() => {
    if (expanded) {
      if (cycleRef.current) clearInterval(cycleRef.current);
      return;
    }
    cycleRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % TESTIMONIALS.length);
        setExpanded(false);
        setVisible(true);
      }, 480);
    }, 6200);
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [expanded]);

  const t = TESTIMONIALS[index];

  /* Shared avatar node to avoid repetition */
  const Avatar = ({ size = 8 }: { size?: number }) => (
    <div className={`relative h-${size} w-${size} shrink-0`}>
      {t.avatar ? (
        <Image
          src={t.avatar}
          alt={t.name}
          fill
          sizes={`${size * 4}px`}
          className="rounded-full object-cover ring-1 ring-black/8"
        />
      ) : (
        <div
          className={`flex h-${size} w-${size} items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[10px] font-bold text-white ring-1 ring-black/8`}
        >
          {t.initials}
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-white/80 bg-green-400" />
    </div>
  );

  return (
    <>
      {/* ── Desktop: floating angled sticker card ── */}
      <div
        className="pointer-events-none fixed z-30 hidden md:block"
        style={{ top: t.top, right: t.right }}
      >
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={index}
              drag
              dragMomentum={true}
              dragElastic={0.12}
              whileDrag={{ scale: 1.04, zIndex: 50 }}
              initial={{ opacity: 1, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: t.rotate }}
              exit={{ opacity: 0, scale: 0.9, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto cursor-grab active:cursor-grabbing"
              style={{ originX: "50%", originY: "50%" }}
            >
              <div className="relative w-[252px] overflow-hidden rounded-2xl border border-white/60 bg-white/72 shadow-[0_4px_28px_rgba(0,0,0,0.10),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-2xl">
                <div className="h-[1.5px] w-full bg-gradient-to-r from-orange-400/50 via-accent/30 to-transparent" />
                <div className="px-4 pb-3.5 pt-3">
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <Avatar size={8} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[10.5px] font-semibold leading-tight text-neutral-900">{t.name}</p>
                      <p className="truncate font-mono text-[9px] leading-tight text-neutral-400">{t.sub}</p>
                    </div>
                    <span className="ml-auto shrink-0 font-serif text-2xl leading-none text-orange-300/70 select-none">&ldquo;</span>
                  </div>
                  <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-wide text-neutral-400">{t.role}</p>
                  <AnimatePresence mode="wait">
                    {!expanded ? (
                      <motion.p key="short" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="text-[11.5px] leading-relaxed text-neutral-700">
                        {t.short}
                      </motion.p>
                    ) : (
                      <motion.p key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="text-[11px] leading-relaxed text-neutral-600">
                        {t.full}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button onClick={() => setExpanded((v) => !v)} className="mt-2 font-mono text-[10px] font-semibold text-accent transition-colors hover:text-accent/70">
                    {expanded ? "- less" : "read more -"}
                  </button>
                </div>
                {!expanded && (
                  <motion.div key={`prog-${index}`} className="absolute bottom-0 left-0 h-[1.5px] bg-orange-400/35" initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 6.2, ease: "linear" }} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile: slide-down notification from top ── */}
      <div className="pointer-events-none fixed left-3 right-3 top-3 z-30 md:hidden">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={`mob-${index}`}
              drag="y"
              dragConstraints={{ top: -300, bottom: 8 }}
              dragElastic={{ top: 0.6, bottom: 0.1 }}
              onDragEnd={(_, info) => {
                if (info.offset.y < -48 || info.velocity.y < -400) {
                  setVisible(false);
                }
              }}
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="pointer-events-auto touch-none"
            >
              {/* Notification pill */}
              <div
                className="overflow-hidden rounded-2xl border border-white/55 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
                onClick={() => setExpanded((v) => !v)}
              >
                {/* Drag handle pill */}
                <div className="flex justify-center pt-2">
                  <div className="h-1 w-8 rounded-full bg-neutral-300/70" />
                </div>

                <div className="flex items-start gap-3 px-4 pb-3.5 pt-2">
                  {/* Large avatar for notification */}
                  <div className="relative mt-0.5 h-10 w-10 shrink-0">
                    {t.avatar ? (
                      <Image src={t.avatar} alt={t.name} fill sizes="40px" className="rounded-full object-cover ring-1 ring-black/8" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white">
                        {t.initials}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-green-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-mono text-[11px] font-semibold text-neutral-900">{t.name}</p>
                      <span className="shrink-0 font-mono text-[9px] text-neutral-400">now</span>
                    </div>
                    <p className="font-mono text-[9px] text-neutral-400">{t.role}</p>

                    <AnimatePresence mode="wait">
                      {!expanded ? (
                        <motion.p key="mob-short" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-neutral-700">
                          {t.short}
                        </motion.p>
                      ) : (
                        <motion.p key="mob-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-1.5 text-[11.5px] leading-relaxed text-neutral-600">
                          {t.full}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <p className="mt-1 font-mono text-[9px] text-neutral-400">
                      {expanded ? "tap to collapse" : "tap to read more - swipe up to dismiss"}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {!expanded && (
                  <motion.div key={`mob-prog-${index}`} className="h-[1.5px] bg-orange-400/40" initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 6.2, ease: "linear" }} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
