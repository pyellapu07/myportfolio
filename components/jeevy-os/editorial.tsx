import Image from "next/image";
import Link from "next/link";

/**
 * Shared editorial primitives for the Jeevy OS case study and its deep dives.
 *
 * One measure, one type scale, one link treatment across every page:
 *   28px semibold white: titles and section breaks
 *   18px neutral-300: all body copy
 *   14px neutral-400: captions and metadata (neutral-500 lands at 4.12:1 here, under AA)
 *   12px mono neutral-400: eyebrows and breadcrumbs
 *
 * Text sits directly on the canvas. Nothing here draws a card.
 */

export const CANVAS = "#040D16";
export const ACCENT = "#D97352";
export const ACCENT_BRIGHT = "#F2805B";

/** Prose measure: images share it so both hold one left and right edge. */
export const Prose = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`mx-auto max-w-[720px] px-6 ${className}`}>{children}</div>;

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[18px] font-normal leading-[28px] tracking-[-0.01em] text-neutral-300">
    {children}
  </p>
);

export const H2 = ({ children, id }: { children: React.ReactNode; id?: string }) => (
  <h2 id={id} className="text-[28px] font-semibold leading-tight tracking-tight text-white">
    {children}
  </h2>
);

export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">{children}</p>
);

export const Caption = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-2 text-[14px] font-normal leading-relaxed text-neutral-400">{children}</p>
);

/**
 * Inline code: token names, file paths, selectors.
 *
 * Size is inherited rather than set. A bare <code> falls back to the browser
 * monospace default, which lands near 15px inside 18px body copy and puts a
 * fifth size on a page that only has four.
 */
export const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="font-mono text-[1em] text-white">{children}</code>
);

/**
 * Colour classes are written out literally, never interpolated: Tailwind
 * scans source text, so a `text-[${VAR}]` would be purged and the hover lost.
 */
const LINK_BASE =
  "inline-flex items-center gap-1.5 text-[#D97352] underline underline-offset-4 transition-colors hover:text-[#F2805B]";

export const GhostLink = ({
  href,
  children,
  size = 18,
}: {
  href: string;
  children: React.ReactNode;
  size?: 14 | 18;
}) => (
  <Link
    href={href}
    className={`${LINK_BASE} ${
      size === 18 ? "text-[18px] leading-[28px] tracking-[-0.01em]" : "text-[14px] leading-relaxed"
    }`}
  >
    {children}
  </Link>
);

/** Breakout measure: figures and editorial primitives that outrun the prose. */
export const Wide = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`mx-auto max-w-[960px] px-4 ${className}`}>{children}</div>;

/**
 * Figure measures:
 *   full: 960px breakout, for wide tables, hero photos, and diagrams
 *   prose: shares the 720px text edge
 *   compact: 380/420px, for popovers and dropdown crops that would turn to
 *             mush if stretched across the page
 */
export type FigureSize = "full" | "prose" | "compact";

export function Figure({
  src,
  alt,
  caption,
  ratio,
  width,
  height,
  size = "full",
  priority,
}: {
  src: string;
  alt: string;
  caption: string;
  /** Crop to this ratio: photographs only. */
  ratio?: string;
  /** Intrinsic dimensions: for UI screenshots, so nothing is cropped away. */
  width?: number;
  height?: number;
  size?: FigureSize;
  priority?: boolean;
}) {
  const compact = size === "compact";
  const frame = compact
    ? "w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/40"
    : "w-full overflow-hidden rounded-xl border border-white/10";
  const Shell = size === "prose" ? Prose : Wide;
  const inner = compact ? "mx-auto max-w-[380px] md:max-w-[420px]" : "";
  /**
   * `sizes` must describe the box the image actually occupies. If it under-
   * reports, Next picks a too-small variant and the browser upscales it,
   * which reads as a blurry screenshot rather than as a layout bug.
   */
  const sizes =
    size === "prose"
      ? "(max-width: 720px) 100vw, 720px"
      : compact
        ? "(max-width: 420px) 100vw, 420px"
        : "(max-width: 960px) 100vw, 960px";
  return (
    <figure className="my-16">
      <Shell>
        <div className={inner}>
        {width && height ? (
          // Screenshots render at their own aspect ratio: cropping a UI cuts
          // off real interface, which a caption cannot explain away.
          <div className={frame}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes={sizes}
              quality={90}
              className="h-auto w-full"
              priority={priority}
            />
          </div>
        ) : (
          <div className={`relative ${frame} ${ratio}`}>
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover"
              priority={priority}
            />
          </div>
        )}
          <figcaption>
            <Caption>{caption}</Caption>
          </figcaption>
        </div>
      </Shell>
    </figure>
  );
}

/**
 * Two figures side by side across the breakout measure: for paired modal
 * crops and step-by-step screens that read as one beat.
 *
 * Images keep their intrinsic ratios, so a taller crop sits lower than a
 * wider one. Each caption anchors to its own image rather than to a shared
 * baseline, which is correct: they are separate statements.
 */
export function FigureRow({
  items,
}: {
  items: { src: string; alt: string; caption: string; width: number; height: number }[];
}) {
  return (
    <div className="my-16">
      <Wide>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {items.map((it) => (
            <figure key={it.src}>
              <div className="w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={it.src}
                  alt={it.alt}
                  width={it.width}
                  height={it.height}
                  sizes="(max-width: 768px) 100vw, 460px"
                  quality={90}
                  className="h-auto w-full"
                />
              </div>
              <figcaption>
                <Caption>{it.caption}</Caption>
              </figcaption>
            </figure>
          ))}
        </div>
      </Wide>
    </div>
  );
}

/* ── Industrial signal palette ─────────────────────────────────
   Desaturated shop tones, deliberately not primaries: a saturated
   red/amber/green triad reads as a status dashboard, which is the
   opposite of what these pages are. */

export const SIGNAL = {
  /** Fatal blocker or vulnerability. */
  rust: "#C25E43",
  /** Operational friction or latency. */
  sand: "#D4A373",
  /** Validated floor requirement. */
  sage: "#4E8775",
} as const;

export type SignalTone = keyof typeof SIGNAL;

/* ── Dot-coded matrix ──────────────────────────────────────────
   Workshop synthesis as a 2x2 of findings, each topped by a cluster of
   hand-stamped ink dots. No fills and no card: hairlines and dot weight
   carry the structure.

   Every offset, tilt and colour class is written out literally in the
   caller's data. Tailwind scans source text, so a computed class name
   would be purged and the dots would land in a neat, lifeless row. */

export interface InkDotSpec {
  tone: SignalTone;
  /** Literal Tailwind classes, never interpolated. */
  dx: string;
  dy: string;
  rotate: string;
  /** Slight scale variation, so no two stamps are the same weight. */
  size?: string;
}

export interface MatrixBlock {
  title: string;
  description: string;
  dots: readonly InkDotSpec[];
  /**
   * Whether neighbouring stamps bleed into each other. Set per block rather
   * than derived from grid index: the grid collapses to one column on mobile,
   * so an index rule would silently change which clusters overlap.
   */
  overlap?: boolean;
}

const DOT_BG: Record<SignalTone, string> = {
  rust: "bg-[#C25E43]",
  sand: "bg-[#D4A373]",
  sage: "bg-[#4E8775]",
};

/** One marker dot. The lopsided radius is what stops it reading as a bullet. */
const InkDot = ({
  tone,
  dx,
  dy,
  rotate,
  size = "w-3.5 h-3.5",
  overlap = false,
}: InkDotSpec & { overlap?: boolean }) => (
  <span
    aria-hidden
    className={`inline-block ${size} rounded-[48%_52%_49%_51%] opacity-90 shadow-sm ${DOT_BG[tone]} ${dx} ${dy} ${rotate} ${overlap ? "-ml-1" : ""}`}
    style={{ filter: "contrast(1.05)" }}
  />
);

const MATRIX_LEGEND: { tone: SignalTone; label: string }[] = [
  { tone: "rust", label: "Critical blocker" },
  { tone: "sand", label: "Operational friction" },
  { tone: "sage", label: "Floor requirement" },
];

export function DotCodedMatrix({
  title,
  blocks,
}: {
  title: string;
  blocks: readonly MatrixBlock[];
}) {
  return (
    <div className="mx-auto my-14 max-w-[840px] border-t border-white/[0.08] px-4 pt-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-8">
        <div className="text-[12px] font-medium text-neutral-400">{title}</div>
        <ul className="flex flex-wrap items-center gap-5 text-[12px] text-neutral-400">
          {MATRIX_LEGEND.map((l) => (
            <li key={l.tone} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SIGNAL[l.tone] }}
              />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        {blocks.map((b) => (
          <div key={b.title} className="space-y-3">
            <div className={`flex h-6 items-center pl-1 ${b.overlap === false ? "gap-1.5" : ""}`}>
              {b.dots.map((d, i) => (
                <InkDot
                  key={`${d.tone}-${i}`}
                  {...d}
                  overlap={i > 0 && b.overlap !== false}
                />
              ))}
            </div>
            <div className="text-[18px] font-semibold leading-snug tracking-tight text-white">
              {b.title}
            </div>
            <p className="text-[14px] font-normal leading-[22px] text-neutral-400">
              {b.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Taped sketch frame ────────────────────────────────────────
   A hand sketch pinned to the page the way it was pinned to a wall, with
   a strip of masking tape over the top edge.
   The tape overlaps the frame rather than floating above it, so the
   wrapper must not clip. */

export function TapedSketchFrame({
  src,
  alt,
  width,
  height,
  annotation,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  annotation: string;
}) {
  return (
    <div className="my-16">
      <Wide>
        <figure className="mx-auto max-w-[420px]">
          <div className="relative">
            {/* A real torn-tape cut-out rather than a CSS rectangle. Sits low
                enough to actually hold the sketch down, and is decorative, so
                it stays out of the accessibility tree and ignores pointers. */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-10 w-40 -translate-x-1/2 -translate-y-[30%] -rotate-[2.6deg]"
            >
              <Image
                src="/jeevy/tape-yellow.webp"
                alt=""
                width={712}
                height={350}
                sizes="160px"
                className="h-auto w-full"
              />
            </div>
            <div className="overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                sizes="(max-width: 420px) 100vw, 420px"
                quality={90}
                className="h-auto w-full"
              />
            </div>
          </div>
          <figcaption>
            {/* standard caption treatment, matching every other figure */}
            <Caption>{annotation}</Caption>
          </figcaption>
        </figure>
      </Wide>
    </div>
  );
}

/* ── Mental model pivot ────────────────────────────────────────
   Two readings of the same problem set side by side. No badges, no
   status colour: a hairline is enough separation, and the labels
   carry the contrast (neutral for the discarded hypothesis, Sand for
   what shipped). The trailing paragraph steps down to 15px so each
   column reads as a claim followed by its evidence. */

export interface PivotSide {
  /** Short sentence-case label, never a badge. */
  label: string;
  /** The claim. */
  lead: string;
  /** The evidence, set one step down. */
  detail: string;
}

export function MentalModelPivot({ left, right }: { left: PivotSide; right: PivotSide }) {
  return (
    <div className="mx-auto my-12 grid max-w-[960px] grid-cols-1 gap-8 border-t border-white/[0.08] px-4 pt-6 md:grid-cols-2 md:gap-12">
      <div className="space-y-4">
        <div className="text-[12px] font-medium tracking-normal text-neutral-400">{left.label}</div>
        <div className="space-y-4 text-[18px] font-normal leading-[28px] text-neutral-300">
          <p>{left.lead}</p>
          <p className="text-[14px] leading-[22px] text-neutral-400">{left.detail}</p>
        </div>
      </div>

      <div className="space-y-4 md:border-l md:border-white/[0.08] md:pl-12">
        <div className="text-[12px] font-medium tracking-normal" style={{ color: "#E3D5C0" }}>
          {right.label}
        </div>
        <div className="space-y-4 text-[18px] font-normal leading-[28px] text-neutral-300">
          <p>{right.lead}</p>
          <p className="text-[14px] leading-[22px] text-neutral-400">{right.detail}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Field notes wall ──────────────────────────────────────────
   Raw quotes captured on-site, pinned like physical field tags.
   The rotations and offsets are fixed per index rather than random
   so the wall renders identically on server and client, a random
   tilt would hydrate mismatched.
   The 12px sans speaker tag is a deliberate exception to the page's
   type scale: it reads as a stamped tag, not as body copy. */

const NOTE_SKINS = [
  { bg: "bg-[#F4EBD9]", tilt: "-rotate-[1.8deg]", shift: "translate-y-2" },
  { bg: "bg-[#EFE6CE]", tilt: "rotate-[1.2deg]", shift: "-translate-y-3" },
  { bg: "bg-[#EAEAEA]", tilt: "-rotate-[0.6deg]", shift: "translate-y-1" },
  { bg: "bg-[#F8ECCB]", tilt: "rotate-[2.1deg]", shift: "-translate-y-1" },
];

export interface FieldNote {
  quote: string;
  speaker: string;
  /** Optional second line. Omitted, the speaker line renders as before. */
  role?: string;
}

export function FieldNotesWall({ notes }: { notes: FieldNote[] }) {
  return (
    <Wide className="my-16">
      {/* overflow-hidden on the row keeps the outermost tilts from ever
          pushing a horizontal scrollbar onto the page */}
      <div className="overflow-hidden py-4">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {notes.map((n, i) => {
            const skin = NOTE_SKINS[i % NOTE_SKINS.length];
            return (
              <li
                key={n.speaker + i}
                className={`${skin.bg} ${skin.tilt} ${skin.shift} flex min-h-[195px] flex-col justify-between rounded-[2px] border border-black/5 p-5 text-neutral-900 shadow-xl shadow-black/50`}
              >
                <p className="font-sans text-[14px] font-normal leading-[22px] text-neutral-900">
                  {n.quote}
                </p>
                {/* Attribution stays sentence case in the body face, uppercase
                    mono read as a system label rather than a person. */}
                <div className="mt-4 border-t border-black/10 pt-3">
                  <p className="font-sans text-[12px] font-semibold tracking-normal text-neutral-900">
                    {n.speaker}
                  </p>
                  {n.role && (
                    <p className="mt-0.5 font-sans text-[12px] font-normal text-neutral-600">
                      {n.role}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Wide>
  );
}

/* ── Wide callout ──────────────────────────────────────────────
   The one deliberately contained element in this language: a
   labelled breakout for outcomes and invariants. No nesting inside. */

export interface CalloutItem {
  lead: string;
  body: string;
}

export function WideCallout({ label, items }: { label: string; items: CalloutItem[] }) {
  return (
    <div className="mx-auto my-16 max-w-[960px] px-4">
      <div className="rounded-2xl border border-white/[0.08] bg-[#061723]/60 p-8 md:p-12">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <h3 className="text-[18px] font-semibold tracking-tight text-white md:col-span-4">
            {label}
          </h3>
          <ul className="space-y-4 md:col-span-8">
            {items.map((it) => (
              <li
                key={it.lead}
                className="text-[18px] font-normal leading-[28px] text-neutral-300"
              >
                <span className="font-semibold text-white">{it.lead}</span> {it.body}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Monotonic surface ladder ──────────────────────────────────
   Stacked rather than gridded, because the argument is the step
   itself: each row paints its own token, so the ladder is read as
   physical lightness rather than as a table of hex strings.

   L* is CIE lightness on the D65 white point, used rather than hex
   distance because "one step lighter" has to mean the same thing to
   the eye at every rung. Every figure below was computed from the
   shipped hex, not transcribed. */

const RUNGS = [
  {
    token: "bg-chrome",
    hex: "#040D16",
    desc: "Application shell, sidebar, top header bar",
    lightness: "L* 3.36",
    delta: "base rung",
    bgClass: "bg-[#040D16]",
  },
  {
    token: "bg-surface",
    hex: "#061723",
    desc: "Zero-reflection page canvas",
    lightness: "L* 6.98",
    delta: "+3.62 lighter",
    bgClass: "bg-[#061723]",
  },
  {
    token: "bg-elevated",
    hex: "#122033",
    desc: "Interactive card and panel container",
    lightness: "L* 11.96",
    delta: "+4.98 lighter",
    bgClass: "bg-[#122033]",
  },
  {
    token: "bg-hover",
    hex: "#17263C",
    desc: "Mouse hover lift",
    lightness: "L* 14.92",
    delta: "+2.96 lighter",
    bgClass: "bg-[#17263C]",
  },
  {
    token: "bg-active",
    hex: "#202E4A",
    desc: "Pressed tactile feedback",
    lightness: "L* 19.04",
    delta: "+4.12 lighter",
    bgClass: "bg-[#202E4A]",
  },
];

export const MonotonicSurfaceLadder = () => (
  <div className="mx-auto my-12 max-w-[720px] space-y-4 px-6">
    <div>
      <div className="text-[18px] font-semibold tracking-tight text-white">
        The monotonic surface ladder
      </div>
      <p className="mt-1 text-[14px] font-normal leading-[22px] text-neutral-400">
        Five rungs, each strictly lighter than the one above it. Depth is carried by lightness
        alone, which is why the system ships no drop shadows.
      </p>
    </div>

    {/* Stacked stepped container: the row background is the token. */}
    <div className="divide-y divide-white/[0.08] overflow-hidden rounded-xl border border-white/[0.1]">
      {RUNGS.map((rung) => (
        <div
          key={rung.token}
          className={`flex items-center justify-between gap-6 p-5 ${rung.bgClass}`}
        >
          {/* token and intent */}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2.5">
              <span className="text-[14px] font-medium text-white">{rung.token}</span>
              <span className="font-mono text-[14px] text-neutral-400">{rung.hex}</span>
            </div>
            <div className="text-[14px] font-normal leading-[22px] text-neutral-400">
              {rung.desc}
            </div>
          </div>

          {/* lightness and delta */}
          <div className="shrink-0 space-y-0.5 text-right">
            <div className="text-[14px] font-medium tabular-nums text-white">{rung.lightness}</div>
            <div className="text-[12px] font-normal tabular-nums text-neutral-400">
              {rung.delta}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Engineering sync consensus ────────────────────────────────
   A flat two-column record of decisions reached with an engineer,
   for the moments where the architecture was settled in a room
   rather than derived. Unboxed: the divider carries the framing. */

export interface ConsensusColumn {
  topic: string;
  decision: string;
}

export function EngineeringSyncConsensus({
  header,
  columns,
}: {
  header: string;
  columns: ConsensusColumn[];
}) {
  return (
    <div className="mx-auto my-12 max-w-[840px] space-y-6 border-t border-white/[0.08] px-4 pt-6">
      <div className="text-[12px] font-medium text-neutral-400">{header}</div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        {columns.map((c) => (
          <div key={c.topic} className="space-y-2">
            <h3 className="text-[18px] font-semibold tracking-tight text-white">{c.topic}</h3>
            <p className="text-[14px] font-normal leading-[22px] text-neutral-400">{c.decision}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Taped sticky note ─────────────────────────────────────────
   A quote pinned to the page with the real tape cut-out. Unlike the
   legends and ledgers in this file, it keeps its edges: here the
   paper is the artifact rather than a container around one.

   Consecutive notes alternate tilt so a run of them reads as a wall
   of pinned paper rather than as a repeated component. */

/**
 * Rotation is appended as a whole literal class rather than interpolated
 * from a variable. Tailwind scans source text, and a class assembled from a
 * `const` is not reliably seen: the utility lands in the DOM and no rule is
 * ever generated for it, so the note renders flat.
 */
const PAPER_BASE =
  "relative rounded-sm border border-white/[0.1] bg-[#161D26] p-6 shadow-2xl shadow-black/50";
/* The tape counter-rotates, the way a torn strip sits when it is
   pressed on by hand rather than aligned to the paper. */
const TAPE_BASE =
  "pointer-events-none absolute left-1/2 top-0 z-10 w-32 -translate-x-1/2 -translate-y-[38%]";

export function TapedStickyNote({
  eyebrow,
  quote,
  attribution,
  role,
  tilt = "left",
}: {
  eyebrow: string;
  quote: string;
  attribution: string;
  role: string;
  tilt?: "left" | "right";
}) {
  return (
    <div className="mx-auto my-16 max-w-[560px] px-6">
      <div
        className={
          tilt === "left"
            ? `${PAPER_BASE} -rotate-1`
            : `${PAPER_BASE} rotate-1`
        }
      >
        <div
          aria-hidden
          className={
            tilt === "left"
              ? `${TAPE_BASE} -rotate-[2.2deg]`
              : `${TAPE_BASE} rotate-[2.2deg]`
          }
        >
          <Image
            src="/jeevy/tape-yellow.webp"
            alt=""
            width={712}
            height={350}
            sizes="128px"
            className="h-auto w-full"
          />
        </div>

        <div className="mt-2 text-[12px] font-medium text-[#D4A373]">{eyebrow}</div>
        <p className="mt-3 text-[14px] font-normal italic leading-[22px] text-neutral-200">
          {quote}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-white/[0.08] pt-3 text-[12px] text-neutral-400">
          <span className="font-medium text-white">{attribution}</span>
          <span>{role}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Sanitized image frame ─────────────────────────────────────
   Presentation masks for screenshots whose chrome carries an
   internal URL or a trailing block of scope text.

   IMPORTANT: these overlays are cosmetic. They sit above the image
   in the DOM and remove nothing from the file, so anyone opening
   the asset URL directly still sees the original. Where the source
   actually carries customer identity, order numbers or personal
   names, the pixels must be destroyed in the file itself before it
   ships. Use this to tidy a frame, never to redact one. */

export function SanitizedImageFrame({
  src,
  alt,
  caption,
  width,
  height,
  maskTopUrlBar = false,
  maskBottomText = false,
  maskedUrl = "https://internal-portal.local/fabrication/project-status-report",
  bottomNote = "Proprietary customer scope details redacted for portfolio presentation.",
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  maskTopUrlBar?: boolean;
  maskBottomText?: boolean;
  maskedUrl?: string;
  bottomNote?: string;
  className?: string;
}) {
  return (
    <figure className={`my-16 ${className}`}>
      <Wide>
        <div className="relative w-full overflow-hidden rounded-xl border border-white/10">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="(max-width: 960px) 100vw, 960px"
            quality={90}
            className="h-auto w-full"
          />

          {maskTopUrlBar && (
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 flex h-9 items-center border-b border-white/10 bg-[#0B1015]/95 px-4 backdrop-blur-md"
            >
              <div className="mr-3 flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <div className="flex h-5 max-w-[420px] items-center truncate rounded bg-white/[0.06] px-3 text-[12px] text-neutral-400">
                {maskedUrl}
              </div>
            </div>
          )}

          {maskBottomText && (
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 flex h-20 items-end bg-gradient-to-t from-[#040D16] via-[#040D16]/90 to-transparent p-4"
            >
              <span className="text-[12px] italic text-neutral-400">{bottomNote}</span>
            </div>
          )}
        </div>
        {caption && (
          <figcaption>
            <Caption>{caption}</Caption>
          </figcaption>
        )}
      </Wide>
    </figure>
  );
}
