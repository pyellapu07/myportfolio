"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PROJECTS, type Project } from "./projects";
import { naturalEarth } from "./projection";
import { WORLD_MAP } from "./worldMap";
import { immersion } from "./immersion";

// Project cards floating over the map, AIRLA-style: dead straight, each with
// its own space, sized and faded by depth, drifting slowly and shifting with
// the cursor in parallax. A faint dotted line ties every card to its place.
// Hovering brings a card forward into focus with its title beneath.

const ASPECT = 0.625; // 16:10, as the thumbnails
const W_NEAR = 188; // card width at depth 0 (closest)
const W_FAR = 128; // card width at depth 1 (farthest)
const W_NODE = 62; // related-node width
const ORBIT = 30; // px between a parent card's edge and its nodes
// Immersive 3D: perspective, each card's Z by depth (near → far), how far
// the cards spread and the camera flies, and where a card passes the camera.
const PERSPECTIVE = 1100;
const Z_NEAR = 260;
const Z_FAR = -620;
const SPREAD = 0.35; // on top of the map zoom (1 + 0.9k), which the cards share
const FLY_DEPTH = 1300;
const PASS_Z = 640;
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

// Film grain: an SVG turbulence tile laid over every card (above the haze,
// hard-light so it reads on light images too) and shifted every few frames
// so it crawls like real grain.
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 2.6 -0.75"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

function Grain({ strength = 0.16 }: { strength?: number }) {
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
    const zOf = (depth: number) => Z_NEAR + (Z_FAR - Z_NEAR) * depth;
    const frame = (now: number) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      immersion.tick(now);
      const im = immersion.get();
      const k = im.k;
      const ox = box.w / 2;
      const oy = box.h / 2;
      // Flat position → 3D: spread out from the centre, pushed back or forward
      // by depth, flown through by the camera, then orbited round the centre
      // by the drag (yaw about Y, pitch about X). The map plane gets the same
      // rotation in CSS (--map-tilt), so cards and map turn together.
      const cy_ = Math.cos(im.yaw * k), sy_ = Math.sin(im.yaw * k);
      const cp_ = Math.cos(im.pitch * k), sp_ = Math.sin(im.pitch * k);
      const place = (x: number, y: number, depth: number) => {
        const s = 1 + SPREAD * k;
        const wx = (x - ox) * s;
        const wy = (y - oy) * s;
        const wz = k * zOf(depth);
        const rx = wx * cy_ + wz * sy_;
        const rz = -wx * sy_ + wz * cy_;
        const ry = wy * cp_ - rz * sp_;
        const rz2 = wy * sp_ + rz * cp_;
        return { x: ox + rx, y: oy + ry, z: rz2 + k * im.flight * FLY_DEPTH };
      };
      const turn = k > 0.001 ? ` rotateY(${(im.yaw * k).toFixed(4)}rad) rotateX(${(-im.pitch * k).toFixed(4)}rad)` : "";
      const lensBlur = (z: number) => Math.min(9, Math.abs(z) / 150);
      if (svgRef.current) svgRef.current.style.opacity = (1 - k).toFixed(3);
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
          const q = place(x, y, c.depth);
          el.style.transform = `translate3d(${(q.x - c.w / 2).toFixed(2)}px, ${(q.y - c.h / 2).toFixed(2)}px, ${q.z.toFixed(1)}px)${turn}`;
          // Cards that have flown past the camera fade away rather than fill the screen.
          el.style.opacity = (1 - Math.min(1, Math.max(0, (q.z - PASS_Z * 0.55) / (PASS_Z * 0.45)))).toFixed(3);
          el.style.visibility = q.z > PASS_Z ? "hidden" : "visible";
          const img = imgEls.current.get(c.id);
          if (img) {
            const base = Number(img.dataset.blur ?? 0);
            const b = hoverRef.current === c.id ? 0 : base * (1 - k) + lensBlur(q.z) * k;
            img.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none";
          }
        }
        const ln = lineEls.current.get(c.id);
        if (ln) {
          ln.setAttribute("x2", x.toFixed(1));
          ln.setAttribute("y2", (y + c.h / 2).toFixed(1));
        }
        const hit = hitEls.current.get(c.id);
        if (hit) hit.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
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
        const q = place(nx, ny, Math.min(1, pc.depth + 0.25));
        el.style.transform = `translate3d(${(q.x - W_NODE / 2).toFixed(2)}px, ${(q.y - (W_NODE * ASPECT) / 2).toFixed(2)}px, ${q.z.toFixed(1)}px) scale(${(1 + 0.3 * o).toFixed(3)})`;
        el.style.visibility = q.z > PASS_Z ? "hidden" : "visible";
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
      className="map-cards absolute inset-0 transition-opacity duration-500"
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
        // Depth haze: far cards are softer and hazier; the hovered one is crisp.
        const blur = on ? 0 : +(c.depth * 1.6).toFixed(2);
        const haze = on ? 0 : dim ? 0.55 : c.depth * 0.38;
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
              <Link href={c.href} className="block h-full w-full" aria-label={`${c.title}, ${c.place}`}>
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
                  <span className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300" style={{ opacity: haze }} />
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
              <Link href={n.href} className="block h-full w-full" aria-label={`${n.title}, ${n.role}`}>
                <span className="relative block h-full w-full overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 320px thumbs, already sized */}
                  <img src={n.thumb} alt="" width={W_NODE} height={h} className="h-full w-full object-cover" draggable={false} />
                  <span
                    className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-300"
                    style={{ opacity: open ? 0 : 0.6 }}
                  />
                  <Grain strength={0.14} />
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
    </div>
  );
}
