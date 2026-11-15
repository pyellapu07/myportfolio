"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { CONTACT, METHOD, QUOTES, ROLES } from "./content";
import { ScrubText } from "./Motion";

// The page under the hero, maximalist: each section is a full-bleed block of
// its own colour with oversized type, and each carries a line-drawn figure
// that says something (FIG. 01–03), not decoration. Palette: ink, signal
// orange, the ledger's blue, warm paper.

const INK = "#0c0c0d";
const SIGNAL = "#ff5a1f";
const BLUE = "#3651e6";
const PAPER = "#f3efe9";

const WRAP = "mx-auto w-full max-w-[1320px] px-5 sm:px-8";
const MONO = "font-mono text-[10.5px] uppercase tracking-[0.08em]";

function Fig({ n, label, className = "" }: { n: string; label: string; className?: string }) {
  return (
    <p className={`${MONO} ${className}`}>
      <span className="mr-3 opacity-60">Fig. {n}</span>
      {label}
    </p>
  );
}

// ── FIG. 01 · Journey: every role an orbit, widening with the work ──────────

/** An ellipse as a path, so a satellite can ride it with animateMotion. */
const ellipse = (rx: number, ry: number) => `M ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0`;

function Orbits({ active, reduce }: { active: number | null; reduce: boolean }) {
  // Oldest role innermost: each orbit wider and tipped a little further.
  const orbits = [...ROLES].reverse().map((r, i) => ({
    key: r.org + r.years,
    idx: ROLES.length - 1 - i,
    rx: 92 + i * 40,
    ry: 30 + i * 13,
    tilt: -28 + i * 9,
    dur: 9 + i * 3,
  }));
  return (
    <svg viewBox="-330 -330 660 660" className="h-full w-full" aria-hidden="true">
      {/* The planet: a disc with latitude lines. */}
      <circle r="62" fill="none" stroke="currentColor" strokeOpacity="0.9" />
      {[-40, -20, 0, 20, 40].map((y) => (
        <ellipse key={y} cy={y} rx={Math.sqrt(62 * 62 - y * y)} ry={Math.max(2, 9 - Math.abs(y) / 6)} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="1 3" />
      ))}
      <line x1="0" y1="-300" x2="0" y2="300" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="1 5" />
      {orbits.map((o) => {
        const on = active === o.idx;
        const dim = active !== null && !on;
        return (
          <g key={o.key} transform={`rotate(${o.tilt})`} style={{ transition: "opacity .35s" }} opacity={dim ? 0.18 : 1}>
            <path d={ellipse(o.rx, o.ry)} fill="none" stroke={on ? SIGNAL : "currentColor"} strokeWidth={on ? 2 : 1} strokeOpacity={on ? 1 : 0.55} />
            <g>
              <rect x="-4" y="-4" width="8" height="8" fill={on ? SIGNAL : "currentColor"} />
              {!reduce && <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={ellipse(o.rx, o.ry)} />}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export function Journey() {
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  return (
    <section id="journey" className="relative overflow-hidden py-24 text-white sm:py-32" style={{ background: INK, ["--sig" as string]: SIGNAL }}>
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-6 border-b border-white/15 pb-6">
          <p className={`${MONO} text-white/50`}>Journey · 2022 — now</p>
          <p className={`${MONO} text-white/50`}>{String(ROLES.length).padStart(2, "0")} roles</p>
        </div>
        <h2 className="mt-10 text-[clamp(2.8rem,8.6vw,8.8rem)] font-extrabold leading-[0.88] tracking-[-0.055em]">
          <ScrubText text="Six orbits," />
          <br />
          <ScrubText text="one practice." className="text-[color:var(--sig)]" />
        </h2>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <figure className="relative mx-auto aspect-square w-full max-w-[620px] text-white">
            <Orbits active={active} reduce={reduce} />
            <figcaption className="absolute bottom-0 left-0">
              <Fig n="01" label="Each role an orbit; they widen as the work does" className="text-white/50" />
            </figcaption>
          </figure>

          <ol>
            {ROLES.map((r, i) => (
              <li
                key={r.org + r.years}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                className="group grid cursor-default grid-cols-[56px_1fr] gap-4 border-t border-white/15 py-5 last:border-b"
              >
                <span className="font-mono text-[12px] tabular-nums text-white/40 transition-colors group-hover:text-[color:var(--sig)]" style={{ ["--sig" as string]: SIGNAL }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="text-[clamp(1.25rem,2.1vw,1.75rem)] font-bold leading-tight tracking-[-0.03em]">{r.org}</span>
                    <span className="font-mono text-[12px] tabular-nums text-white/50">{r.years}</span>
                  </div>
                  <p className="text-[14px] text-white/60">
                    {r.role} · {r.place}
                  </p>
                  <p className="mt-2 max-h-0 overflow-hidden text-[14px] leading-relaxed text-white/85 transition-[max-height] duration-500 group-hover:max-h-24 max-lg:max-h-24">
                    {r.outcome}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ── FIG. 02 · Method: hear it, model it, ship it, as a loop ─────────────────

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
  const fill = "rgba(12,12,13,0.07)";
  return (
    <svg viewBox="-520 -200 1040 400" className="h-full w-full" aria-hidden="true">
      <line x1="-500" y1="0" x2="-430" y2="0" stroke={INK} strokeOpacity="0.3" strokeDasharray="2 5" />
      <line x1="430" y1="0" x2="500" y2="0" stroke={INK} strokeOpacity="0.3" strokeDasharray="2 5" />
      <rect x="-506" y="-5" width="10" height="10" fill={INK} opacity={step === 0 ? 1 : 0.25} />
      <rect x="496" y="-5" width="10" height="10" fill={INK} opacity={step === 2 ? 1 : 0.25} />
      <path d={paths.left} fill={step === 0 ? fill : "transparent"} style={{ transition: "fill .5s" }} />
      <path d={paths.right} fill={step === 2 ? fill : "transparent"} style={{ transition: "fill .5s" }} />
      {paths.inner.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={INK} strokeOpacity={0.35 - i * 0.07} strokeDasharray={i === 0 ? "0" : "2 4"} />
      ))}
      <path d={paths.outer} fill="none" stroke={INK} strokeWidth="1.4" />
      {/* The crossing: where research turns into a system. */}
      <line x1="0" y1="0" x2="0" y2="180" stroke={INK} strokeOpacity={step === 1 ? 0.8 : 0.25} strokeDasharray="2 4" />
      <rect x="-6" y="176" width="12" height="12" fill={step === 1 ? SIGNAL : INK} />
      <g>
        <circle r="7" fill={SIGNAL} />
        {!reduce && <animateMotion dur="7s" repeatCount="indefinite" path={paths.outer} />}
      </g>
      <text x="-430" y="-150" fontSize="15" fontFamily="var(--font-dm-mono), monospace" fill={INK} opacity="0.55">RESEARCH</text>
      <text x="430" y="-150" fontSize="15" textAnchor="end" fontFamily="var(--font-dm-mono), monospace" fill={INK} opacity="0.55">CODE</text>
    </svg>
  );
}

export function Method() {
  const reduce = !!useReducedMotion();
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held || reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % METHOD.length), 4200);
    return () => clearInterval(id);
  }, [held, reduce]);
  const m = METHOD[step];
  return (
    <section id="method" className="py-24 sm:py-32" style={{ background: PAPER, color: INK, ["--blue" as string]: BLUE }}>
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-6 border-b border-black/15 pb-6">
          <p className={`${MONO} text-black/50`}>Method</p>
          <p className={`${MONO} text-black/50`}>Designer · Researcher · Engineer</p>
        </div>
        <h2 className="mt-10 max-w-[14ch] text-[clamp(2.8rem,8.6vw,8.8rem)] font-extrabold leading-[0.88] tracking-[-0.055em]">
          <ScrubText text="Heard, modelled," /> <ScrubText text="shipped." className="text-[color:var(--blue)]" />
        </h2>

        <div className="mt-14 border border-black/10 bg-white/40 px-4 py-10 sm:px-10">
          <div className="mx-auto aspect-[2.6/1] w-full max-w-[980px]">
            <Loop step={step} reduce={reduce} />
          </div>
          <div className="mx-auto mt-8 max-w-[560px] text-center" aria-live="polite">
            <p className={`${MONO} text-black/45`}>
              {m.n} · {m.stat}
            </p>
            <p className="mt-3 text-[clamp(1.4rem,2.4vw,2rem)] font-bold tracking-[-0.03em]">{m.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-black/65">{m.body}</p>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {METHOD.map((s, i) => (
              <button
                key={s.n}
                type="button"
                onClick={() => {
                  setStep(i);
                  setHeld(true);
                }}
                aria-pressed={step === i}
                aria-label={s.title}
                className={`grid h-10 w-10 place-items-center rounded-full border text-[14px] tabular-nums transition-colors ${step === i ? "border-black bg-black text-white" : "border-black/15 text-black/70 hover:border-black"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Fig n="02" label="The loop: research on one side, code on the other, a system where they cross" className="mt-10 text-black/45" />
        </div>
      </div>
    </section>
  );
}

// ── Kind words: one quote at a time, full bleed and enormous ────────────────

export function KindWords() {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const q = QUOTES[i];
  return (
    <section id="testimonials" className="py-24 sm:py-32" style={{ background: SIGNAL, color: INK }}>
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-6 border-b border-black/25 pb-6">
          <p className={`${MONO} text-black/60`}>Kind words · {q.tag}</p>
          <div className="flex gap-2">
            {QUOTES.map((x, j) => (
              <button
                key={x.name}
                type="button"
                onClick={() => {
                  setI(j);
                  setOpen(false);
                }}
                aria-pressed={i === j}
                className={`grid h-9 w-9 place-items-center rounded-full border text-[13px] tabular-nums ${i === j ? "border-black bg-black text-white" : "border-black/30"}`}
              >
                {j + 1}
              </button>
            ))}
          </div>
        </div>
        <blockquote className="mt-12 text-[clamp(2rem,5.4vw,5.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">
          <ScrubText key={q.name} text={`“${q.short}”`} dim={0.22} />
        </blockquote>
        {open && <p className="mt-8 max-w-[760px] text-[17px] leading-relaxed text-black/80">{q.full}</p>}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-black/25 pt-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- small, local */}
            <img src={q.avatar} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover grayscale" />
            <div>
              <p className="text-[18px] font-bold tracking-[-0.02em]">{q.name}</p>
              <p className="text-[14px] text-black/65">{q.role}</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${MONO} border border-black px-4 py-2.5 hover:bg-black hover:text-white`}>
            {open ? "Show less" : "Read the full note"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── FIG. 03 · Contact: a ground station and its uplink ──────────────────────

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
const subscribeMinute = (cb: () => void) => {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
};
const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};

function Uplink({ reduce }: { reduce: boolean }) {
  return (
    <svg viewBox="0 0 420 420" className="h-full w-full" aria-hidden="true">
      {/* Satellite: body and panels. */}
      <g transform="translate(320 70) rotate(-25)">
        <rect x="-14" y="-10" width="28" height="20" fill="none" stroke="#fff" />
        <rect x="-62" y="-7" width="40" height="14" fill="none" stroke="#fff" />
        <rect x="22" y="-7" width="40" height="14" fill="none" stroke="#fff" />
        {[-52, -42, -32, 32, 42, 52].map((x) => (
          <line key={x} x1={x} y1="-7" x2={x} y2="7" stroke="#fff" strokeOpacity="0.5" />
        ))}
      </g>
      {/* The beam. */}
      <path d="M 108 300 Q 190 130 312 82" fill="none" stroke="#fff" strokeDasharray="3 6" strokeOpacity="0.8">
        {!reduce && <animate attributeName="stroke-dashoffset" from="90" to="0" dur="2.4s" repeatCount="indefinite" />}
      </path>
      {[30, 60, 90].map((r, i) => (
        <circle key={r} cx="320" cy="70" r={r} fill="none" stroke="#fff" strokeOpacity={0.25 - i * 0.07} />
      ))}
      {/* Dish on its mount. */}
      <path d="M 60 318 Q 104 230 162 292" fill="none" stroke="#fff" strokeWidth="1.4" />
      <line x1="111" y1="283" x2="108" y2="300" stroke="#fff" />
      <path d="M 104 300 L 92 360 M 112 300 L 126 360 M 80 360 L 138 360" stroke="#fff" fill="none" />
      <text x="40" y="390" fontSize="12" fontFamily="var(--font-dm-mono), monospace" fill="#fff" opacity="0.65">38.99° N · 76.94° W</text>
      <text x="252" y="148" fontSize="12" fontFamily="var(--font-dm-mono), monospace" fill="#fff" opacity="0.65">YOUR INBOX</text>
    </svg>
  );
}

export function Closing() {
  const reduce = !!useReducedMotion();
  const time = useSyncExternalStore(subscribeMinute, () => timeFmt.format(new Date()), () => "");
  // Telemetry, for fun: how far down the page the visitor has come.
  const metres = useSyncExternalStore(subscribeScroll, () => ((window.scrollY / 96) * 0.0254).toFixed(1), () => "0.0");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const btn = `${MONO} border border-white/40 px-4 py-2.5 text-white transition-colors hover:bg-white hover:text-[color:var(--blue)]`;

  return (
    <footer id="contact" className="overflow-hidden pb-36 pt-24 text-white sm:pb-40 sm:pt-32" style={{ background: BLUE, ["--blue" as string]: BLUE }}>
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-6 border-b border-white/25 pb-6">
          <p className={`${MONO} text-white/60`}>Contact · open to relocation</p>
          <p className={`${MONO} tabular-nums text-white/60`}>Scrolled {metres} m</p>
        </div>

        <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-[clamp(2.8rem,8.6vw,8.8rem)] font-extrabold leading-[0.88] tracking-[-0.055em]">
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
                {copied ? "Copied ✓" : "Copy email"}
              </button>
              <a className={btn} href={`https://mail.google.com/mail/?view=cm&to=${CONTACT.email}`} target="_blank" rel="noopener noreferrer">
                Open Gmail
              </a>
            </div>
          </div>
          <figure className="mx-auto w-full max-w-[420px]">
            <div className="aspect-square">
              <Uplink reduce={reduce} />
            </div>
            <Fig n="03" label="Ground station, College Park" className="mt-2 text-white/55" />
          </figure>
        </div>

        <div className="mt-20 grid gap-8 border-t border-white/25 pt-8 sm:grid-cols-3">
          <div>
            <p className={`${MONO} text-white/55`}>Local time</p>
            <p className="mt-2 text-[22px] font-bold tabular-nums tracking-[-0.02em]">{time || "—"}</p>
            <p className="text-[13px] text-white/60">College Park, MD</p>
          </div>
          <div className="sm:col-span-2">
            <p className={`${MONO} text-white/55`}>Elsewhere</p>
            <ul className="mt-2 flex flex-wrap gap-x-7 gap-y-2">
              {CONTACT.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[22px] font-bold tracking-[-0.02em] underline decoration-white/30 underline-offset-4 hover:decoration-white">
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
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/25 pt-5 font-mono text-[11px] text-white/60">
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
