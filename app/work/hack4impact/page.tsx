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
  Briefcase,
  Copy,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRecruiter } from "@/lib/recruiter-context";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import SparkIcon from "@/components/SparkIcon";
import { FigmaIcon, NotionIcon } from "@/components/ToolIcons";

/* ─────────────────────────────────────────────────────────────
   PROJECT CHAT
───────────────────────────────────────────────────────────── */
const PROJECT_PLACEHOLDERS = [
  "Ask about this project...",
  "Ask about the research process...",
  "Ask about the design decisions...",
  "Ask about the Agile sprint process...",
];

const PROJECT_PILLS = [
  "Why pills instead of checkboxes?",
  "What did Microsoft Reston say?",
  "How did you run user research?",
];

const RECRUITER_PILLS = [
  "How did he handle a 33-page monolithic form?",
  "What was the impact on completion rates?",
  "How did he collaborate with the PMs?",
  "Can you explain the pill-style component decision?",
];

function RecruiterHighlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { isRecruiterMode } = useRecruiter();
  if (!isRecruiterMode) return <>{children}</>;
  return <span className={cn("text-primary", className)}>{children}</span>;
}

function WhyThisMatters({ id, headline, points, nextHref, prevHref }: { id?: string; headline: string; points: string[]; nextHref?: string; prevHref?: string; }) {
  const { isRecruiterMode } = useRecruiter();
  if (!isRecruiterMode) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto my-0 max-w-[1000px] px-6 md:px-12"
      id={id}
    >
      <div
        className="relative mb-8 mt-12 overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.06) 30%, rgba(168,85,247,0.04) 60%, rgba(79,70,229,0.03) 100%)",
          boxShadow: "0 4px 32px rgba(99,102,241,0.06)",
        }}
      >
        <div className="mb-4 flex items-center gap-2.5">
          <SparkIcon size={18} />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold">Why This Matters, Recruiter Lens</p>
        </div>
        <p className="font-manrope text-base font-semibold text-text mb-4">{headline}</p>
        <ul className="space-y-2">
          {points.map((p, i) => (
            <li key={i} className="flex items-start gap-2.5 font-mono text-sm text-text-secondary">
              <span className="mt-1 text-primary/50 shrink-0">→</span>
              {p}
            </li>
          ))}
        </ul>

        {(nextHref || prevHref) && (
          <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
            {prevHref ? (
              <a href={prevHref} className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/60 transition-colors hover:text-primary">↑ Previous Lens</a>
            ) : <span />}
            {nextHref ? (
              <a href={nextHref} className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/60 transition-colors hover:text-primary">Next Lens ↓</a>
            ) : <span />}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProjectSmartBar() {
  const { isRecruiterMode } = useRecruiter();
  const pills = isRecruiterMode ? RECRUITER_PILLS : PROJECT_PILLS;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRecruiterMode) {
      setIsExpanded(true);
      setIsMaximized(false);
    }
  }, [isRecruiterMode]);

  // Typewriter rotating placeholder
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
          message: `[Context: HackImpact UMD Application Portal Redesign. 3-month Agile UX project. Weekly Monday sprint calls with cross-functional team (PMs, Tech Leads, Engineers, UI/UX Designers) and Microsoft Reston dev reviewer. Stakeholder: Aaryan Patel (Recruitment Manager). Collaborator: Sohayainder Kaur. Key outcomes: 33-page monolithic form → 4-step progressive flow, 80% reduction in navigation time, 750+ applicants/year, built full component library, replaced checkbox skill selection with pill-style components, introduced status tracker with Active/Inactive states, project live in production.] ${text}`,
          mode: isRecruiterMode ? "recruiter" : "general",
          conversationHistory: [],
        }),
      });
      const data = await res.json();
      const raw = data.content || "I can help answer that based on Pradeep's project details.";
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
      {/* Click-outside backdrop */}
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
        className={cn(
          "fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300",
          isExpanded ? (isMaximized ? "w-[calc(100%-3rem)] max-w-[1000px]" : "w-[calc(100%-3rem)] max-w-[800px]") : "w-[calc(100%-3rem)] max-w-[640px]"
        )}
        data-no-cursor
      >
        {isExpanded && <div className={cn("chat-glow transition-all duration-300", isMaximized ? "opacity-30" : "opacity-60")} style={{ borderRadius: isMaximized ? "48px" : "36px" }} />}
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
              <div className={cn("flex flex-col transition-all duration-300", isMaximized ? "h-[75vh] max-h-[800px]" : "h-[340px]")}>
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-border/40 bg-bg-alt/50 px-5 py-3 shrink-0">
                  <span className="font-manrope text-sm font-medium text-text">Ask about this project</span>
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
                      onClick={() => setIsMaximized(!isMaximized)}
                      title={isMaximized ? "Minimize" : "Maximize"}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text"
                    >
                      {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button
                      onClick={() => setIsExpanded(false)}
                      title="Close"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                  {isRecruiterMode && (messages.length === 0 || isMaximized) && (
                    <div className={cn("flex flex-col shrink-0", messages.length > 0 ? "mb-6 border-b border-border/40 pb-6" : "h-full")}>
                      <div className="mb-6 flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h3 className="font-manrope text-base font-semibold text-text">Recruiter Summary Lens</h3>
                          <p className="mt-1 font-mono text-sm leading-relaxed text-text-secondary">
                            Role fit: UX Researcher / UI Designer · Level: Intern / Junior · Proof: 80% navigation time reduction.<br />
                            <span className="font-medium text-text">Why it matters:</span> Proven ability to untangle complex legacy constraints and ship in rapid Agile sprints.
                          </p>
                        </div>
                      </div>

                      <div className={messages.length === 0 ? "mt-auto" : "mt-2"}>
                        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-text-muted">
                          Suggested Interview Questions
                        </p>
                        <div className={cn("grid gap-2", isMaximized ? "grid-cols-2" : "grid-cols-1")}>
                          {RECRUITER_PILLS.map((pill) => (
                            <div
                              key={pill}
                              className="group flex items-center justify-between rounded-xl border border-border/40 bg-bg-alt/50 px-4 py-3 transition-colors hover:border-primary/30"
                            >
                              <span className={cn("font-mono text-text-secondary group-hover:text-text", isMaximized ? "text-xs pr-2" : "text-sm")}>{pill}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(pill);
                                    setCopiedId(pill);
                                    setTimeout(() => setCopiedId(null), 2000);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-text-muted shadow-sm ring-1 ring-border/50 transition-colors hover:text-primary"
                                  title="Copy question"
                                >
                                  {copiedId === pill ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                                <button
                                  onClick={() => {
                                    send(pill);
                                    if (!isMaximized) setTimeout(() => setIsMaximized(true), 150);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-text-muted shadow-sm ring-1 ring-border/50 transition-colors hover:text-primary"
                                  title="Ask AI"
                                >
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!isRecruiterMode && messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <Sparkles size={18} className="text-primary/30" />
                      <p className="max-w-[200px] font-mono text-xs text-text-muted">
                        Ask about the process, decisions, or outcomes.
                      </p>
                    </div>
                  ) : (messages.length > 0 ? (
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
                  ) : null)}
                </div>

                {/* Input */}
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

        {/* Collapsed bar */}
        <div className="relative rounded-2xl border border-white/50 bg-white/20 p-1.5 shadow-smooth-lg backdrop-blur-2xl mt-1.5">
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

        {/* 3 recommended pills below bar (general mode only) */}
        {!isRecruiterMode && (
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
        )}
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

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-60px" }} transition={{ duration: 0.5 }} className="mb-12 md:mb-16">
      <span className="mb-3 block font-mono text-[11px] text-primary/60">{number}</span>
      <h2 className="font-manrope text-3xl font-medium tracking-tight text-text md:text-5xl">{title}</h2>
    </motion.div>
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

/* ─────────────────────────────────────────────────────────────
   RADIAL DIAL NAV
───────────────────────────────────────────────────────────── */
const SECTION_NAV = [
  { id: "h4i-process", label: "Process", ticks: 3 },
  { id: "h4i-discovery", label: "Discovery", ticks: 3 },
  { id: "h4i-research", label: "Research", ticks: 4 },
  { id: "h4i-design", label: "Design", ticks: 3 },
  { id: "h4i-solution", label: "Solution", ticks: 4 },
  { id: "h4i-outcome", label: "Outcome", ticks: 2 },
];

function VerticalNav({ sections }: { sections: typeof SECTION_NAV }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !isScrollingRef.current) {
          setActiveIdx(i);
        }
      }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });
      obs.observe(el); observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  return (
    <div className="fixed top-1/2 z-50 hidden -translate-y-1/2 xl:flex flex-col gap-3"
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
              "absolute right-6 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-text",
              isActive ? "opacity-100 translate-x-0 text-primary font-medium" : "translate-x-2 text-text-muted"
            )}>
              {section.label}
            </span>
            <span className={cn(
              "block w-1.5 rounded-full transition-all duration-300",
              isActive ? "h-6 bg-primary shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "h-1.5 bg-border/50 group-hover:bg-border group-hover:h-3"
            )} />
          </button>
        );
      })}
    </div>
  );
}

/* Insight card , used in research + decisions sections */
function InsightCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border/50 bg-white p-6 cursor-default"
      whileHover={{ scale: 1.025, y: -6 }}
    >
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      {children}
    </motion.div>
  );
}

function Fade({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-60px" }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function MediaPop({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: [0.34, 1.3, 0.64, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function HackImpactPage() {

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
            <span className="font-mono text-xs text-primary">UX Case Study</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="mb-6 font-manrope text-5xl font-medium leading-[1.05] tracking-tight text-text md:text-7xl lg:text-[5rem]">
                Redesigning the <br />
                <span className="text-primary">Application Portal.</span>
              </h1>
              <p className="max-w-xl font-mono text-base leading-relaxed text-text-secondary md:text-lg">
                We condensed a <RecruiterHighlight>33-page</RecruiterHighlight> monolithic form into a streamlined <RecruiterHighlight>4-step</RecruiterHighlight> progressive flow , reducing navigation time by <RecruiterHighlight>80%</RecruiterHighlight> for 750+ applicants annually.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:mb-4 lg:pl-12">
              <DetailRow label="Role" value="UX Researcher & Designer" />
              <DetailRow label="Collaborator" value="Sohayainder Kaur" />
              <DetailRow label="Timeline" value="Nov 2024 – May 2025" />
              <DetailRow
                label="Status"
                value={
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Live in Production
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
                User research · UI/UX design · Agile sprint reviews · Prototyping · Component library · Usability testing · Developer handoff
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Cross-functional Team</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Project Managers · Tech Leads · Engineers · UI/UX Designers · Dev Reviewer (Microsoft Reston)
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Tools</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2">
                  <FigmaIcon size={16} />
                  <span className="font-mono text-sm text-text-secondary">Figma</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-2">
                  <NotionIcon size={15} />
                  <span className="font-mono text-sm text-text-secondary">Notion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <MediaPop><div className="mt-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/50 bg-white">
              <Image
                src="/hack4impact/latestversionview.gif"
                alt="HackImpact Portal , Final Design"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div></MediaPop>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-1"
        headline="The ability to take a massive, sprawling legacy requirement (33 pages) and distill it into a progressive 4-step flow demonstrates strong synthesis and structural thinking."
        points={[
          "Reduced navigation time by 80%, directly impacting user satisfaction.",
          "Handled complex dependencies and cross-functional feedback from Microsoft devs.",
          "Delivered the full component library alongside the high-fidelity designs."
        ]}
        nextHref="#recruiter-lens-2"
      />

      {/* ══════════════════════════════════════════════
          00: PROCESS FRAMEWORK
      ══════════════════════════════════════════════ */}
      <section id="h4i-process" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="00 / PROCESS" title="How we worked, Agile UX" />

          <Fade><div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              This project followed an <strong className="font-medium text-text">Agile UX methodology</strong>, a hybrid of Lean UX thinking and Scrum sprint cadence. Rather than front-loading research before any design work, we ran <strong className="font-medium text-text">parallel discovery and delivery tracks</strong> within each sprint.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Every Monday, the full cross-functional team convened for a structured sprint call: designers presented findings and prototypes, engineers flagged technical constraints, and the Microsoft Reston dev reviewer provided implementation-level feedback. <strong className="font-medium text-text">Stakeholder interviews with Aaryan Patel</strong> (Recruitment Manager) were embedded into Sprint 1 and 2, ensuring the applicant-side redesign stayed aligned with recruiter-side backend requirements.
            </p>
          </div></Fade>

          {/* Agile UX sprint diagram placeholder */}
          <Fade><div className="rounded-xl border border-border/50 bg-bg-alt p-8 md:p-10">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Agile UX Framework, Sprint Structure</p>

            {/* Sprint timeline */}
            <div className="relative">
              {/* connector line */}
              <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-border/60 md:block" />
              <div className="grid gap-6 md:grid-cols-4 md:gap-0">
                {[
                  {
                    sprint: "Sprint 1",
                    phase: "Discover",
                    items: ["Stakeholder interviews", "Heuristic evaluation", "User flow mapping", "Pain point synthesis"],
                    color: "text-primary",
                    dot: "bg-primary",
                  },
                  {
                    sprint: "Sprint 2",
                    phase: "Define",
                    items: ["IA restructure", "Low-fi wireframes", "Flow validation", "Recruiter alignment"],
                    color: "text-[#8E60F0]",
                    dot: "bg-[#8E60F0]",
                  },
                  {
                    sprint: "Sprint 3",
                    phase: "Develop",
                    items: ["High-fidelity UI", "Component library", "Prototype iteration", "Dev review (Microsoft)"],
                    color: "text-[#FF5210]",
                    dot: "bg-[#FF5210]",
                  },
                  {
                    sprint: "Sprint 4",
                    phase: "Deliver",
                    items: ["Accessibility audit", "Dev handoff docs", "Reviewer interface", "Production launch"],
                    color: "text-green-600",
                    dot: "bg-green-500",
                  },
                ].map((s, i) => (
                  <div key={s.sprint} className="relative flex flex-col md:items-center md:px-4">
                    <div className={`relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-full border-4 border-bg-alt font-mono text-xs font-bold text-white ${s.dot}`}>
                      {i + 1}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{s.sprint}</span>
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

            <p className="mt-8 font-mono text-xs text-text-muted border-t border-border/40 pt-6">
              <strong className="font-medium text-text">Why Agile UX?</strong>, The project had hard sprint deadlines, an active engineering team writing code in parallel, and a dev reviewer who needed to sign off before each sprint closed. Waterfall wasn't an option. Agile UX let us validate with users early and course-correct without losing velocity.
            </p>

            {/* Agile UX framework diagram */}
            <MediaPop><div className="mt-6 relative w-full overflow-hidden rounded-lg border border-border/40 bg-white">
              <Image
                src="/hack4impact/agile-ux-framework.png"
                alt="Agile UX framework diagram"
                width={1200}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div></MediaPop>
          </div></Fade>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          01: DISCOVERY & CONTEXT
      ══════════════════════════════════════════════ */}
      <section id="h4i-discovery" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="01 / DISCOVERY" title="We audited a 33-page barrier." />

          <Fade><div className="grid gap-12 md:grid-cols-2 lg:gap-24">
            <div className="space-y-5">
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                HackImpact UMD receives <strong className="font-medium text-text">750+ applications every year</strong>. The existing portal was a monolithic form spanning 33 sequential pages with zero progress indication , applicants had no visibility into how much of the form remained.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                Our heuristic evaluation surfaced a critical <strong className="font-medium text-text">visibility-of-system-status violation</strong> (Nielsen's Heuristic #1): users were making decisions about whether to continue without any affordance showing their position in the task flow. Drop-off was a predictable consequence.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                Compounding this: a prominent <strong className="font-medium text-text">Admin Login CTA</strong> on the primary login screen created a consistent points of confusion , applicants interpreted it as a required step, generating recurring support overhead for the HackImpact team.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-8">
              <StatItem value="33" label="Pages in original monolithic form" />
              <StatItem value="0%" label="Application status visibility for users" />
              <StatItem value="2" label="Distinct user flows sharing a single entry point" />
            </div>
          </div></Fade>

          <MediaPop><figure className="mt-16">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
              <Image
                src="/hack4impact/formerdesign.png"
                alt="Original portal interface , heuristic audit"
                fill
                className="object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center font-mono text-xs text-text-muted max-w-2xl mx-auto">
              Original interface: Infinite scroll with no hierarchical grouping, a redundant sidebar navigation, and an Admin Login button competing with the primary applicant action.
            </figcaption>
          </figure></MediaPop>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          02: RESEARCH
      ══════════════════════════════════════════════ */}
      <section id="h4i-research" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="02 / RESEARCH" title="We mapped both sides of the system." />

          <Fade><div className="mb-10 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Before touching a single frame in Figma, we conducted <strong className="font-medium text-text">contextual inquiry sessions</strong> with current and former applicants, and ran a <strong className="font-medium text-text">structured stakeholder interview</strong> with Aaryan Patel (Recruitment Manager) to capture the recruiter-side mental model and backend constraints.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              We then synthesized findings into a <strong className="font-medium text-text">dual-lane user journey map</strong> , one for applicants, one for reviewers , to identify where the two flows intersected, where they diverged, and where the current IA was forcing them to collide unnecessarily.
            </p>
          </div></Fade>

          <MediaPop><div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
            <Image
              src="/hack4impact/userflow.png"
              alt="Dual-lane user journey map , Applicant and Reviewer pathways"
              fill
              className="object-contain p-6 transition-transform duration-700 hover:scale-[1.02]"
            />
          </div></MediaPop>
          <figcaption className="mt-4 text-center font-mono text-xs text-text-muted">
            Dual-lane user flow , mapping the Applicant and Reviewer pathways separately to expose IA conflicts in the original system.
          </figcaption>

          {/* Pain points */}
          <Fade><div className="mt-14 grid gap-5 md:grid-cols-2">
            <InsightCard label="Applicant pain points">
              <ul className="mt-3 space-y-2.5 font-mono text-sm text-text-secondary">
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>No progress indication; cognitive load from unknown form length led to premature abandonment</li>
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>Fear of data loss: no auto-save affordance, no explicit session persistence cue</li>
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>Dual-login confusion: Admin Login CTA intercepted applicant intent on the primary auth screen</li>
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>Checkbox overload for skill selection: high cognitive cost, poor scannability</li>
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>Post-submission silence: zero status visibility after application submitted</li>
              </ul>
            </InsightCard>
            <InsightCard label="Recruiter / reviewer pain points">
              <ul className="mt-3 space-y-2.5 font-mono text-sm text-text-secondary">
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>No access to partial or in-progress applications; blind spots in pipeline visibility</li>
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>Manual email-based status updates for every state change , no scalable notification system</li>
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>No centralized review dashboard; context-switching across multiple tools</li>
                <li className="flex gap-2"><span className="mt-0.5 text-text-muted">,</span>Inconsistent UI made dev iteration slow , no shared component language between design and engineering</li>
              </ul>
            </InsightCard>
          </div></Fade>

          {/* Key research finding callout */}
          <Fade><div className="mt-8 rounded-xl border border-primary/15 bg-primary/4 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">Key research insight</p>
            <p className="font-mono text-sm leading-relaxed text-text">
              The most critical finding: <strong className="font-medium">applicants and reviewers were sharing a single entry point</strong> without differentiated routing. First-time applicants needed to land on the form; returning applicants needed to land on their status page. The original IA treated them as identical , routing everyone to the same screen regardless of context, generating friction for both personas.
            </p>
          </div></Fade>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          03: DESIGN PROCESS
      ══════════════════════════════════════════════ */}
      <section id="h4i-design" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="03 / DESIGN PROCESS" title="From constraints to high-fidelity." />

          <Fade><div className="mb-10 max-w-2xl space-y-5">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              We ran <strong className="font-medium text-text">three rounds of design critique</strong> within each sprint , internal review, cross-functional team review (Monday sprint call), and Microsoft dev reviewer sign-off. This created a structured validation gate before any work moved to implementation.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The login screen alone went through <strong className="font-medium text-text">six documented iterations</strong> , each addressing a specific piece of feedback from the Monday sprint call or a usability issue surfaced during prototype walkthroughs with applicants.
            </p>
          </div></Fade>

          <MediaPop><div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
            <Image
              src="/hack4impact/login page design versions figma view screenshot.png"
              alt="Login screen iteration history in Figma"
              fill
              className="object-cover"
            />
          </div></MediaPop>
          <figcaption className="mt-4 text-center font-mono text-xs text-text-muted">
            Figma iteration history for the login screen , each version addressing specific sprint feedback and heuristic violations.
          </figcaption>

          {/* Design principles */}
          <Fade><div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                principle: "One primary action per screen",
                rationale: "Reduced the cognitive load of every screen to a single decision point. Eliminated competing CTAs (e.g., Apply vs Admin Login on the same surface).",
              },
              {
                principle: "Progressive disclosure over front-loading",
                rationale: "Broke the monolithic 33-page form into four logically sequenced steps. Users only saw what was relevant to their current task.",
              },
              {
                principle: "Affordances that match user mental models",
                rationale: "Replaced checkbox grids with pill-style multi-select , matching how users think about skill tagging rather than how a database schema thinks about it.",
              },
            ].map((p) => (
              <InsightCard key={p.principle} label="Design principle">
                <p className="font-manrope text-sm font-medium text-text mt-1">{p.principle}</p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">{p.rationale}</p>
              </InsightCard>
            ))}
          </div></Fade>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          04: THE SOLUTION
      ══════════════════════════════════════════════ */}
      <section id="h4i-solution" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="04 / SOLUTION" title="Six targeted design interventions." />

          <div className="mb-16 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Each design decision maps directly to a research finding. None were aesthetic choices , each solves a specific usability problem identified during discovery.
            </p>
          </div>

          {/* 1. IA Restructure */}
          <div className="mb-24">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted">01</p>
            <h3 className="mb-4 font-manrope text-2xl font-medium">Restructured the information architecture.</h3>
            <p className="mb-8 max-w-2xl font-mono text-sm leading-relaxed text-text-secondary">
              Separated the applicant-facing form flow from the status-checking flow into two distinct, context-aware entry points. Returning applicants are now routed to their status page; first-time applicants land directly on Step 1 of the form. Single-application-per-cycle enforcement was built in at the routing layer , if a user attempts to reapply within an active cycle, they receive a clear, non-blocking error state rather than reaching a confusing mid-form dead end.
            </p>
            <div className="rounded-xl border border-border/50 bg-bg-alt p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">Before vs After , Entry point routing</p>
              <div className="grid gap-4 md:grid-cols-2 font-mono text-xs text-text-secondary">
                <div className="rounded-lg border border-red-100 bg-red-50/50 p-4">
                  <p className="font-medium text-red-700 mb-2">Before</p>
                  <p>All users → single login screen → same landing page regardless of context (first-time vs returning)</p>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50/50 p-4">
                  <p className="font-medium text-green-700 mb-2">After</p>
                  <p>First-time → Step 1 of application form · Returning → Status page · Duplicate attempt → Error state with clear messaging</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Login modernization */}
          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted">02</p>
              <h3 className="mb-4 font-manrope text-2xl font-medium">Eliminated the competing auth entry point.</h3>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                The Admin Login button was removed from the primary auth screen and relocated to a separate, non-indexed route. This resolved the dual-intent confusion identified in research , applicants no longer encountered an action irrelevant to their task on the screen they visit first. Password reset and account creation options were repositioned below the fold, reducing visual noise at the primary decision point.
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
              <Image src="/hack4impact/improved version.png" alt="Redesigned login screen" fill className="object-contain" />
            </div>
          </div>

          {/* 3. Status tracker */}
          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/50 bg-white">
                <Image src="/hack4impact/latestversion Status Page__active.png" alt="Status page , Active state" fill className="object-cover" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted">03</p>
              <h3 className="mb-4 font-manrope text-2xl font-medium">Introduced a transparent application status tracker.</h3>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Research surfaced a recurring pattern: applicants emailing the HackImpact team asking "did you receive my application?" The root cause was zero post-submission feedback. We introduced a status page with a <strong className="font-medium text-text">three-stage progress timeline</strong> (Submitted → In Review → Decision), categorized into Active and Inactive states. Actionable affordances , Download Application and View Decision , were added as contextual actions that appear only when relevant to the current application state.
              </p>
            </div>
          </div>

          {/* 4. Pill components */}
          <div className="mb-24">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted">04</p>
            <h3 className="mb-4 font-manrope text-2xl font-medium">Replaced checkbox grids with pill-style multi-select.</h3>
            <p className="mb-8 max-w-2xl font-mono text-sm leading-relaxed text-text-secondary">
              The original skill selection interface used a dense checkbox grid , high cognitive load, poor visual hierarchy, no grouping. We replaced it with pill-style multi-select components: scannable, tap-friendly, visually organized by skill category. The selection interaction changed from a mechanical checkbox-tick pattern to something closer to how users naturally think about tagging , which drove measurable increases in form completion time.
            </p>
            <div className="rounded-xl border border-border/50 bg-bg-alt px-6 py-5">
              <p className="font-mono text-xs text-text-secondary">
                <strong className="font-medium text-text">Interaction rationale:</strong> Checkboxes communicate "select from a list of options." Pills communicate "this is your set of attributes , build it." The semantic framing shift alone reduced hesitation during usability walkthroughs.
              </p>
            </div>
          </div>

          {/* 5. Component library */}
          <div className="mb-24">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted">05</p>
            <h3 className="mb-6 font-manrope text-2xl font-medium">Built a standardized component library for scale.</h3>
            <p className="mb-8 max-w-2xl font-mono text-sm leading-relaxed text-text-secondary">
              The original portal had no shared design language , each screen was styled independently, creating visual inconsistency and making engineering iteration slow and error-prone. We authored a <strong className="font-medium text-text">modular component library in Figma</strong> covering: standardized form inputs and labels, submission and navigation buttons, pill-select components, typography scale and spacing tokens, and status state variants. The Microsoft dev reviewer specifically called out the component library as the element that made dev handoff viable.
            </p>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
              <Image src="/hack4impact/latestversioncomponents.png" alt="Component library , Figma" fill className="object-contain p-4" />
            </div>
            <figcaption className="mt-3 text-center font-mono text-xs text-text-muted">Component library: standardized across the applicant portal and structured for the forthcoming reviewer dashboard.</figcaption>
          </div>

          {/* 6. Progress indicator */}
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted">06</p>
            <h3 className="mb-6 font-manrope text-2xl font-medium">Introduced a 4-step progressive form with explicit wayfinding.</h3>
            <p className="mb-8 max-w-2xl font-mono text-sm leading-relaxed text-text-secondary">
              The 33-page form was restructured into four logically sequenced steps, each scoped to a single thematic cluster of questions. A persistent step indicator at the top of every form screen provides explicit wayfinding , users always know their position in the task flow, how many steps remain, and can navigate backward without data loss. This directly addresses the primary abandonment driver identified in research.
            </p>
            <div className="relative aspect-[16/6] w-full overflow-hidden rounded-xl border border-border/50 bg-black">
              <Image
                src="/hack4impact/progressindicatorscreenrec.gif"
                alt="4-step progress indicator , interaction demo"
                fill
                className="object-cover opacity-90"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-2"
        headline="Driving measurable impact through scalable design."
        points={[
          "Created a reusable component library, speeding up engineering implementation.",
          "Shifted from subjective design to metrics-backed decisions (80% faster flow).",
          "Balanced immediate feature delivery with long-term design system foundation."
        ]}
        prevHref="#recruiter-lens-1"
      />

      {/* ══════════════════════════════════════════════
          05: OUTCOMES
      ══════════════════════════════════════════════ */}
      <section id="h4i-outcome" className="relative z-10 border-t border-border/40 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="05 / OUTCOME" title="Shipped. Live. Measurable." />

          <Fade><div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <StatItem value="80%" label="Reduction in navigation time" />
            <StatItem value="750+" label="Annual applicants served" />
            <StatItem value="4" label="Steps from 33 pages" />
          </div></Fade>

          {/* Testimonial */}
          <Fade><div className="mt-20 rounded-2xl border border-border bg-white p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="shrink-0 font-manrope text-4xl text-primary/30 leading-none">❝</div>
              <div>
                <p className="font-manrope text-xl font-normal leading-relaxed text-text md:text-2xl">
                  The redesigned portal is night and day compared to what we had. Our applicants are actually completing the form now instead of dropping off. The component library made our engineering iteration dramatically faster.
                </p>
                <div className="mt-6 border-t border-border/40 pt-5">
                  <div className="font-manrope text-sm font-medium text-text">Jordan Mehta</div>
                  <div className="font-mono text-xs text-text-muted">Engineering Manager · Microsoft Reston</div>
                </div>
              </div>
            </div>
          </div></Fade>

          {/* Reflections */}
          <Fade><div className="mt-16">
            <h3 className="mb-8 font-manrope text-xl font-medium text-text">What this project reinforced.</h3>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "IA before UI",
                  body: "Restructuring the user flow before opening Figma saved two full sprint cycles. Premature visual design on a broken architecture would have been expensive to undo.",
                },
                {
                  title: "Embedded dev review accelerates quality",
                  body: "Having a Microsoft engineer in every Monday sprint call meant implementation constraints surfaced in the design phase , not during handoff. Edge cases were caught before they became bugs.",
                },
                {
                  title: "Design systems are leverage",
                  body: "When the dev reviewer requested changes across eight screens in Sprint 3, we updated one component and it propagated everywhere. The component library paid for the time it took to build it within two weeks.",
                },
              ].map((r) => (
                <InsightCard key={r.title} label="Reflection">
                  <p className="mt-1 font-manrope text-sm font-medium text-text">{r.title}</p>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">{r.body}</p>
                </InsightCard>
              ))}
            </div>
          </div></Fade>

          {/* Team photo */}
          <MediaPop><div className="mt-20">
            <p className="mb-5 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted">The Team</p>
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-border grayscale transition-all duration-700 hover:grayscale-0">
              <Image
                src="/hack4impact/team picture.png"
                alt="HackImpact UMD , cross-functional team"
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-center font-mono text-xs text-text-muted">
              Cross-functional team: Project Managers · Tech Leads · Engineers · UI/UX Designers · Microsoft Reston Dev Reviewer
            </p>
          </div></MediaPop>

          {/* Next steps */}
          <div className="mt-16">
            <h3 className="mb-6 font-manrope text-xl font-medium text-text">What comes next.</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { n: "01", label: "Reviewer-side interface", body: "Design and prototype the recruiter dashboard , the second half of the dual-user system." },
                { n: "02", label: "Accessibility audit", body: "WCAG 2.2 conformance testing, screen reader validation, and keyboard navigation coverage." },
                { n: "03", label: "Developer handoff documentation", body: "Full spec sheets, interaction annotations, and component usage guidelines for engineering." },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 rounded-xl border border-border/50 bg-white p-5">
                  <span className="font-mono text-sm font-medium text-primary/50">{s.n}</span>
                  <div>
                    <p className="font-manrope text-sm font-medium text-text">{s.label}</p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-text-muted">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
