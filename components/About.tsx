"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Caveat } from "next/font/google";
import SectionWrapper from "./SectionWrapper";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

/* ─── Highlight marker ──────────────────────────────────────────────────── */
type HiColor = "yellow" | "green" | "blue" | "pink" | "purple";
function Hi({ children, color = "yellow" }: { children: React.ReactNode; color?: HiColor }) {
  const palette: Record<HiColor, string> = {
    yellow: "bg-yellow-200/90 text-yellow-900",
    green:  "bg-green-200/90  text-green-900",
    blue:   "bg-sky-200/90    text-sky-900",
    pink:   "bg-pink-200/90   text-pink-900",
    purple: "bg-purple-200/90 text-purple-900",
  };
  return (
    <mark className={`${palette[color]} px-1 rounded-[3px] not-italic`}>
      {children}
    </mark>
  );
}

/* ─── Cursive accent ────────────────────────────────────────────────────── */
function Cur({ children }: { children: React.ReactNode }) {
  return (
    <span className={`${caveat.className} text-primary text-[1.18em] italic font-bold`}>
      {children}
    </span>
  );
}

/* ─── Project link with GIF tooltip ────────────────────────────────────── */
function PLink({ href, label, gif }: { href: string; label: string; gif: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <Link
        href={href}
        className="text-primary font-medium underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-all"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {label}
      </Link>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-64 rounded-xl overflow-hidden shadow-2xl border border-white/10 pointer-events-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gif} alt={`${label} preview`} className="w-full h-auto block" />
        </motion.div>
      )}
    </span>
  );
}

/* ─── Polaroid — square ─────────────────────────────────────────────────── */
function Polaroid({
  src,
  caption,
  rotate = 0,
  delay = 0,
}: {
  src: string;
  caption: string;
  rotate?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotate: `${rotate}deg` }}
      className="relative bg-white p-[10px] pb-9 shadow-md cursor-pointer"
    >
      <div className="w-full aspect-square overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption} className="w-full h-full object-cover" />
      </div>
      <p className={`${caveat.className} absolute bottom-1.5 left-0 right-0 text-center text-[13px] text-neutral-500 px-1`}>
        {caption}
      </p>
    </motion.div>
  );
}

/* ─── Polaroid — landscape ──────────────────────────────────────────────── */
function PolaroidLandscape({
  src,
  caption,
  rotate = 0,
  delay = 0,
  aspectClass = "aspect-video",
}: {
  src: string;
  caption: string;
  rotate?: number;
  delay?: number;
  aspectClass?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, rotate: 0, zIndex: 20 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotate: `${rotate}deg` }}
      className="relative bg-white p-[10px] pb-9 shadow-md cursor-pointer"
    >
      <div className={`w-full ${aspectClass} overflow-hidden bg-neutral-100`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption} className="w-full h-full object-cover" />
      </div>
      <p className={`${caveat.className} absolute bottom-1.5 left-0 right-0 text-center text-[13px] text-neutral-500 px-1`}>
        {caption}
      </p>
    </motion.div>
  );
}

/* ─── Data ──────────────────────────────────────────────────────────────── */

// Remaining photos not in the float column — shown in the loop strip
const LOOP_PHOTOS = [
  { src: "/About m/Me waving hand to a giraffe in kenya safari.JPEG",                              caption: "networking IRL 🦒",               rotate:  2  },
  { src: "/About m/me and gang at the midnight mile run terps umd.JPEG",                           caption: "midnight chaos, UMD edition 🏃",   rotate: -1  },
  { src: "/About m/lego spidey and ghost rider photography by me.JPEG",                            caption: "desk decor. totally. 🕷️",         rotate: -3  },
  { src: "/About m/xylem lab team group picture.JPEG",                                              caption: "Nairobi, March 2026 🌍",           rotate:  1  },
  { src: "/About m/Me smiling in the safari van.JPEG",                                             caption: "safari pt. 2 🦁",                  rotate: -2  },
  { src: "/About m/Me and my friends' shadow photography on beach sand with coconuts chilling lol.JPEG", caption: "beach but make it arty 🎨",  rotate:  2  },
  { src: "/About m/me with our mascot testudo.JPEG",                                               caption: "Testudo said we're valid ✅",       rotate: -1  },
  { src: "/About m/me with gang bice flex lol.JPEG",                                               caption: "gym bros occasionally 💪",         rotate:  3  },
];

const EXPERIENCES = [
  { company: "NASA Harvest · Xylem Institute",  role: "Product Designer & UX Researcher",       period: "2025 – Present",  href: "/work/xylem-institute" },
  { company: "MarketCrunch AI",                 role: "Product Design Intern · Sole Designer",  period: "Summer 2025",     href: "/work/marketcrunch"    },
  { company: "Hack4Impact UMD",                 role: "Product Designer & Researcher",          period: "Spring 2025",     href: "/work/hack4impact"     },
  { company: "Terps Esports · UMD",            role: "Creative Director & Graphic Designer",   period: "2024 – Present",  href: "/work/terps-esports"   },
  { company: "Computacenter UK",                role: "UX & Automation Analyst",                period: "2023 – 2024",     href: null                    },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function About() {
  return (
    <SectionWrapper id="about" alternate>

      {/* Tag */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
      >
        About Me
      </motion.span>

      {/* Hero heading */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="mt-4"
      >
        <h2 className="font-heading text-4xl font-bold leading-tight text-text md:text-[3.25rem]">
          Hi, I&apos;m Pradeep.
        </h2>
        <p className="mt-2 font-mono text-sm tracking-wide text-text-secondary">
          Product Designer &amp; Researcher &nbsp;·&nbsp; Seeking Full-time roles
        </p>
      </motion.div>

      {/* Story + polaroids — float layout so text stretches full-width below photos */}
      <div className="mt-12">

        {/* Polaroid column — floated right, text wraps around it */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="float-right ml-10 mb-6 flex w-[300px] flex-col gap-5 md:w-[340px]"
        >
          {/* 1 — landscape esports team */}
          <PolaroidLandscape
            src="/About m/me and my esports gang.JPEG"
            caption="not gamers, strategists 🎮"
            rotate={-1.5}
            delay={0.1}
            aspectClass="aspect-video"
          />
          {/* 2 — big landscape safari */}
          <PolaroidLandscape
            src="/About m/Me smiling in the safari van 2.JPEG"
            caption="zero wifi, max smiles 🦁"
            rotate={2}
            delay={0.18}
            aspectClass="aspect-[3/2]"
          />
          {/* 3 — two square polaroids */}
          <div className="grid grid-cols-2 gap-4">
            <Polaroid
              src="/About m/Me with my all time go to Chai Latte starbucks.JPEG"
              caption="my design partner ☕"
              rotate={-2.5}
              delay={0.26}
            />
            <Polaroid
              src="/About m/me wall climbing.JPEG"
              caption="when deadlines hit 🧗"
              rotate={2}
              delay={0.32}
            />
          </div>
        </motion.div>

        {/* Story — stretches to full width once polaroid column ends */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="space-y-5 text-[15.5px] leading-[1.82] text-text-secondary"
        >
          <p>
            Grew up in <Hi color="blue">Vizag</Hi>, a coastal city in India where the sea is five minutes from everywhere and the pace of life actually lets you think. Quiet, clean, good food. Then moved to Chennai for uni at SRM, and that&apos;s where everything started to pick up speed.
          </p>
          <p>
            I&apos;d always been drawn to storytelling. Theatre, direction, making things. In university I joined the Movies &amp; Dramatics Club, and the president was running a clothing brand startup on the side. He needed a designer. I had no formal training, just curiosity and a lot of time on Figma. First real challenge: the cart icon felt wrong for clothes. Nobody puts clothes in a cart.{" "}
            <Hi color="yellow">They hang them.</Hi> So I drew a hanger icon from scratch with the pen tool. Built a horizontal scroll that felt like browsing through a real wardrobe. That decision got noticed. Calls started coming in from other entrepreneurs, student clubs, early-stage teams. I had no plan. It just kept going.
          </p>
          <p>
            The more I worked with people, the more I understood:{" "}
            <Hi color="pink">design isn&apos;t about what I find beautiful.</Hi> It&apos;s about what someone else can use without needing a manual. A product works when a first-grader and an 85-year-old both reach for it the same way.{" "}
            <Cur>That shift changed how I think about everything.</Cur>
          </p>
          <p>
            CS and Business Systems degree in hand, I started noticing a gap. Good design without evidence is decoration.{" "}
            <Hi color="green">Started bridging data analytics with product work.</Hi> Computacenter UK hired me during my final year. A year in, my manager asked me something I still think about: not how do we fix this problem, but why does this problem exist in the first place.{" "}
            <Cur>Root cause over symptom.</Cur> Completely different game.
          </p>
          <p>
            Came to the US for my MS in Data Science + UX Research at{" "}
            <Hi color="blue">University of Maryland.</Hi> Joined{" "}
            <PLink href="/work/hack4impact" label="Hack4Impact" gif="/hack4impactpreview.gif" /> as sole Product Designer and redesigned a full recruitment system handling{" "}
            <Hi color="yellow">750+ applicants per semester</Hi>, presented to stakeholders including Microsoft Reston and CMNS directors. Then interned at{" "}
            <PLink href="/work/marketcrunch" label="MarketCrunch AI" gif="/marketcrunchaipreview.gif" /> in San Francisco as their sole designer. Audited the full product, shipped features, helped grow MAU roughly 16x.
          </p>
          <p>
            After the internship I watched a TED talk by a NASA-affiliated data scientist at UMD and sent her a cold email. One coffee chat later I was in her lab. Now building{" "}
            <PLink href="/work/xylem-institute" label="Xylem Institute" gif="/xylemlabscreenrecording.gif" />, turning 3-day satellite data pipelines into{" "}
            <Hi color="green">30-minute policy bulletins</Hi> for analysts across 9 countries. Designed the brand, the UX, the entire system. In March 2026 they flew me to <Cur>Nairobi, Kenya</Cur> to train professionals on the tools I&apos;d built. Watching them use it without any confusion, no hand-holding needed. That&apos;s the whole point.
          </p>
          <p>
            Alongside all of that, I creative-directed{" "}
            <PLink href="/work/terps-esports" label="Terps Esports" gif="/Esports/displaygif.gif" /> at UMD. Motion graphics, brand identity, event shoots. Started as a one-off project and turned into a full creative operation over two years.
          </p>
          <p>
            Off the clock: I&apos;ve been collecting{" "}
            <Hi color="purple">Marvel, Star Wars and comic action figures</Hi> since I was five. It started with Kinder Joy superhero capsules — my parents used them to get me to eat, and I kept every single one. The first full figure I got was Spider-Man. I&apos;m well into my 50s now. Every one of them has a story. My dad also used to bring home Lego sets when I was a kid. Building them was meditative, but what I remember most is losing one piece and the whole set feeling incomplete. That stuck with me more than I expected. A thing is either finished or it isn&apos;t. Applies to design the same way.
          </p>
        </motion.div>

        {/* Clear float so experiences section sits below everything */}
        <div className="clear-both" />
      </div>

      {/* Experiences */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-20"
      >
        <p className="mb-6 font-mono text-xs font-medium uppercase tracking-widest text-primary">
          Experience
        </p>
        <div className="divide-y divide-border/30">
          {EXPERIENCES.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="group flex items-center justify-between py-4"
            >
              <div>
                <p className="text-[15px] font-medium text-text transition-colors group-hover:text-primary">
                  {exp.href ? (
                    <Link href={exp.href}>{exp.company}</Link>
                  ) : (
                    exp.company
                  )}
                </p>
                <p className="mt-0.5 text-sm text-text-secondary">{exp.role}</p>
              </div>
              <span className="ml-6 whitespace-nowrap font-mono text-xs text-text-secondary/50">
                {exp.period}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Infinite photo loop ───────────────────────────────────────────── */}
      <div
        className="mt-16 -mx-8 overflow-hidden py-8 md:-mx-16 lg:-mx-24"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, ease: "linear", repeat: Infinity, repeatType: "loop" }}
          className="flex gap-4"
          style={{ width: "max-content" }}
        >
          {/* Duplicate array for seamless loop */}
          {[...LOOP_PHOTOS, ...LOOP_PHOTOS].map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.06, rotate: 0, zIndex: 20 }}
              transition={{ duration: 0.25 }}
              style={{ rotate: `${p.rotate}deg`, minWidth: 360 }}
              className="relative bg-white p-[10px] pb-10 shadow-md cursor-pointer flex-shrink-0"
            >
              <div className="w-[340px] aspect-[3/2] overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption} className="w-full h-full object-cover" />
              </div>
              <p className={`${caveat.className} absolute bottom-1 left-0 right-0 text-center text-[12px] text-neutral-500 px-1`}>
                {p.caption}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </SectionWrapper>
  );
}
