"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { BURST_FRAG, VERT } from "./burstShader";
import MapStage from "./MapStage";
import GlobeStage, { GLOBE_DURATION, GLOBE_FLATTEN_AT } from "./GlobeStage";

// Slow → fast → slow. Every word move, the convergence and the dock share it.
const EASE = [0.65, 0, 0.35, 1] as const;
// Vacuum: slow, then fast, then extra fast. Used for the dock.
const VACUUM = [0.7, 0, 0.84, 0] as const;

export const LINES = [
  ["Leading", "design", "for"],
  ["AI", "and", "spatial", "systems."],
];
export const SUBTITLE = "Leading design at Jeevy Fabrication and NASA Harvest. Building the systems, the team, and the code.";
const WORDS = LINES.flat();

// Timeline in seconds at speed 1. Everything but the dock is done by ~3.7s.
const T = {
  scatter: 0.15, // words start arriving after a blank beat
  converge: 1.05,
  assembled: 1.5,
  flood: 1.5, // white falls away centre first, then the middle, then the edges
  floodDur: 0.35,
  peak: 1.85,
  clear: 1.95, // white refills from the edges inward; the centre is last
  clearDur: 1.25,
  invert: 1.95, // black star forms inside the white core
  blast: 2.6, // the white blob blasts outwards, swallowing the star
  blastDur: 0.65,
  survivors: 3.6, // last stray cells are gone
  globe: 2.75, // blocks are already flying in from off screen as the blast clears
  dock: 2.75 + GLOBE_FLATTEN_AT, // headline docks as the globe unrolls
  dockDur: 0.9,
  end: 2.75 + GLOBE_DURATION + 0.4,
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
  { enter: "right", a: { x: 0.62, y: 0.2, s: 0.4 }, b: { x: 0.56, y: 0.3, s: 0.7 } },
  { enter: "left", a: { x: 0.16, y: 0.44, s: 1.15 }, b: { x: 0.24, y: 0.4, s: 0.8 } },
  { enter: "down", a: { x: 0.5, y: 0.8, s: 0.35 }, b: { x: 0.48, y: 0.7, s: 0.55 } },
];
const ENTER_OFFSET = 140;
const lensBlur = (scale: number) => +Math.min(10, Math.abs(Math.log2(scale)) * 6).toFixed(1);

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
  /** After clearing, the cell stays blank white (hiding the type) until here. */
  maskEnd: number;
  /** Distance of the cell centre from the screen centre, in px. */
  dist: number;
  /** Per-cell jitter on the core radius, so the black/white split is ragged. */
  coreBias: number;
  /** On black: whether this cell shows the faint outline of the type at all. */
  faint: boolean;
  /** Round the black star: snapped back to white, showing the base black type. */
  punch: boolean;
};

// Small cells; the big dark and white areas are clumps of them.
function buildCells(w: number, h: number): { size: number; cells: Cell[] } {
  const size = Math.round(Math.max(w, h) / 20);
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
      // A scatter of small cells never goes dark, so white specks stay in the mass.
      if (rand() < 0.02) continue;
      const clump = spread(valueNoise(c * 0.18, r * 0.18, 1));
      const on = T.flood + (0.78 * d + 0.22 * clump) * T.floodDur + rand() * 0.03;
      const blink = rand() < 0.08;
      const blinkAt = blink ? T.flood + 0.1 + rand() * (T.clear - T.flood) : -1;
      const blinkEnd = blink ? blinkAt + 0.04 + rand() * 0.07 : -1;
      // Refill from the edges inward, ragged, easing out so the centre lags.
      const u = clamp01(0.75 * (1 - d) + 0.25 * spread(valueNoise(c * 0.22, r * 0.22, 2)) + (rand() - 0.5) * 0.1);
      const off = T.clear + Math.pow(u, 1.6) * T.clearDur;
      // Some cells come back blank white and hide the type for a moment.
      const maskEnd = rand() < 0.45 ? off + 0.05 + rand() * 0.3 : off;
      cells.push({
        x, y, on, off, blinkAt, blinkEnd, maskEnd, dist,
        coreBias: 0.7 + rand() * 0.6,
        faint: rand() < 0.55,
        punch: rand() < 0.22,
      });
    }
  }
  return { size, cells };
}

const isDark = (c: Cell, e: number) =>
  e >= c.on && e < c.off && !(e >= c.blinkAt && e < c.blinkEnd);

const SUB_SPLIT = "-7px 1px 0 rgba(255,43,214,0.8), 6px -1px 0 rgba(0,225,255,0.8)";
const SUB_NONE = "0px 0px 0 rgba(255,43,214,0), 0px 0px 0 rgba(0,225,255,0)";

// Dark-phase type, split on cell edges:
// - on black, in a random scatter of cells: a faint, thin outline;
// - over the white core: solid black;
// - inside the black star once it grows: a few cells punched back to white
//   (solid black type), and some with a fluorescent beam travelling round the
//   outline (canvas, since CSS strokes can't take a moving gradient).

// The beam's colour bands, as conic-gradient stops: mostly clear, with a red →
// white → green flare and a smaller white → cyan one, swept round the screen.
const BEAM_STOPS: [number, string][] = [
  [0, "rgba(255,45,85,0)"],
  [0.08, "rgba(255,45,85,1)"],
  [0.12, "rgba(255,255,255,1)"],
  [0.16, "rgba(57,255,136,1)"],
  [0.24, "rgba(57,255,136,0)"],
  [0.52, "rgba(255,255,255,0)"],
  [0.58, "rgba(255,255,255,1)"],
  [0.63, "rgba(94,240,255,1)"],
  [0.7, "rgba(94,240,255,0)"],
  [1, "rgba(255,45,85,0)"],
];

// Faint outline on black: a hairline with a barely-there red/blue split.
const FAINT_LAYERS: [string, number][] = [
  ["rgba(255,40,90,0.22)", -1.5],
  ["rgba(0,160,255,0.22)", 1.5],
  ["rgba(255,255,255,0.26)", 0],
];


type Glyph = { text: string; x: number; y: number; font: string; tracking: string; width: number };

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
  const uInv = gl.getUniformLocation(prog, "u_inv");
  const uBlast = gl.getUniformLocation(prog, "u_blast");

  return (time: number, energy: number, glitch: number, inv: number, blast: number) => {
    gl.uniform1f(uTime, time);
    gl.uniform1f(uEnergy, energy);
    gl.uniform1f(uGlitch, glitch);
    gl.uniform1f(uInv, inv);
    gl.uniform1f(uBlast, blast);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

function energyAt(e: number) {
  if (e < T.flood) return 0;
  if (e < T.peak) return easeOutCubic((e - T.flood) / (T.peak - T.flood));
  return 1;
}

const invertAt = (e: number) => clamp01((e - T.invert) / 0.4);
const blastAt = (e: number) => easeOutCubic(clamp01((e - T.blast) / T.blastDur));

// Neon residue in the cells that linger after the clear.
const glitchAt = (e: number) => clamp01((e - (T.clear + T.clearDur * 0.5)) / 0.35);

type Phase = "measure" | "play" | "dock" | "final";

// Longest the intro waits on the globe being built before it starts anyway.
const WARM_CAP_MS = 1500;
type Layout = { motions: WordMotion[]; reduced: boolean };
type Dock = { x: number; y: number; scale: number; lineShift: number[] };
type WordMotion = { x: number[]; y: number[]; scale: number[]; opacity: number[]; filter: string[]; times: number[] };

// The subtitle hangs below the headline out of flow, so the headline's centre
// is its container's centre and the dock transform can scale about it.
const SUBTITLE_CLASS =
  "absolute left-1/2 top-full mt-6 w-[min(88vw,46rem)] -translate-x-1/2 text-balance text-xs font-medium leading-normal tracking-normal sm:text-base";

// The landing statement's weight; the headline eases to it while docking.
const DOCK_WEIGHT = 500;

export const HEADLINE_CLASS =
  "font-sans font-extrabold leading-[0.92] tracking-[-0.045em] text-[clamp(1.5rem,6.6vw,6.5rem)]";

function Headline({ wordRefs, lineRefs, lineShift, motions, settled, speed, dockTransition }: {
  wordRefs?: MutableRefObject<(HTMLSpanElement | null)[]>;
  lineRefs?: MutableRefObject<(HTMLSpanElement | null)[]>;
  /** Per-line x offsets that left-align the lines when docked. */
  lineShift?: number[] | null;
  motions?: WordMotion[] | null;
  /** Skipped or reduced motion: snap every word to its final state. */
  settled?: boolean;
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
                animate={
                  m
                    ? { x: m.x, y: m.y, scale: m.scale, opacity: m.opacity, filter: m.filter }
                    : settled
                      ? { x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }
                      : undefined
                }
                transition={
                  m
                    ? { duration: T.assembled / speed, times: m.times, ease: m.times.slice(1).map(() => EASE) }
                    : settled
                      ? { duration: 0 }
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
function TypeClip({ clipRef, children }: { clipRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  return (
    <div
      ref={clipRef}
      className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      {children}
    </div>
  );
}

function SolidType() {
  return (
    <div className={`${HEADLINE_CLASS} relative text-black`}>
      <Headline speed={1} />
      <p className={SUBTITLE_CLASS}>{SUBTITLE}</p>
    </div>
  );
}

// Text runs to redraw on canvas, measured from the DOM so they sit exactly on
// the HTML type: each word of the headline plus the subtitle.
function measureGlyphs(ctx: CanvasRenderingContext2D, els: (HTMLElement | null | undefined)[]): Glyph[] {
  const out: Glyph[] = [];
  for (const el of els) {
    if (!el?.textContent) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // Canvas text is one line; skip anything the browser wrapped.
    if (r.height > parseFloat(cs.fontSize) * 2.2) continue;
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.font = font;
    const m = ctx.measureText("Hg");
    // Line box height minus the font's own height, split evenly above and below.
    const y = r.top + (r.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    // Canvas rejects "normal" and would keep the previous run's tracking.
    const tracking = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    out.push({ text: el.textContent, x: r.left, y, font, tracking, width: parseFloat(cs.fontSize) > 24 ? 2 : 0.8 });
  }
  return out;
}

interface Props {
  /** Playback rate; 0.25 slows the whole timeline for inspection. */
  speed?: number;
  onDone?: () => void;
  /** Where the headline docks: the landing headline's box. Falls back to top-left. */
  dockTo?: () => DOMRect | null;
  /** How the landing sets the statement's lines: the dock matches it. */
  dockAlign?: "left" | "center";
  /** Hand-off: once the landing shows its own headline, hide this one. */
  hideHeadline?: boolean;
  /** The headline starts docking (or the intro was skipped). */
  onDock?: () => void;
  /** Skip straight to the docked end state (e.g. already seen this session). */
  instant?: boolean;
}

export default function HyperspaceIntro({ speed = 1, onDone, dockTo, dockAlign = "left", hideHeadline = false, onDock, instant: skipIntro = false }: Props) {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [stage, setStage] = useState<"run" | "dock" | "final">("run");
  // Held on the blank white beat until the globe is built and compiled, so
  // no shader compile lands while the words pull into focus. Capped, so a
  // slow device still starts.
  const [warm, setWarm] = useState(false);
  const markWarm = useCallback(() => setWarm(true), []);
  useEffect(() => {
    const id = setTimeout(() => {
      performance.mark("intro:warm-cap");
      markWarm();
    }, WARM_CAP_MS);
    return () => clearTimeout(id);
  }, [markWarm]);
  const phase: Phase = !layout ? "measure" : layout.reduced ? "final" : !warm ? "measure" : stage === "run" ? "play" : stage;
  const motions = layout?.motions ?? null;
  const [dock, setDock] = useState<Dock | null>(null);
  const [globeOn, setGlobeOn] = useState(false);
  const [mapOn, setMapOn] = useState(false);
  const showMap = useCallback(() => setMapOn(true), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const setWave = useCallback((r: number) => rootRef.current?.style.setProperty("--wave", `${r.toFixed(1)}px`), []);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const faintRef = useRef<HTMLDivElement>(null);
  const solidRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const faintCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<() => void>(() => {});

  const skip = useCallback(() => skipRef.current(), []);

  // Docked: top-left, about 40px tall, lines left-aligned. Measured when the
  // dock starts, so it reflects loaded fonts and the current viewport.
  // The dock target and alignment are read through refs, so a view switch
  // (new props) never gives measureDock a new identity and restarts the intro.
  const dockToRef = useRef(dockTo);
  const dockAlignRef = useRef(dockAlign);
  useEffect(() => {
    dockToRef.current = dockTo;
    dockAlignRef.current = dockAlign;
  });
  const measureDock = useCallback((): Dock => {
    const dockTo = dockToRef.current;
    const dockAlign = dockAlignRef.current;
    const head = headlineRef.current?.getBoundingClientRect();
    if (!head) return { x: 0, y: 0, scale: 1, lineShift: [] };
    // Dock onto the landing headline's box if there is one, else top-left.
    const target = dockTo?.();
    const scale = target ? target.height / head.height : 40 / head.height;
    const left = target ? target.left : window.innerWidth < 640 ? 16 : 28;
    const top = target ? target.top : 20;
    return {
      scale,
      x:
        target && dockAlign === "center"
          ? target.left + target.width / 2 - (head.left + head.width / 2)
          : left + (head.width * scale) / 2 - (head.left + head.width / 2),
      y: top + (head.height * scale) / 2 - (head.top + head.height / 2),
      // Lines are centred in the headline box. A centred statement keeps them
      // so; a left-aligned one shifts each so its first word starts at the edge.
      lineShift: lineRefs.current.map((el) => {
        if (dockAlign === "center") return 0;
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

    const reduced = skipIntro || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      // Arrivals spread over the scatter window however many words there are.
      const arrive = T.scatter + (i / Math.max(1, WORDS.length - 1)) * 0.5;
      // Keyframe offsets must never go backwards: each is clamped between the
      // one before it and convergence, even for the last word in.
      const settle = Math.max(arrive + 0.02, Math.min(arrive + 0.3, T.converge - 0.25));
      const drift = Math.max(settle + 0.02, Math.min(arrive + 0.6, T.converge - 0.02));
      const times = [0, arrive, settle, drift, T.converge, T.assembled].map((t) => t / T.assembled);
      return {
        x: [ex, ex, ax, bx, bx, 0],
        y: [ey, ey, ay, by, by, 0],
        scale: [sc.a.s, sc.a.s, sc.a.s, sc.b.s, sc.b.s, 1],
        opacity: [0, 0, 1, 1, 1, 1],
        // Lens blur: each word arrives out of focus and pulls sharp; words
        // held far off their final size (as if near or far from the lens)
        // stay soft until they settle into the headline.
        filter: [18, 18, lensBlur(sc.a.s), lensBlur(sc.b.s), lensBlur(sc.b.s), 0].map((px) => `blur(${px}px)`),
        times,
      };
    });
    setLayout({ motions: ms, reduced });
    if (reduced) {
      setDock(measureDock());
      onDock?.();
      onDone?.();
    }
  }, [measureDock]); // eslint-disable-line react-hooks/exhaustive-deps -- runs once on mount

  // The frame loop runs from play through the dock to the end. Keyed on this
  // rather than on "play" alone: switching to "dock" must not tear the loop
  // down, or it never reaches the end and never reports done.
  const running = phase === "play" || phase === "dock";

  useEffect(() => {
    if (!running) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { size, cells } = buildCells(w, h);
    const canvas = canvasRef.current;
    const drawBurst = canvas ? createBurst(canvas, size) : null;
    const faintClip = faintRef.current;
    const solidClip = solidRef.current;
    const beamClip = beamRef.current;
    const mask = maskRef.current;
    const dark = darkRef.current;

    // Outline canvases, sized to the viewport.
    const odpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = (c: HTMLCanvasElement | null) => {
      const ctx = c?.getContext("2d") ?? null;
      if (c && ctx) {
        c.width = Math.round(w * odpr);
        c.height = Math.round(h * odpr);
        ctx.setTransform(odpr, 0, 0, odpr, 0, 0);
      }
      return ctx;
    };
    const octx = fit(outlineRef.current);
    const fctx = fit(faintCanvasRef.current);
    let glyphs: Glyph[] | null = null;
    let faintDrawn = false;
    const ls = (ctx: CanvasRenderingContext2D) => ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    const ensureGlyphs = (ctx: CanvasRenderingContext2D) =>
      // Measured on first use, once the words have settled into place.
      (glyphs ??= measureGlyphs(ctx, [...wordRefs.current, headlineRef.current?.querySelector("p")]));

    // The font builds letters from overlapping shapes (P = bowl over stem), so
    // a plain stroke traces the hidden insides too. Stroke at double width,
    // then erase the filled letter: only the outer edge is left.
    const traceOutline = (ctx: CanvasRenderingContext2D, style: string | CanvasGradient, glow: number, weight: number) => {
      const gs = ensureGlyphs(ctx);
      ctx.globalCompositeOperation = "source-over";
      ctx.lineJoin = "round";
      ctx.strokeStyle = style;
      ctx.shadowColor = glow ? "rgba(255,255,255,0.8)" : "transparent";
      ctx.shadowBlur = glow;
      for (const g of gs) {
        ctx.font = g.font;
        ls(ctx).letterSpacing = g.tracking;
        ctx.lineWidth = g.width * weight * 2;
        ctx.strokeText(g.text, g.x, g.y);
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "destination-out";
      for (const g of gs) {
        ctx.font = g.font;
        ls(ctx).letterSpacing = g.tracking;
        ctx.fillText(g.text, g.x, g.y);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    // Faint outline never changes: each tinted layer is traced on its own
    // canvas (so erasing one doesn't bite into another) and stacked once.
    const drawFaint = () => {
      if (faintDrawn || !fctx) return;
      faintDrawn = true;
      for (const [color, dx] of FAINT_LAYERS) {
        const layer = document.createElement("canvas");
        layer.width = Math.round(w * odpr);
        layer.height = Math.round(h * odpr);
        const lctx = layer.getContext("2d")!;
        lctx.setTransform(odpr, 0, 0, odpr, 0, 0);
        traceOutline(lctx, color, 0, 0.5);
        fctx.drawImage(layer, dx, 0, w, h);
      }
    };

    const drawBeam = (e: number) => {
      if (!octx) return;
      octx.clearRect(0, 0, w, h);
      const beam = octx.createConicGradient(e * 2.6, w / 2, h / 2);
      for (const [at, color] of BEAM_STOPS) beam.addColorStop(at, color);
      traceOutline(octx, beam, 4, 0.45);
    };
    const hide = "inset(0 0 100% 0)";
    let raf = 0;
    let docked = false;
    let globeCued = false;
    const t0 = performance.now();

    const finish = () => {
      cancelAnimationFrame(raf);
      for (const el of [dark, faintClip, solidClip, beamClip, mask]) if (el) el.style.clipPath = hide;
      // Skipped: show the whole map rather than wherever the wave had got to.
      rootRef.current?.style.removeProperty("--wave");
      setDock(measureDock());
      setStage("final");
      onDock?.();
      onDone?.();
    };
    skipRef.current = finish;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" || ev.key === "Enter") finish();
    };
    window.addEventListener("keydown", onKey);

    const tick = (now: number) => {
      const e = ((now - t0) / 1000) * speed;

      // Dark cells show the burst; freshly cleared cells can come back blank
      // white for a beat. Type rules per cell are described at the top.
      let all = "";
      let faint = "";
      let solid = "";
      let beamed = "";
      let blank = "";
      const energy = energyAt(e);
      // The blast grows the white core past the screen and swallows the star.
      const blast = blastAt(e);
      const coreR = h * (0.3 * energy + 1.6 * blast * blast);
      const inv = invertAt(e) * (1 - blast);
      const invR = inv > 0 ? h * (0.04 + 0.18 * inv) * 0.85 : 0;
      for (const c of cells) {
        const sq = `M${c.x} ${c.y}h${size}v${size}h${-size}Z`;
        if (isDark(c, e)) {
          if (c.dist < invR) {
            // A few cells round the star (never over it) snap back to white,
            // so the star always tears out of the boom itself.
            if (c.punch && c.dist > invR * 0.6) continue;
            // Type stays in front of the star: solid black reads where white
            // petals show through, the beam outline where the star is black.
            all += sq;
            solid += sq;
            beamed += sq;
          } else {
            all += sq;
            if (c.dist < coreR * c.coreBias) solid += sq;
            else if (c.faint) faint += sq;
          }
        } else if (e >= c.off && e < c.maskEnd) {
          blank += sq;
        }
      }
      const clip = (el: HTMLElement | null, d: string) => {
        if (el) el.style.clipPath = d ? `path("${d}")` : hide;
      };
      clip(dark, all);
      clip(faintClip, faint);
      clip(solidClip, solid);
      clip(beamClip, beamed);
      clip(mask, blank);
      if (all) drawBurst?.(e - T.flood, energy, glitchAt(e), invertAt(e), blast);
      if (faint) drawFaint();
      if (beamed) drawBeam(e);

      if (e >= T.globe && !globeCued) {
        globeCued = true;
        setWave(0);
        setGlobeOn(true);
      }
      if (!docked && e >= T.dock) {
        docked = true;
        setDock(measureDock());
        setStage("dock");
        onDock?.();
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
  }, [running, speed, onDone, onDock, measureDock, setWave]);

  const docking = phase === "dock" || phase === "final";
  const instant = phase === "final";
  const s = 1 / speed;
  const dockTransition = { duration: instant ? 0 : T.dockDur * s, ease: VACUUM };

  return (
    <div ref={rootRef} className="fixed inset-0 overflow-hidden bg-white text-[#0a0a0a]" onClick={phase === "play" ? skip : undefined}>
      {/* Scroll-driven camera for the landing: zoom about the pointer, then
          blur and fade out. Driven by CSS variables set on <html>. No
          will-change, no 3D transform and no filter while sharp: any of them
          makes the browser rasterise the layer once at 1× and stretch it, so
          the vector map would pixelate when zoomed. */}
      <div
        className="absolute inset-0"
        style={{
          transform: "translate(0, var(--map-y, 0px)) scale(var(--map-zoom, 1))",
          transformOrigin: "var(--map-ox, 50%) var(--map-oy, 50%)",
          filter: "var(--map-filter, none)",
          opacity: "var(--map-opacity, 1)",
        }}
      >
        <MapStage play={mapOn || instant} instant={instant} speed={speed} />
      </div>
      {!instant && (
        <div className="pointer-events-none absolute inset-0">
          <GlobeStage play={globeOn} speed={speed} onFlat={showMap} onWave={setWave} onReady={markWarm} />
        </div>
      )}

      {/* Base layer: what the white cells show */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        style={{ opacity: hideHeadline ? 0 : 1, transition: "opacity 0.25s ease" }}
        animate={docking && dock ? { x: dock.x, y: dock.y, scale: dock.scale } : { x: 0, y: 0, scale: 1 }}
        transition={dockTransition}
      >
        {/* The weight eases down to the landing statement's while it docks
            (Manrope is a variable font), so the hand-off doesn't jump. */}
        <div
          ref={headlineRef}
          className={`${HEADLINE_CLASS} relative`}
          style={{
            fontWeight: docking ? DOCK_WEIGHT : 800,
            transition: instant ? "none" : `font-weight ${T.dockDur * s}s cubic-bezier(0.7, 0, 0.84, 0)`,
          }}
        >
          <Headline
            wordRefs={wordRefs}
            lineRefs={lineRefs}
            lineShift={docking ? dock?.lineShift : null}
            motions={phase === "measure" || instant ? null : motions}
            settled={instant}
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
        <TypeClip clipRef={faintRef}>
          <canvas ref={faintCanvasRef} className="absolute inset-0 h-full w-full" />
        </TypeClip>
        <TypeClip clipRef={solidRef}>
          <SolidType />
        </TypeClip>
        <TypeClip clipRef={beamRef}>
          <canvas ref={outlineRef} className="absolute inset-0 h-full w-full" />
        </TypeClip>
      </div>

      {/* Blank white cells that briefly hide the type as the screen clears */}
      <div
        ref={maskRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      />

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
