"use client";

import { useEffect, useRef } from "react";
import { WORLD_MAP } from "./worldMap";
import { HEAT_SOURCES } from "./heatSources";
import { naturalEarth } from "./projection";

// A live heat map over the outline map. The heat is a sum of soft sources,
// pushed around by drifting noise that picks up in random gusts (wind) on a
// smooth curve. Treated as a height field, it is lit from a slowly moving
// light and rippled by travelling swells, so the surface reads as 3D and
// never stops moving. Painted on land only, Phantom-style blue → red with grain.

const MAX = 16;

const VERT = `
attribute vec2 a_pos;
varying vec2 vUv;
void main() { vUv = a_pos * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D u_land;
uniform vec2 u_res;
uniform float u_time;
uniform float u_wind;   // accumulated wind travel
uniform float u_gust;   // current gust strength 0..1
uniform float u_reveal; // 0..1 bloom-in
uniform vec4 u_src[${MAX}]; // x, y (0..1 of map), weight, radius (0..1 of width)
uniform int u_count;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

vec3 thermal(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c0 = vec3(0.12, 0.25, 1.0), c1 = vec3(0.1, 0.75, 1.0), c2 = vec3(0.3, 0.9, 0.35);
  vec3 c3 = vec3(1.0, 0.92, 0.15), c4 = vec3(1.0, 0.55, 0.1), c5 = vec3(0.95, 0.15, 0.15);
  float s = t * 5.0;
  if (s < 1.0) return mix(c0, c1, s);
  if (s < 2.0) return mix(c1, c2, s - 1.0);
  if (s < 3.0) return mix(c2, c3, s - 2.0);
  if (s < 4.0) return mix(c3, c4, s - 3.0);
  return mix(c4, c5, s - 4.0);
}

// Heat at map position p (x 0..1 across, y 0..1 down; aspect-corrected inside).
float heat(vec2 p) {
  vec2 q = vec2(p.x, p.y * ${(WORLD_MAP.height / WORLD_MAP.width).toFixed(4)});
  // Wind: the field is advected through drifting, domain-warped noise.
  vec2 w = vec2(fbm(q * 6.0 + vec2(u_wind, 0.3 * u_wind)), fbm(q * 6.0 + vec2(5.2 - 0.6 * u_wind, 1.3 + u_wind)));
  vec2 qw = q + (w - 0.5) * (0.035 + 0.03 * u_gust);
  float h = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= u_count) break;
    vec4 s = u_src[i];
    vec2 d = qw - vec2(s.x, s.y * ${(WORLD_MAP.height / WORLD_MAP.width).toFixed(4)});
    h += s.z * exp(-dot(d, d) / (s.w * s.w));
  }
  // Wisps the wind tears off the hot spots.
  h *= 0.8 + 0.45 * fbm(qw * 14.0 + vec2(u_wind * 1.7, -u_wind));
  // Travelling swells: two slow waves crossing the field.
  h *= 1.0 + 0.1 * sin(q.x * 38.0 - u_time * 1.3 + q.y * 9.0) + 0.07 * sin(q.y * 52.0 + u_time * 0.9 - q.x * 13.0);
  return h;
}

void main() {
  float land = texture2D(u_land, vUv).a;
  if (land < 0.01) { gl_FragColor = vec4(0.0); return; }
  float h0 = heat(vUv);
  float h = h0 * u_reveal;
  // 3D relief: normal from the height field, lit from a light that circles.
  // With derivatives the slope comes free from neighbouring pixels; without,
  // it costs four more evaluations of the heat field.
#ifdef DERIV
  float hx = dFdx(h0) * 3.0;
  float hy = -dFdy(h0) * 3.0;
#else
  vec2 e = vec2(1.5 / max(u_res.x, 1.0), 0.0);
  float hx = heat(vUv + e.xy) - heat(vUv - e.xy);
  float hy = heat(vUv + e.yx) - heat(vUv - e.yx);
#endif
  vec3 n = normalize(vec3(-hx * 9.0, -hy * 9.0, 1.0));
  vec3 l = normalize(vec3(cos(u_time * 0.35), sin(u_time * 0.35), 1.4));
  float shade = 0.82 + 0.3 * dot(n, l);
  // Grain, like a printed thermal plate.
  float g = (hash(gl_FragCoord.xy + fract(u_time) * 91.0) - 0.5) * 0.09;
  float t = clamp(h + g, 0.0, 1.2);
  vec3 col = thermal(smoothstep(0.08, 1.0, t)) * shade;
  float a = smoothstep(0.06, 0.24, t) * land * 0.92;
  gl_FragColor = vec4(col * a, a);
}
`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Smooth, slow-in slow-out gust envelope.
const gustCurve = (u: number) =>
  u <= 0 || u >= 1 ? 0 : Math.pow(Math.sin(Math.PI * u), 2);

export default function HeatLayer({ delay = 0 }: { delay?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", {
      premultipliedAlpha: true,
      alpha: true,
    });
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const deriv = gl.getExtension("OES_standard_derivatives");
    // Compile in parallel where the browser can (KHR_parallel_shader_compile):
    // the program is polled each frame instead of blocking the main thread at
    // the hand-over, where the rest of the landing is starting up.
    const parallel = gl.getExtension("KHR_parallel_shader_compile");
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(
      prog,
      compile(
        gl.FRAGMENT_SHADER,
        (deriv
          ? "#extension GL_OES_standard_derivatives : enable\n#define DERIV\n"
          : "") + FRAG,
      ),
    );
    gl.linkProgram(prog);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    let linked = false;
    const setup = () => {
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const aPos = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const src = new Float32Array(MAX * 4);
      HEAT_SOURCES.slice(0, MAX).forEach((s, i) => {
        const [x, y] = naturalEarth(s.lon, s.lat);
        src.set(
          [
            x / WORLD_MAP.width,
            y / WORLD_MAP.height,
            s.weight,
            (s.radius / 360) * 0.9,
          ],
          i * 4,
        );
      });
      gl.uniform4fv(u("u_src"), src);
      gl.uniform1i(u("u_count"), Math.min(MAX, HEAT_SOURCES.length));
      return true;
    };

    // Land mask from the land-fill SVG, rasterised by the browser.
    const tex = gl.createTexture();
    let ready = false;
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
    };
    img.src = "/maps/world-land.svg";

    // Backing store follows the canvas's on-screen size, transforms included,
    // so the heat is redrawn at the zoomed resolution instead of stretched.
    // Full resolution: at half, the edges, grain and relief turn visibly
    // pixelated on a 1x screen. (Derivative normals and 30 fps keep it cheap.)
    const RES = 1;
    const MAX_W = 2048;
    let lastW = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const k = Math.min(1, MAX_W / Math.max(1, r.width * dpr * RES)) * RES;
      const w = Math.max(1, Math.round(r.width * dpr * k));
      const h = Math.max(1, Math.round(r.height * dpr * k));
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      lastW = r.width;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const t0 = performance.now();
    let last = t0;
    let wind = 0;
    // Gusts at random times: each has a start, a length and a strength.
    let gustAt = 1.5 + Math.random() * 2;
    let gustLen = 2.5;
    let gustAmp = 1;
    let raf = 0;
    let drawnAt = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!linked) {
        if (
          parallel &&
          !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)
        )
          return;
        if (!setup()) {
          cancelAnimationFrame(raf);
          return;
        }
        linked = true;
      }
      // 30 fps: the field drifts slowly, and each frame is a full-map shader.
      if (now - drawnAt < 32) return;
      drawnAt = now;
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (t > gustAt + gustLen) {
        gustAt = t + 2 + Math.random() * 4;
        gustLen = 1.8 + Math.random() * 2.2;
        gustAmp = 0.5 + Math.random() * 0.5;
      }
      const gust = gustAmp * gustCurve((t - gustAt) / gustLen);
      wind += dt * (0.06 + 0.5 * gust);
      // Zoom is a CSS transform, which ResizeObserver doesn't see; check here.
      const sw = canvas.getBoundingClientRect().width;
      if (Math.abs(sw - lastW) > lastW * 0.04) resize();
      if (ready) {
        // Every frame: the size can be settled before the first resize check
        // runs, and a zero resolution turns the lighting maths into NaN (black).
        gl.uniform2f(u("u_res"), canvas.width, canvas.height);
        gl.uniform1f(u("u_time"), reduce ? 0 : t);
        gl.uniform1f(u("u_wind"), reduce ? 0 : wind);
        gl.uniform1f(u("u_gust"), gust);
        const rv = clamp01((t - delay) / 1.4);
        gl.uniform1f(u("u_reveal"), reduce ? 1 : 1 - Math.pow(1 - rv, 3));
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [delay]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
