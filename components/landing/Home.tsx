"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import HyperspaceIntro from "@/components/intro/HyperspaceIntro";
import Landing, { type View } from "@/components/landing/Landing";
import EvidenceSection from "@/components/landing/EvidenceSection";
import { RecruiterProvider } from "@/lib/recruiter-context";
import Timeline from "@/components/Timeline";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const SEEN = "intro-seen";

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

function seenThisSession() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
}

/**
 * The homepage: intro, then the spatial landing and the sections under it.
 * The intro plays once a session; coming back (from a case study, say) lands
 * straight on the docked page. `review` always plays it, at `speed`.
 */
export default function Home({ speed = 1, review = false }: { speed?: number; review?: boolean }) {
  const [skip] = useState(() => !review && seenThisSession());
  // Case studies link back to /#work: open on the Index view, the work list.
  // (Read after hydration, so server and client first render agree.)
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
  const [picked, setPicked] = useState<View | null>(null);
  const view: View = picked ?? (hash === "#work" ? "index" : "spatial");
  const [shown, setShown] = useState(false);
  const [ready, setReady] = useState(false);
  const statementRef = useRef<HTMLDivElement>(null);
  const dockTo = useCallback(() => statementRef.current?.getBoundingClientRect() ?? null, []);
  const onDock = useCallback(() => setShown(true), []);
  const onDone = useCallback(() => {
    setReady(true);
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {}
  }, []);

  // No scrolling until the intro has handed over.
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    if (!ready) window.scrollTo(0, 0);
  }, [ready]);

  const changeView = (v: View) => {
    window.scrollTo({ top: 0 });
    setPicked(v);
  };

  return (
    <main id="main">
      <HyperspaceIntro speed={speed} dockTo={dockTo} dockAlign="center" onDock={onDock} onDone={onDone} hideHeadline={ready} instant={skip} />
      <Landing view={view} onView={changeView} shown={shown} ready={ready} statementRef={statementRef}>
        <RecruiterProvider>
          {/* The old 40% / 167% band is gone: the evidence cards carry the numbers. */}
          <EvidenceSection />
          <Timeline />
          <Testimonials />
          <Contact />
          <Footer />
        </RecruiterProvider>
      </Landing>
    </main>
  );
}
