// Projection metadata for /maps/world-110m.svg (Natural Earth 1, Natural Earth
// 110m countries without Antarctica, fit to a 1000×520 viewBox). Anchors are
// pre-projected so the page needs no projection library at runtime.
export const WORLD_MAP = {
  src: "/maps/world-110m.svg",
  width: 1000,
  height: 520,
  anchors: {
    nairobi: [601.9, 301],
    collegePark: [302.8, 171.7],
    fortWorth: [244.5, 191.7],
  },
} as const;
