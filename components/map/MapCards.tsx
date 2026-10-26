"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PROJECTS, type Project } from "./projects";
import { naturalEarth } from "./projection";
import { WORLD_MAP } from "./worldMap";
import { immersion } from "./immersion";
import ProjectDetail, { type DetailOpen } from "./ProjectDetail";

// Project cards floating over the map, AIRLA-style: dead straight, one size,
// in a ring, drifting slowly and shifting with the cursor in
// parallax. A dot marks every card's place; hovering a card brings it forward
// with its title beneath and draws a dotted thread to its place.

const ASPECT = 0.625; // 16:10, as the thumbnails
const W_RING = 96; // card width on the flat map: small, every card alike
const W_NODE = 62; // related-node width
const ORBIT = 30; // px between a parent card's edge and its nodes
// Immersive 3D: perspective, how far the flat cards spread as they lift off,
// and where a card passes the camera.
const PERSPECTIVE = 800; // only matters immersed: flat, every z is 0
const SPREAD = 0.35; // on top of the map zoom (1 + 0.9k), which the cards share
const PASS_Z = 640;
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

// One ring, AIRLA-style, rather than piled on their places (the work
// clusters in the Americas, which weighed the map to the left): cards of one
// size, evenly spaced round an ellipse centred on the map, clockwise from the
// top in west-to-east order. A dot still marks each place, and hovering a
// card draws its thread to it.
function layout(bw: number, bh: number): Placed[] {
  // Cards scale with the map, so a smaller map doesn't crowd them.
  const k = Math.min(1, Math.max(0.65, bw / 1250));
  const w = W_RING * k;
  // Close to a circle, as AIRLA's, a touch wider than tall.
  const rx = Math.min(bw * 0.2, 265);
  const ry = Math.min(bh * 0.37, 228);
  const top = PROJECTS.filter((p) => !p.parent)
    .map((p, i) => {
      const [mx, my] = naturalEarth(p.lon, p.lat);
      return { p, i, ax: (mx / WORLD_MAP.width) * bw, ay: (my / WORLD_MAP.height) * bh };
    })
    .sort((a, b) => a.ax - b.ax);
  const n = top.length;
  return top.map(({ p, i, ax, ay }, slot) => {
    // Half a step off the top, so no card sits dead on the vertical axis.
    const a = -Math.PI / 2 + ((slot + 0.5) / n) * Math.PI * 2;
    return {
      ...p,
      ax,
      ay,
      cx: bw / 2 + Math.cos(a) * rx,
      cy: bh * 0.47 + Math.sin(a) * ry,
      w,
      h: w * ASPECT,
      // Depth still sets each card's place in the globe and its parallax.
      depth: rand(i + 1),
      phase: rand(i + 13) * Math.PI * 2,
      pad: PROJECTS.some((q) => q.parent === p.id) ? ORBIT + W_NODE : 0,
    };
  });
}

const NODES: Node[] = PROJECTS.filter((p): p is Project & { parent: string } => !!p.parent).map((p, i, all) => ({
  ...p,
  // Spread round the lower half and sides of the parent, like satellites.
  angle: Math.PI * (0.05 + (0.9 * (i + 0.5)) / all.length),
}));

export default function MapCards({ delay = 0, children }: { delay?: number; children?: React.ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Which card (or card group) is open. A group stays open until the pointer
  // leaves its whole hit area, so nothing moving under the cursor can flicker it.
  const [hover, setHover] = useState<string | null>(null);
  const [nodeHover, setNodeHover] = useState<string | null>(null);
  const cardEls = useRef(new Map<string, HTMLDivElement>());
  const lineEls = useRef(new Map<string, SVGLineElement>());
  const nodeEls = useRef(new Map<string, HTMLDivElement>());
  const hitEls = useRef(new Map<string, HTMLDivElement>());
  const imgEls = useRef(new Map<string, HTMLImageElement>());
  const svgRef = useRef<SVGSVGElement>(null);
  const cursor = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const hoverRef = useRef<string | null>(null);
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
  }, [hover]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cards = useMemo(() => (box.w ? layout(box.w, box.h) : []), [box.w, box.h]);

  // Drift, parallax and node orbits run on the frame loop and write
  // transforms directly: no React renders, so motion is smooth.
  useEffect(() => {
    if (!cards.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    const spread = new Map<string, number>(); // eased 0..1 open amount per parent
    let raf = 0;
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
      // Screen position and scale of a 3D point (perspective origin = box centre).
      const project = (q: { x: number; y: number; z: number }) => {
        const f = PERSPECTIVE / Math.max(1, PERSPECTIVE - q.z);
        return { x: ox + (q.x - ox) * f, y: oy + (q.y - oy) * f, f };
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
      const cur = cursor.current;
      cur.x += (cur.tx - cur.x) * 0.08;
      cur.y += (cur.ty - cur.y) * 0.08;
      const at = new Map<string, { x: number; y: number }>();
      for (const c of cards) {
        const near = 1 - c.depth;
        const x = c.cx - cur.x * PARALLAX * (0.25 + near) + Math.sin(t * 0.45 + c.phase) * 3 * (0.4 + near);
        const y = c.cy - cur.y * PARALLAX * 0.6 * (0.25 + near) + Math.cos(t * 0.38 + c.phase * 1.3) * 4 * (0.4 + near);
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
        const hit = hitEls.current.get(c.id);
        if (hit) {
          const sp = project(place(x, y, c.depth, c.id));
          hit.style.transform = `translate3d(${sp.x.toFixed(2)}px, ${sp.y.toFixed(2)}px, 0) scale(${sp.f.toFixed(3)})`;
        }
      }
      for (const n of NODES) {
        const pc = cards.find((c) => c.id === n.parent);
        const pp = at.get(n.parent);
        const el = nodeEls.current.get(n.id);
        if (!pc || !pp || !el) continue;
        const goal = hoverRef.current === n.parent ? 1 : 0;
        const o = (spread.get(n.parent) ?? 0) + (goal - (spread.get(n.parent) ?? 0)) * 0.12;
        spread.set(n.parent, o);
        const a = n.angle + t * 0.08;
        const rx = (pc.w / 2 + ORBIT + W_NODE / 2) * (1 + 0.4 * o);
        const ry = (pc.h / 2 + ORBIT + (W_NODE * ASPECT) / 2) * (1 + 0.55 * o);
        const nx = pp.x + Math.cos(a) * rx;
        const ny = pp.y + Math.sin(a) * ry;
        // Flat, a node sits on its orbit. Immersed, it stays clustered beside
        // its parent card in 3D (same depth and depth scale), rather than
        // going through the globe mapping, which would fling it across the
        // globe as if it were a project of its own.
        const flat = place(nx, ny, Math.min(1, pc.depth + 0.25), pc.id);
        const pq = place(pp.x, pp.y, pc.depth, pc.id);
        const ds = 1 + (Math.max(0.55, Math.min(1.3, 1 + pq.z / 900)) - 1) * k;
        const q = {
          x: flat.x + (pq.x + (nx - pp.x) * ds - flat.x) * k,
          y: flat.y + (pq.y + (ny - pp.y) * ds - flat.y) * k,
          z: flat.z + (pq.z - 2 - flat.z) * k,
        };
        el.style.transform = `translate3d(${(q.x - W_NODE / 2).toFixed(2)}px, ${(q.y - (W_NODE * ASPECT) / 2).toFixed(2)}px, ${q.z.toFixed(1)}px) scale(${((1 + 0.3 * o) * ds).toFixed(3)})`;
        el.style.visibility = q.z > PASS_Z || detailRef.current === n.id ? "hidden" : "visible";
        // On the flat map a parent's nodes stay folded away until it's
        // hovered; in the globe they cluster beside it as before.
        const show = Math.max(o, k);
        el.style.opacity = show.toFixed(3);
        el.style.pointerEvents = show < 0.3 ? "none" : "";
        if (goal === 0) el.style.zIndex = String(k > 0.01 ? Math.min(199, Math.max(1, Math.round(99 + q.z / 10))) : 5);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [cards, box.w, box.h]);

  const lit = (id: string) => hover === id;

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
      onPointerMove={(e) => {
        const r = boxRef.current?.getBoundingClientRect();
        if (!r) return;
        cursor.current.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        cursor.current.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      }}
      onPointerLeave={() => {
        cursor.current.tx = 0;
        cursor.current.ty = 0;
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

      {/* Steady hit areas for cards with related nodes: they cover the whole
          open orbit, so the group holds open while the pointer is anywhere in it. */}
      {cards
        .filter((c) => c.pad > 0)
        .map((c) => (
          <div
            key={`hit-${c.id}`}
            ref={(el) => {
              if (el) hitEls.current.set(c.id, el);
            }}
            className="absolute left-0 top-0"
            style={{ zIndex: lit(c.id) ? 205 : 1, pointerEvents: lit(c.id) ? "auto" : "none" }}
            onPointerLeave={() => setHover((h) => (h === c.id ? null : h))}
          >
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ width: (c.w / 2 + c.pad) * 2 * 1.5, height: (c.h / 2 + c.pad) * 2 * 1.6 }}
            />
          </div>
        ))}

      {cards.map((c, i) => {
        const on = lit(c.id);
        const dim = hover && !on;
        // Every card is sharp; only cards outside an open hover group dim.
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
            onPointerLeave={() => {
              if (c.pad === 0) setHover((h) => (h === c.id ? null : h));
            }}
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
                  className={`pointer-events-none absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.03em] text-black transition-opacity duration-200 ${
                    on ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {c.title}
                </span>
              </Link>
            </motion.div>
          </div>
        );
      })}

      {/* Related nodes: small, deep cards orbiting their parent, pulled into
          focus while the parent group is open. They never move on their own
          hover, so the pointer cannot chase them. */}
      {NODES.map((n, i) => {
        const open = lit(n.parent);
        const h = W_NODE * ASPECT;
        return (
          <div
            key={n.id}
            ref={(el) => {
              if (el) nodeEls.current.set(n.id, el);
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: W_NODE, height: h, zIndex: open ? 215 : 5 }}
            onPointerEnter={() => {
              setHover(n.parent);
              setNodeHover(n.id);
            }}
            onPointerLeave={() => setNodeHover((x) => (x === n.id ? null : x))}
          >
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.6 + i * 0.05, duration: 0.4 }}
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
                  <img src={n.thumb} alt="" width={W_NODE} height={h} className="h-full w-full object-cover" draggable={false} />
                  <span
                    className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300"
                    style={{ opacity: open ? 0 : "calc(0.3 * var(--haze-k, 1))" }}
                  />
                </span>
                <span
                  className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold leading-none tracking-[-0.03em] text-black transition-opacity duration-200 ${
                    nodeHover === n.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {n.title}
                </span>
              </Link>
            </motion.div>
          </div>
        );
      })}

      {/* Other cards that share this layer (and so its depth order). */}
      {children}

      <ProjectDetail open={detail} onClose={closeDetail} />
    </div>
  );
}
