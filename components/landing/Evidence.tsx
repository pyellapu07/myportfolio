"use client";

import { motion } from "framer-motion";
import { CommitGrid, SystemLedger } from "./Widgets";

// Index view: evidence cards pinned either side of the map, drifting slowly;
// hover lifts one. Wide screens only.

const EASE = [0.2, 0.6, 0.35, 1] as const;

const SPOTS = [
  { key: "commits", style: { left: "5vw", top: "21vh" }, render: () => <CommitGrid width={296} /> },
  { key: "ledger", style: { right: "9vw", top: "40vh" }, render: () => <SystemLedger width={318} /> },
];

export default function Evidence({ shown }: { shown: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[28] hidden lg:block">
      {SPOTS.map((w, i) => (
        <motion.div
          key={w.key}
          className="pointer-events-auto absolute"
          style={w.style}
          initial={{ opacity: 0, y: 24 }}
          animate={shown ? { opacity: 1, y: [0, -5, 0] } : { opacity: 0, y: 24 }}
          transition={{
            opacity: { duration: 0.6, ease: EASE, delay: 0.2 + i * 0.08 },
            y: { duration: 7 + i, ease: "easeInOut", repeat: Infinity, delay: i * 0.6 },
          }}
          whileHover={{ scale: 1.03, transition: { duration: 0.35, ease: EASE } }}
        >
          {w.render()}
        </motion.div>
      ))}
    </div>
  );
}
