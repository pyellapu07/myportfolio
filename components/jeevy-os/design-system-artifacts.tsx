/**
 * Tactile artifacts for Engine 04, the industrial design system.
 *
 * The surface ladder itself lives in editorial.tsx, where the row background
 * paints its own token. What stays here is everything that is specific to
 * this engine: the bright pairs, the glove contract, the release tiers, and
 * the retrospective.
 *
 * Every ratio and L* figure below was computed from the shipped hex, not
 * transcribed. The page claims accessibility rigour, so a transcribed number
 * would be the one error the reader is most entitled to catch.
 */

/* ── Semantic bright pairs ────────────────────────── */

/**
 * Ratios are the bright token measured on bg-chrome, the "on navy" figure the
 * token sheet quotes. Computed from the shipped hex, not transcribed.
 *
 * Deliberately unboxed: the colour is carried by the type, so a tinted card
 * behind it would only lower the contrast it exists to demonstrate.
 */
interface Pair {
  intent: string;
  label: string;
  hex: string;
  ratio: string;
}

const PAIRS: Pair[] = [
  { intent: "Primary brand", label: "Link", hex: "#D97352", ratio: "6.07:1 on navy" },
  { intent: "Success / QC", label: "Sage", hex: "#6FA894", ratio: "7.17:1 on navy" },
  { intent: "Warning / hold", label: "Amber", hex: "#F2BD66", ratio: "11.40:1 on navy" },
  { intent: "Error / blocker", label: "Rust", hex: "#E08A6E", ratio: "7.47:1 on navy" },
];

/** Sage bright, not the #4E8775 fill: the fill is 4.70:1 at 12px, which is thin. */
const SAGE_BRIGHT = "#6FA894";

export function BrightPairMatrix() {
  return (
    <div className="mx-auto my-12 max-w-[720px] space-y-4 border-t border-white/[0.08] px-6 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="text-[12px] font-medium text-neutral-400">
          Semantic bright-pair token matrix · DHS Trusted Tester verified (WCAG 2.1 AA)
        </div>
        <div className="font-mono text-[12px]" style={{ color: SAGE_BRIGHT }}>
          0 contrast failures
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-4">
        {PAIRS.map((p) => (
          <div key={p.intent}>
            <div className="text-[12px] text-neutral-400">{p.intent}</div>
            <div className="mt-1 text-[14px] font-medium" style={{ color: p.hex }}>
              {p.label} {p.hex}
            </div>
            <div className="mt-0.5 text-[12px] tabular-nums text-neutral-400">{p.ratio}</div>
          </div>
        ))}
      </div>

      <p className="text-[14px] leading-[22px] text-neutral-400">
        Every intent ships twice: a solid fill governs containers, a brightened variant governs
        type. The rule exists because the fills fail as type. Success fill #228573 lands at 4.35:1
        on navy and brand fill #9C3B22 at 2.85:1, so both are barred from carrying a label.
      </p>
    </div>
  );
}

/* ── Glove touch contract ────────────────────────────────────── */

const ROW_X = 140;
const ROW_W = 520;
const ROW_Y = 32;
const ROW_H = 44;

const BTN_W = 96;
const BTN_H = 28;
const BTN_X = ROW_X + ROW_W - 16 - BTN_W;
const BTN_Y = ROW_Y + (ROW_H - BTN_H) / 2;

/** Rejected variant: a 40px control cannot fit a 44px row, so the row grows. */
const ROW2_Y = 140;
const ROW2_H = 56;
const BTN2_H = 40;
const BTN2_Y = ROW2_Y + (ROW2_H - BTN2_H) / 2;

const BRAND = "#D97352";
const ROW_FILL = "#122033";
const HAIRLINE = "rgba(255,255,255,0.10)";
const DIM = "#85919E";
const MUTED = "#9CA3AF";

/** Vertical dimension line with end ticks, drawn at true scale. */
const VDim = ({ x, y1, y2 }: { x: number; y1: number; y2: number }) => (
  <g stroke={DIM} strokeWidth={1}>
    <line x1={x} y1={y1} x2={x} y2={y2} />
    <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} />
    <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} />
  </g>
);

export function GloveTouchContract() {
  return (
    <svg
      viewBox="0 0 928 244"
      className="h-auto w-full"
      role="img"
      aria-label="Two table rows drawn to scale. In the locked variant, a 28 pixel tall secondary button sits centred inside a 44 pixel invisible hit area that exactly fills the 44 pixel row height, so touch accessibility costs no vertical space. In the rejected variant, a 40 pixel button forces the row to grow to 56 pixels, adding 27 percent to every row in a dense table."
    >
      {/* ── locked variant ── */}
      <text x={ROW_X} y={16} fill={MUTED} fontSize={12}>
        Locked: 28px control inside a 44px hit target, row height unchanged
      </text>

      <rect
        x={ROW_X}
        y={ROW_Y}
        width={ROW_W}
        height={ROW_H}
        fill={ROW_FILL}
        stroke={HAIRLINE}
        strokeWidth={1}
      />
      <text x={ROW_X + 16} y={ROW_Y + 27} fill="#D8DCE2" fontSize={14}>
        8&quot; Skid Piping Package
      </text>
      <text x={ROW_X + 260} y={ROW_Y + 27} fill={MUTED} fontSize={14}>
        In Fabrication
      </text>

      {/* the ::after boundary, drawn because it is otherwise invisible */}
      <rect
        x={BTN_X - 8}
        y={ROW_Y}
        width={BTN_W + 16}
        height={ROW_H}
        fill={BRAND}
        fillOpacity={0.12}
        stroke={BRAND}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <rect
        x={BTN_X}
        y={BTN_Y}
        width={BTN_W}
        height={BTN_H}
        rx={4}
        fill="none"
        stroke={BRAND}
        strokeWidth={1}
      />
      <text x={BTN_X + BTN_W / 2} y={BTN_Y + 18} fill={BRAND} fontSize={12} textAnchor="middle">
        View details
      </text>

      <VDim x={ROW_X - 20} y1={ROW_Y} y2={ROW_Y + ROW_H} />
      <text x={ROW_X - 32} y={ROW_Y + 26} fill={MUTED} fontSize={12} textAnchor="end">
        44px hit target
      </text>

      <VDim x={ROW_X + ROW_W + 20} y1={BTN_Y} y2={BTN_Y + BTN_H} />
      <text x={ROW_X + ROW_W + 32} y={BTN_Y + 18} fill={MUTED} fontSize={12}>
        28px visible control
      </text>

      {/* ── rejected variant ── */}
      <text x={ROW_X} y={124} fill={MUTED} fontSize={12}>
        Rejected: a 40px control forces every row to 56px, a 27% height cost
      </text>

      <rect
        x={ROW_X}
        y={ROW2_Y}
        width={ROW_W}
        height={ROW2_H}
        fill={ROW_FILL}
        stroke={HAIRLINE}
        strokeWidth={1}
      />
      <text x={ROW_X + 16} y={ROW2_Y + 33} fill="#D8DCE2" fontSize={14}>
        8&quot; Skid Piping Package
      </text>
      <text x={ROW_X + 260} y={ROW2_Y + 33} fill={MUTED} fontSize={14}>
        In Fabrication
      </text>
      <rect
        x={BTN_X}
        y={BTN2_Y}
        width={BTN_W}
        height={BTN2_H}
        rx={4}
        fill="none"
        stroke={DIM}
        strokeWidth={1}
      />
      <text x={BTN_X + BTN_W / 2} y={BTN2_Y + 24} fill={DIM} fontSize={12} textAnchor="middle">
        View details
      </text>

      <VDim x={ROW_X - 20} y1={ROW2_Y} y2={ROW2_Y + ROW2_H} />
      <text x={ROW_X - 32} y={ROW2_Y + 32} fill={MUTED} fontSize={12} textAnchor="end">
        56px row
      </text>

      <text x={ROW_X} y={228} fill={MUTED} fontSize={12}>
        The hit area is a pseudo-element, so it expands the target without entering layout.
      </text>
    </svg>
  );
}

/* ── Release tier governance ─────────────────────────────────── */

interface Tier {
  tier: string;
  cadence: string;
  breaking: string;
  authority: string;
  rationale: string;
}

const TIERS: Tier[] = [
  {
    tier: "Major (1.0.0)",
    cadence: "Semi-annual, two scheduled windows a year",
    breaking: "Yes",
    authority: "Visual Design Lead, with a migration timeline",
    rationale:
      "Spaced deliberately to minimise breaking-change friction across engineering teams. Breaking changes land only inside these windows, never ad hoc.",
  },
  {
    tier: "Minor (0.1.0)",
    cadence: "Monthly",
    breaking: "No",
    authority: "Design Lead sign-off",
    rationale:
      "Net-new standalone components and backward-compatible token expansions accumulate through the month and ship together, so consuming teams integrate once per cycle.",
  },
  {
    tier: "Patch (0.0.1)",
    cadence: "Bi-weekly, continuous",
    breaking: "No",
    authority: "Any core contributor",
    rationale:
      "Critical fixes ride the 14-day audit sweep: whatever the sweep flags is corrected and released inside the same cycle.",
  },
];

const TIER_TONE: Record<string, string> = {
  "Major (1.0.0)": "#E08A6E",
  "Minor (0.1.0)": "#F2BD66",
  "Patch (0.0.1)": SAGE_BRIGHT,
};

export function ReleaseTierTable() {
  return (
    <div className="mx-auto my-16 max-w-[960px] px-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              {["Release tier", "Cadence", "Breaking", "Approval authority", "Governance rationale"].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className="border-b border-white/10 pb-3 pr-6 align-bottom text-[12px] font-medium text-neutral-400"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((t) => (
              <tr key={t.tier} className="align-top">
                <th
                  scope="row"
                  className="border-b border-white/[0.06] py-5 pr-6 font-mono text-[14px] font-medium leading-[22px]"
                  style={{ color: TIER_TONE[t.tier] }}
                >
                  {t.tier}
                </th>
                <td className="border-b border-white/[0.06] py-5 pr-6 text-[14px] leading-[22px] text-neutral-300">
                  {t.cadence}
                </td>
                <td className="border-b border-white/[0.06] py-5 pr-6 text-[14px] leading-[22px] text-neutral-400">
                  {t.breaking}
                </td>
                <td className="border-b border-white/[0.06] py-5 pr-6 text-[14px] leading-[22px] text-neutral-400">
                  {t.authority}
                </td>
                <td className="border-b border-white/[0.06] py-5 text-[14px] leading-[22px] text-neutral-400">
                  {t.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Retrospective anti-patterns ─────────────────────────────── */

interface AntiPattern {
  fault: string;
  /** The invariant, compressed to the shape it takes in the codebase. */
  tag: string;
  body: string;
}

const ANTI_PATTERNS: AntiPattern[] = [
  {
    fault: "The glowing card mistake",
    tag: "#1C2840 → #122033",
    body: "Resting cards at #1C2840 (L* 16.18) were brighter than the hover token at L* 14.92, so cards dimmed under the cursor instead of lifting. Recalibrated bg-elevated to #122033 and bg-hover to #17263C, restoring monotonic lightness and letting cards lean on a 1px sand stroke.",
  },
  {
    fault: "Button sizing in tables",
    tag: "40px → 28px Small",
    body: "40px buttons bloated every table row and broke vertical rhythm. Table actions are locked to the 28px Small variant, backed by an invisible 44px hit-target boundary.",
  },
  {
    fault: "Context and layout thrashing",
    tag: "Inline tray → 340px popover",
    body: "Clicking cross-project dependencies pushed table rows down and broke column alignment. External items moved into an anchored 340px popover, which also removed an invalid nested button from the DOM.",
  },
  {
    fault: "Geometry drift",
    tag: "0px / 4px / 9999px",
    body: "Competing 0px, 4px and 6px values replaced with a three-tier contract: 0px for structural shells, 4px for interactive controls, 9999px for passive status pills.",
  },
  {
    fault: "The monospace temptation",
    tag: "Inter / Aspekta stack",
    body: "Monospace had spread decoratively across plain words. Human text unified on the Inter and Aspekta stack, isolating monospace to numeric steppers, where it prevents digit jitter, and to keyboard shortcuts.",
  },
  {
    fault: "Toolbar crowding",
    tag: "8px space-2 grid",
    body: "2px gaps jammed 1px hairlines together into muddy bars. Toolbar spacing standardised to an 8px grid with icon buttons locked to an exact 32 by 32px square.",
  },
  {
    fault: "Functional motion",
    tag: "360° SVG spin · aria-busy",
    body: "Silent re-fetching made operators double-click. A 360 degree mechanical SVG spin now binds to aria-busy=\"true\" and respects prefers-reduced-motion.",
  },
];

export function RetrospectiveAntiPatterns() {
  return (
    <div className="mx-auto my-12 max-w-[720px] divide-y divide-white/[0.08] px-6">
      {ANTI_PATTERNS.map((a, i) => (
        <div key={a.fault} className="space-y-2 py-6 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-[18px] font-semibold tracking-tight text-white">
              {i + 1}. {a.fault}
            </h3>
            <span className="font-mono text-[12px] text-neutral-400">{a.tag}</span>
          </div>
          <p className="text-[14px] font-normal leading-[22px] text-neutral-400">{a.body}</p>
        </div>
      ))}
    </div>
  );
}
