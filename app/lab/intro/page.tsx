"use client";

import { useState } from "react";
import HyperspaceIntro from "@/components/intro/HyperspaceIntro";

const SPEEDS = [1, 0.25];

export default function IntroLab() {
  const [run, setRun] = useState(0);
  const [speed, setSpeed] = useState(1);

  const replay = (next: number) => {
    setSpeed(next);
    setRun((n) => n + 1);
  };

  return (
    <main>
      <HyperspaceIntro key={run} speed={speed} />
      <div className="fixed bottom-5 left-5 z-10 flex gap-2 sm:bottom-7 sm:left-8">
        {SPEEDS.map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => replay(sp)}
            className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs backdrop-blur hover:bg-black hover:text-white"
          >
            Replay {sp}×
          </button>
        ))}
      </div>
    </main>
  );
}
