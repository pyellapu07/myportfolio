"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { immersion } from "./immersion";
import { CommitGrid, ResearchReport, SystemLedger } from "@/components/landing/Widgets";

// The evidence cards in the spatial view. On the flat map they sit small in
// its quiet corners, thumbnails like the project cards; flying in, they lift
// off onto their own ring round the globe, satellites of the work rather
// than part of it. Same camera as MapCards (read from the immersion store each
// tick), always square to it. Hover brings one up to full size.

const PERSPECTIVE = 800; // as MapCards: the two layers share one camera
const FLAT = 0.56; // scale on the flat map
// On-screen scale in orbit, from the far side to the near side. Set directly
// rather than left to perspective, so a satellite never swells past the work.
const ORBIT_FAR = 0.42;
const ORBIT_NEAR = 0.8;
const PASS_Z = 640;

type Sat = {
  key: string;
  /** Flat position, as fractions of the map box (card centre). */
  fx: number;
  fy: number;
  /** Place in orbit: longitude offset and latitude. */
  lon: number;
  lat: number;
  w: number;
  node: ReactNode;
};

const SATS: Sat[] = [
  { key: "commits", fx: 0.87, fy: 0.13, lon: 0.6, lat: 0.3, w: 296, node: <CommitGrid width={296} /> },
  { key: "ledger", fx: 0.88, fy: 0.8, lon: 0.6 + (2 * Math.PI) / 3, lat: -0.48, w: 318, node: <SystemLedger width={318} /> },
  { key: "research", fx: 0.09, fy: 0.84, lon: 0.6 + (4 * Math.PI) / 3, lat: 0.22, w: 300, node: <ResearchReport width={300} /> },
];

export default function EvidenceOrbit({ delay = 0 }: { delay?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
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
      const box = boxRef.current;
      if (!box) return;
      // The Index view pins its own copies round the map.
      const hidden = document.documentElement.dataset.view === "index" || !!im.detail;
      box.style.opacity = hidden ? "0" : "1";
      box.style.pointerEvents = hidden ? "none" : "";
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      const ox = bw / 2;
      const oy = bh / 2;
      const k = im.k;
      const t = reduce ? 0 : (performance.now() - t0) / 1000;
      // The globe as MapCards builds it; the ring turns at 60% of its spin,
      // so it reads as a separate layer.
      const R = Math.max(320, Math.min(bw * 0.42, 560));
      const zC = -R * 0.55;
      const flyDepth = R * 1.25 + 160;
      // A ring squashed in depth, shallow towards the camera so the near side
      // passes in front without coming up close. The stage already zooms the
      // whole field (1 + 0.9k, Landing's camera), so it runs just inside the
      // globe's shell: further out would sit off screen.
      const r = R * 0.9;
      const DEPTH = 0.6;
      const zoom = 1 + 0.9 * k;
      const cosP = Math.cos(im.pitch);
      const sinP = Math.sin(im.pitch);
      for (const s of SATS) {
        const el = els.current.get(s.key);
        if (!el) continue;
        const lon = s.lon + im.yaw * 0.6 + t * 0.02;
        const sx = r * Math.cos(s.lat) * Math.sin(lon);
        const sy = -r * Math.sin(s.lat);
        const sz = r * DEPTH * Math.cos(s.lat) * Math.cos(lon);
        const gy = sy * cosP + sz * sinP;
        const gz = -sy * sinP + sz * cosP + zC;
        // Flat: a slow bob in place.
        const fx = s.fx * bw + Math.sin(t * 0.4 + s.lon) * 3;
        const fy = s.fy * bh + Math.cos(t * 0.35 + s.lon) * 4;
        const x = fx + (ox + sx - fx) * k;
        const y = fy + (oy + gy - fy) * k;
        const z = (gz + im.flight * flyDepth) * k;
        const on = hoverRef.current === s.key;
        const o = (lift.get(s.key) ?? 0) + ((on ? 1 : 0) - (lift.get(s.key) ?? 0)) * 0.16;
        lift.set(s.key, o);
        // Undo the orbit's own perspective (not the flight's, so flying in
        // still carries satellites past the camera), then size by nearness.
        const f0 = PERSPECTIVE / Math.max(1, PERSPECTIVE - gz * k);
        const near = Math.min(1, Math.max(0, (sz / (r * DEPTH) + 1) / 2));
        const orbit = (ORBIT_FAR + (ORBIT_NEAR - ORBIT_FAR) * near) / (f0 * zoom);
        const base = FLAT + (orbit - FLAT) * k;
        const sc = base + (Math.max(1, 1 / (f0 * zoom)) - base) * o;
        el.style.transform = `translate3d(${(x - s.w / 2).toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(1)}px) translateY(-50%) scale(${sc.toFixed(3)})`;
        el.style.zIndex = o > 0.02 ? "220" : String(k > 0.01 ? Math.min(199, Math.max(1, Math.round(100 + z / 10))) : 60);
        el.style.opacity = (1 - Math.min(1, Math.max(0, (z - PASS_Z * 0.55) / (PASS_Z * 0.45)))).toFixed(3);
        el.style.visibility = z > PASS_Z ? "hidden" : "visible";
      }
    });
  }, []);

  return (
    <div
      ref={boxRef}
      className="pointer-events-none absolute inset-0 hidden select-none transition-opacity duration-500 lg:block"
      style={{ perspective: PERSPECTIVE }}
      onDragStart={(e) => e.preventDefault()}
    >
      {SATS.map((s, i) => (
        <div
          key={s.key}
          ref={(el) => {
            if (el) els.current.set(s.key, el);
          }}
          className="pointer-events-auto absolute left-0 top-0 origin-center will-change-transform"
          style={{ width: s.w }}
          onPointerEnter={() => setHover(s.key)}
          onPointerLeave={() => setHover((h) => (h === s.key ? null : h))}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.5 + i * 0.08, duration: 0.6, ease: [0.2, 0.6, 0.35, 1] }}
          >
            {s.node}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
