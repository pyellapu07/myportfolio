"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState<Record<number, boolean>>({});
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Appear after initial page-load animations settle */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3400);
    return () => clearTimeout(t);
  }, []);

  /* Listen for header notification button tap (mobile) */
  useEffect(() => {
    const open = () => setMobileOpen(true);
    window.addEventListener("open-testimonials", open);
    return () => window.removeEventListener("open-testimonials", open);
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

      {/* ── Mobile: bottom sheet (triggered by header notification icon) ── */}
      <div className="md:hidden">
        {/* Bottom sheet */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 72 || info.velocity.y > 400) setMobileOpen(false);
                }}
                className="fixed bottom-0 left-0 right-0 z-50 touch-none rounded-t-3xl border-t border-white/50 bg-white/92 pb-safe shadow-[0_-8px_48px_rgba(0,0,0,0.13)] backdrop-blur-2xl"
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1 w-9 rounded-full bg-neutral-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 pt-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    What people say
                  </p>
                  <button onClick={() => setMobileOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 active:bg-neutral-200">
                    <X size={12} />
                  </button>
                </div>

                {/* Cards */}
                <div className="max-h-[62vh] overflow-y-auto px-4 pb-10 space-y-3">
                  {TESTIMONIALS.map((item, i) => {
                    const isExpanded = !!sheetExpanded[i];
                    return (
                      <div key={i} className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                        {/* Top accent line */}
                        <div className="mb-3 h-[1.5px] w-full rounded-full bg-gradient-to-r from-orange-400/50 via-accent/25 to-transparent" />

                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="relative h-9 w-9 shrink-0">
                            {item.avatar ? (
                              <Image src={item.avatar} alt={item.name} fill sizes="36px" className="rounded-full object-cover ring-1 ring-black/8" />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[10px] font-bold text-white">
                                {item.initials}
                              </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-green-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] font-semibold leading-tight text-neutral-900">{item.name}</p>
                            <p className="font-mono text-[9px] leading-tight text-neutral-400">{item.role}</p>
                            <p className="font-mono text-[8.5px] leading-tight text-neutral-300">{item.sub}</p>
                          </div>
                          <span className="ml-auto font-serif text-2xl leading-none text-orange-300/60 select-none">&ldquo;</span>
                        </div>

                        <AnimatePresence mode="wait">
                          {!isExpanded ? (
                            <motion.p key={`s-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                              className="text-[12.5px] leading-relaxed text-neutral-700">
                              {item.short}
                            </motion.p>
                          ) : (
                            <motion.p key={`f-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                              className="text-[12px] leading-relaxed text-neutral-600">
                              {item.full}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={() => setSheetExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                          className="mt-2 font-mono text-[10px] font-semibold text-accent transition-colors active:text-accent/60"
                        >
                          {isExpanded ? "read less -" : "read more -"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
