"use client";

import { useEffect, useRef } from "react";

/* ─── tunables ──────────────────────────────────────────────── */
const POOL        = 5500;   // particle count
const SAMPLE_STEP = 2;      // px between pixel samples in offscreen canvas
const SCATTER_MS  = 1100;   // ms particles stay scattered before reform starts

// Scatter physics — slow, drifty, elastic
const SC_STIFF    = 0.018;
const SC_DAMP     = 0.89;

// Reform physics — springy with overshoot
const RF_STIFF    = 0.055;
const RF_DAMP     = 0.68;

// Idle — barely any movement, particles breathe in place
const ID_STIFF    = 0.22;
const ID_DAMP     = 0.48;
/* ─────────────────────────────────────────────────────────── */

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number;   // reform target
  sx: number; sy: number;   // scatter target
  r: number;
}

type Phase = "idle" | "scatter" | "reform";

function sampleWord(
  word:     string,
  cw:       number,
  ch:       number,
  fontSize: number,
): [number, number][] {
  const oc  = document.createElement("canvas");
  oc.width  = cw;
  oc.height = ch;
  const ctx = oc.getContext("2d")!;
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle    = "#fff";
  ctx.font         = `400 ${fontSize}px "Instrument Serif", Georgia, serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(word, cw / 2, ch / 2);
  const { data } = ctx.getImageData(0, 0, cw, ch);
  const pts: [number, number][] = [];
  for (let y = 0; y < ch; y += SAMPLE_STEP)
    for (let x = 0; x < cw; x += SAMPLE_STEP)
      if (data[(y * cw + x) * 4 + 3] > 100) pts.push([x, y]);
  return pts;
}

function scatterDest(cw: number, ch: number) {
  // Scatter in any direction, distance proportional to canvas size
  const angle = Math.random() * Math.PI * 2;
  const base  = Math.max(cw, ch);
  const dist  = base * (0.35 + Math.random() * 0.65);
  return {
    sx: cw / 2 + Math.cos(angle) * dist,
    sy: ch / 2 + Math.sin(angle) * dist,
  };
}

function buildPool(pts: [number, number][], cw: number, ch: number): Particle[] {
  const pool: Particle[] = [];
  for (let i = 0; i < POOL; i++) {
    const [tx, ty] = pts[i % pts.length];
    const { sx, sy } = scatterDest(cw, ch);
    pool.push({
      x: sx, y: sy,   // start at scatter position for initial reform-in
      vx: 0, vy: 0,
      tx, ty,
      sx, sy,
      r: 0.6 + Math.random() * 1.1,
    });
  }
  return pool;
}

export default function ParticleText({
  words,
  wordIndex,
  color = "#FF5210",
}: {
  words:     string[];
  wordIndex: number;
  color?:    string;
}) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const state = useRef<{
    pool:      Particle[];
    phase:     Phase;
    prevIdx:   number;
    rafId:     number;
    timer:     ReturnType<typeof setTimeout> | null;
    cw:        number;
    ch:        number;
    fontSize:  number;
    mounted:   boolean;
    ctx:       CanvasRenderingContext2D | null;
  }>({
    pool: [], phase: "idle", prevIdx: -1,
    rafId: 0, timer: null,
    cw: 0, ch: 0, fontSize: 0,
    mounted: false, ctx: null,
  });

  /* ── Tick ────────────────────────────────────────────────── */
  function tick() {
    const s   = state.current;
    const ctx = s.ctx;
    if (!ctx || !s.mounted) return;

    ctx.clearRect(0, 0, s.cw, s.ch);
    const { pool, phase } = s;
    let settled = true;

    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];

      if (phase === "scatter") {
        p.vx += (p.sx - p.x) * SC_STIFF;
        p.vy += (p.sy - p.y) * SC_STIFF;
        p.vx *= SC_DAMP;
        p.vy *= SC_DAMP;
        if (Math.hypot(p.sx - p.x, p.sy - p.y) > 3) settled = false;
      } else if (phase === "reform") {
        p.vx += (p.tx - p.x) * RF_STIFF;
        p.vy += (p.ty - p.y) * RF_STIFF;
        p.vx *= RF_DAMP;
        p.vy *= RF_DAMP;
        if (Math.hypot(p.tx - p.x, p.ty - p.y) > 1.0) settled = false;
      } else {
        // idle — gentle snap
        p.vx += (p.tx - p.x) * ID_STIFF;
        p.vy += (p.ty - p.y) * ID_STIFF;
        p.vx *= ID_DAMP;
        p.vy *= ID_DAMP;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Fade as particles travel far from center during scatter
      let alpha = 0.88;
      if (phase === "scatter") {
        const dist = Math.hypot(p.x - s.cw / 2, p.y - s.ch / 2);
        const maxD = Math.max(s.cw, s.ch) * 0.7;
        alpha = Math.max(0, 0.88 * (1 - dist / maxD));
      }

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    if (phase === "reform" && settled) s.phase = "idle";

    s.rafId = requestAnimationFrame(tick);
  }

  /* ── Init / resize canvas via ResizeObserver ─────────────── */
  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const s   = state.current;
    s.ctx     = canvas.getContext("2d");
    s.mounted = true;

    function initCanvas(cw: number, ch: number) {
      if (cw < 10 || ch < 10) return;
      canvas!.width  = cw;
      canvas!.height = ch;
      s.cw       = cw;
      s.ch       = ch;
      s.fontSize = Math.round(ch * 0.78);
    }

    function reinit(cw: number, ch: number, wordIdx: number) {
      initCanvas(cw, ch);
      document.fonts.ready.then(() => {
        if (!s.mounted) return;
        const pts = sampleWord(words[wordIdx], cw, ch, s.fontSize);
        s.pool    = buildPool(pts, cw, ch);
        s.phase   = "reform";
      });
    }

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      if (Math.abs(rect.width - s.cw) < 2 && Math.abs(rect.height - s.ch) < 2) return;
      reinit(Math.round(rect.width), Math.round(rect.height), state.current.prevIdx < 0 ? 0 : state.current.prevIdx);
    });
    ro.observe(wrap);

    // Kick off first frame
    s.rafId = requestAnimationFrame(tick);

    return () => {
      s.mounted = false;
      ro.disconnect();
      cancelAnimationFrame(s.rafId);
      if (s.timer) clearTimeout(s.timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Word change ─────────────────────────────────────────── */
  useEffect(() => {
    const s = state.current;
    if (!s.mounted || s.cw < 10) return;
    if (s.prevIdx === wordIndex) return;
    s.prevIdx = wordIndex;

    // Reassign scatter destinations + start scatter
    for (const p of s.pool) {
      const { sx, sy } = scatterDest(s.cw, s.ch);
      p.sx = sx;
      p.sy = sy;
    }
    s.phase = "scatter";

    if (s.timer) clearTimeout(s.timer);
    s.timer = setTimeout(() => {
      if (!s.mounted) return;
      document.fonts.ready.then(() => {
        const pts = sampleWord(words[wordIndex], s.cw, s.ch, s.fontSize);
        for (let i = 0; i < s.pool.length; i++) {
          const [ntx, nty] = pts[i % pts.length];
          s.pool[i].tx = ntx;
          s.pool[i].ty = nty;
        }
        s.phase = "reform";
      });
    }, SCATTER_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIndex]);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
