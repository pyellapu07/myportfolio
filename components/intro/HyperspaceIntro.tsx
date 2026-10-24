"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { motion } from "framer-motion";
import { BURST_FRAG, VERT } from "./burstShader";
import MapStage from "./MapStage";

// Slow → fast → slow. Every word move, the convergence and the dock share it.
const EASE = [0.65, 0, 0.35, 1] as const;

const LINES = [
  ["Pradeep", "Yellapu"],
  ["Geospatial", "AI"],
];
const SUBTITLE = "From satellite pixel to shipped product.";
const WORDS = LINES.flat();

// Timeline in seconds at speed 1. The intro proper is done by ~3.3s; the burst
// is cut off on its way up rather than allowed to finish.
const T = {
  scatter: 0.15, // words start arriving after a blank beat
  converge: 1.2,
  assembled: 1.65,
  flood: 1.65, // dark cells take part of the screen, in clumps
  floodDur: 0.3,
  peak: 1.95,
  clear: 2.15, // cells flip back to white in random clumps
  clearDur: 0.6,
  survivors: 3.2, // last lingering burst tiles are gone
  dock: 3.25,
  dockDur: 0.9,
  end: 4.6,
};

// Where each word shows up on its own, and where it drifts before it joins the
// headline: viewport fractions for its centre, a scale, and the side it
// enters from.
type Pose = { x: number; y: number; s: number };
type Scatter = { enter: "left" | "right" | "up" | "down"; a: Pose; b: Pose };
const SCATTER: Scatter[] = [
  { enter: "left", a: { x: 0.3, y: 0.3, s: 0.55 }, b: { x: 0.36, y: 0.36, s: 0.9 } },
  { enter: "right", a: { x: 0.72, y: 0.58, s: 0.32 }, b: { x: 0.64, y: 0.52, s: 0.6 } },
  { enter: "down", a: { x: 0.22, y: 0.7, s: 0.3 }, b: { x: 0.3, y: 0.62, s: 0.45 } },
  { enter: "up", a: { x: 0.84, y: 0.24, s: 1.4 }, b: { x: 0.74, y: 0.66, s: 0.5 } },
];
const ENTER_OFFSET = 140;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 2D value noise on a seeded lattice, so cells change in clumps
// rather than in a clean ring or as uniform static.
function valueNoise(x: number, y: number, seed: number) {
  const h = (i: number, j: number) => {
    const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = h(i, j) + (h(i + 1, j) - h(i, j)) * u;
  const b = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * u;
  return a + (b - a) * v;
}

// Stretch noise (which bunches around 0.5) back out to roughly 0..1.
const spread = (n: number) => clamp01((n - 0.2) / 0.6);

type Cell = {
  x: number;
  y: number;
  on: number;
  off: number;
  blinkAt: number;
  blinkEnd: number;
  /** Distance of the cell centre from the screen centre, in px. */
  dist: number;
  /** Per-cell jitter on the core radius, so the black/white split is ragged. */
  coreBias: number;
};

function buildCells(w: number, h: number): { size: number; cells: Cell[] } {
  const size = Math.round(Math.max(w, h) / 10);
  const cols = Math.ceil(w / size);
  const rows = Math.ceil(h / size);
  const rand = mulberry32(7);
  const maxD = Math.hypot(w, h) / 2;
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * size;
      const y = r * size;
      const dist = Math.hypot(x + size / 2 - w / 2, y + size / 2 - h / 2);
      const d = dist / maxD;
      // About a third of the screen, in clumps, never goes dark at all.
      const cover = 0.35 * d + 0.65 * spread(valueNoise(c * 0.45, r * 0.45, 1));
      if (cover > 0.68) continue;
      const on = T.flood + (cover / 0.68) * T.floodDur + rand() * 0.04;
      // Some cells punch a white hole in the dark mass for a beat.
      const blink = rand() < 0.1;
      const blinkAt = blink ? T.flood + 0.15 + rand() * (T.clear - T.flood) : -1;
      const blinkEnd = blink ? blinkAt + 0.05 + rand() * 0.08 : -1;
      // Clear: different clumps; a few cells linger with glitch residue.
      const linger = valueNoise(c * 0.6, r * 0.6, 3) > 0.72 && rand() < 0.5;
      const off = linger
        ? T.clear + T.clearDur + 0.05 + rand() * (T.survivors - T.clear - T.clearDur - 0.05)
        : T.clear + spread(valueNoise(c * 0.4, r * 0.4, 2)) * T.clearDur + rand() * 0.06;
      cells.push({ x, y, on, off, blinkAt, blinkEnd, dist, coreBias: 0.7 + rand() * 0.6 });
    }
  }
  return { size, cells };
}

const isDark = (c: Cell, e: number) =>
  e >= c.on && e < c.off && !(e >= c.blinkAt && e < c.blinkEnd);

const SUB_SPLIT = "-7px 1px 0 rgba(255,43,214,0.8), 6px -1px 0 rgba(0,225,255,0.8)";
const SUB_NONE = "0px 0px 0 rgba(255,43,214,0), 0px 0px 0 rgba(0,225,255,0)";

// Dark-phase type is plain and bold: white over dim cells, black over cells
// inside the blown-out core, split hard on cell edges, with a fixed fringe.
const GHOST_SHADOW = "-2px 0 0 rgba(255,0,64,0.85), 2px 0 0 rgba(0,170,255,0.85)";
const GHOST_SUB_SHADOW = "-3px 0 0 #ff2bd6, 3px 0 0 #00e1ff, 0 2px 0 #ffe600";

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function createBurst(canvas: HTMLCanvasElement, cellCss: number) {
  const gl = canvas.getContext("webgl");
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, BURST_FRAG);
  const prog = vs && fs ? gl.createProgram() : null;
  if (!prog || !vs || !fs) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(gl.getUniformLocation(prog, "u_res"), canvas.width, canvas.height);
  gl.uniform1f(gl.getUniformLocation(prog, "u_cell"), cellCss * (canvas.width / window.innerWidth));
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uEnergy = gl.getUniformLocation(prog, "u_energy");
  const uGlitch = gl.getUniformLocation(prog, "u_glitch");

  return (time: number, energy: number, glitch: number) => {
    gl.uniform1f(uTime, time);
    gl.uniform1f(uEnergy, energy);
    gl.uniform1f(uGlitch, glitch);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

function energyAt(e: number) {
  if (e < T.flood) return 0;
  if (e < T.peak) return easeOutCubic((e - T.flood) / (T.peak - T.flood));
  if (e < T.clear) return 1;
  return 1 - 0.65 * clamp01((e - T.clear) / (T.survivors - T.clear));
}

// Neon residue in the cells that linger after the clear.
const glitchAt = (e: number) => clamp01((e - (T.clear + T.clearDur * 0.5)) / 0.35);

type Phase = "measure" | "play" | "dock" | "final";
type Layout = { motions: WordMotion[]; reduced: boolean };
type Dock = { x: number; y: number; scale: number; lineShift: number[] };
type WordMotion = { x: number[]; y: number[]; scale: number[]; opacity: number[]; times: number[] };

// The subtitle hangs below the headline out of flow, so the headline's centre
// is its container's centre and the dock transform can scale about it.
const SUBTITLE_CLASS =
  "absolute left-1/2 top-full mt-6 -translate-x-1/2 whitespace-nowrap text-sm font-medium leading-normal tracking-normal sm:text-base";

const HEADLINE_CLASS =
  "font-sans font-extrabold leading-[0.92] tracking-[-0.045em] text-[clamp(2.75rem,8.5vw,8rem)]";

function Headline({ wordRefs, lineRefs, lineShift, motions, speed, dockTransition }: {
  wordRefs?: MutableRefObject<(HTMLSpanElement | null)[]>;
  lineRefs?: MutableRefObject<(HTMLSpanElement | null)[]>;
  /** Per-line x offsets that left-align the lines when docked. */
  lineShift?: number[] | null;
  motions?: WordMotion[] | null;
  speed: number;
  dockTransition?: object;
}) {
  let i = 0;
  return (
    <>
      {LINES.map((line, li) => (
        <motion.span
          key={li}
          ref={(el) => {
            if (lineRefs) lineRefs.current[li] = el;
          }}
          className="flex justify-center gap-[0.24em] whitespace-nowrap"
          animate={{ x: lineShift?.[li] ?? 0 }}
          transition={dockTransition}
        >
          {line.map((word) => {
            const idx = i++;
            const m = motions?.[idx];
            return (
              <motion.span
                key={word}
                ref={(el) => {
                  if (wordRefs) wordRefs.current[idx] = el;
                }}
                className="inline-block will-change-transform"
                initial={wordRefs ? { opacity: 0 } : false}
                animate={m ? { x: m.x, y: m.y, scale: m.scale, opacity: m.opacity } : undefined}
                transition={
                  m
                    ? { duration: T.assembled / speed, times: m.times, ease: m.times.slice(1).map(() => EASE) }
                    : undefined
                }
              >
                {word}
              </motion.span>
            );
          })}
        </motion.span>
      ))}
    </>
  );
}

// Full-screen so its clip-path is in viewport coordinates, like the cells.
function GhostType({ className, clipRef }: { className: string; clipRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={clipRef}
      className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      <div className={`${HEADLINE_CLASS} relative ${className}`} style={{ textShadow: GHOST_SHADOW }}>
        <Headline speed={1} />
        <p className={`${SUBTITLE_CLASS} italic`} style={{ textShadow: GHOST_SUB_SHADOW }}>
          {SUBTITLE}
        </p>
      </div>
    </div>
  );
}

interface Props {
  /** Playback rate; 0.25 slows the whole timeline for inspection. */
  speed?: number;
  onDone?: () => void;
}

export default function HyperspaceIntro({ speed = 1, onDone }: Props) {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [stage, setStage] = useState<"run" | "dock" | "final">("run");
  const phase: Phase = !layout ? "measure" : layout.reduced ? "final" : stage === "run" ? "play" : stage;
  const motions = layout?.motions ?? null;
  const [dock, setDock] = useState<Dock | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const whiteTypeRef = useRef<HTMLDivElement>(null);
  const blackTypeRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  const skip = useCallback(() => skipRef.current(), []);

  // Docked: top-left, about 40px tall, lines left-aligned. Measured when the
  // dock starts, so it reflects loaded fonts and the current viewport.
  const measureDock = useCallback((): Dock => {
    const head = headlineRef.current?.getBoundingClientRect();
    if (!head) return { x: 0, y: 0, scale: 1, lineShift: [] };
    const scale = 40 / head.height;
    const inset = window.innerWidth < 640 ? 16 : 28;
    return {
      scale,
      x: inset + (head.width * scale) / 2 - (head.left + head.width / 2),
      y: 20 + (head.height * scale) / 2 - (head.top + head.height / 2),
      // Lines are centred in the headline box; shift each so its first word
      // starts at the box's left edge.
      lineShift: lineRefs.current.map((el) => {
        const first = el?.firstElementChild?.getBoundingClientRect();
        return first ? head.left - first.left : 0;
      }),
    };
  }, []);

  // Measure the assembled layout, then express each word's scattered poses as
  // offsets from its final slot so convergence is just animating to zero.
  useLayoutEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ms = WORDS.map((_, i) => {
      const el = wordRefs.current[i];
      const r = el?.getBoundingClientRect();
      const cx = r ? r.left + r.width / 2 : vw / 2;
      const cy = r ? r.top + r.height / 2 : vh / 2;
      const sc = SCATTER[i % SCATTER.length];
      const ax = sc.a.x * vw - cx;
      const ay = sc.a.y * vh - cy;
      const bx = sc.b.x * vw - cx;
      const by = sc.b.y * vh - cy;
      const ex = ax + (sc.enter === "left" ? -ENTER_OFFSET : sc.enter === "right" ? ENTER_OFFSET : 0);
      const ey = ay + (sc.enter === "up" ? -ENTER_OFFSET : sc.enter === "down" ? ENTER_OFFSET : 0);
      const arrive = T.scatter + i * 0.12;
      // Keyframe offsets must never go backwards, so the drift is clamped to
      // finish before convergence even for the last word in.
      const settle = Math.min(arrive + 0.3, T.converge - 0.25);
      const drift = Math.min(arrive + 0.6, T.converge - 0.02);
      const times = [0, arrive, settle, drift, T.converge, T.assembled].map((t) => t / T.assembled);
      return {
        x: [ex, ex, ax, bx, bx, 0],
        y: [ey, ey, ay, by, by, 0],
        scale: [sc.a.s, sc.a.s, sc.a.s, sc.b.s, sc.b.s, 1],
        opacity: [0, 0, 1, 1, 1, 1],
        times,
      };
    });
    setLayout({ motions: ms, reduced });
    if (reduced) setDock(measureDock());
  }, [measureDock]);

  useEffect(() => {
    if (phase !== "play") return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { size, cells } = buildCells(w, h);
    const canvas = canvasRef.current;
    const drawBurst = canvas ? createBurst(canvas, size) : null;
    const whiteType = whiteTypeRef.current;
    const blackType = blackTypeRef.current;
    const dark = darkRef.current;
    const hide = "inset(0 0 100% 0)";
    let raf = 0;
    let docked = false;
    const t0 = performance.now();

    const finish = () => {
      cancelAnimationFrame(raf);
      for (const el of [dark, whiteType, blackType]) if (el) el.style.clipPath = hide;
      setDock(measureDock());
      setStage("final");
      onDone?.();
    };
    skipRef.current = finish;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" || ev.key === "Enter") finish();
    };
    window.addEventListener("keydown", onKey);

    const tick = (now: number) => {
      const e = ((now - t0) / 1000) * speed;

      // Each dark cell shows the burst; type over it is black inside the
      // blown-out core and white outside, split on cell edges.
      let all = "";
      let dim = "";
      let bright = "";
      const energy = energyAt(e);
      const coreR = h * 0.34 * energy;
      for (const c of cells) {
        if (!isDark(c, e)) continue;
        const sq = `M${c.x} ${c.y}h${size}v${size}h${-size}Z`;
        all += sq;
        if (c.dist < coreR * c.coreBias) bright += sq;
        else dim += sq;
      }
      if (dark) dark.style.clipPath = all ? `path("${all}")` : hide;
      if (whiteType) whiteType.style.clipPath = dim ? `path("${dim}")` : hide;
      if (blackType) blackType.style.clipPath = bright ? `path("${bright}")` : hide;
      if (all) drawBurst?.(e - T.flood, energy, glitchAt(e));

      if (!docked && e >= T.dock) {
        docked = true;
        setDock(measureDock());
        setStage("dock");
      }
      if (e >= T.end) {
        window.removeEventListener("keydown", onKey);
        onDone?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase === "play", speed, onDone, measureDock]); // eslint-disable-line react-hooks/exhaustive-deps

  const docking = phase === "dock" || phase === "final";
  const instant = phase === "final";
  const s = 1 / speed;
  const dockTransition = { duration: instant ? 0 : T.dockDur * s, ease: EASE };

  return (
    <div className="fixed inset-0 overflow-hidden bg-white text-[#0a0a0a]" onClick={phase === "play" ? skip : undefined}>
      <MapStage play={docking} instant={instant} speed={speed} />

      {/* Base layer: what the white cells show */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        animate={docking && dock ? { x: dock.x, y: dock.y, scale: dock.scale } : { x: 0, y: 0, scale: 1 }}
        transition={dockTransition}
      >
        <div ref={headlineRef} className={`${HEADLINE_CLASS} relative`}>
          <Headline
            wordRefs={wordRefs}
            lineRefs={lineRefs}
            lineShift={docking ? dock?.lineShift : null}
            motions={phase === "measure" || instant ? null : motions}
            speed={speed}
            dockTransition={dockTransition}
          />
        <motion.p
          className={`${SUBTITLE_CLASS} text-black/70`}
          initial={{ opacity: 0, textShadow: SUB_SPLIT }}
          animate={{
            opacity: docking ? 0 : phase === "play" ? 1 : 0,
            textShadow: phase === "play" ? SUB_NONE : SUB_SPLIT,
          }}
          transition={
            docking
              ? { duration: instant ? 0 : 0.3 * s }
              : {
                  opacity: { delay: T.clear * s, duration: 0.01 },
                  // Colour copies drift back into register as the screen clears.
                  textShadow: { delay: T.clear * s, duration: (T.clearDur + 0.5) * s, ease: EASE },
                }
          }
        >
          {SUBTITLE}
        </motion.p>
        </div>
      </motion.div>

      {/* Dark layer: burst and ghost type, clipped to the dark cells each frame */}
      <div
        ref={darkRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <GhostType className="text-white" clipRef={whiteTypeRef} />
        <GhostType className="text-black" clipRef={blackTypeRef} />
      </div>

      {phase === "play" && (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            skip();
          }}
          className="absolute bottom-5 right-5 text-[10px] uppercase tracking-[0.22em] text-white mix-blend-difference sm:bottom-7 sm:right-8"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          Skip intro ↵
        </button>
      )}
    </div>
  );
}
