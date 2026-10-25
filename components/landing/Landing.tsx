"use client";

import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { HEADLINE_CLASS, LINES } from "@/components/intro/HyperspaceIntro";
import AskBar from "./AskBar";
import { immersion, type Mode } from "@/components/map/immersion";
import { RecruiterProvider } from "@/lib/recruiter-context";
import Projects from "@/components/Projects";

export type View = "spatial" | "index";

const EASE = [0.65, 0, 0.35, 1] as const;
// Landing headline size and weight: the intro headline docks to exactly this
// box, easing its weight down to match on the way.
const STATEMENT_SIZE = "text-[clamp(1.9rem,3.6vw,3.4rem)]";
// Spatial hero: a touch smaller, since it sits centred above the chat input.
const HERO_SIZE = "text-[clamp(1.6rem,3vw,2.8rem)]";
export const STATEMENT_WEIGHT = 500;
// Page margins.
const GUTTER = "px-6 sm:px-16 lg:px-24";

// [blur px, mask start %, mask full %]: each layer blurs harder and starts lower.

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The statement as the landing sets it: same font and word spacing as the
 * intro headline, lines left-aligned, so the docking hand-off is seamless. */
export const Statement = forwardRef<HTMLDivElement, { className?: string; align?: "left" | "center"; size?: string }>(function Statement(
  { className = "", align = "left", size = STATEMENT_SIZE },
  ref,
) {
  return (
    <div ref={ref} className={`${HEADLINE_CLASS} ${size} w-max ${className}`} style={{ fontWeight: STATEMENT_WEIGHT }}>
      {LINES.map((line, i) => (
        <span key={i} className={`flex gap-[0.24em] whitespace-nowrap ${align === "center" ? "justify-center" : ""}`}>
          {line.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </span>
      ))}
    </div>
  );
});

const HINTS: Record<Mode, string> = {
  map: "Scroll to enter · drag to explore",
  entering: "Scroll to fly through · drag to explore",
  immersed: "Scroll to fly through · drag to explore",
  leaving: "Scroll to enter · drag to explore",
  past: "Scroll up to fly back",
};

function Switch({ view, onChange, mode }: { view: View; onChange: (v: View) => void; mode: Mode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex rounded-[10px] bg-black/[0.05] p-[3px] text-[13px] font-medium">
        {(["index", "spatial"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`relative rounded-[8px] px-2.5 py-1.5 capitalize sm:px-4 transition-colors ${view === v ? "text-black" : "text-black/55 hover:text-black"}`}
          >
            {view === v && (
              <motion.span
                layoutId="view-pill"
                className="absolute inset-0 rounded-[8px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                transition={{ duration: 0.35, ease: EASE }}
              />
            )}
            <span className="relative">{v}</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] tracking-[-0.01em] text-black/45">
        {view === "spatial" ? HINTS[mode] : "Scroll to browse the work"}
      </p>
    </div>
  );
}

interface Props {
  view: View;
  onView: (v: View) => void;
  /** The headline has docked: show the frame (name, nav, switch). */
  shown: boolean;
  /** The intro has handed over: show the landing's own headline and subtitle. */
  ready: boolean;
  /** Box the intro headline docks to. */
  statementRef: React.RefObject<HTMLDivElement | null>;
  /** The home page's sections, after the hero. */
  children?: ReactNode;
}

export default function Landing({ view, onView, shown, ready, statementRef, children }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>(immersion.get().mode);
  // The chat input is focused or its answers are open: the statement steps back.
  const [asking, setAsking] = useState(false);
  useEffect(() => immersion.onMode(setMode), []);

  // Immersive Spatial view, AIRLA-style. From the top of the page a scroll
  // down flies into a 3D field of the work (MapCards renders it); there,
  // scroll flies through and drag pans the camera. Scrolling back past the
  // start returns to the map; past the end, on into the page sections.
  useEffect(() => {
    if (view !== "spatial" || !ready) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const root = document.documentElement;
    let over = 0; // wheel pushed past either end of the flight
    let drag: { x: number; y: number; moved: number } | null = null;
    let lastDragMoved = 0;
    const lock = (on: boolean) => (root.style.overflow = on ? "hidden" : "");
    // Trackpads keep sending wheel events after a flick; ignore input for a
    // moment after any change of mode so momentum can't bounce it back.
    const COOLDOWN = 300;
    const SPEED = 1 / 520; // flight per wheel px
    const PAST_END = 90; // wheel px past the end before leaving

    const onWheel = (e: WheelEvent) => {
      // A project or the chat is open: the scene holds still, but the chat
      // panel keeps its own scroll.
      if (immersion.get().detail) {
        if (!(e.target as HTMLElement).closest?.("[data-own-scroll]")) e.preventDefault();
        return;
      }
      const m = immersion.get().mode;
      const vh = window.innerHeight;
      if (m === "map") {
        if (immersion.sinceChange() < COOLDOWN) {
          if (window.scrollY <= 2) e.preventDefault();
          return;
        }
        // From the top of the page, scrolling down flies in.
        if (window.scrollY <= 2 && e.deltaY > 0) {
          e.preventDefault();
          lock(true);
          over = 0;
          immersion.enter();
          return;
        }
        return;
      }
      if (m === "past") {
        // Back up from the sections: the scene is parked at its end frame, so
        // reaching the top drops straight into it, and the scroll keeps going
        // as a fly-back. Further up flies out to the flat map.
        if (e.deltaY < 0 && window.scrollY <= vh * 0.04) {
          e.preventDefault();
          window.scrollTo({ top: 0 });
          lock(true);
          over = 0;
          immersion.resume();
        }
        return;
      }
      e.preventDefault();
      if (m !== "immersed" || immersion.sinceChange() < COOLDOWN) return;
      const s = immersion.get();
      // Only a push past an end the camera has actually reached counts.
      if (e.deltaY > 0 && s.flightTarget >= 1 && s.flight > 0.97) over += e.deltaY;
      else if (e.deltaY < 0 && s.flightTarget <= 0 && s.flight < 0.03) over += e.deltaY;
      else over = 0;
      if (over > PAST_END) {
        // Past the end: park the scene at its end frame and scroll on down
        // into the sections; the map fades with the scroll.
        over = 0;
        immersion.leave(true);
        lock(false);
        window.scrollTo({ top: vh, behavior: "smooth" });
      } else if (over < -PAST_END) {
        over = 0;
        immersion.leave();
        lock(false);
      } else {
        immersion.fly(e.deltaY * SPEED);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (immersion.get().mode !== "immersed" || immersion.get().detail || e.button !== 0) return;
      if ((e.target as HTMLElement).closest("header, button, form, [data-own-scroll]")) return;
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
      root.style.cursor = "grabbing";
      root.style.userSelect = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      immersion.orbit(dx, dy);
    };
    const onUp = () => {
      if (!drag) return;
      lastDragMoved = drag.moved;
      drag = null;
      root.style.cursor = "";
      root.style.userSelect = "";
    };
    // A drag that ends on a card must not open it.
    const onClick = (e: MouseEvent) => {
      if (lastDragMoved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      lastDragMoved = 0;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("click", onClick, true);
      immersion.leave();
      lock(false);
    };
  }, [view, ready]);

  // Map backdrop. Immersed: the map softens and recedes behind the cards.
  // Scrolled (Spatial, past the hero): it blurs, fades and lifts away. Index:
  // it stays as a backdrop and defocuses. Written straight to CSS variables.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.view = view;
    const set = (k: string, v: string) => root.style.setProperty(k, v);
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const p = window.scrollY / vh;
      const k = immersion.get().k;
      const out = view === "spatial" ? clamp01(p / 0.75) : 0;
      const d = view === "index" ? clamp01(p / 0.9) : 0;
      const blur = view === "spatial" ? out * 16 : d * 14;
      set("--map-filter", blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none");
      set("--map-opacity", (view === "spatial" ? 1 - out : 1 - 0.35 * d).toFixed(3));
      set("--map-y", `${(-out * 0.12 * vh).toFixed(1)}px`);
      set("--map-bg-filter", k > 0.01 ? `blur(${(k * 6).toFixed(2)}px)` : "none");
      // Immersed: the whole map zooms in about the centre. Flat: no transform
      // at all, so the vector map stays sharp.
      const im = immersion.get();
      set("--map-ox", "50%");
      set("--map-oy", "50%");
      set("--map-zoom", (1 + 0.9 * k).toFixed(4));
      // The camera is fixed: the map never tilts, it only slides a touch
      // with the globe's spin so the backdrop feels attached to it.
      const slide = Math.sin(im.yaw) * 40 * k;
      set("--map-tilt", k > 0.001 ? `translate(${slide.toFixed(1)}px, ${(im.pitch * 30 * k).toFixed(1)}px)` : "none");
      set("--map-bg-opacity", (1 - 0.88 * k).toFixed(3));
      set("--immersed", k.toFixed(3));
      if (heroRef.current) {
        const h = Math.max(clamp01(p / 0.5), k);
        heroRef.current.style.opacity = (1 - h).toFixed(3);
        heroRef.current.style.filter = h > 0.01 ? `blur(${(h * 8).toFixed(2)}px)` : "none";
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const offTick = immersion.onTick(apply);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    apply();
    return () => {
      offTick();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [view]);

  const frame = { initial: { opacity: 0 }, animate: { opacity: shown ? 1 : 0 }, transition: { duration: 0.6, ease: EASE } };

  return (
    <>
      {/* Frame: name, switch, nav */}
      <motion.header {...frame} className={`fixed inset-x-0 top-0 z-40 ${shown ? "" : "pointer-events-none"}`}>
        {/* Soft white backing so content scrolling underneath never collides with the nav */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/85 to-transparent" />
        <div className={`relative grid grid-cols-[1fr_auto_1fr] items-start pt-6 sm:pt-9 ${GUTTER}`}>
          <Link href="/" className="whitespace-nowrap text-[13px] font-bold tracking-[-0.03em] text-black sm:text-[15px]">
            Pradeep Yellapu
          </Link>
          <Switch view={view} onChange={onView} mode={mode} />
          <nav className="flex justify-end gap-3 text-[13px] font-semibold tracking-[-0.02em] text-black sm:gap-12 sm:text-[14px]">
            <Link href="/about">Info</Link>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </motion.header>

      <AskBar shown={shown && ready} onActive={setAsking} />

      {/* Border beam round the whole screen edge, not a box round the map. */}
      <motion.div {...frame} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
        <BorderBeam theme="light" colorVariant="colorful" size="md" borderRadius={0} brightness={1.8} strength={1} duration={4} className="h-full w-full" style={{ height: "100%" }}>
          <div className="h-full w-full" />
        </BorderBeam>
      </motion.div>

      {/* Statement, centred at the foot of the screen as the label of the
          chat input under it, in both views. Always laid out so the intro
          can dock to it. */}
      <div ref={heroRef} className="pointer-events-none fixed inset-x-0 bottom-[96px] z-30 flex justify-center px-4 sm:bottom-[112px]">
        <div
          className="transition-[opacity,transform] duration-500"
          style={{ opacity: asking ? 0 : 1, transform: asking ? "translateY(-8px)" : "none", transitionTimingFunction: "cubic-bezier(.2,.6,.35,1)" }}
        >
          <Statement ref={statementRef} align="center" size={HERO_SIZE} className={`text-black ${ready ? "" : "invisible"}`} />
        </div>
      </div>
      {/* First screen: the map shows through. Spatial scrolls on into the
          sections; Index into the case studies first. */}
      <div aria-hidden="true" className="pointer-events-none h-screen" />
      {view === "index" && <IndexView />}

      {ready && <div className="relative z-20 bg-white">{children}</div>}
    </>
  );
}

function IndexView() {
  return (
    <div className="relative z-20 bg-white/90 backdrop-blur-[2px]">
      {/* The home page's own case-study cards, one per row, on white. */}
      <RecruiterProvider>
        <Projects />
      </RecruiterProvider>
    </div>
  );
}
