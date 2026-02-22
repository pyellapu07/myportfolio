"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Loader2,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { FigmaIcon, NotionIcon } from "@/components/ToolIcons";

/* ─────────────────────────────────────────────────────────────
   CINEMATIC SPRINT INTERSTITIAL
   Full-viewport gradient panel with NType82 headline + parallax
───────────────────────────────────────────────────────────── */
function SprintDivider({ number, label, weeks, positive = true }: {
  number: string;
  label: string;
  weeks: string;
  positive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  const gradient = positive
    ? "linear-gradient(160deg, #0a0a14 0%, #1a0a2e 40%, #2d1060 70%, #3d1580 100%)"
    : "linear-gradient(160deg, #0a0a14 0%, #1a0a2e 40%, #2d1060 70%, #3d1580 100%)";

  return (
    <div
      ref={ref}
      className="relative z-10 flex min-h-[70vh] items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {/* Fluid noise/grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />
      {/* Purple glow blob */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ width: "60vw", height: "60vw", background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
      />

      {/* Parallax content */}
      <motion.div style={{ y }} className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
        <motion.p
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Sprint {number}
        </motion.p>
        <motion.h2
          className="text-[clamp(3rem,10vw,7rem)] font-normal leading-none tracking-tight text-white"
          style={{ fontFamily: "NType82, serif" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.h2>
        <motion.p
          className="font-mono text-sm text-white/40"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {weeks}
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VERTICAL SECTION INDEX (sticky right rail)
───────────────────────────────────────────────────────────── */
const SECTION_NAV = [
  { id: "methodology", label: "Methodology" },
  { id: "audit", label: "UX Audit" },
  { id: "hitrate", label: "Hit Rate" },
  { id: "analyze", label: "Analyze Page" },
  { id: "mobile", label: "Mobile UX" },
  { id: "designsystem", label: "Design System" },
  { id: "marcai", label: "Marc AI" },
  { id: "conversion", label: "Conversion" },
  { id: "featurespec", label: "Feature Spec" },
  { id: "outcomes", label: "Outcomes" },
];

function VerticalNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState("");
  const [prevActiveIdx, setPrevActiveIdx] = useState(-1);
  const [activeIdx, setActiveIdx] = useState(-1);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const navRef = useRef<HTMLElement>(null);
  // Arc SVG state: from-y, to-y, animating
  const [arc, setArc] = useState<{ fromY: number; toY: number; visible: boolean }>({ fromY: 0, toY: 0, visible: false });
  const arcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(id);
            setActiveIdx(i);
          }
        },
        { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  // Draw arc when activeIdx changes
  useEffect(() => {
    if (prevActiveIdx === -1 || prevActiveIdx === activeIdx) {
      setPrevActiveIdx(activeIdx);
      return;
    }
    const fromDot = dotRefs.current[prevActiveIdx];
    const toDot = dotRefs.current[activeIdx];
    const nav = navRef.current;
    if (!fromDot || !toDot || !nav) { setPrevActiveIdx(activeIdx); return; }
    const navRect = nav.getBoundingClientRect();
    const fromRect = fromDot.getBoundingClientRect();
    const toRect = toDot.getBoundingClientRect();
    const fromY = fromRect.top + fromRect.height / 2 - navRect.top;
    const toY = toRect.top + toRect.height / 2 - navRect.top;
    setArc({ fromY, toY, visible: true });
    if (arcTimer.current) clearTimeout(arcTimer.current);
    arcTimer.current = setTimeout(() => setArc(a => ({ ...a, visible: false })), 900);
    setPrevActiveIdx(activeIdx);
  }, [activeIdx, prevActiveIdx]);

  // Arc path: quadratic bezier curving left (parabolic outward left)
  const arcPath = (() => {
    const x = 10; // dot x-center within SVG
    const { fromY, toY } = arc;
    const mid = (fromY + toY) / 2;
    const curve = -28; // bulge left
    return `M ${x} ${fromY} Q ${x + curve} ${mid} ${x} ${toY}`;
  })();

  return (
    <nav
      ref={navRef}
      aria-label="Section index"
      className="fixed top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-[14px] xl:flex"
      style={{ right: "max(16px, calc(50vw - 540px))" }}
    >
      {/* Arc SVG overlay — drawn in nav coordinate space */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
        style={{ left: 0, top: 0 }}
      >
        <motion.path
          d={arcPath}
          fill="none"
          stroke="#6366F1"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={arc.visible
            ? { pathLength: 1, opacity: 0.7 }
            : { pathLength: 0, opacity: 0 }
          }
          transition={{
            pathLength: { duration: 0.65, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.2 },
          }}
        />
      </svg>

      {sections.map(({ id, label }, i) => {
        const isActive = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            className="group flex items-center justify-end gap-2.5"
            onClick={() => {
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {/* Label — always visible at low opacity, full on active/hover */}
            <motion.span
              className="font-mono text-[9px] uppercase tracking-widest"
              animate={{
                opacity: isActive ? 1 : 0.25,
                color: isActive ? "#111111" : "#9CA3AF",
                x: isActive ? 0 : 4,
              }}
              whileHover={{ opacity: 0.75, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              {label}
            </motion.span>
            {/* Dot */}
            <motion.span
              ref={(el) => { dotRefs.current[i] = el; }}
              className="block rounded-full flex-shrink-0"
              animate={{
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                backgroundColor: isActive ? "#6366F1" : "#D1D5DB",
                boxShadow: isActive ? "0 0 0 3px rgba(99,102,241,0.18)" : "none",
              }}
              whileHover={{ backgroundColor: "#9CA3AF", scale: 1.2 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </a>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOOPING GIF COMPONENT
   Next.js <Image> strips loop from animated GIFs ,use native
   <img> with unoptimized pass-through for live screen recordings
───────────────────────────────────────────────────────────── */
function LoopGif({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("w-full h-auto object-contain", className)}
      style={{ display: "block" }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECT CHAT
───────────────────────────────────────────────────────────── */
const PROJECT_PLACEHOLDERS = [
  "Ask about this internship...",
  "Ask about the hit rate feature...",
  "How did you improve mobile UX?",
  "Ask about the Marc AI design...",
  "Ask about working with the CEO...",
];

const PROJECT_PILLS = [
  "What was your biggest impact?",
  "How did hit rate build user trust?",
  "Tell me about the mobile nav redesign",
];

function ProjectSmartBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) return;
    const phrase = PROJECT_PLACEHOLDERS[phraseIdx];
    const speed = isDeleting ? 30 : 55;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholder(phrase.slice(0, charIdx + 1));
        if (charIdx + 1 === phrase.length) {
          setTimeout(() => setIsDeleting(true), 1600);
        } else {
          setCharIdx((c) => c + 1);
        }
      } else {
        setPlaceholder(phrase.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setIsDeleting(false);
          setPhraseIdx((i) => (i + 1) % PROJECT_PLACEHOLDERS.length);
          setCharIdx(0);
        } else {
          setCharIdx((c) => c - 1);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [isExpanded, phraseIdx, charIdx, isDeleting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setIsExpanded(true);
    setLoading(true);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[Context: MarketCrunch AI Product Design & UX Research Internship, Summer 2025. San Francisco-based fintech AI startup. Angel-funded. CEO: Bhushan Suryavanshi (ex-Amazon, Wharton). CTO: Ashim Datta. Platform: AI-driven investment research for retail investors, analyzing 300M+ data points daily. Pradeep was the sole designer ,drove end-to-end UX from audit to shipped code in React JS on Cursor. Key wins: Hit Rate feature (prediction accuracy visualization) reduced bounce rate and drove new user growth; bottom nav for mobile improved feature discoverability; redesigned ticker bar on analyze page; improved left nav with Material Design icons; designed Marc AI persona (mid-40s welcoming face) to build user trust; options calculator, market pulse, payments page redesign; collaborated with CEO, CTO, USC research team, Sylvan (research), Harsh Parikh (dev), Raman Ebrahimi (quant PhD). Daily sprint calls. Design process: audit → Asana task triage (P0/P1/P2) → user feedback + Google Analytics → brainstorming → hi-fi prototypes → stakeholder review → React build → deploy → iterate. Company grew MAU ~16x in 2025. Pradeep received bonus for impact. UX methods: heuristic evaluation (Nielsen), WCAG AA compliance check, information architecture audit, competitive benchmarking, progressive disclosure, usability testing, Figma Dev Mode for design-to-dev handoff.] ${text}`,
          mode: "general",
          conversationHistory: [],
        }),
      });
      const data = await res.json();
      const raw = data.content || "I can help answer that based on Pradeep's MarketCrunch experience.";
      const clean = raw.replace(/,/g, ",");
      setMessages((m) => [...m, { role: "ai", text: clean }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "I'm having trouble connecting right now. Try again?" }]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  function handleReset(e: React.MouseEvent) {
    e.stopPropagation();
    setMessages([]);
    setInput("");
  }

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-3rem)] max-w-[640px] -translate-x-1/2"
        data-no-cursor
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: 10, scaleY: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-1.5 overflow-hidden rounded-xl border border-border/40 bg-white shadow-smooth-lg"
              style={{ transformOrigin: "bottom" }}
            >
              <div className="flex h-[340px] flex-col">
                <div className="flex items-center justify-between border-b border-border/40 bg-bg-alt/50 px-5 py-3">
                  <span className="font-manrope text-sm font-medium text-text">Ask about this internship</span>
                  <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                      <button
                        onClick={handleReset}
                        title="Reset chat"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text"
                      >
                        <RefreshCw size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <Sparkles size={18} className="text-primary/30" />
                      <p className="max-w-[200px] font-mono text-xs text-text-muted">
                        Ask about the process, features, or outcomes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m, i) => (
                        <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-2.5 font-mono text-xs leading-relaxed",
                            m.role === "user"
                              ? "bg-primary text-white"
                              : "border border-border/60 bg-bg-alt text-text"
                          )}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="rounded-2xl bg-bg-alt px-4 py-3">
                            <Loader2 size={13} className="animate-spin text-text-muted" />
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-border/40 bg-white p-3">
                  <div className="flex gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send(input);
                        }
                      }}
                      className="flex-1 resize-none bg-transparent px-3 py-2 font-mono text-xs outline-none placeholder:text-text-muted"
                      placeholder="Type your question..."
                      rows={1}
                    />
                    <button
                      onClick={() => send(input)}
                      disabled={!input.trim() || loading}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative rounded-2xl border border-white/50 bg-white/20 p-1.5 shadow-smooth-lg backdrop-blur-2xl">
          {isExpanded && <div className="chat-glow" />}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center gap-3 rounded-xl bg-white/60 px-5 py-3.5 text-left backdrop-blur-sm transition-colors hover:bg-white/80"
          >
            <MessageCircle size={18} className="shrink-0 text-primary" aria-hidden />
            <span className="flex-1 font-mono text-xs text-text-muted">
              {placeholder || PROJECT_PLACEHOLDERS[0]}
            </span>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary">
              Project AI
            </span>
            <MessageCircle size={14} className="shrink-0 text-text-muted" aria-hidden />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
          {PROJECT_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => send(pill)}
              className="rounded-full border border-border/40 bg-white/80 px-3 py-1 font-mono text-[10px] text-text-muted backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-white hover:text-primary"
            >
              {pill}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────────────────────── */
function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      <div className="font-mono text-sm font-medium leading-tight text-text">{value}</div>
    </div>
  );
}

/* Scroll-triggered fade+slide — fires every time (once: false) */
function Fade({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Media pop — bubbly scale+fade for GIFs and images */
function MediaPop({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.34, 1.3, 0.64, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-16 md:mb-20">
      <motion.span
        className="mb-4 block font-mono text-[11px] text-primary/60"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {number}
      </motion.span>
      <motion.h2
        className="font-manrope text-3xl font-medium tracking-tight text-text md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        {title}
      </motion.h2>
    </div>
  );
}

/* Big attention-grabbing label: "The Problem", "The Solution", "User Stories" etc */
function BigLabel({ text, color = "text-text" }: { text: string; color?: string }) {
  return (
    <Fade>
      <p className={`font-manrope text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 ${color}`}>{text}</p>
    </Fade>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-6">
      <span className="font-manrope text-4xl font-medium text-primary md:text-5xl">{value}</span>
      <span className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</span>
    </div>
  );
}

function InsightCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="rounded-xl border border-border/50 bg-white p-6 cursor-default"
      whileHover={{ scale: 1.025, y: -6 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
    >
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      {children}
    </motion.div>
  );
}

/* Component sheet — constrained max height so wide Figma exports don't dominate the viewport */
function ComponentSheet({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <MediaPop>
      <div className="rounded-xl border border-border/50 bg-[#F9FAFB] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={420}
          className="w-full h-auto max-h-[280px] object-contain object-top"
        />
      </div>
      {caption && (
        <p className="mt-2.5 font-mono text-xs text-text-muted">{caption}</p>
      )}
    </MediaPop>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function MarketCrunchPage() {

  const GridBackground = () => (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px)`,
          backgroundSize: "160px 100%",
        }}
      />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-text selection:bg-primary/20">
      <CustomCursor />
      <Header initialDark={true} />
      <ProjectSmartBar />
      <GridBackground />
      <VerticalNav sections={SECTION_NAV} />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 pt-32 pb-16 md:pt-48 md:pb-24">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">

          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-3">
            <Link
              href="/#work"
              className="group flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-text"
            >
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
              Back to Work
            </Link>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="font-mono text-xs text-primary">Product Design Internship · Fintech / AI</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              {/* Company badge */}
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-white px-3 py-1.5 shadow-smooth">
                <Image
                  src="/MarketCrunch AI logo.png"
                  alt="MarketCrunch AI"
                  width={18}
                  height={18}
                  className="rounded-sm"
                />
                <span className="font-mono text-[11px] font-medium text-text-secondary">MarketCrunch AI · San Francisco, CA</span>
              </div>

              <h1 className="mb-6 font-manrope text-5xl font-medium leading-[1.05] tracking-tight text-text md:text-7xl lg:text-[5rem]">
                Designing a<br />
                <span className="text-primary">Personal Quant.</span>
              </h1>
              <p className="max-w-xl font-mono text-base leading-relaxed text-text-secondary md:text-lg">
                Sole product designer at an angel-funded fintech AI startup ,owned the full design-to-deployment cycle across a live platform serving retail investors with 300M+ data points daily.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:mb-4 lg:pl-12">
              <DetailRow label="Role" value="Product Design & UX Research Intern" />
              <DetailRow label="Company" value="MarketCrunch AI" />
              <DetailRow label="Timeline" value="Jun – Sep 2025 · Summer" />
              <DetailRow
                label="Status"
                value={
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Live · In Production
                  </span>
                }
              />
            </div>
          </div>

          {/* Meta strip */}
          <div className="mt-10 grid gap-8 border-t border-border/40 py-8 md:grid-cols-3">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Responsibilities</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Heuristic evaluation · WCAG audit · IA redesign · Interaction design · Mobile UX · Design system · Usability testing · React JS development · Developer handoff
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Cross-functional Collaborators</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Bhushan Suryavanshi (CEO) · Ashim Datta (CTO) · Sylvan (Research Lead) · Harsh Parikh (Engineering) · Raman Ebrahimi (Quant Research, PhD) · USC Research Team
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Tools & Stack</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1">
                <div className="flex items-center gap-2">
                  <FigmaIcon size={16} />
                  <span className="font-mono text-sm text-text-secondary">Figma + Dev Mode</span>
                </div>
                <span className="text-border">·</span>
                <span className="font-mono text-sm text-text-secondary">React JS</span>
                <span className="text-border">·</span>
                <span className="font-mono text-sm text-text-secondary">Cursor</span>
                <span className="text-border">·</span>
                <div className="flex items-center gap-2">
                  <NotionIcon size={15} />
                  <span className="font-mono text-sm text-text-secondary">Asana</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero image ,latest analyze page screen recording */}
          <MediaPop className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A12]">
              <LoopGif
                src="/Marketcrunchai/latest&currentanalyzepagedesignscreenrecording.gif"
                alt="MarketCrunch AI - Live Analyze Page, Final Design"
              />
            </div>
          </MediaPop>
          <p className="mt-3 text-center font-mono text-xs text-text-muted">
            Analyze page's final shipped design. Ticker bar, hit rate component, Marc AI, and redesigned left nav all visible.
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          IMPACT AT A GLANCE
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-border/40 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <p className="mb-10 font-mono text-[10px] uppercase tracking-widest text-text-muted">Quantified Impact</p>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <StatItem value="16×" label="MAU growth across 2025" />
            <StatItem value="300M+" label="Data points analyzed daily" />
            <StatItem value="$450K+" label="Raised in SAFEs post-stealth" />
            <StatItem value="20+" label="Screens audited & redesigned" />
          </div>
          <div className="mt-10 rounded-xl border border-primary/15 bg-primary/4 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">CEO · Post-Stealth Announcement</p>
            <p className="font-mono text-sm leading-relaxed text-text">
              "MAU grew ~16x, double-digit engagement growth, and retentive paying customers. That wouldn't be possible without our small-but-mighty team who combined <strong className="font-medium">delightful UX and quantitative research rigor.</strong>" - Bhushan Suryavanshi, Founder & CEO. Pradeep received a performance bonus in recognition of direct contribution to these outcomes.
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          00: DESIGN PROCESS & METHODOLOGY
      ══════════════════════════════════════════════ */}
      <section id="methodology" className="relative z-10 py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="00 / METHODOLOGY" title="How I structured the design process at a live, revenue-generating product." />

          <div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Joining as the <strong className="font-medium text-text">sole designer on a live product with paying subscribers</strong> required a methodology that could balance continuous discovery with immediate delivery. The approach was a <strong className="font-medium text-text">Design Thinking × Lean UX × Agile hybrid</strong>, using Design Thinking to frame the problem space and build user empathy, Lean UX to run fast hypothesis-to-validation cycles, and Agile sprints to deliver and deploy incrementally without blocking engineering.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Each sprint followed a tight feedback loop: daily standups with engineering, weekly 1:1s with CEO Bhushan for stakeholder alignment, and continuous input from Google Analytics behavioral data and qualitative user feedback sessions coordinated through the research lead, Sylvan.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Design outputs, from wireframes to high-fidelity prototypes, were handed off via <strong className="font-medium text-text">Figma Dev Mode</strong>, with component specs, spacing tokens, and interactive state documentation. For several features, I <strong className="font-medium text-text">implemented the React components directly in the codebase</strong> using Cursor, closing the loop between design intent and shipped behavior.
            </p>
          </div>

          {/* Process diagram */}
          <div className="rounded-xl border border-border/50 bg-bg-alt p-8 md:p-10">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Design & Delivery Loop - Design Thinking · Lean UX · Agile</p>

            <div className="relative">
              <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-border/60 md:block" />
              <div className="grid gap-6 md:grid-cols-4 md:gap-0">
                {[
                  {
                    phase: "Evaluate",
                    items: ["Heuristic evaluation (Nielsen)", "WCAG AA compliance audit", "IA & affordance gaps", "Severity-ranked Asana backlog"],
                    color: "text-primary",
                    dot: "bg-primary",
                    num: "01",
                  },
                  {
                    phase: "Synthesize",
                    items: ["Google Analytics behavioral data", "Qualitative user feedback", "Competitive benchmarking", "CEO / stakeholder alignment"],
                    color: "text-[#8E60F0]",
                    dot: "bg-[#8E60F0]",
                    num: "02",
                  },
                  {
                    phase: "Design",
                    items: ["Hi-fi prototypes in Figma", "Component variants & states", "Figma Dev Mode handoff", "Iterative stakeholder review"],
                    color: "text-[#FF5210]",
                    dot: "bg-[#FF5210]",
                    num: "03",
                  },
                  {
                    phase: "Deploy",
                    items: ["React JS implementation", "Production deployment", "Post-launch analytics", "Next iteration backlog"],
                    color: "text-green-600",
                    dot: "bg-green-500",
                    num: "04",
                  },
                ].map((s) => (
                  <div key={s.phase} className="relative flex flex-col md:items-center md:px-4">
                    <div className={`relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-full border-4 border-bg-alt font-mono text-xs font-bold text-white ${s.dot}`}>
                      {s.num}
                    </div>
                    <span className={`mt-1 font-manrope text-base font-medium md:text-center ${s.color}`}>{s.phase}</span>
                    <ul className="mt-3 space-y-1 md:text-center">
                      {s.items.map((item) => (
                        <li key={item} className="font-mono text-[11px] leading-snug text-text-muted">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Process methodology diagram */}
            <div className="mt-8 border-t border-border/40 pt-6">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">Process Framework - Design Thinking × Lean UX × Agile</p>
              <div className="overflow-hidden rounded-lg border border-border/40 bg-white">
                <Image
                  src="/Marketcrunchai/design-process-framework.png"
                  alt="Design process framework - Design Thinking, Lean UX, and Agile integrated methodology"
                  width={1200}
                  height={600}
                  className="w-full h-auto object-contain"
                />
              </div>
              <p className="mt-2.5 font-mono text-xs text-text-muted">
                The "Better Together" model, Design Thinking drives problem clarity and user insight, Lean UX accelerates hypothesis-to-validation loops, Agile delivers iterative deployment with daily sprint cadence
              </p>
            </div>
          </div>
        </div>
      </section>


      <SprintDivider number="01" label="Discovery & Audit" weeks="Week 1–2 · Jun 2025" />

      {/* ══════════════════════════════════════════════
          01: UX AUDIT - HEURISTIC & ACCESSIBILITY EVALUATION
      ══════════════════════════════════════════════ */}
      <section id="audit" className="relative z-10 bg-white py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="01 / UX AUDIT" title="A systematic heuristic evaluation across 20+ screens to establish a redesign baseline." />

          <div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Before opening Figma, I conducted a structured <strong className="font-medium text-text">heuristic evaluation</strong> benchmarked against Nielsen's 10 Usability Heuristics, WCAG 2.1 AA compliance, and typographic readability standards. Each violation was logged, categorized by severity (P0–P2), and converted into actionable Asana tasks.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Key categories evaluated: <strong className="font-medium text-text">visibility of system status, user control and freedom, recognition over recall, aesthetic and minimalist design,</strong> and accessibility, color contrast ratios, touch target sizing for mobile, and screen reader compatibility. Competitive benchmarking against TradingView, Robinhood, and Seeking Alpha established a baseline for expected interaction patterns in the fintech space.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The audit surfaced two critical P0 violations: the <strong className="font-medium text-text">absence of a persistent mobile navigation structure</strong> (violating Nielsen's heuristic of recognition over recall), and a <strong className="font-medium text-text">trust signal gap</strong> on the analyze page, no readily legible indication of model accuracy for users without a quantitative finance background.
            </p>
          </div>

          {/* UX Audit screenshots, 3 across */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-white">
                <Image
                  src="/Marketcrunchai/UXaudit-sample1.png"
                  alt="UX audit document, heuristic evaluation sample 1"
                  width={500}
                  height={360}
                  className="w-full h-auto object-cover object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">Heuristic evaluation, visibility & feedback violations</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-white">
                <Image
                  src="/Marketcrunchai/UXaudit-sample2.png"
                  alt="UX audit document, heuristic evaluation sample 2"
                  width={500}
                  height={360}
                  className="w-full h-auto object-cover object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">IA audit, navigation structure & affordance gaps</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-white">
                <Image
                  src="/Marketcrunchai/UXaudit-sample3.png"
                  alt="UX audit document - heuristic evaluation sample 3"
                  width={500}
                  height={360}
                  className="w-full h-auto object-cover object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">WCAG AA compliance - color contrast & mobile targets</p>
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-xs text-text-muted">
            UX audit documentation, findings logged across 20+ screens and triaged into severity-ranked Asana tasks
          </p>

          {/* Key audit findings */}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <InsightCard label="🔴 P0 Violations — Critical">
              <ul className="mt-3 space-y-3 font-mono text-sm text-text-secondary">
                <li className="flex gap-2.5">
                  <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>No persistent bottom navigation on mobile, users had no recognition-based path to key features (Nielsen #6: Recognition over Recall)</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>Trust signal absence on analyze page, no model accuracy indicator for non-technical users; high bounce risk</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>Ticker bar lacked action affordances, no CTA for Add Alert, Share, or Bookmark at the highest-visibility element on the page</span>
                </li>
              </ul>
            </InsightCard>
            <InsightCard label="🟡 P1 Violations — Significant">
              <ul className="mt-3 space-y-3 font-mono text-sm text-text-secondary">
                <li className="flex gap-2.5">
                  <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Left navigation used inconsistent iconography, no systematic icon library, poor visual hierarchy between nav items</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Model explanation ("Technical Analysis") mislabeled and misplaced, inaccurately described for legacy reasons, wrong location in information hierarchy</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Search flow required users to recall exact ticker symbols on every session, no progressive disclosure or history pattern to reduce recall burden</span>
                </li>
              </ul>
            </InsightCard>
          </div>

          {/* Competitor benchmarking */}
          <div className="mt-10">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Competitive Benchmarking, Interaction Patterns in Fintech</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
                  <Image
                    src="/Marketcrunchai/competitiorrobinhoodwatchlistdesign.png"
                    alt="Robinhood watchlist - UI pattern analysis"
                    width={600}
                    height={380}
                    className="w-full h-auto object-contain max-h-[280px]"
                  />
                </div>
                <p className="font-mono text-[10px] text-text-muted">Robinhood, strong watchlist affordances, clear information hierarchy on stock cards</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
                  <Image
                    src="/Marketcrunchai/competitiorstockwitswatchlistdesign.png"
                    alt="StockWits watchlist - UI pattern analysis"
                    width={600}
                    height={380}
                    className="w-full h-auto object-contain max-h-[280px]"
                  />
                </div>
                <p className="font-mono text-[10px] text-text-muted">StockWits's social signal integration and community-driven ticker discovery</p>
              </div>
            </div>
          </div>

          {/* Legacy baseline */}
          <div className="mt-10">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Audit Baseline - Legacy Analyze Page</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-white">
                  <Image
                    src="/Marketcrunchai/Legacyanalyzepagedesign.png"
                    alt="Legacy analyze page - desktop audit baseline"
                    width={700}
                    height={460}
                    className="w-full h-auto object-contain max-h-[300px] object-top"
                  />
                </div>
                <p className="font-mono text-[10px] text-text-muted">Desktop - flat ticker bar, no action CTAs, dense information without progressive disclosure</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-white">
                  <Image
                    src="/Marketcrunchai/Legacyanalyzepagemobile.png"
                    alt="Legacy analyze page - mobile audit baseline"
                    width={700}
                    height={460}
                    className="w-full h-auto object-contain max-h-[300px] object-top"
                  />
                </div>
                <p className="font-mono text-[10px] text-text-muted">Mobile - no persistent bottom nav, limited affordances, feature discoverability requires prior knowledge</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-primary/15 bg-primary/4 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">Central Audit Finding</p>
            <p className="font-mono text-sm leading-relaxed text-text">
              The platform had technically sound AI infrastructure, but the interface had a <strong className="font-medium">trust signal gap</strong>, nothing on the analyze page gave non-technical retail investors an immediate, legible signal that the model's predictions were reliable. This was the root cause of high bounce rate on the platform's most critical page.
            </p>
          </div>
        </div>
      </section>


      <SprintDivider number="02" label="Trust Signal & Analyze" weeks="Week 3–5 · Jun–Jul 2025" />

      {/* ══════════════════════════════════════════════
          02: HIT RATE - TRUST SIGNAL DESIGN
      ══════════════════════════════════════════════ */}
      <section id="hitrate" className="relative z-10 py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="02 / FEATURE" title="Designing a trust signal that communicates model accuracy without requiring financial literacy." />

          <div className="mb-16 grid gap-10 md:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              <Fade>
                <div className="rounded-xl p-6" style={{background:"linear-gradient(270deg, #f19d9e33, #f1ece6)"}}>
                  <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-red-500 mb-2">The Problem</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    Retail investors without a quant background couldn't evaluate a deep-learning model from RMSE values or backtested Sharpe ratios — the interface had <strong className="font-medium text-text">no trust signal</strong>. High bounce rate on the platform's most critical page.
                  </p>
                </div>
              </Fade>
              <Fade delay={0.1}>
                <div className="rounded-xl p-6" style={{background:"linear-gradient(270deg, #9ff09c33, #f0ebe6)"}}>
                  <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-green-600 mb-2">The Solution</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    The <strong className="font-medium text-text">Hit Rate component</strong> — a color-coded accuracy streak across the last 5 sessions using <strong className="font-medium text-text">progressive disclosure</strong>: glanceable at surface level, expandable for detail. Designed with data-ink ratio principles, no jargon, color + shape encoded for accessibility.
                  </p>
                </div>
              </Fade>
            </div>

            <Fade delay={0.15} className="flex flex-col gap-8 justify-center">
              <StatItem value="↓" label="Bounce rate on analyze page post-launch" />
              <StatItem value="↑" label="New user signups, attributed to trust signal" />
              <StatItem value="5" label="Trading sessions shown in accuracy streak" />
            </Fade>
          </div>

          {/* Hit rate GIF, looping */}
          <MediaPop>
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A12]">
              <LoopGif
                src="/Marketcrunchai/hitratecloseupview.gif"
                alt="Hit rate component, looping live view showing prediction accuracy streak"
              />
            </div>
          </MediaPop>
          <p className="mt-3 text-center font-mono text-xs text-text-muted">
            Hit rate component in production, color-coded accuracy streak across last 5 trading sessions
          </p>

          {/* Hit rate component sheet, constrained */}
          <div className="mt-10">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">Component Variants & States, Figma Design System</p>
            <ComponentSheet
              src="/Marketcrunchai/hitratecomponents.png"
              alt="Hit rate component design system, all states and variants"
              caption="All component states: hit, miss, no-data, loading, and expanded detail view, built as a reusable Figma component with auto-layout"
            />
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          03: TICKER BAR & ANALYZE PAGE REDESIGN
      ══════════════════════════════════════════════ */}
      <section id="analyze" className="relative z-10 border-t border-border/40 bg-white py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="03 / ANALYZE PAGE" title="Redesigning the highest-visibility element: the ticker bar and analyze page header." />

          <div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The ticker bar is the first element a trader interacts with on the analyze page, it sets the visual register and communicates the platform's design quality within 300ms of page load. The legacy bar was a flat, dark surface with no <strong className="font-medium text-text">action affordances</strong>, high-value interactions like price alerts, sharing, and bookmarking were absent from the primary focal point.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The redesign introduced a <strong className="font-medium text-text">modular header component</strong> with clear typographic hierarchy, contextual CTA placement (Add Alert near the price delta where alert intent is highest), a Share action for virality, and a Bookmark toggle for watchlist behavior, all within the existing screen real estate, without increasing visual density.
            </p>
          </div>

          {/* Ticker bar comparison */}
          <div className="rounded-xl border border-border/50 bg-bg-alt p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Ticker Bar : Before / After Comparative Analysis</p>
            <div className="overflow-hidden rounded-lg border border-border/40 bg-white">
              <Image
                src="/Marketcrunchai/tickerbarcomparisionoldvsnew.png"
                alt="Ticker bar redesign : before and after comparative"
                width={1200}
                height={500}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-white/70 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-1">🔴 Before</p>
                <p className="font-mono text-xs text-text-secondary">Flat dark blue surface, no action affordances, no secondary metadata hierarchy, dated typographic treatment</p>
              </div>
              <div className="rounded-lg bg-white/70 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-500 mb-1">🟢 After</p>
                <p className="font-mono text-xs text-text-secondary">Clear typographic scale, contextual CTAs (Add Alert, Share, Bookmark), hit rate component integrated, modern visual language</p>
              </div>
            </div>
          </div>

          {/* Proposed desktop analyze page */}
          <div className="mt-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">Analyze Page - Proposed Desktop Redesign v1</p>
            <p className="mb-4 font-mono text-sm text-text-secondary max-w-2xl">
              Full IA restructure of the analyze page based on stakeholder feedback: alert component visually anchored near the price delta, Share CTA repositioned to top-right for discoverability, and Subscribe CTA integrated into the left navigation as an active conversion surface rather than a passive link.
            </p>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
              <Image
                src="/Marketcrunchai/Analyzepage - Desktopproposeddesignv1.png"
                alt="Analyze page desktop - proposed redesign v1"
                width={1200}
                height={700}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Legacy bottom half */}
          <div className="mt-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">Legacy Analyze Page - Bottom Section Audit</p>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-white">
              <Image
                src="/Marketcrunchai/Legacyanalyzepagedesignbottomhalf.png"
                alt="Legacy analyze page - bottom section audit"
                width={1200}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="mt-2.5 font-mono text-xs text-text-muted">
              Bottom section audit - Prior Accuracy, Technical Analysis, and Model Information were siloed across separate UI regions with no coherent grouping, violating proximity principles in information design.
            </p>
          </div>
        </div>
      </section>


      <SprintDivider number="03" label="Mobile UX & Design System" weeks="Week 6–8 · Jul 2025" />

      {/* ══════════════════════════════════════════════
          04: MOBILE UX - NAVIGATION ARCHITECTURE
      ══════════════════════════════════════════════ */}
      <section id="mobile" className="relative z-10 py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="04 / MOBILE UX" title="Introducing a persistent navigation architecture for a mobile-first trading platform." />

          <div className="mb-16 grid gap-6 md:grid-cols-2">
            <Fade>
              <div className="rounded-xl p-6" style={{background:"linear-gradient(270deg, #f19d9e33, #f1ece6)"}}>
                <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-red-500 mb-2">The Problem</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  MarketCrunch's primary use case is mobile, yet had <strong className="font-medium text-text">no persistent navigation scaffold</strong>. Switching between Analyze, AI Picks, Options, and Market Pulse required memory-dependent paths — violating Recognition over Recall (Nielsen #6).
                </p>
              </div>
            </Fade>
            <Fade delay={0.1}>
              <div className="rounded-xl p-6" style={{background:"linear-gradient(270deg, #9ff09c33, #f0ebe6)"}}>
                <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-green-600 mb-2">The Solution</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  A <strong className="font-medium text-text">persistent bottom tab bar</strong> following iOS HIG + Material Design conventions — the most thumb-accessible zone per eye-tracking research. Icon + label pairs enable direct wayfinding with zero cognitive overhead.
                </p>
              </div>
            </Fade>
          </div>

          {/* Mobile before vs after */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Mobile Experience : Before / After Navigation Redesign</p>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
              <Image
                src="/Marketcrunchai/oldtonewcomparisionofmostviewedmobileview.png"
                alt="Mobile redesign : before and after navigation architecture"
                width={1200}
                height={700}
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="font-mono text-xs text-text-muted">
              🔴 <strong className="font-medium text-text-secondary">Before:</strong> No navigation scaffold, feature discovery requires prior platform knowledge. &nbsp;🟢 <strong className="font-medium text-text-secondary">After:</strong> Persistent bottom tab bar, improved content hierarchy, and visual modernization.
            </p>
          </div>

          {/* Bottom nav component sheet */}
          <div className="mt-8">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">Bottom Navigation : Component Library (All States)</p>
            <ComponentSheet
              src="/Marketcrunchai/bottomnavigationcomponents.png"
              alt="Bottom navigation component system : all interaction states"
              caption="Icon active, inactive, hover, and badge states, designed as a Figma component with property-driven icon swaps and label visibility toggle"
            />
          </div>

          {/* Mobile prototype GIF, looping */}
          <MediaPop className="mt-10">
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A12]">
              <LoopGif
                src="/Marketcrunchai/latestviewanalyzepagemobileprototypevideo.gif"
                alt="Mobile analyze page - live prototype interaction flow"
              />
            </div>
          </MediaPop>
          <p className="mt-3 text-center font-mono text-xs text-text-muted">
            Mobile prototype - looping live interaction flow showing bottom nav, hit rate component, and analyze page hierarchy
          </p>

          {/* Marc AI mobile iterations */}
          <div className="mt-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">Marc AI - Mobile Interface Design Iterations</p>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
              <Image
                src="/Marketcrunchai/MarcAImobileversioniterations.png"
                alt="Marc AI mobile interface - design iteration explorations"
                width={1200}
                height={600}
                className="w-full h-auto object-contain max-h-[420px] object-top"
              />
            </div>
            <p className="mt-2.5 font-mono text-xs text-text-muted">
              Design iteration explorations for Marc AI on mobile, testing chat panel positioning, avatar scale, and overlay vs. full-screen modal patterns
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          05: DESIGN SYSTEM & COMPONENT ARCHITECTURE
      ══════════════════════════════════════════════ */}
      <section id="designsystem" className="relative z-10 border-t border-border/40 bg-white py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="05 / DESIGN SYSTEM" title="Building a shared component library to unify design–engineering handoff and enforce visual consistency." />

          <div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              With an active engineering team shipping features in parallel, design consistency requires more than style guidelines, it requires a <strong className="font-medium text-text">component-driven design system</strong> that maps directly to the React component architecture. I built out the Figma component library using <strong className="font-medium text-text">atomic design principles</strong>: atoms (icons, tokens, type styles) composed into molecules (cards, nav items, buttons) and organisms (navigation bars, modal shells, ticker headers).
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Each component was documented with <strong className="font-medium text-text">variant properties, interactive states (default, hover, active, disabled, error), auto-layout constraints, and spacing tokens</strong>, all exported via Figma Dev Mode directly to the React codebase. The left navigation was fully rebuilt using <strong className="font-medium text-text">Google Material Design icons</strong> for systematic iconographic consistency, paired with an improved typographic scale and an "Upgrade to Pro" conversion card embedded as a permanent nav item.
            </p>
          </div>

          {/* Full component sheet */}
          <div className="mb-2.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Full Component Library - MarketCrunch AI Design System</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/50 bg-[#F9FAFB]">
            <Image
              src="/Marketcrunchai/Components.png"
              alt="MarketCrunch AI - full component library"
              width={1200}
              height={500}
              className="h-auto max-h-[420px] w-full object-contain object-top"
            />
          </div>
          <p className="mt-2.5 font-mono text-xs text-text-muted">
            Atomic component library - tokens, atoms, molecules, and organisms with variant properties and auto-layout
          </p>

          {/* Left nav + upgrade card side by side */}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Left Nav - Redesigned Desktop Components</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB] flex-1">
                <Image
                  src="/Marketcrunchai/leftnavdesktopcomponents.png"
                  alt="Left nav desktop - redesigned component system"
                  width={600}
                  height={440}
                  className="w-full h-auto object-contain max-h-[300px] object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">Material Design icons + improved typographic scale, all nav items with active, hover, and collapsed states</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Left Nav - Upgrade to Pro Conversion Card</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB] flex-1">
                <Image
                  src="/Marketcrunchai/leftnav_upgradetopro_card.png"
                  alt="Left nav upgrade to pro card - conversion surface design"
                  width={600}
                  height={440}
                  className="w-full h-auto object-contain max-h-[300px] object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">Embedded upsell card in left nav, passive navigation surface converted into an active conversion touchpoint</p>
            </div>
          </div>

          {/* Pill + alert components, compact row */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Pill Multi-Select - Filter Component Variants</p>
              <ComponentSheet
                src="/Marketcrunchai/pilldesigncomponents.png"
                alt="Pill multi-select component - all variants and states"
                caption="Default, selected, disabled, and multi-select group states with auto-layout wrapping behavior"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Add Alert - Interaction Flow Components</p>
              <ComponentSheet
                src="/Marketcrunchai/addalertallcomponents.png"
                alt="Add alert component - all interaction states"
                caption="Default, triggered, confirmation, and error states - mapped to notification system backend"
              />
            </div>
          </div>

          {/* Navbar live redesign */}
          <div className="mt-8">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">Left Nav Redesign - Live in Production</p>
            <MediaPop>
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A12]">
                <LoopGif
                  src="/Marketcrunchai/navbarnewdesignlivescreenrecording.gif"
                  alt="Redesigned left nav - live production screen recording"
                />
              </div>
            </MediaPop>
            <p className="mt-3 text-center font-mono text-xs text-text-muted">
              Shipped nav redesign - Material Design icons, refined typographic hierarchy, and Upgrade to Pro card live in production
            </p>
          </div>
        </div>
      </section>


      <SprintDivider number="04" label="Marc AI & Conversion" weeks="Week 9–12 · Aug–Sep 2025" />

      {/* ══════════════════════════════════════════════
          06: MARC AI - AI PERSONA & CONVERSATIONAL UI
      ══════════════════════════════════════════════ */}
      <section id="marcai" className="relative z-10 py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="06 / MARC AI" title="Designing a human-readable face for an AI financial advisor, the trust dimension of conversational UI." />

          {/* Marc AI closeup GIF with hand-drawn doodle annotation */}
          <div className="mb-16 overflow-x-clip">
            <div className="relative inline-block">
              {/* GIF — fixed width, no border */}
              <div className="w-[200px] md:w-[260px] overflow-hidden rounded-2xl">
                <LoopGif
                  src="/Marketcrunchai/marcaicloseup.gif"
                  alt="Marc AI - animated closeup, the AI financial advisor persona"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Doodle annotation — hidden on mobile, shown md+ so it never causes overflow */}
              <div
                className="pointer-events-none select-none hidden md:block"
                aria-hidden="true"
                style={{ position: "absolute", top: "-36px", left: "220px" }}
              >
                <svg
                  width="260"
                  height="160"
                  viewBox="0 0 260 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ overflow: "visible" }}
                >
                  <text
                    x="20"
                    y="30"
                    fontFamily="'Caveat', 'Segoe Script', 'Comic Sans MS', cursive"
                    fontSize="26"
                    fontWeight="700"
                    fill="var(--color-accent, #FF5210)"
                  >
                    Meet Marc AI
                  </text>
                  <path
                    d="M 50 44 C 40 75, 20 105, -10 128"
                    stroke="var(--color-accent, #FF5210)"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                  <path
                    d="M -10 128 L -4 115 M -10 128 L 5 122"
                    stroke="var(--color-accent, #FF5210)"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.9"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Marc AI is MarketCrunch's primary AI financial advisor, a conversational model that contextualizes market data and interprets prediction drivers for the user. The product challenge was a <strong className="font-medium text-text">UX trust problem</strong>: anthropomorphizing AI in fintech carries specific risks, users either over-trust or distrust AI personas. The design had to project <strong className="font-medium text-text">competence, neutrality, and approachability simultaneously</strong>.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              I designed Marc's visual identity as a <strong className="font-medium text-text">mid-40s professional</strong>, an age bracket that signals domain experience without projecting the inaccessible authority of a hedge fund manager. The facial expression was calibrated to be welcoming but not cartoonish, with visual design choices (color palette, framing) consistent with the platform's analytical brand register.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Post-launch qualitative feedback indicated <strong className="font-medium text-text">improved perceived trustworthiness</strong> of the AI advisor, with users more likely to engage with Marc's explanations of model outputs, a key behavior for platform retention and the "explainability" value proposition MarketCrunch is built on.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Marc AI - Launch Announcement Modal</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB] flex-1">
                <Image
                  src="/Marketcrunchai/marc_ai_announcementmodaldesign.png"
                  alt="Marc AI - announcement modal design"
                  width={600}
                  height={480}
                  className="w-full h-auto object-contain max-h-[360px] object-top"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Marc Chat Interface - Design Iterations</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB] flex-1">
                <Image
                  src="/Marketcrunchai/marcchatdesigniteration.png"
                  alt="Marc chat interface - design iterations exploring layout and interaction model"
                  width={600}
                  height={480}
                  className="w-full h-auto object-contain max-h-[360px] object-top"
                />
              </div>
            </div>
          </div>

          {/* Marc window GIF - looping */}
          <MediaPop className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A12]">
              <LoopGif
                src="/Marketcrunchai/Marcwindowopenlatest&current.gif"
                alt="Marc AI window - live interaction, open and close flow"
              />
            </div>
          </MediaPop>
          <p className="mt-3 text-center font-mono text-xs text-text-muted">
            Marc AI panel - live interaction recording showing the panel open / close flow and conversational UI
          </p>

          {/* Feature: Backtest overlay */}
          <div className="mt-14">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">Feature: Backtest Overlay - Progressive Disclosure Pattern</p>
            <p className="mb-4 font-mono text-sm text-text-secondary max-w-2xl">
              The backtesting visualization was redesigned from a static full-width widget to an <strong className="font-medium text-text">on-demand overlay triggered inline</strong> next to the Predictive Confidence metric, applying progressive disclosure to reduce visual noise on initial load while preserving access to historical model performance for users who need it.
            </p>
            <MediaPop>
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A12]">
                <LoopGif
                  src="/Marketcrunchai/backtestfeaturescreenrecording.gif"
                  alt="Backtest overlay feature, progressive disclosure interaction pattern"
                />
              </div>
            </MediaPop>
          </div>

          {/* Feature: Trending tab */}
          <div className="mt-10">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">Feature: Most Trending Tab - Ticker Discovery Surface</p>
            <p className="mb-4 font-mono text-sm text-text-secondary max-w-2xl">
              Designed the "Most Trending" tab as a passive discovery surface, giving users an ambient signal of market attention without requiring active search intent. Follows a scannability-optimized layout with ticker, momentum indicator, and directional signal in a compact card format.
            </p>
            <MediaPop>
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-[#0A0A12]">
                <LoopGif
                  src="/Marketcrunchai/mostrendingtablatest&current.gif"
                  alt="Most trending tab - ticker discovery interaction"
                />
              </div>
            </MediaPop>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          07: AI PICKS, PAYMENTS & CONVERSION FLOWS
      ══════════════════════════════════════════════ */}
      <section id="conversion" className="relative z-10 border-t border-border/40 bg-white py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="07 / CONVERSION DESIGN" title="Redesigning the AI Picks page and payments flow to support user acquisition and subscription conversion." />

          <div className="mb-10 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The AI Picks page is the primary feature differentiator for MarketCrunch, the destination that converts casual visitors into subscribers. The legacy design had a fragmented anonymous user experience: no clear content gating strategy, inconsistent navigation for non-authenticated users, and a payments modal that prioritized information density over conversion clarity.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              I designed two variations of the desktop AI Picks experience, one optimizing for <strong className="font-medium text-text">content preview with soft gates</strong> (blur-on-scroll, partial data visible), and one for <strong className="font-medium text-text">authenticated users with full data access</strong>. The payments modal was redesigned with a clear plan comparison layout, social proof elements, and a CTA hierarchy that reduced decision friction.
            </p>
          </div>

          {/* AI Picks v1 and v2 */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">AI Picks - Desktop Variation 1</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB] flex-1">
                <Image
                  src="/Marketcrunchai/AI Picks- Desktopproposeddesignv1.png"
                  alt="AI Picks desktop - design variation 1"
                  width={600}
                  height={480}
                  className="w-full h-auto object-contain max-h-[360px] object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">Card-based layout with ticker cards, emphasis on scan-ability and momentum indicators</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">AI Picks - Desktop Variation 2</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB] flex-1">
                <Image
                  src="/Marketcrunchai/AI Picks- Desktopproposeddesign2v1.png"
                  alt="AI Picks desktop - design variation 2"
                  width={600}
                  height={480}
                  className="w-full h-auto object-contain max-h-[360px] object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">List-based layout : denser information, optimized for power users monitoring multiple tickers</p>
            </div>
          </div>

          {/* Legacy AI picks + payments */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Legacy AI Picks - Mobile Audit Baseline</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
                <Image
                  src="/Marketcrunchai/Legacyaipickspagedesignmobile.png"
                  alt="Legacy AI Picks mobile - audit baseline"
                  width={600}
                  height={460}
                  className="w-full h-auto object-contain max-h-[300px] object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">Legacy mobile - inconsistent card sizing, no hierarchy between daily picks and contextual data</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Payments Modal : Redesigned Conversion Flow</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
                <Image
                  src="/Marketcrunchai/Paymentsdesignboard.png"
                  alt="Payments modal - redesigned conversion flow"
                  width={600}
                  height={460}
                  className="w-full h-auto object-contain max-h-[300px] object-top"
                />
              </div>
              <p className="font-mono text-[10px] text-text-muted">Redesigned payments modal for plan comparison, value anchoring, and reduced decision friction</p>
            </div>
          </div>

          {/* Signup modal */}
          <div className="mt-6">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">Signup Modal - Onboarding Gate Design</p>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
              <Image
                src="/Marketcrunchai/Signup Modaldesignframe.png"
                alt="Signup modal - onboarding gate design"
                width={1200}
                height={560}
                className="w-full h-auto object-contain max-h-[380px] object-top"
              />
            </div>
            <p className="mt-2.5 font-mono text-xs text-text-muted">
              Signup modal design - value proposition front-loaded above the form fields, social proof integrated, minimal friction entry for trial conversion
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          08: SEARCH HISTORY - FEATURE SPECIFICATION
      ══════════════════════════════════════════════ */}
      <section id="featurespec" className="relative z-10 py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="08 / FEATURE SPEC" title="Search history dropdown, reducing recall burden for high-frequency traders through persistent interaction state." />

          <div className="mb-16 grid gap-6 md:grid-cols-2">
            <Fade>
              <div className="rounded-xl p-6" style={{background:"linear-gradient(270deg, #f19d9e33, #f1ece6)"}}>
                <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-red-500 mb-2">The Problem</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  Core personas (Swing Traders, Active Growth Strategists) return to the same 5–15 tickers per day. The search flow required <strong className="font-medium text-text">full symbol recall and manual re-entry every session</strong> — violating Nielsen #6 and adding friction where speed directly correlates with user value.
                </p>
              </div>
            </Fade>
            <Fade delay={0.1}>
              <div className="rounded-xl p-6" style={{background:"linear-gradient(270deg, #9ff09c33, #f0ebe6)"}}>
                <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-green-600 mb-2">The Solution</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  A <strong className="font-medium text-text">contextual search history dropdown</strong> triggered on focus — surfaces 5–10 recent tickers chronologically, one-tap to analyze. Aligns with MarketCrunch's "60-second analysis" positioning and compounds session habituation with every return visit.
                </p>
              </div>
            </Fade>
          </div>

          {/* User stories */}
          <Fade>
            <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-5">User Stories</p>
          </Fade>
          <div className="grid gap-5 md:grid-cols-2">
            <Fade delay={0.05}>
              <div className="rounded-2xl bg-[#F0EEFF] border border-[#C9BFFF]/40 p-7 relative overflow-hidden">
                <span className="absolute -top-4 -left-1 font-manrope text-[100px] font-bold text-[#8E60F0]/10 leading-none select-none">&ldquo;</span>
                <div className="relative">
                  <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E60F0] mb-1">🧑‍💼 Systematic Swing Trader</p>
                  <p className="font-mono text-sm leading-relaxed text-text mt-3">
                    "As a swing trader monitoring AAPL, TSLA, and NVDA across multiple sessions, I want to re-access analyzed tickers without re-entering symbols — eliminating the 15+ weekly manual inputs that interrupt my analysis workflow."
                  </p>
                </div>
              </div>
            </Fade>
            <Fade delay={0.1}>
              <div className="rounded-2xl bg-[#FFF4EE] border border-[#FFCFB3]/40 p-7 relative overflow-hidden">
                <span className="absolute -top-4 -left-1 font-manrope text-[100px] font-bold text-[#FF5210]/10 leading-none select-none">&ldquo;</span>
                <div className="relative">
                  <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5210] mb-1">🧑‍💻 Novice Retail Investor</p>
                  <p className="font-mono text-sm leading-relaxed text-text mt-3">
                    "As a new user unfamiliar with ticker symbol notation, I want symbols I've previously searched to persist — reducing input errors and removing a barrier to regular platform engagement."
                  </p>
                </div>
              </div>
            </Fade>
          </div>

          {/* Interaction spec */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Trigger",
                desc: "Focus event on search input field, dropdown appears without requiring any query input"
              },
              {
                label: "Interaction Model",
                desc: "Single tap on ticker → direct navigate to analyze page. Zero intermediate steps, zero confirmation dialogs"
              },
              {
                label: "State Management",
                desc: "Chronological order (most recent first). 5–10 items. 'Clear all' accessible from dropdown and Settings"
              }
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-border/50 bg-bg-alt p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">{item.label}</p>
                <p className="font-mono text-sm leading-relaxed text-text">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-primary/15 bg-primary/4 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">Competitive Gap - Differentiation Opportunity</p>
            <p className="font-mono text-sm leading-relaxed text-text">
              Neither TradingView, Seeking Alpha, nor Robinhood surface a <strong className="font-medium">persistent search history as a primary search interaction pattern</strong>. This is a low-implementation, high-learnability improvement that creates a compounding habituation advantage, every return visit becomes faster, increasing session frequency and platform stickiness proportionally.
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          09: OUTCOMES & REFLECTION
      ══════════════════════════════════════════════ */}
      <section id="outcomes" className="relative z-10 border-t border-border/40 bg-white py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="09 / OUTCOMES" title="Platform growth, performance recognition, and what this internship shaped in my practice." />

          <div className="mb-12 grid gap-10 md:grid-cols-2 lg:gap-16">
            <div className="space-y-5">
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                During this engagement, MarketCrunch <strong className="font-medium text-text">exited stealth mode, completed UPenn's Venture Lab accelerator (VIPX), and secured $450K+ in SAFEs</strong>, with the CEO publicly citing "delightful UX" as a core driver of the platform's 16× MAU growth and double-digit engagement lift. The hit rate feature and mobile navigation redesign were among the most-cited improvements in post-launch user feedback.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                I shipped multiple features end-to-end, from heuristic evaluation through Figma prototyping, React implementation, and production deployment, acting simultaneously as <strong className="font-medium text-text">designer, front-end developer, and product co-owner</strong>. Daily sprint cadence with CEO, CTO, engineering, and research leads gave me fluency in stakeholder communication at executive level.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                The internship closed with a <strong className="font-medium text-text">performance bonus from both CEO and CTO</strong>, direct recognition that design output had measurably moved platform metrics. This was the clearest validation that closing the design-to-deployment loop, rather than operating purely as a handoff designer, produces disproportionate product impact.
              </p>
            </div>

            <div className="flex flex-col gap-8 justify-center">
              <StatItem value="16×" label="Monthly active user growth across 2025" />
              <StatItem value="$450K+" label="Raised in SAFEs after stealth exit" />
              <StatItem value="6+" label="Features designed & shipped end-to-end" />
              <StatItem value="Bonus" label="Performance recognition from CEO + CTO" />
            </div>
          </div>

          {/* Impact summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Hit Rate Feature",
                method: "Trust signal design / Data-ink ratio",
                impact: "Reduced bounce rate · New user growth attributed to trust signal",
                color: "border-primary/20 bg-primary/4",
                tag: "Shipped",
              },
              {
                title: "Mobile Bottom Nav",
                method: "Navigation architecture / Recognition over recall",
                impact: "Persistent navigation scaffold · Direct feature discoverability improvement",
                color: "border-[#8E60F0]/20 bg-[#8E60F0]/4",
                tag: "Shipped",
              },
              {
                title: "Ticker Bar Redesign",
                method: "Interaction design / Affordance mapping",
                impact: "CTA integration at highest-visibility surface · Add Alert, Share, Bookmark",
                color: "border-[#FF5210]/20 bg-[#FF5210]/4",
                tag: "Shipped",
              },
              {
                title: "Left Nav System",
                method: "Design system / Material Design icons",
                impact: "Systematic iconography · Typographic hierarchy · Upgrade CTA embedded",
                color: "border-green-500/20 bg-green-500/4",
                tag: "Shipped",
              },
              {
                title: "Marc AI Persona",
                method: "Conversational UI / AI trust design",
                impact: "Improved perceived AI trustworthiness · Increased engagement with model explanations",
                color: "border-amber-500/20 bg-amber-500/4",
                tag: "Shipped",
              },
              {
                title: "React Implementation",
                method: "Design-to-code / Figma Dev Mode",
                impact: "Eliminated handoff lag · Faster iteration loops · Direct production deployment",
                color: "border-primary/20 bg-primary/4",
                tag: "Code",
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl border p-5 ${item.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-manrope text-sm font-medium text-text">{item.title}</h3>
                  <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-text-muted">{item.tag}</span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">{item.method}</p>
                <p className="font-mono text-xs leading-relaxed text-text-secondary">{item.impact}</p>
              </div>
            ))}
          </div>

          {/* CEO quote */}
          <div className="mt-10 rounded-xl border border-border/50 bg-bg-alt p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">CEO · LinkedIn · Post-Stealth Announcement</p>
            <blockquote className="border-l-2 border-primary/30 pl-6">
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                "In 2025, MAU grew ~16x, double-digit engagement growth (validates our 'core loop'), and retentive paying customers. That wouldn't be possible without our small-but-mighty, technical team of Math/Physics PhDs and seasoned Mag7 builders, who combined <strong className="font-medium text-text">delightful UX and quantitative research rigor.</strong>"
              </p>
              <footer className="mt-4 font-mono text-xs text-text-muted">
                - Bhushan Suryavanshi, Founder & CEO · MarketCrunch AI · ex-Amazon, PayJoy, Zynga · Wharton School, UPenn
              </footer>
            </blockquote>
          </div>

          {/* Reflection */}
          <div className="mt-8 rounded-xl border border-border/50 bg-white p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">Reflection</p>
            <div className="space-y-4">
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Working as the sole designer in a high-velocity startup environment surfaced a clear principle: <strong className="font-medium text-text">the most impactful design decisions aren't the most complex ones ,they're the ones that identify where the gap between user mental model and interface behavior is widest.</strong> The hit rate feature required no novel interaction pattern. It required recognizing that trust was the missing variable, and designing the simplest possible signal to communicate it.
              </p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Building features in React alongside my Figma outputs compressed the feedback loop between design intent and production behavior ,and revealed numerous edge cases that static prototypes couldn't surface. <strong className="font-medium text-text">Designers who can implement their own specifications ship more accurate products faster.</strong>
              </p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Embedded in daily standups with the CEO, CTO, quant research team, and USC research collaborators, I developed fluency in translating between domain-specific financial model language and interface design rationale ,a communication skill I consider foundational for any designer working in AI-powered or data-intensive products.
              </p>
            </div>
          </div>

          {/* Next project nav */}
          <div className="mt-16 flex items-center justify-between border-t border-border/40 pt-8">
            <Link
              href="/#work"
              className="group flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-text"
            >
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
              All Projects
            </Link>
            <Link
              href="/work/hack4impact"
              className="group flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-text"
            >
              Next: HackImpact Portal
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
