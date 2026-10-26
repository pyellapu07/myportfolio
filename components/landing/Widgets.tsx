"use client";

import { useEffect, useState } from "react";
import type { Contributions } from "@/lib/contributions";

// Evidence cards for the Index view, in the moodboard's language: a
// sharp-cornered block with one mono line hanging off it. Real data only:
// the grid is the live GitHub calendar, the ledger is counted from the
// Figma files themselves.

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
