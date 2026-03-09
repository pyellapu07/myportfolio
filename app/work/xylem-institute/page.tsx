"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
   PROJECT CHAT STRINGS
───────────────────────────────────────────────────────────── */
const PROJECT_PLACEHOLDERS = [
  "Ask about the Auto-Pilot pipeline...",
  "Ask about the navigation design...",
  "Ask about the Nairobi workshop...",
  "Ask about the design systems built...",
];

const PROJECT_PILLS = [
  "How does the Auto-Pilot pipeline work?",
  "Why did the navigation minimize on scroll?",
  "What was built for the Nairobi workshop?",
];

const RECRUITER_PILLS = [
  "How did he design for non-technical audiences?",
  "What was the impact of the navigation pattern?",
  "How did he build an AI pipeline end-to-end?",
  "What did he deliver in Nairobi?",
];

const XYLEM_CONTEXT = `You are an AI assistant for Pradeep Yellapu's portfolio case study: NASA Harvest — Xylem Institute.

Pradeep joined the Xylem Lab at UMD (NASA Harvest-affiliated, led by Professor Catherine Nakalembe) in November 2025. The lab translates satellite-derived crop data into policy-ready intelligence for food security agencies across East and Southern Africa.

Key deliverables:
1. WEBSITES: Designed and launched xyleminstitute.org and the Xylem Lab website. Both built from zero.
2. NAVIGATION INNOVATION: Designed a fixed navigation for xyleminstitute.org that opens by default (showing all 10 sections), minimizes to scroll indicator dots on first scroll, and re-expands on hover. This reduced bounce rate 32% because researchers instantly see the full depth of content.
3. DESIGN SYSTEMS: Built two complete design systems — one for Xylem Lab (research-focused, academic) and one for The Xylem Institute (public-facing, policy-audience). Defined typography, color, component libraries, and brand guidelines.
4. RFBS WORKSHOP (NAIROBI): Designed and ran a 3-day AGRA COMESA Regional Food Balance Sheet training workshop in Nairobi, Kenya for 20+ analysts from 9 East & Southern African countries. Deliverables: kenya2026 training website, Wednesday session HTML notes, 43-slide AGRA workshop deck.
5. XYLEM AUTO-PILOT: Built an end-to-end AI pipeline: YieldWatch CSVs → Google Earth Engine maps → RAG embedding retrieval (FAISS) → GPT-4.1 mini narrative generation → 4-tab HTML bulletin with charts + decision thresholds + ZIP download. One button. Covers 6 countries × 3 crops.
6. LONDON CONFERENCE SLIDES: Designed the London conference PPT deck for Auto-Pilot presentation.

Tools: Figma, Python, HTML/CSS/JS, Google Earth Engine, OpenAI API, Google Colab, QGIS
Impact: 32% bounce rate reduction, bulletins in minutes vs days, 138+ engagement on professor's LinkedIn post about Nairobi trip.`;

/* ─────────────────────────────────────────────────────────────
   PROJECT SMART BAR
───────────────────────────────────────────────────────────── */
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
    if (isRecruiterMode) { setIsExpanded(true); setIsMaximized(false); }
  }, [isRecruiterMode]);

  useEffect(() => {
    if (isExpanded) return;
    const phrase = PROJECT_PLACEHOLDERS[phraseIdx];
    const speed = isDeleting ? 30 : 55;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholder(phrase.slice(0, charIdx + 1));
        if (charIdx + 1 === phrase.length) setTimeout(() => setIsDeleting(true), 1600);
        else setCharIdx((c) => c + 1);
      } else {
        setPlaceholder(phrase.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setIsDeleting(false);
          setPhraseIdx((i) => (i + 1) % PROJECT_PLACEHOLDERS.length);
          setCharIdx(0);
        } else setCharIdx((c) => c - 1);
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [isExpanded, phraseIdx, charIdx, isDeleting]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setIsExpanded(true); setLoading(true);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[Context: ${XYLEM_CONTEXT}] ${text}`,
          mode: isRecruiterMode ? "recruiter" : "general",
          conversationHistory: [],
        }),
      });
      const data = await res.json();
      const raw = data.content || "I can help answer that based on Pradeep's project details.";
      setMessages((m) => [...m, { role: "ai", text: raw.replace(/,/g, ",") }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "I'm having trouble connecting right now. Try again?" }]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  function handleReset(e: React.MouseEvent) { e.stopPropagation(); setMessages([]); setInput(""); }

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30" onClick={() => setIsExpanded(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn("fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300",
          isExpanded ? (isMaximized ? "w-[calc(100%-3rem)] max-w-[1000px]" : "w-[calc(100%-3rem)] max-w-[800px]") : "w-[calc(100%-3rem)] max-w-[640px]"
        )} data-no-cursor>
        {isExpanded && <div className={cn("chat-glow transition-all duration-300", isMaximized ? "opacity-30" : "opacity-60")} style={{ borderRadius: isMaximized ? "48px" : "36px" }} />}

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, y: 10, scaleY: 0.96 }} animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: 10, scaleY: 0.96 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-1.5 overflow-hidden rounded-xl border border-border/40 bg-white shadow-smooth-lg" style={{ transformOrigin: "bottom" }}>
              <div className={cn("flex flex-col transition-all duration-300", isMaximized ? "h-[75vh] max-h-[800px]" : "h-[340px]")}>
                <div className="flex items-center justify-between border-b border-border/40 bg-bg-alt/50 px-5 py-3 shrink-0">
                  <span className="font-manrope text-sm font-medium text-text">Ask about this project</span>
                  <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                      <button onClick={handleReset} title="Reset chat" className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text">
                        <RefreshCw size={12} />
                      </button>
                    )}
                    <button onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Minimize" : "Maximize"}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text">
                      {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button onClick={() => setIsExpanded(false)} title="Close"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text">
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>

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
                            Role fit: UX Designer / Product Designer · Level: Junior–Mid · Proof: 32% bounce rate reduction, AI pipeline shipped end-to-end.<br />
                            <span className="font-medium text-text">Why it matters:</span> Worked across research, visual design, and technical systems — not siloed to one layer.
                          </p>
                        </div>
                      </div>
                      <div className={messages.length === 0 ? "mt-auto" : "mt-2"}>
                        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-text-muted">Suggested Interview Questions</p>
                        <div className={cn("grid gap-2", isMaximized ? "grid-cols-2" : "grid-cols-1")}>
                          {RECRUITER_PILLS.map((pill) => (
                            <div key={pill} className="group flex items-center justify-between rounded-xl border border-border/40 bg-bg-alt/50 px-4 py-3 transition-colors hover:border-primary/30">
                              <span className={cn("font-mono text-text-secondary group-hover:text-text", isMaximized ? "text-xs pr-2" : "text-sm")}>{pill}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(pill); setCopiedId(pill); setTimeout(() => setCopiedId(null), 2000); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-text-muted shadow-sm ring-1 ring-border/50 transition-colors hover:text-primary" title="Copy question">
                                  {copiedId === pill ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                                <button onClick={() => { send(pill); if (!isMaximized) setTimeout(() => setIsMaximized(true), 150); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-text-muted shadow-sm ring-1 ring-border/50 transition-colors hover:text-primary" title="Ask AI">
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
                      <p className="max-w-[200px] font-mono text-xs text-text-muted">Ask about the process, decisions, or outcomes.</p>
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((m, i) => (
                        <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 font-mono text-xs leading-relaxed",
                            m.role === "user" ? "bg-primary text-white" : "border border-border/60 bg-bg-alt text-text")}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                      {loading && <div className="flex justify-start"><div className="rounded-2xl bg-bg-alt px-4 py-3"><Loader2 size={13} className="animate-spin text-text-muted" /></div></div>}
                      <div ref={bottomRef} />
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-border/40 bg-white p-3">
                  <div className="flex gap-2">
                    <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                      className="flex-1 resize-none bg-transparent px-3 py-2 font-mono text-xs outline-none placeholder:text-text-muted"
                      placeholder="Type your question..." rows={1} />
                    <button onClick={() => send(input)} disabled={!input.trim() || loading}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative rounded-2xl border border-white/50 bg-white/20 p-1.5 shadow-smooth-lg backdrop-blur-2xl mt-1.5">
          <button onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center gap-3 rounded-xl bg-white/60 px-5 py-3.5 text-left backdrop-blur-sm transition-colors hover:bg-white/80">
            <MessageCircle size={18} className="shrink-0 text-primary" aria-hidden />
            <span className="flex-1 font-mono text-xs text-text-muted">{placeholder || PROJECT_PLACEHOLDERS[0]}</span>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary">Project AI</span>
            <MessageCircle size={14} className="shrink-0 text-text-muted" aria-hidden />
          </button>
          {!isRecruiterMode && (
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              {PROJECT_PILLS.map((pill) => (
                <button key={pill} onClick={() => send(pill)}
                  className="rounded-full border border-border/40 bg-white/80 px-3 py-1 font-mono text-[10px] text-text-muted backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-white hover:text-primary">
                  {pill}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   RECRUITER HIGHLIGHT
───────────────────────────────────────────────────────────── */
function RecruiterHighlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { isRecruiterMode } = useRecruiter();
  if (!isRecruiterMode) return <>{children}</>;
  return <span className={cn("text-primary", className)}>{children}</span>;
}

function WhyThisMatters({ id, headline, points, nextHref, prevHref }: {
  id?: string; headline: string; points: string[]; nextHref?: string; prevHref?: string;
}) {
  const { isRecruiterMode } = useRecruiter();
  if (!isRecruiterMode) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-auto my-0 max-w-[1000px] px-6 md:px-12" id={id}>
      <div className="relative mb-8 mt-12 overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.06) 30%, rgba(168,85,247,0.04) 60%, rgba(79,70,229,0.03) 100%)", boxShadow: "0 4px 32px rgba(99,102,241,0.06)" }}>
        <div className="mb-4 flex items-center gap-2.5">
          <SparkIcon size={18} />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold">Why This Matters — Recruiter Lens</p>
        </div>
        <p className="font-manrope text-base font-semibold text-text mb-4">{headline}</p>
        <ul className="space-y-2">
          {points.map((p, i) => (
            <li key={i} className="flex items-start gap-2.5 font-mono text-sm text-text-secondary">
              <span className="mt-1 text-primary/50 shrink-0">→</span>{p}
            </li>
          ))}
        </ul>
        {(nextHref || prevHref) && (
          <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
            {prevHref ? <a href={prevHref} className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/60 transition-colors hover:text-primary">↑ Previous Lens</a> : <span />}
            {nextHref ? <a href={nextHref} className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/60 transition-colors hover:text-primary">Next Lens ↓</a> : <span />}
          </div>
        )}
      </div>
    </motion.div>
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

function InsightCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-40px" }} transition={{ duration: 0.4 }}
      className="rounded-xl border border-border/50 bg-white p-6 cursor-default" whileHover={{ scale: 1.025, y: -6 }}>
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

/* Placeholder for images not yet available */
function ImagePlaceholder({ label, aspect = "16/9" }: { label: string; aspect?: string }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-dashed border-border bg-bg-alt`} style={{ aspectRatio: aspect }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
        <div className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="font-mono text-[11px] text-text-muted text-center">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VERTICAL SECTION NAV
───────────────────────────────────────────────────────────── */
const SECTION_NAV = [
  { id: "xi-context",       label: "Context" },
  { id: "xi-websites",      label: "Websites" },
  { id: "xi-navigation",    label: "Navigation" },
  { id: "xi-design-system", label: "Design System" },
  { id: "xi-workshop",      label: "Workshop" },
  { id: "xi-autopilot",     label: "Auto-Pilot" },
  { id: "xi-outcomes",      label: "Outcomes" },
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
        if (entry.isIntersecting && !isScrollingRef.current) setActiveIdx(i);
      }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });
      obs.observe(el); observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  return (
    <div className="fixed top-1/2 z-50 hidden -translate-y-1/2 xl:flex flex-col gap-3" style={{ right: "40px", userSelect: "none" }}>
      {sections.map((section, i) => {
        const isActive = i === activeIdx;
        return (
          <button key={i} onClick={() => {
            setActiveIdx(i);
            const el = document.getElementById(section.id);
            if (el) { isScrollingRef.current = true; el.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => { isScrollingRef.current = false; }, 1000); }
          }} className="group relative flex items-center justify-end" aria-label={`Scroll to ${section.label}`}>
            <span className={cn("absolute right-6 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-text",
              isActive ? "opacity-100 translate-x-0 text-primary font-medium" : "translate-x-2 text-text-muted")}>
              {section.label}
            </span>
            <span className={cn("block w-1.5 rounded-full transition-all duration-300",
              isActive ? "h-6 bg-primary shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "h-1.5 bg-border/50 group-hover:bg-border group-hover:h-3")} />
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AUTO-PILOT PIPELINE DIAGRAM (inline rendered)
───────────────────────────────────────────────────────────── */
function AutoPilotDiagram() {
  const inputs = [
    { label: "YieldWatch CSVs", sub: "Per-region · Per-crop · Per-season", color: "bg-[#D9EAD3] text-[#274E13]" },
    { label: "Crop Calendars",  sub: "Season-aware · 11 countries",        color: "bg-[#D9EAD3] text-[#274E13]" },
    { label: "Historical Bulletins", sub: "AGRA archive · PDF corpus",     color: "bg-[#D9EAD3] text-[#274E13]" },
    { label: "Country Config",  sub: "GEE project · Season map",           color: "bg-[#CFE2F3] text-[#01579B]" },
  ];

  const engine = [
    { label: "CSV Parser & Validator",  sub: "Normalise · classify region / crop / season", color: "bg-[#D9D2E9] text-[#4A148C]" },
    { label: "RAG Embedding Store",     sub: "FAISS · 1536-dim · semantic retrieval <10ms",  color: "bg-[#B4A7D6] text-[#4A148C]" },
    { label: "GPT-4.1 mini Engine",     sub: "Structured prompts · narrative per section",   color: "bg-[#DD7E6B] text-white" },
    { label: "Chart & Map Generator",   sub: "GEE maps · matplotlib · condition overlays",   color: "bg-[#F9CB9C] text-[#7B3F00]" },
    { label: "Crop Calendar Engine",    sub: "Season gate · Tanzania Msimu / Vuli logic",     color: "bg-[#E6B8A2] text-[#7B3F00]" },
  ];

  const outputs = [
    { label: "Bulletin HTML",          sub: "4-tab interactive report",       color: "bg-[#EAD1DC] text-[#880E4F]" },
    { label: "Decision Thresholds",    sub: "Anomaly quartile rankings",       color: "bg-[#EAD1DC] text-[#880E4F]" },
    { label: "Production Charts",      sub: "Min / mean / max trends",         color: "bg-[#EAD1DC] text-[#880E4F]" },
    { label: "Crop Condition Maps",    sub: "300 DPI · GAUL L1 boundaries",   color: "bg-[#EAD1DC] text-[#880E4F]" },
    { label: "ZIP Download Package",   sub: "HTML + maps + charts",            color: "bg-[#EAD1DC] text-[#880E4F]" },
  ];

  return (
    <div className="rounded-xl border border-border/50 bg-bg-alt p-6 md:p-8 overflow-x-auto">
      <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Xylem Auto-Pilot — End-to-End Pipeline</p>
      <div className="flex items-start gap-4 min-w-[700px]">
        {/* Inputs */}
        <div className="flex-1 flex flex-col gap-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2">Inputs</p>
          {inputs.map((item, i) => (
            <div key={i} className={`rounded-lg px-3 py-2.5 ${item.color}`}>
              <p className="font-mono text-[11px] font-semibold leading-tight">{item.label}</p>
              <p className="font-mono text-[9px] opacity-70 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Arrow 1 */}
        <div className="flex flex-col items-center justify-start pt-10 gap-1 shrink-0">
          <div className="h-[1px] w-8 bg-[#F9A825]" />
          <span className="font-mono text-base text-[#F9A825] font-bold">→</span>
        </div>

        {/* Engine */}
        <div className="flex-[1.3] flex flex-col gap-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2">Auto-Pilot Engine</p>
          {engine.map((item, i) => (
            <div key={i} className={`rounded-lg px-3 py-2.5 ${item.color}`}>
              <p className="font-mono text-[11px] font-semibold leading-tight">{item.label}</p>
              <p className="font-mono text-[9px] opacity-70 mt-0.5">{item.sub}</p>
            </div>
          ))}
          {/* Walk-forward validation */}
          <div className="mt-1 rounded-lg px-3 py-2.5 bg-[#E69138] text-white text-center">
            <p className="font-mono text-[11px] font-bold">Walk-Forward Validation</p>
            <p className="font-mono text-[9px] opacity-80">Region / Season / Year</p>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="flex flex-col items-center justify-start pt-10 gap-1 shrink-0">
          <div className="h-[1px] w-8 bg-[#F9A825]" />
          <span className="font-mono text-base text-[#F9A825] font-bold">→</span>
        </div>

        {/* Outputs */}
        <div className="flex-1 flex flex-col gap-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2">Outputs</p>
          {outputs.map((item, i) => (
            <div key={i} className={`rounded-lg px-3 py-2.5 ${item.color}`}>
              <p className="font-mono text-[11px] font-semibold leading-tight">{item.label}</p>
              <p className="font-mono text-[9px] opacity-70 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-xs text-text-muted border-t border-border/40 pt-4">
        <strong className="font-medium text-text">One notebook, one button.</strong> — From raw CSVs to a publication-ready bulletin covering 6 countries × 3 crops in minutes. No manual data prep, no copy-paste between tools.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAVIGATION BEHAVIOR DIAGRAM
───────────────────────────────────────────────────────────── */
function NavigationDiagram() {
  const sections = ["Home", "Why We Exist", "What We Do", "Strategic Framework", "Impact", "Our Leadership", "Our Global Partnership Network", "Strategic Advantage", "Get Involved", "Partnership & Investment Pathways"];
  return (
    <div className="rounded-xl border border-border/50 bg-bg-alt p-6 md:p-8">
      <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Navigation State Machine</p>
      <div className="grid gap-4 md:grid-cols-3">

        {/* State 1: Default open */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
            <p className="font-mono text-[11px] font-semibold text-text uppercase tracking-wider">State 1: Default Open</p>
          </div>
          <p className="font-mono text-[10px] text-text-muted">Page loads. Nav opens by default at top-right, showing all 10 section labels with radio dot indicators.</p>
          <div className="rounded-lg border border-border bg-white p-3 space-y-1.5">
            {sections.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0", i === 0 ? "bg-red-400" : "bg-gray-300")} />
                <span className="font-mono text-[10px] text-text-secondary truncate">{s}</span>
              </div>
            ))}
            <p className="font-mono text-[9px] text-text-muted pt-1">+ 5 more sections...</p>
          </div>
        </div>

        {/* State 2: Minimized on scroll */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            <p className="font-mono text-[11px] font-semibold text-text uppercase tracking-wider">State 2: Scroll → Minimize</p>
          </div>
          <p className="font-mono text-[10px] text-text-muted">First scroll triggers collapse. Nav shrinks to a vertical strip of 10 colored dots only — no text labels. Active section dot fills red.</p>
          <div className="rounded-lg border border-border bg-white p-3 flex justify-center">
            <div className="flex flex-col gap-2 items-center py-2">
              {sections.map((_, i) => (
                <span key={i} className={cn("rounded-full transition-all", i === 2 ? "h-3 w-3 bg-red-400" : "h-2 w-2 bg-gray-300")} />
              ))}
            </div>
          </div>
        </div>

        {/* State 3: Hover to expand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            <p className="font-mono text-[11px] font-semibold text-text uppercase tracking-wider">State 3: Hover → Expand</p>
          </div>
          <p className="font-mono text-[10px] text-text-muted">User hovers on the minimized strip. Full labels re-appear. Click to jump to any section. Mouse-out collapses back.</p>
          <div className="rounded-lg border border-border bg-white p-3 space-y-1.5">
            {sections.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0", i === 2 ? "bg-red-400" : "bg-gray-300")} />
                <span className={cn("font-mono text-[10px] truncate", i === 2 ? "text-text font-semibold" : "text-text-secondary")}>{s}</span>
              </div>
            ))}
            <p className="font-mono text-[9px] text-text-muted pt-1">+ 6 more...</p>
          </div>
        </div>

      </div>
      <p className="mt-6 font-mono text-xs text-text-muted border-t border-border/40 pt-4">
        <strong className="font-medium text-text">Why this pattern?</strong> — The Xylem Institute serves researchers and collaborators who visit once and need to quickly assess whether the lab's work is relevant to them. A collapsed navbar hides content depth. An open nav that minimizes respects user attention without sacrificing discoverability.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DESIGN SYSTEM TOKENS DIAGRAM
───────────────────────────────────────────────────────────── */
function DesignSystemTokens({ org }: { org: "institute" | "lab" }) {
  const institute = {
    name: "The Xylem Institute",
    sub: "Public-facing · Policy audience · Research institute",
    palette: [
      { hex: "#1B5E20", label: "Primary Green",  desc: "Headings, CTAs, key actions" },
      { hex: "#274E13", label: "Dark Green",      desc: "Subheadings, depth elements" },
      { hex: "#616161", label: "Body Grey",       desc: "Body text, secondary labels" },
      { hex: "#F9A825", label: "Amber Accent",    desc: "Dividers, highlights, status" },
      { hex: "#F1F8E9", label: "Light Fill",      desc: "Country / section badges" },
      { hex: "#FFFFFF", label: "White",            desc: "Card backgrounds, overlays" },
    ],
    type: [
      { name: "Inter SemiBold",  size: "30pt", use: "Section titles, hero headings" },
      { name: "Inter Medium",    size: "12pt", use: "Subtitles, navigation labels" },
      { name: "Calibri",         size: "12pt", use: "Body text, supporting copy" },
    ],
  };
  const lab = {
    name: "The Xylem Lab",
    sub: "Academic research lab · Scientific audience · University context",
    palette: [
      { hex: "#0D3B1A", label: "Lab Deep Green",  desc: "Hero background, hero text" },
      { hex: "#2E7D32", label: "Lab Mid Green",   desc: "Accent links, buttons" },
      { hex: "#FFFFFF", label: "White",            desc: "Primary text on dark bg" },
      { hex: "#F9A825", label: "Amber",           desc: "Data callouts, badges" },
      { hex: "#E8F5E9", label: "Light Mint",       desc: "Light section backgrounds" },
      { hex: "#9CA3AF", label: "Grey-400",        desc: "Muted labels, captions" },
    ],
    type: [
      { name: "Inter Bold",      size: "36pt", use: "Hero display heading" },
      { name: "Inter Regular",   size: "14pt", use: "Navigation, body paragraphs" },
      { name: "DM Mono",         size: "11pt", use: "Data labels, metrics, tags" },
    ],
  };
  const data = org === "institute" ? institute : lab;

  return (
    <div className="rounded-xl border border-border/50 bg-white p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">{data.name}</p>
      <p className="font-mono text-xs text-text-secondary mb-5">{data.sub}</p>
      {/* Color swatches */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {data.palette.map((c, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-12 rounded-lg border border-border/40 shadow-sm" style={{ backgroundColor: c.hex }} />
            <p className="font-mono text-[9px] font-semibold text-text">{c.label}</p>
            <p className="font-mono text-[9px] text-text-muted">{c.hex}</p>
            <p className="font-mono text-[9px] text-text-muted leading-snug">{c.desc}</p>
          </div>
        ))}
      </div>
      {/* Typography */}
      <div className="border-t border-border/40 pt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-text-muted mb-3">Typography Scale</p>
        <div className="space-y-2">
          {data.type.map((t, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="font-mono text-[10px] font-semibold text-text w-32 shrink-0">{t.name}</span>
              <span className="font-mono text-[9px] text-text-muted w-12 shrink-0">{t.size}</span>
              <span className="font-mono text-[9px] text-text-secondary">{t.use}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function XylemInstitutePage() {

  const GridBackground = () => (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px)`, backgroundSize: "160px 100%" }} />
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
            <Link href="/#work" className="group flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-text">
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
              Back to Work
            </Link>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="font-mono text-xs text-primary">UX · Design Systems · Product</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="mb-6 font-manrope text-5xl font-medium leading-[1.05] tracking-tight text-text md:text-7xl lg:text-[5rem]">
                Building the Design Layer <br />
                <span className="text-primary">for Satellite Intelligence.</span>
              </h1>
              <p className="max-w-xl font-mono text-base leading-relaxed text-text-secondary md:text-lg">
                From <RecruiterHighlight>day one with no brand</RecruiterHighlight>, we built two live websites, two design systems, a 3-day workshop in Nairobi, and an <RecruiterHighlight>AI pipeline that converts satellite data into policy bulletins</RecruiterHighlight> — all while the science was still being done.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:mb-4 lg:pl-12">
              <DetailRow label="Role" value="Product Research & Designer" />
              <DetailRow label="Organization" value="NASA Harvest · Xylem Lab, UMD" />
              <DetailRow label="Timeline" value="Nov 2025 — Present" />
              <DetailRow label="Status" value={
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active · Multiple Live Deployments
                </span>
              } />
            </div>
          </div>

          {/* Meta strip */}
          <div className="mt-10 grid gap-8 border-t border-border/40 py-8 md:grid-cols-3">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Responsibilities</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Website design & development · Design systems · Workshop design · Training materials · AI pipeline UX · Brand identity · Conference presentations
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Collaborators</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Prof. Catherine Nakalembe (PI) · Xylem Lab research team · AGRA analysts · COMESA RFBS country teams (9 nations)
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Tools</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1">
                {["Figma", "Python", "HTML/CSS", "Google Earth Engine", "OpenAI API", "QGIS", "Google Colab"].map((t) => (
                  <span key={t} className="font-mono text-sm text-text-secondary">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Hero image — Nairobi conference */}
          <MediaPop>
            <div className="mt-8">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/50 bg-[#1B5E20]">
                <Image
                  src="/xylem/Nairobi%20conference%20day%201.JPG"
                  alt="AGRA RFBS Workshop — Nairobi, Kenya"
                  fill className="object-cover object-top opacity-90"
                  priority unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 mb-1">Nairobi, Kenya · Dec 2025</p>
                  <p className="font-manrope text-lg font-semibold text-white">AGRA COMESA RFBS Training Workshop — Day 1</p>
                  <p className="font-mono text-xs text-white/70 mt-0.5">Analysts from 9 East & Southern African countries · 3 days · 20+ participants</p>
                </div>
              </div>
            </div>
          </MediaPop>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-1"
        headline="This isn't a single design project. It's end-to-end ownership across research, visual design, technical implementation, and stakeholder communication — sustained over months."
        points={[
          "Shipped two production websites and two design systems from zero, with no template or existing foundation.",
          "Designed and ran a 3-day international training workshop in Nairobi for government food security analysts from 9 countries.",
          "Built an AI bulletin pipeline that works in a live scientific environment — not a prototype, a real tool used by the lab.",
        ]}
        nextHref="#recruiter-lens-2"
      />

      {/* ══════════════════════════════════════════════
          00 / CONTEXT
      ══════════════════════════════════════════════ */}
      <section id="xi-context" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="00 / CONTEXT" title="No design infrastructure existed when we started." />

          <Fade>
            <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
              <div className="space-y-5">
                <p className="font-mono text-base leading-relaxed text-text-secondary">
                  The Xylem Lab at the University of Maryland is affiliated with <strong className="font-medium text-text">NASA Harvest</strong> and led by Professor Catherine Nakalembe. The lab's mission: translate satellite-derived crop intelligence into actionable policy outputs for food security agencies across East and Southern Africa.
                </p>
                <p className="font-mono text-base leading-relaxed text-text-secondary">
                  The science was rigorous. The communication layer wasn't. When Pradeep joined in November 2025, the lab had <strong className="font-medium text-text">no public-facing website, no design system, no brand standards, and no automated way to deliver outputs to non-technical stakeholders</strong>. Analysts were manually assembling bulletin reports that took days. There was no training infrastructure for the RFBS workshop coming in weeks.
                </p>
                <p className="font-mono text-base leading-relaxed text-text-secondary">
                  The gap between what the satellite data could show and what policymakers could actually receive and read was significant. Closing that gap became the entire scope of work.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-8">
                <StatItem value="0" label="Existing websites on joining" />
                <StatItem value="6" label="Countries covered by the pipeline" />
                <StatItem value="9" label="Nations at the Nairobi workshop" />
                <StatItem value="3" label="Crops monitored (Maize, Rice, Beans)" />
              </div>
            </div>
          </Fade>

          <Fade delay={0.1}>
            <div className="mt-16 grid gap-4 md:grid-cols-3">
              <InsightCard label="The problem — Discoverability">
                <p className="font-manrope text-base font-semibold text-text mb-2">Scientists couldn't show their work publicly.</p>
                <p className="font-mono text-sm text-text-secondary leading-relaxed">No website = no entry point for collaborators, funders, or government partners who needed to evaluate the lab's credibility and scope.</p>
              </InsightCard>
              <InsightCard label="The problem — Delivery">
                <p className="font-manrope text-base font-semibold text-text mb-2">Bulletins took days to write manually.</p>
                <p className="font-mono text-sm text-text-secondary leading-relaxed">Each bulletin required aggregating CSVs, writing narratives by hand, generating charts, and assembling them into a report. 6 countries × 3 crops = a bottleneck.</p>
              </InsightCard>
              <InsightCard label="The problem — Training">
                <p className="font-manrope text-base font-semibold text-text mb-2">Analysts had no reference materials.</p>
                <p className="font-mono text-sm text-text-secondary leading-relaxed">The RFBS workshop in Nairobi needed structured training websites, decks, and session materials — built from zero in weeks.</p>
              </InsightCard>
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          01 / WEBSITES
      ══════════════════════════════════════════════ */}
      <section id="xi-websites" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="01 / WEBSITES" title="We launched two separate live websites from zero." />

          <Fade>
            <div className="space-y-5 max-w-2xl mb-16">
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                The lab operates under two distinct public identities: <strong className="font-medium text-text">The Xylem Lab</strong> (the academic research unit, internal and peer-facing) and <strong className="font-medium text-text">The Xylem Institute</strong> (the public-facing research institute that speaks to policy audiences, collaborators, and funders). Each needed a separate website with a distinct tone, audience, and information architecture — but a shared visual DNA.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                The Xylem Lab website communicates scientific credibility, research depth, and lab membership to an academic audience. The Xylem Institute website (xyleminstitute.org) communicates strategic vision, impact, and partnership opportunity to a non-technical, policy-level audience. Same organization. Different front doors.
              </p>
            </div>
          </Fade>

          {/* Xylem Institute site */}
          <Fade>
            <div className="mb-16">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-[#E8F5E9] px-3 py-1 font-mono text-[10px] font-semibold text-[#1B5E20] uppercase tracking-wider">xyleminstitute.org</span>
                <span className="font-mono text-xs text-text-muted">Public-facing · Policy audience</span>
              </div>
              <div className="grid gap-8 md:grid-cols-2 items-start">
                <div className="space-y-4">
                  <h3 className="font-manrope text-xl font-semibold text-text">The Xylem Institute</h3>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    Designed for researchers, government collaborators, and potential funders who visit once, scan fast, and leave if they don't immediately see value. The site needed to communicate the institute's full scope — from why it exists, to what it does, to who leads it, to how to partner — without requiring users to scroll through everything to understand it.
                  </p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    10 distinct content sections. Dark, authoritative visual language. A navigation system that solves the scannability problem directly (see Section 02).
                  </p>
                </div>
                <MediaPop>
                  <div className="relative w-full overflow-hidden rounded-xl border border-border/50 shadow-smooth">
                    <Image src="/xylem/The-Xylem-Institute%20hero%20section.png" alt="The Xylem Institute — Hero Section" width={800} height={500} className="w-full h-auto object-cover" unoptimized />
                  </div>
                </MediaPop>
              </div>
            </div>
          </Fade>

          {/* Xylem Lab site */}
          <Fade delay={0.1}>
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-[#E8F5E9] px-3 py-1 font-mono text-[10px] font-semibold text-[#1B5E20] uppercase tracking-wider">Xylem Lab</span>
                <span className="font-mono text-xs text-text-muted">Research lab · Academic & scientific audience</span>
              </div>
              <div className="grid gap-8 md:grid-cols-2 items-start">
                <MediaPop delay={0.1}>
                  <div className="relative w-full overflow-hidden rounded-xl border border-border/50 shadow-smooth">
                    <Image src="/xylem/XylemLab%20hero%20section.png" alt="Xylem Lab — Hero Section" width={800} height={500} className="w-full h-auto object-cover" unoptimized />
                  </div>
                </MediaPop>
                <div className="space-y-4">
                  <h3 className="font-manrope text-xl font-semibold text-text">The Xylem Lab</h3>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    The academic face of the same team. Designed with a more utilitarian structure — research outputs, team bios, publications, and lab news take center stage. The tone is confident and scientific. The hierarchy prioritizes depth of content over broad positioning.
                  </p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    Built with the same visual tokens as the Institute site but applied differently: looser layout, less dramatic hero section, more information-dense sections.
                  </p>
                </div>
              </div>
            </div>
          </Fade>

          {/* Workshop training websites */}
          <Fade delay={0.15}>
            <div className="mt-16 rounded-xl border border-border/50 bg-bg-alt p-6 md:p-8">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Also shipped — Training & Workshop Websites</p>
              <h3 className="font-manrope text-xl font-semibold text-text mb-4">Kenya 2026 · Wednesday Session · Workshop Materials</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    For the Nairobi workshop (and the upcoming Kenya 2026 training cycle), we built HTML-based training websites that serve as live reference material during sessions. No PDFs. No slides only. Analysts open the training URL during the workshop and follow along in real-time.
                  </p>
                  <ul className="space-y-2">
                    {[
                      { name: "kenya2026.html", desc: "Full training site for Kenya 2026 analyst cohort" },
                      { name: "Wednesday Session Notes", desc: "Speaker notes + live reference for Day 2 afternoon session" },
                    ].map((item) => (
                      <li key={item.name} className="flex items-start gap-3 font-mono text-sm">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                        <span><strong className="font-medium text-text">{item.name}</strong> — <span className="text-text-secondary">{item.desc}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  {/* Placeholder: rename file to kenya2026-website.png and save screenshot here */}
                  <ImagePlaceholder label="Place screenshot here → /xylem/kenya2026-website.png" aspect="16/10" />
                  <p className="mt-2 font-mono text-[10px] text-text-muted">📌 Screenshot of kenya2026.html training site</p>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-2"
        headline="Shipping two production websites — with different audiences, IA, and tone — from zero shows both strategic thinking and execution ability."
        points={[
          "Correctly identified that two sites needed to exist (not one) based on audience differences — a genuine IA decision.",
          "Built and launched both with working navigation, responsive layouts, and brand-consistent visual design.",
          "Also shipped functional HTML training sites used live during an international workshop.",
        ]}
        prevHref="#recruiter-lens-1"
        nextHref="#recruiter-lens-3"
      />

      {/* ══════════════════════════════════════════════
          02 / NAVIGATION
      ══════════════════════════════════════════════ */}
      <section id="xi-navigation" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="02 / NAVIGATION DESIGN" title="We designed a nav that tells you the site before you scroll." />

          <Fade>
            <div className="grid gap-12 md:grid-cols-2 lg:gap-20 mb-16">
              <div className="space-y-5">
                <div className="rounded-lg border-l-2 border-red-400/60 bg-red-50/50 pl-4 py-3 pr-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-red-500 mb-1">The Problem</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    The Xylem Institute's audience — researchers, collaborators, government advisors — is time-constrained. They land on the site with a specific question: <em>"Does this lab do work I care about?"</em> A standard collapsed navbar doesn't answer that. They have to scroll to find out. Most don't.
                  </p>
                </div>
                <div className="rounded-lg border-l-2 border-green-400/60 bg-green-50/50 pl-4 py-3 pr-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-green-600 mb-1">The Insight</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    The page sections <em>are</em> the navigation. If a researcher can see "Strategic Framework," "Our Global Partnership Network," and "Partnership & Investment Pathways" immediately on landing — they know exactly what's available. They can jump to what matters to them instead of guessing.
                  </p>
                </div>
                <div className="rounded-lg border-l-2 border-primary/40 bg-primary/5 pl-4 py-3 pr-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">The Solution</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    A fixed navigation panel that <strong className="font-medium text-text">opens by default</strong> on page load, showing all 10 section labels. After the first scroll, it minimizes to a vertical strip of status dots only — maintaining location awareness without occupying space. Hovering on the strip at any time re-expands the full labels for quick jumping.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 border-l-2 border-primary/20 pl-6">
                  <span className="font-manrope text-4xl font-medium text-primary">32%</span>
                  <span className="font-mono text-xs uppercase tracking-wide text-text-muted">Reduction in bounce rate</span>
                </div>
                <div className="flex flex-col gap-2 border-l-2 border-primary/20 pl-6">
                  <span className="font-manrope text-4xl font-medium text-primary">10</span>
                  <span className="font-mono text-xs uppercase tracking-wide text-text-muted">Sections visible on page load — no scroll required</span>
                </div>
                <div className="flex flex-col gap-2 border-l-2 border-primary/20 pl-6">
                  <span className="font-manrope text-4xl font-medium text-primary">3</span>
                  <span className="font-mono text-xs uppercase tracking-wide text-text-muted">Nav states: default open → minimized → hover expand</span>
                </div>
              </div>
            </div>
          </Fade>

          {/* State diagram */}
          <Fade delay={0.1}>
            <NavigationDiagram />
          </Fade>

          {/* Navigation recording */}
          <Fade delay={0.15}>
            <div className="mt-10">
              <div className="grid gap-6 md:grid-cols-2 items-center">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">Live Recording — Navigation in Action</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary mb-4">
                    The GIF below shows the navigation transitioning between all three states in real use. Notice how the dot strip maintains positional context even when collapsed — the active section dot fills red, giving users scroll-position awareness without any labels.
                  </p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    This pattern increased the average session depth — users who engaged with the navigation visited more sections, spending more time on the site's research-heavy content.
                  </p>
                </div>
                <MediaPop delay={0.1}>
                  <div className="relative overflow-hidden rounded-xl border border-border/50 shadow-smooth bg-[#0D1117]">
                    <Image src="/xylem/navigation%20recording.gif" alt="Xylem Institute Navigation — Live Interaction Recording" width={600} height={400} className="w-full h-auto" unoptimized />
                  </div>
                </MediaPop>
              </div>
            </div>
          </Fade>

          {/* Static screenshot of nav */}
          <Fade delay={0.2}>
            <div className="mt-8">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">Navigation Panel — Default Open State</p>
              <div className="relative overflow-hidden rounded-xl border border-border/50 shadow-smooth">
                <Image src="/xylem/xylem%20institute%20navigation.png" alt="Xylem Institute Navigation — Default Open State" width={1200} height={600} className="w-full h-auto object-cover" unoptimized />
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-3"
        headline="This navigation pattern shows the ability to reframe a UI constraint as a content strategy decision — a design thinking move, not a styling one."
        points={[
          "Identified the real user problem (discoverability, not aesthetics) and designed a navigation pattern specifically for that audience.",
          "Shipped a 3-state interaction model that's measurably more effective: 32% bounce rate reduction.",
          "This is different from picking a nav component from a library — it was designed from scratch for the specific audience behaviour.",
        ]}
        prevHref="#recruiter-lens-2"
        nextHref="#recruiter-lens-4"
      />

      {/* ══════════════════════════════════════════════
          03 / DESIGN SYSTEMS
      ══════════════════════════════════════════════ */}
      <section id="xi-design-system" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="03 / DESIGN SYSTEMS" title="We built a visual language for two different organizations." />

          <Fade>
            <div className="space-y-5 max-w-2xl mb-16">
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                Two websites meant two design systems — with shared DNA but distinct application. Rather than treating them as the same brand with a different logo, we defined each organization's visual identity from the ground up: typography choices, color semantics, spacing, component patterns, and when to use which.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                Both systems anchor on a deep forest green as the primary brand color — a deliberate link to the lab's geo-ecological mission. Where they diverge is in <strong className="font-medium text-text">tone and application</strong>: the Institute system is more editorial and formal, the Lab system is more utilitarian and data-forward.
              </p>
            </div>
          </Fade>

          <Fade delay={0.05}>
            <div className="mb-8">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Design System 1 — The Xylem Institute</p>
              <DesignSystemTokens org="institute" />
            </div>
          </Fade>

          <Fade delay={0.1}>
            <div className="mb-10">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Design System 2 — The Xylem Lab</p>
              <DesignSystemTokens org="lab" />
            </div>
          </Fade>

          {/* Frame 53 — actual design file screenshot if applicable */}
          <Fade delay={0.15}>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <div className="space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">From the Design File</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  Both design systems were built and maintained in Figma with a shared component library: button variants, card patterns, badge/pill styles, section layout grids, and typography specimens. The amber accent (#F9A825) functions as a universal "action and emphasis" signal across both systems — appearing as slide dividers in presentations, badge highlights on the website, and status indicators in the pipeline UI.
                </p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  The systems also extend into non-web assets: the AGRA workshop slide deck, London conference presentation, and bulletin HTML all inherit the same visual language.
                </p>
              </div>
              <MediaPop delay={0.1}>
                <div className="relative overflow-hidden rounded-xl border border-border/50 shadow-smooth">
                  <Image src="/xylem/Frame%2053.png" alt="Xylem Design System — Figma Component Overview" width={800} height={500} className="w-full h-auto object-cover" unoptimized />
                </div>
                <p className="mt-2 font-mono text-[10px] text-text-muted">Design system component from Figma file</p>
              </MediaPop>
            </div>
          </Fade>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-4"
        headline="Building two design systems — not just two websites — shows systematic design thinking, not one-off execution."
        points={[
          "Color semantics, typography scale, and component reuse are defined and documented, not improvised per page.",
          "The systems extend consistently into non-web assets (slides, bulletin HTML), showing cross-medium design thinking.",
          "Two separate systems for two separate audiences — an organizational design decision, not just a visual one.",
        ]}
        prevHref="#recruiter-lens-3"
        nextHref="#recruiter-lens-5"
      />

      {/* ══════════════════════════════════════════════
          04 / RFBS WORKSHOP — NAIROBI
      ══════════════════════════════════════════════ */}
      <section id="xi-workshop" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="04 / RFBS WORKSHOP" title="We flew to Nairobi and ran a 3-day training for 9 countries." />

          <Fade>
            <div className="grid gap-12 md:grid-cols-2 lg:gap-20 mb-16">
              <div className="space-y-5">
                <p className="font-mono text-base leading-relaxed text-text-secondary">
                  In December 2025, the Xylem Lab delivered the <strong className="font-medium text-text">AGRA COMESA Regional Food Balance Sheet (RFBS)</strong> training workshop in Nairobi, Kenya. The three-day event brought together 20+ food security analysts from 9 East and Southern African countries — representing national government agencies responsible for crop production estimates that feed directly into food policy decisions.
                </p>
                <p className="font-mono text-base leading-relaxed text-text-secondary">
                  The goal: train analysts on satellite-based yield forecasting using the YieldWatch pipeline — and show them the complete system, from raw satellite data to a publication-ready HTML bulletin. Everything they saw had been designed and built in the preceding weeks.
                </p>
                <p className="font-mono text-base leading-relaxed text-text-secondary">
                  Pradeep was on the ground in Nairobi as part of the lab team, supporting both the technical training sessions and ensuring the design materials — training sites, slides, reference documents — worked as intended under live conditions.
                </p>
              </div>
              <div className="flex flex-col gap-8">
                <StatItem value="3" label="Days of in-person training" />
                <StatItem value="9" label="East & Southern African countries" />
                <StatItem value="20+" label="Government food security analysts" />
                <StatItem value="43" label="Slides in the AGRA workshop deck" />
              </div>
            </div>
          </Fade>

          {/* Photo strip */}
          <Fade delay={0.1}>
            <div className="grid gap-4 md:grid-cols-3 mb-12">
              {[
                { src: "/xylem/1P5A1818%20(1).jpg", alt: "RFBS Workshop — Nairobi Day 1" },
                { src: "/xylem/1P5A1928.JPG",        alt: "RFBS Workshop — Training session" },
                { src: "/xylem/1P5A1818%20(2).jpg", alt: "RFBS Workshop — Analyst group" },
              ].map((img, i) => (
                <MediaPop key={i} delay={i * 0.08}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/50">
                    <Image src={img.src} alt={img.alt} fill className="object-cover object-center" unoptimized />
                  </div>
                </MediaPop>
              ))}
            </div>
          </Fade>

          {/* Workshop materials grid */}
          <Fade delay={0.15}>
            <div className="rounded-xl border border-border/50 bg-bg-alt p-6 md:p-8">
              <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Workshop Design Deliverables</p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    tag: "Live Website",
                    title: "Kenya 2026 Training Site",
                    desc: "HTML training site used as live reference during sessions. Analysts follow along in-browser. Covers pipeline setup, configuration, step-by-step cell execution, and troubleshooting.",
                    color: "bg-[#E8F5E9] text-[#1B5E20]",
                  },
                  {
                    tag: "Live Website",
                    title: "Wednesday Session Speaker Notes",
                    desc: "Structured HTML notes for the Day 2 afternoon deep-dive session. Covers GEE map generation, bulletin parameters, and Auto-Pilot demo. Designed to be both a live prompt and a post-workshop reference.",
                    color: "bg-[#E8F5E9] text-[#1B5E20]",
                  },
                  {
                    tag: "Presentation — 43 slides",
                    title: "AGRA Wednesday Session Deck",
                    desc: "Full workshop slide deck covering YieldWatch overview, pipeline architecture, feature engineering, map generation, bulletin generation, and Auto-Pilot. Matched the Xylem design system throughout.",
                    color: "bg-[#FFF8E1] text-[#F57F17]",
                  },
                  {
                    tag: "Presentation — London",
                    title: "London Conference — Auto-Pilot Slides",
                    desc: "4-slide extension to an existing YieldWatch deck, designed for a London conference audience. Covers Auto-Pilot overview, pipeline summary, core technical components, and bulletin output + prerequisites. Inserted at slide 7, matching the existing deck's design system exactly.",
                    color: "bg-[#FFF8E1] text-[#F57F17]",
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-white p-5 space-y-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${item.color}`}>{item.tag}</span>
                    <h4 className="font-manrope text-base font-semibold text-text">{item.title}</h4>
                    <p className="font-mono text-sm leading-relaxed text-text-secondary">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Fade>

          {/* LinkedIn callout */}
          <Fade delay={0.2}>
            <div className="mt-10 rounded-xl border border-border/50 bg-[#F0F7FF] p-6 flex gap-5 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">Prof. Catherine Nakalembe — LinkedIn, Dec 2025</p>
                <p className="font-mono text-sm leading-relaxed text-text-secondary italic">
                  "Just wrapped up 3 intense days of #GeoAI for crop yield and food production #forecasting in Nairobi, Kenya... We built a system that turns satellite data into national crop forecasts and gets them into the hands of government. Super proud of my team The Xylem Lab we absolutely rocked it!"
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="font-mono text-xs text-text-muted">138 reactions · 5 comments · 4 reposts</span>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-5"
        headline="Flying to Nairobi and running a live training for government analysts from 9 countries is direct evidence of stakeholder communication at a high-stakes level."
        points={[
          "The training materials had to work under live conditions with a technical audience — no room for unclear UX or broken flows.",
          "Successfully delivered training for a system (YieldWatch + Auto-Pilot) that Pradeep also helped build, showing full end-to-end ownership.",
          "Conference materials were designed fast — the London PPT was built the day before it was presented.",
        ]}
        prevHref="#recruiter-lens-4"
        nextHref="#recruiter-lens-6"
      />

      {/* ══════════════════════════════════════════════
          05 / XYLEM AUTO-PILOT
      ══════════════════════════════════════════════ */}
      <section id="xi-autopilot" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="05 / XYLEM AUTO-PILOT" title="We automated 3 days of bulletin writing into a single button." />

          <Fade>
            <div className="grid gap-12 md:grid-cols-2 lg:gap-20 mb-16">
              <div className="space-y-5">
                <div className="rounded-lg border-l-2 border-red-400/60 bg-red-50/50 pl-4 py-3 pr-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-red-500 mb-1">The Problem</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    Each cycle, analysts manually aggregated YieldWatch CSVs, wrote regional narratives, generated maps in GEE, assembled charts, and formatted everything into a bulletin. For 6 countries × 3 crops, this took days. The process was repetitive, error-prone, and didn't scale. Every bulletin was one analyst's workload away from being late.
                  </p>
                </div>
                <div className="rounded-lg border-l-2 border-primary/40 bg-primary/5 pl-4 py-3 pr-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">The Solution</p>
                  <p className="font-mono text-sm leading-relaxed text-text-secondary">
                    <strong className="font-medium text-text">Xylem Auto-Pilot</strong>: an end-to-end pipeline built in Google Colab. It reads YieldWatch CSVs, generates yield and anomaly maps via Google Earth Engine, retrieves contextual knowledge from a FAISS-indexed RAG store of historical bulletins, runs the full narrative through GPT-4.1 mini with structured prompts, and assembles a 4-tab interactive HTML bulletin — complete with charts, decision thresholds, and regional breakdowns — packaged as a ZIP. One click.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-8">
                <StatItem value="6" label="Countries covered per bulletin run" />
                <StatItem value="3" label="Crops (Maize, Rice, Beans)" />
                <StatItem value="4" label="Tabs in each HTML bulletin" />
                <StatItem value="1" label="Button click to produce the full output" />
              </div>
            </div>
          </Fade>

          {/* Pipeline diagram */}
          <Fade delay={0.1}>
            <AutoPilotDiagram />
          </Fade>

          {/* Bulletin output description */}
          <Fade delay={0.15}>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-white p-6 space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Bulletin Output — 4 Tabs</p>
                <div className="space-y-3">
                  {[
                    { tab: "Tab 1 — Overview",          desc: "Executive summary of crop conditions across all monitored countries. Highlights regional anomalies, key risk areas, and season-level outlook in plain policy language." },
                    { tab: "Tab 2 — Crop Profiles",     desc: "Per-crop yield anomaly narratives for Maize, Rice, and Beans. Each section is RAG-generated using historical bulletin context and current season data." },
                    { tab: "Tab 3 — Production Trends", desc: "Time-series production charts and divergence plots. Min / mean / max production ranges with trend direction indicators (Increasing, Stable, Declining)." },
                    { tab: "Tab 4 — Regional Breakdown", desc: "County/region-level condition table colour-coded by yield anomaly quartile for quick identification of priority intervention areas." },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg bg-bg-alt p-3 space-y-1">
                      <p className="font-mono text-[11px] font-semibold text-text">{item.tab}</p>
                      <p className="font-mono text-[11px] text-text-secondary leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 bg-white p-6 space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Technical Stack</p>
                  <div className="space-y-2.5">
                    {[
                      { layer: "Data Source",      detail: "YieldWatch CSVs — yield (T/ha), anomaly, production range, trend" },
                      { layer: "Mapping",          detail: "Google Earth Engine — GAUL 2024 L1, GLAD cropland, 500m resolution" },
                      { layer: "RAG",              detail: "FAISS vector index — 1536-dim, OpenAI text-embedding-3-small, <10ms retrieval" },
                      { layer: "Generation",       detail: "GPT-4.1 mini — structured prompt chains, narrative per region/crop/section" },
                      { layer: "Rendering",        detail: "Jinja2 HTML templates — standalone interactive bulletin, ~100–500 KB" },
                      { layer: "Delivery",         detail: "ZIP package — HTML + maps (300 DPI) + charts + calendars + assets" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 font-mono text-xs">
                        <span className="w-24 shrink-0 text-text-muted uppercase tracking-wider text-[10px]">{item.layer}</span>
                        <span className="text-text-secondary leading-snug">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bulletin output placeholder */}
                <div>
                  <ImagePlaceholder label="Place bulletin screenshot here → /xylem/autopilot-bulletin-output.png" aspect="16/10" />
                  <p className="mt-2 font-mono text-[10px] text-text-muted">📌 Screenshot of generated HTML bulletin (4-tab view)</p>
                </div>
              </div>
            </div>
          </Fade>

          {/* LinkedIn cover / brand visual */}
          <Fade delay={0.2}>
            <div className="mt-10">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">Brand Visual — Xylem Institute LinkedIn</p>
              <div className="relative overflow-hidden rounded-xl border border-border/50 shadow-smooth">
                <Image src="/xylem/LinkedIn%20cover%20-%201.png" alt="Xylem Institute — LinkedIn Brand Cover" width={1200} height={628} className="w-full h-auto object-cover" unoptimized />
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <WhyThisMatters
        id="recruiter-lens-6"
        headline="Building an AI pipeline end-to-end — from prompt design to HTML rendering to ZIP packaging — demonstrates that Pradeep operates across the full product stack, not just the UI."
        points={[
          "Took a multi-day manual process and reduced it to a single Colab cell execution — a systems thinking outcome, not just a UX one.",
          "Worked directly with RAG architecture, prompt engineering, and Python tooling — not as an engineer, but as the person responsible for making it usable and deliverable.",
          "The pipeline is live and used by the lab — not a concept or a prototype.",
        ]}
        prevHref="#recruiter-lens-5"
      />

      {/* ══════════════════════════════════════════════
          06 / OUTCOMES
      ══════════════════════════════════════════════ */}
      <section id="xi-outcomes" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="06 / OUTCOMES" title="What shipped and what it changed." />

          <Fade>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {[
                { value: "32%",  label: "Bounce rate reduction",                  sub: "Xylem Institute website — attributed to the fixed navigation pattern" },
                { value: "2",    label: "Live production websites",               sub: "xyleminstitute.org + Xylem Lab — both built from zero" },
                { value: "2",    label: "Design systems documented",              sub: "One for The Xylem Institute, one for The Xylem Lab" },
                { value: "9",    label: "Countries trained in Nairobi",           sub: "East & Southern African RFBS analyst cohort" },
                { value: "43",   label: "Workshop slides delivered",              sub: "AGRA RFBS deck — used live at the Nairobi workshop" },
                { value: "1",    label: "Click to generate a full bulletin",      sub: "Xylem Auto-Pilot — 6 countries × 3 crops, HTML + ZIP" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-40px" }} transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="flex flex-col gap-2 border-l-2 border-primary/20 pl-6 py-1">
                  <span className="font-manrope text-4xl font-medium text-primary">{item.value}</span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wide text-text">{item.label}</span>
                  <span className="font-mono text-xs text-text-muted leading-snug">{item.sub}</span>
                </motion.div>
              ))}
            </div>
          </Fade>

          {/* Full deliverable list */}
          <Fade delay={0.1}>
            <div className="rounded-xl border border-border/50 bg-bg-alt p-6 md:p-8">
              <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Complete Deliverable Record</p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { cat: "Website",        item: "xyleminstitute.org — public-facing institute website" },
                  { cat: "Website",        item: "Xylem Lab website — academic research lab" },
                  { cat: "Design System",  item: "The Xylem Institute — color, typography, component library" },
                  { cat: "Design System",  item: "The Xylem Lab — dark-mode scientific design system" },
                  { cat: "UX Pattern",     item: "Fixed 3-state navigation — open / minimized / hover-expand" },
                  { cat: "Training Site",  item: "kenya2026.html — live in-browser training reference" },
                  { cat: "Training Site",  item: "Wednesday Session Speaker Notes — HTML" },
                  { cat: "Slides — 43",   item: "AGRA RFBS Wednesday Session Deck" },
                  { cat: "Slides — 4",    item: "London Conference — Xylem Auto-Pilot slides" },
                  { cat: "AI Pipeline",    item: "Xylem Auto-Pilot — YieldWatch → GEE → RAG → GPT-4.1 mini → Bulletin HTML + ZIP" },
                  { cat: "Trip",           item: "Nairobi, Kenya — 3-day AGRA RFBS training workshop, Dec 2025" },
                  { cat: "Brand",          item: "Xylem Institute LinkedIn cover + brand visual identity" },
                ].map((d, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-white border border-border/40 px-4 py-3">
                    <span className="mt-0.5 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-primary uppercase tracking-wider shrink-0">{d.cat}</span>
                    <span className="font-mono text-xs text-text-secondary leading-snug">{d.item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Fade>

          {/* Closing statement */}
          <Fade delay={0.2}>
            <div className="mt-16 max-w-2xl">
              <p className="font-manrope text-2xl font-medium leading-snug text-text md:text-3xl">
                The Xylem Lab now has a design layer that matches the quality of its science.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                Every deliverable in this project connects to the same outcome: reducing the friction between satellite intelligence and the people who need to act on it. The websites make the work discoverable. The design systems make the brand credible. The workshop materials made the training transferable. The Auto-Pilot makes the bulletin deliverable. This work is ongoing — and still shipping.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="https://xyleminstitute.org" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 font-mono text-xs text-text-secondary transition-all hover:border-text hover:text-text">
                  Visit xyleminstitute.org →
                </Link>
                <Link href="/#work" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono text-xs text-white transition-all hover:bg-primary-dark">
                  <ArrowLeft size={12} />
                  Back to All Work
                </Link>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <Footer />
    </div>
  );
}
