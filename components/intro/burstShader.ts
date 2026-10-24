// Hyperspace burst for the intro's dark phase: a white-hot core with a blue
// halo, a four-point star, and noise-driven light streaks rushing outwards,
// over a faint dot grid. u_energy is the envelope (0 = idle grid, 1 = peak).

export const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const BURST_FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_energy;

float hash(float n) { return fract(sin(n) * 43758.5453); }

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

// Streaks for one layer: thin angular bands whose brightness travels outwards.
float streaks(float a, float r, float density, float speed, float seed) {
  float band = pow(noise(a * density + seed), 7.0);
  float lane = hash(floor(a * density) + seed);
  float travel = fract(r * 1.1 - u_time * speed + lane);
  return band * smoothstep(0.0, 0.2, travel) * (1.0 - travel);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float e = u_energy;

  float rays = streaks(a, r, 38.0, 0.9, 1.0)
             + streaks(a, r, 61.0, 1.3, 7.0)
             + streaks(a, r, 97.0, 1.8, 13.0) * 0.7;
  rays *= smoothstep(0.03, 0.3, r) / (0.25 + r);

  float core = exp(-r * r / (0.004 + 0.05 * e));
  float halo = exp(-r * 3.2) * e;
  float star = pow(abs(cos(a * 2.0)), 60.0) * exp(-r * 9.0)
             + pow(abs(sin(a * 2.0)), 60.0) * exp(-r * 14.0);

  vec3 blue = vec3(0.22, 0.5, 1.0);
  vec3 col = blue * halo * 0.85;
  col += mix(blue, vec3(1.0), 0.55) * rays * e * 1.3;
  col += vec3(1.0) * (core * e * 1.4 + star * e);

  // Chromatic fringe on the halo edge.
  col.r += exp(-abs(r - 0.32 * e) * 40.0) * 0.12 * e;
  col.b += exp(-abs(r - 0.36 * e) * 40.0) * 0.18 * e;

  vec2 g = fract(gl_FragCoord.xy / 30.0) - 0.5;
  col += vec3(0.11) * smoothstep(0.09, 0.0, length(g)) * (1.0 - 0.6 * e);

  gl_FragColor = vec4(col, 1.0);
}
`;
