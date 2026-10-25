"use client";

import { forwardRef, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HEADLINE_CLASS, LINES, SUBTITLE } from "@/components/intro/HyperspaceIntro";
import { PROJECTS } from "@/components/map/projects";

export type View = "spatial" | "index";

const EASE = [0.65, 0, 0.35, 1] as const;
// Landing headline size: the intro headline docks to exactly this box.
const STATEMENT_SIZE = "text-[clamp(1.9rem,3.6vw,3.4rem)]";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The statement as the landing sets it: same font and word spacing as the
 * intro headline, lines left-aligned, so the docking hand-off is seamless. */
export const Statement = forwardRef<HTMLDivElement, { className?: string }>(function Statement({ className = "" }, ref) {
  return (
    <div ref={ref} className={`${HEADLINE_CLASS} ${STATEMENT_SIZE} w-max ${className}`}>
      {LINES.map((line, i) => (
        <span key={i} className="flex gap-[0.24em] whitespace-nowrap">
          {line.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </span>
      ))}
    </div>
  );
});

function Switch({ view, onChange }: { view: View; onChange: (v: View) => void }) {
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
        {view === "spatial" ? "Scroll to zoom in · move to explore" : "Scroll to browse the work"}
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

  // Scroll camera. Spatial: zoom into the map about the pointer, then blur
  // and fade it away as the page continues. Index: the map stays put as a
  // backdrop and only defocuses. Written straight to CSS variables.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.view = view;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const p = window.scrollY / vh;
      const set = (k: string, v: string) => root.style.setProperty(k, v);
      set("--map-cards-opacity", view === "spatial" ? "1" : "0");
      set("--map-cards-visibility", view === "spatial" ? "visible" : "hidden");
      if (view === "spatial") {
        const zoomU = ease(clamp01(p / 1.0));
        const out = clamp01((p - 1.0) / 0.8);
        // Re-aim only while unzoomed, so the view never jumps mid-zoom.
        if (p < 0.02) {
          set("--map-ox", `${pointer.x}px`);
          set("--map-oy", `${pointer.y}px`);
        }
        set("--map-zoom", (1 + 2.2 * zoomU).toFixed(4));
        set("--map-blur", `${(out * 16).toFixed(2)}px`);
        set("--map-opacity", (1 - out).toFixed(3));
        set("--map-y", `${(-out * 0.12 * vh).toFixed(1)}px`);
        if (heroRef.current) {
          const h = clamp01(p / 0.6);
          heroRef.current.style.opacity = (1 - h).toFixed(3);
          heroRef.current.style.filter = `blur(${(h * 8).toFixed(2)}px)`;
        }
      } else {
        const d = clamp01(p / 0.9);
        set("--map-zoom", "1");
        set("--map-y", "0px");
        set("--map-blur", `${(d * 14).toFixed(2)}px`);
        set("--map-opacity", (1 - 0.35 * d).toFixed(3));
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (window.scrollY < window.innerHeight * 0.02) kick();
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("pointermove", onPointer, { passive: true });
    apply();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [view]);

  const frame = { initial: { opacity: 0 }, animate: { opacity: shown ? 1 : 0 }, transition: { duration: 0.6, ease: EASE } };

  return (
    <>
      {/* Frame: name, switch, nav */}
      <motion.header {...frame} className={`fixed inset-x-0 top-0 z-40 ${shown ? "" : "pointer-events-none"}`}>
        {/* Soft white backing so content scrolling underneath never collides with the nav */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/85 to-transparent" />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-start px-4 pt-5 sm:px-10 sm:pt-7">
          <Link href="/" className="whitespace-nowrap text-[13px] font-bold tracking-[-0.03em] text-black sm:text-[15px]">
            Pradeep Yellapu
          </Link>
          <Switch view={view} onChange={onView} />
          <nav className="flex justify-end gap-3 text-[13px] font-semibold tracking-[-0.02em] text-black sm:gap-12 sm:text-[14px]">
            <Link href="/about">Info</Link>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </motion.header>

      {view === "spatial" ? (
        <>
          {/* Statement, bottom-left over the map. Always laid out so the intro can dock to it. */}
          <div ref={heroRef} className="pointer-events-none fixed bottom-8 left-4 z-30 sm:bottom-12 sm:left-10">
            <Statement ref={statementRef} className={`text-black ${ready ? "" : "invisible"}`} />
            <motion.p
              className="mt-4 max-w-[34rem] text-[13px] leading-snug tracking-[-0.01em] text-black/55 sm:text-[15px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 1 : 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              {SUBTITLE}
            </motion.p>
          </div>
          {/* Scroll room for the zoom and the fade-out; the map shows through. */}
          <div aria-hidden="true" className="pointer-events-none h-[190vh]" />
        </>
      ) : (
        <IndexView statementRef={statementRef} ready={ready} />
      )}

      {ready && <div className="relative z-20 bg-white">{children}</div>}
    </>
  );
}

function IndexView({ statementRef, ready }: { statementRef: Props["statementRef"]; ready: boolean }) {
  const work = PROJECTS.filter((p) => !p.parent);
  return (
    <div className="relative z-20 px-4 sm:px-10">
      {/* Statement sits high; the grid starts 60% down the first screen. */}
      <div className="flex h-[60vh] flex-col justify-end pb-12">
        <Statement ref={statementRef} className={`text-black ${ready ? "" : "invisible"}`} />
        <p className="mt-4 max-w-[34rem] text-[13px] leading-snug tracking-[-0.01em] text-black/55 sm:text-[15px]">{SUBTITLE}</p>
      </div>
      <div className="flex items-baseline justify-between pb-5 text-[15px] tracking-[-0.02em]">
        <p className="font-medium text-black">
          Selected work <span className="ml-1 text-[11px] text-black/40">(01–{String(work.length).padStart(2, "0")})</span>
        </p>
        <p className="hidden text-black/55 sm:block">Product design, research and code for AI and spatial systems</p>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 pb-28 sm:grid-cols-2 lg:grid-cols-3">
        {work.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.06 }}
          >
            <Link href={p.href} className="group block">
              <span className="block aspect-[5/4] overflow-hidden bg-black/[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element -- mixed gif/webp covers */}
                <img
                  src={p.cover ?? p.thumb}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-4">
                <span className="text-[17px] font-medium tracking-[-0.03em] text-black">{p.title}</span>
                <span className="text-[11px] tabular-nums text-black/40">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="mt-2 block max-w-[30rem] text-[14px] leading-snug tracking-[-0.01em] text-black/55">{p.blurb ?? p.role}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
