"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import type { Project } from "@/types";

/** Chips past this collapse into a +N, so one long stack cannot set the height. */
const TAG_LIMIT = 6;

/**
 * The Jeevy and TGI card frame, generalised for the rest of the work.
 *
 * Those two crop their art deliberately, each anchored to the side that holds
 * its subject. Nothing else on the page can take a crop: they are composed
 * screenshots and a GIF, where cutting an edge removes the part that carries
 * the point. So the panel supports both fits.
 *
 * With `contain`, the shot is mounted rather than letterboxed. It keeps its
 * own rounded corner and hairline on the panel's grey, which reads as a
 * screenshot on a mat, the same treatment the standalone cards already use
 * for their inset. The alternative, a sampled backdrop colour, was measured
 * against the real thumbnails and rejected: four of the six have border
 * variance above 170, so any single colour clashed with one edge or another.
 */
export default function ProjectSplitCard({
  project,
  index,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
}: {
  project: Project;
  index: number;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const href = project.link || "#";
  const isLive = href.startsWith("/");
  const fit = project.media?.fit ?? "contain";
  const isContain = fit === "contain";
  const locked = /nda|password/i.test(project.cursorLabel ?? "");

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some", margin: "0px 0px -120px 0px" }}
      transition={{
        delay: Math.min(index, 2) * 0.06,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative mb-16 grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-white p-0 transition-shadow duration-500 hover:shadow-smooth-hover md:grid-cols-5"
    >
      {/* Stretched link: whole card clickable without nesting anchors. */}
      {isLive && (
        <Link
          href={href}
          aria-label={`${project.title}: view the case study`}
          className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      )}

      {/* ── Left: media cell ── */}
      <div
        className={`p-2 md:col-span-3 md:p-3 ${
          // A contained shot keeps its own height, so centre it against the
          // text rather than stretching a panel it cannot fill. Stretching is
          // what left the widest thumbnail floating in a tall empty box.
          isContain ? "flex items-center" : ""
        }`}
      >
        {isContain ? (
          <Image
            src={project.image}
            alt={project.title}
            width={1432}
            height={853}
            sizes="(max-width: 768px) 92vw, 55vw"
            className="h-auto w-full rounded-lg object-contain shadow-sm ring-1 ring-black/5 transition-transform duration-700 group-hover:scale-[1.01]"
            unoptimized={project.image.endsWith(".gif")}
          />
        ) : (
          <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-lg bg-bg-alt sm:min-h-[360px] md:min-h-[420px]">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className={`h-full w-full object-cover ${project.media?.position ?? "object-center"}`}
              unoptimized={project.image.endsWith(".gif")}
            />
          </div>
        )}
      </div>

      {/* ── Right: text cell ── */}
      <div className="flex flex-col p-6 md:col-span-2 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[28px] leading-tight tracking-tight text-text">
              {project.title}
            </h3>
            <p className="mt-1 font-mono text-[14px] leading-snug text-text-secondary">
              {project.subtitle}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full border border-border p-2.5 text-text-muted transition-all duration-300 group-hover:border-text group-hover:text-text"
            aria-hidden
          >
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:rotate-[30deg]"
            />
          </span>
        </div>

        <p className="mt-4 font-mono text-[14px] font-medium leading-snug text-accent">
          {project.impact}
        </p>

        {/* Clamped so the text column stays near the height of the shot beside
            it. Unclamped, the longest entry ran 427px past its own image and
            left a trough of white down the side of the card. */}
        <p className="mt-4 line-clamp-5 text-[14px] leading-relaxed text-text-secondary">
          {project.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
          {project.techStack.slice(0, TAG_LIMIT).map((t) => (
            <li
              key={t}
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-text-muted"
            >
              {t}
            </li>
          ))}
          {project.techStack.length > TAG_LIMIT && (
            <li className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-text-muted">
              +{project.techStack.length - TAG_LIMIT}
            </li>
          )}
        </ul>

        {locked && (
          <p className="mt-auto flex items-center gap-1.5 pt-6 text-[14px] leading-snug text-text-muted">
            <Lock size={13} aria-hidden />
            {project.cursorLabel}
          </p>
        )}
      </div>
    </motion.article>
  );
}
