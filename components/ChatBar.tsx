"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Brain,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import SparkIcon from "./SparkIcon";
import { useRecruiter } from "@/lib/recruiter-context";
import RecruiterToggle from "./RecruiterToggle";
import {
  CHAT_PLACEHOLDERS,
  RECRUITER_PLACEHOLDER,
  QUICK_ACTIONS_GENERAL,
  QUICK_ACTIONS_RECRUITER,
  SKILL_PILLS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ChatResponse } from "@/types";

/* ── Rich text renderer — **bold** segments become highlighted chips ── */
function RichText({ text, recruiter }: { text: string; recruiter: boolean }) {
  // Strip em-dashes client-side too, in case any sneak through
  const clean = text.replace(/—/g, ",");
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          return (
            <mark
              key={i}
              className={cn(
                "rounded-md px-1.5 py-0.5 font-semibold not-italic",
                recruiter
                  ? "bg-violet-100/80 text-violet-700"
                  : "bg-primary/10 text-primary"
              )}
            >
              {inner}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ChatBar() {
  const { isRecruiterMode } = useRecruiter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [input, setInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Typing animation
  useEffect(() => {
    if (isRecruiterMode || isExpanded) {
      setPlaceholder(isRecruiterMode ? RECRUITER_PLACEHOLDER : "");
      return;
    }
    const currentPhrase = CHAT_PLACEHOLDERS[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setPlaceholder(currentPhrase.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentPhrase.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((p) => (p + 1) % CHAT_PLACEHOLDERS.length);
        }
      }
    }, isDeleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, isRecruiterMode, isExpanded]);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isExpanded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsExpanded(false); };
    if (isExpanded) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) { setResponse(null); setError(null); }
  }, [isExpanded]);

  // Auto-expand when recruiter mode is enabled
  useEffect(() => {
    if (isRecruiterMode) {
      setIsExpanded(true);
    }
  }, [isRecruiterMode]);

  const toggleExpanded = useCallback(() => setIsExpanded((v) => !v), []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          mode: isRecruiterMode ? "recruiter" : "general",
          selectedSkills,
          conversationHistory: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to get response");
      const data: ChatResponse = await res.json();
      setResponse(data);
    } catch {
      setError("Unable to connect to the AI assistant. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, isRecruiterMode, selectedSkills]);

  const quickActions = isRecruiterMode ? QUICK_ACTIONS_RECRUITER : QUICK_ACTIONS_GENERAL;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: 1.2,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-3rem)] max-w-[640px] -translate-x-1/2"
      data-no-cursor
    >
      {/* ── Backdrop (click outside to close) ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[-1] bg-transparent backdrop-blur-[2px]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Unified outer frame (recruiter) or plain wrapper (general) ── */}
      <div
        className={cn(
          isRecruiterMode
            ? "relative rounded-2xl border border-white/50 bg-white/20 p-1.5 shadow-smooth-lg backdrop-blur-2xl"
            : ""
        )}
      >
        {/* Ambient glow behind the chat — recruiter only */}
        {isRecruiterMode && <div className="chat-glow" />}
        {/* ── Expanded panel ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 12, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: 12, scaleY: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{ transformOrigin: "bottom" }}
              className="mb-1.5"
            >
              <div
                className={cn(
                  "flex max-h-[70vh] flex-col overflow-hidden",
                  isRecruiterMode
                    ? "aurora-fill rounded-xl shadow-smooth"
                    : "rounded-xl border border-white/20 bg-white/80 shadow-smooth-lg backdrop-blur-2xl"
                )}
              >
                {/* Panel Header */}
                <div className={cn(
                  "flex items-center justify-between px-5 py-4",
                  isRecruiterMode
                    ? "border-b border-violet-200/40"
                    : "border-b border-border-light/50"
                )}>
                  <div>
                    <h2 className="font-display text-base font-bold text-text">
                      {isRecruiterMode ? "AI Job Match Analysis" : "Chat with Pradeep's AI"}
                    </h2>
                    <p className="mt-0.5 font-mono text-[11px] text-text-muted">
                      {isRecruiterMode
                        ? "Paste a job description to see how I match"
                        : "Ask anything about my work, skills, or experience"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RecruiterToggle size="sm" />
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-violet-100/60 hover:text-text"
                      aria-label="Collapse chat"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {/* Skill pills — recruiter only */}
                  {isRecruiterMode && (
                    <div className="mb-4">
                      <p className="mb-2 font-mono text-[11px] font-medium text-text-muted">
                        Highlight Specific Skills (Optional)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SKILL_PILLS.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={cn(
                              "rounded-full px-3 py-1 font-mono text-[10px] font-medium transition-all duration-200",
                              selectedSkills.includes(skill)
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-white/70 text-text-secondary ring-1 ring-violet-200/60 hover:bg-violet-50 hover:text-violet-700"
                            )}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  {!response && !loading && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => setInput(action.prompt)}
                          className={cn(
                            "rounded-full px-3 py-1.5 font-mono text-[10px] font-medium transition-all duration-200",
                            isRecruiterMode
                              ? "border border-violet-200/50 bg-white/60 text-text-secondary hover:border-violet-400/50 hover:text-violet-700"
                              : "border border-border/60 bg-white/60 text-text-secondary hover:border-primary/20 hover:text-primary"
                          )}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Loading */}
                  {loading && (
                    <div className="flex flex-col items-center gap-2 py-6">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        isRecruiterMode ? "bg-violet-100/80" : "bg-primary/8"
                      )}>
                        <Brain size={20} className={cn(
                          "animate-pulse",
                          isRecruiterMode ? "text-violet-600" : "text-primary"
                        )} />
                      </div>
                      <p className="font-mono text-[11px] font-medium text-text-muted">
                        {isRecruiterMode ? "Analyzing job match..." : "Thinking..."}
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 rounded-lg border border-red-200/60 bg-red-50/50 p-3"
                    >
                      <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
                      <div>
                        <p className="text-xs text-red-700">{error}</p>
                        <button
                          onClick={handleSubmit}
                          className="mt-1 font-mono text-[11px] font-semibold text-red-600 underline hover:text-red-700"
                        >
                          Try again
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Response */}
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-3"
                    >
                      {response.type === "job_match" && response.matchPercentage !== undefined ? (
                        <div className={cn(
                          "rounded-lg border p-4",
                          isRecruiterMode
                            ? "border-violet-200/50 bg-white/40"
                            : response.matchPercentage >= 80
                              ? "border-success/20 bg-success/5"
                              : response.matchPercentage >= 60
                                ? "border-yellow-300/20 bg-yellow-50/30"
                                : "border-border bg-bg-alt"
                        )}>
                          <div className="mb-3 flex items-center gap-2.5">
                            <SparkIcon size={16} />
                            <span className="font-display text-2xl font-bold text-text">
                              {response.matchPercentage}%
                            </span>
                            <span className={cn(
                              "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold",
                              isRecruiterMode ? "bg-violet-100 text-violet-700" : "bg-success/10 text-success"
                            )}>
                              {response.matchLevel}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-xs leading-relaxed text-text-secondary">
                            {response.content.split("\n").map((line, i) =>
                              line.trim() ? (
                                <p key={i}>
                                  <RichText text={line} recruiter={isRecruiterMode} />
                                </p>
                              ) : null
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "rounded-lg border p-4",
                          isRecruiterMode ? "border-violet-200/50 bg-white/40" : "border-border/50 bg-bg-alt/50"
                        )}>
                          <div className="space-y-1.5 text-xs leading-relaxed text-text-secondary">
                            {response.content.split("\n").map((line, i) =>
                              line.trim() ? (
                                <p key={i}>
                                  <RichText text={line} recruiter={isRecruiterMode} />
                                </p>
                              ) : null
                            )}
                          </div>
                        </div>
                      )}

                      {/* Follow-up suggestion pills */}
                      {response.followUps && response.followUps.length > 0 && (
                        <div>
                          <p className="mb-2 font-mono text-[10px] text-text-muted">Ask me more</p>
                          <div className="flex flex-wrap gap-1.5">
                            {response.followUps.map((q, i) => (
                              <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07, duration: 0.25 }}
                                onClick={() => {
                                  setInput(q);
                                  setResponse(null);
                                  setTimeout(() => textareaRef.current?.focus(), 50);
                                }}
                                className={cn(
                                  "rounded-full px-3 py-1.5 font-mono text-[10px] font-medium transition-all duration-200 text-left",
                                  isRecruiterMode
                                    ? "border border-violet-200/60 bg-white/60 text-violet-700 hover:bg-violet-50 hover:border-violet-400/50"
                                    : "border border-border/60 bg-white/60 text-text-secondary hover:border-primary/30 hover:text-primary"
                                )}
                              >
                                {q}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Input area */}
                <div className={cn(
                  "px-5 py-3",
                  isRecruiterMode
                    ? "border-t border-violet-200/40 bg-white/50 backdrop-blur-sm"
                    : "border-t border-border-light/50"
                )}>
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder={
                        isRecruiterMode ? "Paste a job description..." : "Type your question..."
                      }
                      rows={2}
                      className={cn(
                        "flex-1 resize-none rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:outline-none",
                        isRecruiterMode
                          ? "border border-violet-200/60 bg-white/70 text-text placeholder:text-text-muted focus:border-violet-400/50"
                          : "border border-border/50 bg-white/60 text-text placeholder:text-text-muted focus:border-primary/30"
                      )}
                      style={{ minHeight: 44, maxHeight: 120 }}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!input.trim() || loading}
                      className={cn(
                        "flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
                        isRecruiterMode
                          ? "bg-violet-600 hover:bg-violet-700"
                          : "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Collapsed bar ── */}
        <button
          onClick={toggleExpanded}
          className={cn(
            "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-all duration-300",
            isRecruiterMode
              ? "rounded-xl bg-white/60 backdrop-blur-sm"
              : cn(
                "rounded-xl border shadow-smooth border-border/60 bg-white/90 backdrop-blur-xl",
                isExpanded && "rounded-t-none border-t-0"
              )
          )}
        >
          <MessageCircle
            size={18}
            className={cn("shrink-0", isRecruiterMode ? "text-violet-500" : "text-primary")}
          />
          <span className={cn(
            "flex-1 font-mono text-xs",
            isRecruiterMode ? "text-text-muted" : "text-text-muted"
          )}>
            {isExpanded
              ? isRecruiterMode ? "AI Job Match Analyzer" : "Chat with Pradeep's AI"
              : placeholder}
            {!isRecruiterMode && !isExpanded && (
              <span className="typing-cursor ml-px text-primary">|</span>
            )}
          </span>
          {isRecruiterMode && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[10px] font-medium text-violet-700">
              Recruiter
            </span>
          )}
          {isExpanded ? (
            <X size={14} className="shrink-0 text-text-muted" />
          ) : (
            <MessageCircle size={14} className="shrink-0 text-text-muted" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
