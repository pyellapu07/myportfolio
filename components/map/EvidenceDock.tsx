"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { immersion } from "./immersion";
import { CommitGrid, ResearchReport, SystemLedger } from "@/components/landing/Widgets";

// The evidence cards in the spatial view: docked at the screen's edges, away
// from the work, fixed to the camera like a HUD on the flat map and in the
// globe alike, so the project cards keep the field to themselves. Rendered
// outside the map stage, whose zoom and blur would carry them along. Flying
// in, they grow a touch; hover brings one up to full size.

const FLAT = 0.56; // scale on the flat map
const DOCK = 0.62; // scale in the globe
const EDGE = 24; // px from the screen edge, docked
const TOP = 104; // clear of the header
const BOTTOM = 112; // clear of the chat bar's row
const RIGHT = 92; // clear of the view switch

type Card = {
  key: string;
  /** Docked corner: the card's scaled box hugs it. */
  dock: "top-left" | "bottom-left" | "right";
  w: number;
  node: ReactNode;
};

const CARDS: Card[] = [
  { key: "commits", dock: "top-left", w: 296, node: <CommitGrid width={296} /> },
  { key: "ledger", dock: "right", w: 318, node: <SystemLedger width={318} /> },
  { key: "research", dock: "bottom-left", w: 300, node: <ResearchReport width={300} /> },
];

export default function EvidenceDock({ delay = 0 }: { delay?: number }) {
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
      const layer = layerRef.current;
      if (!layer) return;
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
        const base = FLAT + (DOCK - FLAT) * k;
        // Hugging its edge, with a slow bob.
        const x = (c.dock === "right" ? vw - RIGHT - c.w * base : EDGE) + Math.sin(t * 0.4 + c.w) * 2;
        const top = c.dock === "top-left" ? TOP : c.dock === "bottom-left" ? vh - BOTTOM - h * base : (vh - h * base) / 2;
        const y = top + Math.cos(t * 0.35 + c.w) * 3;
        const sc = base + (1 - base) * o;
        // Grow from the side that faces the screen's middle, so a hovered
        // card opens inward instead of off the edge.
        const ox = c.dock === "right" ? "100%" : "0%";
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
