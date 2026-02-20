"use client";

import { motion } from "framer-motion";
import { PenTool, Search, Layout, Code } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { SKILL_CATEGORIES } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  "pen-tool": PenTool,
  search: Search,
  layout: Layout,
  code: Code,
};

export default function Skills() {
  return (
    <SectionWrapper id="skills" alternate>
      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
        >
          Expertise
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-display text-3xl font-bold text-text md:text-4xl"
        >
          Skills & Expertise
        </motion.h2>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SKILL_CATEGORIES.map((category, i) => {
          const Icon = iconMap[category.icon] || Code;
          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="rounded-xl border border-border bg-white p-6 transition-all duration-300 hover:border-primary/20"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-lg font-bold text-text">
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {category.skills.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-2.5 text-sm text-text-secondary"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-primary/30" />
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
