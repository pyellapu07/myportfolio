// Dev-only pausable clock for the intro lab. It swaps performance.now and
// requestAnimationFrame for virtual versions that stop advancing while paused,
// which freezes the intro's own rAF loops, the globe, and framer-motion's
// JS-driven animations together. Browser-run animations (WAAPI, CSS) are
// paused alongside. Never install this outside /lab.

type Clock = {
  pause: () => void;
  play: () => void;
  /** Advance a paused clock by `ms` of virtual time. */
  step: (ms: number) => void;
  paused: () => boolean;
  now: () => number;
  uninstall: () => void;
};

export function installLabClock(): Clock {
  const realNow = performance.now.bind(performance);
  const realRaf = window.requestAnimationFrame.bind(window);
  let offset = 0; // virtual = real - offset
  let pausedAt: number | null = null;

  const now = () => (pausedAt ?? realNow()) - offset;
  const browserAnims = () => document.getAnimations();

  performance.now = now;
  window.requestAnimationFrame = (cb: FrameRequestCallback) =>
    realRaf(() => {
      // Animations started while paused would run on the compositor clock.
      if (pausedAt !== null) for (const a of browserAnims()) if (a.playState === "running") a.pause();
      cb(now());
    });

  return {
    now,
    paused: () => pausedAt !== null,
    pause() {
      if (pausedAt !== null) return;
      pausedAt = realNow();
      for (const a of browserAnims()) a.pause();
    },
    play() {
      if (pausedAt === null) return;
      offset += realNow() - pausedAt;
      pausedAt = null;
      for (const a of browserAnims()) if (a.playState === "paused") a.play();
    },
    step(ms) {
      if (pausedAt === null) return;
      offset -= ms;
      for (const a of browserAnims()) if (a.currentTime !== null) a.currentTime = Number(a.currentTime) + ms;
    },
    uninstall() {
      performance.now = realNow;
      window.requestAnimationFrame = realRaf;
      for (const a of browserAnims()) if (a.playState === "paused") a.play();
    },
  };
}
