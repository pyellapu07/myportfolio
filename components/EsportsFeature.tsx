"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Film, Pen, Palette, Clapperboard } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const PHOTOS = [
  "/Esports/NJC valorant thumbnail_1.5x.png",
  "/Esports/blossom poster OW5_1.5x.png",
  "/Esports/hype up overwatch bec2_1.5x.png",
  "/Esports/hype up rocketleague bec1_1.5x.png",
  "/Esports/valorant premier 2_1.5x_2x.jpg",
  "/Esports/RL lan event Grand Chanmpions poster@1.5x.png",
  "/Esports/mariokart lan event.png",
  "/Esports/thumbnail giving day.png",
];

function PhotoStrip() {
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let x = 0;
    let raf: number;
    const step = () => {
      x -= 0.5;
      const half = el.scrollWidth / 2;
      if (Math.abs(x) >= half) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...PHOTOS, ...PHOTOS];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#f5f5f5] py-3">
      <ul ref={trackRef} className="flex gap-2 will-change-transform" style={{ width: "max-content" }}>
        {items.map((src, i) => (
          <li key={i} className="relative h-[88px] w-[132px] flex-shrink-0 overflow-hidden rounded-lg">
            <Image src={src} alt="" fill className="object-cover" sizes="132px" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EsportsFeature() {
  return (
    <SectionWrapper id="creative">
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

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="grid gap-6 lg:grid-cols-[auto_1fr]"
      >
        {/* LEFT: card stack */}
        <div className="flex flex-col gap-3" style={{ width: "clamp(260px, 30vw, 340px)" }}>
          {/* Big featured card */}
          <Link href="/work/terps-esports">
            <div
              className="relative overflow-hidden rounded-[28px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: "#E21833", minHeight: 220 }}
            >
              {/* Logo bottom-right */}
              <div className="absolute bottom-4 right-4 h-20 w-20 opacity-80">
                <Image src="/esportslogo.png" alt="Terps Esports" fill className="object-contain" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-white text-lg leading-tight">Graphic Designer</p>
                <p className="mt-0.5 font-sans text-sm text-white/80">@ Terps Esports</p>
              </div>
              <div
                className="relative z-10 mt-6 inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                Nov 2024 – Present
              </div>
            </div>
          </Link>

          {/* Small secondary cards */}
          {[
            { icon: <Film size={18} />, role: "Video Director", org: "@ Co-Ed Valorant Film" },
            { icon: <Pen size={18} />,  role: "Script Writer",  org: "@ Co-Ed Film" },
            { icon: <Palette size={18} />, role: "Brand Identity", org: "@ Terps Esports" },
          ].map((item, i) => (
            <Link href="/work/terps-esports" key={i}>
              <div className="flex items-center gap-4 rounded-[28px] bg-[#f5f5f5] px-5 py-4 transition-all duration-200 hover:bg-[#ebebeb]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-text-muted shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-text">{item.role}</p>
                  <p className="font-sans text-xs text-text-muted">{item.org}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* RIGHT: description + photo strip + badge */}
        <div className="flex flex-col justify-between gap-6">
          {/* Description */}
          <div>
            <p className="font-sans text-sm leading-relaxed text-text-muted">
              Designed game day graphics, directed a full green-screen Valorant intro film, and built the visual brand for UMD's competitive esports program.
            </p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-text-muted">
              Wrote the script, set the lighting, directed players, and edited the footage. Days and nights in post-production.
            </p>
          </div>

          {/* Photo strip */}
          <PhotoStrip />

          {/* Badge card — rotated, links to the film */}
          <div className="flex justify-end">
            <Link
              href="/work/terps-esports#te-coed"
              className="group relative overflow-hidden rounded-2xl bg-[#0a0a0a] p-5 transition-all duration-300 hover:-rotate-0 hover:shadow-lg"
              style={{ transform: "rotate(8deg)", width: 160 }}
            >
              <div className="relative mb-3 h-16 w-full overflow-hidden rounded-xl">
                <Image
                  src="/Esports/NJC valorant thumbnail_1.5x.png"
                  alt="Co-Ed Valorant Film"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-sans text-[11px] font-bold text-white text-center">Watch the Film</p>
              <p className="mt-0.5 font-sans text-[9px] text-white/50 text-center">Co-Ed Valorant Intro</p>
              <ArrowUpRight size={12} className="absolute right-3 top-3 text-white/40 transition-colors group-hover:text-white" />
            </Link>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
