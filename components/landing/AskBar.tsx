"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import AgentOrb from "@/components/agent/AgentOrb";
import { immersion } from "@/components/map/immersion";

// The landing's AI chat: one input, centred at the foot of the screen, under
// the statement. Answers open upward in a frosted panel over the map. Same
// backend as the home page's ChatBar: POST /api/chat {message, mode}, which
// returns {type:"general", content, followUps} or, for a pasted job
// description, {type:"job_match", content, matchPercentage, matchLevel}.

const EASE = [0.2, 0.6, 0.35, 1] as const;

// Rotating placeholder: real questions, so the input explains itself.
const PROMPTS = [
  "Ask how I led Jeevy OS…",
  "Ask what Xylem AutoPilot automates…",
  "Ask why I design for conflict regions…",
  "Ask how I work with engineering…",
  "Paste a job description to see the fit…",
];

// Long pastes are job descriptions: answer with a fit score instead.
const JD_LENGTH = 350;

type Turn =
  | { q: string; state: "loading" }
  | { q: string; state: "error" }
  | { q: string; state: "done"; type: "general"; content: string; followUps: string[] }
  | { q: string; state: "done"; type: "job_match"; content: string; pct: number; level: string };

/** Search glass with a four-point sparkle at its top-right. */
export function SparkleSearch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="13.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M14.8 18.3 20 23.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.6.5c.42 2.5 1.6 3.7 4.1 4.1-2.5.42-3.68 1.6-4.1 4.1-.42-2.5-1.6-3.68-4.1-4.1 2.5-.42 3.68-1.6 4.1-4.1Z" fill="currentColor" />
    </svg>
  );
}

/** **bold** → highlighted chip; everything else plain. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <span key={i} className="rounded-[3px] bg-black/[0.06] px-1 py-px font-semibold text-black">
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Answer({ turn, onAsk }: { turn: Turn; onAsk: (q: string) => void }) {
  if (turn.state === "loading") {
    return (
      <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-black/50"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    );
  }
  if (turn.state === "error") {
    return <p className="text-[14px] text-black/55">That didn&apos;t go through. Try again, or email pyellapu@terpmail.umd.edu.</p>;
  }
  const paras = turn.content.split(/\n+/).filter((l) => l.trim());
  return (
    <div>
      {turn.type === "job_match" && (
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-black">{turn.pct}%</span>
          <span className="text-[13px] font-medium tracking-[-0.02em] text-black/55">{turn.level}</span>
        </div>
      )}
      <div className="space-y-2 text-[15px] leading-relaxed tracking-[-0.015em] text-black/80">
        {paras.map((p, i) => (
          <p key={i}>
            <Rich text={p.replace(/^[-•]\s*/, "")} />
          </p>
        ))}
      </div>
      {turn.type === "general" && turn.followUps.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {turn.followUps.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onAsk(f)}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-left text-[12.5px] font-medium tracking-[-0.015em] text-black/70 transition-colors hover:border-black/25 hover:text-black"
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AskBar({ shown, onActive }: { shown: boolean; onActive?: (active: boolean) => void }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = focused || open;

  // The agent is created a beat after the bar appears, in idle time.
  const [orbReady, setOrbReady] = useState(false);
  useEffect(() => {
    if (!shown || orbReady) return;
    let idle = 0;
    const t = window.setTimeout(() => {
      const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1));
      idle = ric(() => setOrbReady(true)) as number;
    }, 1400);
    return () => {
      window.clearTimeout(t);
      window.cancelIdleCallback?.(idle);
    };
  }, [shown, orbReady]);
  useEffect(() => onActive?.(active), [active, onActive]);

  // While the panel is open the scene holds still; its own scroll still works.
  useEffect(() => {
    if (!open) {
      if (immersion.get().detail === "chat") immersion.setDetail(null);
      return;
    }
    immersion.setDetail("chat");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (value || focused) return;
    const id = setInterval(() => setPrompt((p) => (p + 1) % PROMPTS.length), 3200);
    return () => clearInterval(id);
  }, [value, focused]);

  // Grow with the text, up to five lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 5 * 22 + 4)}px`;
  }, [value]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const ask = async (q: string) => {
    const message = q.trim();
    if (!message) return;
    setValue("");
    setOpen(true);
    const jd = message.length >= JD_LENGTH;
    const i = turns.length;
    setTurns((t) => [...t, { q: message, state: "loading" }]);
    const settle = (turn: Turn) => setTurns((t) => t.map((x, j) => (j === i ? turn : x)));
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode: jd ? "recruiter" : "general" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      settle(
        d.type === "job_match"
          ? { q: message, state: "done", type: "job_match", content: d.content ?? "", pct: d.matchPercentage ?? 0, level: d.matchLevel ?? "" }
          : { q: message, state: "done", type: "general", content: d.content ?? "", followUps: d.followUps ?? [] },
      );
    } catch {
      settle({ q: message, state: "error" });
    }
  };

  const ready = value.trim().length > 0;
  const isJd = value.trim().length >= JD_LENGTH;

  return (
    <motion.div
      className={`fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 sm:bottom-8 ${shown ? "" : "pointer-events-none"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 12 }}
      transition={{ duration: 0.7, ease: EASE, delay: shown ? 0.25 : 0 }}
    >
      <div className="relative w-full max-w-[640px]">
        {/* Answers open upward from the input, over the map. */}
        <AnimatePresence>
          {open && turns.length > 0 && (
            <motion.div
              key="panel"
              data-own-scroll
              className="absolute inset-x-0 bottom-full mb-3 overflow-hidden rounded-[18px] border border-black/[0.08] bg-white/85 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3">
                <span className="flex items-center gap-2 text-[12px] font-semibold tracking-[-0.01em] text-black/50">
                  <SparkleSearch className="h-3.5 w-3.5" />
                  Ask Pradeep
                </span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close answers" className="text-[18px] leading-none text-black/40 hover:text-black">
                  ×
                </button>
              </div>
              <div ref={scrollRef} data-own-scroll className="max-h-[min(58vh,560px)] space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
                {turns.map((t, i) => (
                  <div key={i}>
                    <p className="mb-2 line-clamp-2 text-[12.5px] font-semibold tracking-[-0.015em] text-black/45">{t.q}</p>
                    <Answer turn={t} onAsk={ask} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focused or answering, the border beam runs round the input. */}
        <BorderBeam active={active} theme="light" colorVariant="colorful" size="md" borderRadius={18} brightness={1.6} strength={1} duration={3}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(value);
            }}
            className={`flex items-end gap-3 rounded-[18px] border bg-white/90 py-2.5 pl-4 pr-2.5 backdrop-blur-xl transition-[box-shadow,border-color] duration-300 ${
              active
                ? "border-black/10 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)]"
                : "border-black/[0.08] shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)]"
            }`}
          >
            {/* The agent, in place of a search icon. */}
            <span className="-my-2 -ml-2 shrink-0 self-end">
              {/* Created once the landing has settled, so compiling its glass
                  shader never lands on the intro's hand-over. */}
              {orbReady ? (
                <AgentOrb size={48} mood={turns.some((t) => t.state === "loading") ? "thinking" : focused ? "listening" : "idle"} />
              ) : (
                <span className="grid h-12 w-12 place-items-center">
                  {/* CSS stand-in: the orb's look, until the 3D one takes over. */}
                  <span className="h-8 w-8 rounded-full border border-[#9fc1d6]/60 bg-[radial-gradient(circle_at_50%_45%,#8fe4ff_0,#6edcff_38%,#ffffff_42%)]" />
                </span>
              )}
            </span>
            <div className="relative min-w-0 flex-1">
              <textarea
                ref={inputRef}
                rows={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => {
                  setFocused(true);
                  if (turns.length) setOpen(true);
                }}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(value);
                  }
                }}
                aria-label="Ask about my work"
                // The global :focus-visible ring is unlayered CSS, which beats
                // Tailwind's layered utilities: turn it off inline. The beam
                // round the input is the focus state instead.
                style={{ outline: "none" }}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                className="block w-full resize-none bg-transparent py-[7px] text-[15px] leading-[22px] tracking-[-0.015em] text-black"
              />
              {!value && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden py-[7px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={focused ? "focused" : prompt}
                      className="block truncate text-[15px] leading-[22px] tracking-[-0.015em] text-black/40"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      {focused ? "Ask about my work, or paste a job description" : PROMPTS[prompt]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>
            {isJd && <span className="mb-[9px] hidden shrink-0 text-[11px] font-semibold text-black/45 sm:block">Job fit</span>}
            <button
              type="submit"
              disabled={!ready}
              aria-label="Ask"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-colors ${ready ? "bg-black text-white" : "bg-black/[0.06] text-black/35"}`}
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </BorderBeam>
      </div>
    </motion.div>
  );
}
