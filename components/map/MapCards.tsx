"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PROJECTS, type Project } from "./projects";
import { naturalEarth } from "./projection";
import { WORLD_MAP } from "./worldMap";

// Project cards floating over the map, AIRLA-style: dead straight, each with
// its own space, sized and faded by depth, drifting slowly and shifting with
// the cursor in parallax. A faint dotted line ties every card to its place.
// Hovering brings a card forward into focus with its title beneath.

const ASPECT = 0.625; // 16:10, as the thumbnails
const W_NEAR = 124; // card width at depth 0 (closest)
const W_FAR = 84; // card width at depth 1 (farthest)
const W_NODE = 44; // related-node width
const ORBIT = 26; // px between a parent card's edge and its nodes
const GAP = 14; // px kept clear between cards
const LIFT = 46; // px a card floats above its place before relaxing
const PARALLAX = 22; // px the nearest card shifts at the box edge
const SETTLE = [0.2, 0.6, 0.35, 1] as const;

type Placed = Project & {
  /** Anchor: the project's place on the map, px in the box. */
  ax: number;
  ay: number;
  /** Card centre after relaxation, px in the box. */
  cx: number;
  cy: number;
  w: number;
  h: number;
  /** 0 nearest .. 1 farthest. */
  depth: number;
  /** Drift phase, so cards never move in lockstep. */
  phase: number;
  /** Extra room kept clear round the card for its related nodes. */
  pad: number;
};

function rand(seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

type Node = Project & { parent: string; angle: number };

// Cards start just above their place, then push each other apart (rect
// overlap + gap) while a weak spring pulls each back towards its anchor and
// the box edges hold them in.
function layout(bw: number, bh: number): Placed[] {
  const cards: Placed[] = PROJECTS.filter((p) => !p.parent).map((p, i) => {
    const [mx, my] = naturalEarth(p.lon, p.lat);
    const ax = (mx / WORLD_MAP.width) * bw;
    const ay = (my / WORLD_MAP.height) * bh;
    const depth = rand(i + 1);
    const w = W_NEAR + (W_FAR - W_NEAR) * depth;
    const a = rand(i + 7) * Math.PI * 2;
    return {
      ...p,
      ax,
      ay,
      cx: ax + Math.cos(a) * 12,
      cy: ay - LIFT + Math.sin(a) * 12,
      w,
      h: w * ASPECT,
      depth,
      phase: rand(i + 13) * Math.PI * 2,
      pad: PROJECTS.some((q) => q.parent === p.id) ? ORBIT + W_NODE : 0,
    };
  });
  for (let it = 0; it < 240; it++) {
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i];
        const b = cards[j];
        const ox = (a.w + b.w) / 2 + a.pad + b.pad + GAP - Math.abs(a.cx - b.cx);
        const oy = (a.h + b.h) / 2 + a.pad + b.pad + GAP + 14 - Math.abs(a.cy - b.cy); // +14 leaves room for a title
        if (ox > 0 && oy > 0) {
          // Separate along the shallower axis.
          if (ox < oy) {
            const s = (a.cx < b.cx ? -1 : 1) * ox * 0.5;
            a.cx += s;
            b.cx -= s;
          } else {
            const s = (a.cy < b.cy ? -1 : 1) * oy * 0.5;
            a.cy += s;
            b.cy -= s;
          }
        }
      }
    }
    for (const c of cards) {
      c.cx += (c.ax - c.cx) * 0.02;
      c.cy += (c.ay - LIFT - c.cy) * 0.02;
      c.cx = Math.min(bw - c.w / 2 - c.pad - 6, Math.max(c.w / 2 + c.pad + 6, c.cx));
      c.cy = Math.min(bh - c.h / 2 - c.pad - 20, Math.max(c.h / 2 + c.pad + 6, c.cy));
    }
  }
  return cards;
}

const NODES: Node[] = PROJECTS.filter((p): p is Project & { parent: string } => !!p.parent).map((p, i, all) => ({
  ...p,
  // Spread round the lower half and sides of the parent, like satellites.
  angle: Math.PI * (0.05 + (0.9 * (i + 0.5)) / all.length),
}));

export default function MapCards({ delay = 0 }: { delay?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [cursor, setCursor] = useState({ x: 0, y: 0 }); // -1..1 from box centre
  const [hover, setHover] = useState<string | null>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A slow clock for the drift; 20fps is plenty for motion this gentle.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    const id = setInterval(() => setT((performance.now() - t0) / 1000), 50);
    return () => clearInterval(id);
  }, []);

  const cards = useMemo(() => (box.w ? layout(box.w, box.h) : []), [box.w, box.h]);

  const pos = (c: Placed) => {
    // Nearer cards shift more with the cursor and drift a little further.
    const near = 1 - c.depth;
    const px = -cursor.x * PARALLAX * (0.25 + near);
    const py = -cursor.y * PARALLAX * 0.6 * (0.25 + near);
    const dx = Math.sin(t * 0.45 + c.phase) * 3 * (0.4 + near);
    const dy = Math.cos(t * 0.38 + c.phase * 1.3) * 4 * (0.4 + near);
    return { x: c.cx + px + dx, y: c.cy + py + dy };
  };

  return (
    <div
      ref={boxRef}
      className="absolute inset-0"
      onPointerMove={(e) => {
        const r = boxRef.current?.getBoundingClientRect();
        if (r) setCursor({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 });
      }}
      onPointerLeave={() => setCursor({ x: 0, y: 0 })}
    >
      {/* Dotted threads from each card to its place */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {cards.map((c, i) => {
          const p = pos(c);
          const on = hover === c.id;
          return (
            <motion.g
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: on ? 0.9 : 0.35 }}
              transition={{ opacity: { delay: hover ? 0 : delay + 0.3 + i * 0.04, duration: 0.4 } }}
            >
              <line x1={c.ax} y1={c.ay} x2={p.x} y2={p.y + c.h / 2} stroke="#0a0a0a" strokeWidth={1} strokeDasharray="1 4" strokeLinecap="round" />
              <circle cx={c.ax} cy={c.ay} r={on ? 3 : 2} fill="#0a0a0a" />
            </motion.g>
          );
        })}
      </svg>

      {cards.map((c, i) => {
        const p = pos(c);
        const on = hover === c.id;
        const dim = hover && !on;
        // Depth haze: far cards are fainter and softer; the hovered one is crisp.
        const blur = on ? 0 : +(c.depth * 1.6).toFixed(2);
        // Opaque card; distance reads as a white haze over the image.
        const haze = on ? 0 : dim ? 0.55 : c.depth * 0.38;
        return (
          <motion.div
            key={c.id}
            className="absolute"
            style={{ left: 0, top: 0, width: c.w, height: c.h, zIndex: on ? 200 : Math.round((1 - c.depth) * 100) }}
            initial={{ opacity: 0, x: c.ax - c.w / 2, y: c.ay - c.h / 2, scale: 0.4 }}
            animate={{ opacity: 1, x: p.x - c.w / 2, y: p.y - c.h / 2, scale: on ? 1.08 : 1 }}
            transition={{
              x: { duration: 0.12, ease: "linear" },
              y: { duration: 0.12, ease: "linear" },
              scale: { delay: hover ? 0 : delay + i * 0.04, duration: 0.6, ease: SETTLE },
              opacity: { delay: hover ? 0 : delay + i * 0.04, duration: 0.4 },
            }}
            onPointerEnter={() => setHover(c.id)}
            onPointerLeave={() => setHover(null)}
          >
            <Link href={c.href} className="block h-full w-full" aria-label={`${c.title}, ${c.place}`}>
              {/* Square, flat frame; the blur stays inside it. */}
              <span className="relative block h-full w-full overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- 320px thumbs, already sized */}
                <img
                  src={c.thumb}
                  alt=""
                  width={c.w}
                  height={c.h}
                  className="h-full w-full scale-[1.04] object-cover transition-[filter] duration-300 ease-out"
                  style={{ filter: `blur(${blur}px)` }}
                  draggable={false}
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300"
                  style={{ opacity: haze }}
                />
              </span>
              <span
                className={`pointer-events-none absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.03em] text-black transition-opacity duration-200 ${
                  on ? "opacity-100" : "opacity-0"
                }`}
              >
                {c.title}
              </span>
            </Link>
          </motion.div>
        );
      })}

      {/* Related nodes: small, deep cards orbiting their parent, pulled into
          focus when the parent is hovered. */}
      {NODES.map((n, i) => {
        const parent = cards.find((c) => c.id === n.parent);
        if (!parent) return null;
        const pp = pos(parent);
        const lit = hover === n.parent || hover === n.id;
        const r = parent.w / 2 + ORBIT + W_NODE / 2;
        const spin = t * 0.08;
        const x = pp.x + Math.cos(n.angle + spin) * r * (lit ? 1.4 : 1);
        const y = pp.y + Math.sin(n.angle + spin) * (parent.h / 2 + ORBIT + W_NODE * ASPECT / 2) * (lit ? 1.55 : 1);
        const h = W_NODE * ASPECT;
        return (
          <motion.div
            key={n.id}
            className="absolute"
            style={{ left: 0, top: 0, width: W_NODE, height: h, zIndex: lit ? 210 : 5 }}
            initial={{ opacity: 0, x: pp.x - W_NODE / 2, y: pp.y - h / 2 }}
            animate={{ opacity: 1, x: x - W_NODE / 2, y: y - h / 2, scale: lit ? 1.3 : 1 }}
            transition={{
              x: { duration: 0.3, ease: SETTLE },
              y: { duration: 0.3, ease: SETTLE },
              scale: { duration: 0.35, ease: SETTLE },
              opacity: { delay: delay + 0.6 + i * 0.05, duration: 0.4 },
            }}
            onPointerEnter={() => setHover(n.id)}
            onPointerLeave={() => setHover(null)}
          >
            <Link href={n.href} className="block h-full w-full" aria-label={`${n.title}, ${n.role}`}>
              <span className="relative block h-full w-full overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- 320px thumbs, already sized */}
                <img src={n.thumb} alt="" width={W_NODE} height={h} className="h-full w-full object-cover" draggable={false} />
                <span
                  className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300"
                  style={{ opacity: lit ? 0 : 0.6 }}
                />
              </span>
              <span
                className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold leading-none tracking-[-0.03em] text-black transition-opacity duration-200 ${
                  hover === n.id ? "opacity-100" : "opacity-0"
                }`}
              >
                {n.title}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
