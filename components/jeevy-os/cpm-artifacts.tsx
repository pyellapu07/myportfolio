/**
 * Artifacts for Engine 05, the tasking and critical path engine.
 *
 * Unboxed throughout, on the rule this language already follows: a container
 * earns its border only when the container is the specimen. Here the colour
 * is carried by the type and the maths is carried by the type, so a tinted
 * card behind either would be decoration.
 *
 * Every contrast figure in the comments was computed against bg-chrome
 * (#040D16), not transcribed.
 */

/* ── Gantt status lifecycle ──────────────────────────────────── */

interface StatusState {
  state: string;
  name: string;
  /** What the colour means on the floor, in the words a coordinator would use. */
  meaning: string;
  /** null renders in neutral-300: pending has no hue by design. */
  hex: string | null;
}

/**
 * Contrast on the page canvas, all clearing the 4.5:1 AA floor for normal
 * text: azure 9.12, purple 4.62, amber 11.40, patina sage 4.70, crimson 7.47.
 *
 * Purple and patina sage are the two tightest. Both stay at their shipped
 * values rather than being brightened for this page, because the point of
 * the legend is to report the colours the product uses, not flattering
 * variants of them.
 */
const STATES: StatusState[] = [
  { state: "Pending", name: "Gray", meaning: "Neutral soft", hex: null },
  { state: "In progress", name: "Azure blue", meaning: "Active work", hex: "#38BDF8" },
  { state: "Material stalled", name: "Status purple", meaning: "Waiting on parts", hex: "#8B5CF6" },
  { state: "Review", name: "Warm amber", meaning: "QC sign-off", hex: "#F2BD66" },
  { state: "Completed", name: "Patina sage", meaning: "Verified complete", hex: "#4E8775" },
  { state: "Critical path", name: "Crimson rust", meaning: "Negative float", hex: "#E08A6E" },
];

export function GanttStatusLegend() {
  return (
    <div className="mx-auto my-12 max-w-[840px] space-y-4 border-t border-white/[0.08] px-4 pt-6">
      <div className="text-[12px] font-medium text-neutral-400">
        Gantt status lifecycle state machine · token mapping
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-6">
        {STATES.map((s) => (
          <div key={s.state}>
            <div className="text-[12px] text-neutral-400">{s.state}</div>
            <div
              className="mt-1 text-[14px] font-medium"
              style={s.hex ? { color: s.hex } : undefined}
            >
              <span className={s.hex ? undefined : "text-neutral-300"}>{s.name}</span>
            </div>
            <div className="mt-0.5 text-[12px] text-neutral-400">{s.meaning}</div>
          </div>
        ))}
      </div>

      <p className="text-[14px] leading-[22px] text-neutral-400">
        Purple is the one hue with a hard reservation: it means material, and nothing else. It
        appears on the package micro-badge, the PO indicator, and the stalled bar, so a coordinator
        scanning a wall-mounted timeline can find every material blocker without reading a word.
      </p>
    </div>
  );
}

/* ── Drawer material card states ─────────────────────────────── */

interface CardState {
  label: string;
  indicator: string;
  hex: string;
  body: string;
}

const CARD_STATES: CardState[] = [
  {
    label: "Requirement met",
    indicator: "2/2",
    hex: "#6FA894",
    body: "Full quantity verified against warehouse inventory. The task carries no material floor, so its earliest start falls back to its predecessor and calendar constraints.",
  },
  {
    label: "Partially received",
    indicator: "1/2",
    hex: "#F2BD66",
    body: "An in-transit indicator showing the outstanding quantity and the vendor ETA. The floor holds at the ETA of the last outstanding line, not the first.",
  },
  {
    label: "Slipped delivery",
    indicator: "ETA moved",
    hex: "#E08A6E",
    body: "The revised vendor ETA with the superseded baseline struck through beside it. A coordinator can attribute the slip to a vendor without opening the purchase order.",
  },
];

export function MaterialCardStates() {
  return (
    <div className="mx-auto my-12 max-w-[720px] divide-y divide-white/[0.08] px-6">
      {CARD_STATES.map((c) => (
        <div key={c.label} className="space-y-2 py-6 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-[18px] font-semibold tracking-tight" style={{ color: c.hex }}>
              {c.label}
            </h3>
            <span className="text-[12px] tabular-nums text-neutral-400">
              {c.indicator}
            </span>
          </div>
          <p className="text-[14px] font-normal leading-[22px] text-neutral-400">{c.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ── 31-file pilot migration findings ────────────────────────── */

interface PilotFix {
  fault: string;
  /** The invariant, compressed to the shape it takes in the codebase. */
  tag: string;
  body: string;
}

/**
 * The faults the Tasking module surfaced while it was serving as the
 * production pilot for Design System v1.0.0. Unboxed, and set apart from the
 * Engine 04 retrospective by scope: these are the three that only a dense
 * live surface could have exposed.
 */
const PILOT_FIXES: PilotFix[] = [
  {
    fault: "The glowing card",
    tag: "Rest surface lowered",
    body: "Resting overview cards sat too bright, rendering as an array of glowing blue slabs that washed out the conflict warnings sitting on top of them. Worse, rest was brighter than hover, so a card dimmed when you pointed at it. Recalibrating the resting surface one step darker restored a natural lightness ladder and let cards lean on a crisp 1px sand border instead of on brightness.",
  },
  {
    fault: "Table row bloat",
    tag: "40px to 28px actions",
    body: "Large 40px action buttons inflated dense data rows and broke the vertical scanning rhythm down the column. Row actions were standardised to the 28px small variant, backed by an invisible 44px hit boundary so the density costs a gloved operator nothing.",
  },
  {
    fault: "Decorative monospace",
    tag: "Numeric steppers only",
    body: "Fixed-width type had spread across ordinary interface copy as a texture rather than a signal. Human reading unified on the sans-serif stack, with fixed-width formatting isolated to numeric steppers, where equal digit widths stop the number jittering as a count changes.",
  },
];

export function PilotMigrationFindings() {
  return (
    <div className="mx-auto my-12 max-w-[720px] divide-y divide-white/[0.08] px-6">
      {PILOT_FIXES.map((f) => (
        <div key={f.fault} className="space-y-2 py-6 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-[18px] font-semibold tracking-tight text-white">{f.fault}</h3>
            <span className="text-[12px] text-neutral-400">{f.tag}</span>
          </div>
          <p className="text-[14px] font-normal leading-[22px] text-neutral-400">{f.body}</p>
        </div>
      ))}
    </div>
  );
}
