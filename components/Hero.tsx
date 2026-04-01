"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRecruiter } from "@/lib/recruiter-context";
import { ROTATING_WORDS, TICKER_ITEMS, SITE } from "@/lib/constants";
import HeroParticles from "./HeroParticles";
import DesignRescueGame from "./DesignRescueGame";
import MacFinderWindow, { MacFolderIcon } from "./MacFinderWindow";
import { Volume2, VolumeX } from "lucide-react";
import { Caveat } from "next/font/google";
import MicrosoftBadgeSticker from "./MicrosoftBadgeSticker";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function Hero() {
  const { isRecruiterMode } = useRecruiter();
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState(ROTATING_WORDS[0]);
  const [tappedBadge, setTappedBadge] = useState<null | "microsoft" | "dhs">(null);
  const [gameActive, setGameActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [finderOpen, setFinderOpen] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Prevents entrance animation from re-running on finderOpen toggle
  const folderShownRef = useRef(false);
  // After DHS badge entrance completes, drop the 3.2s delay so hover exit snaps back
  const [dhsEntered, setDhsEntered] = useState(false);
  const [mediumEntered, setMediumEntered] = useState(false);

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
          <span className="relative inline-grid grid-cols-1 align-bottom min-h-[88px] md:min-h-0">
            <span className="col-start-1 row-start-1 text-accent">
              {scrambledWord}
            </span>
            {/* Invisible copy holds container size at target word — prevents layout shift */}
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

        {/* ── Mobile credential badges: Microsoft + DHS Trusted Tester ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-5 relative md:hidden"
        >
          {/* Badges row */}
          <div className="flex items-end gap-8">

            {/* Microsoft sticker — full trophy+confetti component */}
            <div className="relative">
              <button
                onClick={() => setTappedBadge(tappedBadge === "microsoft" ? null : "microsoft")}
                className="focus:outline-none active:scale-95 transition-transform block"
                aria-label="Microsoft MLSA badge, tap for info"
              >
                <MicrosoftBadgeSticker displaySize={88} />
              </button>

              {/* Caption below Microsoft badge */}
              <AnimatePresence>
                {tappedBadge === "microsoft" && (
                  <motion.div
                    key="ms-caption"
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -3, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="absolute top-full left-0 mt-1 w-52 pointer-events-none"
                    style={{ zIndex: 50 }}
                  >
                    {/* Cute curved arrow pointing UP-LEFT to badge */}
                    <svg width="36" height="26" viewBox="0 0 36 26" fill="none" aria-hidden className="ml-6">
                      <path d="M 20,24 C 18,17 12,11 7,4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      <path d="M 7,4 L 4,11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M 7,4 L 13,7" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div className="rounded-2xl bg-white px-3.5 py-2.5" style={{ border: "1px solid #e5e7eb" }}>
                      <p className="font-mono text-[11px] font-semibold leading-snug text-neutral-800">
                        🏆 Microsoft MLSA
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] leading-snug text-neutral-500">
                        1st Place, Imagine Cup<br />Recognised by Microsoft
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DHS Trusted Tester badge */}
            <div className="relative">
              <button
                onClick={() => setTappedBadge(tappedBadge === "dhs" ? null : "dhs")}
                className="focus:outline-none active:scale-95 transition-transform block"
                aria-label="DHS Trusted Tester badge, tap for info"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Trusted Tester Badge.png"
                  alt="DHS Trusted Tester Certified"
                  draggable={false}
                  className="h-12 w-auto object-contain"
                />
              </button>

              {/* Caption below DHS badge */}
              <AnimatePresence>
                {tappedBadge === "dhs" && (
                  <motion.div
                    key="dhs-caption"
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -3, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="absolute top-full right-0 mt-1 w-52 pointer-events-none"
                    style={{ zIndex: 50 }}
                  >
                    {/* Cute curved arrow pointing UP-RIGHT to badge */}
                    <svg width="36" height="26" viewBox="0 0 36 26" fill="none" aria-hidden className="ml-auto mr-5">
                      <path d="M 16,24 C 18,17 24,11 29,4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      <path d="M 29,4 L 32,11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M 29,4 L 23,7" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div className="rounded-2xl bg-white px-3.5 py-2.5" style={{ border: "1px solid #e5e7eb" }}>
                      <p className="font-mono text-[11px] font-semibold leading-snug text-neutral-800">
                        🔒 DHS Trusted Tester
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] leading-snug text-neutral-500">
                        Certified accessibility expert<br />by Dept. of Homeland Security
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
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
          style={{ right: "20%", top: "28%" }}
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

      {/* ── Medium article sticker — desktop only, equally spaced between folder + DHS ── */}
      {!gameActive && (
        <motion.a
          href={SITE.medium}
          target="_blank"
          rel="noopener noreferrer"
          drag
          dragMomentum={false}
          dragElastic={0}
          className="absolute z-[25] hidden cursor-grab select-none md:block active:cursor-grabbing"
          style={{ right: "12%", top: "42%" }}
          initial={{ opacity: 0, rotate: -14, scale: 0.8 }}
          animate={{ opacity: 1, rotate: -14, scale: 1 }}
          transition={mediumEntered ? { duration: 0.25, ease: "easeOut" } : { delay: 3.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setMediumEntered(true)}
          whileHover={{ scale: 1.08, rotate: -10, transition: { duration: 0.2, type: "tween" } }}
          whileTap={{ scale: 0.96 }}
        >
          <div
            className="rounded-2xl bg-neutral-900 px-4 pt-3 pb-3.5"
            style={{ width: 192, filter: "drop-shadow(4px 4px 4px rgba(0,0,0,0.15))", pointerEvents: "none" }}
          >
            {/* Logo + label row */}
            <div className="mb-2 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Medium logo png.png" alt="Medium" draggable={false} className="h-4 w-auto object-contain" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">Article</span>
            </div>

            {/* Title — Caveat with orange color-duplicate 2px below */}
            <div className="relative leading-snug">
              <span
                className={`${caveat.className} pointer-events-none absolute inset-0 translate-y-[2px] select-none text-[13px] font-bold leading-snug text-[#FF5210]`}
                aria-hidden
              >
                Why UX Designers Matter in the Age of AI
              </span>
              <span className={`${caveat.className} relative text-[13px] font-bold leading-snug text-white`}>
                Why UX Designers Matter in the Age of AI
              </span>
            </div>
          </div>
        </motion.a>
      )}

      {/* ── DHS Trusted Tester badge sticker — desktop only ───────── */}
      {!gameActive && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          className="absolute z-[25] hidden cursor-grab select-none flex-col items-center gap-1.5 md:flex active:cursor-grabbing"
          style={{ right: "5%", top: "56%" }}
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

