"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { PROJECTS } from "@/lib/constants";
import { useState } from "react";
import type { Project } from "@/types";

type Segment =
  | { type: "featured"; project: Project }
  | { type: "grid"; projects: Project[] };

function buildSegments(projects: Project[]): Segment[] {
  const segments: Segment[] = [];
  let gridBuffer: Project[] = [];
  for (const project of projects) {
    if (project.featured) {
      if (gridBuffer.length > 0) {
        segments.push({ type: "grid", projects: gridBuffer });
        gridBuffer = [];
      }
      segments.push({ type: "featured", project });
    } else {
      gridBuffer.push(project);
    }
  }
  if (gridBuffer.length > 0) segments.push({ type: "grid", projects: gridBuffer });
  return segments;
}

export default function Projects() {
  const segments = buildSegments(PROJECTS);

  // Floating cursor label
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);
  const springX = useSpring(rawX, { stiffness: 600, damping: 35 });
  const springY = useSpring(rawY, { stiffness: 600, damping: 35 });
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);

  function handleMouseMove(e: React.MouseEvent) {
    rawX.set(e.clientX);
    rawY.set(e.clientY);
  }
  function handleMouseEnter(label: string) { setCursorLabel(label); }
  function handleMouseLeave() { setCursorLabel(null); }

  return (
    <SectionWrapper id="work">
      <div className="mb-16">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-widest text-text-muted"
        >
          Selected Work
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 font-display text-4xl font-extrabold tracking-tight text-text md:text-5xl"
        >
          Case Studies
        </motion.h2>
      </div>

      {segments.map((segment, si) =>
        segment.type === "featured" ? (
          /* ── Full-width featured card ── */
          <FeaturedCard
            key={segment.project.title}
            project={segment.project}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => handleMouseEnter(segment.project.cursorLabel ?? "View case study →")}
            onMouseLeave={handleMouseLeave}
          />
        ) : (
          /* ── 2-col grid of non-featured cards ── */
          <div key={`grid-${si}`} className="mb-16 grid gap-6 md:grid-cols-2">
            {segment.projects.map((project, i) => (
              <GridCard
                key={project.title}
                project={project}
                index={i}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => handleMouseEnter(project.cursorLabel ?? "View case study →")}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>
        )
      )}

      {/* Floating cursor label */}
      <AnimatePresence>
        {cursorLabel && (
          <motion.div
            key="cursor-label"
            className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-[2px] bg-[#0d1b3e] px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-widest text-white whitespace-nowrap"
            style={{ left: springX, top: springY }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
          >
            {cursorLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Sub-components                                      */
/* ─────────────────────────────────────────────────── */

interface CardProps {
  project: Project;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function FeaturedCard({ project, onMouseMove, onMouseEnter, onMouseLeave }: CardProps) {
  const isInternal = (project.link || "#").startsWith("/");
  const Wrapper = isInternal
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={project.link!} className="block">{children}</Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <a href={project.link || "#"} className="block">{children}</a>
      );

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="group mb-16 overflow-hidden rounded-xl border border-border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-smooth-hover cursor-none"
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Wrapper>
        <div className="relative overflow-hidden aspect-[16/9]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            priority
            unoptimized={project.image.endsWith(".gif")}
          />
        </div>
        <div className="p-4 sm:p-8 md:p-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-extrabold text-text sm:text-2xl md:text-3xl">{project.title}</h3>
              <p className="mt-1 font-mono text-xs text-text-muted">{project.subtitle}</p>
            </div>
            <span
              className="shrink-0 rounded-full border border-border p-2.5 text-text-muted transition-all duration-300 group-hover:border-text group-hover:text-text"
              aria-hidden
            >
              <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-[30deg]" />
            </span>
          </div>
          <p className="mt-2 font-mono text-sm font-medium text-accent sm:mt-4">{project.impact}</p>
          <p className="mt-2 line-clamp-3 max-w-[720px] text-sm leading-relaxed text-text-secondary sm:mt-4 sm:line-clamp-none">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
            {project.techStack.map((t) => (
              <span key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-secondary">{t}</span>
            ))}
          </div>
        </div>
      </Wrapper>
    </motion.article>
  );
}

function GridCard({ project, index, onMouseMove, onMouseEnter, onMouseLeave }: CardProps & { index: number }) {
  const href = project.link || "#";
  const isInternal = href.startsWith("/");
  const Wrapper = isInternal
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={href} className="block h-full">{children}</Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <a href={href} className="block h-full">{children}</a>
      );

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="group overflow-hidden rounded-xl border border-border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-smooth-hover cursor-none"
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Wrapper>
        {project.title === "NASA Harvest, Xylem Institute" ? (
          <div
            className="relative flex items-center justify-center overflow-hidden px-4 py-4 aspect-[16/10] sm:px-6 sm:py-6"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #dcfce7 45%, #86efac 100%)" }}
          >
            <div className="relative w-full max-w-[90%] overflow-hidden rounded-lg">
              <Image
                src={project.image}
                alt={project.title}
                width={640}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                unoptimized={project.image.endsWith(".gif")}
              />
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden aspect-[16/10]">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              unoptimized={project.image.endsWith(".gif")}
            />
          </div>
        )}
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-extrabold text-text sm:text-lg">{project.title}</h3>
              <p className="mt-1 font-mono text-[11px] text-text-muted">{project.subtitle}</p>
            </div>
            <span
              className="shrink-0 rounded-full border border-border p-2.5 text-text-muted transition-all duration-300 group-hover:border-text group-hover:text-text"
              aria-hidden
            >
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-[30deg]" />
            </span>
          </div>
          <p className="mt-3 font-mono text-xs font-medium text-accent">{project.impact}</p>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary sm:line-clamp-none">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((t) => (
              <span key={t} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-text-muted">{t}</span>
            ))}
          </div>
        </div>
      </Wrapper>
    </motion.article>
  );
}
