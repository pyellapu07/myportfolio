"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────── */

interface Piece {
  id: string;
  emoji: string;
  label: string;
  color: string;        // card background
  textColor: string;
  slotColor: string;    // repaired slot colour
  x: number;           // % from left
  y: number;           // % from top
  rotation: number;    // deg
  animDelay: number;   // s
  animDuration: number;// s
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

/* ─── Constants ──────────────────────────────────────────────── */

const PIECE_DEFS: Omit<Piece, "x" | "y" | "rotation" | "animDelay" | "animDuration">[] = [
  { id: "logo",        emoji: "🏷️",  label: "Logo",          color: "#0d9488", textColor: "#fff",     slotColor: "#0d9488" },
  { id: "nav",         emoji: "🔗",  label: "Nav Links",     color: "#7c3aed", textColor: "#fff",     slotColor: "#7c3aed" },
  { id: "headline",    emoji: "✍️",  label: "Hero Headline", color: "#FF5210", textColor: "#fff",     slotColor: "#FF5210" },
  { id: "cta",         emoji: "🚀",  label: "CTA Button",    color: "#16a34a", textColor: "#fff",     slotColor: "#16a34a" },
  { id: "features",    emoji: "🖼️",  label: "Feature Cards", color: "#2563eb", textColor: "#fff",     slotColor: "#2563eb" },
  { id: "search",      emoji: "🔍",  label: "Search Bar",    color: "#ca8a04", textColor: "#fff",     slotColor: "#ca8a04" },
  { id: "testimonial", emoji: "💬",  label: "Testimonial",   color: "#db2777", textColor: "#fff",     slotColor: "#db2777" },
  { id: "footer",      emoji: "🔗",  label: "Footer",        color: "#6b7280", textColor: "#fff",     slotColor: "#6b7280" },
];

function buildInitialPieces(): Piece[] {
  // Positions intentionally biased to the RIGHT of screen (>52%) to avoid heavy
  // overlap with the mockup panel on the left. A few can drift left slightly.
  const positions: [number, number][] = [
    [62, 12], [75, 30], [85, 55], [70, 72],
    [58, 85], [80, 14], [90, 42], [65, 58],
  ];
  return PIECE_DEFS.map((def, i) => ({
    ...def,
    x: positions[i][0],
    y: positions[i][1],
    rotation: (i % 2 === 0 ? 1 : -1) * (4 + (i * 3) % 10),
    animDelay: i * 0.4,
    animDuration: 3 + (i % 3),
  }));
}

/* ─── Sub-components ─────────────────────────────────────────── */

/** Animated particles at slot on snap */
function ParticleBurst({ x, y, active }: { x: number; y: number; active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (!active) return;
    const burst: Particle[] = Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const colors = ["#FF5210", "#ffd700", "#ff69b4", "#00ffcc", "#ffffff"];
      return {
        id: nextId.current++,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[i % colors.length],
      };
    });
    setParticles(burst);
    const t = setTimeout(() => setParticles([]), 900);
    return () => clearTimeout(t);
  }, [active, x, y]);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute z-50 h-2 w-2 rounded-full"
          style={{ left: p.x, top: p.y, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.vx * 40, y: p.vy * 40, opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

/* ─── BrokenMockup ─────────────────────────────────────────── */

interface SlotProps {
  id: string;
  label: string;
  collected: Set<string>;
  slotColor: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function Slot({ id, label, collected, slotColor, children, className = "", style }: SlotProps) {
  const done = collected.has(id);
  return (
    <div
      className={`relative transition-all duration-700 ${className}`}
      style={{
        border: done ? `2px solid ${slotColor}` : "2px dashed rgba(255,100,0,0.5)",
        borderRadius: 8,
        background: done ? `${slotColor}22` : "rgba(255,60,0,0.04)",
        boxShadow: done ? `0 0 12px ${slotColor}66` : "0 0 8px rgba(255,80,0,0.2)",
        ...style,
      }}
    >
      {done ? (
        <div className="flex h-full w-full items-center justify-center gap-1 p-1">
          {children}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <span
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,100,0,0.6)", animation: "pulse-glow 1.8s ease-in-out infinite" }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

function BrokenMockup({ collected, isWin }: { collected: Set<string>; isWin: boolean }) {
  return (
    <motion.div
      animate={isWin ? { x: [0, -4, 4, -3, 3, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-2 rounded-xl p-3"
      style={{
        width: "100%",
        maxWidth: 420,
        border: "2px solid rgba(255,255,255,0.08)",
        background: isWin ? "rgba(255,82,16,0.06)" : "rgba(255,255,255,0.02)",
        boxShadow: isWin ? "0 0 40px rgba(255,82,16,0.3)" : "none",
        transition: "background 1s, box-shadow 1s",
      }}
    >
      {/* Header row: logo + nav */}
      <div className="flex items-center gap-2" style={{ height: 36 }}>
        <Slot id="logo" label="logo missing" collected={collected} slotColor="#0d9488" className="flex-shrink-0" style={{ width: 72, height: 36 }}>
          <span className="text-[10px] font-bold" style={{ color: "#0d9488" }}>🏷️ PixelCo</span>
        </Slot>
        <Slot id="nav" label="nav missing" collected={collected} slotColor="#7c3aed" className="flex-1" style={{ height: 36 }}>
          <div className="flex gap-2">
            {["Home","About","Work","Contact"].map((n) => (
              <span key={n} className="text-[9px] font-medium" style={{ color: "#a78bfa" }}>{n}</span>
            ))}
          </div>
        </Slot>
        <Slot id="search" label="search" collected={collected} slotColor="#ca8a04" className="flex-shrink-0" style={{ width: 60, height: 36 }}>
          <span className="text-[9px]" style={{ color: "#fbbf24" }}>🔍 Search</span>
        </Slot>
      </div>

      {/* Hero section */}
      <Slot id="headline" label="hero headline ???" collected={collected} slotColor="#FF5210" style={{ height: 64, width: "100%" }}>
        <div className="text-center">
          <div className="font-bold text-[11px]" style={{ color: "#FF5210" }}>✍️ We build digital</div>
          <div className="font-bold text-[11px]" style={{ color: "#FF5210" }}>experiences that matter</div>
        </div>
      </Slot>

      {/* CTA */}
      <div className="flex justify-center">
        <Slot id="cta" label="CTA missing" collected={collected} slotColor="#16a34a" style={{ width: 120, height: 28 }}>
          <span className="text-[10px] font-bold" style={{ color: "#4ade80" }}>🚀 Get Started →</span>
        </Slot>
      </div>

      {/* Feature cards row */}
      <Slot id="features" label="feature cards missing" collected={collected} slotColor="#2563eb" style={{ height: 52, width: "100%" }}>
        <div className="flex gap-1.5 w-full px-1">
          {["Speed","Design","Scale"].map((f) => (
            <div key={f} className="flex-1 rounded-md flex items-center justify-center text-[9px] font-medium py-1" style={{ background: "#1d4ed8", color: "#93c5fd" }}>
              🖼️ {f}
            </div>
          ))}
        </div>
      </Slot>

      {/* Testimonial */}
      <Slot id="testimonial" label="testimonial missing" collected={collected} slotColor="#db2777" style={{ height: 44, width: "100%" }}>
        <div className="text-center px-2">
          <div className="text-[9px] italic" style={{ color: "#f9a8d4" }}>"💬 PixelCo transformed our digital presence completely!"</div>
          <div className="text-[8px] mt-0.5" style={{ color: "#ec4899" }}>— A Happy Client</div>
        </div>
      </Slot>

      {/* Footer */}
      <Slot id="footer" label="footer missing" collected={collected} slotColor="#6b7280" style={{ height: 28, width: "100%" }}>
        <div className="flex justify-between w-full px-2 text-[9px]" style={{ color: "#9ca3af" }}>
          <span>🔗 © 2025 PixelCo</span>
          <span>Privacy · Terms · Contact</span>
        </div>
      </Slot>
    </motion.div>
  );
}

/* ─── Confetti ───────────────────────────────────────────────── */

function Confetti() {
  const colors = ["#FF5210", "#ffd700", "#ff69b4", "#00ffcc", "#7c3aed", "#16a34a"];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 1.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            rotate: p.rotation,
          }}
          animate={{ y: "110vh", rotate: p.rotation + 720, opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function DesignRescueGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<"intro" | "playing" | "win">("intro");
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [pieces, setPieces] = useState<Piece[]>(buildInitialPieces());
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [flashSlot, setFlashSlot] = useState<string | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [burstSlot, setBurstSlot] = useState<{ id: string; x: number; y: number } | null>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-advance intro after 3 s
  useEffect(() => {
    if (phase !== "intro") return;
    introTimerRef.current = setTimeout(() => setPhase("playing"), 3000);
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, [phase]);

  // Track play time
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(() => setElapsedTime(Date.now() - startTime), 1000);
    return () => clearInterval(iv);
  }, [phase, startTime]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const handlePieceClick = useCallback(
    (pieceId: string) => {
      if (collected.has(pieceId)) return;

      // Find the slot element to get its bounding rect for burst position
      let bx = window.innerWidth * 0.27;
      let by = window.innerHeight * 0.5;
      if (containerRef.current) {
        const slot = containerRef.current.querySelector(`[data-slot="${pieceId}"]`);
        if (slot) {
          const r = slot.getBoundingClientRect();
          const cr = containerRef.current.getBoundingClientRect();
          bx = r.left - cr.left + r.width / 2;
          by = r.top - cr.top + r.height / 2;
        }
      }

      setCollected((prev) => {
        const next = new Set(prev);
        next.add(pieceId);
        // Check win
        if (next.size === 8) {
          setTimeout(() => setPhase("win"), 800);
        }
        return next;
      });

      setPieces((prev) => prev.filter((p) => p.id !== pieceId));
      setFlashSlot(pieceId);
      setBurstSlot({ id: pieceId, x: bx, y: by });
      setScreenFlash(true);

      setTimeout(() => setFlashSlot(null), 700);
      setTimeout(() => setScreenFlash(false), 180);
      setTimeout(() => setBurstSlot(null), 1000);
    },
    [collected]
  );

  const progress = (collected.size / 8) * 100;

  /* ── Intro phase ─────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#0a0a0a", cursor: "default" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (introTimerRef.current) clearTimeout(introTimerRef.current);
          setPhase("playing");
        }}
      >
        {/* Broken wireframe shapes */}
        <div className="pointer-events-none absolute inset-0">
          {/* Fake broken header */}
          <motion.div
            className="absolute top-[8%] left-[10%] right-[10%]"
            style={{ border: "1.5px dashed rgba(255,255,255,0.12)", borderRadius: 8, height: 44 }}
            initial={{ opacity: 0, scaleX: 0.7 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          {/* Fake broken hero block */}
          <motion.div
            className="absolute top-[18%] left-[10%] right-[10%]"
            style={{ border: "1.5px dashed rgba(255,80,0,0.2)", borderRadius: 8, height: 130 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex h-full items-center justify-center">
              <motion.span
                className="font-mono text-2xl"
                style={{ color: "rgba(255,80,0,0.35)" }}
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                ???
              </motion.span>
            </div>
          </motion.div>
          {/* Cards row */}
          <motion.div
            className="absolute top-[50%] left-[10%] right-[10%] flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 rounded-lg" style={{ border: "1.5px dashed rgba(255,255,255,0.09)", height: 60 }} />
            ))}
          </motion.div>
          {/* Footer */}
          <motion.div
            className="absolute bottom-[8%] left-[10%] right-[10%]"
            style={{ border: "1.5px dashed rgba(255,255,255,0.08)", borderRadius: 6, height: 28 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          />
        </div>

        {/* Text content */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
          <motion.p
            className="font-mono text-lg text-neutral-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            PixelCo just launched their new site...
          </motion.p>
          <motion.p
            className="font-mono text-xl font-semibold"
            style={{ color: "#FF5210" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            ...something went wrong.
          </motion.p>
          <motion.p
            className="font-mono text-sm text-neutral-500 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            8 UI components have vanished. Help them find the missing pieces.
          </motion.p>
          <motion.button
            className="mt-2 rounded-lg px-6 py-3 font-mono text-sm font-semibold transition-colors"
            style={{ background: "#FF5210", color: "#fff" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.stopPropagation();
              if (introTimerRef.current) clearTimeout(introTimerRef.current);
              setPhase("playing");
            }}
          >
            Help them fix it →
          </motion.button>
          <motion.p
            className="font-mono text-[11px] text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
          >
            (click anywhere to skip)
          </motion.p>
        </div>

        {/* Global keyframes */}
        <style>{`
          @keyframes drift {
            0%   { transform: translateY(0px) rotate(var(--r)); }
            50%  { transform: translateY(-14px) rotate(calc(var(--r) + 3deg)); }
            100% { transform: translateY(0px) rotate(var(--r)); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.4; }
            50%       { opacity: 1; }
          }
        `}</style>
      </motion.div>
    );
  }

  /* ── Win phase ───────────────────────────────────────────── */
  if (phase === "win") {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#0a0a0a", cursor: "default" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Confetti />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 max-w-md">
          <motion.div
            className="font-display text-4xl font-extrabold"
            style={{ color: "#FF5210" }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
          >
            ⚡ DESIGN RESTORED
          </motion.div>

          <motion.div
            className="rounded-xl p-4 w-full"
            style={{ background: "rgba(255,82,16,0.08)", border: "1.5px solid rgba(255,82,16,0.3)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="font-mono text-sm" style={{ color: "#FF5210" }}>🏷️ PixelCo is back online</div>
            <div className="font-mono text-xs text-neutral-400 mt-1">All components restored</div>
            <div className="font-mono text-xs text-neutral-400">PixelCo users can now navigate their site</div>
            <div className="font-mono text-xs text-neutral-500 mt-2">Play time: {formatTime(elapsedTime)}</div>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {PIECE_DEFS.map((p) => (
              <div
                key={p.id}
                className="rounded-lg px-2 py-1 font-mono text-[10px] font-semibold"
                style={{ background: p.color, color: p.textColor }}
              >
                {p.emoji} {p.label}
              </div>
            ))}
          </motion.div>

          <motion.button
            className="rounded-xl px-8 py-3 font-mono text-sm font-semibold"
            style={{ background: "#FF5210", color: "#fff" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={onExit}
          >
            Back to portfolio →
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ── Playing phase ───────────────────────────────────────── */
  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      style={{ background: "#0a0a0a", cursor: "default" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Screen flash on collect */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50"
            style={{ background: "rgba(255,255,255,0.08)" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>

      {/* ── Progress bar ────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-4 pb-2" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#FF5210" }}>
            Design Health
          </span>
          <span className="font-mono text-[11px]" style={{ color: "#FF5210" }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #FF5210, #ff8c00)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1 font-mono text-[10px] text-neutral-500">
          Find and restore all 8 missing UI components · {collected.size}/8 restored
        </p>
      </div>

      {/* Exit button */}
      <button
        className="absolute top-4 right-5 z-40 font-mono text-[11px] text-neutral-600 hover:text-neutral-300 transition-colors"
        style={{ cursor: "pointer" }}
        onClick={onExit}
      >
        ✕ exit
      </button>

      {/* ── Broken Mockup (left panel) ─────────────────────── */}
      <div
        className="absolute top-0 bottom-0 left-0 flex items-center justify-center"
        style={{ width: "52%", paddingTop: 72, paddingLeft: 24, paddingRight: 12, paddingBottom: 24 }}
      >
        {/* Add data-slot attributes to each slot wrapper for burst positioning */}
        <div className="w-full">
          {/* Invisible slot anchors for burst positioning */}
          {PIECE_DEFS.map((p) => (
            <div
              key={p.id}
              data-slot={p.id}
              className="pointer-events-none absolute"
              style={{ width: 1, height: 1, opacity: 0 }}
            />
          ))}
          <BrokenMockup collected={collected} isWin={false} />
        </div>
      </div>

      {/* Divider */}
      <div
        className="absolute top-[72px] bottom-0"
        style={{ left: "52%", width: 1, background: "rgba(255,255,255,0.05)" }}
      />

      {/* ── Floating pieces ─────────────────────────────────── */}
      {pieces.map((piece) => {
        const isDone = collected.has(piece.id);
        if (isDone) return null;
        return (
          <motion.div
            key={piece.id}
            className="absolute z-20 flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 font-mono text-xs font-semibold shadow-lg"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: 88,
              height: 64,
              background: piece.color,
              color: piece.textColor,
              "--r": `${piece.rotation}deg`,
              cursor: "pointer",
              animation: `drift ${piece.animDuration}s ease-in-out ${piece.animDelay}s infinite`,
              willChange: "transform",
              boxShadow: `0 0 16px ${piece.color}88`,
            } as React.CSSProperties}
            whileHover={{
              scale: 1.1,
              boxShadow: `0 0 28px ${piece.color}cc, 0 0 0 2px rgba(255,255,255,0.6)`,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePieceClick(piece.id)}
          >
            <span className="text-xl leading-none">{piece.emoji}</span>
            <span className="text-[10px] leading-tight text-center">{piece.label}</span>
          </motion.div>
        );
      })}

      {/* Particle bursts */}
      {burstSlot && (
        <ParticleBurst key={burstSlot.id} x={burstSlot.x} y={burstSlot.y} active={true} />
      )}

      {/* Flash highlight on recently snapped slot */}
      <AnimatePresence>
        {flashSlot && (
          <motion.div
            key={flashSlot}
            className="pointer-events-none absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0] }}
            transition={{ duration: 0.6 }}
            style={{ background: `radial-gradient(circle at 26% 50%, rgba(255,82,16,0.4) 0%, transparent 70%)` }}
          />
        )}
      </AnimatePresence>

      {/* Hint text when few pieces remain */}
      {pieces.length <= 3 && pieces.length > 0 && (
        <motion.div
          className="absolute bottom-4 left-0 right-0 flex justify-center z-30"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-[11px] rounded-full px-3 py-1" style={{ background: "rgba(255,82,16,0.15)", color: "#FF5210", border: "1px solid rgba(255,82,16,0.3)" }}>
            Almost there — {pieces.length} piece{pieces.length !== 1 ? "s" : ""} left!
          </span>
        </motion.div>
      )}

      {/* Global keyframes */}
      <style>{`
        @keyframes drift {
          0%   { transform: translateY(0px) rotate(var(--r)); }
          50%  { transform: translateY(-14px) rotate(calc(var(--r) + 3deg)); }
          100% { transform: translateY(0px) rotate(var(--r)); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
