"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CONTACT, METHOD, QUOTES, ROLES } from "./content";
import { LineRise } from "./Motion";

// The page under the hero: full-bleed blocks of colour with oversized type,
// each carrying a line-drawn figure that says something. One typeface
// (Manrope) at readable weights; no mono labels, no numbering. Each section
// tells the header which ink to use (data-header).

const INK = "#0c0c0d";
const SIGNAL = "#ff5a1f";
const BLUE = "#3651e6";
const PAPER = "#f3efe9";
const EASE = [0.16, 0.84, 0.24, 1] as const;

const WRAP = "mx-auto w-full max-w-[1320px] px-5 sm:px-8";
const KICKER = "text-[14px] font-medium tracking-[-0.01em]";
const HEADLINE = "text-[clamp(2.8rem,8.6vw,8.8rem)] font-extrabold leading-[0.9] tracking-[-0.055em]";

/** A point on a figure: a solid core in a soft halo. */
function Node({ x = 0, y = 0, color, r = 5 }: { x?: number; y?: number; color: string; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 2.6} fill={color} opacity="0.14" />
      <circle r={r * 1.6} fill={color} opacity="0.22" />
      <circle r={r} fill={color} />
    </g>
  );
}

/** Tabs that advance on their own, with a bar filling under the active one. */
function AutoTabs({
  items,
  active,
  onPick,
  paused,
  duration,
  tone,
}: {
  items: string[];
  active: number;
  onPick: (i: number, byUser: boolean) => void;
  paused: boolean;
  duration: number;
  tone: "dark" | "light";
}) {
  const reduce = useReducedMotion();
  const ink = tone === "dark" ? "#fff" : INK;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((label, i) => {
        const on = i === active;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onPick(i, true)}
            aria-pressed={on}
            className="relative overflow-hidden rounded-full border px-4 py-2 text-[14px] font-semibold tracking-[-0.01em] transition-colors"
            style={{ borderColor: on ? ink : `color-mix(in srgb, ${ink} 25%, transparent)`, color: ink, opacity: on ? 1 : 0.7 }}
          >
            {on && !reduce && (
              <motion.span
                key={`${i}-${paused}`}
                className="absolute inset-y-0 left-0"
                style={{ background: `color-mix(in srgb, ${ink} 12%, transparent)` }}
                initial={{ width: "0%" }}
                animate={{ width: paused ? "0%" : "100%" }}
                transition={{ duration: paused ? 0.3 : duration, ease: "linear" }}
                onAnimationComplete={() => !paused && onPick((i + 1) % items.length, false)}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Journey: every role an orbit, widening with the work ────────────────────

/** An ellipse as a path starting at its left end. */
const ellipse = (rx: number, ry: number) => `M ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0`;

function Orbits({ active, reduce }: { active: number; reduce: boolean }) {
  // Oldest role innermost: each orbit wider and tipped a little further.
  const orbits = [...ROLES].reverse().map((r, i) => ({
    key: r.org + r.years,
    idx: ROLES.length - 1 - i,
    rx: 100 + i * 42,
    ry: 36 + i * 17,
    tilt: -26 + i * 8,
    dur: 10 + i * 3.5,
  }));
  const R = 64;
  return (
    <svg viewBox="-340 -340 680 680" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="planet" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#3a3a40" />
          <stop offset="70%" stopColor="#111113" />
          <stop offset="100%" stopColor="#0a0a0b" />
        </radialGradient>
      </defs>
      {/* Back halves of the orbits pass behind the planet: draw orbits, then the planet, then the front halves. */}
      {orbits.map((o, n) => {
        const on = active === o.idx;
        return (
          <g key={o.key} transform={`rotate(${o.tilt})`}>
            <motion.path
              d={ellipse(o.rx, o.ry)}
              fill="none"
              stroke={on ? SIGNAL : "#fff"}
              strokeOpacity={on ? 0.9 : 0.22}
              strokeWidth={on ? 1.6 : 1}
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.15 + n * 0.12 }}
              style={{ transition: "stroke .5s, stroke-opacity .5s" }}
            />
            {/* The satellite: a short comet riding the orbit, head bright, tail fading. */}
            {!reduce && (
              <>
                <path
                  d={ellipse(o.rx, o.ry)}
                  pathLength={1}
                  fill="none"
                  stroke={on ? SIGNAL : "#fff"}
                  strokeOpacity={on ? 0.55 : 0.18}
                  strokeWidth={on ? 3 : 2}
                  strokeLinecap="round"
                  strokeDasharray="0.14 0.86"
                  className="orbit-comet"
                  style={{ animationDuration: `${o.dur}s` }}
                />
                <path
                  d={ellipse(o.rx, o.ry)}
                  pathLength={1}
                  fill="none"
                  stroke={on ? SIGNAL : "#fff"}
                  strokeOpacity={on ? 1 : 0.7}
                  strokeWidth={on ? 7 : 4.5}
                  strokeLinecap="round"
                  strokeDasharray="0 0.139 0.001 0.86"
                  className="orbit-comet"
                  style={{ animationDuration: `${o.dur}s` }}
                />
              </>
            )}
          </g>
        );
      })}
      {/* The planet, turning: meridians widen and narrow as they come round. */}
      <circle r={R} fill="url(#planet)" stroke="#fff" strokeOpacity="0.55" />
      <g clipPath="circle(64px at 0 0)">
        {[0, 1, 2, 3].map((k) => (
          <ellipse key={k} rx={R} ry={R} fill="none" stroke="#fff" strokeOpacity="0.16">
            {!reduce && <animate attributeName="rx" values={`${R};0;${R}`} dur="12s" begin={`${-k * 3}s`} repeatCount="indefinite" />}
          </ellipse>
        ))}
        {[-36, 0, 36].map((y) => (
          <ellipse key={y} cy={y} rx={Math.sqrt(R * R - y * y)} ry={4} fill="none" stroke="#fff" strokeOpacity="0.12" />
        ))}
      </g>
    </svg>
  );
}

export function Journey() {
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  // The role in the middle of the screen is the one lit, so scrolling walks
  // through the orbits.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-48% 0px -48% 0px" },
    );
    rows.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="journey" data-header="dark" className="relative py-28 text-white sm:py-36" style={{ background: INK }}>
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-6 border-b border-white/15 pb-6">
          <p className={`${KICKER} text-white/60`}>Where I&rsquo;ve worked</p>
          <p className={`${KICKER} text-white/60`}>2022 to now</p>
        </div>
        <h2 className={`mt-10 ${HEADLINE}`}>
          <LineRise lines={[{ text: "Six teams," }, { text: "one way of working.", className: "text-[color:var(--sig)]" }]} />
        </h2>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1.05fr_1fr]" style={{ ["--sig" as string]: SIGNAL }}>
          <figure className="relative mx-auto aspect-square w-full max-w-[620px] self-start lg:sticky lg:top-[12vh]">
            <Orbits active={active} reduce={reduce} />
            <figcaption className="absolute -bottom-2 left-0 text-[14px] text-white/50">Each role is an orbit. They get wider as the work does.</figcaption>
          </figure>

          <ol className="lg:py-[18vh]">
            {ROLES.map((r, i) => {
              const on = active === i;
              return (
                <li
                  key={r.org + r.years}
                  ref={(el) => {
                    rows.current[i] = el;
                  }}
                  data-i={i}
                  onPointerEnter={() => setActive(i)}
                  className="border-t border-white/12 py-7 transition-opacity duration-500 last:border-b"
                  style={{ opacity: on ? 1 : 0.38 }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="text-[clamp(1.5rem,2.6vw,2.2rem)] font-bold leading-tight tracking-[-0.035em]">{r.org}</span>
                    <span className="text-[15px] font-medium tabular-nums text-white/60">{r.years}</span>
                  </div>
                  <p className="mt-1 text-[15px] text-white/65">
                    {r.role}, {r.place}
                  </p>
                  <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                    <p className="overflow-hidden">
                      <span className="block pt-3 text-[17px] leading-relaxed text-white/90">{r.outcome}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ── Method: talk to people, build a system, ship it, as a loop ──────────────

/** Lemniscate of Bernoulli, x stretched by `a`, y by `b`; t from t0 to t1. */
function lemniscate(a: number, b: number, t0 = 0, t1 = Math.PI * 2, steps = 160) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    const d = 1 + Math.sin(t) ** 2;
    pts.push(`${(a * Math.cos(t)) / d},${(b * Math.sin(t) * Math.cos(t)) / d}`);
  }
  return `M ${pts.join(" L ")}`;
}

function Loop({ step, reduce }: { step: number; reduce: boolean }) {
  const paths = useMemo(
    () => ({
      outer: lemniscate(420, 380),
      inner: [lemniscate(330, 380), lemniscate(240, 380), lemniscate(150, 380)],
      left: lemniscate(420, 380, Math.PI / 2, (Math.PI * 3) / 2) + " Z",
      right: lemniscate(420, 380, -Math.PI / 2, Math.PI / 2) + " Z",
    }),
    [],
  );
  const fill = "rgba(54,81,230,0.09)";
  const label = { fontSize: 17, fontWeight: 600, fontFamily: "var(--font-manrope), sans-serif", fill: INK, letterSpacing: "-0.01em" } as const;
  return (
    <svg viewBox="-520 -210 1040 420" className="h-full w-full overflow-visible" aria-hidden="true">
      <path d={paths.left} fill={step === 0 ? fill : "transparent"} style={{ transition: "fill .6s" }} />
      <path d={paths.right} fill={step === 2 ? fill : "transparent"} style={{ transition: "fill .6s" }} />
      {paths.inner.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={INK} strokeOpacity={0.3 - i * 0.07} strokeDasharray={i === 0 ? "0" : "2 5"} />
      ))}
      <path d={paths.outer} fill="none" stroke={INK} strokeWidth="1.5" />
      <line x1="-490" y1="0" x2="-430" y2="0" stroke={INK} strokeOpacity="0.3" strokeDasharray="2 5" />
      <line x1="430" y1="0" x2="490" y2="0" stroke={INK} strokeOpacity="0.3" strokeDasharray="2 5" />
      <g style={{ opacity: step === 0 ? 1 : 0.3, transition: "opacity .5s" }}>
        <Node x={-500} color={step === 0 ? BLUE : INK} r={5} />
      </g>
      <g style={{ opacity: step === 2 ? 1 : 0.3, transition: "opacity .5s" }}>
        <Node x={500} color={step === 2 ? BLUE : INK} r={5} />
      </g>
      {/* The crossing: where what I heard turns into a system. */}
      <line x1="0" y1="0" x2="0" y2="170" stroke={INK} strokeOpacity={step === 1 ? 0.7 : 0.2} strokeDasharray="2 5" style={{ transition: "stroke-opacity .5s" }} />
      <g style={{ opacity: step === 1 ? 1 : 0.3, transition: "opacity .5s" }}>
        <Node y={180} color={step === 1 ? BLUE : INK} r={5.5} />
      </g>
      {/* The work going round: a comet on the loop. */}
      {!reduce && (
        <>
          <path d={paths.outer} pathLength={1} fill="none" stroke={SIGNAL} strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.08 0.92" className="orbit-comet" style={{ animationDuration: "8s" }} />
          <path d={paths.outer} pathLength={1} fill="none" stroke={SIGNAL} strokeWidth="11" strokeLinecap="round" strokeDasharray="0 0.079 0.001 0.92" className="orbit-comet" style={{ animationDuration: "8s" }} />
        </>
      )}
      <text x="-420" y="-160" {...label} opacity={step === 0 ? 1 : 0.45}>Research</text>
      <text x="420" y="-160" textAnchor="end" {...label} opacity={step === 2 ? 1 : 0.45}>Code</text>
      <text x="22" y="186" {...label} opacity={step === 1 ? 1 : 0.45}>System</text>
    </svg>
  );
}

export function Method() {
  const reduce = !!useReducedMotion();
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const m = METHOD[step];
  return (
    <section id="method" data-header="light" className="py-28 sm:py-36" style={{ background: PAPER, color: INK, ["--blue" as string]: BLUE }}>
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-6 border-b border-black/15 pb-6">
          <p className={`${KICKER} text-black/55`}>How I work</p>
          <p className={`${KICKER} text-black/55`}>Designer, researcher, engineer</p>
        </div>
        <h2 className={`mt-10 ${HEADLINE}`}>
          <LineRise lines={[{ text: "Listen first," }, { text: "then ship it.", className: "text-[color:var(--blue)]" }]} />
        </h2>

        <div className="mt-16 rounded-[28px] border border-black/[0.07] bg-white/50 px-4 py-12 sm:px-10" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
          <div className="mx-auto aspect-[2.5/1] w-full max-w-[1000px]">
            <Loop step={step} reduce={reduce} />
          </div>
          <div className="mx-auto mt-10 min-h-[9rem] max-w-[600px] text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={m.key}
                initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <p className="text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold tracking-[-0.035em]">{m.title}</p>
                <p className="mt-3 text-[17px] leading-relaxed text-black/70">{m.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex justify-center">
            <AutoTabs items={METHOD.map((s) => s.title)} active={step} onPick={(i) => setStep(i)} paused={held} duration={5} tone="light" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Kind words: one quote at a time, full bleed and enormous ────────────────

function RisingWords({ text, reduce }: { text: string; reduce: boolean }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.85, ease: EASE, delay: i * 0.022 }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </>
  );
}

export function KindWords() {
  const reduce = !!useReducedMotion();
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const q = QUOTES[i];
  return (
    <section
      id="testimonials"
      data-header="light"
      className="py-28 sm:py-36"
      style={{ background: SIGNAL, color: INK }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className={WRAP}>
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-black/25 pb-6">
          <p className={`${KICKER} text-black/65`}>What people say</p>
          <AutoTabs
            items={QUOTES.map((x) => x.name)}
            active={i}
            onPick={(j, byUser) => {
              setI(j);
              if (byUser || j !== i) setOpen(false);
            }}
            paused={hover || open}
            duration={9}
            tone="light"
          />
        </div>
        <div className="mt-14 min-h-[3.5em] text-[clamp(2rem,5.2vw,5.2rem)] font-extrabold leading-[1] tracking-[-0.045em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={q.name}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <RisingWords text={`“${q.short}”`} reduce={reduce} />
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {open && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 max-w-[780px] overflow-hidden text-[18px] leading-relaxed text-black/80"
            >
              {q.full}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-black/25 pt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={q.name}
              className="flex items-center gap-4"
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small, local */}
              <img src={q.avatar} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover grayscale" />
              <div>
                <p className="text-[19px] font-bold tracking-[-0.02em]">{q.name}</p>
                <p className="text-[15px] text-black/70">
                  {q.role}, {q.tag}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="rounded-full border border-black px-5 py-2.5 text-[15px] font-semibold transition-colors hover:bg-black hover:text-white"
          >
            {open ? "Show less" : "Read the whole note"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Contact: a ground station and its uplink ────────────────────────────────

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
const subscribeMinute = (cb: () => void) => {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
};

function Uplink({ reduce }: { reduce: boolean }) {
  const label = { fontSize: 15, fontWeight: 600, fontFamily: "var(--font-manrope), sans-serif", fill: "#fff" } as const;
  return (
    <svg viewBox="0 0 420 420" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Satellite: body and panels. */}
      <g transform="translate(320 70) rotate(-25)">
        <rect x="-14" y="-10" width="28" height="20" rx="3" fill="none" stroke="#fff" strokeWidth="1.4" />
        <rect x="-62" y="-7" width="40" height="14" rx="2" fill="none" stroke="#fff" strokeWidth="1.2" />
        <rect x="22" y="-7" width="40" height="14" rx="2" fill="none" stroke="#fff" strokeWidth="1.2" />
        {[-52, -42, -32, 32, 42, 52].map((x) => (
          <line key={x} x1={x} y1="-7" x2={x} y2="7" stroke="#fff" strokeOpacity="0.5" />
        ))}
      </g>
      {[30, 60, 90].map((r, i) => (
        <circle key={r} cx="320" cy="70" r={r} fill="none" stroke="#fff" strokeOpacity={0.28 - i * 0.08}>
          {!reduce && <animate attributeName="r" values={`${r};${r + 30};${r}`} dur="5s" begin={`${-i * 1.6}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {/* The beam, and a packet travelling up it. */}
      <path id="beam" d="M 110 290 Q 190 130 312 82" fill="none" stroke="#fff" strokeDasharray="3 7" strokeOpacity="0.7" />
      {!reduce && (
        <g>
          <Node color="#fff" r={4} />
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M 110 290 Q 190 130 312 82" />
        </g>
      )}
      {/* Dish on its mount. */}
      <path d="M 58 312 Q 106 222 166 290" fill="none" stroke="#fff" strokeWidth="1.6" />
      <line x1="112" y1="275" x2="110" y2="292" stroke="#fff" strokeWidth="1.4" />
      <path d="M 106 294 L 92 352 M 114 294 L 128 352 M 80 352 L 140 352" stroke="#fff" strokeWidth="1.4" fill="none" />
      <text x="40" y="388" {...label} opacity="0.75">College Park, Maryland</text>
      <text x="236" y="150" {...label} opacity="0.75">Your inbox</text>
    </svg>
  );
}

export function Closing() {
  const reduce = !!useReducedMotion();
  const time = useSyncExternalStore(subscribeMinute, () => timeFmt.format(new Date()), () => "");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const btn = "rounded-full border border-white/50 px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-[color:var(--blue)]";

  return (
    <footer id="contact" data-header="dark" className="overflow-hidden pb-36 pt-28 text-white sm:pb-40 sm:pt-36" style={{ background: BLUE, ["--blue" as string]: BLUE }}>
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-6 border-b border-white/25 pb-6">
          <p className={`${KICKER} text-white/70`}>Say hi</p>
          <p className={`${KICKER} text-white/70`}>Open to relocating</p>
        </div>

        <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className={HEADLINE}>
              Let&rsquo;s build
              <br />
              something
              <br />
              people rely on.
            </h2>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-10 inline-block break-all text-[clamp(1.3rem,3.2vw,2.6rem)] font-semibold tracking-[-0.035em] underline decoration-white/40 decoration-2 underline-offset-[0.18em] hover:decoration-white"
            >
              {CONTACT.email}
            </a>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={copy} className={btn}>
                {copied ? "Copied" : "Copy email"}
              </button>
              <a className={btn} href={`https://mail.google.com/mail/?view=cm&to=${CONTACT.email}`} target="_blank" rel="noopener noreferrer">
                Open in Gmail
              </a>
            </div>
          </div>
          <figure className="mx-auto w-full max-w-[420px]">
            <div className="aspect-square">
              <Uplink reduce={reduce} />
            </div>
          </figure>
        </div>

        <div className="mt-20 grid gap-8 border-t border-white/25 pt-8 sm:grid-cols-3">
          <div>
            <p className={`${KICKER} text-white/65`}>My time</p>
            <p className="mt-2 text-[24px] font-bold tabular-nums tracking-[-0.02em]">{time || " "}</p>
          </div>
          <div className="sm:col-span-2">
            <p className={`${KICKER} text-white/65`}>Elsewhere</p>
            <ul className="mt-2 flex flex-wrap gap-x-7 gap-y-2">
              {CONTACT.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[24px] font-bold tracking-[-0.02em] underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sign-off: the name across the full width. */}
        <p aria-hidden="true" className="mt-24 select-none whitespace-nowrap text-[clamp(2.6rem,11.2vw,10.5rem)] font-extrabold leading-[0.95] tracking-[-0.06em]">
          Pradeep Yellapu
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/25 pt-5 text-[14px] font-medium text-white/70">
          <span>© {new Date().getFullYear()} Pradeep Yellapu</span>
          <span>Built with Next.js and three.js</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
