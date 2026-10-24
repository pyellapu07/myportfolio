"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { WORLD_MAP } from "@/components/map/worldMap";

const EASE = [0.65, 0, 0.35, 1] as const;

// The zoom-out starts close in on East Africa, where the NASA Harvest work
// sits, and ripples out from the same point.
const [AX, AY] = WORLD_MAP.anchors.nairobi;
const ANCHOR_X = (AX / WORLD_MAP.width) * 100;
const ANCHOR_Y = (AY / WORLD_MAP.height) * 100;

const RIPPLES = [0, 1, 2];

interface Props {
  play: boolean;
  /** Jump to the settled state with no motion (skip, reduced motion). */
  instant: boolean;
  speed: number;
}

export default function MapStage({ play, instant, speed }: Props) {
  if (!play) return null;
  const s = 1 / speed;

  return (
    <motion.div
      className="absolute inset-x-3 bottom-3 top-[92px] sm:inset-x-6 sm:bottom-6"
      initial={instant ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 * s }}
    >
      <BorderBeam theme="light" colorVariant="colorful" size="md" className="h-full w-full" style={{ height: "100%" }}>
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[20px] border border-black/[0.06] bg-white">
          <motion.div
            className="relative"
            style={{
              width: "min(92%, calc((100dvh - 150px) * 1000 / 520))",
              aspectRatio: `${WORLD_MAP.width} / ${WORLD_MAP.height}`,
              transformOrigin: `${ANCHOR_X}% ${ANCHOR_Y}%`,
            }}
            initial={instant ? false : { scale: 3.4 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4 * s, ease: EASE }}
          >
            <Image src={WORLD_MAP.src} alt="" fill unoptimized priority draggable={false} />

            <div className="absolute" style={{ left: `${ANCHOR_X}%`, top: `${ANCHOR_Y}%` }}>
              <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.22),rgba(34,211,238,0.12)_45%,transparent_70%)] blur-md" />
              {RIPPLES.map((i) => (
                <motion.span
                  key={i}
                  className="absolute -left-3 -top-3 h-6 w-6 rounded-full"
                  style={{ boxShadow: "0 0 0 1.5px rgba(124,58,237,0.75), 0 0 16px 2px rgba(34,211,238,0.45)" }}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [0.4, 9], opacity: [0.9, 0] }}
                  transition={{
                    duration: 2.2 * s,
                    delay: (instant ? 0 : 1.1 * s) + i * 0.7 * s,
                    repeat: Infinity,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ))}
              <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-gradient-to-br from-violet-600 to-cyan-400 shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
            </div>
          </motion.div>
        </div>
      </BorderBeam>
    </motion.div>
  );
}
