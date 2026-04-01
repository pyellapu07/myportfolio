"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRecruiter } from "@/lib/recruiter-context";
import { ROTATING_WORDS, TICKER_ITEMS } from "@/lib/constants";
import HeroParticles from "./HeroParticles";
import DesignRescueGame from "./DesignRescueGame";
import MacFinderWindow, { MacFolderIcon } from "./MacFinderWindow";
import { Volume2, VolumeX } from "lucide-react";

export default function Hero() {
  const { isRecruiterMode } = useRecruiter();
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState(ROTATING_WORDS[0]);
  const [gameActive, setGameActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [finderOpen, setFinderOpen] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Prevents entrance animation from re-running on finderOpen toggle
  const folderShownRef = useRef(false);
  // After DHS badge entrance completes, drop the 3.2s delay so hover exit snaps back
  const [dhsEntered, setDhsEntered] = useState(false);

  // Cards peek out of folder every ~4.5s, retract after 1.6s
  useEffect(() => {
    function doPeek() {
      setIsPeeking(true);
      setTimeout(() => setIsPeeking(false), 1600);
    }
    const init = setTimeout(() => {
      doPeek();
      const iv = setInterval(doPeek, 4500);
      return () => clearInterval(iv);
    }, 3200);
    return () => clearTimeout(init);
  }, []);

  // 3 images to peek out of the folder
  const PEEK_CARDS = [
    "/creative-work/blossom poster OW5_1.5x.png",
    "/creative-work/TerpsEsportsGraphic.jpeg",
    "/creative-work/valorant premier 2_1.5x_2x.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Scramble effect — cycles random chars then locks in left-to-right when word changes
  useEffect(() => {
    const target = ROTATING_WORDS[wordIndex];
    const LC = "abcdefghijklmnopqrstuvwxyz";
    const UC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let frame = 0;
    const TOTAL = 22;
    const id = setInterval(() => {
      const lockCount = Math.floor((frame / TOTAL) * target.length);
      const next = target.split("").map((char, i) => {
        if (char === " ") return " ";
        if (i < lockCount) return char;
        const pool = char !== char.toLowerCase() ? UC : LC;
        return pool[Math.floor(Math.random() * pool.length)];
      }).join("");
      setScrambledWord(next);
      frame++;
      if (frame >= TOTAL) { clearInterval(id); setScrambledWord(target); }
    }, 42);
    return () => clearInterval(id);
  }, [wordIndex]);

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
              src="/Profileaudioalternative.mp4"
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
              <>Hii! I&apos;m <span className="text-neutral-900">Pradeep</span></>
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
          <span className="relative inline-grid grid-cols-1 align-bottom">
            <span className="col-start-1 row-start-1 text-accent">
              {scrambledWord}
            </span>
            {/* Invisible copy holds container width at target word size */}
            <span className="invisible col-start-1 row-start-1 opacity-0" aria-hidden>
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
          3+ years creating user-centered digital products. I run usability studies, read the analytics, and ship work that holds up across every user type. Previously at MarketCrunch AI (San Francisco), NASA Harvest UMD, Computacenter UK. ✦
        </motion.p>

        {/* Mobile creative work folder tap ─ hidden on desktop */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          onClick={() => setFinderOpen(true)}
          className="mt-6 flex items-center gap-2.5 self-start rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-white/80 active:scale-95 md:hidden"
        >
          {/* Mobile folder with mini peek cards */}
          <div style={{ position: "relative", width: 28, height: 22, overflow: "visible", flexShrink: 0 }}>
            {PEEK_CARDS.map((src, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute", width: 18, height: 14,
                  borderRadius: 2, overflow: "hidden",
                  left: "50%", top: "10%", marginLeft: -9,
                  zIndex: 2 + i,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                  transformOrigin: "bottom center",
                }}
                animate={isPeeking
                  ? { y: -(4 + i * 7), rotate: (i - 1) * 11, opacity: 1 }
                  : { y: 5, rotate: (i - 1) * 2, opacity: 0.8 }}
                transition={{ type: "spring", stiffness: 280, damping: 22, delay: isPeeking ? i * 0.07 : (2 - i) * 0.05 }}
              >
                <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
              </motion.div>
            ))}
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
              <MacFolderIcon size={28} uid="mob" />
            </div>
          </div>
          <span className="font-mono text-[11px] font-medium text-neutral-500">creativesidehustle/</span>
        </motion.button>
      </motion.div>

      {/* Infinite scrolling company ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: gameActive ? 0 : 1 }}
        transition={{ delay: gameActive ? 0 : 0.8, duration: 0.8 }}
        className="relative z-[20] border-t border-neutral-200 bg-white/40 backdrop-blur-md"
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
        {gameActive && <DesignRescueGame onExit={handleGameExit} />}
      </AnimatePresence>

      {/* ── Mac folder sticker — desktop only easter egg ──────────── */}
      {!gameActive && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          data-tour="folder"
          className="absolute z-[25] hidden cursor-grab select-none flex-col items-center gap-1 md:flex active:cursor-grabbing"
          style={{ right: "20%", top: "32%" }}
          /* initial=false after first mount so finderOpen toggles don't re-run entrance */
          initial={folderShownRef.current ? false : { opacity: 0, rotate: -7, scale: 0.85 }}
          animate={{ opacity: 1, rotate: -7, scale: 1 }}
          transition={folderShownRef.current ? { duration: 0 } : { delay: 2.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => { folderShownRef.current = true; }}
          whileHover={{ scale: 1.08, rotate: -5, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setFinderOpen(true)}
        >
          {/* Desktop folder with peek cards behind it */}
          <div style={{ position: "relative", width: 100, height: 80, overflow: "visible" }}>
            {PEEK_CARDS.map((src, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute", width: 58, height: 44,
                  borderRadius: 6, overflow: "hidden",
                  left: "50%", top: "8%", marginLeft: -29,
                  zIndex: 2 + i,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.28)",
                  transformOrigin: "bottom center",
                }}
                animate={isPeeking
                  ? { y: -(14 + i * 20), rotate: (i - 1) * 13, opacity: 1 }
                  : { y: 10, rotate: (i - 1) * 2.5, opacity: 0.85 }}
                transition={{ type: "spring", stiffness: 280, damping: 22, delay: isPeeking ? i * 0.07 : (2 - i) * 0.05 }}
              >
                <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
              </motion.div>
            ))}
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
              <MacFolderIcon size={100} uid="desk" />
            </div>
          </div>
          <span className="font-mono text-[10px] font-medium text-neutral-400 tracking-wide">
            creativesidehustle/
          </span>
        </motion.div>
      )}

      {/* Mac Finder window */}
      {finderOpen && <MacFinderWindow onClose={() => setFinderOpen(false)} />}

      {/* ── DHS Trusted Tester badge sticker — desktop only ───────── */}
      {!gameActive && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          className="absolute z-[25] hidden cursor-grab select-none flex-col items-center gap-1.5 md:flex active:cursor-grabbing"
          style={{ right: "5%", top: "54%" }}
          initial={{ opacity: 0, rotate: 8, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 8, scale: 1 }}
          transition={dhsEntered ? { duration: 0.25, ease: "easeOut" } : { delay: 3.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setDhsEntered(true)}
          whileHover={{ scale: 1.1, rotate: 4, transition: { duration: 0.2, type: "tween" } }}
          whileTap={{ scale: 0.96 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Trusted Tester Badge.png"
            alt="DHS Trusted Tester Certified"
            draggable={false}
            className="w-44"
            style={{ pointerEvents: "none", filter: "drop-shadow(4px 4px 4px rgba(0,0,0,0.15))" }}
          />
          <span className="font-mono text-[9px] font-medium tracking-wide text-neutral-400">
            A DHS Trusted Tester 🫡
          </span>
        </motion.div>
      )}
    </section>
  );
}

