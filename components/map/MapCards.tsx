"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PROJECTS, type Project } from "./projects";
import { naturalEarth } from "./projection";
import { WORLD_MAP } from "./worldMap";

// Project cards pinned to the map. Cards that share a place sit in a jumbled
// stack and fan out on hover. Everything is a touch out of focus; the cursor
// is the lens, pulling whatever is near it sharp.

const CARD_W = 112;
const CARD_H = 70;
const MAX_BLUR = 1.8; // px, far from the cursor
const FOCUS_NEAR = 70; // px: fully sharp inside this
const FOCUS_FAR = 260; // px: fully soft beyond this
const SETTLE = [0.2, 0.6, 0.35, 1] as const;

type Stack = { place: string; x: number; y: number; items: Project[] };

function stacks(): Stack[] {
  const by = new Map<string, Stack>();
  for (const p of PROJECTS) {
    const [mx, my] = naturalEarth(p.lon, p.lat);
    const s = by.get(p.place) ?? { place: p.place, x: (mx / WORLD_MAP.width) * 100, y: (my / WORLD_MAP.height) * 100, items: [] };
    s.items.push(p);
    by.set(p.place, s);
  }
  return [...by.values()];
}

const STACKS = stacks();

// A fixed, slightly messy pile: small offsets and tilts per card.
const JUMBLE = [
  [0, 0, -3],
  [7, -6, 4],
  [-6, -10, -6],
  [10, -14, 7],
  [-3, -18, -2],
  [5, -22, 5],
  [-8, -25, -7],
];

export default function MapCards({ delay = 0 }: { delay?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const blurAt = (cx: number, cy: number) => {
    if (!cursor) return MAX_BLUR * 0.55;
    const d = Math.hypot(cx - cursor.x, cy - cursor.y);
    const u = Math.min(1, Math.max(0, (d - FOCUS_NEAR) / (FOCUS_FAR - FOCUS_NEAR)));
    return +(MAX_BLUR * u * u * (3 - 2 * u)).toFixed(2);
  };

  return (
    <div
      ref={boxRef}
      className="absolute inset-0"
      onPointerMove={(e) => {
        const r = boxRef.current?.getBoundingClientRect();
        if (r) setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerLeave={() => setCursor(null)}
    >
      {STACKS.map((st, si) => {
        const ax = (st.x / 100) * box.w;
        const ay = (st.y / 100) * box.h;
        const fanned = open === st.place;
        const n = st.items.length;
        return (
          <div
            key={st.place}
            className="absolute"
            style={{ left: `${st.x}%`, top: `${st.y}%`, zIndex: fanned ? 30 : 10 + si }}
            onPointerEnter={() => setOpen(st.place)}
            onPointerLeave={() => setOpen(null)}
          >
            {/* Pin */}
            <span className="absolute -left-[3px] -top-[3px] h-[6px] w-[6px] rounded-[1px] bg-black ring-2 ring-white" />
            {st.items.map((p, i) => {
              const j = JUMBLE[i % JUMBLE.length];
              // Fanned: a shallow arc above the pin, centred on it.
              const spread = n > 1 ? (i - (n - 1) / 2) * (CARD_W * 0.78) : 0;
              const x = fanned ? spread - CARD_W / 2 : j[0] - CARD_W / 2;
              const y = fanned ? -CARD_H - 22 - Math.abs(i - (n - 1) / 2) * 6 : j[1] - CARD_H - 14;
              const rot = fanned ? (i - (n - 1) / 2) * 2.5 : j[2];
              const blur = blurAt(ax + x + CARD_W / 2, ay + y + CARD_H / 2);
              return (
                <motion.div
                  key={p.id}
                  className="absolute"
                  style={{ width: CARD_W, height: CARD_H, zIndex: fanned ? 100 + i : n - i }}
                  initial={{ opacity: 0, scale: 0.6, x: -CARD_W / 2, y: -CARD_H / 2, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, x, y, rotate: rot }}
                  transition={{
                    default: { duration: 0.55, ease: SETTLE },
                    opacity: { delay: delay + si * 0.07 + i * 0.03, duration: 0.4 },
                    scale: { delay: delay + si * 0.07 + i * 0.03, duration: 0.6, ease: SETTLE },
                  }}
                >
                  <Link
                    href={p.href}
                    className="group relative block h-full w-full overflow-hidden rounded-[6px] bg-white shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition-shadow hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)]"
                    aria-label={`${p.title}, ${p.place}`}
                  >
                    {/* Focus blur lives on the image inside the clipped card, so
                        the card edge stays crisp and nothing clouds outside it.
                        Scaled up a touch so the blurred edge never shows white. */}
                    {/* eslint-disable-next-line @next/next/no-img-element -- 320px thumbs, already sized */}
                    <img
                      src={p.thumb}
                      alt=""
                      width={CARD_W}
                      height={CARD_H}
                      className="h-full w-full scale-[1.06] object-cover transition-[filter] duration-300 ease-out"
                      style={{ filter: `blur(${blur}px)` }}
                      draggable={false}
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-white/95 px-2 py-1 text-[9px] font-semibold leading-tight text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {p.title}
                      <span className="block font-normal text-black/55">{p.role}</span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
