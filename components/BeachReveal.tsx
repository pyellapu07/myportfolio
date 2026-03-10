"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useSpring,
} from "framer-motion";

/* ─── Label data ─────────────────────────────────────────────────────────── */

type BadLabel = {
  text: string;
  style: React.CSSProperties;
  pos: React.CSSProperties;
  floatX: number[];
  floatY: number[];
  dur: number;
  delay: number;
};

type GoodLabel = {
  text: string;
  pos: React.CSSProperties;
  delay: number;
};

const BAD_LABELS: BadLabel[] = [
  {
    text: "Low Contrast ⚠",
    style: {
      color: "#ff4400",
      background: "#ffcc00",
      fontFamily: "'Comic Sans MS','Chalkboard SE',cursive",
      fontSize: "13px",
      fontWeight: 900,
      padding: "5px 10px",
      border: "3px dashed #ff0000",
      borderRadius: "3px",
      lineHeight: 1.2,
    },
    pos: { left: "6%", top: "14%" },
    floatX: [0, -12, 8, -5, 0],
    floatY: [0, 8, -10, 4, 0],
    dur: 4.2,
    delay: 0.1,
  },
  {
    text: "No Focus States",
    style: {
      color: "#ffffff",
      background: "#0000cc",
      fontFamily: "'Times New Roman',serif",
      fontSize: "10px",
      padding: "3px 7px",
      border: "4px solid #ff00ff",
      lineHeight: 1.2,
    },
    pos: { right: "8%", top: "21%" },
    floatX: [0, 10, -8, 14, 0],
    floatY: [0, -7, 12, -4, 0],
    dur: 5.1,
    delay: 0.3,
  },
  {
    text: "Broken UX",
    style: {
      color: "#ffff00",
      background: "#800080",
      fontFamily: "Impact,'Arial Black',sans-serif",
      fontSize: "19px",
      padding: "5px 12px",
      letterSpacing: "-1px",
      lineHeight: 1.2,
    },
    pos: { left: "27%", top: "40%" },
    floatX: [0, -8, 18, -10, 0],
    floatY: [0, 10, -7, 13, 0],
    dur: 3.8,
    delay: 0.5,
  },
  {
    text: "Cognitive Overload!",
    style: {
      color: "#00ff00",
      background: "#cc0000",
      fontFamily: "'Courier New',monospace",
      fontSize: "11px",
      padding: "4px 8px",
      border: "2px solid #0000ff",
      lineHeight: 1.2,
    },
    pos: { right: "5%", top: "50%" },
    floatX: [0, 14, -9, 7, 0],
    floatY: [0, -13, 7, -9, 0],
    dur: 4.6,
    delay: 0.2,
  },
  {
    text: "Inaccessible",
    style: {
      color: "#aaaaaa",
      background: "#dddddd",
      fontFamily: "cursive",
      fontSize: "12px",
      padding: "3px 8px",
      opacity: 0.55,
      lineHeight: 1.2,
    },
    pos: { left: "9%", top: "62%" },
    floatX: [0, 7, -14, 9, 0],
    floatY: [0, 13, -7, 11, 0],
    dur: 5.5,
    delay: 0.4,
  },
];

const GOOD_LABELS: GoodLabel[] = [
  { text: "Accessible ✓",    pos: { left: "6%",  top: "14%" }, delay: 0.2 },
  { text: "Clear Hierarchy", pos: { right: "6%", top: "21%" }, delay: 0.4 },
  { text: "Inclusive Design",pos: { left: "8%",  top: "58%" }, delay: 0.6 },
  { text: "Calm Interaction", pos: { right: "6%", top: "63%" }, delay: 0.8 },
];

/* ─── Phase machine ──────────────────────────────────────────────────────── */
type Phase = "bad" | "rising" | "good" | "hiding";

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function BeachReveal() {
  const [phase, setPhase] = useState<Phase>("bad");
  const containerRef = useRef<HTMLDivElement>(null);

  const isGood = phase === "good";

  /* ── Global repel effect — card pushes away from cursor even outside frame ── */
  const repelX = useMotionValue(0);
  const repelY = useMotionValue(0);
  const springRepelX = useSpring(repelX, { stiffness: 140, damping: 18 });
  const springRepelY = useSpring(repelY, { stiffness: 140, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Card centre in viewport coords
      const cardCX = rect.left + rect.width  / 2;
      const cardCY = rect.top  + rect.height / 2;
      // Vector from cursor → card centre (positive = card is to the right / below)
      const dx   = cardCX - e.clientX;
      const dy   = cardCY - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = 380; // px — repel zone
      const maxRepel  = 24;  // px — max displacement
      if (dist < maxRadius && dist > 0) {
        const strength = (1 - dist / maxRadius) * maxRepel;
        repelX.set((dx / dist) * strength);
        repelY.set((dy / dist) * strength);
      } else {
        repelX.set(0);
        repelY.set(0);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [repelX, repelY]);

  const reveal = () => {
    if (phase !== "bad") return;
    setPhase("rising");
    // At 700 ms (peak of glasses rise) → switch scene + settle
    setTimeout(() => setPhase("good"), 700);
  };

  const hide = () => {
    if (phase !== "good") return;
    setPhase("hiding");
    setTimeout(() => setPhase("bad"), 480);
  };

  /* ── Glasses y position (% of element's own height) ──
     viewBox 600×480 → at 500px container width, SVG height ≈ 400px
     bottom-0 means natural top ≈ 100px from container top
     y="0%"  → glasses fill bottom ~80% of container  (large POV, stays in scene 2)
     y="-25%"→ glasses rise fully over the eye area    (peak of putting-on)
     y="110%"→ completely hidden below frame            (bad / hiding)
  ── */
  // centered layout: y="0%" = center, y="300%" = hidden below, y="-60%" = risen above
  const glassesY =
    phase === "bad"    ? "300%" :
    phase === "rising" ? "-60%" :   // briefly overshoot above center
    phase === "good"   ? "0%"   :   // sit centered in the frame
    "300%";                          // hiding — drops down off screen

  const glassesDur =
    phase === "rising" ? 0.65 :
    phase === "good"   ? 0.5  :
    phase === "hiding" ? 0.55 :     // slightly slower for satisfying drop
    0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glassesEase: any =
    phase === "rising" ? [0.34, 1.56, 0.64, 1] :   // spring overshoot
    phase === "good"   ? [0.22, 1,    0.36, 1] :   // smooth settle
    phase === "hiding" ? [0.55, 0,    1,    0.45] : // gravity drop
    "linear";

  return (
    <motion.div style={{ x: springRepelX, y: springRepelY }}>
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-2xl shadow-xl"
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* ── Scenes ── */}
      <div className="absolute inset-0">
        {/* Scene 1 — bad beach */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: isGood ? 0 : 1, transition: "opacity 0.45s ease" }}
        >
          <source src="/scene%201.mp4" type="video/mp4" />
        </video>

        {/* Scene 2 — good beach */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: isGood ? 1 : 0, transition: "opacity 0.45s ease" }}
        >
          <source src="/scene%202.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Transition vignette (brief darkening during glasses rise) ─── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[15] bg-black"
        animate={{ opacity: phase === "rising" ? 0.28 : 0 }}
        transition={{ duration: phase === "rising" ? 0.3 : 0.45 }}
      />

      {/* ── Bad UX labels ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "bad" &&
          BAD_LABELS.map((label, i) => (
            <motion.span
              key={`bad-${i}`}
              className="pointer-events-none absolute z-10 block"
              style={{ ...label.pos, ...label.style }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: label.floatX, y: label.floatY }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              transition={{
                opacity: { duration: 0.5, delay: label.delay },
                x: { duration: label.dur, repeat: Infinity, ease: "easeInOut" },
                y: { duration: label.dur * 1.12, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {label.text}
            </motion.span>
          ))}
      </AnimatePresence>

      {/* ── Good UX labels ────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "good" &&
          GOOD_LABELS.map((label, i) => (
            <motion.span
              key={`good-${i}`}
              className="pointer-events-none absolute z-10 block rounded-lg bg-white/85 px-3 py-1.5 text-[11.5px] font-semibold text-gray-800 shadow-md backdrop-blur-sm"
              style={{ ...label.pos }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: label.delay, duration: 0.35 }}
            >
              {label.text}
            </motion.span>
          ))}
      </AnimatePresence>

      {/* ── Sunglasses PNG — centered, phase slide animation ───────────── */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
        <motion.div
          className="w-full"
          initial={{ y: "300%" }}
          animate={{ y: glassesY }}
          transition={{ duration: glassesDur, ease: glassesEase }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/eye%20glasses%20white.png"
            alt=""
            className="block w-full"
            style={{ opacity: 0.45 }}
            draggable={false}
          />
        </motion.div>
      </div>

      {/* ── Buttons ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap">
        <AnimatePresence mode="wait">
          {phase === "bad" && (
            <motion.button
              key="view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
              onClick={reveal}
              className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            >
              👓&nbsp;View Me
            </motion.button>
          )}
          {phase === "good" && (
            <motion.button
              key="remove"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
              onClick={hide}
              className="flex items-center gap-2 rounded-full bg-black/55 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            >
              ✕&nbsp;Remove Shades
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
    </motion.div>
  );
}
