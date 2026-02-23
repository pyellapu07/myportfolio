"use client";

import { useEffect, useState, useCallback } from "react";
import { useRecruiter } from "@/lib/recruiter-context";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles as SparkleIcon } from "lucide-react";
import Image from "next/image";

// Sparkle Particle Component
const Sparkle = ({ delay, style, color }: { delay: number; style: React.CSSProperties & { className?: string }; color: string }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
            scale: [0, 1.2, 0.8, 1, 0],
            opacity: [0, 1, 0.7, 1, 0],
            rotate: [0, 120, 240],
        }}
        transition={{
            duration: 2.5,
            delay,
            repeat: Infinity,
            repeatDelay: 1.5,
        }}
        className={`absolute ${color}`}
        style={style}
    >
        <SparkleIcon size={14} fill="currentColor" />
    </motion.div>
);

// Stable sparkle positions — no Math.random() at render time (causes hydration mismatch)
const SPARKLE_POSITIONS = [
    { top: "8%", left: "12%" }, { top: "15%", left: "78%" },
    { top: "25%", left: "35%" }, { top: "32%", left: "60%" },
    { top: "45%", left: "5%" }, { top: "50%", left: "90%" },
    { top: "60%", left: "22%" }, { top: "68%", left: "55%" },
    { top: "75%", left: "80%" }, { top: "82%", left: "40%" },
    { top: "88%", left: "15%" }, { top: "92%", left: "70%" },
    { top: "20%", left: "50%" }, { top: "55%", left: "42%" },
    { top: "38%", left: "88%" }, { top: "72%", left: "8%" },
];

export default function RecruiterSplash() {
    const { isRecruiterMode, hasSeenSplash, markSplashSeen } = useRecruiter();
    const [showSplash, setShowSplash] = useState(false);

    // Zen Chime Synthesis using Web Audio API
    const playZenChime = useCallback(() => {
        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) return;

            const audioCtx = new AudioContextClass();
            const now = audioCtx.currentTime;
            const frequencies = [880, 1320, 1760]; // A5, E6, A6

            frequencies.forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 3 + i);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 4);
            });
        } catch (e) {
            console.error("Audio synthesis failed:", e);
        }
    }, []);

    useEffect(() => {
        if (isRecruiterMode && !hasSeenSplash) {
            setShowSplash(true);
            markSplashSeen();
            playZenChime();
        }
    }, [isRecruiterMode, hasSeenSplash, markSplashSeen, playZenChime]);

    useEffect(() => {
        if (showSplash) {
            const timer = setTimeout(() => setShowSplash(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [showSplash]);

    return (
        <AnimatePresence>
            {showSplash && (
                <>
                    {/*
                     * Layer 1 — The expanding star shape with feathered edge.
                     * Starts as a tiny 4-pointed star at center, expands its clip-path
                     * points so far beyond the viewport that the entire screen is covered.
                     * The outer box-shadow + blur fakes a soft feathered edge on the star shape.
                     * Exit: simple opacity fade out.
                     */}
                    {/* Solid white base — always full screen, no gaps ever */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeIn", delay: 0.3 } }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[99] bg-white"
                    />

                    {/* Star shape on top — purely decorative reveal effect */}
                    <motion.div
                        initial={{
                            clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
                            filter: "blur(0px)",
                            opacity: 1,
                        }}
                        animate={{
                            clipPath: "polygon(50% -500%, 70% 30%, 500% 50%, 70% 70%, 50% 500%, 30% 70%, -400% 50%, 30% 30%)",
                            filter: "blur(32px)",
                            opacity: 1,
                        }}
                        exit={{
                            // Collapse back to a tiny pinpoint first, fast —
                            // finishes well before the white base fades out
                            clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
                            filter: "blur(48px)",
                            opacity: 0,
                            transition: { duration: 0.35, ease: "easeIn" },
                        }}
                        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-[-300px] z-[100] bg-white"
                    />

                    {/*
                     * Layer 2 — Content on top of the white screen.
                     * Fades in after the star has mostly filled (delay 1.6s),
                     * so it appears on the already-white background.
                     */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                        transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
                        className="fixed inset-0 z-[101] flex flex-col items-center justify-center"
                    >
                        {/* Sparkle particles */}
                        <div className="pointer-events-none absolute inset-0">
                            {SPARKLE_POSITIONS.map((pos, i) => (
                                <Sparkle
                                    key={i}
                                    delay={i * 0.1 + 0.9}
                                    color={i % 2 === 0 ? "text-amber-400/50" : "text-emerald-400/50"}
                                    style={{ top: pos.top, left: pos.left }}
                                />
                            ))}
                        </div>

                        {/* Floating GIF */}
                        <motion.div
                            animate={{ y: [0, -16, 0] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative mb-5 h-48 w-48 drop-shadow-xl"
                        >
                            <Image
                                src="/mynamaste.gif"
                                alt="Namaste Greeting"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </motion.div>

                        {/* Heading — DM Mono, uppercase, light weight */}
                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.7 }}
                            className="font-mono text-4xl font-light uppercase tracking-[0.25em] text-emerald-900 md:text-5xl"
                        >
                            Namaste
                        </motion.h2>

                        {/* Subtext */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4, duration: 0.7 }}
                            className="mt-3 font-mono text-xs font-normal uppercase tracking-widest text-emerald-700/50 text-center px-6"
                        >
                            With open hands, I welcome you to my creative world
                        </motion.p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
