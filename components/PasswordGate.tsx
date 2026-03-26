"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import CustomCursor from "@/components/CustomCursor";

// Each protected page has its own storage key so they're independently unlocked
interface PasswordGateProps {
  password: string;
  storageKey: string;
  projectName: string;
  children: React.ReactNode;
}

export default function PasswordGate({
  password,
  storageKey,
  projectName,
  children,
}: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Check if already unlocked in this session
  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === "1") {
      setUnlocked(true);
    }
    setChecked(true);
  }, [storageKey]);

  function attempt() {
    if (input.trim().toLowerCase() === password.toLowerCase()) {
      sessionStorage.setItem(storageKey, "1");
      setError(false);
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setInput("");
    }
  }

  // Don't flash gate before session check completes
  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <AnimatePresence>
      <CustomCursor />
      <motion.div
        key="gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8F4] px-6"
      >
        {/* Vertical line accent */}
        <div className="absolute left-1/2 top-0 h-[18vh] w-px bg-gradient-to-b from-transparent to-border" />

        <motion.div
          animate={shaking ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          {/* Lock icon */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white shadow-sm">
              <Lock size={18} className="text-text-muted" />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary">
              Protected
            </p>
            <h1 className="text-center font-display text-2xl font-bold text-text">
              {projectName}
            </h1>
            <p className="text-center text-sm text-text-muted max-w-[260px]">
              This case study is under NDA.{" "}
              <a
                href="mailto:pyellapu@umd.edu"
                className="text-primary underline underline-offset-2 hover:opacity-75 transition-opacity"
              >
                Reach out
              </a>{" "}
              and I&apos;ll share access.
            </p>
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && attempt()}
              placeholder="Enter password"
              autoFocus
              className={`w-full rounded-[4px] border bg-white px-4 py-3 pr-20 font-mono text-sm text-text outline-none transition-all placeholder:text-text-muted/50 ${
                error
                  ? "border-red-400 focus:border-red-400"
                  : "border-border focus:border-text"
              }`}
            />
            {/* Show/hide toggle */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            {/* Submit */}
            <button
              onClick={attempt}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              aria-label="Unlock"
            >
              <ArrowRight size={15} />
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 font-mono text-[11px] text-red-500"
            >
              Wrong password, try again or reach out directly.
            </motion.p>
          )}

          {/* Back link */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="font-mono text-[11px] uppercase tracking-widest text-text-muted hover:text-text transition-colors"
            >
              ← Back to portfolio
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
