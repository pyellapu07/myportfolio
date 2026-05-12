"use client";

import { useEffect, useRef } from "react";

/* ─── tunables ─────────────────────────────────────────── */
const POOL           = 4800;   // total particle count
const SAMPLE_STEP    = 2;      // px between pixel samples (lower = denser)
const SCATTER_MS     = 580;    // how long scatter phase runs before reform begins
const SCATTER_MIN    = 70;     // min scatter radius (px, canvas-space)
const SCATTER_MAX    = 200;    // max scatter radius
/* ─────────────────────────────────────────────────────── */

interface Particle {
  x: number; y: number;          // current position
  vx: number; vy: number;        // velocity
  tx: number; ty: number;        // reform target (text pixel)
  sx: number; sy: number;        // scatter target
  r: number;                     // radius
}

type Phase = "idle" | "scatter" | "reform";

/** Draw word into offscreen canvas, return sampled pixel coords */
function sampleWord(
  word: string,
  cw: number,
  ch: number,
  font: string,
): [number, number][] {
  const oc  = document.createElement("canvas");
  oc.width  = cw;
  oc.height = ch;
  const ctx = oc.getContext("2d")!;
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle    = "#fff";
  ctx.font         = font;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(word, cw / 2, ch / 2);

  const { data } = ctx.getImageData(0, 0, cw, ch);
  const pts: [number, number][] = [];
  for (let y = 0; y < ch; y += SAMPLE_STEP) {
    for (let x = 0; x < cw; x += SAMPLE_STEP) {
      if (data[(y * cw + x) * 4 + 3] > 110) pts.push([x, y]);
    }
  }
  return pts;
}

/** Build the fixed-size particle pool, all placed at text positions */
function buildPool(
  pts: [number, number][],
  cw: number,
  ch: number,
): Particle[] {
  const pool: Particle[] = [];
  for (let i = 0; i < POOL; i++) {
    const [tx, ty] = pts[i % pts.length];
    const angle = Math.random() * Math.PI * 2;
    const dist  = SCATTER_MIN + Math.random() * (SCATTER_MAX - SCATTER_MIN);
    pool.push({
      x: cw / 2 + Math.cos(angle) * dist * 0.6, // start slightly scattered for entrance
      y: ch / 2 + Math.sin(angle) * dist * 0.6,
      vx: 0, vy: 0,
      tx, ty,
      sx: cw / 2 + Math.cos(angle) * dist,
      sy: ch / 2 + Math.sin(angle) * dist,
      r: 0.55 + Math.random() * 0.9,
    });
  }
  return pool;
}

/** Assign new scatter destinations (called before each scatter phase) */
function reassignScatter(pool: Particle[], cw: number, ch: number) {
  for (const p of pool) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = SCATTER_MIN + Math.random() * (SCATTER_MAX - SCATTER_MIN);
    p.sx = cw / 2 + Math.cos(angle) * dist;
    p.sy = ch / 2 + Math.sin(angle) * dist;
  }
}

export default function ParticleText({
  words,
  wordIndex,
  color   = "#FF5210",
  width   = 900,
  height  = 118,
}: {
  words:     string[];
  wordIndex: number;
  color?:    string;
  width?:    number;
  height?:   number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* All mutable animation state lives in a ref — zero re-renders */
  const state = useRef<{
    pool:      Particle[];
    phase:     Phase;
    prevIndex: number;
    rafId:     number;
    timer:     ReturnType<typeof setTimeout> | null;
    font:      string;
    mounted:   boolean;
  }>({
    pool:      [],
    phase:     "idle",
    prevIndex: -1,
    rafId:     0,
    timer:     null,
    font:      "",
    mounted:   false,
  });

  /* ── Bootstrap once ────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s   = state.current;
    s.mounted = true;

    /* Resolve the actual display font from the computed style of
       the nearest font-display heading so particles match the hero. */
    const font = `400 ${Math.round(height * 0.74)}px "Instrument Serif", Georgia, serif`;
    s.font = font;

    /* Wait for fonts then init */
    document.fonts.ready.then(() => {
      if (!s.mounted) return;
      const pts = sampleWord(words[0], width, height, font);
      s.pool      = buildPool(pts, width, height);
      s.prevIndex = 0;
      s.phase     = "reform"; // animate in on load

      /* ── Animation loop ──────────────────────────────────── */
      function tick() {
        ctx.clearRect(0, 0, width, height);
        const { pool, phase } = s;
        let settled = true;

        for (let i = 0; i < pool.length; i++) {
          const p = pool[i];

          if (phase === "scatter") {
            /* Spring toward scatter position */
            p.vx += (p.sx - p.x) * 0.055;
            p.vy += (p.sy - p.y) * 0.055;
            p.vx *= 0.83;
            p.vy *= 0.83;
            if (Math.hypot(p.sx - p.x, p.sy - p.y) > 3) settled = false;
          } else if (phase === "reform") {
            /* Spring toward text pixel target */
            p.vx += (p.tx - p.x) * 0.085;
            p.vy += (p.ty - p.y) * 0.085;
            p.vx *= 0.76;
            p.vy *= 0.76;
            if (Math.hypot(p.tx - p.x, p.ty - p.y) > 1.2) settled = false;
          } else {
            /* Idle: micro-jitter then snap back */
            p.vx += (p.tx - p.x) * 0.18;
            p.vy += (p.ty - p.y) * 0.18;
            p.vx *= 0.52;
            p.vy *= 0.52;
          }

          p.x += p.vx;
          p.y += p.vy;

          /* Fade particles that are far from center during scatter */
          let alpha = 1;
          if (phase === "scatter") {
            const dist = Math.hypot(p.x - width / 2, p.y - height / 2);
            alpha = Math.max(0, 1 - dist / (SCATTER_MAX * 1.25));
          }

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }

        ctx.globalAlpha = 1;

        /* Phase transitions driven by settlement */
        if (phase === "reform" && settled) s.phase = "idle";

        s.rafId = requestAnimationFrame(tick);
      }

      tick();
    });

    return () => {
      s.mounted = false;
      cancelAnimationFrame(s.rafId);
      if (s.timer) clearTimeout(s.timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── React to word changes ──────────────────────────────── */
  useEffect(() => {
    const s = state.current;
    if (!s.mounted || s.prevIndex === wordIndex) return;
    s.prevIndex = wordIndex;

    /* Step 1 — scatter current particles */
    reassignScatter(s.pool, width, height);
    s.phase = "scatter";

    /* Step 2 — after SCATTER_MS, retarget to new word and reform */
    if (s.timer) clearTimeout(s.timer);
    s.timer = setTimeout(() => {
      if (!s.mounted) return;
      const pts = sampleWord(words[wordIndex], width, height, s.font);
      const { pool } = s;
      for (let i = 0; i < pool.length; i++) {
        const [ntx, nty] = pts[i % pts.length];
        pool[i].tx = ntx;
        pool[i].ty = nty;
      }
      s.phase = "reform";
    }, SCATTER_MS);
  }, [wordIndex, words, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-hidden
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );
}
