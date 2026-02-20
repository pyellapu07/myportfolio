"use client";

import { useRecruiter } from "@/lib/recruiter-context";
import { cn } from "@/lib/utils";

interface RecruiterToggleProps {
  size?: "sm" | "md";
  showLabel?: boolean;
  dark?: boolean;
}

export default function RecruiterToggle({
  size = "md",
  showLabel = true,
  dark = false,
}: RecruiterToggleProps) {
  const { isRecruiterMode, toggleRecruiterMode } = useRecruiter();

  const trackW = size === "sm" ? "w-9" : "w-11";
  const trackH = size === "sm" ? "h-[18px]" : "h-[22px]";
  const thumbSz = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const translate = isRecruiterMode
    ? size === "sm" ? "translate-x-[18px]" : "translate-x-[22px]"
    : "translate-x-[2px]";

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span
          className={cn(
            "font-mono text-[11px] tracking-wide transition-colors duration-300",
            isRecruiterMode
              ? "text-success"
              : dark
              ? "text-white/50"
              : "text-text-muted"
          )}
        >
          Recruiter
        </span>
      )}
      <button
        role="switch"
        aria-checked={isRecruiterMode}
        aria-label="Toggle recruiter mode"
        onClick={toggleRecruiterMode}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-in-out",
          trackW,
          trackH,
          isRecruiterMode
            ? "bg-success"
            : dark
            ? "bg-white/15"
            : "bg-text-muted/30"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block transform rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            thumbSz,
            translate,
            "mt-[2px]"
          )}
        />
      </button>
    </div>
  );
}
