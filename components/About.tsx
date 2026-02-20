"use client";

import { motion } from "framer-motion";
import {
  PenTool,
  Search,
  Layout,
  Accessibility,
  Figma,
  Network,
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { ABOUT_TEXT, ABOUT_HIGHLIGHTS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  "pen-tool": PenTool,
  search: Search,
  layout: Layout,
  accessibility: Accessibility,
  figma: Figma,
  sitemap: Network,
};

export default function About() {
  return (
    <SectionWrapper id="about" alternate>
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        {/* Left column */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
          >
            About Me
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-heading text-3xl font-bold leading-tight text-text md:text-4xl"
          >
            Building at the intersection of data&nbsp;&&nbsp;design
          </motion.h2>

          <div className="mt-6 space-y-4">
            {ABOUT_TEXT.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-[15px] leading-relaxed text-text-secondary"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Right column - Skills highlights */}
        <div className="flex items-center">
          <div className="grid w-full grid-cols-2 gap-3">
            {ABOUT_HIGHLIGHTS.map((item, i) => {
              const Icon = iconMap[item.icon] || Search;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.3 + i * 0.08,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors duration-300 group-hover:bg-primary/15">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-text">
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
