"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";
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

// Timeline in seconds at speed 1.
const T = {
  scatter: 0.35, // words start arriving after a blank beat
  converge: 1.95,
  assembled: 2.55,
  flood: 2.8, // dark cells take the screen, centre first
  floodDur: 0.35,
  peak: 3.2,
  clear: 3.8, // cells flip back to white in random order
  clearDur: 0.7,
  survivors: 5.0, // last lingering burst tiles are gone
  dock: 5.2,
  dockDur: 1.0,
  end: 6.6,
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

type Cell = { x: number; y: number; on: number; off: number; blinkAt: number; blinkEnd: number };

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
      const d = Math.hypot(x + size / 2 - w / 2, y + size / 2 - h / 2) / maxD;
      // Flood: mostly clumps, loosely biased to the centre.
      const on = T.flood + (0.35 * d + 0.65 * spread(valueNoise(c * 0.32, r * 0.32, 1))) * T.floodDur + rand() * 0.05;
      // Some cells punch a white hole in the dark mass for a beat.
      const blink = rand() < 0.1;
      const blinkAt = blink ? T.peak - 0.15 + rand() * (T.clear - T.peak + 0.1) : -1;
      const blinkEnd = blink ? blinkAt + 0.06 + rand() * 0.1 : -1;
      // Clear: different clumps; a few small clusters linger with glitch residue.
      const linger = valueNoise(c * 0.55, r * 0.55, 3) > 0.74 && rand() < 0.55;
      const off = linger
        ? T.clear + T.clearDur + 0.1 + rand() * (T.survivors - T.clear - T.clearDur - 0.1)
        : T.clear + spread(valueNoise(c * 0.28, r * 0.28, 2)) * T.clearDur + rand() * 0.08;
      cells.push({ x, y, on, off, blinkAt, blinkEnd });
    }
  }
  return { size, cells };
}

const isDark = (c: Cell, e: number) =>
  e >= c.on && e < c.off && !(e >= c.blinkAt && e < c.blinkEnd);

const SUB_SPLIT = "-7px 1px 0 rgba(255,43,214,0.8), 6px -1px 0 rgba(0,225,255,0.8)";
const SUB_NONE = "0px 0px 0 rgba(255,43,214,0), 0px 0px 0 rgba(0,225,255,0)";

// Rainbow layers the ghost type tears into while it sits on dark cells.
const GHOST_LAYERS = ["#ff1f4b", "#ffb800", "#3dff6e", "#00d5ff", "#4d5bff", "#ff2bd6"];

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
type Layout = { motions: WordMotion[]; dock: { y: number; scale: number }; reduced: boolean };
type WordMotion = { x: number[]; y: number[]; scale: number[]; opacity: number[]; times: number[] };

// The subtitle hangs below the headline out of flow, so the headline's centre
// is its container's centre and the dock transform can scale about it.
const SUBTITLE_CLASS =
  "absolute left-1/2 top-full mt-6 -translate-x-1/2 whitespace-nowrap text-sm font-medium leading-normal tracking-normal sm:text-base";

const HEADLINE_CLASS =
  "font-sans font-extrabold leading-[0.92] tracking-[-0.045em] text-[clamp(2.75rem,8.5vw,8rem)]";

function Headline({ wordRefs, motions, speed }: {
  wordRefs?: MutableRefObject<(HTMLSpanElement | null)[]>;
  motions?: WordMotion[] | null;
  speed: number;
}) {
  let i = 0;
  return (
    <>
      {LINES.map((line, li) => (
        <span key={li} className="flex justify-center gap-[0.24em] whitespace-nowrap">
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
        </span>
      ))}
    </>
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
  const dock = layout?.dock ?? { y: 0, scale: 1 };
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const skipRef = useRef<() => void>(() => {});

  const skip = useCallback(() => skipRef.current(), []);

  // Measure the assembled layout, then express each word's scattered poses as
  // offsets from its final slot so convergence is just animating to zero.
  useLayoutEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Docked: about 44px tall, centred on y = 44.
    const head = headlineRef.current?.getBoundingClientRect();
    const dock = head
      ? { scale: 44 / head.height, y: 44 - (head.top + head.height / 2) }
      : { scale: 1, y: 0 };
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
      const arrive = T.scatter + i * 0.17;
      const times = [0, arrive, arrive + 0.45, arrive + 0.95, T.converge, T.assembled].map(
        (t) => t / T.assembled,
      );
      return {
        x: [ex, ex, ax, bx, bx, 0],
        y: [ey, ey, ay, by, by, 0],
        scale: [sc.a.s, sc.a.s, sc.a.s, sc.b.s, sc.b.s, 1],
        opacity: [0, 0, 1, 1, 1, 1],
        times,
      };
    });
    setLayout({ motions: ms, dock, reduced });
  }, []);

  useEffect(() => {
    if (phase !== "play") return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { size, cells } = buildCells(w, h);
    const canvas = canvasRef.current;
    const drawBurst = canvas ? createBurst(canvas, size) : null;
    const ghosts = ghostRefs.current;
    const dark = darkRef.current;
    let raf = 0;
    let docked = false;
    const t0 = performance.now();

    const finish = () => {
      cancelAnimationFrame(raf);
      if (dark) dark.style.clipPath = "inset(0 0 100% 0)";
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

      if (dark) {
        let d = "";
        for (const c of cells) {
          if (isDark(c, e)) d += `M${c.x} ${c.y}h${size}v${size}h${-size}Z`;
        }
        dark.style.clipPath = d ? `path("${d}")` : "inset(0 0 100% 0)";
        if (d) {
          const energy = energyAt(e);
          drawBurst?.(e - T.flood, energy, glitchAt(e));
          // Ghost layers fan apart with the burst and wobble out of phase.
          const amp = 1.5 + 13 * energy;
          ghosts.forEach((el, i) => {
            if (!el) return;
            const k = i - (GHOST_LAYERS.length - 1) / 2;
            const dx = (k * 0.55 + Math.sin(e * (19 + i * 3.1) + i * 1.7) * 0.6) * amp;
            const dy = Math.sin(e * (13 + i * 2.3) + i) * amp * 0.18;
            const skew = Math.sin(e * (9 + i) + i * 2.1) * amp * 0.25;
            el.style.transform = `translate(${dx}px, ${dy}px) skewX(${skew}deg)`;
          });
        }
      }

      if (!docked && e >= T.dock) {
        docked = true;
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
  }, [phase === "play", speed, onDone]); // eslint-disable-line react-hooks/exhaustive-deps

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
        animate={docking ? { y: dock.y, scale: dock.scale } : { y: 0, scale: 1 }}
        transition={dockTransition}
      >
        <div ref={headlineRef} className={`${HEADLINE_CLASS} relative`}>
          <Headline wordRefs={wordRefs} motions={phase === "measure" || instant ? null : motions} speed={speed} />
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
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className={`${HEADLINE_CLASS} relative text-transparent`}>
            {GHOST_LAYERS.map((color, i) => (
              <div
                key={color}
                ref={(el) => {
                  ghostRefs.current[i] = el;
                }}
                className="absolute inset-0 will-change-transform"
                style={{ WebkitTextStroke: `1.2px ${color}` }}
              >
                <Headline speed={speed} />
              </div>
            ))}
            <div className="relative [-webkit-text-stroke:1px_rgba(255,255,255,0.5)]">
              <Headline speed={speed} />
            </div>
            <p
              className={`${SUBTITLE_CLASS} italic text-white/60 [-webkit-text-stroke:0]`}
              style={{ textShadow: "-2px 0 #ff2bd6, 2px 0 #00e1ff, 0 1px #ffe600" }}
            >
              {SUBTITLE}
            </p>
          </div>
        </div>
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
