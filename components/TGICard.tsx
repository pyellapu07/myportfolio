"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";

const HREF = "/work/tgi";

/** Section anchors on the case study, in page order. */
const SECTIONS = [
  { label: "Precision Trap", id: "problem" },
  { label: "3-Lab Pipeline", id: "architecture" },
  { label: "Persona Engine", id: "personas" },
  { label: "Benchmark", id: "benchmark" },
  { label: "4 Iterations", id: "iterations" },
  { label: "Design System", id: "system" },
];

/**
 * Featured card for the TGI workbench, built on the Jeevy OS card's frame:
 * tight media inset, 3/2 column split, 28px title, everything else 14px.
 * See JeevyOSCard for why the split and the 1100px link-grid switch are
 * load-bearing.
 *
 * The hover handlers drive the floating cursor label owned by Projects, so
 * this card says "Work ongoing" the same way the grid cards say theirs.
 */
export default function TGICard({
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
}: {
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some", margin: "0px 0px -120px 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative mb-16 grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-white p-0 transition-shadow duration-500 hover:shadow-smooth-hover md:grid-cols-5"
    >
      {/* Stretched link: whole card clickable without nesting anchors. */}
      <Link
        href={HREF}
        aria-label="TGI Crop Intelligence Workbench: view the case study (password protected, work ongoing)"
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />

      {/* ── Left: media cell ── */}
      <div className="p-2 md:col-span-3 md:p-3">
        <div className="relative h-full w-full min-h-[420px] overflow-hidden rounded-lg bg-bg-alt">
          <Image
            src="/tgi/01-hero-full-platform.webp"
            alt="The TGI workbench over Al Jazirah on a satellite basemap, with reference sample pins and the Statistical decision drawer"
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            // object-left keeps the command bar and the pin field; the
            // decision drawer on the right is what a narrow crop gives up
            className="h-full w-full object-cover object-left"
          />
        </div>
      </div>

      {/* ── Right: text cell ── */}
      <div className="flex flex-col p-6 md:col-span-2 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[28px] leading-tight tracking-tight text-text">
              TGI Crop Intelligence
            </h3>
            <p className="mt-1 font-mono text-[14px] leading-snug text-text-secondary">
              Food Security GIS Workbench, 2026
            </p>
          </div>
          <span
            className="shrink-0 rounded-full border border-border p-2.5 text-text-muted transition-all duration-300 group-hover:border-text group-hover:text-text"
            aria-hidden
          >
            <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-[30deg]" />
          </span>
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-text-secondary">
          In conflict zones no one can survey, a single misread field can make a famine look like a
          harvest. As Lead Product &amp; Systems Designer for an ASU, WashU and UMD consortium, I
          designed a calibrated workbench for FEWS NET and WFP that refuses to publish a crop
          estimate it cannot defend.
        </p>

        <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 border-t border-border pt-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id} className="relative z-20 min-w-0">
              <Link
                href={`${HREF}#${s.id}`}
                className="inline-flex items-center gap-1 whitespace-nowrap text-[14px] leading-snug text-text-secondary transition-colors duration-300 hover:text-text hover:underline"
              >
                {s.label}
                <ArrowUpRight size={13} className="shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-auto flex items-center gap-1.5 pt-6 text-[14px] leading-snug text-text-muted">
          <Lock size={13} aria-hidden />
          Password protected · work ongoing
        </p>
      </div>
    </motion.article>
  );
}
