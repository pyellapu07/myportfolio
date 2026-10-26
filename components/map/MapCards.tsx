"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS, type Project } from "./projects";
import { naturalEarth } from "./projection";
import { WORLD_MAP } from "./worldMap";
import { immersion } from "./immersion";
import ProjectDetail, { type DetailOpen } from "./ProjectDetail";
import { ringFocus } from "./focus";

// Project cards floating over the map, AIRLA-style: dead straight, one size,
// in a ring that turns slowly, each card drifting a little. A dot marks every card's place; hovering a card brings it forward
// with its title beneath and draws a dotted thread to its place.

const ASPECT = 0.625; // 16:10, as the thumbnails
const W_RING = 96; // card width on the flat map: small, every card alike
const W_NODE = 62; // related-card width in the globe, clustered beside its parent
const ORBIT = 30; // px between a parent card's edge and its related cards, in the globe
// Immersive 3D: perspective, how far the flat cards spread as they lift off,
// and where a card passes the camera.
const PERSPECTIVE = 800; // only matters immersed: flat, every z is 0
const SPREAD = 0.35; // on top of the map zoom (1 + 0.9k), which the cards share
const PASS_Z = 640;
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
};

function rand(seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

type Node = Project & { parent: string; angle: number };

// One ring, AIRLA-style, rather than piled on their places (the work
// clusters in the Americas, which weighed the map to the left): every card,
// related ones included, at one size, evenly spaced round an ellipse centred
// on the map, clockwise from the top in west-to-east order, each project's
// related cards straight after it. A dot still marks each place, and hovering
// a card draws its thread to it. Returns the top-level cards, and the ring
// spots of the related ones (MapCards moves those itself).
function layout(bw: number, bh: number): { cards: Placed[]; ring: Map<string, { cx: number; cy: number }>; ellipse: { x: number; y: number; rx: number; ry: number } } {
  // Cards scale with the map, so a smaller map doesn't crowd them.
  const k = Math.min(1, Math.max(0.65, bw / 1250));
  const w = W_RING * k;
  // Close to a circle, as AIRLA's, a touch wider than tall.
  const rx = Math.min(bw * 0.23, 310);
  const ry = Math.min(bh * 0.4, 245);
  const top = PROJECTS.filter((p) => !p.parent)
    .map((p, i) => {
      const [mx, my] = naturalEarth(p.lon, p.lat);
      return { p, i, ax: (mx / WORLD_MAP.width) * bw, ay: (my / WORLD_MAP.height) * bh };
    })
    .sort((a, b) => a.ax - b.ax);
  const order = top.flatMap((t) => [t.p.id, ...PROJECTS.filter((q) => q.parent === t.p.id).map((q) => q.id)]);
  const spot = (id: string) => {
    // Half a step off the top, so no card sits dead on the vertical axis.
    const a = -Math.PI / 2 + ((order.indexOf(id) + 0.5) / order.length) * Math.PI * 2;
    return { cx: bw / 2 + Math.cos(a) * rx, cy: bh * 0.47 + Math.sin(a) * ry };
  };
  const cards = top.map(({ p, i, ax, ay }) => ({
    ...p,
    ax,
    ay,
    ...spot(p.id),
    w,
    h: w * ASPECT,
    // Depth still sets each card's place in the globe and its parallax.
    depth: rand(i + 1),
    phase: rand(i + 13) * Math.PI * 2,
  }));
  const ring = new Map(PROJECTS.filter((p) => p.parent).map((p) => [p.id, spot(p.id)]));
  return { cards, ring, ellipse: { x: bw / 2, y: bh * 0.47, rx, ry } };
}

const NODES: Node[] = PROJECTS.filter((p): p is Project & { parent: string } => !!p.parent).map((p, i, all) => ({
  ...p,
  // In the globe they cluster round the lower half and sides of the parent.
  angle: Math.PI * (0.05 + (0.9 * (i + 0.5)) / all.length),
}));

export default function MapCards({ delay = 0, children }: { delay?: number; children?: React.ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Which card (or card group) is open. A group stays open until the pointer
  // leaves its whole hit area, so nothing moving under the cursor can flicker it.
  const [hover, setHover] = useState<string | null>(null);
  const cardEls = useRef(new Map<string, HTMLDivElement>());
  const lineEls = useRef(new Map<string, SVGLineElement>());
  const nodeEls = useRef(new Map<string, HTMLDivElement>());
  const imgEls = useRef(new Map<string, HTMLImageElement>());
  const svgRef = useRef<SVGSVGElement>(null);
  const hoverRef = useRef<string | null>(null);
  // The project the chat is talking about: lit, and turned to the top.
  const focus = useSyncExternalStore(ringFocus.subscribe, ringFocus.get, () => null);
  const focusRef = useRef<string | null>(null);
  // Clicked card, shown centred with its details; its place in the scene
  // stays empty meanwhile so it reads as the same object.
  const [detail, setDetail] = useState<DetailOpen | null>(null);
  const detailRef = useRef<string | null>(null);
  const openDetail = (p: Project) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const from = e.currentTarget.getBoundingClientRect();
    detailRef.current = p.id;
    immersion.setDetail(p.id);
    setHover(null);
    setDetail({ project: p, from });
  };
  const closeDetail = () => {
    setDetail(null);
    immersion.setDetail(null);
    // Let the card fly home before it reappears in the scene.
    setTimeout(() => {
      if (!immersion.get().detail) detailRef.current = null;
    }, 700);
  };
  useEffect(() => {
    hoverRef.current = hover;
    focusRef.current = focus;
  }, [hover, focus]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { cards, ring, ellipse } = useMemo(
    () => (box.w ? layout(box.w, box.h) : { cards: [], ring: new Map(), ellipse: { x: 0, y: 0, rx: 1, ry: 1 } }),
    [box.w, box.h],
  );

  // Drift, parallax and node orbits run on the frame loop and write
  // transforms directly: no React renders, so motion is smooth.
  useEffect(() => {
    if (!cards.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    // The ring turns very slowly, a full turn in about four minutes, and
    // eases to a stop while a card is hovered so it can be read.
    let spin = 0;
    let spinV = 0;
    let lastT = performance.now();
    const turn = (x: number, y: number, k: number) => {
      const e = ellipse;
      const a = Math.atan2((y - e.y) / e.ry, (x - e.x) / e.rx) + spin;
      // Flat only: in the globe each card keeps its slot.
      return { x: x + (e.x + Math.cos(a) * e.rx - x) * (1 - k), y: y + (e.y + Math.sin(a) * e.ry - y) * (1 - k) };
    };
    // The work clusters in a few regions, which would leave most of a
    // geographic globe bare. Immersed, cards take evenly spaced slots round
    // it instead, keeping their west → east order; latitudes are scattered
    // by the golden ratio so no two neighbours share a row.
    const slots = new Map<string, { lon: number; lat: number; cx: number; cy: number }>();
    [...cards]
      .sort((a, b) => a.cx - b.cx)
      .forEach((c, i, all) => {
        const lon = ((i + 0.5) / all.length - 0.5) * 2 * Math.PI;
        const lat = ((((i * 0.618034) % 1) + 1) % 1 - 0.5) * 1.5;
        slots.set(c.id, { lon, lat, cx: c.cx, cy: c.cy });
      });
    const frame = (now: number) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      immersion.tick(now);
      const im = immersion.get();
      const k = im.k;
      const dt = Math.min(0.25, (now - lastT) / 1000);
      lastT = now;
      const f = focusRef.current;
      const fs = f ? (cards.find((c) => c.id === f) ?? ring.get(f)) : null;
      if (fs) {
        // Turn the shortest way until the chat's project sits at the top,
        // above the open answer panel.
        const a0 = Math.atan2((fs.cy - ellipse.y) / ellipse.ry, (fs.cx - ellipse.x) / ellipse.rx);
        let d = -Math.PI / 2 - a0 - spin;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        spin += d * (reduce ? 1 : 0.05);
        spinV = 0;
      } else {
        spinV += ((reduce || hoverRef.current ? 0 : (Math.PI * 2) / 240) - spinV) * 0.06;
        spin += spinV * dt;
      }
      const ox = box.w / 2;
      const oy = box.h / 2;
      // Flat position → globe. Immersed, the map wraps round a sphere: x
      // becomes longitude, y latitude. Drag spins the globe (yaw) and tips it
      // (pitch); the camera never turns and every card stays square to it,
      // AIRLA-style, so cards revolve round in front of you. Scroll flies the
      // camera in through the globe. k blends flat → globe.
      // Globe size from the box's width, not its height: the map stage is
      // short (the chat lives under it), and a shallow globe reads as flat.
      const R = Math.max(320, Math.min(box.w * 0.42, 560));
      const zC = -R * 0.55; // globe centre, behind the screen plane
      const flyDepth = R * 1.25 + 160; // ends with the far side of the globe in view
      const cosP = Math.cos(im.pitch), sinP = Math.sin(im.pitch);
      const place = (x: number, y: number, depth: number, id: string) => {
        // Even slot on the globe, nudged by the point's offset from its card.
        const sl = slots.get(id)!;
        const lon = sl.lon + ((x - sl.cx) / (box.w / 2)) * Math.PI * 0.92 + im.yaw;
        const lat = sl.lat - ((y - sl.cy) / (box.h / 2)) * 1.05;
        const r = R * (1 - 0.12 * depth);
        const sx = r * Math.cos(lat) * Math.sin(lon);
        const sy = -r * Math.sin(lat);
        const sz = r * Math.cos(lat) * Math.cos(lon);
        // Tip about the globe's centre: dragging down brings the top towards you.
        const gy = sy * cosP + sz * sinP;
        const gz = -sy * sinP + sz * cosP + zC;
        const fx = (x - ox) * (1 + SPREAD * k);
        const fy = y - oy;
        return {
          x: ox + fx + (sx - fx) * k,
          y: oy + fy + (gy - fy) * k,
          z: gz * k + k * im.flight * flyDepth,
        };
      };
      if (svgRef.current) svgRef.current.style.opacity = (1 - k).toFixed(3);
      // Depth haze fades out as the camera goes in: immersed cards are clear.
      boxRef.current?.style.setProperty("--haze-k", (1 - k).toFixed(3));
      // The landing's Index view shows its own list; the map cards step aside.
      // (Set on the box: cards set their own visibility, which a parent's
      // visibility could not override.)
      const hidden = document.documentElement.dataset.view === "index";
      if (boxRef.current) {
        boxRef.current.style.opacity = hidden ? "0" : "1";
        boxRef.current.style.pointerEvents = hidden ? "none" : "";
      }
      const at = new Map<string, { x: number; y: number }>();
      for (const c of cards) {
        const near = 1 - c.depth;
        const rp = turn(c.cx, c.cy, k);
        const x = rp.x + Math.sin(t * 0.45 + c.phase) * 3 * (0.4 + near);
        const y = rp.y + Math.cos(t * 0.38 + c.phase * 1.3) * 4 * (0.4 + near);
        at.set(c.id, { x, y });
        const el = cardEls.current.get(c.id);
        if (el) {
          const q = place(x, y, c.depth, c.id);
          // Exaggerated perspective, like AIRLA: on top of the camera's own
          // foreshortening, near cards grow and far ones shrink with depth.
          const depthScale = Math.max(0.55, Math.min(1.3, 1 + q.z / 900));
          el.style.transform = `translate3d(${(q.x - c.w / 2).toFixed(2)}px, ${(q.y - c.h / 2).toFixed(2)}px, ${q.z.toFixed(1)}px) scale(${(1 + (depthScale - 1) * k).toFixed(3)})`;
          // Stack by distance: the box is not preserve-3d, so z-index decides.
          if (hoverRef.current !== c.id) el.style.zIndex = String(k > 0.01 ? Math.min(199, Math.max(1, Math.round(100 + q.z / 10))) : Math.round((1 - c.depth) * 100));
          // Cards that have flown past the camera fade away rather than fill the screen.
          el.style.opacity = (1 - Math.min(1, Math.max(0, (q.z - PASS_Z * 0.55) / (PASS_Z * 0.45)))).toFixed(3);
          el.style.visibility = q.z > PASS_Z || detailRef.current === c.id ? "hidden" : "visible";
          const img = imgEls.current.get(c.id);
          if (img) {
            const base = Number(img.dataset.blur ?? 0);
            // Zoomed in, every card is sharp: no lens or depth blur.
            const b = hoverRef.current === c.id ? 0 : base * (1 - k);
            img.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none";
          }
        }
        const ln = lineEls.current.get(c.id);
        if (ln) {
          ln.setAttribute("x2", x.toFixed(1));
          ln.setAttribute("y2", (y + c.h / 2).toFixed(1));
        }
      }
      for (const n of NODES) {
        const pc = cards.find((c) => c.id === n.parent);
        const pp = at.get(n.parent);
        const rs = ring.get(n.id);
        const el = nodeEls.current.get(n.id);
        if (!pc || !pp || !rs || !el) continue;
        // Flat: its own spot on the ring, drifting like the rest.
        const near = 1 - pc.depth;
        const phase = pc.phase + n.angle * 3;
        const rr = turn(rs.cx, rs.cy, k);
        const fx = rr.x + Math.sin(t * 0.45 + phase) * 3 * (0.4 + near);
        const fy = rr.y + Math.cos(t * 0.38 + phase * 1.3) * 4 * (0.4 + near);
        // Globe: clustered beside its parent in 3D (same depth and depth
        // scale), rather than through the globe mapping, which would fling it
        // across the globe as if it were a project of its own.
        const a = n.angle + t * 0.08;
        const pq = place(pp.x, pp.y, pc.depth, pc.id);
        const ds = Math.max(0.55, Math.min(1.3, 1 + pq.z / 900));
        const gx = pq.x + Math.cos(a) * (pc.w / 2 + ORBIT + W_NODE / 2) * ds;
        const gy = pq.y + Math.sin(a) * (pc.h / 2 + ORBIT + (W_NODE * ASPECT) / 2) * ds;
        const q = { x: fx + (gx - fx) * k, y: fy + (gy - fy) * k, z: (pq.z - 2) * k };
        // Card-sized on the ring, shrinking to a small satellite in the globe.
        const sc = 1 + ((W_NODE / pc.w) * ds - 1) * k;
        el.style.transform = `translate3d(${(q.x - pc.w / 2).toFixed(2)}px, ${(q.y - pc.h / 2).toFixed(2)}px, ${q.z.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        el.style.visibility = q.z > PASS_Z || detailRef.current === n.id ? "hidden" : "visible";
        if (hoverRef.current !== n.id) el.style.zIndex = String(k > 0.01 ? Math.min(199, Math.max(1, Math.round(99 + q.z / 10))) : Math.round((1 - pc.depth) * 100));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [cards, ring, ellipse, box.w, box.h]);

  // A project and its related cards light up together; the rest dim.
  const family = (id: string) => PROJECTS.find((p) => p.id === id)?.parent ?? id;
  // Hover leads; otherwise the chat's project.
  const active = hover ?? focus;
  const lit = (id: string) => !!active && family(active) === family(id);
  const shown = active ? PROJECTS.find((p) => p.id === active) : null;

  return (
    <div
      ref={boxRef}
      className="map-cards absolute inset-0 select-none transition-opacity duration-500"
      // Dragging orbits the scene; never start a native image or link drag.
      onDragStart={(e) => e.preventDefault()}
      // The landing's index view hides the map cards (it shows the grid instead).
      style={{
        perspective: PERSPECTIVE,
      }}
    >
      {/* Each card's place: a dot, and a dotted thread to it while hovered */}
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {cards.map((c, i) => (
          <motion.g
            key={c.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: lit(c.id) ? 0.9 : 0.3 }}
            transition={{ opacity: { delay: hover ? 0 : delay + 0.3 + i * 0.04, duration: 0.4 } }}
          >
            <line
              ref={(el) => {
                if (el) lineEls.current.set(c.id, el);
              }}
              x1={c.ax}
              y1={c.ay}
              x2={c.cx}
              y2={c.cy + c.h / 2}
              stroke="#0a0a0a"
              strokeWidth={1}
              strokeDasharray="1 4"
              strokeLinecap="round"
              // Only a hovered card shows its thread; at rest just the dot.
              style={{ opacity: lit(c.id) ? 1 : 0, transition: "opacity 0.3s" }}
            />
            <circle cx={c.ax} cy={c.ay} r={lit(c.id) ? 3 : 2} fill="#0a0a0a" />
          </motion.g>
        ))}
      </svg>

      {cards.map((c, i) => {
        const on = hover === c.id;
        const dim = active && !lit(c.id);
        // Every card is sharp; only cards outside the hovered family dim.
        const blur = 0;
        const haze = dim ? 0.55 : 0;
        return (
          <div
            key={c.id}
            ref={(el) => {
              if (el) cardEls.current.set(c.id, el);
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: c.w, height: c.h, zIndex: on ? 210 : Math.round((1 - c.depth) * 100) }}
            onPointerEnter={() => setHover(c.id)}
            onPointerLeave={() => setHover((h) => (h === c.id ? null : h))}
          >
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: on ? 1.08 : 1 }}
              transition={{
                scale: { delay: hover ? 0 : delay + i * 0.04, duration: 0.6, ease: SETTLE },
                opacity: { delay: delay + i * 0.04, duration: 0.4 },
              }}
            >
              <Link
                href={c.href}
                draggable={false}
                onClick={openDetail(c)}
                className="block h-full w-full"
                aria-label={`${c.title}, ${c.place}`}
              >
                {/* Square, flat frame; blur and haze stay inside it. */}
                <span className="relative block h-full w-full overflow-hidden bg-white">
                  {/* Blur is written by the frame loop: depth blur when flat, lens
                      blur by distance when immersed. data-blur holds the flat value. */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- 320px thumbs, already sized */}
                  <img
                    ref={(el) => {
                      if (el) imgEls.current.set(c.id, el);
                    }}
                    src={c.thumb}
                    alt=""
                    width={c.w}
                    height={c.h}
                    data-blur={blur}
                    className="h-full w-full scale-[1.04] object-cover"
                    draggable={false}
                  />
                  {c.video && (
                    // A live loop over the poster still: muted, so it can autoplay.
                    <video
                      poster={c.thumb}
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="auto"
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                    >
                      {/* WebM first (smaller, and open-source Chromium lacks H.264). */}
                      <source src={c.video.replace(/\.mp4$/, ".webm")} type="video/webm" />
                      <source src={c.video} type="video/mp4" />
                    </video>
                  )}
                  <span className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300" style={{ opacity: `calc(${haze} * var(--haze-k, 1))` }} />
                </span>
                <span
                  className={`pointer-events-none absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.03em] text-black transition-opacity duration-200`}
                  // In the globe only; on the flat map the ring's centre names it.
                  style={{ opacity: on ? "calc(1 - var(--haze-k, 1))" : 0 }}
                >
                  {c.title}
                </span>
              </Link>
            </motion.div>
          </div>
        );
      })}

      {/* Related cards: on the ring beside their project, card-sized; in the
          globe, small satellites clustered beside it. */}
      {NODES.map((n, i) => {
        const w = cards[0]?.w ?? W_RING;
        const h = w * ASPECT;
        const on = hover === n.id;
        const dim = active && !lit(n.id);
        return (
          <div
            key={n.id}
            ref={(el) => {
              if (el) nodeEls.current.set(n.id, el);
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: w, height: h, zIndex: on ? 210 : 5 }}
            onPointerEnter={() => setHover(n.id)}
            onPointerLeave={() => setHover((x) => (x === n.id ? null : x))}
          >
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: on ? 1.08 : 1 }}
              transition={{
                scale: { delay: hover ? 0 : delay + 0.3 + i * 0.04, duration: 0.6, ease: SETTLE },
                opacity: { delay: delay + 0.3 + i * 0.04, duration: 0.4 },
              }}
            >
              <Link
                href={n.href}
                draggable={false}
                onClick={openDetail(n)}
                className="block h-full w-full"
                aria-label={`${n.title}, ${n.role}`}
              >
                <span className="relative block h-full w-full overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 320px thumbs, already sized */}
                  <img src={n.thumb} alt="" width={w} height={h} className="h-full w-full object-cover" draggable={false} />
                  <span
                    className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300"
                    style={{ opacity: `calc(${dim ? 0.55 : 0} * var(--haze-k, 1))` }}
                  />
                </span>
                <span
                  className={`pointer-events-none absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.03em] text-black transition-opacity duration-200`}
                  // In the globe only; on the flat map the ring's centre names it.
                  style={{ opacity: on ? "calc(1 - var(--haze-k, 1))" : 0 }}
                >
                  {n.title}
                </span>
              </Link>
            </motion.div>
          </div>
        );
      })}

      {/* The ring's centre names the hovered card (or the chat's project), as
          AIRLA does: title and one line. Flat map only. */}
      {cards.length > 0 && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute flex w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
          style={{ left: ellipse.x, top: ellipse.y, opacity: "var(--haze-k, 1)", textShadow: "0 0 14px #fff, 0 0 6px #fff, 0 0 2px #fff" }}
        >
          <AnimatePresence mode="wait">
            {shown && (
              <motion.div
                key={shown.id}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, filter: "blur(4px)", transition: { duration: 0.15 } }}
                transition={{ duration: 0.35, ease: SETTLE }}
              >
                <p className="text-[17px] font-bold leading-tight tracking-[-0.03em] text-black">{shown.title}</p>
                <p className="mt-1.5 text-[12.5px] leading-snug tracking-[-0.01em] text-black/60">
                  {shown.blurb ?? (shown.parent ? `Part of ${shown.role}` : shown.role)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Other cards that share this layer (and so its depth order). */}
      {children}

      <ProjectDetail open={detail} onClose={closeDetail} />
    </div>
  );
}
