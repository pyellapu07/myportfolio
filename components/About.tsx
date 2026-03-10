"use client";

import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import BeachReveal from "./BeachReveal";
import { ABOUT_TEXT } from "@/lib/constants";

export default function About() {
  return (
    <SectionWrapper id="about" alternate>
      <div className="grid gap-12 md:gap-16 md:items-end md:grid-cols-[2fr_3fr]">
        {/* Left column — text */}
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

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-5 font-mono text-[11px] uppercase tracking-widest text-text-secondary/50"
          >
            ← click the button to see my POV
          </motion.p>
        </div>

        {/* Right column — Beach Reveal interactive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <BeachReveal />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
