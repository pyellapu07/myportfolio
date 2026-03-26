"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ── UX violation data ──────────────────────────────────────────────── */
const VIOLATIONS = [
    { id: 1, icon: "🖼️", label: "Missing alt text", heuristic: "Accessibility" },
    { id: 2, icon: "🎨", label: "Low contrast ratio (2.1:1)", heuristic: "Visibility" },
    { id: 3, icon: "🔲", label: "No focus indicator", heuristic: "Accessibility" },
    { id: 4, icon: "👆", label: "12px tap target", heuristic: "Fitts's Law" },
    { id: 5, icon: "🏷️", label: "Orphan label", heuristic: "Consistency" },
    { id: 6, icon: "♾️", label: "Infinite scroll, no pagination", heuristic: "User Control" },
    { id: 7, icon: "⏳", label: "No loading state", heuristic: "Feedback" },
    { id: 8, icon: "▶️", label: "Auto-playing video", heuristic: "User Control" },
    { id: 9, icon: "↔️", label: "Horizontal scroll on mobile", heuristic: "Consistency" },
    { id: 10, icon: "🔴", label: "Color-only error state", heuristic: "Accessibility" },
    { id: 11, icon: "⏭️", label: "No skip-to-content link", heuristic: "Accessibility" },
    { id: 12, icon: "🚪", label: "Modal without escape key", heuristic: "User Control" },
    { id: 13, icon: "✂️", label: "Truncated without tooltip", heuristic: "Help & Docs" },
    { id: 14, icon: "📝", label: "Placeholder as label", heuristic: "Visibility" },
    { id: 15, icon: "❌", label: "No error recovery path", heuristic: "Error Recovery" },
];

const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL = 2200; // ms between wave spawns
const CARD_LIFETIME = 6000; // ms a card stays on screen

/* ── Types ──────────────────────────────────────────────────────────── */
interface SpawnedViolation {
    uid: string;
    violation: (typeof VIOLATIONS)[number];
    x: number;     // % from left
    y: number;     // % from top
    dx: number;    // drift direction x (px/s)
    dy: number;    // drift direction y (px/s)
    spawnTime: number;
    caught: boolean;
}

type GamePhase = "intro" | "playing" | "results";

/* ── Score messages ─────────────────────────────────────────────────── */
function getScoreMessage(score: number, total: number) {
    const pct = score / total;
    if (pct >= 0.9) return "You'd make an incredible UX auditor. Ship it? Not without your review.";
    if (pct >= 0.7) return "Sharp eye! Most usability issues don't stand a chance around you.";
    if (pct >= 0.5) return "Solid catch rate, a few slipped through, but you've got the instinct.";
    if (pct >= 0.3) return "Not bad for a first audit! The tricky ones need a second look.";
    return "UX issues are sneaky, but now you know what to look for. Try again?";
}

/* ── Component ──────────────────────────────────────────────────────── */
export default function UXAuditGame({ onExit }: { onExit: () => void }) {
    const [phase, setPhase] = useState<GamePhase>("intro");
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [score, setScore] = useState(0);
    const [spawned, setSpawned] = useState<SpawnedViolation[]>([]);
    const [totalSpawned, setTotalSpawned] = useState(0);

    const usedIdsRef = useRef<Set<number>>(new Set());
    const spawnTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const gameTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const animFrameRef = useRef<number>(0);
    const startTimeRef = useRef(0);
    const liveRef = useRef<HTMLDivElement>(null);

    /* ── Announce score changes to screen readers ─────────────────── */
    useEffect(() => {
        if (liveRef.current && phase === "playing") {
            liveRef.current.textContent = `Score: ${score}. Time left: ${timeLeft} seconds.`;
        }
    }, [score, timeLeft, phase]);

    /* ── Spawn logic ──────────────────────────────────────────────── */
    const spawnWave = useCallback(() => {
        const available = VIOLATIONS.filter((v) => !usedIdsRef.current.has(v.id));
        if (available.length === 0) return;

        const count = Math.min(2 + Math.floor(Math.random() * 2), available.length); // 2-3 per wave
        const wave: SpawnedViolation[] = [];

        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * available.length);
            const v = available.splice(idx, 1)[0];
            usedIdsRef.current.add(v.id);

            wave.push({
                uid: `${v.id}-${Date.now()}`,
                violation: v,
                x: 10 + Math.random() * 75, // keep within 10%–85%
                y: 15 + Math.random() * 60, // keep within 15%–75%
                dx: (Math.random() - 0.5) * 18,
                dy: (Math.random() - 0.5) * 12,
                spawnTime: Date.now(),
                caught: false,
            });
        }

        setSpawned((prev) => [...prev, ...wave]);
        setTotalSpawned((prev) => prev + wave.length);
    }, []);

    /* ── Start game ───────────────────────────────────────────────── */
    const startGame = useCallback(() => {
        setPhase("playing");
        setScore(0);
        setSpawned([]);
        setTotalSpawned(0);
        setTimeLeft(GAME_DURATION);
        usedIdsRef.current = new Set();
        startTimeRef.current = Date.now();

        // Spawn first wave immediately
        setTimeout(() => spawnWave(), 300);

        // Timer
        gameTimerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(gameTimerRef.current);
                    clearInterval(spawnTimerRef.current);
                    setPhase("results");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Spawn waves
        spawnTimerRef.current = setInterval(() => {
            spawnWave();
        }, SPAWN_INTERVAL);
    }, [spawnWave]);

    /* ── Intro auto-advance ───────────────────────────────────────── */
    useEffect(() => {
        if (phase === "intro") {
            const t = setTimeout(startGame, 2200);
            return () => clearTimeout(t);
        }
    }, [phase, startGame]);

    /* ── Cleanup ──────────────────────────────────────────────────── */
    useEffect(() => {
        return () => {
            clearInterval(gameTimerRef.current);
            clearInterval(spawnTimerRef.current);
            cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    /* ── Remove expired cards ─────────────────────────────────────── */
    useEffect(() => {
        if (phase !== "playing") return;
        const cleanup = setInterval(() => {
            setSpawned((prev) =>
                prev.filter((s) => s.caught || Date.now() - s.spawnTime < CARD_LIFETIME)
            );
        }, 500);
        return () => clearInterval(cleanup);
    }, [phase]);

    /* ── Catch a violation ────────────────────────────────────────── */
    const catchViolation = useCallback((uid: string) => {
        setSpawned((prev) =>
            prev.map((s) => (s.uid === uid && !s.caught ? { ...s, caught: true } : s))
        );
        setScore((prev) => prev + 1);
    }, []);

    /* ── ESC to exit ──────────────────────────────────────────────── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                clearInterval(gameTimerRef.current);
                clearInterval(spawnTimerRef.current);
                onExit();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onExit]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="ux-audit-cursor fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-sm"
            role="application"
            aria-label="UX Audit mini-game. Find and click usability violations. Press Escape to exit."
        >
            {/* Screen reader live region */}
            <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />

            {/* Exit button, always visible */}
            <button
                onClick={onExit}
                className="absolute right-6 top-6 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Exit game"
            >
                <X size={18} />
            </button>

            {/* ── INTRO PHASE ──────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {phase === "intro" && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-6 text-center"
                    >
                        <div className="text-6xl">🔍</div>
                        <h2 className="font-display text-4xl font-bold text-white">
                            UX Audit Mode
                        </h2>
                        <p className="max-w-md font-mono text-sm text-white/50">
                            Usability violations are appearing on screen. Click them to mark
                            them up before they disappear. You have {GAME_DURATION} seconds.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                            <span className="font-mono text-xs text-accent/70">Starting audit...</span>
                        </div>
                    </motion.div>
                )}

                {/* ── PLAYING PHASE ────────────────────────────────────────── */}
                {phase === "playing" && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        {/* Timer bar */}
                        <div className="absolute left-0 right-0 top-0 h-1 bg-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-accent via-accent-light to-warm"
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: GAME_DURATION, ease: "linear" }}
                            />
                        </div>

                        {/* HUD */}
                        <div className="absolute left-6 top-6 flex items-center gap-6">
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                <span className="font-mono text-xs text-white/40">SCORE</span>
                                <span className="font-display text-lg font-bold text-white">{score}</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                <span className="font-mono text-xs text-white/40">TIME</span>
                                <span className={`font-display text-lg font-bold ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>
                                    {timeLeft}s
                                </span>
                            </div>
                        </div>

                        {/* Instruction hint */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                            <p className="font-mono text-[10px] tracking-wider text-white/20">
                                CLICK THE VIOLATIONS TO MARK THEM • ESC TO EXIT
                            </p>
                        </div>

                        {/* Violation cards */}
                        <AnimatePresence>
                            {spawned.map((s) => {
                                const age = (Date.now() - s.spawnTime) / 1000;
                                const fadeProgress = Math.min(age / (CARD_LIFETIME / 1000), 1);

                                return (
                                    <motion.button
                                        key={s.uid}
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{
                                            opacity: s.caught ? 0 : 1 - fadeProgress * 0.5,
                                            scale: s.caught ? 1.3 : 1,
                                            x: s.dx * age,
                                            y: s.dy * age,
                                        }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={s.caught ? { duration: 0.3 } : { duration: 0.4 }}
                                        className={`absolute flex items-center gap-3 rounded-xl border px-5 py-3 font-mono text-sm transition-colors ${s.caught
                                            ? "pointer-events-none border-green-500/40 bg-green-500/15"
                                            : "border-white/10 bg-white/[0.04] hover:border-accent/40 hover:bg-accent/10"
                                            }`}
                                        style={{
                                            left: `${s.x}%`,
                                            top: `${s.y}%`,
                                        }}
                                        onClick={() => !s.caught && catchViolation(s.uid)}
                                        disabled={s.caught}
                                        aria-label={s.caught ? `Caught: ${s.violation.label}` : `Click to catch: ${s.violation.label}`}
                                    >
                                        {s.caught ? (
                                            <>
                                                <span className="text-green-400">✓</span>
                                                <span className="text-green-400/60 line-through">{s.violation.label}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{s.violation.icon}</span>
                                                <span className="text-white/70">{s.violation.label}</span>
                                                <span className="ml-2 rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                                                    {s.violation.heuristic}
                                                </span>
                                            </>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ── RESULTS PHASE ────────────────────────────────────────── */}
                {phase === "results" && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center gap-8 text-center"
                    >
                        <div className="text-6xl">{score >= totalSpawned * 0.7 ? "🏆" : score >= totalSpawned * 0.4 ? "🔍" : "🎯"}</div>

                        <div>
                            <h2 className="font-display text-4xl font-bold text-white">
                                Audit Complete
                            </h2>
                            <p className="mt-3 font-mono text-lg text-white/70">
                                You caught{" "}
                                <span className="font-bold text-accent">{score}</span>
                                {" / "}
                                <span className="text-white">{totalSpawned}</span>
                                {" "}usability issues
                            </p>
                            <p className="mt-4 max-w-lg font-mono text-sm leading-relaxed text-white/40">
                                {getScoreMessage(score, totalSpawned)}
                            </p>
                        </div>

                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={() => {
                                    setPhase("intro");
                                }}
                                className="rounded-full border border-accent/30 bg-accent/10 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent/20"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={onExit}
                                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-mono text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                Back to Portfolio
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanline effect overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-[105]"
                style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)",
                }}
            />
        </motion.div>
    );
}
