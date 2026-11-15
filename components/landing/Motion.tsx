"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";

// Two scroll motions after Joby Aviation's site: headlines whose words ink in
// one by one as they pass up the screen, and a rounded video card that grows
// to full bleed while its caption stays pinned.

function Word({ word, progress, range, dim }: { word: string; progress: MotionValue<number>; range: [number, number]; dim: number }) {
  const opacity = useTransform(progress, range, [dim, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/** Text whose words go from faint to full as it scrolls through the screen. */
export function ScrubText({ text, className = "", dim = 0.16 }: { text: string; className?: string; dim?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });
  const words = text.split(" ");
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} dim={dim} />
      ))}
    </span>
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
  // First 30%: the card opens. Then each reel holds its share of the rest.
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
    <section ref={ref} id="reel" className="relative bg-black" style={{ height: `${120 + reels.length * 90}vh` }}>
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
        <div className="absolute bottom-[clamp(7rem,14vh,9rem)] left-5 max-w-[340px] border-l border-white pl-4 text-white sm:left-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/60">
            {String(i + 1).padStart(2, "0")} / {String(reels.length).padStart(2, "0")} · {r.label}
          </p>
          <p className="mt-2 text-[17px] leading-snug tracking-[-0.01em]">{r.caption}</p>
        </div>
        <p className="absolute right-5 top-8 font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/60 sm:right-8">Reel · scroll</p>
      </div>
    </section>
  );
}
