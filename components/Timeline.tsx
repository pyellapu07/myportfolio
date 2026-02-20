"use client";

import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { TIMELINE } from "@/lib/constants";

export default function Timeline() {
  return (
    <SectionWrapper id="journey">
      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
        >
          Journey
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-display text-3xl font-bold text-text md:text-4xl"
        >
          Experience & Education
        </motion.h2>
      </div>

      <div className="relative mt-14">
        {/* Central line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2" />

        {TIMELINE.map((item, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={item.role + item.organization}
              initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className={`relative mb-10 flex items-start md:mb-12 ${
                isLeft
                  ? "md:flex-row md:pr-[calc(50%+2rem)]"
                  : "md:flex-row-reverse md:pl-[calc(50%+2rem)]"
              }`}
            >
              {/* Dot */}
              <div
                className="absolute left-4 z-10 -translate-x-1/2 md:left-1/2"
                style={{ top: "1.5rem" }}
              >
                <div
                  className="h-3.5 w-3.5 rounded-full ring-4 ring-white"
                  style={{ backgroundColor: item.color }}
                />
              </div>

              {/* Card */}
              <div className="ml-10 w-full rounded-xl border border-border bg-white p-6 transition-all duration-300 hover:border-border/80 md:ml-0">
                <span
                  className="font-mono text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: item.color }}
                >
                  {item.period}
                </span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-text">
                  {item.role}
                </h3>
                <p className="font-mono text-xs text-text-muted">
                  {item.organization}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {item.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary"
                    >
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color, opacity: 0.5 }}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
