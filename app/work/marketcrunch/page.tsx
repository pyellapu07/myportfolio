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
import {
  FigmaIcon,
  AsanaIcon,
  SlackIcon,
  GoogleAnalyticsIcon,
  GoogleLighthouseIcon,
  ReactIcon,
  CursorIcon,
} from "@/components/ToolIcons";

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
   RADIAL DIAL NAV — vertical mechanical dial with tick sounds
   Drag up/down to scrub sections; ticks fire on each crossing
───────────────────────────────────────────────────────────── */
const SECTION_NAV = [
  { id: "background", label: "Background", ticks: 2 },
  { id: "problem", label: "Problem", ticks: 2 },
  { id: "personas", label: "Personas", ticks: 2 },
  { id: "audit", label: "UX Audit", ticks: 3 },
  { id: "process", label: "Process", ticks: 3 },
  { id: "analyze", label: "Analyze Page", ticks: 4 },
  { id: "mobile", label: "Mobile UX", ticks: 3 },
  { id: "marcai", label: "Marc AI", ticks: 3 },
  { id: "search", label: "Search History", ticks: 3 },
  { id: "outcomes", label: "Outcomes", ticks: 2 },
];

// Flat tick list — each major section + its sub-ticks
function VerticalNav({ sections }: { sections: typeof SECTION_NAV }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // ── IntersectionObserver: track which section is active ──
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isScrollingRef.current) {
            setActiveIdx(i);
          }
        },
        { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  // ── Dark background detection ──
  useEffect(() => {
    const checkDark = () => {
      const nav = navRef.current;
      if (!nav) return;
      const { top, height } = nav.getBoundingClientRect();
      const midY = top + height / 2;
      const el = document.elementFromPoint(window.innerWidth - 40, midY);
      if (!el) return;
      let node: HTMLElement | null = el as HTMLElement;
      while (node && node !== document.body) {
        const bg = getComputedStyle(node).backgroundColor;
        if (/rgb\(1[0-5],|rgb\(10,|rgb\(26,|rgb\(45,/.test(bg)) {
          setIsDark(true); return;
        }
        node = node.parentElement;
      }
      setIsDark(false);
    };
    window.addEventListener("scroll", checkDark, { passive: true });
    checkDark();
    return () => window.removeEventListener("scroll", checkDark);
  }, []);

  return (
    <div ref={navRef} className="fixed top-1/2 z-50 hidden -translate-y-1/2 xl:flex flex-col gap-3"
      style={{ right: "40px", userSelect: "none" }}>
      {sections.map((section, i) => {
        const isActive = i === activeIdx;
        return (
          <button
            key={i}
            onClick={() => {
              setActiveIdx(i);
              const targetEl = document.getElementById(section.id);
              if (targetEl) {
                isScrollingRef.current = true;
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => { isScrollingRef.current = false; }, 1000);
              }
            }}
            className="group relative flex items-center justify-end"
            aria-label={`Scroll to ${section.label}`}
          >
            <span className={cn(
              "absolute right-6 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0",
              isActive ? (isDark ? "opacity-100 translate-x-0 text-white font-semibold" : "opacity-100 translate-x-0 text-primary font-semibold") : (isDark ? "translate-x-2 text-white/40 group-hover:text-white" : "translate-x-2 text-text-muted group-hover:text-text")
            )}>
              {section.label}
            </span>
            <span className={cn(
              "block w-1.5 rounded-full transition-all duration-300",
              isActive ? (isDark ? "h-6 bg-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.4)]" : "h-6 bg-primary shadow-[0_0_12px_rgba(99,102,241,0.4)]") : (isDark ? "h-1.5 bg-white/20 group-hover:bg-white/40 group-hover:h-3" : "h-1.5 bg-border/50 group-hover:bg-border group-hover:h-3")
            )} />
          </button>
        );
      })}
    </div>
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
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2">{label}</div>
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

export default function MarketCrunchPage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-text selection:bg-primary/20">
      <CustomCursor />
      <Header initialDark={true} />
      <ProjectSmartBar />
      <GridBackground />
      <VerticalNav sections={SECTION_NAV} />

      {/* ══════════════════════════════════════════════
          01: HERO & IMPACT
      ══════════════════════════════════════════════ */}
      <section id="background" className="relative z-10 pt-32 pb-24 md:pt-48 md:pb-32">
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
                Sole product designer at an angel-funded fintech AI startup. I owned the full design-to-deployment cycle across a live platform serving retail investors with <strong className="font-medium text-text">300M+ data points daily.</strong>
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
                Acted as a hybrid PM, Researcher, and Designer. Heuristic evaluation · IA redesign · Interaction design · Usability testing · React JS development in Cursor.
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Cross-functional Collabs</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Bhushan Suryavanshi (CEO, Wharton / Amazon) · Ashim Datta (CTO) · Sylvan (Research) · Harsh Parikh (Eng) · Raman Ebrahimi (Quant PhD).
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Tools & Stack</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1">
                <div className="flex items-center gap-1.5">
                  <FigmaIcon size={15} />
                  <span className="font-mono text-sm text-text-secondary">Figma</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1.5">
                  <ReactIcon size={15} />
                  <span className="font-mono text-sm text-text-secondary">React JS</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1.5">
                  <CursorIcon size={15} />
                  <span className="font-mono text-sm text-text-secondary">Cursor</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1.5">
                  <AsanaIcon size={15} />
                  <span className="font-mono text-sm text-text-secondary">Asana</span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact at a Glance */}
          <div className="mt-6 rounded-2xl border border-border/50 bg-white p-8 md:p-10 shadow-sm">
            <p className="mb-8 font-mono text-[10px] uppercase tracking-widest text-text-muted">Quantified Impact & Business Growth</p>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <StatItem value="16×" label="MAU growth in 2025" />
              <StatItem value="300M+" label="Data points analyzed daily" />
              <StatItem value="$450K+" label="Raised in SAFEs post-stealth" />
              <StatItem value="Bonus" label="Awarded for design impact" />
            </div>
            <div className="mt-8 rounded-xl border border-primary/15 bg-primary/4 p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">CEO · Post-Stealth Excerpt</p>
              <p className="font-mono text-sm leading-relaxed text-text">
                &quot;MAU grew ~16x, double-digit engagement growth... That wouldn&apos;t be possible without our small-but-mighty team who combined <strong className="font-medium">delightful UX and quantitative research rigor.</strong>&quot; — Bhushan Suryavanshi, Founder & CEO
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          02: PROBLEM & OBJECTIVES
      ══════════════════════════════════════════════ */}
      <section id="problem" className="relative z-10 border-t border-border/40 bg-[#FAFAFA] py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="02 / THE CHALLENGE" title="Retail traders juggle too many tools and distrust hallucinating AI." />

          <div className="mb-16 grid gap-10 md:grid-cols-2 lg:gap-16">
            <Fade>
              <div className="space-y-4">
                <h3 className="font-manrope text-xl font-semibold text-text">The Problem</h3>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  Retail investors are burdened by fragmented workflows—jumping between screeners, watchlists, charts, news, and &quot;gut feeling.&quot; While MarketCrunch possessed incredibly robust, non-hallucinating quantitative models (analyzing Treasury data, sentiment, and historical prices), <strong className="font-medium text-text">the legacy interface lacked clarity and trust signals.</strong> Users bounded quickly from the Analyze page because the data felt overwhelming without proper Information Architecture.
                </p>
              </div>
            </Fade>
            <Fade delay={0.1}>
              <div className="space-y-4">
                <h3 className="font-manrope text-xl font-semibold text-text">Project Objectives & KPIs</h3>
                <ul className="space-y-3 font-mono text-sm text-text-secondary">
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-primary">✓</span>
                    <span><strong>Democratize Quant Research:</strong> Translate complex hedge-fund metrics into digestible, actionable UI.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-primary">✓</span>
                    <span><strong>Reduce Friction:</strong> Eliminate repetitive tasks (like ticker input) for high-frequency users.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-primary">✓</span>
                    <span><strong>Build Trust:</strong> Surface model accuracy clearly to mitigate AI skepticism.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-primary">✓</span>
                    <span><strong>KPIs:</strong> Reduce bounce rate, increase MAU, and optimize mobile discoverability.</span>
                  </li>
                </ul>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          03: USER PERSONAS
      ══════════════════════════════════════════════ */}
      <section id="personas" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="03 / AUDIENCE" title="Who are we building the personal quant for?" />

          <p className="mb-12 max-w-2xl font-mono text-base leading-relaxed text-text-secondary">
            Through stakeholder interviews and product alignment, we anchored our design decisions around three core target personas. The goal was to serve the power user without alienating the beginner.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <Fade>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-[#F4F9FF]">
                <div className="bg-[#E6F0FF] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-xl text-white shadow-sm">
                      💼
                    </div>
                    <div>
                      <p className="font-manrope text-sm font-bold text-text">Julian Vance</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-blue-600">Systematic Swing Trader</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-4 font-mono text-[11px] italic text-text-secondary">
                    &quot;I track AAPL and NVDA daily. I need to spot the trend confirmation before the market opens, and I hate retyping tickers.&quot;
                  </p>
                  <div className="mt-auto space-y-3 font-mono text-xs text-text-muted">
                    <div className="flex justify-between border-b border-blue-500/10 pb-2">
                      <span>Habits</span> <span className="text-text">Checks 5-15 stocks daily</span>
                    </div>
                    <div className="flex justify-between border-b border-blue-500/10 pb-2">
                      <span>Pain Point</span> <span className="text-text">Repetitive navigation friction</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal</span> <span className="text-text">Rapid validation of trends</span>
                    </div>
                  </div>
                </div>
              </div>
            </Fade>

            <Fade delay={0.1}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-[#FFF5F2]">
                <div className="bg-[#FFEBE5] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5210] text-xl text-white shadow-sm">
                      ⏱️
                    </div>
                    <div>
                      <p className="font-manrope text-sm font-bold text-text">Elena Rostova</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#FF5210]">Time-Constrained Investor</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-4 font-mono text-[11px] italic text-text-secondary">
                    &quot;I have a day job. I want a 60-second summary on whether the macros justify my long position in tech.&quot;
                  </p>
                  <div className="mt-auto space-y-3 font-mono text-xs text-text-muted">
                    <div className="flex justify-between border-b border-[#FF5210]/10 pb-2">
                      <span>Habits</span> <span className="text-text">Reads updates on commute</span>
                    </div>
                    <div className="flex justify-between border-b border-[#FF5210]/10 pb-2">
                      <span>Pain Point</span> <span className="text-text">Information overload / jargon</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal</span> <span className="text-text">Glanceable, high-signal data</span>
                    </div>
                  </div>
                </div>
              </div>
            </Fade>

            <Fade delay={0.2}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-[#F6F2FF]">
                <div className="bg-[#EDE6FF] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8E60F0] text-xl text-white shadow-sm">
                      🌱
                    </div>
                    <div>
                      <p className="font-manrope text-sm font-bold text-text">Marcus Lee</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#8E60F0]">Novice Retail Trader</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-4 font-mono text-[11px] italic text-text-secondary">
                    &quot;These AI tools just guess. How do I know this bot is actually looking at real data and not just hallucinating?&quot;
                  </p>
                  <div className="mt-auto space-y-3 font-mono text-xs text-text-muted">
                    <div className="flex justify-between border-b border-[#8E60F0]/10 pb-2">
                      <span>Habits</span> <span className="text-text">Explores socially hyped stocks</span>
                    </div>
                    <div className="flex justify-between border-b border-[#8E60F0]/10 pb-2">
                      <span>Pain Point</span> <span className="text-text">Skeptical of AI &quot;black boxes&quot;</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal</span> <span className="text-text">Transparent trust signals</span>
                    </div>
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          JOURNEY MAP
      ══════════════════════════════════════════════ */}
      <section id="journeymap" className="relative z-10 bg-[#FAFAFA] pb-24 md:pb-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="04 / USER JOURNEY MAP" title="Mapping the Systematic Swing Trader's workflow to identify friction points." />
          <div className="overflow-x-auto pb-6 scrollbar-hide">
            <div className="min-w-[800px] grid grid-cols-4 gap-4">
              {/* Timeline Header */}
              <div className="col-span-4 grid grid-cols-4 gap-4 border-b border-border/40 pb-4">
                <div className="font-manrope font-bold text-text">1. Discover & Retrieve</div>
                <div className="font-manrope font-bold text-text">2. Analyze & Synthesize</div>
                <div className="font-manrope font-bold text-text">3. Decide & Execute</div>
                <div className="font-manrope font-bold text-text">4. Monitor & Adjust</div>
              </div>

              {/* Doing */}
              <div className="col-span-4 grid grid-cols-4 gap-4 border-b border-border/40 py-4">
                <div className="text-sm font-mono text-text-muted mb-2 col-span-4 uppercase tracking-widest">Doing</div>
                <div className="bg-white p-4 rounded-lg border border-border/50 shadow-sm text-sm text-text-secondary leading-relaxed">Opens app. Recalls tickers (AAPL, TSLA). Manually types each one into the search bar.</div>
                <div className="bg-white p-4 rounded-lg border border-border/50 shadow-sm text-sm text-text-secondary leading-relaxed">Scans technicals. Attempts to parse MarketCrunch&apos;s AI price predictions. Cross-references News.</div>
                <div className="bg-white p-4 rounded-lg border border-border/50 shadow-sm text-sm text-text-secondary leading-relaxed">Determines if the AI prediction aligns with their gut. Switches to brokerage app to execute trade.</div>
                <div className="bg-white p-4 rounded-lg border border-border/50 shadow-sm text-sm text-text-secondary leading-relaxed">Checks back frequently to see if the prediction was accurate over a 5-day window.</div>
              </div>

              {/* Thinking / Feeling */}
              <div className="col-span-4 grid grid-cols-4 gap-4 border-b border-border/40 py-4">
                <div className="text-sm font-mono text-text-muted mb-2 col-span-4 uppercase tracking-widest">Thinking / Feeling</div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-700 leading-relaxed">😩 &quot;Why do I have to re-type the exact same tickers every morning?&quot;</div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-sm text-orange-700 leading-relaxed">🤔 &quot;There&apos;s so much data here. How confident is this AI model? Can I trust it?&quot;</div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-700 leading-relaxed">🤨 &quot;I&apos;ll trust my own technicals over this black-box number.&quot;</div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700 leading-relaxed">🧐 &quot;Did the model actually get it right? I can&apos;t easily see its track record.&quot;</div>
              </div>

              {/* Opportunities */}
              <div className="col-span-4 grid grid-cols-4 gap-4 py-4">
                <div className="text-sm font-mono text-text-muted mb-2 col-span-4 uppercase tracking-widest">Opportunities</div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800 leading-relaxed">💡 Implement <strong className="font-medium">Recent Searches</strong> dropdown to eliminate typing friction.</div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800 leading-relaxed">💡 Restructure Analyze page Information Architecture. Group technicals logically.</div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800 leading-relaxed">💡 Introduce <strong className="font-medium">Hit Rate Trust Signal</strong> to visibly prove model accuracy.</div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-green-800 leading-relaxed">💡 Add alerts and notifications for tracked predictions to bring them back.</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          05: UX AUDIT
      ══════════════════════════════════════════════ */}
      <section id="audit" className="relative z-10 bg-[#FAFAFA] py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="05 / COMPREHENSIVE UX AUDIT" title="Rigorous heuristic evaluation across 20+ screens to establish a redesign baseline." />

          <div className="mb-12 max-w-[1000px] space-y-5">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Before touching any pixels in Figma, I conducted a structured <strong className="font-medium text-text">heuristic evaluation</strong> benchmarked against Nielsen&apos;s 10 Usability Heuristics, WCAG 2.1 AA compliance, color contrast ratios, and typographic readability standards. I audited every core flow in the legacy application.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Competitor benchmarking (TradingView, Robinhood, Seeking Alpha) mapped out standard interaction patterns, highlighting where MarketCrunch&apos;s legacy platform suffered from &quot;friction via novelty.&quot;
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The audit surfaced critical P0 violations: <strong className="font-medium text-text">no persistent mobile navigation</strong> (violating Recognition over Recall), a <strong className="font-medium text-text">dead ticker bar</strong> (zero action affordances on the most visible element), and a <strong className="font-medium text-text">trust signal absence</strong> for the core quant models. All findings were ranked by severity, documented, and triaged into Asana sprints.
            </p>
          </div>

          {/* Audit Image Carousel */}
          <div className="mb-16">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Extracted Export of 10-Page Audit Document</p>
            <div className="flex w-full gap-5 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {[
                "0.Guide.png",
                "1. Navigation.png",
                "2. Homepage.png",
                "2.1 Homepage.png",
                "3. Dashboard.png",
                "4. Analyze.png",
                "4.1 Analyze.png",
                "5. Alerts.png",
                "6. AI Picks.png",
                "Recommendations.png"
              ].map((img, i) => (
                <div key={img} className="flex-none w-[85vw] md:w-[700px] snap-center shrink-0">
                  <div className="overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm h-full flex items-center justify-center p-2">
                    <Image
                      src={`/Marketcrunchai/${img}`}
                      alt={`UX Audit Document - ${img}`}
                      width={1000}
                      height={700}
                      className="w-full h-auto object-contain max-h-[500px]"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Scroll hint */}
            <div className="flex items-center gap-2 justify-center text-text-muted font-mono text-[10px] uppercase tracking-widest">
              <span>←</span>
              <span>Scroll to view all 10 pages</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      <SprintDivider number="01" label="Strategy & Foundation" weeks="Week 1–2 · Jun 2025" />

      {/* ══════════════════════════════════════════════
          05: DESIGN PROCESS COLLABORATION
      ══════════════════════════════════════════════ */}
      <section id="process" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="05 / DESIGN PROCESS" title="A hybrid methodology: Design Thinking × Lean UX × Agile." />

          <div className="mb-12 space-y-6 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Operating in a fast-paced, angel-funded startup meant we couldn&apos;t afford a bloated 3-month research phase. Instead, we adopted a <strong className="font-medium text-text">hybrid combo of Design Thinking, Lean UX, and Agile</strong>.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              We used Design Thinking to empathize and frame the problem space, Lean UX to brainstorm and build rapid low-fidelity prototypes to validate assumptions, and daily Agile sprints to ship, gather Google Analytics feedback, and iterate endlessly.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Our continuous loop: <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">Observe Needs → Brainstorm → Sprint Calls → Build (Low-fi) → Feedback → Refine (Hi-fi) → Code → Deploy</code>.
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-bg-alt p-6 md:p-10 mb-16">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Process Framework Implementation</p>
            <div className="overflow-hidden rounded-lg border border-border/40 bg-white shadow-sm">
              <Image
                src="/Marketcrunchai/design-process-framework.png"
                alt="Design process framework - Design Thinking, Lean UX, and Agile integrated methodology"
                width={1200}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-text-muted">
              We started with rapid ideation and low-fidelity wireframes, mapping out the Information Architecture before committing to visual polish. Pros/cons for each layout were evaluated with stakeholders before converting to high-fidelity utilizing the brand&apos;s design language.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INFORMATION ARCHITECTURE
      ══════════════════════════════════════════════ */}
      <section id="ia" className="relative z-10 bg-[#FAFAFA] py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="06 / INFORMATION ARCHITECTURE" title="Structuring the platform for intuitive wayfinding." />

          <div className="mb-12 max-w-[1000px] space-y-5">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The legacy architecture suffered from shallow navigation paths and dead ends. I restructured the core site map to centralize the <strong className="font-medium text-text">Analyze core loop</strong>, creating dedicated, persistent homes for AI Picks, Options, and Profile settings.
            </p>
          </div>

          <div className="overflow-x-auto pb-8 scrollbar-hide">
            <div className="min-w-[900px] p-8 rounded-3xl border border-border/50 bg-[#F9FAFB] flex flex-col items-center">
              {/* Main App Node */}
              <div className="bg-[#0A0A12] text-white px-8 py-4 rounded-xl font-manrope font-bold shadow-lg mb-8 relative">
                MarketCrunch Web App
                <div className="absolute w-0.5 h-8 bg-border/80 left-1/2 -bottom-8 -translate-x-1/2"></div>
              </div>

              {/* Level 1 Connections */}
              <div className="w-[800px] h-0.5 bg-border/80 mb-8 relative">
                <div className="absolute w-0.5 h-8 bg-border/80 left-0 top-0"></div>
                <div className="absolute w-0.5 h-8 bg-border/80 left-[266px] top-0"></div>
                <div className="absolute w-0.5 h-8 bg-border/80 left-[533px] top-0"></div>
                <div className="absolute w-0.5 h-8 bg-border/80 right-0 top-0"></div>
              </div>

              {/* Level 1 Nodes */}
              <div className="flex w-[800px] justify-between items-start gap-4">
                {/* Branch 1 */}
                <div className="flex flex-col items-center w-48">
                  <div className="bg-white border-2 border-primary/20 px-6 py-3 rounded-lg font-manrope font-semibold text-text shadow-sm w-full text-center z-10 flex flex-col items-center justify-center">
                    <span className="text-xl mb-1">🏠</span>
                    <span className="text-sm">Home</span>
                  </div>
                  <div className="w-0.5 h-6 bg-border/50 my-2"></div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded mb-2 text-xs font-mono text-text-secondary w-full text-center shadow-sm">Market Pulse</div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded mb-2 text-xs font-mono text-text-secondary w-full text-center shadow-sm">Trending Tickers</div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded text-xs font-mono text-text-secondary w-full text-center shadow-sm">Watchlist</div>
                </div>

                {/* Branch 2 */}
                <div className="flex flex-col items-center w-48 relative">
                  <div className="bg-white border-2 border-blue-500/30 px-6 py-3 rounded-lg font-manrope font-semibold text-blue-900 shadow-sm w-full text-center z-10 flex flex-col items-center justify-center">
                    <span className="text-xl mb-1">📈</span>
                    <span className="text-sm">Analyze</span>
                  </div>
                  <div className="w-0.5 h-6 bg-border/50 my-2"></div>
                  <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded mb-2 text-xs font-mono text-blue-800 w-full text-center font-medium shadow-sm">Search History</div>
                  <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded mb-2 text-xs font-mono text-blue-800 w-full text-center font-medium shadow-sm">Hit Rate Indicator</div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded mb-2 text-xs font-mono text-text-secondary w-full text-center shadow-sm">Technicals / Greeks</div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded mb-2 text-xs font-mono text-text-secondary w-full text-center shadow-sm">Marc AI Tool</div>
                </div>

                {/* Branch 3 */}
                <div className="flex flex-col items-center w-48">
                  <div className="bg-white border-2 border-green-500/30 px-6 py-3 rounded-lg font-manrope font-semibold text-green-900 shadow-sm w-full text-center z-10 flex flex-col items-center justify-center">
                    <span className="text-xl mb-1">🎯</span>
                    <span className="text-sm">AI Picks</span>
                  </div>
                  <div className="w-0.5 h-6 bg-border/50 my-2"></div>
                  <div className="bg-green-50 border border-green-100 px-4 py-2 rounded mb-2 text-xs font-mono text-green-800 w-full text-center font-medium shadow-sm">Progressive Gate</div>
                  <div className="bg-green-50 border border-green-100 px-4 py-2 rounded mb-2 text-xs font-mono text-green-800 w-full text-center font-medium shadow-sm">Stripe Payments</div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded text-xs font-mono text-text-secondary w-full text-center shadow-sm">Premium Listing</div>
                </div>

                {/* Branch 4 */}
                <div className="flex flex-col items-center w-48">
                  <div className="bg-white border-2 border-gray-300 px-6 py-3 rounded-lg font-manrope font-semibold text-text shadow-sm w-full text-center z-10 flex flex-col items-center justify-center">
                    <span className="text-xl mb-1">⚙️</span>
                    <span className="text-sm">Profile</span>
                  </div>
                  <div className="w-0.5 h-6 bg-border/50 my-2"></div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded mb-2 text-xs font-mono text-text-secondary w-full text-center shadow-sm">Account Settings</div>
                  <div className="bg-white border border-border/50 px-4 py-2 rounded text-xs font-mono text-text-secondary w-full text-center shadow-sm">Subscriptions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SprintDivider number="02" label="Analyze Refactor" weeks="Week 3–5 · Jun–Jul 2025" />

      {/* ══════════════════════════════════════════════
          06: ANALYZE PAGE (Problem -> Approach -> Solution)
      ══════════════════════════════════════════════ */}
      <section id="analyze" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="06 / THE ANALYZE PAGE" title="Restructuring the core engine for clarity, action, and trust." />

          {/* 1. THE PROBLEM */}
          <div className="mb-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 font-mono text-[10px] font-bold text-red-600">1</span>
              <h3 className="font-manrope text-xl font-bold text-text">The Problem: Fragmentation</h3>
            </div>
            <p className="font-mono text-sm leading-relaxed text-text-secondary mb-6 max-w-2xl">
              The legacy layout suffered from severe cognitive overload. Prior Accuracy, Technical Analysis, and Model Information were siloed across disparate UI regions. The ticker bar—the highest visibility element—was a dead surface with <strong className="font-medium text-text">zero action affordances</strong>.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-red-500/20 bg-red-50/50 p-2">
                <Image src="/Marketcrunchai/Legacyanalyzepagedesignbottomhalf.png" alt="Legacy Analyze Bottom Half" width={600} height={400} className="w-full h-auto rounded-lg border border-border/40 object-contain" />
                <p className="mt-2 text-center font-mono text-[10px] text-red-500 uppercase tracking-wider">Legacy: Disjointed Layout</p>
              </div>
              <div className="overflow-hidden rounded-xl border border-red-500/20 bg-red-50/50 p-2">
                <Image src="/Marketcrunchai/Legacyanalyzepagedesign.png" alt="Legacy Analyze Top Half" width={600} height={400} className="w-full h-auto rounded-lg border border-border/40 object-top object-contain max-h-[200px]" />
                <p className="mt-2 text-center font-mono text-[10px] text-red-500 uppercase tracking-wider">Legacy: Dead Ticker Header</p>
              </div>
            </div>
          </div>

          {/* 2. THE APPROACH (Trust Signal / Hit Rate) */}
          <div className="mb-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 font-mono text-[10px] font-bold text-yellow-600">2</span>
              <h3 className="font-manrope text-xl font-bold text-text">The Approach: Designing the &quot;Hit Rate&quot; Trust Signal</h3>
            </div>
            <p className="font-mono text-sm leading-relaxed text-text-secondary mb-6 max-w-2xl">
              To mitigate &quot;AI skepticism,&quot; I designed the <strong className="font-medium text-text">Hit Rate component</strong>. Instead of raw RMSE values, we translated accuracy into a color-coded streak (90, 30, 7, and 5-day windows). Utilizing progressive disclosure, it provides a glanceable trust signal that expands for detail without overwhelming novice traders.
            </p>
            <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] items-center">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#0A0A12] shadow-sm">
                <LoopGif src="/Marketcrunchai/hitratecloseupview.gif" alt="Hit rate component live view" />
              </div>
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Design System Component</p>
                <div className="overflow-hidden rounded-xl border border-border/50 bg-white p-2">
                  <Image src="/Marketcrunchai/hitratecomponents.png" alt="Hit Rate Variants" width={400} height={300} className="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. THE SOLUTION (V1 Redesign) */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 font-mono text-[10px] font-bold text-green-600">3</span>
              <h3 className="font-manrope text-xl font-bold text-text">The Solution: Proposed Desktop v1</h3>
            </div>
            <p className="font-mono text-sm leading-relaxed text-text-secondary mb-8 max-w-[800px]">
              The final architecture brought the Action CTAs (Add Alert, Share, Bookmark) directly into the newly modular Ticker Header. The Hit Rate, Sentiment, and Technicals were grouped sequentially in the primary eyeline, reducing cognitive load and creating a coherent narrative from Data-to-Decision.
            </p>

            <div className="rounded-xl border border-border/50 bg-bg-alt p-5 mb-8">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Ticker Bar Redesign: Before / After</p>
              <div className="overflow-hidden rounded-lg border border-border/40 bg-white">
                <Image src="/Marketcrunchai/tickerbarcomparisionoldvsnew.png" alt="Ticker bar before and after" width={1000} height={400} className="w-full h-auto object-contain" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-[#FAFAFA] p-2">
              <Image
                src="/Marketcrunchai/Analyzepage - Desktopproposeddesignv1.png"
                alt="Analyze page desktop - proposed redesign v1"
                width={1200}
                height={800}
                className="w-full h-auto rounded-xl border border-border/40 object-contain shadow-lg"
              />
            </div>
            <div className="mt-6 flex justify-between gap-6 px-4">
              <div>
                <p className="font-manrope text-sm font-bold text-green-600">↓ 35% Bounce Rate</p>
                <p className="font-mono text-xs text-text-muted mt-1">Due to improved trust signals.</p>
              </div>
              <div>
                <p className="font-manrope text-sm font-bold text-blue-600">↑ Virality CTAs</p>
                <p className="font-mono text-xs text-text-muted mt-1">Share/Alert added to header.</p>
              </div>
              <div>
                <p className="font-manrope text-sm font-bold text-purple-600">Contextual Sidebar</p>
                <p className="font-mono text-xs text-text-muted mt-1">Right rail isolated for macroeconomic News.</p>
              </div>
            </div>
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
              <div className="rounded-xl p-6" style={{ background: "linear-gradient(270deg, #f19d9e33, #f1ece6)" }}>
                <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-red-500 mb-2">The Problem</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  MarketCrunch&apos;s primary use case is mobile, yet had <strong className="font-medium text-text">no persistent navigation scaffold</strong>. Switching between Analyze, AI Picks, Options, and Market Pulse required memory-dependent paths — violating Recognition over Recall (Nielsen #6).
                </p>
              </div>
            </Fade>
            <Fade delay={0.1}>
              <div className="rounded-xl p-6" style={{ background: "linear-gradient(270deg, #9ff09c33, #f0ebe6)" }}>
                <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-green-600 mb-2">The Solution</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  A <strong className="font-medium text-text">persistent bottom tab bar</strong> following iOS HIG + Material Design conventions — the most thumb-accessible zone per eye-tracking research. Icon + label pairs enable direct wayfinding with zero cognitive overhead.
                </p>
              </div>
            </Fade>
          </div>

          {/* Bottom Nav before vs after */}
          <div className="flex flex-col gap-3 mb-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Navigation Redesign : Introducing the Persistent Tab Bar</p>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-bg-alt pb-4">
              <Image
                src="/Marketcrunchai/oldtonewcomparisionofbottomnavmobileview.png"
                alt="Mobile navigation redesign : before and after"
                width={1200}
                height={700}
                className="w-full h-auto object-contain max-h-[600px] object-top"
              />
            </div>
            <div className="font-mono text-xs text-text-muted flex flex-col gap-2 mt-1">
              <span className="flex items-center gap-1.5">🔴 <strong className="font-medium text-text-secondary">Before:</strong> Disjointed experience with no reliable way to return home or switch core contexts.</span>
              <span className="flex items-center gap-1.5">🟢 <strong className="font-medium text-text-secondary">After:</strong> A persistent bottom tab bar acting as a primary scaffold, anchored by the AI Picks gateway.</span>
            </div>
          </div>

          {/* Most Viewed Table before vs after */}
          <div className="flex flex-col gap-3 mt-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Data Table Redesign : The &quot;Most Viewed&quot; Feed</p>

            <div className="font-mono text-sm leading-relaxed text-text-secondary mb-4 max-w-2xl flex flex-col gap-4">
              <p><strong className="font-medium text-text">Refactoring for Density & Clarity:</strong> The legacy layout displayed long, obfuscated user strings (e.g., &quot;pr******ep&quot;) and repeated dates across rows, causing unnecessary horizontal overflow (<span className="text-red-500">Left Sidebar</span>).</p>
              <p>I restructured the table to fit comfortably within a narrow mobile viewport (<span className="text-green-600">Right Sidebar</span>). Obfuscated names were replaced with clean, color-coded profile alphabet badges (e.g., <span className="inline-flex w-4 h-4 rounded-full bg-blue-100 text-[8px] items-center justify-center text-blue-700">PY</span>), and timestamps were moved inline below the metric view count to eliminate the redundant column.</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/50 bg-[#FAFAFA]">
              <Image
                src="/Marketcrunchai/oldtonewcomparisionofmostviewedmobileview.png"
                alt="Most viewed data table redesign"
                width={1200}
                height={700}
                className="w-full h-auto object-contain"
              />
            </div>
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
              Each component was documented with <strong className="font-medium text-text">variant properties, interactive states (default, hover, active, disabled, error), auto-layout constraints, and spacing tokens</strong>, all exported via Figma Dev Mode directly to the React codebase. The left navigation was fully rebuilt using <strong className="font-medium text-text">Google Material Design icons</strong> for systematic iconographic consistency, paired with an improved typographic scale and an &quot;Upgrade to Pro&quot; conversion card embedded as a permanent nav item.
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


      <SprintDivider number="04" label="AI Trust & Conversion" weeks="Week 9–10 · Aug 2025" />

      {/* ══════════════════════════════════════════════
          08: MARC AI & CONVERSION
      ══════════════════════════════════════════════ */}
      <section id="marcai" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="08 / MARC AI & CONVERSION" title="Designing a conversational quant that users actually trust." />

          <div className="mb-20 flex flex-col items-center md:flex-row md:items-start md:gap-12 relative max-w-4xl pl-0 md:pl-32">
            <div className="relative w-48 md:w-56 shrink-0 mb-20 md:mb-0">
              <div className="relative z-10 w-full">
                <LoopGif src="/Marketcrunchai/marcaicloseup.gif" alt="Marc AI Avatar closeup" />
              </div>

              <div className="absolute -left-4 -bottom-16 md:top-auto md:bottom-8 md:-left-44 md:translate-x-0 z-20 pointer-events-none">
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');`}</style>
                <div className="flex items-center gap-1 md:gap-2 rotate-[-4deg]">
                  <span style={{ fontFamily: "'Caveat', cursive" }} className="text-[40px] leading-none text-[#8E60F0] whitespace-nowrap mb-1">Ask Marc</span>
                  {/* Mobile Arrow: Points UP-RIGHT */}
                  <svg width="40" height="50" viewBox="0 0 100 100" fill="none" stroke="#8E60F0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="md:hidden -translate-y-6">
                    <path d="M 20 90 Q 60 50 80 10" />
                    <path d="M 50 15 L 80 10 L 85 45" />
                  </svg>
                  {/* Desktop Arrow: Points RIGHT */}
                  <svg width="50" height="40" viewBox="0 0 100 100" fill="none" stroke="#8E60F0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="hidden md:block -translate-y-2">
                    <path d="M 10 70 Q 50 20 90 50" />
                    <path d="M 70 35 L 90 50 L 70 65" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-5 flex-1 relative z-10">
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                Anthropomorphizing AI in fintech is risky. Users either over-trust or inherently distrust a conversational bot. We needed Marc AI to act as a translator for complex quant data, but it had to project <strong className="font-medium text-text">competence, neutrality, and approachability.</strong>
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                I designed Marc&apos;s persona as a <strong className="font-medium text-text">warm, middle-aged, friendly financial advisor.</strong> By avoiding the hyper-slick &quot;hedge fund manager&quot; trope and the robotic &quot;cyborg&quot; trope, we hit the sweet spot of approachability.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] mb-16 items-start">
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Marc AI Interface Design</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
                <Image
                  src="/Marketcrunchai/marc_ai_announcementmodaldesign.png"
                  alt="Marc AI - announcement modal design"
                  width={600}
                  height={480}
                  className="w-full h-auto object-contain object-top max-h-[460px]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Chat Modal Interaction</p>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-[#0A0A12] h-full shadow-sm">
                <LoopGif src="/Marketcrunchai/Marcwindowopenlatest&current.gif" alt="Marc AI Chat live interaction recording" />
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-border/40 pt-16">
            <h3 className="font-manrope text-2xl font-bold text-text mb-6">Optimizing the AI Picks & Payments Flow</h3>
            <p className="font-mono text-base leading-relaxed text-text-secondary mb-10 max-w-2xl">
              The AI Picks page is our primary acquisition hook. I applied progressive disclosure gating—blurring content subtly to generate curiosity while demonstrating the structure of the value. For authenticated users, we provided list vs. card views.
            </p>
            <div className="grid gap-6 md:grid-cols-3 items-stretch">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Picks V1 (Discovery)</p>
                <div className="rounded-xl border border-border/50 bg-white p-2 flex-grow overflow-hidden">
                  <Image src="/Marketcrunchai/AI Picks- Desktopproposeddesignv1.png" alt="AI Picks V1" width={400} height={300} className="w-full h-auto object-cover rounded-lg" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Picks V2 (Density)</p>
                <div className="rounded-xl border border-border/50 bg-white p-2 flex-grow overflow-hidden">
                  <Image src="/Marketcrunchai/AI Picks- Desktopproposeddesign2v1.png" alt="AI Picks V2" width={400} height={300} className="w-full h-auto object-cover rounded-lg" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Payments Modal</p>
                <div className="rounded-xl border border-border/50 bg-white p-2 flex-grow overflow-hidden">
                  <Image src="/Marketcrunchai/Paymentsdesignboard.png" alt="Payments Redesign" width={400} height={300} className="w-full h-auto object-cover rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          09: SEARCH HISTORY SPEC
      ══════════════════════════════════════════════ */}
      <section id="search" className="relative z-10 border-t border-border/40 bg-[#FAFAFA] py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="09 / SEARCH SPECIFICATION" title="Search history dropdown: A low-implementation, high-yield feature." />

          <p className="mb-10 font-mono text-sm leading-relaxed text-text-secondary max-w-2xl">
            My research indicated that Swing Traders (Persona 1) return to the same handful of tickers daily. By forcing them to re-type tickers every session, we were inducing friction. I designed a Search History dropdown to drastically reduce this recall burden.
          </p>

          <div className="grid gap-5 md:grid-cols-2 mb-12">
            <div className="rounded-2xl bg-[#F0EEFF] border border-[#C9BFFF]/40 p-7 relative overflow-hidden">
              <span className="absolute -top-4 -left-1 font-manrope text-[100px] font-bold text-[#8E60F0]/10 leading-none select-none">&ldquo;</span>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm">🧑‍💼</p>
                  <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E60F0] m-0">Julian (Swing Trader)</p>
                </div>
                <p className="font-mono text-sm leading-relaxed text-text mt-3">
                  &quot;As a swing trader monitoring AAPL, TSLA, and NVDA, I want to re-access analyzed tickers without re-entering symbols — eliminating the 15+ weekly manual inputs that interrupt my analysis workflow.&quot;
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-white p-7">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">Competitive Gap</p>
              <p className="font-mono text-sm leading-relaxed text-text">
                Neither TradingView nor Seeking Alpha surface a <strong className="font-medium text-text">persistent search history as a primary search interaction</strong>. This creates a compounding habituation advantage for MarketCrunch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          10: OUTCOMES
      ══════════════════════════════════════════════ */}
      <section id="outcomes" className="relative z-10 border-t border-border/40 bg-white py-28 md:py-40">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="10 / OUTCOMES & REFLECTION" title="Platform growth, performance recognition, and closing the gap between design and code." />

          <div className="mb-12 grid gap-10 md:grid-cols-2 lg:gap-16">
            <div className="space-y-5">
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                During this engagement, MarketCrunch <strong className="font-medium text-text">exited stealth mode, completed UPenn&apos;s Venture Lab accelerator (VIPX), and secured $450K+ in SAFEs.</strong>
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                By bridging Product Management, UX Design, and React Development via Cursor, I was able to ship entire feature loops without blocking engineering. The hit rate feature and mobile redesign were the most-cited improvements in post-launch feedback.
              </p>
            </div>

            <div className="flex flex-col gap-6 justify-center">
              <StatItem value="16×" label="Monthly active user growth across 2025" />
              <StatItem value="↓ 35%" label="Analyze page bounce rate reduction" />
              <StatItem value="Bonus" label="Performance recognition from CEO + CTO" />
            </div>
          </div>

          {/* CEO quote */}
          <div className="mt-10 mb-16 rounded-xl border border-border/50 bg-bg-alt p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">CEO · LinkedIn · Post-Stealth Announcement</p>
            <blockquote className="border-l-2 border-primary/30 pl-6">
              <p className="font-mono text-sm leading-relaxed text-text-secondary italic">
                &quot;In 2025, MAU grew ~16x, double-digit engagement growth (validates our &apos;core loop&apos;)... That wouldn&apos;t be possible without our small-but-mighty, technical team of Math/Physics PhDs and seasoned Mag7 builders, who combined <strong className="font-medium text-text">delightful UX and quantitative research rigor.</strong>&quot;
              </p>
              <footer className="mt-4 font-mono text-xs text-text-muted">
                - Bhushan Suryavanshi, Founder & CEO · MarketCrunch AI · ex-Amazon, PayJoy, Zynga · Wharton School, UPenn
              </footer>
            </blockquote>
          </div>

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
              Next: HackImpact
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
