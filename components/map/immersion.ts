// Shared camera state for the Spatial view's immersive mode. Landing drives
// it from wheel and drag; MapCards ticks it once per frame and renders from
// it; listeners (Landing's map backdrop) are told each tick.

export type Mode = "map" | "entering" | "immersed" | "leaving";

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(d) < 1e-6) break;
      t -= (((ax * t + bx) * t + cx) * t - x) / d;
    }
    t = Math.min(1, Math.max(0, t));
    return ((ay * t + by) * t + cy) * t;
  };
}

// The fly-in and fly-out: slow, a hard rush, then a long settle.
const FLY = bezier(0.76, 0, 0.24, 1);
const ENTER_MS = 1100;
const LEAVE_MS = 900;

const state = {
  mode: "map" as Mode,
  /** 0 flat map .. 1 fully immersed. */
  k: 0,
  kFrom: 0,
  kTo: 0,
  kStart: 0,
  kDur: 1,
  /** How far the camera has flown forward through the cards, 0..1. */
  flight: 0,
  flightTarget: 0,
  /** Camera pan (px) and look (rad), with targets for inertia. */
  camX: 0,
  camY: 0,
  camTX: 0,
  camTY: 0,
};

const modeListeners = new Set<(m: Mode) => void>();
const tickListeners = new Set<(s: Readonly<typeof state>) => void>();

function setMode(m: Mode) {
  if (state.mode === m) return;
  state.mode = m;
  modeListeners.forEach((f) => f(m));
}

function animateK(to: number, ms: number, done: Mode) {
  state.kFrom = state.k;
  state.kTo = to;
  state.kStart = performance.now();
  state.kDur = ms;
  pendingMode = done;
}
let pendingMode: Mode | null = null;

export const immersion = {
  get: () => state as Readonly<typeof state>,
  enter() {
    if (state.mode !== "map") return;
    state.flight = state.flightTarget = 0;
    state.camX = state.camY = state.camTX = state.camTY = 0;
    setMode("entering");
    animateK(1, ENTER_MS, "immersed");
  },
  leave() {
    if (state.mode !== "immersed" && state.mode !== "entering") return;
    setMode("leaving");
    state.flightTarget = 0;
    animateK(0, LEAVE_MS, "map");
  },
  /** Wheel while immersed: fly forward/back. */
  fly(delta: number) {
    state.flightTarget = Math.min(1, Math.max(0, state.flightTarget + delta));
  },
  /** Drag while immersed: pan the camera. */
  pan(dx: number, dy: number) {
    state.camTX = Math.max(-900, Math.min(900, state.camTX + dx));
    state.camTY = Math.max(-600, Math.min(600, state.camTY + dy));
  },
  /** Advance easing and inertia; call once per frame. */
  tick(now: number) {
    if (pendingMode) {
      const u = Math.min(1, (now - state.kStart) / state.kDur);
      state.k = state.kFrom + (state.kTo - state.kFrom) * FLY(u);
      if (u >= 1) {
        const m = pendingMode;
        pendingMode = null;
        setMode(m);
      }
    }
    state.flight += (state.flightTarget - state.flight) * 0.075;
    state.camX += (state.camTX - state.camX) * 0.09;
    state.camY += (state.camTY - state.camY) * 0.09;
    if (state.mode === "leaving") {
      state.camTX *= 0.9;
      state.camTY *= 0.9;
    }
    tickListeners.forEach((f) => f(state));
  },
  onMode(f: (m: Mode) => void) {
    modeListeners.add(f);
    return () => void modeListeners.delete(f);
  },
  onTick(f: (s: Readonly<typeof state>) => void) {
    tickListeners.add(f);
    return () => void tickListeners.delete(f);
  },
};
