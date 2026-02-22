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

/* ─────────────────────────────────────────────────────────────
   PROJECT CHAT
───────────────────────────────────────────────────────────── */
const PROJECT_PLACEHOLDERS = [
  "Ask about this research...",
  "How did you recruit participants?",
  "What did the SUS scores reveal?",
  "Ask about the affinity mapping process...",
];

const PROJECT_PILLS = [
  "What usability issues did you find?",
  "How was the Usabilathon structured?",
  "What did the UEQ results show?",
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
          message: `[Context: Transurban Express Lanes UX Research — Usabilathon competition project by EZ Pass Transurban. In-person research conducted in Virginia at Transurban HQ. Mixed-methods study: 127 survey participants, 8 semi-structured in-depth interviews, usability testing sessions, moderated think-aloud protocol. Research areas: toll payment flows, wayfinding signage comprehension, transponder setup, account management. Methods: affinity mapping (Miro), System Usability Scale (SUS), User Experience Questionnaire (UEQ), thematic analysis. Key findings: signage confusion at HOV entry points, penalty letter intimidation reducing adoption, cluttered account management UI, transponder placement instructions unclear. Deliverables: research synthesis report, affinity map, SUS/UEQ data, stakeholder presentation to Transurban team in Virginia. Team: Pradeep Yellapu (lead researcher). Project resulted in actionable design recommendations for Transurban to improve wayfinding, payment transparency, and onboarding.] ${text}`,
          mode: "general",
          conversationHistory: [],
        }),
      });
      const data = await res.json();
      const raw = data.content || "I can help answer that based on Pradeep's research details.";
      setMessages((m) => [...m, { role: "ai", text: raw }]);
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
                  <span className="font-manrope text-sm font-medium text-text">Ask about this research</span>
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
                        Ask about the methods, findings, or outcomes.
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

/* ─────────────────────────────────────────────────────────────
   RADIAL DIAL NAV
───────────────────────────────────────────────────────────── */
const SECTION_NAV = [
  { id: "tu-context", label: "Context", ticks: 3 },
  { id: "tu-research", label: "Research", ticks: 3 },
  { id: "tu-synthesis", label: "Synthesis", ticks: 4 },
  { id: "tu-evaluation", label: "Evaluation", ticks: 3 },
  { id: "tu-audit", label: "Audit", ticks: 3 },
  { id: "tu-recommendations", label: "Recommendations", ticks: 4 },
  { id: "tu-outcome", label: "Outcome", ticks: 2 },
];

function buildTicks(sections: typeof SECTION_NAV) {
  const ticks: { sectionIdx: number; isMajor: boolean; subIdx: number }[] = [];
  sections.forEach((s, si) => {
    ticks.push({ sectionIdx: si, isMajor: true, subIdx: 0 });
    for (let t = 1; t < s.ticks; t++) ticks.push({ sectionIdx: si, isMajor: false, subIdx: t });
  });
  return ticks;
}

function playTick() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const bufLen = Math.floor(ctx.sampleRate * 0.008);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 3);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 4000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.012);
    src.connect(hp); hp.connect(gain); gain.connect(ctx.destination);
    src.start(ctx.currentTime); src.onended = () => ctx.close();
  } catch (_) { /* */ }
}

function VerticalNav({ sections }: { sections: typeof SECTION_NAV }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const lastTickIdx = useRef(0);
  const allTicks = buildTicks(sections);
  const [tickPos, setTickPos] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setActiveIdx(i);
          const t = allTicks.findIndex(tk => tk.sectionIdx === i && tk.isMajor);
          if (t !== -1) setTickPos(t);
        }
      }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });
      obs.observe(el); observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]); // eslint-disable-line

  const goToTick = (ti: number) => {
    const clamped = Math.max(0, Math.min(allTicks.length - 1, ti));
    playTick(); setTickPos(clamped);
    const sIdx = allTicks[clamped].sectionIdx;
    setActiveIdx(sIdx);
    document.getElementById(sections[sIdx].id)?.scrollIntoView({ behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY; lastTickIdx.current = tickPos; isDragging.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    if (Math.abs(delta) > 4) isDragging.current = true;
    if (!isDragging.current) return;
    const rawTick = lastTickIdx.current + Math.round(delta / 18);
    const clampedTick = Math.max(0, Math.min(allTicks.length - 1, rawTick));
    if (clampedTick !== tickPos) {
      playTick(); setTickPos(clampedTick);
      const sIdx = allTicks[clampedTick].sectionIdx;
      if (sIdx !== activeIdx) { setActiveIdx(sIdx); document.getElementById(sections[sIdx].id)?.scrollIntoView({ behavior: "smooth" }); }
    }
  };
  const onPointerUp = () => { dragStartY.current = null; isDragging.current = false; };

  return (
    <div ref={navRef} className="fixed top-1/2 z-50 hidden -translate-y-1/2 xl:flex"
      style={{ right: "20px", userSelect: "none" }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="relative flex flex-col items-end" style={{ cursor: "ns-resize", gap: 0 }}>
        <div className="absolute right-[4px] top-0 bottom-0 rounded-full" style={{ background: "rgba(0,0,0,0.10)", width: "1px" }} />
        {allTicks.map((tick, ti) => {
          const isCurrent = ti === tickPos;
          const isMajorActive = tick.isMajor && tick.sectionIdx === activeIdx;
          const tickW = tick.isMajor ? (isMajorActive ? 14 : 10) : (isCurrent ? 8 : 5);
          return (
            <div key={ti} className="relative flex items-center justify-end"
              style={{ height: tick.isMajor ? "22px" : "14px", paddingRight: "14px", minWidth: "120px", cursor: "pointer" }}
              onPointerUp={(e) => { if (!isDragging.current) { e.stopPropagation(); goToTick(ti); } }}>
              {tick.isMajor && (
                <motion.span className="absolute right-[22px] font-mono text-[8.5px] uppercase tracking-widest whitespace-nowrap pointer-events-none"
                  animate={{ opacity: isMajorActive ? 1 : 0.22, x: isMajorActive ? 0 : 3 }}
                  whileHover={{ opacity: 0.7, x: 0 }} transition={{ duration: 0.2 }}
                  style={{ color: "#111" }}>
                  {sections[tick.sectionIdx].label}
                </motion.span>
              )}
              <motion.span className="absolute right-0 rounded-full pointer-events-none"
                animate={{ width: `${tickW}px`, height: tick.isMajor ? "2px" : "1px", backgroundColor: isMajorActive ? "#6366F1" : isCurrent ? "rgba(99,102,241,0.5)" : "#D1D5DB", boxShadow: isMajorActive ? "0 0 0 3px rgba(99,102,241,0.18)" : "none" }}
                transition={{ duration: 0.18 }} />
            </div>
          );
        })}
        <motion.div className="pointer-events-none absolute right-[-3px]"
          animate={{ top: `${(tickPos / Math.max(allTicks.length - 1, 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }} style={{ translateY: "-50%" }}>
          <motion.span className="block rounded-full"
            animate={{ width: 10, height: 10, backgroundColor: "#6366F1", boxShadow: "0 0 0 3px rgba(99,102,241,0.18)" }}
            transition={{ duration: 0.2 }} />
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function TransurbanPage() {

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

          <div className="mb-8 flex items-center gap-3">
            <Link
              href="/#work"
              className="group flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-text"
            >
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
              Back to Work
            </Link>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="font-mono text-xs text-primary">UX Research · Usabilathon</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="mb-6 font-manrope text-5xl font-medium leading-[1.05] tracking-tight text-text md:text-7xl lg:text-[5rem]">
                Researching the <br />
                <span className="text-primary">Express Lanes Experience.</span>
              </h1>
              <p className="max-w-xl font-mono text-base leading-relaxed text-text-secondary md:text-lg">
                A mixed-methods UX research study — conducted in-house at Transurban Virginia — to identify critical usability barriers in toll payment, wayfinding, and account management for 127 Express Lane users.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:mb-4 lg:pl-12">
              <DetailRow label="Role" value="UX Researcher (Lead)" />
              <DetailRow label="Client" value="EZ Pass Transurban" />
              <DetailRow label="Context" value="Usabilathon Competition" />
              <DetailRow
                label="Field Site"
                value={
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    Virginia (In-Person)
                  </span>
                }
              />
            </div>
          </div>

          <div className="mt-10 grid gap-8 border-t border-border/40 py-8 md:grid-cols-3">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Research Methods</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Mixed-methods survey · Semi-structured interviews · Think-aloud usability testing · Affinity mapping · SUS · UEQ
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Research Areas</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Toll payment flows · HOV/Express Lane wayfinding · Transponder onboarding · Account management · Penalty communication
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Tools</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Miro · Notion · System Usability Scale (SUS) · User Experience Questionnaire (UEQ)
              </p>
            </div>
          </div>

          {/* Hero image — payment prototype GIF */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-[#EBEBEB] px-10 py-10">
              <div
                className="relative w-full max-w-[85%] overflow-hidden rounded-xl"
                style={{
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.10), 0 24px 56px rgba(0,0,0,0.12), 0 48px 80px rgba(0,0,0,0.06)",
                }}
              >
                <Image
                  src="/transurban/payment_prototype.gif"
                  alt="Transurban Express Lanes — Payment Flow Prototype"
                  width={1200}
                  height={675}
                  className="w-full h-auto object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
            <p className="mt-4 text-center font-mono text-xs text-text-muted">
              Payment flow prototype — one of the key interaction sequences evaluated during usability testing sessions.
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          00: CONTEXT & BRIEF
      ══════════════════════════════════════════════ */}
      <section id="tu-context" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="00 / CONTEXT" title="A government-backed usability challenge." />

          <div className="grid gap-12 md:grid-cols-2 lg:gap-24">
            <div className="space-y-5">
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                The <strong className="font-medium text-text">EZ Pass Transurban Usabilathon</strong> was a competitive UX research challenge in which select teams were invited in-house to Transurban's Virginia offices to evaluate the Express Lanes user experience end-to-end — from pre-trip wayfinding through post-trip account reconciliation.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                Unlike a traditional academic project, this was a <strong className="font-medium text-text">real-world stakeholder engagement</strong>: our research findings were presented directly to the Transurban product and policy team, with the expectation that identified friction points would inform roadmap decisions.
              </p>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                The scope was deliberately broad — covering physical wayfinding, digital account management, transponder onboarding, and penalty communication — reflecting the <strong className="font-medium text-text">full user lifecycle</strong> rather than a single touchpoint.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-8">
              <StatItem value="127" label="Survey respondents" />
              <StatItem value="8" label="Semi-structured interviews" />
              <StatItem value="3" label="Core usability domains evaluated" />
            </div>
          </div>

          {/* Partnership logos */}
          <div className="mt-16 relative overflow-hidden rounded-xl border border-border/50 bg-bg-alt">
            <Image
              src="/transurban/ezpassamdtransurban partnershiplogos.png"
              alt="EZ Pass Maryland and Transurban partnership"
              width={1200}
              height={400}
              className="w-full h-auto object-contain p-8"
            />
          </div>
          <p className="mt-4 text-center font-mono text-xs text-text-muted">
            EZ Pass Maryland · Transurban — the two systems whose integration created the core user experience friction we investigated.
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          01: RESEARCH DESIGN
      ══════════════════════════════════════════════ */}
      <section id="tu-research" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="01 / RESEARCH DESIGN" title="Mixed-methods from the ground up." />

          <div className="mb-10 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              We designed a <strong className="font-medium text-text">convergent mixed-methods protocol</strong> — combining a quantitative survey phase for breadth with a qualitative interview and usability-testing phase for depth. The two datasets were triangulated during synthesis to distinguish widespread systemic issues from edge-case friction.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The survey instrument was distributed to <strong className="font-medium text-text">127 Express Lane users</strong> across the Northern Virginia corridor, capturing frequency of use, self-reported pain points, transponder familiarity, and satisfaction proxies. Survey responses were used to prioritize interview topics and identify participant segments for the qualitative phase.
            </p>
          </div>

          {/* Research plan board */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
            <Image
              src="/transurban/researchplanonboard1.png"
              alt="Research plan on whiteboard — Usabilathon kickoff"
              fill
              className="object-contain p-4 transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
          <p className="mt-4 text-center font-mono text-xs text-text-muted">
            Research plan whiteboard — scoped and structured in-house at the Transurban Virginia office on day one.
          </p>

          {/* Method breakdown */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                label: "Phase 1 — Generative survey",
                title: "127-participant quantitative sweep",
                body: "Structured questionnaire distributed to active Express Lane users. Captured usage frequency, self-reported pain points, and satisfaction ratings to identify the highest-prevalence friction themes before committing interview time.",
              },
              {
                label: "Phase 2 — Qualitative interviews",
                title: "8 semi-structured in-depth sessions",
                body: "One-on-one interviews with Express Lane users representing a cross-section of usage patterns — commuters, occasional users, and first-time adopters. Each session followed a flexible topic guide allowing emergent themes to surface organically.",
              },
              {
                label: "Phase 3 — Usability evaluation",
                title: "Think-aloud protocol + task analysis",
                body: "Moderated usability testing using a think-aloud protocol. Participants were asked to complete representative tasks — adding funds, locating transaction history, understanding a penalty notice — while narrating their reasoning aloud.",
              },
            ].map((m) => (
              <InsightCard key={m.label} label={m.label}>
                <p className="font-manrope text-sm font-medium text-text mt-1">{m.title}</p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">{m.body}</p>
              </InsightCard>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          02: FIELD RESEARCH & SYNTHESIS
      ══════════════════════════════════════════════ */}
      <section id="tu-synthesis" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="02 / SYNTHESIS" title="From raw data to actionable insight." />

          <div className="mb-10 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Interview transcripts and usability session notes were synthesized using <strong className="font-medium text-text">affinity mapping on Miro</strong> — grouping atomic observations into first-order themes, then clustering themes into higher-order problem domains. This bottom-up synthesis process ensured findings were grounded in participant language rather than pre-existing hypotheses.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The affinity map revealed four dominant problem domains that cut across multiple user segments and research phases — confirming their systemic nature rather than representing isolated incidents.
            </p>
          </div>

          {/* Affinity map */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
            <Image
              src="/transurban/affinitymapping on board.png"
              alt="Affinity mapping session — Miro board"
              fill
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
          <p className="mt-4 text-center font-mono text-xs text-text-muted">
            Affinity map — synthesizing 8 interview transcripts and 127 survey responses into dominant usability themes.
          </p>

          {/* Key findings */}
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <InsightCard label="Finding 01 — Wayfinding">
              <p className="font-manrope text-sm font-medium text-text mt-1">HOV entry signage caused consistent lane confusion</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">
                Participants consistently misidentified HOV entry points, particularly where Express and General Purpose lanes diverge. Signage cognitive load was compounded by high driving speeds — users reported not having sufficient time to parse multi-element sign compositions before passing the decision point.
              </p>
            </InsightCard>
            <InsightCard label="Finding 02 — Penalty communication">
              <p className="font-manrope text-sm font-medium text-text mt-1">Physical penalty letters generated avoidance, not compliance</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">
                The formal tone and visual density of penalty correspondence caused anxiety rather than motivating resolution. Several participants described leaving penalty letters unopened — a behavioral pattern with direct downstream consequences for Transurban's collections rate and user retention.
              </p>
            </InsightCard>
            <InsightCard label="Finding 03 — Account management">
              <p className="font-manrope text-sm font-medium text-text mt-1">Cluttered interface obscured primary account actions</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">
                The existing account portal presented all functions at equal visual weight — transaction history, auto-replenishment settings, transponder management, and statements competed for attention on a single crowded screen. Participants required significantly more time-on-task than expected for routine actions like adding funds or checking a balance.
              </p>
            </InsightCard>
            <InsightCard label="Finding 04 — Transponder onboarding">
              <p className="font-manrope text-sm font-medium text-text mt-1">Physical installation instructions generated repeated errors</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">
                First-time users consistently misplaced transponders — attaching them below the windshield's metallic band or behind rearview mirror housing — leading to read failures at toll gantries. The included instruction sheet lacked clear spatial reference points, forcing users to rely on trial and error.
              </p>
            </InsightCard>
          </div>

          {/* Key insight callout */}
          <div className="mt-8 rounded-xl border border-primary/15 bg-primary/4 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60 mb-2">Cross-cutting insight</p>
            <p className="font-mono text-sm leading-relaxed text-text">
              The most consistent underlying theme across all four domains: <strong className="font-medium">the system was designed from an operational perspective, not a user mental model perspective.</strong> Signage, penalty letters, account structure, and installation guides all reflected how Transurban categorizes information internally — not how a commuter navigating a highway at 65mph processes and acts on it.
            </p>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          03: USABILITY EVALUATION
      ══════════════════════════════════════════════ */}
      <section id="tu-evaluation" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="03 / EVALUATION" title="Measuring usability with validated instruments." />

          <div className="mb-10 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              To complement the qualitative findings, we administered two standardized usability measurement instruments: the <strong className="font-medium text-text">System Usability Scale (SUS)</strong> and the <strong className="font-medium text-text">User Experience Questionnaire (UEQ)</strong>. Using validated scales allowed us to benchmark Transurban's performance against established norms and quantify the severity of identified issues with statistical grounding.
            </p>
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Participants completed both instruments immediately following their usability testing session, while task experience was still fresh — minimizing retrospective bias and ensuring ratings reflected actual interaction difficulty rather than general satisfaction.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* SUS */}
            <div className="rounded-xl border border-border/50 bg-bg-alt overflow-hidden">
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">System Usability Scale (SUS)</p>
                <p className="font-manrope text-sm font-medium text-text mb-3">10-item Likert-based usability benchmark</p>
                <p className="font-mono text-xs leading-relaxed text-text-muted">
                  The SUS produces a 0–100 composite score where 68 is the industry average. Scores below 68 indicate usability below acceptable thresholds; scores above 80 indicate excellent usability. Our results provided a quantified severity index to prioritize recommendations.
                </p>
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden border-t border-border/40 bg-white">
                <Image
                  src="/transurban/systemusabilityscale.png"
                  alt="System Usability Scale results"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>

            {/* UEQ */}
            <div className="rounded-xl border border-border/50 bg-bg-alt overflow-hidden">
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">User Experience Questionnaire (UEQ)</p>
                <p className="font-manrope text-sm font-medium text-text mb-3">Multi-dimensional UX quality assessment</p>
                <p className="font-mono text-xs leading-relaxed text-text-muted">
                  The UEQ evaluates six dimensions — Attractiveness, Perspicuity, Efficiency, Dependability, Stimulation, and Novelty — on a -3 to +3 scale. This allowed us to isolate which UX dimensions were underperforming relative to industry benchmarks, providing targeted design direction beyond a single composite score.
                </p>
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden border-t border-border/40 bg-white">
                <Image
                  src="/transurban/User Experience Questionnaire (UEQ) Results.png"
                  alt="UEQ results across six dimensions"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>

          {/* Time on task */}
          <div className="mt-8">
            <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
              <div className="p-6 border-b border-border/40">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">Task Completion Performance</p>
                <p className="font-manrope text-sm font-medium text-text">Time-on-task analysis across key user journeys</p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted max-w-2xl">
                  Time-on-task was recorded for each usability testing scenario. Outlier times — where participants took significantly longer than expected or failed to complete a task — were cross-referenced with concurrent think-aloud narration to identify the specific interface element or content gap responsible for the delay.
                </p>
              </div>
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#F5F5F7]">
                <Image
                  src="/transurban/timeontask.png"
                  alt="Time on task analysis"
                  fill
                  className="object-contain p-6"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          04: EXISTING SYSTEM AUDIT
      ══════════════════════════════════════════════ */}
      <section id="tu-audit" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="04 / AUDIT" title="What the existing system looked like." />

          <div className="mb-10 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              A <strong className="font-medium text-text">heuristic evaluation</strong> of the existing Transurban account portal was conducted in parallel with user research. Evaluating against Nielsen's 10 usability heuristics surfaced structural IA issues that user testing later confirmed through behavioral evidence — providing triangulated confidence in the findings.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <figure>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
                <Image
                  src="/transurban/clutteredoldviewtransurban.png"
                  alt="Existing Transurban account portal — heuristic audit"
                  fill
                  className="object-contain"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-text-muted text-center">
                Existing account interface — violation of Nielsen's Heuristic #8 (aesthetic and minimalist design). All functions rendered at equal weight with no visual hierarchy to guide task completion.
              </figcaption>
            </figure>

            <div className="space-y-5">
              <figure>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
                  <Image
                    src="/transurban/bettertransponderdesign.png"
                    alt="Improved transponder design concept"
                    fill
                    className="object-contain"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-xs text-text-muted text-center">
                  Transponder design recommendation — informed by spatial error data from usability sessions.
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Signage and physical collateral */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <figure>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
                <Image
                  src="/transurban/preventfinessignageonroads.png"
                  alt="Prevent fines road signage"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-text-muted text-center">
                HOV enforcement signage — evaluated for legibility and processing time at highway speeds.
              </figcaption>
            </figure>
            <figure>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
                <Image
                  src="/transurban/physicallettersentbytransurbantopenaltyusers.png"
                  alt="Penalty letter sent by Transurban"
                  fill
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-text-muted text-center">
                Penalty letter — formal tone and dense information hierarchy contributed to avoidance behavior.
              </figcaption>
            </figure>
            <figure>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
                <Image
                  src="/transurban/physicalletterinvoicesentbytransurbantopenaltyusers.png"
                  alt="Invoice letter from Transurban"
                  fill
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-text-muted text-center">
                Invoice correspondence — language and layout tested against plain-language readability standards.
              </figcaption>
            </figure>
          </div>

          {/* Transponder instructions */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <figure>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
                <Image
                  src="/transurban/instructionsonwheretoputtheexpass.png"
                  alt="Transponder placement instructions"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-text-muted text-center">
                Transponder placement guide — spatial ambiguity led to a high rate of installation errors in testing.
              </figcaption>
            </figure>
            <figure>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[#F5F5F7]">
                <Image
                  src="/transurban/instructionsarticleprovided by transurban on roads HOV 2.png"
                  alt="HOV road instructions article"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-text-muted text-center">
                HOV usage guide — evaluated against plain-language standards; found to assume significant prior knowledge.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          05: RECOMMENDATIONS
      ══════════════════════════════════════════════ */}
      <section id="tu-recommendations" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="05 / RECOMMENDATIONS" title="Four research-backed design directions." />

          <div className="mb-16 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              Each recommendation maps directly to a finding from the research synthesis. Priority was determined by the intersection of prevalence (how many participants experienced it), severity (how significantly it impacted task completion), and addressability within Transurban's product roadmap.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                n: "01",
                title: "Simplify signage through progressive disclosure",
                finding: "HOV wayfinding confusion",
                body: "Replace multi-element sign compositions with a sequenced signage system — delivering one critical decision cue per sign in the approach sequence rather than all information simultaneously. Prioritize high-contrast color coding aligned with the existing E-ZPass branding system to reduce cognitive parsing time at highway speeds.",
              },
              {
                n: "02",
                title: "Redesign penalty communication as plain-language guidance",
                finding: "Penalty letter avoidance behavior",
                body: "Reframe penalty correspondence from formal legal notices to action-oriented user communications. Lead with the resolution path — a clear, single-step call to action — before any fee or timeline information. Reduce information density by separating penalty notification from payment instructions across two distinct touchpoints.",
              },
              {
                n: "03",
                title: "Restructure account portal information architecture",
                finding: "Account management task failure",
                body: "Apply a task-frequency-based IA hierarchy: surface account balance, add funds, and recent transactions at the top level. Relegate low-frequency administrative actions (statement downloads, transponder settings) to a secondary layer accessible via explicit navigation. This directly addresses the cognitive load identified in the SUS and UEQ Perspicuity scores.",
              },
              {
                n: "04",
                title: "Redesign transponder installation guide with spatial anchors",
                finding: "Transponder placement errors",
                body: "Replace the text-heavy installation guide with a visual-first instruction set using windshield silhouettes as spatial reference frames. Include explicit callouts for common failure zones (metallic bands, mirror housings). Consider a short-form video QR code as a supplementary channel for users who need dynamic guidance.",
              },
            ].map((r) => (
              <div key={r.n} className="grid gap-6 rounded-xl border border-border/50 bg-white p-6 md:grid-cols-[auto_1fr]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/8 font-mono text-xs font-medium text-primary">
                  {r.n}
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">↳ {r.finding}</p>
                  <h3 className="font-manrope text-lg font-medium text-text">{r.title}</h3>
                  <p className="mt-2 font-mono text-sm leading-relaxed text-text-secondary">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════
          06: STAKEHOLDER PRESENTATION & OUTCOME
      ══════════════════════════════════════════════ */}
      <section id="tu-outcome" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12">
          <SectionHeading number="06 / OUTCOME" title="Research delivered in-house to Transurban." />

          <div className="mb-12 space-y-5 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              The full research synthesis — covering survey analysis, interview themes, usability evaluation data, SUS/UEQ benchmarking, and prioritized recommendations — was presented in-person to the Transurban product and policy team in Virginia. The presentation was structured to map each finding to a business impact metric (collections rate, user retention, support ticket volume) to ground design recommendations in language relevant to the stakeholder audience.
            </p>
          </div>

          {/* Presentation photo */}
          <figure>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border grayscale transition-all duration-700 hover:grayscale-0">
              <Image
                src="/transurban/megivingpresentationtostakeholders.jpeg"
                alt="Presenting research findings to Transurban stakeholders"
                fill
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-center font-mono text-xs text-text-muted">
              Presenting research findings and design recommendations to the Transurban team — Virginia, in-house.
            </figcaption>
          </figure>

          {/* Reflections */}
          <div className="mt-16">
            <h3 className="mb-8 font-manrope text-xl font-medium text-text">What this project reinforced.</h3>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Field research is irreplaceable",
                  body: "Being physically on-site in Virginia — with access to actual signage, penalty letters, and physical transponders — produced a qualitative depth that remote research could not have replicated. The materials themselves were data.",
                },
                {
                  title: "Validated scales quantify what interviews describe",
                  body: "The SUS and UEQ gave us the numerical grounding to say 'this is below industry standard' — not just 'users found this confusing.' Stakeholders responded to data-backed severity rankings in ways they wouldn't have to qualitative observations alone.",
                },
                {
                  title: "Operational logic ≠ user mental model",
                  body: "Every usability failure we found traced back to the same root cause: the system was organized around how Transurban manages data, not how a commuter makes decisions. Naming this pattern early gave our recommendations a unifying rationale.",
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
                src="/transurban/teampicture.png"
                alt="Usabilathon team — Transurban Virginia"
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-center font-mono text-xs text-text-muted">
              Usabilathon team — UX researchers competing in-house at Transurban's Virginia offices.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
