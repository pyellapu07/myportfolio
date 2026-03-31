"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SectionWrapper from "./SectionWrapper";

const TESTIMONIALS = [
  {
    name: "Bhushan Suryavanshi",
    role: "Founder & CEO",
    company: "MarketCrunch AI",
    sub: "x-Amazon · Wharton · CMU",
    avatar: "/bhushan marketcrunch.jpeg",
    color: "#FF6B6B",
    quote:
      "Pradeep joined us as a design intern and quickly became the backbone of our product redesign. His UX audit was thorough, his prototypes were polished, and his ability to run usability sessions and translate findings into actionable improvements was beyond what we expected. The numbers speak for themselves.",
  },
  {
    name: "Catherine Nakalembe (Ph.D.)",
    role: "NASA Harvest Africa Director",
    company: "University of Maryland",
    sub: "2025 TED Fellow · Africa Food Prize",
    avatar: "/catherine nakalembe.webp",
    color: "#A78BFA",
    quote:
      "Working with Pradeep has been a genuine pleasure. He brought a rare blend of design sensibility and technical understanding to a domain that most designers shy away from — geospatial, climate, and agricultural data. He didn't just make things look good; he made complex information intuitive for analysts across 9 countries.",
  },
  {
    name: "Ravi Kumar",
    role: "Service Delivery Manager",
    company: "Computacenter UK",
    sub: "Managed Pradeep directly · 18 months",
    avatar: "/ravi kumar.jpeg",
    color: "#34D399",
    quote:
      "Happy to write this recommendation for Pradeep, post working very closely for 18 months. He is knowledgeable and easy going. Never delayed on any task assigned to him. A true team player, and a creative artist when it comes to editing or drawing. I wish him the best for his masters in the states.",
  },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <SectionWrapper id="testimonials">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 flex items-start gap-4"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg-alt text-2xl">
          💬
        </div>
        <div>
          <h2 className="font-heading text-3xl font-bold text-text md:text-4xl">
            What others say!
          </h2>
          <p className="mt-1 text-sm italic text-text-secondary">
            I didn&apos;t come up with these, I swear
          </p>
        </div>
      </motion.div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="snap-start shrink-0 w-[300px] md:w-[340px] rounded-2xl border border-border bg-white p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
          >
            {/* Quote */}
            <div>
              <div
                className="mb-4 h-[2px] w-12 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <p className="text-[13.5px] leading-relaxed text-text-secondary">
                {t.quote}
              </p>
            </div>

            {/* Person */}
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
              <div
                className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden"
                style={{ boxShadow: `0 0 0 2px ${t.color}` }}
              >
                <Image
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-text">{t.name}</p>
                <p className="truncate text-[11px] text-text-secondary">{t.role}</p>
                <p className="truncate font-mono text-[10px] text-text-secondary/60">
                  @ {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* "More coming" placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="snap-start shrink-0 w-[200px] rounded-2xl border border-dashed border-border bg-bg-alt flex flex-col items-center justify-center gap-2 p-6 text-center"
        >
          <span className="text-2xl">🤝</span>
          <p className="font-mono text-[11px] text-text-secondary/60">
            More recommendations coming soon
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
