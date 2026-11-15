"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";

const EASE = [0.16, 0.84, 0.24, 1] as const;

/**
 * Headline lines that rise into place from behind their own edge, one after
 * another, when they first come into view.
 */
export function LineRise({ lines, className = "", delay = 0 }: { lines: { text: string; className?: string }[]; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  // Watched on the wrapper: each line sits clipped below its own edge, so an
  // observer on the line itself would never see it enter.
  return (
    <motion.span className={`block ${className}`} initial={reduce ? false : "hidden"} whileInView="shown" viewport={{ once: true, amount: 0.3 }}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${l.className ?? ""}`}
            variants={{ hidden: { y: "105%", rotate: 2.5 }, shown: { y: "0%", rotate: 0 } }}
            transition={{ duration: 1.05, ease: EASE, delay: delay + i * 0.09 }}
            style={{ transformOrigin: "0% 100%" }}
          >
            {l.text}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export type Reel = { video: string; poster: string; label: string; caption: string };

/**
 * A pinned stage: the video starts as a rounded card in the middle and opens
 * to the full screen as you scroll; the reels change by thirds.
 */
export function ReelStage({ reels }: { reels: Reel[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // inset(vertical% horizontal% round radius), all from one value.
  const clipPath = useTransform(scrollYProgress, (p) => {
    const k = reduce ? 1 : Math.min(1, p / 0.3);
    const e = 1 - (1 - k) ** 3;
    return `inset(${18 * (1 - e)}% ${24 * (1 - e)}% round ${36 * (1 - e)}px)`;
  });
  const [i, setI] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setI(Math.min(reels.length - 1, Math.max(0, Math.floor(((p - 0.3) / 0.7) * reels.length)))));
  const r = reels[i];

  return (
    <section ref={ref} id="reel" data-header="dark" className="relative bg-black" style={{ height: `${120 + reels.length * 90}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          {reels.map((x, j) => (
            <video
              key={x.video}
              poster={x.poster}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: j === i ? 1 : 0 }}
            >
              <source src={x.video.replace(/\.mp4$/, ".webm")} type="video/webm" />
              <source src={x.video} type="video/mp4" />
            </video>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        </motion.div>
        {/* The pinned caption with its vertical rule. */}
        <div className="absolute bottom-[clamp(7rem,14vh,9rem)] left-5 max-w-[360px] border-l border-white pl-4 text-white sm:left-8">
          <motion.div key={r.label} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <p className="text-[15px] font-semibold tracking-[-0.01em]">{r.label}</p>
            <p className="mt-1.5 text-[16px] leading-snug tracking-[-0.01em] text-white/85">{r.caption}</p>
          </motion.div>
          <div className="mt-4 flex gap-1.5">
            {reels.map((x, j) => (
              <span key={x.label} className="h-[3px] w-6 rounded-full transition-colors duration-500" style={{ background: j === i ? "#fff" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
