"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Film, Pen, Palette, Play } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600"] });

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

/* ── Auto-scroll photo strip ── */
function PhotoStrip() {
  const trackRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let x = 0;
    let raf: number;
    const step = () => {
      x -= 0.5;
      if (Math.abs(x) >= el.scrollWidth / 2) x = 0;
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

/* ── Blue folder sticker with fanned images ── */
function FolderSticker() {
  const imgs = [
    "/Esports/blossom poster OW5_1.5x.png",
    "/Esports/TerpsEsportsGraphic.jpeg",
    "/Esports/valorant premier 2_1.5x_2x.jpg",
  ];
  const transforms = [
    "translateY(2.76px) rotate(-5.56deg)",
    "translateY(8px)",
    "translateY(8px) rotate(2.5deg)",
  ];
  return (
    <div className="inline-flex flex-col items-center gap-1" style={{ transform: "rotate(-5deg)" }}>
      <div className="relative" style={{ width: 72, height: 58, overflow: "visible" }}>
        {imgs.map((src, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 42, height: 33,
              borderRadius: 5,
              overflow: "hidden",
              left: "50%", top: "8%",
              marginLeft: -21,
              zIndex: i + 2,
              boxShadow: "rgba(0,0,0,0.28) 0px 2px 10px",
              transform: transforms[i],
              opacity: 0.85,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
          </div>
        ))}
        {/* Blue folder SVG on top */}
        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          <svg width="72" height="57.6" viewBox="0 0 60 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 14C4 11.8 5.8 10 8 10H22L26.5 14H4Z" fill="#1d4ed8" />
            <rect x="4" y="14" width="52" height="30" rx="4" fill="#1d4ed8" />
            <rect x="4" y="17" width="52" height="27" rx="3" fill="#2563eb" />
            <rect x="4" y="17" width="52" height="8" rx="3" fill="rgba(255,255,255,0.12)" />
          </svg>
        </div>
      </div>
      <span className={`text-[9px] font-medium tracking-wide text-neutral-400 ${caveat.className}`}>creative-work/</span>
    </div>
  );
}

/* ── Small blossom polaroid sticker ── */
function BlossomPolaroid() {
  return (
    <div
      className="inline-block bg-white shadow-lg flex-shrink-0"
      style={{ transform: "rotate(-4deg)", padding: "7px 7px 30px 7px", borderRadius: 3 }}
    >
      <div className="relative overflow-hidden" style={{ width: 88, height: 88 }}>
        <Image
          src="/Esports/blossom poster OW5_1.5x.png"
          alt="Blossom Poster"
          fill
          className="object-cover"
          sizes="88px"
        />
      </div>
      <p className={`mt-1.5 text-center text-[11px] text-gray-500 ${caveat.className}`}>blossom ow5</p>
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
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* LEFT: card stack */}
        <div className="flex flex-col gap-3">
          {/* Big featured card */}
          <Link href="/work/terps-esports">
            <div
              className="relative flex flex-col justify-between overflow-hidden rounded-[28px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: "#E21833", minHeight: 230 }}
            >
              <div className="relative z-10">
                <p className="font-bold text-white text-lg leading-tight">Graphic Designer</p>
                <p className="mt-0.5 font-sans text-sm text-white/80">@ Terps Esports</p>
              </div>
              <div className="relative z-10 mt-6 flex items-end justify-between">
                <div
                  className="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  Nov 2024 – Present
                </div>
                <div className="relative h-16 w-24 opacity-90">
                  <Image
                    src="/Esports/terpsesportslogo yellow white version.webp"
                    alt="Terps Esports"
                    fill
                    className="object-contain object-right-bottom"
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Small secondary cards */}
          {[
            { icon: <Film size={18} />,    role: "Video Director",  org: "@ Co-Ed Valorant Film" },
            { icon: <Pen size={18} />,     role: "Script Writer",   org: "@ Co-Ed Film" },
            { icon: <Palette size={18} />, role: "Brand Identity",  org: "@ Terps Esports" },
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

        {/* RIGHT: description + strip + stickers row */}
        <div className="flex flex-col gap-5">
          {/* Description */}
          <div>
            <p className="font-sans text-sm leading-relaxed text-text-muted">
              Designed game day graphics, directed a full green-screen Valorant intro film, and built the visual brand for UMD's competitive esports program.
            </p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-text-muted">
              Wrote the script, set the lighting, directed players, and edited the footage. Days and nights in post-production.
            </p>
          </div>

          {/* Photo strip — no floating folder */}
          <PhotoStrip />

          {/* Bottom sticker row: blossom polaroid + blue folder + Watch the Film */}
          <div className="flex items-end justify-between gap-3">
            {/* Blossom polaroid */}
            <BlossomPolaroid />

            {/* Blue folder */}
            <FolderSticker />

            {/* Watch the Film card */}
            <Link
              href="/work/terps-esports#te-coed"
              className="group relative overflow-hidden rounded-2xl bg-[#0a0a0a] p-4 transition-all duration-300 hover:rotate-0 hover:shadow-lg flex-shrink-0"
              style={{ transform: "rotate(6deg)", width: 148 }}
            >
              {/* Image with play button overlay */}
              <div className="relative mb-3 h-[72px] w-full overflow-hidden rounded-xl">
                <Image
                  src="/Esports/me explaining seth the camera man for the camera angles.jpeg"
                  alt="Co-Ed Valorant Film"
                  fill
                  className="object-cover"
                  sizes="148px"
                />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition-transform duration-200 group-hover:scale-110">
                    <Play size={11} className="ml-0.5 text-gray-900" fill="currentColor" />
                  </div>
                </div>
              </div>
              <p className="text-center font-sans text-[11px] font-bold text-white">Watch the Film</p>
              <p className="mt-0.5 text-center font-sans text-[9px] text-white/50">Co-Ed Valorant Intro</p>
            </Link>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
