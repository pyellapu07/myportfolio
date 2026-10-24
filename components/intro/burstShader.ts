// Hyperspace burst for the intro's dark phase. Deliberately uneven: the core
// is a lumpy, drifting blob that blows out past white, streaks vary in length
// and brightness, the halo's tint wanders, and the whole thing flickers.
// u_energy is the envelope (0 = idle dot grid, 1 = peak); u_glitch fades in
// neon line residue for the cells that linger after the clear; u_inv grows a
// black star out of the white core once the boom has peaked.

export const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const BURST_FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_energy;
uniform float u_glitch;
uniform float u_cell;
uniform float u_inv;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

// 2D value noise; sampled on the unit direction vector it varies smoothly all
// the way round the circle, with no seam at ±π.
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
             mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y);
}

float streaks(float a, float r, float density, float speed, float seed) {
  float band = pow(noise(a * density + seed), 3.5);
  float lane = hash(floor(a * density) + seed);
  float len = 0.35 + 0.65 * hash(floor(a * density) + seed * 3.1);
  float travel = fract(r * (0.8 + lane) - u_time * speed * (0.7 + lane) + lane);
  return band * smoothstep(0.0, 0.15, travel) * smoothstep(len, 0.0, travel);
}

vec3 hue(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

void main() {
  float t = u_time;
  // Flicker, and a centre that wanders a little.
  float e = u_energy * (0.96 + 0.04 * noise(t * 6.0));
  vec2 c = 0.035 * vec2(noise(t * 1.3) - 0.5, noise(t * 0.9 + 4.0) - 0.5) * 2.0;
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y - c;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  vec2 dir = uv / max(r, 1e-4);

  // Blob: a lumpy disc. Spikes are uneven by sector: a slow noise mask lets
  // some directions throw long sharp spikes while others stay smooth.
  float lump = 1.0 + 0.5 * (noise2(dir * 1.3 + t * 0.8) - 0.5) + 0.3 * (noise2(dir * 3.2 - t * 1.4 + 9.0) - 0.5);
  float sector = smoothstep(0.35, 0.75, noise2(dir * 1.8 + 4.0));
  float spikes = (1.2 * pow(noise(a * 13.0 + 3.0), 4.0) + 0.9 * pow(noise(a * 31.0 + 11.0), 5.0)) * sector;
  float rb = r / (lump * (1.0 + 0.9 * spikes * e));

  // Fully white core; edgeR is roughly where its clipped white ends.
  float sig = 0.004 + 0.045 * e;
  float core = exp(-rb * rb / sig);
  float edgeR = sqrt(sig * 1.6);

  // Fluorescent edge: a thin, saturated cyan band riding the white contour,
  // its width breathing a little, and a softer blue bloom just outside.
  float bandW = 0.012 + 0.012 * noise2(dir * 5.0 + t * 2.0);
  float band = exp(-pow((rb - edgeR) / bandW, 2.0));
  float bloom = exp(-max(rb - edgeR, 0.0) * 14.0);

  // Shafts only where the sector mask lets spikes through, dying fast.
  float rays = streaks(a, r, 16.0, 0.8, 1.0) * 1.3
             + streaks(a, r, 29.0, 1.2, 7.0)
             + streaks(a, r, 61.0, 1.8, 13.0) * 0.5;
  rays *= (0.3 + 0.7 * sector) * smoothstep(0.02, 0.25, rb) * exp(-r * 9.0) / (0.22 + r);

  float spin = t * 0.15;
  float star = pow(abs(cos(a * 2.0 + spin)), 90.0) * exp(-r * 14.0)
             + pow(abs(sin(a * 2.0 + spin)), 110.0) * exp(-r * 18.0);

  // Tint wanders between electric blue, cyan and a little violet.
  vec3 tint = mix(vec3(0.1, 0.35, 1.0), vec3(0.25, 0.75, 1.0), noise2(dir * 1.5 + 2.0));
  tint = mix(tint, vec3(0.55, 0.4, 1.0), 0.25 * noise2(dir * 2.9 + 11.0));

  vec3 col = vec3(1.0) * (core * e * 9.0 + star * e * 0.6);
  col += vec3(0.15, 0.85, 1.0) * band * e * 3.2;
  col += vec3(0.05, 0.3, 1.0) * bloom * e * 1.6;
  col += mix(tint, vec3(1.0), 0.4) * rays * e * 0.9;

  // Black-hole edge: nothing bright survives much past the blob.
  col *= exp(-pow(max(r - 0.38, 0.0) / 0.09, 2.0));

  // Filmic shoulder: the core clips to white unevenly instead of a hard disc.
  col = 1.0 - exp(-col * 1.8);

  // Black sonic: a dark, streaky star grows from the centre of the white core.
  if (u_inv > 0.0) {
    float ri = (0.04 + 0.18 * u_inv) * (0.7 + 0.6 * pow(noise(a * 16.0 + 5.0), 2.0));
    float fine = 0.55 + 0.45 * pow(noise(a * 70.0 + 2.0), 2.0);
    float dark = smoothstep(ri, ri * 0.25, r / fine) * smoothstep(0.0, 0.15, u_inv);
    vec3 inv = vec3(0.02, 0.02, 0.04) + vec3(0.6, 0.75, 1.0) * pow(noise(a * 110.0), 6.0) * 0.5;
    col = mix(col, inv, dark);
    // Thin chromatic rim round the dark star.
    float rim = exp(-abs(r / fine - ri) * 90.0) * smoothstep(0.0, 0.2, u_inv);
    col += vec3(0.9, 0.1, 0.3) * rim * 0.5 + vec3(0.1, 0.5, 1.0) * exp(-abs(r / fine - ri * 1.06) * 90.0) * 0.5 * smoothstep(0.0, 0.2, u_inv);
  }

  // Beyond the flower it is near-black: faint dark streaks drifting outwards.
  col += vec3(0.05, 0.07, 0.12) * streaks(a, r, 44.0, 0.35, 21.0) * smoothstep(0.2, 0.6, r);

  vec2 g = fract(gl_FragCoord.xy / 30.0) - 0.5;
  col += vec3(0.1) * smoothstep(0.09, 0.0, length(g)) * (1.0 - 0.7 * e);

  // Residue: stepped neon traces in roughly half the cells.
  if (u_glitch > 0.0) {
    vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
    vec2 cell = floor(px / u_cell);
    vec2 f = fract(px / u_cell);
    float pick = hash2(cell + 5.0);
    if (pick > 0.45) {
      float lanes = floor(f.y * (3.0 + floor(pick * 4.0)));
      float stepX = step(fract(f.x * 2.0 + hash2(cell + lanes)), 0.5);
      float line = smoothstep(0.06, 0.0, abs(fract(f.y * (3.0 + floor(pick * 4.0))) - 0.5 - 0.3 * stepX));
      float vbar = smoothstep(0.04, 0.0, abs(f.x - hash2(cell + 9.0)));
      vec3 neon = hue(hash2(cell + lanes * 1.7));
      col = mix(col, neon, clamp(line + vbar * 0.7, 0.0, 1.0) * u_glitch);
      col += hue(hash2(cell)) * 0.15 * u_glitch * (1.0 - f.y);
    }
  }

  // Film grain over everything.
  col += (hash2(gl_FragCoord.xy + fract(t * 7.3) * 100.0) - 0.5) * 0.07;

  gl_FragColor = vec4(col, 1.0);
}
`;
