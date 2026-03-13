"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRecruiter } from "@/lib/recruiter-context";
import { ROTATING_WORDS, TICKER_ITEMS } from "@/lib/constants";
import HeroParticles from "./HeroParticles";
import UXAuditGame from "./UXAuditGame";
import MacFinderWindow, { MacFolderIcon } from "./MacFinderWindow";
import { Volume2, VolumeX } from "lucide-react";

export default function Hero() {
  const { isRecruiterMode } = useRecruiter();
  const [wordIndex, setWordIndex] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [finderOpen, setFinderOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Prevents entrance animation from re-running on finderOpen toggle
  const folderShownRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleGameStart = useCallback(() => setGameActive(true), []);
  const handleGameExit = useCallback(() => setGameActive(false), []);

  const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section id="hero-section" className="hero-gradient bg-lines relative flex min-h-screen flex-col justify-between overflow-hidden pt-16">
      {/* Physics particle field — floats behind content */}
      {!gameActive && <HeroParticles onGameStart={handleGameStart} />}

      {/* Main content — left aligned */}
      <motion.div
        animate={{ opacity: gameActive ? 0 : 1, scale: gameActive ? 0.97 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-1 flex-col justify-center px-8 py-24 md:px-16 lg:px-24"
        style={{ pointerEvents: gameActive ? "none" : "auto" }}
      >
        {/* Self emoticon video — mobile only (sticker version shows on desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-4 md:hidden"
        >
          <div className="relative inline-block">
            <video
              ref={videoRef}
              src="/grok-video-202a19e2-8bfb-4c98-8ac7-c28be5820793.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-16 w-16 rounded-full object-cover"
              aria-label="Pradeep's animated avatar introducing himself"
              onEnded={() => {
                // When audio play finishes, re-mute and resume silent loop
                if (videoRef.current && !videoRef.current.muted) {
                  videoRef.current.muted = true;
                  videoRef.current.loop = true;
                  videoRef.current.play();
                  setIsMuted(true);
                }
              }}
            />
            <button
              onClick={() => {
                if (videoRef.current) {
                  if (isMuted) {
                    // One-shot audio play: restart from beginning, unmute, disable loop
                    videoRef.current.currentTime = 0;
                    videoRef.current.muted = false;
                    videoRef.current.loop = false;
                    videoRef.current.play();
                    setIsMuted(false);
                  } else {
                    // Manual mute mid-play
                    videoRef.current.muted = true;
                    videoRef.current.loop = true;
                    setIsMuted(true);
                  }
                }
              }}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-500 backdrop-blur-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label={isMuted ? "Listen to intro" : "Mute"}
            >
              {isMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
            </button>
          </div>
        </motion.div>

        {/* Top row: greeting + availability */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center gap-4"
        >
          <p className="font-mono text-sm text-neutral-500">
            {isRecruiterMode ? (
              <>Hi recruiter, I&apos;m <span className="text-neutral-900">Pradeep</span></>
            ) : (
              <>Heyy Bub, I&apos;m <span className="text-neutral-900">Pradeep</span></>
            )}
          </p>

          <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1">
            <span className="pulse-dot h-2 w-2 rounded-full bg-success" />
            <span className="font-mono text-[11px] text-success">
              Available for projects
            </span>
          </div>
        </motion.div>

        {/* Big bold hero text */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="max-w-[900px] font-display text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-neutral-900"
        >
          A product designer{" "}
          <br className="hidden md:block" />
          with a focus on{" "}
          <br className="hidden md:block" />
          <span className="relative inline-grid grid-cols-1 overflow-hidden align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={wordIndex}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="col-start-1 row-start-1 text-accent"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            {/* Invisible copy to hold width/height */}
            <span className="invisible col-start-1 row-start-1 opacity-0">
              {ROTATING_WORDS[wordIndex]}
            </span>
          </span>
        </motion.h1>

        {/* Sub-description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 max-w-[520px] font-mono text-sm leading-relaxed text-neutral-400"
        >
          5+ years creating user-centered digital products. Reduced friction by 40%,
          boosted engagement by 167%. Currently at UMD.
        </motion.p>

        {/* Mobile creative work folder tap ─ hidden on desktop */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          onClick={() => setFinderOpen(true)}
          className="mt-6 flex items-center gap-2.5 self-start rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-white/80 active:scale-95 md:hidden"
        >
          <MacFolderIcon size={28} />
          <span className="font-mono text-[11px] font-medium text-neutral-500">creative work/</span>
        </motion.button>
      </motion.div>

      {/* Infinite scrolling company ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: gameActive ? 0 : 1 }}
        transition={{ delay: gameActive ? 0 : 0.8, duration: 0.8 }}
        className="relative z-10 border-t border-neutral-200 bg-white/30 backdrop-blur-sm"
      >
        <div className="overflow-hidden py-7">
          <div className="ticker-scroll flex items-center gap-16 whitespace-nowrap">
            {tickerDouble.map((item, i) => (
              <Image
                key={`${item.name}-${i}`}
                src={item.logo}
                alt={item.name}
                width={120}
                height={64}
                className="h-16 max-w-[110px] shrink-0 object-contain opacity-80"
                style={{ width: "auto" }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* UX Audit Game overlay */}
      <AnimatePresence>
        {gameActive && <UXAuditGame onExit={handleGameExit} />}
      </AnimatePresence>

      {/* ── Mac folder sticker — desktop only easter egg ──────────── */}
      {!gameActive && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          className="absolute z-[25] hidden cursor-grab select-none flex-col items-center gap-1 md:flex active:cursor-grabbing"
          style={{ right: "9%", top: "48%" }}
          /* initial=false after first mount so finderOpen toggles don't re-run entrance */
          initial={folderShownRef.current ? false : { opacity: 0, rotate: -7, scale: 0.85 }}
          animate={{ opacity: 1, rotate: -7, scale: 1 }}
          transition={folderShownRef.current ? { duration: 0 } : { delay: 2.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => { folderShownRef.current = true; }}
          whileHover={{ scale: 1.08, rotate: -5, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setFinderOpen(true)}
        >
          <MacFolderIcon size={72} />
          <span className="font-mono text-[9.5px] font-medium text-neutral-400 tracking-wide">
            creative/
          </span>
        </motion.div>
      )}

      {/* Mac Finder window */}
      {finderOpen && <MacFinderWindow onClose={() => setFinderOpen(false)} />}
    </section>
  );
}

