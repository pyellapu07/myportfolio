"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORD = "pradeep.";

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"idle" | "letters" | "bar" | "reveal">("idle");
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("loadingSeen")) {
      setMounted(false);
      return;
    }

    document.body.style.overflow = "hidden";
    setPhase("letters");

    // Letters stagger done → show bar
    const t1 = setTimeout(() => setPhase("bar"), 900);
    // Bar fills → split reveal
    const t2 = setTimeout(() => setPhase("reveal"), 2500);
    // Curtains gone → unmount
    const t3 = setTimeout(() => {
      setMounted(false);
      sessionStorage.setItem("loadingSeen", "1");
      document.body.style.overflow = "";
    }, 3300);

    return () => {
      [t1, t2, t3].forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  const revealing = phase === "reveal";

  return (
    <>
      {/* Top curtain */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-[9995] bg-[#0a0a0a]"
        style={{ height: "50vh" }}
        animate={{ y: revealing ? "-100%" : "0%" }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Bottom curtain */}
      <motion.div
        className="fixed left-0 right-0 z-[9995] bg-[#0a0a0a]"
        style={{ top: "50vh", height: "50vh" }}
        animate={{ y: revealing ? "100%" : "0%" }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Center content — fades out just before curtains split */}
      <AnimatePresence>
        {!revealing && (
          <motion.div
            key="loader-content"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[9996] flex flex-col items-center justify-center gap-6 pointer-events-none select-none"
          >
            {/* Vertical accent lines — matches hero motif */}
            <div className="absolute inset-0 overflow-hidden opacity-[0.04]"
              style={{
                backgroundImage: "linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "130px 100%",
              }}
            />

            {/* Word mark */}
            <div className="flex items-baseline relative z-10">
              {WORD.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 48, filter: "blur(4px)" }}
                  animate={
                    phase === "letters" || phase === "bar"
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : {}
                  }
                  transition={{
                    delay: 0.05 + i * 0.07,
                    type: "spring",
                    stiffness: 380,
                    damping: 22,
                  }}
                  className="font-mono font-bold tracking-tight text-[clamp(3.5rem,10vw,7rem)]"
                  style={{ color: char === "." ? "#FF5210" : "#ffffff" }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={phase === "bar" ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-mono text-xs uppercase tracking-[0.25em] text-white/30 relative z-10"
            >
              product designer · ux researcher
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={phase === "bar" ? { opacity: 1 } : {}}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-[160px] h-px bg-white/10 overflow-hidden rounded-full"
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#FF5210] rounded-full"
                initial={{ width: "0%" }}
                animate={phase === "bar" ? { width: "100%" } : {}}
                transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orange sweep line that crosses center on reveal */}
      <AnimatePresence>
        {revealing && (
          <motion.div
            key="sweep"
            className="fixed left-0 right-0 z-[9997] h-px bg-[#FF5210]"
            style={{ top: "50vh" }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
