"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PROJECTS, type Project } from "./projects";
import { naturalEarth } from "./projection";
import { WORLD_MAP } from "./worldMap";
import { immersion } from "./immersion";
import ProjectDetail, { type DetailOpen } from "./ProjectDetail";

// Project cards floating over the map, AIRLA-style: dead straight, each with
// its own space, sized and faded by depth, drifting slowly and shifting with
// the cursor in parallax. A faint dotted line ties every card to its place.
// Hovering brings a card forward into focus with its title beneath.

const ASPECT = 0.625; // 16:10, as the thumbnails
const W_NEAR = 188; // card width at depth 0 (closest)
const W_FAR = 128; // card width at depth 1 (farthest)
const W_NODE = 62; // related-node width
const ORBIT = 30; // px between a parent card's edge and its nodes
// Immersive 3D: perspective, how far the flat cards spread as they lift off,
// and where a card passes the camera.
const PERSPECTIVE = 800; // only matters immersed: flat, every z is 0
const SPREAD = 0.35; // on top of the map zoom (1 + 0.9k), which the cards share
const PASS_Z = 640;
const GAP = 30; // px kept clear between cards
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
  // Cards scale with the map, so a smaller map doesn't crowd them.
  const k = Math.min(1, Math.max(0.65, bw / 1250));
  const cards: Placed[] = PROJECTS.filter((p) => !p.parent).map((p, i) => {
    const [mx, my] = naturalEarth(p.lon, p.lat);
    const ax = (mx / WORLD_MAP.width) * bw;
    const ay = (my / WORLD_MAP.height) * bh;
    const depth = rand(i + 1);
    const w = (W_NEAR + (W_FAR - W_NEAR) * depth) * k;
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
  // Cards may spill past the map's sides into open ocean to get room; never
  // past its top (the nav) or bottom (the statement).
  const spill = bw * 0.12;
  const spillTop = 0;
  const ITER = 420;
  for (let it = 0; it < ITER; it++) {
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i];
        const b = cards[j];
        const ox = (a.w + b.w) / 2 + a.pad + b.pad + GAP - Math.abs(a.cx - b.cx);
        const oy = (a.h + b.h) / 2 + a.pad + b.pad + GAP + 14 - Math.abs(a.cy - b.cy); // +14 leaves room for a title
        if (ox > 0 && oy > 0) {
          // Push apart along the line between centres, leaning a little
          // sideways (the oceans have room), so a cluster opens into a cloud
          // round its place instead of a column or a row.
          let dx = b.cx - a.cx;
          let dy = (b.cy - a.cy) * 0.8;
          if (Math.abs(dx) + Math.abs(dy) < 0.01) {
            dx = rand(i * 31 + j) - 0.5;
            dy = rand(i * 17 + j * 3) - 0.5;
          }
          const len = Math.hypot(dx, dy);
          const push = Math.min(ox, oy) * 0.3;
          a.cx -= (dx / len) * push;
          a.cy -= (dy / len) * push;
          b.cx += (dx / len) * push;
          b.cy += (dy / len) * push;
        }
      }
    }
    for (const c of cards) {
      // The spring towards each card's place stops for the last passes, so
      // they end fully separated rather than pulled back into touching.
      if (it < ITER - 80) {
        c.cx += (c.ax - c.cx) * 0.03;
        c.cy += (c.ay - LIFT - c.cy) * 0.03;
      }
      c.cx = Math.min(bw + spill - c.w / 2 - c.pad, Math.max(c.w / 2 + c.pad - spill, c.cx));
      c.cy = Math.min(bh - c.h / 2 - c.pad - 20, Math.max(c.h / 2 + c.pad - spillTop, c.cy));
    }
  }
  return cards;
}

const NODES: Node[] = PROJECTS.filter((p): p is Project & { parent: string } => !!p.parent).map((p, i, all) => ({
  ...p,
  // Evenly round the parent, like satellites, so none crowd each other.
  angle: -Math.PI / 2 + (Math.PI * 2 * (i + 0.5)) / all.length,
}));

// Film grain: an SVG turbulence tile laid over every card (above the haze,
// hard-light so it reads on light images too) and shifted every few frames
// so it crawls like real grain.
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 2.6 -0.75"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

function Grain({ strength = 0.05 }: { strength?: number }) {
  return (
    <span
      aria-hidden="true"
      className="map-grain pointer-events-none absolute inset-[-40px] mix-blend-hard-light"
      style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px", opacity: strength }}
    />
  );
}

export default function MapCards({ delay = 0 }: { delay?: number }) {
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
    let grainT = 0;
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
        const q = place(nx, ny, Math.min(1, pc.depth + 0.25), pc.id);
        el.style.transform = `translate3d(${(q.x - W_NODE / 2).toFixed(2)}px, ${(q.y - (W_NODE * ASPECT) / 2).toFixed(2)}px, ${q.z.toFixed(1)}px) scale(${(1 + 0.3 * o).toFixed(3)})`;
        el.style.visibility = q.z > PASS_Z || detailRef.current === n.id ? "hidden" : "visible";
        if (goal === 0) el.style.zIndex = String(k > 0.01 ? Math.min(199, Math.max(1, Math.round(99 + q.z / 10))) : 5);
      }
      // Crawl the grain a few times a second, in jumps, like film.
      if (!reduce && now - grainT > 70) {
        grainT = now;
        const gx = Math.floor(Math.random() * 160);
        const gy = Math.floor(Math.random() * 160);
        boxRef.current?.style.setProperty("--grain", `${gx}px ${gy}px`);
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
      {/* Dotted threads from each card to its place */}
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {cards.map((c, i) => (
          <motion.g
            key={c.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: lit(c.id) ? 0.9 : 0.35 }}
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
                {/* Square, flat frame; blur, haze and grain stay inside it. */}
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
                  <span className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300" style={{ opacity: `calc(${haze} * var(--haze-k, 1))` }} />
                  <Grain />
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
                  <Grain strength={0.04} />
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

      <ProjectDetail open={detail} onClose={closeDetail} />
    </div>
  );
}
