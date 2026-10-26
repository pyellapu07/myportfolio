"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { immersion } from "./immersion";
import { CommitGrid, ResearchReport, SystemLedger } from "@/components/landing/Widgets";

// The evidence cards in the spatial view. On the flat map they sit small in
// its quiet corners, thumbnails like the project cards. Flying in, they slide
// out to the screen's edges and stay there, fixed to the camera like a HUD,
// so the globe holds only the work. Rendered outside the map stage (whose
// zoom and blur would carry them along) and placed from its box each tick.
// Hover brings one up to full size.

const FLAT = 0.56; // scale on the flat map
const DOCK = 0.62; // scale docked at the edges
const EDGE = 24; // px from the screen edge, docked
const TOP = 104; // clear of the header
const BOTTOM = 112; // clear of the chat bar's row
const RIGHT = 92; // clear of the view switch

type Card = {
  key: string;
  /** Flat position, as fractions of the map box (card centre). */
  fx: number;
  fy: number;
  /** Docked corner: the card's scaled box hugs it. */
  dock: "top-left" | "bottom-left" | "right";
  w: number;
  node: ReactNode;
};

const CARDS: Card[] = [
  { key: "commits", fx: 0.87, fy: 0.13, dock: "top-left", w: 296, node: <CommitGrid width={296} /> },
  { key: "ledger", fx: 0.88, fy: 0.8, dock: "right", w: 318, node: <SystemLedger width={318} /> },
  { key: "research", fx: 0.09, fy: 0.84, dock: "bottom-left", w: 300, node: <ResearchReport width={300} /> },
];

export default function EvidenceDock({ delay = 0 }: { delay?: number }) {
  // Sits in the map box only to measure it; the cards live in a portal.
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLDivElement>());
  const hoverRef = useRef<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // Client only: the portal needs document.body.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    const t0 = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lift = new Map<string, number>(); // eased 0..1 hover amount per card
    return immersion.onTick((im) => {
      const box = boxRef.current?.getBoundingClientRect();
      const layer = layerRef.current;
      if (!box || !layer) return;
      const root = document.documentElement;
      // The Index view pins its own copies; an open project has the stage.
      const hidden = root.dataset.view === "index" || !!im.detail;
      // Follow the map out as the page scrolls on into the sections.
      const fade = Number(root.style.getPropertyValue("--map-opacity") || 1);
      layer.style.opacity = hidden ? "0" : String(Math.max(0, Math.min(1, fade)));
      layer.style.pointerEvents = hidden || fade < 0.2 ? "none" : "";
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Ease the hand-off so cards glide rather than track k linearly.
      const k = im.k * im.k * (3 - 2 * im.k);
      const t = reduce ? 0 : (performance.now() - t0) / 1000;
      for (const c of CARDS) {
        const el = els.current.get(c.key);
        if (!el) continue;
        const h = el.offsetHeight;
        const on = hoverRef.current === c.key;
        const o = (lift.get(c.key) ?? 0) + ((on ? 1 : 0) - (lift.get(c.key) ?? 0)) * 0.16;
        lift.set(c.key, o);
        // Flat: centred on its spot in the map box, with a slow bob.
        const fs = FLAT;
        const fx = box.left + c.fx * box.width - (c.w * fs) / 2 + Math.sin(t * 0.4 + c.fy * 9) * 3;
        const fy = box.top + c.fy * box.height - (h * fs) / 2 + Math.cos(t * 0.35 + c.fx * 9) * 4;
        // Docked: hugging its edge.
        const ds = DOCK;
        const dx = c.dock === "right" ? vw - RIGHT - c.w * ds : EDGE;
        const dy = c.dock === "top-left" ? TOP : c.dock === "bottom-left" ? vh - BOTTOM - h * ds : (vh - h * ds) / 2;
        const x = fx + (dx - fx) * k;
        const y = fy + (dy - fy) * k;
        const base = FLAT + (DOCK - FLAT) * k;
        const sc = base + (1 - base) * o;
        // Grow from the side that faces the screen's middle, so a hovered
        // card opens inward instead of off the edge.
        const ox = c.dock === "right" && k > 0.5 ? "100%" : x + (c.w * base) / 2 > vw / 2 ? "100%" : "0%";
        const oy = y + (h * base) / 2 > vh / 2 ? "100%" : "0%";
        el.style.transformOrigin = `${ox} ${oy}`;
        // Placed by its scaled top-left corner; the origin shift is undone.
        const shiftX = ox === "100%" ? c.w * (1 - base) : 0;
        const shiftY = oy === "100%" ? h * (1 - base) : 0;
        el.style.transform = `translate3d(${(x - shiftX).toFixed(2)}px, ${(y - shiftY).toFixed(2)}px, 0) scale(${sc.toFixed(3)})`;
        el.style.zIndex = o > 0.02 ? "2" : "1";
      }
    });
  }, []);

  return (
    <>
      <div ref={boxRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
      {mounted &&
        createPortal(
          <div
            ref={layerRef}
            className="pointer-events-none fixed inset-0 z-[35] hidden select-none transition-opacity duration-500 lg:block"
            onDragStart={(e) => e.preventDefault()}
          >
            {CARDS.map((c, i) => (
              <div
                key={c.key}
                ref={(el) => {
                  if (el) els.current.set(c.key, el);
                }}
                className="pointer-events-auto absolute left-0 top-0 will-change-transform"
                style={{ width: c.w }}
                onPointerEnter={() => setHover(c.key)}
                onPointerLeave={() => setHover((h) => (h === c.key ? null : h))}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + 0.5 + i * 0.08, duration: 0.6, ease: [0.2, 0.6, 0.35, 1] }}
                >
                  {c.node}
                </motion.div>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
