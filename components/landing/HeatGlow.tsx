"use client";

import { useEffect, useRef } from "react";

// A soft warm glow rising from the foot of the screen, behind the chat
// input. Pure decoration, unrelated to the map's heat data: its own warm
// palette, faint, as a few wide blobs that drift and
// swell at random through noise, with a little grain. Half resolution and
// 30 fps: it is a smooth field, so neither shows.

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= 0.5; }
  return v;
}

// Its own warm palette (not the map's): coral at the faint edges, through
// orange and peach, to a pale gold core where the glow is strongest.
vec3 warm(float t) {
  vec3 c0 = vec3(1.0, 0.42, 0.38), c1 = vec3(1.0, 0.55, 0.22), c2 = vec3(1.0, 0.74, 0.42), c3 = vec3(1.0, 0.93, 0.72);
  float s = clamp(t, 0.0, 1.0) * 3.0;
  if (s < 1.0) return mix(c0, c1, s);
  if (s < 2.0) return mix(c1, c2, s - 1.0);
  return mix(c2, c3, s - 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res; // y = 0 at the bottom edge
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float h = 0.0;
  // Five wide blobs sitting on the bottom edge across the width, each
  // wandering sideways and swelling on its own slow, noisy rhythm.
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float cx = (0.1 + 0.2 * fi + 0.09 * sin(u_t * (0.05 + 0.017 * fi) + fi * 1.7) + 0.12 * (noise(vec2(u_t * 0.06, fi * 4.3)) - 0.5)) * asp;
    float w = (0.32 + 0.12 * sin(u_t * 0.08 + fi * 2.3)) * asp * 0.32;
    float amp = 0.35 + 0.65 * noise(vec2(u_t * 0.09 + fi * 9.1, fi * 3.1));
    vec2 d = vec2((p.x - cx) / w, p.y / 0.55);
    h += amp * exp(-dot(d, d));
  }
  // Breaks the blobs up into drifting wisps.
  h *= 0.7 + 0.6 * fbm(p * 2.6 + vec2(u_t * 0.04, -u_t * 0.07));
  h *= 1.0 - smoothstep(0.0, 1.0, uv.y);
  float t = clamp(h * 0.85, 0.0, 1.0);
  // Lifted a little towards white so it stays light on the page.
  vec3 col = mix(warm(t), vec3(1.0), 0.15);
  float a = smoothstep(0.04, 0.85, h) * 0.34;
  a *= 0.88 + 0.24 * hash(gl_FragCoord.xy + fract(u_t) * 61.0);
  gl_FragColor = vec4(col * a, a);
}
`;

export default function HeatGlow({ shown }: { shown: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!canvas || !gl) return;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * 0.5));
      canvas.height = Math.max(1, Math.round(r.height * 0.5));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A random start, so the glow is never the same twice.
    const t0 = performance.now() - Math.random() * 600_000;
    let raf = 0;
    let last = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 33) return;
      last = now;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (reduce) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    // The wrapper fades it in once; the canvas follows the scroll (--glow,
    // set by Landing) so it is gone by the time the page content arrives.
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-[25] h-[38vh] transition-opacity duration-1000" style={{ opacity: shown ? 1 : 0 }}>
      <canvas ref={ref} className="h-full w-full" style={{ opacity: "var(--glow, 1)" }} />
    </div>
  );
}
