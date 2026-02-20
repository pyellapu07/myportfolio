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
} from "lucide-react";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
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
          mode: "general",
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
        className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-3rem)] max-w-[640px] -translate-x-1/2"
        data-no-cursor
      >
        {/* Expanded chat panel */}
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
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-border/40 bg-bg-alt/50 px-5 py-3">
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
                      onClick={() => setIsExpanded(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <Sparkles size={18} className="text-primary/30" />
                      <p className="max-w-[200px] font-mono text-xs text-text-muted">
                        Ask about the process, decisions, or outcomes.
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

        {/* Collapsed bar , same style as homepage ChatBar */}
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

        {/* 3 recommended pills below bar */}
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

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-12 md:mb-16">
      <span className="mb-3 block font-mono text-[11px] text-primary/60">{number}</span>
      <h2 className="font-manrope text-3xl font-medium tracking-tight text-text md:text-5xl">{title}</h2>
    </div>
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

/* Insight card , used in research + decisions sections */
function InsightCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-white p-6">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      {children}
    </div>
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
                We condensed a 33-page monolithic form into a streamlined 4-step progressive flow , reducing navigation time by 80% for 750+ applicants annually.
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
          <div className="mt-8">
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
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          00: PROCESS FRAMEWORK
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="00 / PROCESS" title="How we worked , Agile UX" />

          <div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              This project followed an <strong className="font-medium text-text">Agile UX methodology</strong> , a hybrid of Lean UX thinking and Scrum sprint cadence. Rather than front-loading research before any design work, we ran <strong className="font-medium text-text">parallel discovery and delivery tracks</strong> within each sprint.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Every Monday, the full cross-functional team convened for a structured sprint call: designers presented findings and prototypes, engineers flagged technical constraints, and the Microsoft Reston dev reviewer provided implementation-level feedback. <strong className="font-medium text-text">Stakeholder interviews with Aaryan Patel</strong> (Recruitment Manager) were embedded into Sprint 1 and 2, ensuring the applicant-side redesign stayed aligned with recruiter-side backend requirements.
            </p>
          </div>

          {/* Agile UX sprint diagram placeholder */}
          <div className="rounded-xl border border-border/50 bg-bg-alt p-8 md:p-10">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Agile UX Framework , Sprint Structure</p>

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
              <strong className="font-medium text-text">Why Agile UX?</strong> , The project had hard sprint deadlines, an active engineering team writing code in parallel, and a dev reviewer who needed to sign off before each sprint closed. Waterfall wasn't an option. Agile UX let us validate with users early and course-correct without losing velocity.
            </p>

            {/* Agile UX framework diagram */}
            <div className="mt-6 relative w-full overflow-hidden rounded-lg border border-border/40 bg-white">
              <Image
                src="/hack4impact/agile-ux-framework.png"
                alt="Agile UX framework diagram"
                width={1200}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          01: DISCOVERY & CONTEXT
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="01 / DISCOVERY" title="We audited a 33-page barrier." />

          <div className="grid gap-12 md:grid-cols-2 lg:gap-24">
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
          </div>

          <figure className="mt-16">
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
          </figure>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          02: RESEARCH
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="02 / RESEARCH" title="We mapped both sides of the system." />

          <div className="mb-10 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Before touching a single frame in Figma, we conducted <strong className="font-medium text-text">contextual inquiry sessions</strong> with current and former applicants, and ran a <strong className="font-medium text-text">structured stakeholder interview</strong> with Aaryan Patel (Recruitment Manager) to capture the recruiter-side mental model and backend constraints.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              We then synthesized findings into a <strong className="font-medium text-text">dual-lane user journey map</strong> , one for applicants, one for reviewers , to identify where the two flows intersected, where they diverged, and where the current IA was forcing them to collide unnecessarily.
            </p>
          </div>

          <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
            <Image
              src="/hack4impact/userflow.png"
              alt="Dual-lane user journey map , Applicant and Reviewer pathways"
              fill
              className="object-contain p-6 transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
          <figcaption className="mt-4 text-center font-mono text-xs text-text-muted">
            Dual-lane user flow , mapping the Applicant and Reviewer pathways separately to expose IA conflicts in the original system.
          </figcaption>

          {/* Pain points */}
          <div className="mt-14 grid gap-5 md:grid-cols-2">
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
          </div>

          {/* Key research finding callout */}
          <div className="mt-8 rounded-xl border border-primary/15 bg-primary/4 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">Key research insight</p>
            <p className="font-mono text-sm leading-relaxed text-text">
              The most critical finding: <strong className="font-medium">applicants and reviewers were sharing a single entry point</strong> without differentiated routing. First-time applicants needed to land on the form; returning applicants needed to land on their status page. The original IA treated them as identical , routing everyone to the same screen regardless of context, generating friction for both personas.
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          03: DESIGN PROCESS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="03 / DESIGN PROCESS" title="From constraints to high-fidelity." />

          <div className="mb-10 max-w-2xl space-y-5">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              We ran <strong className="font-medium text-text">three rounds of design critique</strong> within each sprint , internal review, cross-functional team review (Monday sprint call), and Microsoft dev reviewer sign-off. This created a structured validation gate before any work moved to implementation.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The login screen alone went through <strong className="font-medium text-text">six documented iterations</strong> , each addressing a specific piece of feedback from the Monday sprint call or a usability issue surfaced during prototype walkthroughs with applicants.
            </p>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]">
            <Image
              src="/hack4impact/login page design versions figma view screenshot.png"
              alt="Login screen iteration history in Figma"
              fill
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 text-center font-mono text-xs text-text-muted">
            Figma iteration history for the login screen , each version addressing specific sprint feedback and heuristic violations.
          </figcaption>

          {/* Design principles */}
          <div className="mt-14 grid gap-4 md:grid-cols-3">
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
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          04: THE SOLUTION
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
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


      {/* ══════════════════════════════════════════════
          05: OUTCOMES
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-border/40 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="05 / OUTCOME" title="Shipped. Live. Measurable." />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <StatItem value="80%" label="Reduction in navigation time" />
            <StatItem value="750+" label="Annual applicants served" />
            <StatItem value="4" label="Steps from 33 pages" />
          </div>

          {/* Testimonial */}
          <div className="mt-20 rounded-2xl border border-border bg-white p-8 md:p-12">
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
          </div>

          {/* Reflections */}
          <div className="mt-16">
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
          </div>

          {/* Team photo */}
          <div className="mt-20">
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
          </div>

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
