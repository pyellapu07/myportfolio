"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import HyperspaceIntro from "@/components/intro/HyperspaceIntro";
import Landing, { type View } from "@/components/landing/Landing";
import { RecruiterProvider } from "@/lib/recruiter-context";
import ImpactMetrics from "@/components/ImpactMetrics";
import Timeline from "@/components/Timeline";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

function Lab() {
  // ?speed=0.05 slows the intro, for frame-by-frame review and recording.
  const speed = Number(useSearchParams().get("speed")) || 1;
  const [view, setView] = useState<View>("spatial");
  const [shown, setShown] = useState(false);
  const [ready, setReady] = useState(false);
  const statementRef = useRef<HTMLDivElement>(null);
  const dockTo = useCallback(() => statementRef.current?.getBoundingClientRect() ?? null, []);
  const onDock = useCallback(() => setShown(true), []);
  const onDone = useCallback(() => setReady(true), []);

  // No scrolling until the intro has handed over.
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    if (!ready) window.scrollTo(0, 0);
  }, [ready]);

  const changeView = (v: View) => {
    window.scrollTo({ top: 0 });
    setView(v);
  };

  return (
    <main>
      <HyperspaceIntro speed={speed} dockTo={dockTo} dockAlign="center" onDock={onDock} onDone={onDone} hideHeadline={ready} />
      <Landing view={view} onView={changeView} shown={shown} ready={ready} statementRef={statementRef}>
        <RecruiterProvider>
          <ImpactMetrics />
          <Timeline />
          <Testimonials />
          <div id="contact">
            <Contact />
          </div>
          <Footer />
        </RecruiterProvider>
      </Landing>

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
