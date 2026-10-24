"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LAND_GRID } from "@/components/map/landGrid";
import { naturalEarth } from "@/components/map/projection";
import { WORLD_MAP } from "@/components/map/worldMap";

// After the blast, ocean blocks of uneven size and weight fly in from where
// the explosion threw them, settle onto a sphere (land left hollow), the globe
// turns to face Africa, then every block unrolls onto its spot on the flat map.

// Seconds at speed 1, from the moment `play` turns on.
const G = {
  assemble: 1.9, // last block has landed
  turn: 0.45, // settle facing Africa
  flatten: 1.3,
  dissolve: 0.6, // one big zap from the centre melts the blocks as the line map draws in
};
export const GLOBE_DURATION = G.assemble + G.turn + G.flatten + G.dissolve;
export const GLOBE_DISSOLVE = G.dissolve;
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
// Depth of field: blocks more than DOF_MID / DOF_NEAR px ahead of their spot
// on the globe are drawn into the mid / near focus layer, blurred by these
// radii (px) for the sharp, mid and near layers.
const DOF_MID = 40;
const DOF_NEAR = 150;
const DOF_RADII = [0, 3.5, 9];

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
// Vacuum: slow, then fast, then extra fast, as if sucked into place.
const VACUUM = bezier(0.7, 0, 0.84, 0);
const SETTLE = bezier(0.2, 0.6, 0.35, 1);
// Vacuum for most of the trip, then a short soft settle instead of a dead stop.
const vacuumSettle = (u: number) => (u < 0.86 ? VACUUM(u / 0.86) * 0.965 : 0.965 + 0.035 * SETTLE((u - 0.86) / 0.14));
// Extra revolutions (radians) a block makes round the globe's axis on its
// way in, so everything enters spinning like a vortex.
const SWIRL = 5.5;
// Share of blocks already creeping in at the screen edges at the first frame;
// the rest are still beyond it. Nothing starts on the globe itself.
const AT_EDGE = 0.12;
// Width of the dissolve wave's soft front, in px.
const WAVE_FEATHER = 220;

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

/** Distance from the flat map's centre to its corner, in px. */
export function waveMaxR(w: number, h: number) {
  const r = mapRect(w, h);
  return Math.hypot(r.width, r.height) / 2;
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
  /** Start offset from the sphere spot, as fractions of the viewport (x, y) and px (z). */
  push: [number, number, number];
  spin: [number, number, number];
  delay: number;
  dur: number;
  /** How far into its arrival curve the block already is at the first frame. */
  pre: number;
  /** Flies the whole vortex from the screen edge; others appear partway in. */
  tracer: boolean;
  flatDelay: number;
  offMap: boolean;
  color: number[];
  beam: number; // -1, or phase offset for beam colour cycling
};

// Blocks are coarser than the land grid: each covers COARSE × COARSE cells
// and counts as ocean when most of them are.
const COARSE = 1;
export const BLOCK_STEP = LAND_GRID.step * COARSE;

function buildBlocks(): Block[] {
  const rand = mulberry32(11);
  const blocks: Block[] = [];
  const isLand = landBits();
  const { cols, rows, lat0 } = LAND_GRID;
  const cRows = Math.floor(rows / COARSE);
  const cCols = cols / COARSE;
  // The land grid stops at 60°S; carry the ocean on to 80°S so the globe has
  // no hole, and drop those rows off the flat map.
  const southRows = Math.round((80 - 60) / BLOCK_STEP);
  for (let r = 0; r < cRows + southRows; r++) {
    for (let c = 0; c < cCols; c++) {
      if (r < cRows) {
        let land = 0;
        for (let i = 0; i < COARSE; i++) for (let j = 0; j < COARSE; j++) if (isLand(r * COARSE + i, c * COARSE + j)) land++;
        if (land * 2 >= COARSE * COARSE) continue;
      }
      const lat = lat0 - (r + 0.5) * BLOCK_STEP;
      const lon = -180 + (c + 0.5) * BLOCK_STEP;
      const roll = rand();
      const size = roll < 0.05 ? 0.9 + rand() * 0.15 : 0.6 + rand() * 0.16;
      // Every block starts beyond the screen edge along a radial direction
      // (set once its screen position is known), some forward towards the
      // camera; a few are already creeping in at the edges.
      const pre = rand() < AT_EDGE ? 0.14 + rand() * 0.1 : 0;
      // Start times ramp up: only a trickle at first, then the rush.
      const delay = pre > 0 ? 0 : 0.95 * Math.pow(rand(), 0.55);
      // Later starters begin closer in, so the field empties from the screen
      // edges towards the globe as it completes.
      const late = delay / 0.95;
      const dist = (0.62 + rand() * 0.5) * (1 - 0.8 * late);
      const roll2 = rand();
      blocks.push({
        lat,
        lon,
        size,
        push: [dist, rand() * Math.PI * 2, rand() * 420 * (1 - 0.85 * late)],
        spin: [(rand() - 0.5) * 2.2, (rand() - 0.5) * 2.2, (rand() - 0.5) * 2.2],
        delay,
        // A short trip, so a block is only on screen while it is travelling.
        dur: 0.8 + rand() * 0.2,
        pre,
        tracer: pre > 0 || (late < 0.45 && rand() < 0.45),
        flatDelay: (Math.abs(((lon - FACE_LON + 540) % 360) - 180) / 180) * 0.35 + rand() * 0.08,
        offMap: r >= cRows,
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
  /** Each frame of the dissolve: the wave's radius from the map centre, in px. */
  onWave?: (r: number) => void;
}

type Stage = { draw: (t: number) => number; wave: () => number; dispose: () => void };

export default function GlobeStage({ play, speed, onFlat, onWave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const failedRef = useRef(false);
  const onFlatRef = useRef(onFlat);
  const onWaveRef = useRef(onWave);
  useEffect(() => {
    onFlatRef.current = onFlat;
    onWaveRef.current = onWave;
  }, [onFlat, onWave]);

  // Load three.js and build the whole scene when the intro mounts, compiling
  // the shaders up front, so the first globe frame costs nothing at the blast.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;

    Promise.all([
      import("three"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
    ]).then(
      ([THREE, { RoomEnvironment }]) => {
        if (disposed) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          // Transparent, so the line map beneath shows through as blocks melt away.
          renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        } catch {
          failedRef.current = true;
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        // No tone mapping: it would pull the white page background down to grey.
        renderer.toneMapping = THREE.NoToneMapping;

        // One world unit is one CSS pixel on the z = 0 plane.
        const fov = 30;
        const camera = new THREE.PerspectiveCamera(fov, w / h, 1, 20000);
        camera.position.z = h / 2 / Math.tan((fov * Math.PI) / 360);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        // Kept low so ink reads as ink; the env map supplies the moving gleam.
        const key = new THREE.DirectionalLight(0xffffff, 1.1);
        scene.add(key, new THREE.AmbientLight(0xffffff, 0.04));

        const blocks = buildBlocks();
        const R = Math.min(h * 0.3, w * 0.4);
        const cell = (2 * Math.PI * R * BLOCK_STEP) / 360;
        const rect = mapRect(w, h);
        const mapScale = rect.width / WORLD_MAP.width;
        const flatCell = (rect.width / 360) * BLOCK_STEP * 0.9;
        // Dissolve wave centre: the middle of the flat map, in world units.
        const ax = rect.left + rect.width / 2 - w / 2;
        const ay = h / 2 - (rect.top + rect.height / 2);
        const maxR = waveMaxR(w, h);
        let waveR = 0;

        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.4, envMapIntensity: 0.18 });
        // Three focus layers: settled blocks drawn sharp, blocks still in flight
        // ahead of the globe drawn into their own buffers and Gaussian-blurred.
        const layers = [0, 1, 2].map(() => {
          const lm = new THREE.InstancedMesh(geo, mat, blocks.length);
          lm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          lm.frustumCulled = false;
          scene.add(lm);
          return lm;
        });
        const col = new THREE.Color(1, 1, 1);
        layers.forEach((lm) => {
          for (let i = 0; i < blocks.length; i++) lm.setColorAt(i, col);
        });

        // Separable 13-tap Gaussian on premultiplied colour, so a blurred block
        // keeps its own colour and only its edge softens out.
        const dpr = renderer.getPixelRatio();
        const rtOpts = { type: THREE.HalfFloatType, depthBuffer: true };
        const rtA = new THREE.WebGLRenderTarget(w * dpr, h * dpr, rtOpts);
        const rtB = new THREE.WebGLRenderTarget(w * dpr, h * dpr, rtOpts);
        const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const quadGeo = new THREE.PlaneGeometry(2, 2);
        const vert = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
        const blurMat = new THREE.ShaderMaterial({
          uniforms: { tMap: { value: null }, uStep: { value: new THREE.Vector2() } },
          vertexShader: vert,
          fragmentShader: `
            uniform sampler2D tMap; uniform vec2 uStep; varying vec2 vUv;
            void main() {
              vec4 s = texture2D(tMap, vUv) * 0.19648255;
              s += (texture2D(tMap, vUv + uStep * 1.41176471) + texture2D(tMap, vUv - uStep * 1.41176471)) * 0.29690696;
              s += (texture2D(tMap, vUv + uStep * 3.29411765) + texture2D(tMap, vUv - uStep * 3.29411765)) * 0.09447040;
              s += (texture2D(tMap, vUv + uStep * 5.17647059) + texture2D(tMap, vUv - uStep * 5.17647059)) * 0.01038136;
              gl_FragColor = s;
            }`,
          depthTest: false,
          depthWrite: false,
        });
        const compMat = new THREE.ShaderMaterial({
          uniforms: { tMap: { value: null } },
          vertexShader: vert,
          fragmentShader: `
            uniform sampler2D tMap; varying vec2 vUv;
            void main() {
              vec4 c = texture2D(tMap, vUv);
              gl_FragColor = vec4(c.a > 0.0 ? c.rgb / c.a : vec3(0.0), 1.0);
              #include <colorspace_fragment>
              gl_FragColor = vec4(gl_FragColor.rgb * c.a, c.a);
            }`,
          transparent: true,
          blending: THREE.CustomBlending,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneMinusSrcAlphaFactor,
          depthTest: false,
          depthWrite: false,
        });
        const quad = new THREE.Mesh(quadGeo, blurMat);
        const quadScene = new THREE.Scene();
        quadScene.add(quad);
        const pass = (material: InstanceType<typeof THREE.ShaderMaterial>, target: typeof rtA | null) => {
          quad.material = material;
          renderer.setRenderTarget(target);
          renderer.render(quadScene, quadCam);
        };
        renderer.autoClear = false;

        const showOnly = (k: number) => layers.forEach((lm, j) => (lm.visible = j === k));
        const renderLayers = (radii: number[]) => {
          // Sharp layer straight to screen.
          renderer.setRenderTarget(null);
          renderer.setClearColor(0x000000, 0);
          renderer.clear();
          showOnly(0);
          renderer.render(scene, camera);
          for (const k of [1, 2]) {
            if (layers[k].count === 0) continue;
            renderer.setRenderTarget(rtA);
            renderer.setClearColor(0x000000, 0);
            renderer.clear();
            showOnly(k);
            renderer.render(scene, camera);
            const px = (radii[k] * dpr) / 5.2;
            for (let it = 0; it < 2; it++) {
              blurMat.uniforms.tMap.value = rtA.texture;
              blurMat.uniforms.uStep.value.set(px / (w * dpr), 0);
              pass(blurMat, rtB);
              blurMat.uniforms.tMap.value = rtB.texture;
              blurMat.uniforms.uStep.value.set(0, px / (h * dpr));
              pass(blurMat, rtA);
            }
            compMat.uniforms.tMap.value = rtA.texture;
            pass(compMat, null);
          }
        };

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

        /** Draws the stage at timeline time t (seconds); returns flatten progress. */
        const draw = (t: number) => {
          // Globe spin: a lazy turn during assembly that eases to face Africa.
          const turnU = clamp01(t / (G.assemble + G.turn));
          // Spinning from the first frame, slowing into the Africa view.
          const rotY = -faceRad + (1 - EASE(turnU)) * 2.6;
          const flatU = (t - G.assemble - G.turn) / G.flatten;

          const waveU = (flatU - 1) * (G.flatten / G.dissolve);
          waveR = waveU > 0 ? VACUUM(clamp01(waveU)) * (maxR + WAVE_FEATHER) : 0;
          key.position.set(Math.cos(t * 0.8) * 900, 600, 700 + Math.sin(t * 0.8) * 300);
          const counts = [0, 0, 0];

          blocks.forEach((b) => {
            const la = (b.lat * Math.PI) / 180;
            const lo = (b.lon * Math.PI) / 180 + rotY;
            const tilt = 0.2;
            const ct = Math.cos(tilt);
            const st = Math.sin(tilt);
            // Resting spot on the globe.
            const x0 = Math.cos(la) * Math.sin(lo);
            const y0 = Math.sin(la);
            const z0 = Math.cos(la) * Math.cos(lo);
            sph.set(x0, y0 * ct - z0 * st, y0 * st + z0 * ct);
            qSph.setFromUnitVectors(zAxis, sph);
            sph.multiplyScalar(R);

            // Assembly: a vortex round the globe's axis. Each block starts
            // flung wide past the screen edge, revolving, and is sucked in on
            // the vacuum curve; its orbit and its distance both collapse onto
            // its resting spot. Blocks swinging past the front of the vortex
            // are near the camera, so they read big and blurred, and shrink
            // as they are drawn in.
            const raw = b.pre + (t - b.delay) / b.dur;
            const u = clamp01(raw);
            const k = vacuumSettle(u);
            const away = 1 - k;
            const lv = lo + away * SWIRL * (0.8 + b.push[1] / Math.PI / 5);
            const flare = 1 + away * (b.push[0] * Math.max(w, h)) / R;
            const xv = Math.cos(la) * Math.sin(lv) * flare;
            const yv = Math.sin(la) * (1 + away * 0.6);
            const zv = Math.cos(la) * Math.cos(lv) * flare;
            pos.set(xv, yv * ct - zv * st, yv * st + zv * ct).multiplyScalar(R);
            pos.z = Math.min(pos.z + away * b.push[2], camera.position.z * 0.82);
            e.set(b.spin[0] * away, b.spin[1] * away, b.spin[2] * away);
            qSpin.setFromEuler(e);
            q.copy(qSph).multiply(qSpin);
            // Not set off yet: hidden, so nothing waits around in an outer cloud.
            // Only the tracers are visible all the way in; the rest grow out of
            // the swirl partway, so the outer field stays sparse.
            const show = b.tracer ? 1 : clamp01((k - 0.12) / 0.3);
            const sz = raw <= 0 ? 0 : b.size * cell * Math.max(Math.cos(la), 0.35) * show;
            scl.set(sz, sz, sz * 0.7);

            // Where the block rests: its spot on the globe, then on the map.
            let restZ = sph.z;

            // Flatten: each block slides to its spot on the map and lies flat.
            if (flatU > 0) {
              const f = vacuumSettle(clamp01((flatU - b.flatDelay) / (1 - 0.43)));
              const [mx, my] = naturalEarth(b.lon, b.lat);
              flat.set(rect.left + mx * mapScale - w / 2, h / 2 - (rect.top + my * mapScale), 0);
              pos.lerp(flat, f);
              restZ *= 1 - f;
              qFlat.identity();
              q.slerp(qFlat, f);
              const fs = flatCell * Math.min(b.size, 1.1);
              scl.lerp(flat.set(fs, fs, fs * 0.12), f);
              if (b.offMap) scl.multiplyScalar(1 - f);
            }

            // Dissolve: a soft wave spreads from Africa; blocks it passes
            // drift towards the camera into the blur layers and shrink away.
            let melt = 0;
            if (waveR > 0) {
              melt = clamp01((waveR - Math.hypot(pos.x - ax, pos.y - ay)) / WAVE_FEATHER);
              pos.z += melt * 220;
              scl.multiplyScalar(1 - melt);
            }

            // Focus sits on the globe's surface: how far a block still is
            // ahead of its resting spot picks its focus layer.
            const ahead = Math.max(0, pos.z - restZ);
            const layer = ahead > DOF_NEAR ? 2 : ahead > DOF_MID ? 1 : 0;
            m.compose(pos, q, scl);
            const lm = layers[layer];
            const n = counts[layer]++;
            lm.setMatrixAt(n, m);
            const c = b.beam >= 0 ? BEAM[Math.floor(b.beam + t * 5) % BEAM.length] : null;
            if (c) col.setRGB(c[0] * 3, c[1] * 3, c[2] * 3);
            else col.setRGB(b.color[0], b.color[1], b.color[2]);
            lm.setColorAt(n, col);
          });

          layers.forEach((lm, k) => {
            lm.count = counts[k];
            lm.instanceMatrix.needsUpdate = true;
            lm.instanceColor!.needsUpdate = true;
          });
          renderLayers(DOF_RADII);

          return flatU;
        };

        renderer.compile(scene, camera);
        stageRef.current = {
          draw,
          wave: () => waveR,
          dispose: () => {
            geo.dispose();
            mat.dispose();
            quadGeo.dispose();
            blurMat.dispose();
            compMat.dispose();
            rtA.dispose();
            rtB.dispose();
            pmrem.dispose();
            renderer.dispose();
          },
        };
      },
    );

    return () => {
      disposed = true;
      stageRef.current?.dispose();
      stageRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!play) return;
    // The clock starts when the globe is cued, even if three.js is still
    // loading, so a late load picks up mid-flight rather than starting over.
    const t0 = performance.now();
    let raf = 0;
    let flatDone = false;
    const frame = (now: number) => {
      if (failedRef.current) {
        onFlatRef.current?.();
        return;
      }
      // rAF timestamps can trail performance.now() slightly on the first frame.
      const t = Math.max(0, ((now - t0) / 1000) * speed);
      const flatU = stageRef.current?.draw(t) ?? -1;
      if (flatU >= 1) onWaveRef.current?.(stageRef.current?.wave() ?? 0);
      if (!flatDone && flatU >= 1) {
        flatDone = true;
        onFlatRef.current?.();
      }
      if (flatU < 1 + (G.dissolve + 0.2) / G.flatten) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [play, speed]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      {/* Lens haze round the frame edges while the blocks drift in */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(255,255,255,0.55) 100%)",
          maskImage: "radial-gradient(ellipse at center, transparent 42%, #000 92%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 42%, #000 92%)",
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: play ? 0 : 1 }}
        transition={{ delay: (G.assemble * 0.55) / speed, duration: (G.assemble * 0.5) / speed }}
      />
    </>
  );
}
