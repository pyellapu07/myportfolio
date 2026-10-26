"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { immersion } from "./immersion";
import { CommitGrid, ResearchReport, SystemLedger } from "@/components/landing/Widgets";

// The evidence cards in the spatial view. On the flat map they stand at the
// screen's edges, clear of the work. Flying in, they join the field: they
// ride their own ring round the globe, square to the camera, and since they
// live in MapCards' own layer they stack by depth with the project cards,
// nearer in front. Hover brings one up to full size.

const PERSPECTIVE = 800; // MapCards' camera
const PASS_Z = 640;
// Margins on the flat map, in screen px: clear of the header, the chat
// bar's row and the view switch, with air to the edges.
const EDGE = 56;
const TOP = 132;
const BOTTOM = 150;
const RIGHT = 124;
// On-screen scale in the globe, far side to near side: set directly rather
// than left to perspective, so a card never swells past the work.
const ORBIT_FAR = 0.5;
const ORBIT_NEAR = 0.88;

type Card = {
  key: string;
  /** Where it stands on the flat map. */
  dock: "top-left" | "bottom-left" | "right";
  /** Place on the ring: longitude offset and latitude. */
  lon: number;
  lat: number;
  w: number;
  node: ReactNode;
};

const CARDS: Card[] = [
  { key: "commits", dock: "top-left", lon: 0.6, lat: 0.3, w: 296, node: <CommitGrid width={296} /> },
  { key: "ledger", dock: "right", lon: 0.6 + (2 * Math.PI) / 3, lat: -0.48, w: 318, node: <SystemLedger width={318} /> },
  { key: "research", dock: "bottom-left", lon: 0.6 + (4 * Math.PI) / 3, lat: 0.22, w: 300, node: <ResearchReport width={300} /> },
];

export default function EvidenceField({ delay = 0 }: { delay?: number }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLDivElement>());
  const hoverRef = useRef<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    const t0 = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lift = new Map<string, number>(); // eased 0..1 hover amount per card
    return immersion.onTick((im) => {
      const layer = layerRef.current;
      const box = layer?.parentElement;
      if (!layer || !box) return;
      layer.style.visibility = im.detail ? "hidden" : "visible";
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      const rect = box.getBoundingClientRect();
      // The stage zooms the whole field as the camera goes in (Landing's
      // 1 + 0.9k); screen sizes below are divided by it.
      const zoom = rect.width / Math.max(1, bw);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ox = bw / 2;
      const oy = bh / 2;
      const k = im.k;
      const t = reduce ? 0 : (performance.now() - t0) / 1000;
      // Flat scale from the screen's width: roomy on a wide screen.
      const flat = Math.max(0.62, Math.min(0.9, vw / 2150));
      // The globe as MapCards builds it; the ring turns at 60% of its spin
      // and is squashed in depth, so its near side passes in front without
      // coming up close.
      const R = Math.max(320, Math.min(bw * 0.42, 560));
      const zC = -R * 0.55;
      const flyDepth = R * 1.25 + 160;
      const r = R * 0.9;
      const DEPTH = 0.6;
      const cosP = Math.cos(im.pitch);
      const sinP = Math.sin(im.pitch);
      for (const c of CARDS) {
        const el = els.current.get(c.key);
        if (!el) continue;
        const h = el.offsetHeight;
        const on = hoverRef.current === c.key;
        const o = (lift.get(c.key) ?? 0) + ((on ? 1 : 0) - (lift.get(c.key) ?? 0)) * 0.16;
        lift.set(c.key, o);

        // Flat: its edge spot on screen, as a centre in the box's own units.
        const sw = c.w * flat;
        const sh = h * flat;
        const sx0 = c.dock === "right" ? vw - RIGHT - sw / 2 : EDGE + sw / 2;
        const sy0 = c.dock === "top-left" ? TOP + sh / 2 : c.dock === "bottom-left" ? vh - BOTTOM - sh / 2 : vh / 2;
        const fx = (sx0 - rect.left) / zoom + Math.sin(t * 0.4 + c.lon) * 2;
        const fy = (sy0 - rect.top) / zoom + Math.cos(t * 0.35 + c.lon) * 3;

        // Ring.
        const lon = c.lon + im.yaw * 0.6 + t * 0.02;
        const sx = r * Math.cos(c.lat) * Math.sin(lon);
        const sy = -r * Math.sin(c.lat);
        const sz = r * DEPTH * Math.cos(c.lat) * Math.cos(lon);
        const gy = sy * cosP + sz * sinP;
        const gz = -sy * sinP + sz * cosP + zC;
        // Undo the ring's own perspective (not the flight's, so flying in
        // still carries cards past the camera), then size by nearness.
        const f0 = PERSPECTIVE / Math.max(1, PERSPECTIVE - gz * k);
        const near = Math.min(1, Math.max(0, (sz / (r * DEPTH) + 1) / 2));
        const ring = (ORBIT_FAR + (ORBIT_NEAR - ORBIT_FAR) * near) / f0;

        const x = fx + (ox + sx - fx) * k;
        const y = fy + (oy + gy - fy) * k;
        const z = (gz + im.flight * flyDepth) * k;
        const base = (flat + (ring - flat) * k) / zoom;
        const full = 1 / (zoom * (k > 0 ? f0 : 1));
        const sc = base + (Math.max(full, base) - base) * o;
        el.style.transform = `translate3d(${(x - c.w / 2).toFixed(2)}px, ${(y - h / 2).toFixed(2)}px, ${z.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        // Same stacking rule as the project cards, in the same layer, so
        // whichever is nearer the camera is drawn in front.
        el.style.zIndex = o > 0.02 ? "220" : String(k > 0.01 ? Math.min(199, Math.max(1, Math.round(100 + z / 10))) : 60);
        el.style.opacity = (1 - Math.min(1, Math.max(0, (z - PASS_Z * 0.55) / (PASS_Z * 0.45)))).toFixed(3);
        el.style.visibility = z > PASS_Z ? "hidden" : "";
      }
    });
  }, []);

  // display: contents keeps the cards direct participants in MapCards'
  // stacking context, so their z-index competes with the project cards'.
  return (
    <div ref={layerRef} className="contents" onDragStart={(e) => e.preventDefault()}>
      {CARDS.map((c, i) => (
        <div
          key={c.key}
          ref={(el) => {
            if (el) els.current.set(c.key, el);
          }}
          className="absolute left-0 top-0 hidden origin-center select-none will-change-transform lg:block"
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
    </div>
  );
}
