"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WORLD_MAP } from "@/components/map/worldMap";
import HeatLayer from "@/components/map/HeatLayer";
import MapCards from "@/components/map/MapCards";

// The wave starts at the map's centre.
const AX = 50;
const AY = 50;
const FEATHER = 220;

interface Props {
  play: boolean;
  /** Jump to the settled state with no motion (skip, reduced motion). */
  instant: boolean;
  speed: number;
}

// The wave radius comes in as the CSS variable --wave (px), set each frame by
// the globe on an ancestor. Without it the map shows in full.
const MASK = `radial-gradient(circle at ${AX}% ${AY}%, #000 calc(var(--wave, 4000px) - ${FEATHER}px), transparent var(--wave, 4000px))`;
const RING = `radial-gradient(circle at ${AX}% ${AY}%, transparent calc(var(--wave, 0px) - 70px), rgba(70,160,255,0.22) calc(var(--wave, 0px) - 30px), rgba(160,240,255,0.32) calc(var(--wave, 0px) - 6px), transparent var(--wave, 0px))`;
const BOX = { width: "min(84%, calc((100dvh - 190px) * 1000 / 520))", aspectRatio: `${WORLD_MAP.width} / ${WORLD_MAP.height}` };

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
      {/* No frame: the map sits straight on the page with room round it. */}
      <div className="h-full w-full">
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Revealed through the same wave that melts the blocks, soft-edged */}
          {/* The map itself; immersive mode softens it without touching the cards. */}
          <div
            className="relative"
            style={{
              ...BOX,
              maskImage: MASK,
              WebkitMaskImage: MASK,
              filter: "var(--map-bg-filter, none)",
              opacity: "var(--map-bg-opacity, 1)",
              // Turns with the camera orbit when immersed; "none" when flat.
              transform: "var(--map-tilt, none)",
            }}
          >
            <HeatLayer delay={instant ? 0 : 0.5 / speed} />
            <Image src={WORLD_MAP.src} alt="" fill unoptimized priority draggable={false} />
          </div>
          {/* Faint fluorescent ring riding the wave front */}
          {!instant && <div aria-hidden="true" className="pointer-events-none absolute" style={{ ...BOX, background: RING }} />}
          {/* Project cards, outside the mask so stacks can rise above the map edge */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto relative" style={BOX}>
              <MapCards delay={instant ? 0 : 0.55 / speed} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
