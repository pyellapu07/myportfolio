"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { WORLD_MAP } from "@/components/map/worldMap";

const EASE = [0.65, 0, 0.35, 1] as const;

// The zoom-out starts close in on East Africa, where the NASA Harvest work sits.
const [AX, AY] = WORLD_MAP.anchors.nairobi;
const ANCHOR_X = (AX / WORLD_MAP.width) * 100;
const ANCHOR_Y = (AY / WORLD_MAP.height) * 100;

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
      className="absolute inset-x-3 bottom-3 top-[76px] sm:inset-x-6 sm:bottom-6"
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
          </motion.div>
        </div>
      </BorderBeam>
    </motion.div>
  );
}
