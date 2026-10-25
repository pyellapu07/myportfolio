"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ARTIFACTS, type Artifact } from "./latest";

// Index view: a few artifacts pinned round the hero like a moodboard. Each is
// just the image, a bold block with sharp corners at its own size, with a
// small bordered tag under it holding one mono line. No titles. They drift
// slowly; hover lifts one. Wide screens only.

const EASE = [0.2, 0.6, 0.35, 1] as const;

// Where each sits (vw/vh of the first screen) and how wide it is: sizes
// deliberately uneven, like things dropped on a board.
const SPOTS = [
  { left: "5vw", top: "18vh", width: 172 },
  { left: "9vw", top: "47vh", width: 244 },
  { right: "6vw", top: "15vh", width: 214 },
  { right: "10vw", top: "50vh", width: 146 },
];

function Card({ a, width }: { a: Artifact; width: number }) {
  const inner = (
    <>
      <span className="block overflow-hidden" style={{ width, aspectRatio: a.aspect, background: a.bg ?? "#0a0a0a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- small, already-sized */}
        <img src={a.image} alt="" className={`h-full w-full ${a.bg ? "object-contain p-[12%]" : "object-cover"}`} draggable={false} />
      </span>
      {/* The tag: one line, mono, in a hairline box hanging off the image. */}
      <span className="mt-1.5 inline-block max-w-full truncate border border-black/[0.12] bg-white px-1.5 py-[3px] font-mono text-[9.5px] leading-none tracking-[0.01em] text-black/55">
        <span className="mr-1.5 text-black/35">{a.tag}</span>
        {a.caption}
      </span>
    </>
  );
  const cls = "block";
  return a.external ? (
    <a href={a.href} target="_blank" rel="noopener noreferrer" className={cls} draggable={false} aria-label={a.title}>
      {inner}
    </a>
  ) : (
    <Link href={a.href} className={cls} draggable={false} aria-label={a.title}>
      {inner}
    </Link>
  );
}

export default function Artifacts({ shown }: { shown: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[28] hidden lg:block">
      {ARTIFACTS.slice(0, SPOTS.length).map((a, i) => {
        const { width, ...pos } = SPOTS[i];
        return (
          <motion.div
            key={a.id}
            className="pointer-events-auto absolute"
            style={pos}
            initial={{ opacity: 0, y: 24 }}
            animate={shown ? { opacity: 1, y: [0, -6, 0] } : { opacity: 0, y: 24 }}
            transition={{
              opacity: { duration: 0.6, ease: EASE, delay: 0.2 + i * 0.08 },
              y: { duration: 6 + i, ease: "easeInOut", repeat: Infinity, delay: i * 0.7 },
            }}
            whileHover={{ scale: 1.04, transition: { duration: 0.35, ease: EASE } }}
          >
            <Card a={a} width={width} />
          </motion.div>
        );
      })}
    </div>
  );
}
