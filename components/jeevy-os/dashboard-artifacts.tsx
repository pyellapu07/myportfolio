/**
 * Artifacts for Engine 06, the deliverables map and milestones dashboard.
 *
 * Unboxed on the same rule the rest of this language follows: a container
 * earns a border only when the container is the specimen. Here the colours
 * are carried by the type, so a tinted card behind each one would be
 * decoration. The one exception is the taped note, where the paper IS the
 * artifact.
 *
 * Contrast figures in the comments were computed against the page canvas
 * (#040D16), not transcribed.
 */

/* ── Four-tier node hierarchy ────────────────────────────────── */

interface Tier {
  level: string;
  name: string;
  /** The surface the node actually paints, described rather than swatched. */
  surface: string;
  hex: string;
  body: string;
}

/**
 * Type colours clear the 4.5:1 AA floor on the canvas: orange 5.49,
 * green 5.93, slate 7.62, azure 9.12.
 *
 * The level three slate is lightened from the product's #64748B, which
 * measures 4.11 and fails as type. The node's real surface fills are named
 * in the copy instead, since a near-black fill cannot be shown as a word.
 */
const TIERS: Tier[] = [
  {
    level: "Level 1",
    name: "Project root",
    surface: "Solid orange card",
    hex: "#EA580C",
    body: "Top-level program identification across a multi-skid aerospace package. One per project, and the only node that cannot be re-parented.",
  },
  {
    level: "Level 2",
    name: "Workstream",
    surface: "Solid green node",
    hex: "#16A34A",
    body: "A major physical build program, carrying a live count of the leaf nodes beneath it so a coordinator can judge its weight without expanding it.",
  },
  {
    level: "Level 3",
    name: "Parent group",
    surface: "Slate header",
    hex: "#94A3B8",
    body: "An assembly folder holding timeline constraints, a rollup fraction computed from its children, and any exception flags raised underneath it.",
  },
  {
    level: "Level 4",
    name: "Task operation",
    surface: "Graphite card",
    hex: "#38BDF8",
    body: "The executable unit: a split-grid card with assignee, date window, a completion fraction, and a presence dot showing recent floor activity.",
  },
];

export function NodeTierLegend() {
  return (
    <div className="mx-auto my-12 max-w-[840px] space-y-6 border-t border-white/[0.08] px-4 pt-6">
      <div className="text-[12px] font-medium text-neutral-400">
        Four-tier deliverables node hierarchy · spatial architecture
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-4">
        {TIERS.map((t) => (
          <div key={t.level}>
            <div className="text-[12px] text-neutral-400">{t.level}</div>
            <div className="mt-1 text-[14px] font-medium" style={{ color: t.hex }}>
              {t.name}
            </div>
            <div className="mt-0.5 text-[12px] text-neutral-400">{t.surface}</div>
            <p className="mt-2 text-[14px] leading-[22px] text-neutral-400">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Slack thread ────────────────────────────────────────────── */

export interface ThreadMessage {
  author: string;
  hex: string;
  time: string;
  body: string;
  /** Replies sit indented behind a hairline, as they do in the source. */
  reply?: boolean;
}

/**
 * A transcribed thread rather than a screenshot: it stays on the page's type
 * scale, stays selectable, and leaves the unrelated direct-message traffic
 * around it out of a public portfolio.
 */
export function SlackThread({
  header,
  date,
  messages,
}: {
  header: string;
  date: string;
  messages: ThreadMessage[];
}) {
  return (
    <div className="mx-auto my-12 max-w-[720px] space-y-6 border-t border-white/[0.08] px-6 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="text-[12px] font-medium text-neutral-400">{header}</div>
        <div className="text-[12px] text-neutral-400">{date}</div>
      </div>

      <div className="space-y-6">
        {messages.map((m) => (
          <div
            key={m.author + m.time}
            className={m.reply ? "border-l border-white/[0.12] pl-6" : undefined}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[14px] font-medium" style={{ color: m.hex }}>
                {m.author}
              </span>
              <span className="text-[12px] text-neutral-400">{m.time}</span>
            </div>
            <p className="mt-1 text-[14px] leading-[22px] text-neutral-300">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
