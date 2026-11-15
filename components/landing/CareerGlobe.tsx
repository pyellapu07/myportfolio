"use client";

import { useEffect, useRef } from "react";
import { LAND_GRID } from "@/components/map/landGrid";
import type { Role } from "./content";

// The career as a path across a dot-matrix globe. Land is drawn as dots (the
// map's own land grid, thinned toward the poles), the far side faint through
// the near side. The globe turns to the role in focus; flight arcs join the
// roles in the order they happened, and the one into the current role draws
// itself with a bright head.

const SIGNAL = "#ff5a1f";
const D2R = Math.PI / 180;

type Vec = [number, number, number];
const toVec = (lon: number, lat: number): Vec => [Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(lon * D2R)];

function landDots(): Vec[] {
  const raw = atob(LAND_GRID.bits);
  const out: Vec[] = [];
  const { step, cols, rows, lat0 } = LAND_GRID;
  for (let r = 0; r < rows; r++) {
    const lat = lat0 - (r + 0.5) * step;
    // Thin columns toward the poles so the dots stay evenly spaced.
    const every = Math.max(1, Math.round(1 / Math.max(0.2, Math.cos(lat * D2R))));
    for (let c = 0; c < cols; c++) {
      if (c % every) continue;
      const i = r * cols + c;
      if (((raw.charCodeAt(i >> 3) >> (i & 7)) & 1) !== 1) continue;
      out.push(toVec(-180 + (c + 0.5) * step, lat));
    }
  }
  return out;
}

/** Spherical interpolation between two unit vectors. */
function slerp(a: Vec, b: Vec, t: number): Vec {
  const d = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const w = Math.acos(d);
  if (w < 1e-4) return a;
  const s = Math.sin(w);
  const ka = Math.sin((1 - t) * w) / s;
  const kb = Math.sin(t * w) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}

export default function CareerGlobe({ roles, active, className = "" }: { roles: Role[]; active: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = landDots();
    // Oldest first: the path runs the way the career did.
    const stops = [...roles].reverse().map((r) => ({ v: toVec(r.lon, r.lat), city: r.place.split(",")[0] }));
    const n = stops.length;

    let w = 0;
    let h = 0;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // View: the globe's centre (lon, lat), easing to the focused stop.
    const startStop = stops[n - 1 - activeRef.current];
    let lon = Math.atan2(startStop.v[0], startStop.v[2]) / D2R;
    let lat = Math.asin(startStop.v[1]) / D2R;
    let shownChrono = n - 1 - activeRef.current;
    let leg = 1; // 0..1 draw of the arc into the current stop
    let raf = 0;
    const t0 = performance.now();
    let last = t0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !w) return;
      const t = (now - t0) / 1000;
      // Frame-rate independent easing.
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const ease = reduce ? 1 : 1 - Math.pow(1 - 0.05, dt * 60);
      const chrono = n - 1 - activeRef.current;
      if (chrono !== shownChrono) {
        shownChrono = chrono;
        leg = reduce ? 1 : 0;
      }
      leg = Math.min(1, leg + dt * 1.1);
      const target = stops[chrono].v;
      const tLon = Math.atan2(target[0], target[2]) / D2R - 18; // sit a little right of centre
      const tLat = Math.asin(target[1]) / D2R * 0.6 + 8;
      const dLon = ((tLon - lon + 540) % 360) - 180;
      lon += dLon * ease;
      lat += (tLat - lat) * ease;

      // Room for the glow to fade out fully inside the canvas (R * 1.3 < half its size).
      const R = Math.min(w, h) * 0.37;
      const cx = w / 2;
      const cy = h / 2;
      // Rotation: yaw by -lon, then pitch by lat.
      const cl = Math.cos(-lon * D2R), sl = Math.sin(-lon * D2R);
      const cp = Math.cos(lat * D2R), sp = Math.sin(lat * D2R);
      const rot = (v: Vec): Vec => {
        const x = v[0] * cl + v[2] * sl;
        const z = -v[0] * sl + v[2] * cl;
        const y = v[1] * cp - z * sp;
        const z2 = v[1] * sp + z * cp;
        return [x, y, z2];
      };

      ctx.clearRect(0, 0, w, h);
      // Atmosphere and body.
      const glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.3);
      glow.addColorStop(0, "rgba(255,90,31,0.12)");
      glow.addColorStop(0.45, "rgba(255,90,31,0.04)");
      glow.addColorStop(1, "rgba(255,90,31,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "#1d1d21");
      body.addColorStop(1, "#0c0c0d");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Land dots: far side faint, near side brighter toward the middle.
      for (const d of dots) {
        const [x, y, z] = rot(d);
        const px = cx + x * R;
        const py = cy - y * R;
        if (z < 0) {
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(px - 0.6, py - 0.6, 1.2, 1.2);
        } else {
          const s = 0.7 + z * 1.1;
          ctx.fillStyle = `rgba(255,255,255,${(0.18 + z * 0.62).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Flight arcs, lifted off the surface; hidden where they pass behind.
      const project = (v: Vec, alt: number) => {
        const [x, y, z] = rot(v);
        const px = x * R * alt;
        const py = y * R * alt;
        // Only the near side: a lifted arc never shows past the far limb.
        const hidden = z < 0.02;
        return { x: cx + px, y: cy - py, hidden };
      };
      // Arcs stay inside the globe's own disc (a hair beyond, for the lift).
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.03, 0, Math.PI * 2);
      ctx.clip();
      for (let k = 0; k < chrono; k++) {
        const a = stops[k].v;
        const b = stops[k + 1].v;
        const current = k === chrono - 1;
        const upto = current ? leg : 1;
        const steps = 64;
        ctx.lineWidth = current ? 2 : 1.2;
        ctx.lineCap = "round";
        let prev: { x: number; y: number; hidden: boolean } | null = null;
        let head = null as { x: number; y: number; hidden: boolean } | null;
        for (let i = 0; i <= steps * upto; i++) {
          const u = i / steps;
          const dist = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
          const p = project(slerp(a, b, u), 1 + Math.sin(Math.PI * u) * Math.min(0.14, 0.05 + dist * 0.05));
          if (prev && !p.hidden && !prev.hidden) {
            ctx.strokeStyle = current ? SIGNAL : `rgba(255,255,255,${0.15 + 0.35 * (k / Math.max(1, chrono))})`;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
          prev = p;
          head = p;
        }
        if (current && head && !head.hidden && leg < 1) {
          ctx.fillStyle = "#fff";
          ctx.shadowColor = SIGNAL;
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.restore();

      // Places: visited ones as small rings, the current one lit with a pulse and its name.
      ctx.font = "600 15px var(--font-manrope), Manrope, sans-serif";
      const drawn = new Set<string>();
      for (let k = 0; k <= chrono; k++) {
        const p = project(stops[k].v, 1);
        if (p.hidden) continue;
        const current = k === chrono;
        const key = stops[k].city;
        if (drawn.has(key) && !current) continue;
        drawn.add(key);
        if (current) {
          const pulse = reduce ? 0.5 : (t * 0.8) % 1;
          ctx.strokeStyle = `rgba(255,90,31,${(1 - pulse) * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 + pulse * 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = SIGNAL;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
          const label = stops[k].city;
          const tw = ctx.measureText(label).width;
          const lx = p.x + 14;
          const ly = p.y - 14;
          ctx.fillStyle = "rgba(12,12,13,0.78)";
          ctx.beginPath();
          ctx.roundRect(lx - 10, ly - 17, tw + 20, 28, 14);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.fillText(label, lx, ly + 2);
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.7)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [roles]);

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
