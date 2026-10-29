"use client";

import { forwardRef, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { HEADLINE_CLASS, LINES } from "@/components/intro/HyperspaceIntro";
import AskBar from "./AskBar";
import Latest from "./Latest";
import Evidence from "./Evidence";
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

// View switcher: a vertical glass pill on the right edge, icons only, the
// label showing on hover (Air-style).
const VIEWS: { v: View; label: string; icon: ReactNode }[] = [
  {
    v: "spatial",
    label: "Spatial",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="3.2" ry="7.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.9 10h14.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    v: "index",
    label: "Index",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="M3 5.5h14M3 10h14M3 14.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// Phones: the same switch as a small horizontal pill under the name, with
// words (AIRLA's Index / Spatial), since the glass rail on the edge sat over
// the content there.
function PhoneSwitch({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex rounded-full border border-black/[0.08] bg-white/70 p-0.5 backdrop-blur-xl">
      {VIEWS.map(({ v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          className={`relative rounded-full px-3 py-1 text-[11.5px] font-semibold tracking-[-0.01em] transition-colors ${view === v ? "text-black" : "text-black/45"}`}
        >
          {view === v && <motion.span layoutId="view-pill-phone" className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.14)]" />}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
}

function Switch({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-white/80 bg-white/45 p-1 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      {VIEWS.map(({ v, label, icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-label={`${label} view`}
          aria-pressed={view === v}
          className={`group relative grid h-9 w-9 place-items-center rounded-[10px] transition-colors ${view === v ? "text-black" : "text-black/45 hover:text-black"}`}
        >
          {view === v && (
            <motion.span
              layoutId="view-pill"
              className="absolute inset-0 rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.14)]"
              transition={{ duration: 0.35, ease: EASE }}
            />
          )}
          <span className="relative">{icon}</span>
          <span className="pointer-events-none absolute right-full mr-2.5 whitespace-nowrap rounded-[6px] bg-black px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Local time where the work is based, ticking by the minute.
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
const subscribeMinute = (cb: () => void) => {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
};
function LocalTime() {
  const time = useSyncExternalStore(subscribeMinute, () => timeFmt.format(new Date()), () => "");
  return (
    <span className="whitespace-nowrap text-[12px] font-medium tracking-[-0.02em] text-black/55 sm:text-[13px]">
      <span className="hidden sm:inline">College Park, MD</span>
      <span className="tabular-nums text-black/35 sm:ml-2">{time}</span>
    </span>
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
          {/* Where I am, and under it a tiny key for the map's heat. The key
              fades with the map (scrolled away or flown into). */}
          <div className="flex flex-col items-start gap-2 pt-0.5">
            <LocalTime />
            <span
              // From sm up: on a phone the header stays one line.
              className="hidden items-center gap-2 text-[11px] tracking-[-0.01em] text-black/40 sm:flex"
              style={{ opacity: "calc(var(--map-opacity, 1) * (1 - var(--immersed, 0)))" }}
            >
              <span aria-hidden="true" className="h-[3px] w-5" style={{ background: "linear-gradient(90deg, #1f40ff, #1abfff, #4de659, #ffeb26, #ff8c1a, #f22626)" }} />
              Where my work has reached
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Link href="/" className="whitespace-nowrap text-[14px] font-bold tracking-[-0.03em] text-black sm:text-[15px]">
              Pradeep Yellapu
            </Link>
            <div className="mt-1 sm:hidden">
              <PhoneSwitch view={view} onChange={onView} />
            </div>
            <p className="hidden text-[11px] tracking-[-0.01em] text-black/45 sm:block">{view === "spatial" ? HINTS[mode] : "Scroll to browse the work"}</p>
          </div>
          <nav className="flex items-center justify-end gap-3 text-[13px] font-semibold tracking-[-0.02em] text-black sm:gap-8 sm:text-[14px]">
            <Link href="/about" className="hidden sm:inline">
              Info
            </Link>
            <a href="#contact" className="hidden sm:inline">
              Contact
            </a>
            <Latest />
          </nav>
        </div>
      </motion.header>

      {/* View switcher, glass, on the right edge. Phones get PhoneSwitch in the
          header instead: this one sat over the content there. */}
      <motion.div {...frame} className={`fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 sm:right-6 sm:block ${shown ? "" : "pointer-events-none"}`}>
        <Switch view={view} onChange={onView} />
      </motion.div>

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
      <div className="pointer-events-none relative h-screen">{view === "index" && <Evidence shown={shown && ready} />}</div>
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
        {/* The squarer render of the Jeevy loop suits this nearly square cell. */}
        <Projects
          jeevyVideo="/thumbs/jeevy-os-tall.mp4"
          jeevyPoster="/thumbs/jeevy-os-tall-poster.webp"
          videos={{
            "/work/xylem-institute": { src: "/thumbs/xylem-tall.mp4", poster: "/thumbs/xylem-tall-poster.webp" },
            "/work/tgi": { src: "/thumbs/tgi-tall.mp4", poster: "/thumbs/tgi-tall-poster.webp" },
          }}
        />
      </RecruiterProvider>
    </div>
  );
}
