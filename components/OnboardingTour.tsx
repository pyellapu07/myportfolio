"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TOUR_KEY = "onboarding-done-v1";

const STEPS = [
  {
    target: '[data-tour="chat"]',
    title: "Ask me anything",
    description:
      "I built an AI that knows my entire work history. Ask about my skills, process, or whether I'm a fit for your role.",
    placement: "top" as const,
    scrollBlock: "center" as const,
  },
  {
    target: '[data-tour="recruiter"]',
    title: "Recruiter mode",
    description:
      "Toggle this to switch the portfolio into a recruiter-focused view, metrics and impact front and center.",
    placement: "bottom" as const,
    scrollBlock: "start" as const,
  },
  {
    target: '[data-tour="folder"]',
    title: "creativesidehustle/",
    description:
      "An easter egg. Click the folder to explore my graphic design and motion work, the non-UX side of me.",
    placement: "left" as const,
    scrollBlock: "center" as const,
  },
  {
    target: "#work",
    title: "Case studies",
    description:
      "Hover any project card for a custom cursor label. NDA-protected work is locked, reach out and I'll share access.",
    placement: "top" as const,
    scrollBlock: "start" as const,
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const PAD = 10; // spotlight padding around target

function getTooltipPosition(rect: Rect, placement: string, vpW: number, vpH: number) {
  const gap = 16;
  switch (placement) {
    case "top":
      return {
        top: Math.max(8, rect.top - PAD - gap - 140),
        left: Math.min(vpW - 296, Math.max(8, rect.left + rect.width / 2 - 148)),
      };
    case "bottom":
      return {
        top: Math.min(vpH - 160, rect.bottom + PAD + gap),
        left: Math.min(vpW - 296, Math.max(8, rect.left + rect.width / 2 - 148)),
      };
    case "left":
      return {
        top: Math.max(8, rect.top + rect.height / 2 - 70),
        left: Math.max(8, rect.left - PAD - gap - 296),
      };
    case "right":
      return {
        top: Math.max(8, rect.top + rect.height / 2 - 70),
        left: Math.min(vpW - 296, rect.right + PAD + gap),
      };
    default:
      return { top: rect.bottom + PAD + gap, left: rect.left };
  }
}

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setActive(false);
  }, []);

  // Position spotlight + tooltip for the current step
  const positionStep = useCallback((stepIndex: number) => {
    const s = STEPS[stepIndex];
    const el = document.querySelector(s.target) as HTMLElement | null;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: s.scrollBlock });

    // Wait for scroll to settle before measuring
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
      setTooltipPos(getTooltipPosition(r, s.placement, vpW, vpH));
    }, 420);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return;
    // Small delay so the page finishes loading
    const t = setTimeout(() => {
      setActive(true);
      positionStep(0);
    }, 2800);
    return () => clearTimeout(t);
  }, [positionStep]);

  useEffect(() => {
    if (!active) return;
    positionStep(step);
  }, [step, active, positionStep]);

  // Reposition on resize
  useEffect(() => {
    if (!active) return;
    const handler = () => positionStep(step);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [active, step, positionStep]);

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  if (!active) return null;

  const RADIUS = 12;
  const spotTop  = rect ? rect.top    - PAD : 0;
  const spotLeft = rect ? rect.left   - PAD : 0;
  const spotW    = rect ? rect.width  + PAD * 2 : 0;
  const spotH    = rect ? rect.height + PAD * 2 : 0;
  const BG = "rgba(0,0,0,0.58)";

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* 4-panel overlay, leaves a transparent hole where the target is.
              Cursor passes through the hole freely; clicking outside dismisses. */}
          {/* Top panel */}
          <motion.div key="ov-top"    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={finish}
            className="fixed z-[9990] pointer-events-auto left-0 right-0 top-0"
            style={{ height: spotTop, backgroundColor: BG }} />
          {/* Bottom panel */}
          <motion.div key="ov-bot"    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={finish}
            className="fixed z-[9990] pointer-events-auto left-0 right-0 bottom-0"
            style={{ top: spotTop + spotH, backgroundColor: BG }} />
          {/* Left panel */}
          <motion.div key="ov-left"   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={finish}
            className="fixed z-[9990] pointer-events-auto top-0 bottom-0 left-0"
            style={{ width: spotLeft, top: spotTop, height: spotH, backgroundColor: BG }} />
          {/* Right panel */}
          <motion.div key="ov-right"  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={finish}
            className="fixed z-[9990] pointer-events-auto top-0 bottom-0 right-0"
            style={{ left: spotLeft + spotW, top: spotTop, height: spotH, backgroundColor: BG }} />

          {/* Spotlight ring, rounded corners, pointer-events-none so cursor shows */}
          {rect && (
            <motion.div
              key={`ring-${step}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed z-[9991] pointer-events-none"
              style={{
                top: spotTop,
                left: spotLeft,
                width: spotW,
                height: spotH,
                borderRadius: RADIUS,
                boxShadow: "0 0 0 2.5px #FF5210, 0 0 0 4px rgba(255,82,16,0.15)",
              }}
            />
          )}

          {/* Tooltip card */}
          <motion.div
            key={`tooltip-${step}`}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[9992] w-[288px] rounded-[4px] bg-white border border-border shadow-smooth-hover pointer-events-auto"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            {/* Orange top accent */}
            <div className="h-[3px] w-full rounded-t-[4px] bg-primary" />

            <div className="p-4">
              {/* Step indicator + close */}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {step + 1} / {STEPS.length}
                </span>
                <button
                  onClick={finish}
                  className="text-text-muted hover:text-text transition-colors"
                  aria-label="Skip tour"
                >
                  <X size={13} />
                </button>
              </div>

              <h3 className="font-display text-base font-bold text-text mb-1">
                {STEPS[step].title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {STEPS[step].description}
              </p>

              {/* Step dots */}
              <div className="mt-4 flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? 16 : 6,
                      backgroundColor: i === step ? "#FF5210" : "#E5E5E5",
                    }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={finish}
                  className="font-mono text-[11px] uppercase tracking-wider text-text-muted hover:text-text transition-colors"
                >
                  Skip all
                </button>
                <button
                  onClick={next}
                  className="rounded-[2px] bg-primary px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white hover:bg-primary/90 transition-colors"
                >
                  {step < STEPS.length - 1 ? "Next →" : "Done"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
