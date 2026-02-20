"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Brain,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useRecruiter } from "@/lib/recruiter-context";
import RecruiterToggle from "./RecruiterToggle";
import {
  QUICK_ACTIONS_GENERAL,
  QUICK_ACTIONS_RECRUITER,
  SKILL_PILLS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ChatResponse } from "@/types";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { isRecruiterMode } = useRecruiter();
  const [input, setInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setResponse(null);
      setError(null);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
      setError(
        "Unable to connect to the AI assistant. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [input, loading, isRecruiterMode, selectedSkills]);

  const quickActions = isRecruiterMode
    ? QUICK_ACTIONS_RECRUITER
    : QUICK_ACTIONS_GENERAL;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="chat-backdrop fixed inset-0 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="fixed inset-4 z-50 mx-auto my-auto flex max-h-[80vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl border border-border bg-white md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-light px-6 py-5 md:px-10 md:py-6">
              <div>
                <h2 className="font-display text-xl font-bold text-text md:text-2xl">
                  {isRecruiterMode
                    ? "AI-Powered Job Match Analysis"
                    : "Chat with Pradeep\u2019s AI Assistant"}
                </h2>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  {isRecruiterMode
                    ? "Paste a job description to see how well I match your role"
                    : "Ask anything about my work, skills, or experience"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-text-muted transition-colors duration-200 hover:bg-bg-alt hover:text-text"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 md:px-10 md:py-6">
              {/* Toggle */}
              <div className="mb-6 flex justify-center">
                <RecruiterToggle size="md" />
              </div>

              {/* Skill pills - recruiter only */}
              {isRecruiterMode && (
                <div className="mb-5">
                  <p className="mb-2.5 font-mono text-xs font-medium text-text-muted">
                    Highlight Specific Skills (Optional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_PILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium transition-all duration-200",
                          selectedSkills.includes(skill)
                            ? "bg-success/15 text-success ring-1 ring-success/30"
                            : "bg-bg-alt text-text-secondary hover:bg-bg-alt/80"
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
                <div className="mb-5 flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setInput(action.prompt)}
                      className="rounded-full border border-border bg-white px-4 py-2 font-mono text-[11px] font-medium text-text-secondary transition-all duration-200 hover:border-primary/20 hover:text-primary"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="mb-5">
                <label className="mb-2 block font-mono text-xs font-medium text-text">
                  {isRecruiterMode ? "Job Description" : "Your Question"}
                </label>
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
                    isRecruiterMode
                      ? "Paste the job description here..."
                      : "Type your question..."
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border bg-bg-alt px-4 py-3 text-sm text-text transition-all duration-200 placeholder:text-text-muted focus:border-primary/30 focus:outline-none"
                  style={{ minHeight: 100, maxHeight: 300 }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                  isRecruiterMode
                    ? "bg-success hover:bg-success/90"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {isRecruiterMode ? "Analyze Match" : "Send"}
                  </>
                )}
              </button>

              {/* Loading state */}
              {loading && (
                <div className="mt-6 flex flex-col items-center gap-3 py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/8">
                    <Brain size={24} className="animate-pulse text-primary" />
                  </div>
                  <p className="font-mono text-xs font-medium text-text-muted">
                    {isRecruiterMode
                      ? "Analyzing job match..."
                      : "Thinking..."}
                  </p>
                </div>
              )}

              {/* Error state */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-start gap-3 rounded-xl border border-red-200/60 bg-red-50/50 p-4"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />
                  <div>
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={handleSubmit}
                      className="mt-2 font-mono text-xs font-semibold text-red-600 underline hover:text-red-700"
                    >
                      Try again
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Response */}
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6"
                >
                  {response.type === "job_match" &&
                  response.matchPercentage !== undefined ? (
                    <div
                      className={cn(
                        "rounded-xl border p-6",
                        response.matchPercentage >= 80
                          ? "border-success/20 bg-success/5"
                          : response.matchPercentage >= 60
                          ? "border-yellow-300/20 bg-yellow-50/30"
                          : "border-border bg-bg-alt"
                      )}
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <Sparkles
                          size={20}
                          className="text-success"
                        />
                        <span className="font-display text-4xl font-bold text-text">
                          {response.matchPercentage}%
                        </span>
                        <span className="rounded-full bg-success/10 px-3 py-1 font-mono text-xs font-semibold text-success">
                          {response.matchLevel}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm leading-relaxed text-text-secondary">
                        {response.content.split("\n").map((line, i) =>
                          line.trim() ? (
                            <p key={i}>{line}</p>
                          ) : null
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-bg-alt p-6">
                      <div className="space-y-2 text-sm leading-relaxed text-text-secondary">
                        {response.content.split("\n").map((line, i) =>
                          line.trim() ? (
                            <p key={i}>{line}</p>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
