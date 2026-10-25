// Shared camera state for the Spatial view's immersive mode. Landing drives
// it from wheel and drag; MapCards ticks it once per frame and renders from
// it; listeners (Landing's map backdrop) are told each tick.

// "past": flown out of the far end into the page sections. The scene stays
// at its end frame (k 1, flight 1) so scrolling back up arrives in it.
export type Mode = "map" | "entering" | "immersed" | "leaving" | "past";

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
const ENTER_MS = 620;
const LEAVE_MS = 520;
// The cards sit on a globe: yaw spins it freely, pitch tips it within limits.
// Drag sensitivity (radians per px) and the spin carried on after release.
const MAX_PITCH = 0.6;
const ORBIT_PER_PX = 0.005;
const SPIN_DECAY = 0.93;

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
  /** Camera orbit round the scene centre (rad), with targets for inertia. */
  yaw: 0,
  pitch: 0,
  yawT: 0,
  pitchT: 0,
  /** Spin velocity (rad/frame) after a drag is let go. */
  vYaw: 0,
  vPitch: 0,
  orbitAt: 0,
  /** A project open in the detail view: input to the scene is paused. */
  detail: null as string | null,
  /** When the last mode change happened, for debouncing trackpad momentum. */
  changedAt: 0,
};

const modeListeners = new Set<(m: Mode) => void>();
const tickListeners = new Set<(s: Readonly<typeof state>) => void>();

function setMode(m: Mode) {
  if (state.mode === m) return;
  state.mode = m;
  state.changedAt = performance.now();
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
  /** Fly in; from the sections, arrive at the far end (atEnd) to fly back. */
  enter(atEnd = false) {
    if (state.mode !== "map") return;
    state.flight = state.flightTarget = atEnd ? 1 : 0;
    state.yaw = state.pitch = state.yawT = state.pitchT = state.vYaw = state.vPitch = 0;
    setMode("entering");
    animateK(1, ENTER_MS, "immersed");
  },
  /** Zoom back out to the flat map; toEnd instead parks the scene at its
   *  end frame while the page scrolls on into the sections. */
  leave(toEnd = false) {
    if (state.mode !== "immersed" && state.mode !== "entering" && state.mode !== "past") return;
    if (toEnd) {
      if (state.mode === "past") return;
      pendingMode = null;
      state.k = 1;
      state.flight = state.flightTarget = 1;
      setMode("past");
      return;
    }
    setMode("leaving");
    state.flightTarget = 0;
    animateK(0, LEAVE_MS, "map");
  },
  /** Back up from the sections: straight into the end frame, no fly-in. */
  resume() {
    if (state.mode !== "past") return;
    state.k = 1;
    state.flight = state.flightTarget = 1;
    setMode("immersed");
  },
  /** Wheel while immersed: fly forward/back. */
  fly(delta: number) {
    state.flightTarget = Math.min(1, Math.max(0, state.flightTarget + delta));
  },
  /** Drag while immersed: orbit the camera round the scene. */
  orbit(dx: number, dy: number) {
    state.vYaw = dx * ORBIT_PER_PX;
    state.vPitch = dy * ORBIT_PER_PX;
    state.yawT += state.vYaw;
    state.pitchT = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, state.pitchT + state.vPitch));
    state.orbitAt = performance.now();
  },
  setDetail(id: string | null) {
    state.detail = id;
  },
  /** Milliseconds since the last mode change. */
  sinceChange: () => performance.now() - state.changedAt,
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
    // Let go mid-drag: the globe keeps spinning and slows to a stop.
    if (now - state.orbitAt > 60 && (state.vYaw || state.vPitch)) {
      state.yawT += state.vYaw;
      state.pitchT = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, state.pitchT + state.vPitch));
      state.vYaw *= SPIN_DECAY;
      state.vPitch *= SPIN_DECAY;
      if (Math.abs(state.vYaw) + Math.abs(state.vPitch) < 1e-5) state.vYaw = state.vPitch = 0;
    }
    // Idle, the globe turns very slowly on its own, so it always reads as a
    // globe; any drag takes over at once.
    if (state.mode === "immersed" && !state.detail && !state.vYaw && now - state.orbitAt > 1500) state.yawT += 0.0007;
    state.flight += (state.flightTarget - state.flight) * 0.2;
    state.yaw += (state.yawT - state.yaw) * 0.1;
    state.pitch += (state.pitchT - state.pitch) * 0.1;
    if (state.mode === "leaving") {
      // Unwind to the nearest whole turn so the map lands the right way round.
      const home = Math.round(state.yawT / (2 * Math.PI)) * 2 * Math.PI;
      state.yawT = home + (state.yawT - home) * 0.88;
      state.pitchT *= 0.88;
      state.vYaw = state.vPitch = 0;
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
