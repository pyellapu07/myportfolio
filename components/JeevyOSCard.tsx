"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { JEEVY_OS, JEEVY_ENGINES, engineHref } from "@/lib/jeevy-os";

const HERO = JEEVY_OS.gallery[0];

/**
 * Flagship featured card for the Jeevy Industrial OS platform.
 *
 * Anton Sten card framing: padding is decoupled per column. The card itself
 * carries none, the media cell insets by only 8–12px so the image sits close
 * to the card border, and the text cell keeps generous internal padding.
 *
 * The whole card is a link to the platform hub. Because the card also holds
 * six engine links, it uses a stretched overlay anchor rather than wrapping
 * the card — nesting <a> inside <a> is invalid HTML and breaks the inner
 * links. The overlay sits at z-10; the engine links are lifted to z-20.
 *
 * The 5-column grid (3 media / 2 text) is load-bearing, not cosmetic: the
 * widest engine label needs ~127px, so the two-column link grid needs ~270px.
 * A 3-column grid would leave the text column too narrow and the links would
 * collide. Do not narrow the text column below `col-span-2` of 5.
 *
 * Typography is deliberately restricted to two sizes:
 *   28px — the title, only
 *   14px — everything else, in muted grey
 */
export default function JeevyOSCard() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      // height-independent: a fractional `amount` becomes unreachable once a
      // card stacks taller than the viewport, leaving it stuck at opacity 0
      viewport={{ once: true, amount: "some", margin: "0px 0px -120px 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="group relative mb-16 grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-white p-0 transition-shadow duration-500 hover:shadow-smooth-hover md:grid-cols-5"
    >
      {/* Stretched link — makes the entire card clickable without nesting
          anchors. Kept below the engine links in the stacking order. */}
      <Link
        href={JEEVY_OS.ctaHref}
        aria-label={`${JEEVY_OS.title} — view the full platform case study`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />

      {/* ── Left: media cell — tight inset from the card border ── */}
      <div className="p-2 md:col-span-3 md:p-3">
        <div className="relative h-full w-full min-h-[420px] overflow-hidden rounded-lg bg-bg-alt">
          <Image
            src={HERO.src}
            alt={HERO.alt}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            // object-left, not center: the Jeevy logo sits in the image's
            // top-left corner and a centred crop would cut it off
            className="h-full w-full object-cover object-left"
            priority
          />
        </div>
      </div>

      {/* ── Right: text cell — generous internal padding ───────── */}
      <div className="flex flex-col p-6 md:col-span-2 md:p-8">
        {/* Title + arrow badge, matching the other project cards */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[28px] leading-tight tracking-tight text-text">
              {JEEVY_OS.title}
            </h3>
            <p className="mt-1 font-mono text-[14px] leading-snug text-text-secondary">
              {JEEVY_OS.cardSubtitle}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full border border-border p-2.5 text-text-muted transition-all duration-300 group-hover:border-text group-hover:text-text"
            aria-hidden
          >
            <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-[30deg]" />
          </span>
        </div>

        {/* Tightened narrative */}
        <p className="mt-4 text-[14px] leading-relaxed text-text-secondary">
          {JEEVY_OS.narrativeShort}
        </p>

        {/* Six engines, each strictly one line. Two columns need ~270px of
            inner width. The text cell clears that only when it is full-width
            (sm, stacked) or once SectionWrapper's max-w-[1080px] container
            caps out — which is why the switch is at 1100px, not `lg`. At
            lg (1024) the container is still fluid and columns land at 125px,
            2px short of the widest label, so the links collide.
            Must be a built-in breakpoint: Tailwind sorts `min-[...]` variants
            before the named ones, so `min-[1100px]:` loses to `md:`. */}
        <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 border-t border-border pt-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {JEEVY_ENGINES.map((engine) => (
            <li key={engine.slug} className="relative z-20 min-w-0">
              <Link
                href={engineHref(engine.slug)}
                className="inline-flex items-center gap-1 whitespace-nowrap text-[14px] leading-snug text-text-secondary transition-colors duration-300 hover:text-text hover:underline"
              >
                {engine.cardLabel}
                <ArrowUpRight size={13} className="shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
