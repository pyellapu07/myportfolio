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

// Where the flat map sits on screen. The stage spans from under the header
// (MAP_TOP) to MAP_RESERVE above the bottom edge, leaving that band to the
// statement and the chat input; the map is centred in it at up to MAP_FILL of
// its width. MapStage lays it out in CSS and mapRect computes the same box
// in px (the globe flattens onto it), so both read these.
export const MAP_TOP = 76;
export const MAP_RESERVE = 200;
export const MAP_FILL = 0.88;
const MAP_PAD = 24; // breathing room above and below the map inside the stage

export function mapRect(w: number, h: number) {
  const inset = w >= 640 ? 24 : 12;
  const fw = w - 2 * inset;
  const fh = h - MAP_TOP - MAP_RESERVE;
  const mw = Math.max(0, Math.min(fw * MAP_FILL, (fh - MAP_PAD) * (WORLD_MAP.width / WORLD_MAP.height)));
  const mh = mw * (WORLD_MAP.height / WORLD_MAP.width);
  return { left: inset + (fw - mw) / 2, top: MAP_TOP + (fh - mh) / 2, width: mw, height: mh };
}

/** The same width as CSS, for the stage's map box. */
export const MAP_BOX_WIDTH = `min(${MAP_FILL * 100}%, calc((100dvh - ${MAP_TOP + MAP_RESERVE + MAP_PAD}px) * ${WORLD_MAP.width} / ${WORLD_MAP.height}))`;
