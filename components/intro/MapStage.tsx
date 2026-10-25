"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WORLD_MAP, MAP_BOX_WIDTH, MAP_RESERVE, MAP_TOP } from "@/components/map/worldMap";
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
// Progressive blur along the bottom, Apple-style: [blur px, mask from %, to %].
const PROGRESSIVE: [number, number, number][] = [
  [1.5, 0, 30],
  [4, 25, 55],
  [9, 50, 80],
  [18, 72, 100],
];
const BOX = { width: MAP_BOX_WIDTH, aspectRatio: `${WORLD_MAP.width} / ${WORLD_MAP.height}` };

export default function MapStage({ play, instant, speed }: Props) {
  if (!play) return null;
  const s = 1 / speed;

  return (
    <motion.div
      // Leaves the bottom band to the statement and chat (see mapRect).
      className="absolute inset-x-3 sm:inset-x-6"
      style={{ top: MAP_TOP, bottom: MAP_RESERVE }}
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
          {/* The map softens and fades as it leaves the eye line. Over the map
              but under the cards, so no card is ever blurred; gone when zoomed in. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
            style={{ opacity: "calc(1 - var(--immersed, 0))" }}
          >
            {PROGRESSIVE.map(([blur, from, to], i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  backdropFilter: `blur(${blur}px)`,
                  WebkitBackdropFilter: `blur(${blur}px)`,
                  maskImage: `linear-gradient(to bottom, transparent ${from}%, #000 ${to}%)`,
                  WebkitMaskImage: `linear-gradient(to bottom, transparent ${from}%, #000 ${to}%)`,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white" />
          </div>
          {/* Faint fluorescent ring riding the wave front */}
          {!instant && <div aria-hidden="true" className="pointer-events-none absolute" style={{ ...BOX, background: RING }} />}
          {/* Legend: one line on what the heat means, in the empty South
              Pacific at the map's bottom-left. Outside the map's filter so it
              stays sharp; gone when the camera flies in. */}
          <div className="pointer-events-none absolute" style={{ ...BOX, opacity: "calc(1 - var(--immersed, 0))" }}>
            <motion.div
              className="absolute bottom-[3%] left-[1%] flex items-center gap-2.5"
              initial={instant ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: instant ? 0 : 1.6 * s }}
            >
              <span
                aria-hidden="true"
                className="h-[5px] w-14 shrink-0"
                style={{ background: "linear-gradient(90deg, #1f40ff, #1abfff, #4de659, #ffeb26, #ff8c1a, #f22626)" }}
              />
              <span className="whitespace-nowrap font-mono text-[10px] leading-none tracking-[0.01em] text-black/50">
                Heat: where the work happened and who it served, by depth of work
              </span>
            </motion.div>
          </div>
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
