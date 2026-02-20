"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { METRICS } from "@/lib/constants";

function AnimatedCounter({
  value,
  suffix,
  inView,
}: {
  value: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const isDecimal = value % 1 !== 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? Math.round(start * 100) / 100 : Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, value]);

  const display = value % 1 !== 0 ? count.toFixed(2) : count;

  return (
    <span className="font-display text-4xl font-bold text-text md:text-5xl">
      {display}
      <span className="text-primary">{suffix}</span>
    </span>
  );
}

export default function ImpactMetrics() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <section ref={ref} className="border-y border-border-light bg-white py-20 md:py-24">
      <div className="mx-auto grid max-w-[1080px] grid-cols-2 gap-8 px-8 md:grid-cols-4 md:gap-12 md:px-16 lg:px-24">
        {METRICS.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: i * 0.1,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="flex flex-col items-center text-center"
          >
            <AnimatedCounter
              value={metric.value}
              suffix={metric.suffix}
              inView={inView}
            />
            <span className="mt-2 font-mono text-xs font-medium tracking-wide text-text-muted">
              {metric.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
