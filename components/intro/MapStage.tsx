"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { WORLD_MAP } from "@/components/map/worldMap";

// The wave starts at Nairobi, as a share of the map box.
const AX = (WORLD_MAP.anchors.nairobi[0] / WORLD_MAP.width) * 100;
const AY = (WORLD_MAP.anchors.nairobi[1] / WORLD_MAP.height) * 100;
const FEATHER = 120;

interface Props {
  play: boolean;
  /** Jump to the settled state with no motion (skip, reduced motion). */
  instant: boolean;
  speed: number;
}

// The wave radius comes in as the CSS variable --wave (px), set each frame by
// the globe on an ancestor. Without it the map shows in full.
const MASK = `radial-gradient(circle at ${AX}% ${AY}%, #000 calc(var(--wave, 4000px) - ${FEATHER}px), transparent var(--wave, 4000px))`;
const RING = `radial-gradient(circle at ${AX}% ${AY}%, transparent calc(var(--wave, 0px) - 70px), rgba(70,160,255,0.22) calc(var(--wave, 0px) - 18px), rgba(160,240,255,0.32) calc(var(--wave, 0px) - 6px), transparent var(--wave, 0px))`;
const BOX = { width: "min(92%, calc((100dvh - 150px) * 1000 / 520))", aspectRatio: `${WORLD_MAP.width} / ${WORLD_MAP.height}` };

export default function MapStage({ play, instant, speed }: Props) {
  if (!play) return null;
  const s = 1 / speed;

  return (
    <motion.div
      className="absolute inset-x-3 bottom-3 top-[76px] sm:inset-x-6 sm:bottom-6"
      initial={instant ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 * s }}
    >
      <BorderBeam theme="light" colorVariant="colorful" size="md" className="h-full w-full" style={{ height: "100%" }}>
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[20px] border border-black/[0.06] bg-white">
          {/* Revealed through the same wave that melts the blocks, soft-edged */}
          <div className="relative" style={{ ...BOX, maskImage: MASK, WebkitMaskImage: MASK }}>
            <Image src={WORLD_MAP.src} alt="" fill unoptimized priority draggable={false} />
          </div>
          {/* Faint fluorescent ring riding the wave front */}
          {!instant && <div aria-hidden="true" className="pointer-events-none absolute" style={{ ...BOX, background: RING }} />}
        </div>
      </BorderBeam>
    </motion.div>
  );
}
