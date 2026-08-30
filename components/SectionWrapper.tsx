"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  alternate?: boolean;
}

export default function SectionWrapper({
  id,
  children,
  className,
  alternate,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-28 md:py-40",
        alternate ? "bg-bg-alt" : "bg-bg",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        // `amount` must stay height-independent: a fractional threshold is
        // unreachable once a section grows taller than ~6x the viewport, which
        // silently leaves the whole section stuck at opacity 0.
        viewport={{ once: true, amount: "some", margin: "0px 0px -120px 0px" }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
        className="mx-auto max-w-[1080px] px-8 md:px-16 lg:px-24"
      >
        {children}
      </motion.div>
    </section>
  );
}
