"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Home from "@/components/landing/Home";

// Review copy of the homepage: the intro always plays, and ?speed=0.05 slows
// it for frame-by-frame review and recording.
function Lab() {
  const speed = Number(useSearchParams().get("speed")) || 1;
  return <Home speed={speed} review />;
}

export default function IntroLab() {
  return (
    <Suspense>
      <Lab />
    </Suspense>
  );
}
