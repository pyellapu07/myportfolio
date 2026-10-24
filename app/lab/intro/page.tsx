"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import HyperspaceIntro from "@/components/intro/HyperspaceIntro";
import { installLabClock } from "@/components/intro/labClock";

const SPEEDS = [1, 0.25];
const STEP_MS = 1000 / 30;

// One clock for the page's lifetime, installed during the first client render
// so it is in place before the intro's effects start their loops.
let clock: ReturnType<typeof installLabClock> | null = null;
const getClock = () => (typeof window === "undefined" ? null : (clock ??= installLabClock()));

function Lab() {
  // ?speed=0.05 slows the first run, for frame-by-frame review and recording.
  const initial = Number(useSearchParams().get("speed")) || 1;
  const [run, setRun] = useState(0);
  const [speed, setSpeed] = useState(initial);
  const [paused, setPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [lab] = useState(getClock);

  const replay = (next: number) => {
    lab?.play();
    setPaused(false);
    setSpeed(next);
    setRun((n) => n + 1);
  };
  const toggle = () => {
    if (!lab) return;
    if (lab.paused()) lab.play();
    else lab.pause();
    setPaused(lab.paused());
  };

  // Space pauses or plays; arrow right steps one frame while paused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight" && lab?.paused()) {
        lab.step(STEP_MS);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Intro-relative time readout, in timeline seconds.
  useEffect(() => {
    const start = lab?.now() ?? 0;
    const id = setInterval(() => setTime((((lab?.now() ?? 0) - start) / 1000) * speed), 50);
    return () => clearInterval(id);
  }, [run, speed, lab]);

  const btn = "rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs backdrop-blur hover:bg-black hover:text-white";

  return (
    <main>
      <HyperspaceIntro key={run} speed={speed} />
      <div className="fixed bottom-5 left-5 z-10 flex items-center gap-2 sm:bottom-7 sm:left-8">
        <button type="button" onClick={toggle} className={`${btn} w-16`} aria-label={paused ? "Play" : "Pause"}>
          {paused ? "▶ Play" : "❚❚ Pause"}
        </button>
        {paused && (
          <button type="button" onClick={() => lab?.step(STEP_MS)} className={btn} aria-label="Step one frame">
            +1 frame
          </button>
        )}
        {SPEEDS.map((sp) => (
          <button key={sp} type="button" onClick={() => replay(sp)} className={btn}>
            Replay {sp}×
          </button>
        ))}
        <span className="ml-1 rounded-full bg-white/80 px-2 py-1 text-[11px] tabular-nums text-black/60 backdrop-blur">
          {time.toFixed(2)}s
        </span>
      </div>
    </main>
  );
}

export default function IntroLab() {
  return (
    <Suspense>
      <Lab />
    </Suspense>
  );
}
