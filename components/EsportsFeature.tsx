"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clapperboard } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

export default function EsportsFeature() {
  return (
    <SectionWrapper id="creative">
      {/* Section label — visually separates from UX case studies */}
      <div className="mb-12">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-widest text-text-muted"
        >
          Beyond UX
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 font-display text-4xl font-extrabold tracking-tight text-text md:text-5xl"
        >
          Creative Direction
        </motion.h2>
      </div>

      {/* Esports card — dark cinematic treatment */}
      <motion.article
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="group overflow-hidden rounded-2xl border border-border bg-[#0a0a0a] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(226,24,51,0.15)]"
      >
        <Link href="/work/terps-esports" className="block">
          {/* Hero image row */}
          <div className="grid lg:grid-cols-[1fr_1fr]">
            {/* Left: text content */}
            <div className="flex flex-col justify-between p-8 md:p-12">
              <div>
                {/* Tag */}
                <div className="mb-6 flex items-center gap-2">
                  <Clapperboard size={14} className="text-[#E21833]" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Graphic Design · Video Direction · Brand Identity
                  </span>
                </div>

                <h3 className="font-display text-3xl font-extrabold leading-tight text-white md:text-4xl">
                  Terps Esports
                </h3>
                <p className="mt-2 font-mono text-sm text-white/40">
                  University of Maryland · Nov 2024 – Present
                </p>

                <p className="mt-5 font-mono text-sm leading-relaxed text-white/60 md:text-base">
                  Graphic designer and video director for UMD's competitive esports program — from game day thumbnails to a full green-screen Valorant character intro film written, directed, and edited from scratch.
                </p>

                <p className="mt-3 font-mono text-sm leading-relaxed" style={{ color: "#FFD200" }}>
                  Script writing · Green screen production · MailChimp newsletters · UMD Giving Day campaign · 20+ original graphics
                </p>
              </div>

              {/* Tools row */}
              <div className="mt-8">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/20">Tools</p>
                <div className="flex flex-wrap gap-2">
                  {["Premiere Pro", "After Effects", "Photoshop", "Illustrator", "MailChimp", "Green Screen"].map(t => (
                    <span key={t} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] text-white/40">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-white group-hover:text-[#E21833] transition-colors duration-300">
                    View Project
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-[30deg] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Right: image collage */}
            <div className="relative grid grid-cols-2 gap-1 overflow-hidden lg:grid-rows-2 max-h-[460px]">
              <div className="relative overflow-hidden row-span-2">
                <Image
                  src="/Esports/blossom poster OW5_1.5x.png"
                  alt="Blossom Poster"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="/Esports/NJC valorant thumbnail_1.5x.png"
                  alt="Valorant thumbnail"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="/Esports/hype up overwatch bec2_1.5x.png"
                  alt="Overwatch graphic"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    </SectionWrapper>
  );
}
