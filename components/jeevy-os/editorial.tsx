import Image from "next/image";
import Link from "next/link";

/**
 * Shared editorial primitives for the Jeevy OS case study and its deep dives.
 *
 * One measure, one type scale, one link treatment across every page:
 *   28px semibold white   — titles and section breaks
 *   18px neutral-300      — all body copy
 *   14px neutral-500      — captions and metadata
 *   12px mono neutral-400 — eyebrows and breadcrumbs
 *
 * Text sits directly on the canvas. Nothing here draws a card.
 */

export const CANVAS = "#040D16";
export const ACCENT = "#D97352";
export const ACCENT_BRIGHT = "#F2805B";

/** Prose measure — images share it so both hold one left and right edge. */
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
  <p className="mt-2 text-[14px] font-normal leading-relaxed text-neutral-500">{children}</p>
);

/**
 * Colour classes are written out literally, never interpolated — Tailwind
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

/** Breakout measure — figures and editorial primitives that outrun the prose. */
export const Wide = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`mx-auto max-w-[960px] px-4 ${className}`}>{children}</div>;

/**
 * Figure measures:
 *   full    — 960px breakout, for wide tables, hero photos, and diagrams
 *   prose   — shares the 720px text edge
 *   compact — 380/420px, for popovers and dropdown crops that would turn to
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
  /** Crop to this ratio — photographs only. */
  ratio?: string;
  /** Intrinsic dimensions — for UI screenshots, so nothing is cropped away. */
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
   * reports, Next picks a too-small variant and the browser upscales it —
   * which reads as a blurry screenshot, not as a layout bug.
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
 * Two figures side by side across the breakout measure — for paired modal
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

/* ── Field notes wall ──────────────────────────────────────────
   Raw quotes captured on-site, pinned like physical field tags.
   The rotations and offsets are fixed per index rather than random
   so the wall renders identically on server and client — a random
   tilt would hydrate mismatched.
   The 12px sans speaker tag is a deliberate exception to the page@s
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
                {/* Attribution stays sentence case in the body face — uppercase
                    mono read as a system label rather than a person. */}
                <p className="mt-4 font-sans text-[12px] font-medium tracking-normal text-neutral-600">
                  {n.speaker}
                </p>
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
