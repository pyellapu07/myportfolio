"use client";

import { useEffect, useRef } from "react";
import { LAND_GRID, MAP_PROJECTION } from "@/components/map/landGrid";
import { WORLD_MAP } from "@/components/map/worldMap";

// After the blast, ocean blocks of uneven size and weight fly in from where
// the explosion threw them, settle onto a sphere (land left hollow), the globe
// turns to face Africa, then every block unrolls onto its spot on the flat map.

// Seconds at speed 1, from the moment `play` turns on.
const G = {
  assemble: 2.1, // last block has landed
  turn: 0.45, // settle facing Africa
  flatten: 1.3,
};
export const GLOBE_DURATION = G.assemble + G.turn + G.flatten;
export const GLOBE_FLATTEN_AT = G.assemble + G.turn;

const INK = [0.02, 0.022, 0.03];
const ACCENT = [0.12, 0.3, 1.0];
// The beam's colours, cycled on a scatter of blocks.
const BEAM = [
  [1.0, 0.18, 0.33],
  [1.0, 1.0, 1.0],
  [0.22, 1.0, 0.53],
  [0.37, 0.94, 1.0],
];
const FACE_LON = 20; // degrees east: Africa faces the camera

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// CSS-style cubic-bezier, solved for y at x by Newton steps.
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (sx(t) - x) / d;
    }
    t = clamp01(t);
    return ((ay * t + by) * t + cy) * t;
  };
}
const EASE = bezier(0.65, 0, 0.35, 1);

// Damped spring from 0 to 1: overshoots a touch and settles. Heavier blocks
// get a lower frequency, so they swing in slower.
const spring = (u: number, freq: number) => {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const k = 1 - Math.exp(-5.5 * u) * Math.cos(freq * u);
  return k + (1 - k) * Math.pow(u, 6);
};

// d3's geoNaturalEarth1 raw projection, with the map's fitted transform.
function naturalEarth(lonDeg: number, latDeg: number): [number, number] {
  const l = (lonDeg * Math.PI) / 180;
  const p = (latDeg * Math.PI) / 180;
  const p2 = p * p, p4 = p2 * p2;
  const x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return [MAP_PROJECTION.tx + MAP_PROJECTION.scale * x, MAP_PROJECTION.ty - MAP_PROJECTION.scale * y];
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where the flat map sits on screen; must match MapStage's layout. */
export function mapRect(w: number, h: number) {
  const inset = w >= 640 ? 24 : 12;
  const fw = w - 2 * inset;
  const fh = h - 76 - inset;
  const mw = Math.min(fw * 0.92, (h - 150) * (WORLD_MAP.width / WORLD_MAP.height));
  const mh = mw * (WORLD_MAP.height / WORLD_MAP.width);
  return { left: inset + (fw - mw) / 2, top: 76 + (fh - mh) / 2, width: mw, height: mh };
}

function landBits() {
  const raw = atob(LAND_GRID.bits);
  return (row: number, col: number) => {
    const i = row * LAND_GRID.cols + col;
    return ((raw.charCodeAt(i >> 3) >> (i & 7)) & 1) === 1;
  };
}

type Block = {
  lat: number;
  lon: number;
  size: number;
  start: [number, number, number];
  spin: [number, number, number];
  arrive: number;
  dur: number;
  freq: number;
  flatDelay: number;
  offMap: boolean;
  color: number[];
  beam: number; // -1, or phase offset for beam colour cycling
};

function buildBlocks(): Block[] {
  const rand = mulberry32(11);
  const blocks: Block[] = [];
  const isLand = landBits();
  const { step, cols, rows, lat0 } = LAND_GRID;
  // The land grid stops at 60°S; carry the ocean on to 80°S so the globe has
  // no hole, and drop those rows off the flat map.
  const southRows = Math.round((80 - 60) / step);
  for (let r = 0; r < rows + southRows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r < rows && isLand(r, c)) continue;
      const lat = lat0 - (r + 0.5) * step;
      const lon = -180 + (c + 0.5) * step;
      // Mostly regular, some small, a few heavy ones.
      const roll = rand();
      const size = roll < 0.08 ? 1.6 + rand() * 0.6 : roll < 0.3 ? 0.55 + rand() * 0.25 : 0.85 + rand() * 0.2;
      const weight = size * size;
      // Thrown out by the blast: a random direction, far off and deep.
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      const dist = 1.4 + rand() * 2.4;
      const angDist = Math.abs((((lon - FACE_LON + 540) % 360) - 180)) / 180;
      const roll2 = rand();
      blocks.push({
        lat,
        lon,
        size,
        start: [Math.sin(ph) * Math.cos(th) * dist, Math.cos(ph) * dist * 0.8, Math.sin(ph) * Math.sin(th) * dist - 0.6],
        spin: [(rand() - 0.5) * 9, (rand() - 0.5) * 9, (rand() - 0.5) * 9],
        arrive: rand() * 0.55 + Math.min(weight, 4) * 0.08,
        dur: 0.9 + rand() * 0.45 + Math.min(weight, 4) * 0.1,
        freq: 9 - Math.min(weight, 4) * 1.1,
        // Unroll outwards from Africa.
        flatDelay: angDist * 0.35 + rand() * 0.08,
        offMap: r >= rows,
        color: roll2 < 0.1 ? ACCENT : INK,
        beam: roll2 > 0.94 ? rand() * BEAM.length : -1,
      });
    }
  }
  return blocks;
}

interface Props {
  play: boolean;
  speed: number;
  /** Fired once the blocks lie flat on the map. */
  onFlat?: () => void;
}

export default function GlobeStage({ play, speed, onFlat }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const three = useRef<Promise<typeof import("three")> | null>(null);

  // Start loading three.js as soon as the intro mounts, so it is ready by the blast.
  useEffect(() => {
    three.current ??= import("three");
  }, []);

  useEffect(() => {
    if (!play) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    let disposed = false;
    let cleanup = () => {};

    (three.current ?? import("three")).then(async (THREE) => {
      if (disposed) return;
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        onFlat?.();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;

      // One world unit is one CSS pixel on the z = 0 plane.
      const fov = 30;
      const camera = new THREE.PerspectiveCamera(fov, w / h, 1, 20000);
      camera.position.z = h / 2 / Math.tan((fov * Math.PI) / 360);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));

      const blocks = buildBlocks();
      const R = Math.min(h * 0.3, w * 0.4);
      const cell = (2 * Math.PI * R * LAND_GRID.step) / 360;
      const rect = mapRect(w, h);
      const mapScale = rect.width / WORLD_MAP.width;
      const flatCell = (rect.width / 360) * LAND_GRID.step * 0.92;

      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.35, envMapIntensity: 0.7 });
      const mesh = new THREE.InstancedMesh(geo, mat, blocks.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);

      const col = new THREE.Color();
      const m = new THREE.Matrix4();
      const pos = new THREE.Vector3();
      const sph = new THREE.Vector3();
      const flat = new THREE.Vector3();
      const qSph = new THREE.Quaternion();
      const qFlat = new THREE.Quaternion();
      const qSpin = new THREE.Quaternion();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const scl = new THREE.Vector3();
      const zAxis = new THREE.Vector3(0, 0, 1);
      const faceRad = (FACE_LON * Math.PI) / 180;

      blocks.forEach((b, i) => {
        col.setRGB(b.color[0], b.color[1], b.color[2]);
        mesh.setColorAt(i, col);
      });

      const t0 = performance.now();
      let flatDone = false;

      const frame = (now: number) => {
        // rAF timestamps can trail performance.now() slightly on the first frame.
        const t = Math.max(0, ((now - t0) / 1000) * speed);
        // Globe spin: a lazy turn during assembly that eases to face Africa.
        const turnU = clamp01(t / (G.assemble + G.turn));
        const rotY = -faceRad + (1 - EASE(turnU)) * 1.4;
        const flatU = (t - G.assemble - G.turn) / G.flatten;

        key.position.set(Math.cos(t * 0.8) * 900, 600, 700 + Math.sin(t * 0.8) * 300);

        blocks.forEach((b, i) => {
          const la = (b.lat * Math.PI) / 180;
          const lo = (b.lon * Math.PI) / 180 + rotY;
          const tilt = 0.2;
          const x0 = Math.cos(la) * Math.sin(lo);
          const y0 = Math.sin(la);
          const z0 = Math.cos(la) * Math.cos(lo);
          sph.set(x0, y0 * Math.cos(tilt) - z0 * Math.sin(tilt), y0 * Math.sin(tilt) + z0 * Math.cos(tilt));
          qSph.setFromUnitVectors(zAxis, sph);
          sph.multiplyScalar(R);

          // Assembly: from the blast, a damped spring onto the sphere.
          const u = clamp01((t - b.arrive) / b.dur);
          const k = spring(u, b.freq);
          pos.set(b.start[0] * w, b.start[1] * h, b.start[2] * w).lerp(sph, k);
          e.set(b.spin[0] * (1 - k), b.spin[1] * (1 - k), b.spin[2] * (1 - k));
          qSpin.setFromEuler(e);
          q.copy(qSph).multiply(qSpin);
          const sz = b.size * cell * Math.max(Math.cos(la), 0.35);
          scl.set(sz, sz, sz * 0.7);

          // Flatten: each block slides to its spot on the map and lies flat.
          if (flatU > 0) {
            const f = EASE(clamp01((flatU - b.flatDelay) / (1 - 0.43)));
            const [mx, my] = naturalEarth(b.lon, b.lat);
            flat.set(rect.left + mx * mapScale - w / 2, h / 2 - (rect.top + my * mapScale), 0);
            pos.lerp(flat, f);
            qFlat.identity();
            q.slerp(qFlat, f);
            const fs = flatCell * Math.min(b.size, 1.1);
            scl.lerp(flat.set(fs, fs, fs * 0.12), f);
            if (b.offMap) scl.multiplyScalar(1 - f);
          }

          m.compose(pos, q, scl);
          mesh.setMatrixAt(i, m);

          if (b.beam >= 0) {
            const c = BEAM[Math.floor(b.beam + t * 5) % BEAM.length];
            col.setRGB(c[0] * 3, c[1] * 3, c[2] * 3);
            mesh.setColorAt(i, col);
          }
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        renderer.render(scene, camera);

        if (!flatDone && flatU >= 1) {
          flatDone = true;
          onFlat?.();
        }
        if (flatU < 1.6) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        geo.dispose();
        mat.dispose();
        pmrem.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [play, speed, onFlat]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
