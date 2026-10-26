"use client";

import { useEffect, useRef, useState } from "react";
import type { Contributions } from "@/lib/contributions";

// Evidence cards for the Index view, in the moodboard's language: a
// sharp-cornered block with one mono line hanging off it. Real data only:
// the grid is the live GitHub calendar, the ledger is counted from the
// Figma files themselves, the research report sums the case studies.

const MONO = "font-mono text-[9.5px] leading-none tracking-[0.01em]";

function Tag({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <span className={`mt-1.5 inline-block max-w-full truncate border border-black/[0.12] bg-white px-1.5 py-[3px] text-black/55 ${MONO}`}>
      <span className="mr-1.5 text-black/35">{tag}</span>
      {children}
    </span>
  );
}

// ── Commit grid ────────────────────────────────────────────────────────────

const WEEKS = 20;
// Empty, then the four GitHub quartiles, in the ledger's blue.
const SHADES = ["#ececec", "#cfd8fb", "#93a7f5", "#5677ef", "#2f4fe0"];

export function CommitGrid({ width }: { width: number }) {
  const [data, setData] = useState<Contributions | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/api/contributions")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Contributions | null) => live && d?.days?.length && setData(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  // No data, no card: an empty grid would argue the opposite.
  if (!data) return null;

  // Whole weeks, Sunday first, ending with the current one.
  const days = data.days;
  const lastSunday = days.length - 1 - new Date(days[days.length - 1].date + "T00:00:00Z").getUTCDay();
  const start = Math.max(0, lastSunday - (WEEKS - 1) * 7);
  const cols: (typeof days)[] = [];
  for (let i = start; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
  const recent = days.slice(start).reduce((s, d) => s + d.count, 0);

  return (
    <a href="https://github.com/pyellapu07" target="_blank" rel="noopener noreferrer" className="block" draggable={false} aria-label={`${data.total} GitHub contributions in the last year`}>
      <span className="block bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06]" style={{ width }}>
        <span className="flex items-start justify-between">
          <span>
            <span className="block text-[17px] leading-tight tracking-[-0.01em] text-black">Contributions</span>
            <span className="mt-1 block text-[11px] text-black/45">GitHub · last 12 months</span>
          </span>
          <span className="text-[34px] font-light leading-none tracking-[-0.03em] text-black tabular-nums">{data.total.toLocaleString("en-US")}</span>
        </span>
        <span className="mt-3.5 flex gap-[3px]">
          {cols.map((col, ci) => (
            <span key={ci} className="flex flex-1 flex-col gap-[3px]">
              {col.map((d) => (
                <span key={d.date} title={`${d.count} on ${d.date}`} className="block aspect-square w-full" style={{ background: SHADES[d.level] ?? SHADES[0] }} />
              ))}
            </span>
          ))}
        </span>
      </span>
      <Tag tag="CODE">{recent.toLocaleString("en-US")} in the last {WEEKS} weeks</Tag>
    </a>
  );
}

// ── Design-system ledger ───────────────────────────────────────────────────

// Counted from each system's Figma file: variables across its collections,
// component sets plus standalone components, variants, and the semantic
// collection's modes. Unnamed on purpose; the fourth predates variables, so
// its foundations are 8 styles.
const SYSTEMS = [
  { name: "01", tokens: 153, components: 15, variants: 1779, themes: 2 },
  { name: "02", tokens: 219, components: 21, variants: 88, themes: 2 },
  { name: "03", tokens: 281, components: 24, variants: 35, themes: 1 },
  { name: "04", tokens: 0, components: 103, variants: 331, themes: 1 },
];
const sum = (k: "tokens" | "components" | "variants" | "themes") => SYSTEMS.reduce((s, x) => s + x[k], 0);

export function SystemLedger({ width }: { width: number }) {
  const variants = sum("variants");
  return (
    <div className="block" aria-label={`${SYSTEMS.length} design systems, ${sum("tokens")} tokens, ${variants} variants`}>
      <span className="block bg-[#3651e6] p-3.5 text-white" style={{ width }}>
        <span className="flex items-start justify-between text-[11px]">
          <span className="uppercase tracking-[0.04em]">Design systems</span>
          <span className="text-right leading-tight">
            <span className="block text-white/70">variants</span>
            <span className="block text-[15px] tabular-nums">{variants.toLocaleString("en-US")}</span>
          </span>
        </span>
        <span className="mt-3 grid grid-cols-4 gap-1.5">
          {SYSTEMS.map((s) => (
            <span key={s.name} className="flex flex-col border-t border-white/30 pt-1.5">
              <span className="text-[8.5px] uppercase tracking-[0.04em] text-white/70">System {s.name}</span>
              <span className="mt-0.5 text-[10.5px] tabular-nums">{s.tokens ? `${s.tokens} tokens` : "8 styles"}</span>
              <span className="text-[10.5px] tabular-nums text-white/70">{s.components} comps</span>
              {/* Bar height: this system's share of all variants. */}
              <span className="mt-2 flex h-[64px] items-end">
                <span className="block w-full bg-[#dfe5ff]" style={{ height: `${Math.max(4, (s.variants / variants) * 100)}%` }} />
              </span>
              <span className="mt-1.5 text-[11px] tabular-nums">{s.variants.toLocaleString("en-US")}</span>
            </span>
          ))}
        </span>
      </span>
      <Tag tag="SYS">
        {SYSTEMS.length} systems · {sum("tokens")} tokens · {sum("components")} components · {sum("themes")} themes
      </Tag>
    </div>
  );
}

// ── Research report ────────────────────────────────────────────────────────

// Summed from the case studies, unnamed. Participants: 127 survey responses
// and 8 interviews in one study, 8 interviews in another (its co-design
// sessions reused 5 of them). Hours: three workflows measured before and
// after, per run: 48 h to 12 min, 4 h to 12 min, 25 h to 2 h.
const PARTICIPANTS = 127 + 8 + 8;
const HOURS_BEFORE = 48 + 4 + 25;
const HOURS_AFTER = 0.2 + 0.2 + 2;
const DROP_AT = 0.46;

/** The before/after hours as a step, printed as a halftone: dots swell under
 *  the line and stay pin-sized above it, like a screen-printed chart. */
function Halftone({ width, height }: { width: number; height: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = width * dpr;
    c.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#c6ec3a";
    ctx.fillRect(0, 0, width, height);
    const top = height * 0.14;
    const level = (x: number) => {
      // Ease over a short span so the drop reads as a cliff, not a wall.
      const k = Math.min(1, Math.max(0, (x - DROP_AT) / 0.06));
      const e = k * k * (3 - 2 * k);
      const v = HOURS_BEFORE + (HOURS_AFTER - HOURS_BEFORE) * e;
      return height - (v / HOURS_BEFORE) * (height - top);
    };
    // Seeded jitter, so the print is the same on every visit.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const P = 4;
    for (let y = P / 2; y < height; y += P) {
      for (let x = P / 2; x < width; x += P) {
        const under = y > level(x / width);
        const depth = under ? Math.min(1, (y - level(x / width)) / 18) : 0;
        const r = under ? 0.9 + 1.0 * depth * (0.75 + 0.25 * rand()) : 0.55;
        ctx.fillStyle = under ? "#6f9a0e" : "#a9d12c";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [width, height]);
  return <canvas ref={ref} aria-hidden="true" className="block" style={{ width, height }} />;
}

export function ResearchReport({ width }: { width: number }) {
  const cut = Math.round(HOURS_BEFORE - HOURS_AFTER);
  return (
    <div className="block" aria-label={`Research: ${PARTICIPANTS} participants; manual work cut from ${HOURS_BEFORE} to ${HOURS_AFTER} hours per run`}>
      <span className="block bg-white ring-1 ring-black/[0.06]" style={{ width }}>
        <span className="block border-b border-black/[0.06] px-3.5 py-2 text-[11px] text-black/55">Research report</span>
        <span className="flex justify-between gap-3 px-3.5 pb-3.5 pt-3">
          <span>
            <span className="block text-[9px] uppercase tracking-[0.06em] text-black/50">Mixed methods, measured</span>
            <span className="mt-1 block text-[21px] leading-[1.08] tracking-[-0.015em] text-black">
              Heard, then
              <br />
              measured
            </span>
          </span>
          <span className="shrink-0 text-[10.5px] leading-tight text-black/50">
            <span className="block">Participants</span>
            <span className="block text-[19px] tabular-nums text-black">{PARTICIPANTS}</span>
            <span className="mt-1.5 block">Hours cut per run</span>
            <span className="block text-[19px] tabular-nums text-black">{cut}</span>
          </span>
        </span>
        <span className="relative block">
          <Halftone width={width} height={112} />
          <span className="absolute left-2.5 top-1.5 font-mono text-[9px] text-[#3d5a00]">{HOURS_BEFORE} h</span>
          <span className="absolute bottom-1.5 right-2.5 font-mono text-[9px] text-[#3d5a00]">{HOURS_AFTER} h</span>
        </span>
      </span>
      <Tag tag="RSRCH">
        {HOURS_BEFORE} h → {HOURS_AFTER} h of manual work · {Math.round((1 - HOURS_AFTER / HOURS_BEFORE) * 100)}% cut
      </Tag>
    </div>
  );
}
