"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageCircle, Loader2, ChevronDown, Sparkles, RefreshCw, Briefcase, Copy, Check, Maximize2, Minimize2, ExternalLink, X } from "lucide-react";
import { useRecruiter } from "@/lib/recruiter-context";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import SparkIcon from "@/components/SparkIcon";

const PROJECT_PLACEHOLDERS = ["Ask about this research...", "How was the interview guide structured?", "What did the affinity diagram reveal?", "Ask about participatory design..."];
const PROJECT_PILLS = ["How did you synthesize 120+ data points?", "What tools do faculty actually use?", "What was the participatory design process?"];
const RECRUITER_PILLS = ["How did he lead the contextual interviews?", "What research methods were used?", "How did he synthesize qualitative data?", "What design recommendations emerged?"];

const SECTION_NAV = [
    { id: "wf-context", label: "Context" }, { id: "wf-methodology", label: "Methodology" },
    { id: "wf-participants", label: "Participants" }, { id: "wf-data", label: "Data" },
    { id: "wf-findings", label: "Findings" }, { id: "wf-journey", label: "Journey Map" },
    { id: "wf-participatory", label: "Co-Design" }, { id: "wf-ia", label: "IA" },
    { id: "wf-concepts", label: "Concepts" }, { id: "wf-hifi", label: "Hi-Fi" },
    { id: "wf-outcome", label: "Outcome" },
];

function RecruiterHighlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const { isRecruiterMode } = useRecruiter();
    if (!isRecruiterMode) return <>{children}</>;
    return <span className={cn("text-primary", className)}>{children}</span>;
}

function WhyThisMatters({ id, headline, points, nextHref, prevHref }: { id?: string; headline: string; points: string[]; nextHref?: string; prevHref?: string }) {
    const { isRecruiterMode } = useRecruiter();
    if (!isRecruiterMode) return null;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-40px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-auto my-0 max-w-[1000px] px-6 md:px-12" id={id}>
            <div className="relative mb-8 mt-12 overflow-hidden rounded-2xl p-6 md:p-8" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.06) 30%, rgba(168,85,247,0.04) 60%, rgba(79,70,229,0.03) 100%)", boxShadow: "0 4px 32px rgba(99,102,241,0.06)" }}>
                <div className="mb-4 flex items-center gap-2.5"><SparkIcon size={18} /><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold">Why This Matters, Recruiter Lens</p></div>
                <p className="font-manrope text-base font-semibold text-text mb-4">{headline}</p>
                <ul className="space-y-2">{points.map((p, i) => (<li key={i} className="flex items-start gap-2.5 font-mono text-sm text-text-secondary"><span className="mt-1 text-primary/50 shrink-0">→</span>{p}</li>))}</ul>
                {(nextHref || prevHref) && (<div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">{prevHref ? <a href={prevHref} className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary">↑ Previous Lens</a> : <span />}{nextHref ? <a href={nextHref} className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary">Next Lens ↓</a> : <span />}</div>)}
            </div>
        </motion.div>
    );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-60px" }} transition={{ duration: 0.5 }} className="mb-12">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">{number}</p>
            <h2 className="font-manrope text-3xl font-medium leading-tight tracking-tight text-text md:text-4xl">{title}</h2>
        </motion.div>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="flex flex-col gap-1 border-l-2 border-primary/20 pl-6">
            <span className="font-manrope text-4xl font-medium text-primary md:text-5xl">{value}</span>
            <span className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</span>
        </motion.div>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (<div><p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p><p className="font-mono text-sm text-text-secondary">{value}</p></div>);
}

function InsightCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-40px" }} transition={{ duration: 0.4 }} className="rounded-xl border border-border/50 bg-white p-6 cursor-default" whileHover={{ scale: 1.025, y: -6 }}
        >
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>{children}
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

/* Deck of cards — shows primary image + 3 stacked response images on hover */
const ACTIVITY1_IMAGES = [
    "/Faculty Dashboard/participatorydesignsessionmappingouttypicalworkweekandannotatedmomentsusingemojis.png",
    "/Faculty Dashboard/participatorydesignsessionmappingouttypicalworkweekandannotatedmomentsusingemojis2.png",
    "/Faculty Dashboard/participatorydesignsessionmappingouttypicalworkweekandannotatedmomentsusingemojis3.png",
    "/Faculty Dashboard/participatorydesignsessionmappingouttypicalworkweekandannotatedmomentsusingemojis4.png",
];
const ACTIVITY2_IMAGES = [
    "/Faculty Dashboard/participatorydesignsessiondesigningtheirownlowdifdashboard.png",
    "/Faculty Dashboard/participatorydesignsessiondesigningtheirownlowdifdashboard2.png",
    "/Faculty Dashboard/participatorydesignsessiondesigningtheirownlowdifdashboard3.png",
    "/Faculty Dashboard/participatorydesignsessiondesigningtheirownlowdifdashboard4.png",
];
const ALL_PARTICIPATORY_IMAGES = [...ACTIVITY1_IMAGES, ...ACTIVITY2_IMAGES];

function DeckCard({ label, title, description, images, onImageClick }: { label: string; title: string; description: string; images: string[]; onImageClick: (src: string) => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            className="relative rounded-xl border border-border/50 bg-white p-6 cursor-pointer"
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
            <h3 className="mb-3 font-manrope text-lg font-medium text-text">{title}</h3>
            <p className="mb-4 font-mono text-xs leading-relaxed text-text-secondary">{description}</p>
            <div className="relative h-[260px] md:h-[300px]">
                {images.map((src, i) => {
                    const isTop = i === 0;
                    const offset = hovered ? { x: (i - 1) * 18, y: -i * 12, rotate: (i - 1) * 4, scale: 1 - i * 0.03 } : { x: 0, y: 0, rotate: 0, scale: 1 - i * 0.02 };
                    return (
                        <motion.div
                            key={i}
                            className="absolute inset-0 overflow-hidden rounded-lg border border-border/40 bg-[#F5F5F7] shadow-sm"
                            style={{ zIndex: images.length - i }}
                            animate={offset}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={(e) => { e.stopPropagation(); onImageClick(src); }}
                        >
                            <Image src={src} alt={`${title} response ${i + 1}`} fill className="object-contain p-2" />
                            {!isTop && !hovered && <div className="absolute inset-0 bg-white/40" />}
                        </motion.div>
                    );
                })}
            </div>
            <p className="mt-3 text-center font-mono text-[10px] text-text-muted">{hovered ? "Click any card to view full size" : "Hover to reveal all responses"} · {images.length} responses</p>
        </motion.div>
    );
}

function InfiniteImageLoop({ images, onImageClick }: { images: string[]; onImageClick: (src: string) => void }) {
    const doubled = [...images, ...images];
    return (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden py-8">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-r from-[#FAFAFA] to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-l from-[#FAFAFA] to-transparent" />
            <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scroll-track { animation: infinite-scroll 60s linear infinite; }
        .scroll-track:hover { animation-play-state: paused; }
      `}</style>
            <div className="scroll-track flex gap-4 w-max">
                {doubled.map((src, i) => (
                    <button
                        key={i}
                        onClick={() => onImageClick(src)}
                        className="group relative h-[200px] w-[320px] shrink-0 overflow-hidden rounded-xl border border-border/40 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                    >
                        <Image src={src} alt={`Participatory response ${(i % images.length) + 1}`} fill className="object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                    </button>
                ))}
            </div>
        </div>
    );
}

function VerticalNav({ sections }: { sections: { id: string; label: string }[] }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const isScrollingRef = useRef(false);
    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        sections.forEach(({ id }, i) => { const el = document.getElementById(id); if (!el) return; const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && !isScrollingRef.current) setActiveIdx(i); }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 }); obs.observe(el); observers.push(obs); });
        return () => observers.forEach(o => o.disconnect());
    }, [sections]);
    return (
        <div className="fixed top-1/2 z-50 hidden -translate-y-1/2 xl:flex flex-col gap-3" style={{ right: "40px", userSelect: "none" }}>
            {sections.map((section, i) => {
                const isActive = i === activeIdx; return (
                    <button key={i} onClick={() => { setActiveIdx(i); const el = document.getElementById(section.id); if (el) { isScrollingRef.current = true; el.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => { isScrollingRef.current = false; }, 1000); } }} className="group relative flex items-center justify-end" aria-label={`Scroll to ${section.label}`}>
                        <span className={cn("absolute right-6 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-text", isActive ? "opacity-100 translate-x-0 text-primary font-medium" : "translate-x-2 text-text-muted")}>{section.label}</span>
                        <span className={cn("block w-1.5 rounded-full transition-all duration-300", isActive ? "h-6 bg-primary shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "h-1.5 bg-border/50 group-hover:bg-border group-hover:h-3")} />
                    </button>);
            })}
        </div>
    );
}

function ProjectSmartBar() {
    const { isRecruiterMode } = useRecruiter();
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

    useEffect(() => { if (isRecruiterMode) { setIsExpanded(true); setIsMaximized(false); } }, [isRecruiterMode]);

    useEffect(() => {
        if (isExpanded) return;
        const phrase = PROJECT_PLACEHOLDERS[phraseIdx];
        const speed = isDeleting ? 30 : 55;
        const timeout = setTimeout(() => {
            if (!isDeleting) { setPlaceholder(phrase.slice(0, charIdx + 1)); if (charIdx + 1 === phrase.length) { setTimeout(() => setIsDeleting(true), 1600); } else { setCharIdx(c => c + 1); } }
            else { setPlaceholder(phrase.slice(0, charIdx - 1)); if (charIdx - 1 === 0) { setIsDeleting(false); setPhraseIdx(i => (i + 1) % PROJECT_PLACEHOLDERS.length); setCharIdx(0); } else { setCharIdx(c => c - 1); } }
        }, speed);
        return () => clearTimeout(timeout);
    }, [isExpanded, phraseIdx, charIdx, isDeleting]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

    async function send(text: string) {
        if (!text.trim() || loading) return;
        setIsExpanded(true); setLoading(true); setMessages(m => [...m, { role: "user", text }]); setInput("");
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `[Context: Workflow, Faculty Workload Management UX Research. Led contextual interviews with 8 faculty members (A01-H01) and participatory design sessions with 5 of them. Research question: How do university faculty members manage and prioritize their workload across teaching, research, and service? Methods: semi-structured interviews, participatory design (weekly timeline mapping + dashboard co-design), affinity mapping, journey mapping, identity modeling. Key findings: fragmented tool usage, invisible labor in service work, promotion documentation gaps, desire for integrated dashboard. 120+ data points collected. Team: Pradeep (interviewer/note-taker), Hitarthi, Mansi, Saumya, Hansika. University of Maryland iSchool.] ${text}`, mode: isRecruiterMode ? "recruiter" : "general", conversationHistory: [] }) });
            const data = await res.json();
            setMessages(m => [...m, { role: "ai", text: data.content || "I can help answer that." }]);
        } catch { setMessages(m => [...m, { role: "ai", text: "I'm having trouble connecting right now. Try again?" }]); }
        finally { setLoading(false); setTimeout(() => textareaRef.current?.focus(), 100); }
    }

    function handleReset(e: React.MouseEvent) { e.stopPropagation(); setMessages([]); setInput(""); }

    return (
        <>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className={cn("fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300", isExpanded ? (isMaximized ? "w-[calc(100%-3rem)] max-w-[1000px]" : "w-[calc(100%-3rem)] max-w-[800px]") : "w-[calc(100%-3rem)] max-w-[640px]")} data-no-cursor>
                {isExpanded && <div className={cn("chat-glow transition-all duration-300", isMaximized ? "opacity-30" : "opacity-60")} style={{ borderRadius: isMaximized ? "48px" : "36px" }} />}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div initial={{ opacity: 0, y: 10, scaleY: 0.96 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} exit={{ opacity: 0, y: 10, scaleY: 0.96 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="mb-1.5 overflow-hidden rounded-xl border border-border/40 bg-white shadow-smooth-lg" style={{ transformOrigin: "bottom" }}>
                            <div className={cn("flex flex-col transition-all duration-300", isMaximized ? "h-[75vh] max-h-[800px]" : "h-[340px]")}>
                                <div className="flex items-center justify-between border-b border-border/40 bg-bg-alt/50 px-5 py-3 shrink-0">
                                    <span className="font-manrope text-sm font-medium text-text">Ask about this research</span>
                                    <div className="flex items-center gap-1">
                                        {messages.length > 0 && <button onClick={handleReset} title="Reset chat" className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text"><RefreshCw size={12} /></button>}
                                        <button onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Minimize" : "Maximize"} className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text">{isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
                                        <button onClick={() => setIsExpanded(false)} title="Close" className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/5 hover:text-text"><ChevronDown size={15} /></button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    {isRecruiterMode && (messages.length === 0 || isMaximized) && (
                                        <div className={cn("flex flex-col shrink-0", messages.length > 0 ? "mb-6 border-b border-border/40 pb-6" : "h-full")}>
                                            <div className="mb-6 flex items-start gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Briefcase size={20} /></div>
                                                <div><h3 className="font-manrope text-base font-semibold text-text">Recruiter Summary Lens</h3><p className="mt-1 font-mono text-sm leading-relaxed text-text-secondary">Role fit: UX Researcher · Level: Junior / Mid · Proof: Led mixed-methods study with 8 faculty, 120+ data points synthesized.<br /><span className="font-medium text-text">Why it matters:</span> Demonstrates end-to-end research ownership from recruitment through synthesis to design recommendations.</p></div>
                                            </div>
                                            <div className={messages.length === 0 ? "mt-auto" : "mt-2"}>
                                                <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-text-muted">Suggested Interview Questions</p>
                                                <div className={cn("grid gap-2", isMaximized ? "grid-cols-2" : "grid-cols-1")}>
                                                    {RECRUITER_PILLS.map(pill => (
                                                        <div key={pill} className="group flex items-center justify-between rounded-xl border border-border/40 bg-bg-alt/50 px-4 py-3 transition-colors hover:border-primary/30">
                                                            <span className={cn("font-mono text-text-secondary group-hover:text-text", isMaximized ? "text-xs pr-2" : "text-sm")}>{pill}</span>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(pill); setCopiedId(pill); setTimeout(() => setCopiedId(null), 2000); }} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-text-muted shadow-sm ring-1 ring-border/50 transition-colors hover:text-primary" title="Copy">{copiedId === pill ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}</button>
                                                                <button onClick={() => { send(pill); if (!isMaximized) setTimeout(() => setIsMaximized(true), 150); }} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-text-muted shadow-sm ring-1 ring-border/50 transition-colors hover:text-primary" title="Ask AI"><ArrowRight size={14} /></button>
                                                            </div>
                                                        </div>))}
                                                </div>
                                            </div>
                                        </div>)}
                                    {!isRecruiterMode && messages.length === 0 ? (<div className="flex h-full flex-col items-center justify-center gap-3 text-center"><Sparkles size={18} className="text-primary/30" /><p className="max-w-[200px] font-mono text-xs text-text-muted">Ask about the research methods, findings, or impact.</p></div>
                                    ) : messages.length > 0 ? (<div className="space-y-3">{messages.map((m, i) => (<div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}><div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 font-mono text-xs leading-relaxed", m.role === "user" ? "bg-primary text-white" : "border border-border/60 bg-bg-alt text-text")}>{m.text}</div></div>))}{loading && <div className="flex justify-start"><div className="rounded-2xl bg-bg-alt px-4 py-3"><Loader2 size={13} className="animate-spin text-text-muted" /></div></div>}<div ref={bottomRef} /></div>) : null}
                                </div>
                                <div className="border-t border-border/40 bg-white p-3"><div className="flex gap-2"><textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} className="flex-1 resize-none bg-transparent px-3 py-2 font-mono text-xs outline-none placeholder:text-text-muted" placeholder="Type your question..." rows={1} /><button onClick={() => send(input)} disabled={!input.trim() || loading} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40"><ArrowRight size={14} /></button></div></div>
                            </div>
                        </motion.div>)}
                </AnimatePresence>
                <div className="relative rounded-2xl border border-white/50 bg-white/20 p-1.5 shadow-smooth-lg backdrop-blur-2xl mt-1.5">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="flex w-full items-center gap-3 rounded-xl bg-white/60 px-5 py-3.5 text-left backdrop-blur-sm transition-colors hover:bg-white/80">
                        <MessageCircle size={18} className="shrink-0 text-primary" /><span className="flex-1 font-mono text-xs text-text-muted">{placeholder || PROJECT_PLACEHOLDERS[0]}</span><span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary">Research AI</span><MessageCircle size={14} className="shrink-0 text-text-muted" />
                    </button>
                </div>
                {!isRecruiterMode && (<div className="mt-2 flex items-center justify-center gap-2 flex-wrap">{PROJECT_PILLS.map(pill => (<button key={pill} onClick={() => send(pill)} className="rounded-full border border-border/40 bg-white/60 px-3 py-1 font-mono text-[10px] text-text-secondary backdrop-blur-sm transition-colors hover:border-border hover:bg-white">{pill}</button>))}</div>)}
            </motion.div>
        </>
    );
}

/* ─── MAIN PAGE ─── */
export default function WorkflowPage() {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const GridBackground = () => (<div className="pointer-events-none fixed inset-0 z-0"><div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px)", backgroundSize: "160px 100%" }} /></div>);

    return (
        <div className="relative min-h-screen bg-[#FAFAFA] text-text selection:bg-primary/20">
            <CustomCursor /><Header initialDark={true} /><ProjectSmartBar /><GridBackground /><VerticalNav sections={SECTION_NAV} />

            {/* ══ HERO ══ */}
            <section className="relative z-10 overflow-hidden">
                <div className="relative px-6 pb-16 pt-32 md:px-12 md:pt-40">
                    <div className="mx-auto max-w-[1280px]">
                        <div className="mb-6 flex items-center gap-3">
                            <Link href="/#work" className="group flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-text"><ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />Back to Work</Link>
                            <span className="h-1 w-1 rounded-full bg-border" /><span className="font-mono text-xs text-primary">UX Research · Academic</span>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                            <div>
                                {/* Institution badge */}
                                <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-white px-3 py-1.5 shadow-smooth">
                                    <Image src="/university-of-maryland-seeklogo.png" alt="University of Maryland" width={90} height={18} className="rounded-sm" />
                                    <span className="font-mono text-[11px] font-medium text-text-secondary"> · College Park, MD</span>
                                </div>

                                <h1 className="mb-6 font-manrope text-5xl font-medium leading-[1.05] tracking-tight text-text md:text-7xl lg:text-[5rem]">
                                    Faculty Workload<br /><span className="text-primary">Management Research.</span>
                                </h1>
                                <p className="max-w-xl font-mono text-base leading-relaxed text-text-secondary md:text-lg">
                                    We interviewed <RecruiterHighlight>8 faculty members</RecruiterHighlight> and ran <RecruiterHighlight>5 participatory design sessions</RecruiterHighlight> to understand how university professors manage competing responsibilities across teaching, research, and service, and what a better support system could look like.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6">
                                <StatItem value="8" label="Faculty members interviewed" />
                                <StatItem value="120+" label="Data points collected" />
                                <StatItem value="5" label="Participatory design sessions" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12">
                    <div className="grid gap-8 border-t border-border/40 py-10 md:grid-cols-4">
                        <DetailRow label="Role" value="UX Researcher (Interviewer & Note-taker)" />
                        <DetailRow label="Team" value="Pradeep, Hitarthi, Mansi, Saumya, Hansika" />
                        <DetailRow label="Timeline" value="Spring 2025" />
                        <DetailRow label="Institution" value="University of Maryland, iSchool" />
                    </div>
                </div>
            </section>

            {/* ══ 00: CONTEXT ══ */}
            <section id="wf-context" className="relative z-10 py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="00 / CONTEXT" title="Understanding the problem space." />
                    <Fade><div className="space-y-5 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">Faculty members at research universities juggle an extraordinary range of responsibilities, from delivering lectures and mentoring students, to publishing research, sitting on committees, advising on policy, and preparing for promotion reviews. Despite the complexity, most rely on a patchwork of disconnected tools: personal calendars, sticky notes, spreadsheets, email threads, and mental bookkeeping.</p>
                        <p className="font-mono text-base leading-relaxed text-text-secondary">Our team set out to answer a single research question: <strong className="font-medium text-text">How do university faculty members manage and prioritize their workload across teaching, research, and service?</strong> We wanted to understand not just what tools they use, but how they think about their time, what falls through the cracks, and what kind of system would actually make their lives easier.</p>
                        <p className="font-mono text-base leading-relaxed text-text-secondary">This wasn&apos;t an academic exercise in the abstract. We conducted real interviews with real faculty, observed their workspaces, reviewed their calendars, and co-designed solutions with them. The findings directly informed a set of design recommendations for a tool we call <strong className="font-medium text-text">Workflow</strong>.</p>
                    </div></Fade>
                </div>
            </section>

            {/* ══ FULL-BLEED UMD PHOTO ══ */}
            <section className="relative z-10 h-[50vh] min-h-[400px] overflow-hidden">
                <Image src="/Faculty Dashboard/umd ischool administration real image.png" alt="UMD iSchool" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 md:px-12">
                    <div className="mx-auto max-w-[1000px]">
                        <p className="font-manrope text-2xl font-medium text-white md:text-3xl">&ldquo;We wanted to understand the invisible systems faculty have built for themselves.&rdquo;</p>
                        <p className="mt-2 font-mono text-xs text-white/60">— Research team, initial project brief</p>
                    </div>
                </div>
            </section>

            {/* ══ DESIGN PROCESS METHODOLOGY ══ */}
            <section className="relative z-10 bg-white py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="PROCESS" title="Our research design process." />
                    <Fade><p className="mb-16 max-w-2xl font-mono text-base leading-relaxed text-text-secondary">We followed a structured, iterative research process that moved from understanding the problem space to co-creating solutions with faculty. Each phase built directly on the outputs of the previous phase, ensuring that our final design recommendations were grounded in real data and validated by the people who would use the tool.</p></Fade>
                    <div className="relative">
                        {/* Vertical connector line */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40 hidden md:block" />
                        <div className="space-y-0">
                            {[{
                                step: "01", title: "Research Planning & Study Design",
                                desc: "Defined research questions, established participant recruitment criteria, designed the interview guide around 4 thematic areas, and obtained IRB approval. We aligned with stakeholders on project scope and expected deliverables.",
                                tags: ["Research Question", "IRB Approval", "Interview Guide", "Recruitment"],
                            }, {
                                step: "02", title: "Contextual Interviews",
                                desc: "Conducted semi-structured interviews with 8 faculty members across teaching, research, and director-level roles. Each session lasted 30–60 minutes, with rotating moderator and note-taker roles to reduce observer bias.",
                                tags: ["8 Participants", "Semi-Structured", "30–60 min", "Role Rotation"],
                            }, {
                                step: "03", title: "Interpretation & Affinity Mapping",
                                desc: "Ran team interpretation sessions after each interview to extract atomic insights. Organized 120+ data points into an affinity diagram on Miro, revealing 6 distinct thematic clusters around workload, tools, productivity, and career growth.",
                                tags: ["120+ Data Points", "6 Clusters", "Miro", "Team Synthesis"],
                            }, {
                                step: "04", title: "Journey Maps & Identity Models",
                                desc: "Created a detailed journey map tracing a typical faculty week with emotional highs and lows. Built an identity model mapping the roles, relationships, and institutional dynamics that shape faculty work.",
                                tags: ["Journey Map", "Identity Model", "Emotional Mapping", "Ecosystem View"],
                            }, {
                                step: "05", title: "Participatory Design Sessions",
                                desc: "Facilitated co-design workshops with 5 faculty using FigJam. Activity 1: participants mapped their typical week and annotated pain points. Activity 2: participants assembled their ideal dashboard from modular interface components.",
                                tags: ["5 Sessions", "FigJam", "Timeline Mapping", "Dashboard Co-Design"],
                            }, {
                                step: "06", title: "IA, Concepts & Design Recommendations",
                                desc: "Synthesized all findings into a proposed information architecture. Created low-fidelity sketches from participant feedback, then developed mid-fidelity prototypes (Faculty Navigator 360) with actionable design recommendations.",
                                tags: ["Information Architecture", "Low-Fi Sketches", "Mid-Fi Prototypes", "Recommendations"],
                            }].map((phase, i) => (
                                <motion.div
                                    key={phase.step}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-40px" }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    className="group relative flex gap-6 md:gap-10 pb-12 last:pb-0"
                                >
                                    {/* Step number circle */}
                                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-white font-manrope text-sm font-bold text-primary shadow-sm transition-all duration-300 group-hover:border-primary group-hover:shadow-md">
                                        {phase.step}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 pb-8 border-b border-border/30 last:border-0">
                                        <h3 className="mb-2 font-manrope text-lg font-semibold text-text">{phase.title}</h3>
                                        <p className="mb-4 font-mono text-sm leading-relaxed text-text-secondary">{phase.desc}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {phase.tags.map(tag => (
                                                <span key={tag} className="rounded-full border border-border/50 bg-bg-alt/80 px-2.5 py-0.5 font-mono text-[10px] text-text-muted">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <WhyThisMatters id="recruiter-lens-1" headline="Demonstrates end-to-end ownership of a qualitative research project, from study design through synthesis to actionable design recommendations." points={["Led contextual interviews as both moderator and note-taker across multiple sessions.", "Designed and iterated on a structured interview guide covering 4 thematic areas.", "Synthesized 120+ data points into an affinity diagram with 6 distinct clusters.", "Facilitated participatory design sessions that directly informed product concepts."]} nextHref="#recruiter-lens-2" />

            {/* ══ 01: METHODOLOGY ══ */}
            <section id="wf-methodology" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="01 / METHODOLOGY" title="How we structured the research." />
                    <Fade><div className="mb-12 space-y-5 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">We used a <strong className="font-medium text-text">two-phase mixed-methods approach</strong>. Phase 1 consisted of semi-structured contextual interviews with 8 faculty members. Phase 2 involved participatory design sessions with 5 of those same participants. The two phases were designed to build on each other, interviews surfaced pain points and behaviors, while participatory sessions explored potential solutions.</p>
                        <p className="font-mono text-base leading-relaxed text-text-secondary">Our interview guide was structured around four thematic areas, each designed to progressively deepen our understanding of faculty work. We started broad, asking about daily tasks and routines, then narrowed into specific tool usage, personal goals, and the emotionally charged topic of promotion documentation.</p>
                    </div></Fade>
                    <div className="mb-12">
                        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Design Thinking Framework, Double Diamond</p>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-40px" }} transition={{ duration: 0.5 }} className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-white p-6">
                            <Image src="/Faculty Dashboard/Design-thinking-double-diamond-1024x277.png" alt="Double Diamond Design Thinking Framework" width={1024} height={277} className="w-full h-auto" />
                        </motion.div>
                        <p className="mt-3 font-mono text-xs text-text-muted">Our research followed the Double Diamond framework, diverging to explore the problem space through contextual interviews, converging through affinity mapping, then diverging again in participatory design before converging on validated design recommendations.</p>
                    </div>
                    <Fade><div className="grid gap-5 md:grid-cols-2">
                        {[{ n: "Topic 1", title: "Daily Tasks & Responsibilities", body: "We explored how faculty structure their days, how tasks are assigned, whether they delegate, and what their calendar and workspace organization looks like. This gave us a baseline understanding of workload distribution." },
                        { n: "Topic 2", title: "Tools Used for Workload Management", body: "We asked what tools faculty rely on, from Google Calendar to handwritten lists, what works, what doesn't, and what features they wish existed. We observed tool demonstrations and noted workarounds and duplications." },
                        { n: "Topic 3", title: "Personal & Professional Goals", body: "We discussed long-term career aspirations, how personal commitments impact academic work, how success is measured during evaluations, and whether faculty feel their contributions are adequately recognized." },
                        { n: "Topic 4", title: "Documentation & Promotion Preparation", body: "We explored the promotion review process: what documentation is expected, how it's collected throughout the year, and whether faculty have experienced gaps or frustrations when assembling their dossiers." }
                        ].map(t => (<InsightCard key={t.n} label={t.n}><p className="font-manrope text-sm font-medium text-text mt-1">{t.title}</p><p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">{t.body}</p></InsightCard>))}
                    </div></Fade>
                    <Fade><div className="mt-12 rounded-xl border border-border/50 bg-bg-alt p-6">
                        <p className="font-mono text-xs text-text-secondary"><strong className="font-medium text-text">A note on iteration:</strong> Our original interview guide was significantly longer. After an internal review, we identified overlapping questions, reorganized around thematic clusters, and cut the guide down to a more focused structure. This reduced cognitive fatigue for participants and improved data quality. Similarly, our participatory design plan was initially loosely defined, we refined it after our first two interviews revealed that participants responded well to reflective prompts and visual organization.</p>
                    </div></Fade>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href="https://miro.com/app/board/uXjVIMwuDLA=/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-white px-4 py-2.5 font-mono text-xs font-medium text-text transition-all hover:border-primary/40 hover:shadow-sm"><ExternalLink size={13} className="text-primary" />View Research Guide on Miro</a>
                    </div>
                </div>
            </section>

            {/* ══ 02: PARTICIPANTS ══ */}
            <section id="wf-participants" className="relative z-10 py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="02 / PARTICIPANTS" title="Who we spoke with." />
                    <Fade><div className="mb-10 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">We conducted contextual interviews with <RecruiterHighlight>8 faculty members</RecruiterHighlight> across a range of academic roles, teaching-focused, research-active, leadership, and advisory positions. We used study IDs (A01–H01) to maintain confidentiality. Each team member conducted at least one interview, and roles rotated between interviewer and note-taker to ensure consistency.</p>
                    </div></Fade>
                    <Fade><div className="overflow-x-auto rounded-xl border border-border/50 bg-white">
                        <table className="w-full text-left font-mono text-xs">
                            <thead><tr className="border-b border-border/40 bg-bg-alt/50"><th className="px-5 py-3 font-medium text-text-muted uppercase tracking-widest text-[10px]">ID</th><th className="px-5 py-3 font-medium text-text-muted uppercase tracking-widest text-[10px]">Role Description</th><th className="px-5 py-3 font-medium text-text-muted uppercase tracking-widest text-[10px]">Interviewer</th><th className="px-5 py-3 font-medium text-text-muted uppercase tracking-widest text-[10px]">Note-taker</th></tr></thead>
                            <tbody>
                                {[["A01", "Teaching + Advisor Faculty", "Hitarthi", "Mansi"], ["B01", "Teaching + Director Faculty", "Saumya", "Pradeep"], ["C01", "Teaching Faculty (Remote)", "Mansi", "Saumya"], ["D01", "Director Level Faculty", "Saumya", "Hitarthi"], ["F01", "Research + Teaching Faculty", "Pradeep", "Hitarthi"], ["G01", "Teaching Faculty", "Hansika", "Saumya"], ["H01", "Teaching Faculty", "Hansika", "Pradeep"]].map(([id, role, int_, note]) => (<tr key={id} className="border-b border-border/20 last:border-0"><td className="px-5 py-3 font-medium text-primary">{id}</td><td className="px-5 py-3 text-text-secondary">{role}</td><td className="px-5 py-3 text-text-secondary">{int_}</td><td className="px-5 py-3 text-text-secondary">{note}</td></tr>))}
                            </tbody>
                        </table>
                    </div></Fade>
                    <Fade><p className="mt-6 font-mono text-xs text-text-muted">Five of these participants (C01, D01, F01, G01, H01) also took part in participatory design sessions, where they engaged in weekly timeline mapping and custom dashboard design.</p></Fade>
                </div>
            </section>

            {/* ══ 03: DATA COLLECTION ══ */}
            <section id="wf-data" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="03 / DATA COLLECTION" title="How we captured and organized the data." />
                    <Fade><div className="mb-10 space-y-5 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">Each interview lasted 30–60 minutes and was recorded with participant consent. One team member led the conversation while the other took detailed notes. After each session, we ran interpretation sessions where the full team reviewed recordings to extract atomic insights, individual observations, quotes, and behavioral patterns, which we wrote onto digital affinity notes.</p>
                        <p className="font-mono text-base leading-relaxed text-text-secondary">We collected verbatim transcripts, observational notes, and digital artifacts from participatory sessions (sticky notes, sketches, and user-generated diagrams on FigJam). In total, we generated over <RecruiterHighlight>120 discrete data points</RecruiterHighlight>.</p>
                    </div></Fade>
                    <div className="space-y-8">
                        <MediaPop><div>
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/50 bg-[#F5F5F7]">
                                <Image src="/Faculty Dashboard/120+DATAPOINTSCOLLECTEDVIAINTERVIEWS&PARTICIPATORYDESIGNSESSIONSGRAPHIC.png" alt="120+ data points collected" fill className="object-contain p-6" />
                            </div>
                            <p className="mt-3 font-mono text-xs text-text-muted">Data points overview across interviews and participatory design sessions.</p>
                        </div></MediaPop>
                        <MediaPop delay={0.1}><div>
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/50 bg-[#F5F5F7]">
                                <Image src="/Faculty Dashboard/interpretationsessionnotescreatingaffinitynotes.png" alt="Interpretation session notes" fill className="object-contain p-6" />
                            </div>
                            <p className="mt-3 font-mono text-xs text-text-muted">Creating affinity notes during interpretation sessions.</p>
                        </div></MediaPop>
                    </div>
                </div>
            </section>

            {/* ══ FULL-BLEED PHOTO DIVIDER ══ */}
            <section className="relative z-10 h-[50vh] min-h-[400px] overflow-hidden">
                <Image src="/Faculty Dashboard/pictureduringthewallwalkactivityofourproject.png" alt="Wall walk activity" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 md:px-12">
                    <div className="mx-auto max-w-[1000px]">
                        <p className="font-manrope text-2xl font-medium text-white md:text-3xl">&ldquo;The wall walk helped us see patterns we couldn&apos;t see on screen.&rdquo;</p>
                        <p className="mt-2 font-mono text-xs text-white/60">— During the affinity diagram wall walk activity</p>
                    </div>
                </div>
            </section>

            {/* ══ 04: FINDINGS ══ */}
            <section id="wf-findings" className="relative z-10 py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="04 / FINDINGS" title="What the data told us." />
                    <Fade><div className="mb-10 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">After organizing our 120+ affinity notes, six distinct thematic clusters emerged. Each cluster represents a core dimension of the faculty workload management experience, from how they handle digital tools to how they think about career growth and performance reviews.</p>
                    </div></Fade>
                    <MediaPop><div className="mb-12 relative aspect-[16/8] w-full overflow-hidden rounded-xl border border-border/50 bg-white">
                        <Image src="/Faculty Dashboard/Workflow Affinity Diagram - Complete Affinity Diagram.jpg" alt="Complete Affinity Diagram" fill className="object-contain p-2" />
                    </div></MediaPop>
                    <Fade><div className="mb-10 flex items-center justify-between">
                        <p className="font-mono text-xs text-text-muted">Complete affinity diagram, 120+ data points organized into 6 thematic clusters on Miro.</p>
                        <a href="https://miro.com/app/board/uXjVIMwuDLA=/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-white px-4 py-2.5 font-mono text-xs font-medium text-text transition-all hover:border-primary/40 hover:shadow-sm shrink-0 ml-4"><ExternalLink size={13} className="text-primary" />View on Miro</a>
                    </div></Fade>
                    <Fade><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {[{ img: "Workflow Affinity Diagram - workload.jpg", title: "Workload Distribution", desc: "Faculty struggle with the sheer volume and variety of tasks. Service work is often invisible but consumes significant time." },
                        { img: "Workflow Affinity Diagram - Affinitymapping_DigitalToolUsage.jpg", title: "Digital Tool Usage", desc: "Faculty use 4–7 disconnected tools daily. No single system provides the overview they need." },
                        { img: "Workflow Affinity Diagram - Productivity.jpg", title: "Productivity Patterns", desc: "Deep work happens in early mornings or late nights. Meetings fragment the day and reduce output." },
                        { img: "Workflow Affinity Diagram - Performance Review.jpg", title: "Performance Reviews", desc: "Faculty find it stressful to assemble promotion evidence retroactively. They wish they tracked it continuously." },
                        { img: "Workflow Affinity Diagram - Personal & Professional growth objectives.jpg", title: "Growth Objectives", desc: "Long-term goals often take a back seat to urgent daily tasks. Faculty want a system that keeps goals visible." },
                        { img: "Workflow Affinity Diagram - Tool usage and frustrations.jpg", title: "Tool Frustrations", desc: "Workarounds and manual duplication are common. Faculty want integration, not another standalone tool." }
                        ].map(c => (
                            <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-40px" }} className="overflow-hidden rounded-xl border border-border/50 bg-white" whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F5F5F7]"><Image src={`/Faculty Dashboard/${c.img}`} alt={c.title} fill className="object-contain p-2" /></div>
                                <div className="p-5"><p className="font-manrope text-sm font-medium text-text">{c.title}</p><p className="mt-1 font-mono text-xs leading-relaxed text-text-muted">{c.desc}</p></div>
                            </motion.div>))}
                    </div></Fade>
                </div>
            </section>

            {/* ══ 05: JOURNEY MAP ══ */}
            <section id="wf-journey" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="05 / SYNTHESIS MODELS" title="Making sense of faculty workflows." />
                    <Fade><div className="mb-10 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">Beyond the affinity diagram, we created two synthesis models to visualize our findings from different perspectives. The journey map traces a typical faculty member&apos;s week, highlighting emotional highs and lows. The identity model captures the roles, responsibilities, and social relationships that shape how faculty think about their work.</p>
                    </div></Fade>
                    <MediaPop><div className="mb-8"><p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Journey Map, A Typical Faculty Week</p><div className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-white"><Image src="/Faculty Dashboard/Affinity Notes INST 710 - Journey Map 1.png" alt="Journey Map" width={1800} height={900} className="w-full h-auto" /></div></div></MediaPop>
                    <MediaPop><div><p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">Identity Model, Faculty Roles & Relationships</p><div className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-white"><Image src="/Faculty Dashboard/Affinity Notes INST 710 - Identity model 1.png" alt="Identity Model" width={1200} height={800} className="w-full h-auto" /></div></div></MediaPop>
                </div>
            </section>

            {/* ══ 06: PARTICIPATORY DESIGN ══ */}
            <section id="wf-participatory" className="relative z-10 py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="06 / PARTICIPATORY DESIGN" title="Co-creating solutions with faculty." />
                    <Fade><div className="mb-12 space-y-5 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">After completing the contextual interviews, we facilitated participatory design sessions with 5 faculty members. These sessions were designed to move beyond understanding problems, we wanted faculty to actively shape solutions.</p>
                        <p className="font-mono text-base leading-relaxed text-text-secondary">Each session included two structured activities conducted through FigJam. We walked participants through the tools, adapted the pace to their comfort level, and kept prompts intentionally open-ended to encourage diverse input.</p>
                    </div></Fade>
                    <Fade><div className="grid gap-8 md:grid-cols-2">
                        <DeckCard
                            label="Activity 1"
                            title="Weekly Timeline Mapping"
                            description="Participants mapped their actual week (Mon–Sun) on a blank timeline, noting activities, tools used, emotional states, and moments of chaos or organization. They marked where they felt supported and where tools failed them."
                            images={ACTIVITY1_IMAGES}
                            onImageClick={setLightboxSrc}
                        />
                        <DeckCard
                            label="Activity 2"
                            title="Design Your Dashboard"
                            description="Faculty were given interface cards (task list, calendar, notes, recognition wall, goal tracker, promotion timeline) and asked to assemble or sketch their ideal dashboard. This revealed what features matter most and how they want to track success."
                            images={ACTIVITY2_IMAGES}
                            onImageClick={setLightboxSrc}
                        />
                    </div></Fade>
                </div>
                {/* Infinite scroll loop, edge-to-edge */}
                <div className="mt-16">
                    <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted">All Participatory Design Responses</p>
                    <InfiniteImageLoop images={ALL_PARTICIPATORY_IMAGES} onImageClick={setLightboxSrc} />
                </div>
            </section>

            <WhyThisMatters id="recruiter-lens-2" headline="The ability to facilitate participatory design sessions, transitioning from passive observation to active co-creation with stakeholders, demonstrates advanced research maturity." points={["Ran both structured interviews and open-ended co-design workshops with the same participants.", "Iterated on the participatory design plan based on early interview findings, not a fixed template.", "Synthesized qualitative data into actionable information architecture and feature priorities."]} prevHref="#recruiter-lens-1" />

            {/* ══ 07: INFORMATION ARCHITECTURE ══ */}
            <section id="wf-ia" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="07 / INFORMATION ARCHITECTURE" title="Structuring the Workflow tool." />
                    <Fade><div className="mb-10 max-w-2xl"><p className="font-mono text-base leading-relaxed text-text-secondary">Based on our synthesis, affinity clusters, journey maps, and participatory design outputs, we developed an information architecture for the Workflow platform. The IA reflects the mental models faculty actually use, not an administratively imposed structure.</p></div></Fade>
                    <Fade><div className="rounded-xl border border-border/50 bg-white p-8">
                        <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Proposed IA, Workflow Faculty Dashboard</p>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[{ section: "Dashboard Home", items: ["Today's Focus card", "Quick-add activity log", "Weekly calendar heatmap", "Active tasks by category", "Upcoming deadlines"] },
                            { section: "Activity Diary", items: ["Daily log with category tags", "Voice-to-text entry", "Auto-categorization (Teaching/Research/Service)", "Mood & energy check-in", "Linked document attachments"] },
                            { section: "Promotion Tracker", items: ["Evidence upload & organization", "Timeline progress (Submitted → Review → Decision)", "Category-based evidence filing", "Gap analysis alerts", "Exportable dossier builder"] },
                            { section: "Goals & Milestones", items: ["Long-term goal setting", "Quarterly milestone tracking", "Progress visualization", "Goal-task alignment view", "Reflection prompts"] },
                            { section: "AI Insights", items: ["Workload balance analysis", "Burnout risk indicators", "Suggested time blocks", "Pattern recognition", "Peer benchmarking (anonymized)"] },
                            { section: "Weekly Reflection", items: ["Guided end-of-week review", "Accomplishment highlights", "Next-week priorities", "Emotional check-in (emoji scale)", "Exportable summary"] }
                            ].map(s => (<div key={s.section} className="rounded-lg border border-border/40 bg-bg-alt/50 p-5"><p className="mb-3 font-manrope text-sm font-semibold text-text">{s.section}</p><ul className="space-y-1.5">{s.items.map(item => (<li key={item} className="flex items-start gap-2 font-mono text-xs text-text-muted"><span className="mt-0.5 text-primary/40">·</span>{item}</li>))}</ul></div>))}
                        </div>
                    </div></Fade>
                </div>
            </section>

            {/* ══ 08: LOW-FI + MID-FI CONCEPTS ══ */}
            <section id="wf-concepts" className="relative z-10 py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="08 / DESIGN CONCEPTS" title="From paper sketches to mid-fidelity prototypes." />
                    <Fade><div className="mb-12 space-y-5 max-w-2xl">
                        <p className="font-mono text-base leading-relaxed text-text-secondary">Based on the color-tagged feedback from participatory sessions and our affinity clusters, we ideated on five distinct feature concepts. These started as paper sketches informed by real participant input, then evolved into mid-fidelity mockups.</p>
                    </div></Fade>
                    <MediaPop><div className="mb-12"><div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/50 bg-[#F5F5F7]"><Image src="/Faculty Dashboard/colortaggedfeedbackandlowfidelitymockupsonpaper.png" alt="Color-tagged feedback and low-fi mockups" fill className="object-contain p-4" /></div><p className="mt-3 text-center font-mono text-xs text-text-muted">Color-tagged feedback from participatory sessions informing our initial sketches.</p></div></MediaPop>
                    <Fade><p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Low-Fidelity Concept Explorations</p></Fade>
                    <Fade><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[{ img: "lowfidmockupideationbasedonfeedback_idea1dashboardpage1.png", title: "Dashboard Overview" }, { img: "lowfidmockupideationbasedonfeedback_idea2diarypagepage2.png", title: "Activity Diary" }, { img: "lowfidmockupideationbasedonfeedback_idea4genaisupportpage3.png", title: "Gen AI Support" }, { img: "lowfidmockupideationbasedonfeedback_idea3personalisedrecommendationspage4.png", title: "Personalized Recommendations" }, { img: "lowfidmockupideationbasedonfeedback_idea5personalityspecificdashboardpage5.png", title: "Personality-Specific Dashboard" }].map(c => (
                            <MediaPop key={c.title}><div className="overflow-hidden rounded-xl border border-border/50 bg-white"><div className="relative aspect-[4/3] bg-[#F5F5F7]"><Image src={`/Faculty Dashboard/${c.img}`} alt={c.title} fill className="object-contain p-2" /></div><div className="px-5 py-3"><p className="font-mono text-xs font-medium text-text">{c.title}</p></div></div></MediaPop>))}
                    </div></Fade>
                    <Fade><p className="mt-10 mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">Mid-Fidelity Prototypes, Faculty Navigator 360</p></Fade>
                    <Fade><div className="grid gap-4 md:grid-cols-2">
                        {[{ img: "faculty navigator 360 concept with personalized dashboard homepage_macbook mockup.png", title: "Homepage Dashboard" }, { img: "faculty navigator 360 concept with personalized dashboard diarylogpage_macbook mockup.png", title: "Diary Log Page" }, { img: "faculty navigator 360 concept with personalized dashboard documentspage_macbook mockup.png", title: "Documents Page" }, { img: "faculty navigator 360 concept onboarding plan_macbook mockup.png", title: "Onboarding Plan" }].map(c => (
                            <MediaPop key={c.title}><div className="overflow-hidden rounded-xl border border-border/50 bg-white"><div className="relative aspect-[16/10] bg-[#F0F0F2]"><Image src={`/Faculty Dashboard/${c.img}`} alt={c.title} fill className="object-contain p-4" /></div><div className="px-5 py-3"><p className="font-mono text-xs font-medium text-text">{c.title}</p></div></div></MediaPop>))}
                    </div></Fade>
                </div>
            </section>

            {/* ══ FULL-BLEED PHOTO DIVIDER ══ */}
            <section className="relative z-10 h-[50vh] min-h-[400px] overflow-hidden">
                <Image src="/Faculty Dashboard/mypictureduringthewallwalkactivityofourproject.png" alt="Wall walk activity" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 md:px-12">
                    <div className="mx-auto max-w-[1000px]">
                        <p className="font-manrope text-2xl font-medium text-white md:text-3xl">&ldquo;Every sticky note is a real person&apos;s frustration with an invisible system.&rdquo;</p>
                        <p className="mt-2 font-mono text-xs text-white/60">— During the affinity mapping wall walk</p>
                    </div>
                </div>
            </section>

            {/* ══ 09: HI-FI PLACEHOLDER ══ */}
            <section id="wf-hifi" className="relative z-10 border-t border-border/40 bg-white py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="09 / HIGH-FIDELITY DESIGN" title="Bringing Workflow to life." />
                    <Fade><div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-bg-alt/30 py-20 px-8 text-center">
                        <Sparkles size={32} className="mb-4 text-primary/30" />
                        <p className="font-manrope text-xl font-medium text-text">High-fidelity mockups coming soon.</p>
                        <p className="mt-2 max-w-md font-mono text-xs text-text-muted">The final high-fidelity designs are currently being developed based on the research findings and design concepts above. This section will be updated with the polished UI for the Workflow platform.</p>
                    </div></Fade>
                </div>
            </section>

            {/* ══ 10: OUTCOMES ══ */}
            <section id="wf-outcome" className="relative z-10 py-24 md:py-32">
                <div className="mx-auto max-w-[1000px] px-6 md:px-12">
                    <SectionHeading number="10 / REFLECTIONS" title="What this research taught us." />
                    <Fade><div className="grid grid-cols-1 gap-12 md:grid-cols-3 mb-16">
                        <StatItem value="8" label="Faculty members interviewed" />
                        <StatItem value="120+" label="Discrete data points synthesized" />
                        <StatItem value="6" label="Thematic clusters identified" />
                    </div></Fade>
                    <Fade><div className="grid gap-5 md:grid-cols-3">
                        {[{ title: "Faculty labor is invisible by design", body: "Service work, mentoring, and committee participation consume significant time but are systematically undervalued in promotion reviews. Any support tool must make this labor visible." },
                        { title: "Tools fail because they fragment attention", body: "Faculty don't need another app, they need integration. The most common complaint was toggling between 5–7 disconnected tools just to understand their own week." },
                        { title: "Co-design produces better outcomes", body: "The participatory design sessions generated insights that interviews alone could not. When you put the design tools in the hands of the people who will use them, the priorities become self-evident." }
                        ].map(r => (<InsightCard key={r.title} label="Reflection"><p className="mt-1 font-manrope text-sm font-medium text-text">{r.title}</p><p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">{r.body}</p></InsightCard>))}
                    </div></Fade>

                    {/* UMD iSchool photo */}
                    <MediaPop><div className="mt-20">
                        <p className="mb-5 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted">University of Maryland - College of Information Studies</p>
                        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-border grayscale transition-all duration-700 hover:grayscale-0">
                            <Image src="/Faculty Dashboard/UniversityofMaryland ischool.jpeg" alt="University of Maryland iSchool" fill className="object-cover" />
                        </div>
                    </div></MediaPop>
                </div>
            </section>

            <Footer />

            {/* ══ LIGHTBOX ══ */}
            <AnimatePresence>
                {lightboxSrc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
                        onClick={() => setLightboxSrc(null)}
                    >
                        <button className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" onClick={() => setLightboxSrc(null)}><X size={20} /></button>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                            <Image src={lightboxSrc} alt="Full size view" width={1400} height={900} className="h-auto max-h-[85vh] w-auto object-contain" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
