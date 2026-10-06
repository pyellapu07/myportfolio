"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import JeevyOSCard from "./JeevyOSCard";
import TGICard from "./TGICard";
import ProjectSplitCard from "./ProjectSplitCard";
import { PROJECTS } from "@/lib/constants";
import { useState } from "react";

export default function Projects() {

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

      {/* ── Flagship platform card ── */}
      <JeevyOSCard />

      <TGICard
        onMouseMove={handleMouseMove}
        onMouseEnter={() => handleMouseEnter("Work ongoing")}
        onMouseLeave={handleMouseLeave}
      />

      {PROJECTS.map((project, i) => (
        <ProjectSplitCard
          key={project.title}
          project={project}
          index={i}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => handleMouseEnter(project.cursorLabel ?? "View case study →")}
          onMouseLeave={handleMouseLeave}
        />
      ))}

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
