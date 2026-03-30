"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THRESHOLD  = 0.10; // top / bottom 10% of viewport
const MAX_SPEED  = 18;   // px per frame at the very edge
const STORAGE_KEY = "edgescroll-paused";

// Elements that should pause edge-scrolling when hovered
const INTERACTIVE = "a, button, [role='button'], [role='link'], input, textarea, select, label, [tabindex]";

function isOverInteractive(e: MouseEvent): boolean {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return !!(el?.closest(INTERACTIVE));
}

export default function EdgeScroll() {
  const rafRef      = useRef<number | null>(null);
  const dirRef      = useRef<"up" | "down" | null>(null);
  const speedRef    = useRef(0);
  const activeRef   = useRef(false); // cursor in edge zone?
  const onButtonRef = useRef(false); // cursor over interactive element?

  const [paused, setPaused] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [visible, setVisible] = useState(false);

  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  function togglePause() {
    setPaused(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  useEffect(() => {
    function loop() {
      const blocked = pausedRef.current || onButtonRef.current;
      if (!blocked && dirRef.current && speedRef.current > 0) {
        window.scrollBy(0, dirRef.current === "down" ? speedRef.current : -speedRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    function onMouseMove(e: MouseEvent) {
      onButtonRef.current = isOverInteractive(e);

      const h     = window.innerHeight;
      const ratio = e.clientY / h;

      if (ratio >= 1 - THRESHOLD) {
        dirRef.current   = "down";
        speedRef.current = Math.round(((ratio - (1 - THRESHOLD)) / THRESHOLD) * MAX_SPEED);
        if (!activeRef.current) { activeRef.current = true; setVisible(true); }
      } else if (ratio <= THRESHOLD) {
        dirRef.current   = "up";
        speedRef.current = Math.round(((THRESHOLD - ratio) / THRESHOLD) * MAX_SPEED);
        if (!activeRef.current) { activeRef.current = true; setVisible(true); }
      } else {
        dirRef.current   = null;
        speedRef.current = 0;
        if (activeRef.current) { activeRef.current = false; setVisible(false); }
      }
    }

    function onMouseLeave() {
      dirRef.current    = null;
      speedRef.current  = 0;
      activeRef.current = false;
      onButtonRef.current = false;
      setVisible(false);
    }

    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="edge-scroll-toggle"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={togglePause}
          className="fixed bottom-6 left-6 z-[9999] flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-md transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}
          title={paused ? "Resume edge scroll" : "Pause edge scroll"}
        >
          <span className="text-[10px] leading-none">{paused ? "▶" : "⏸"}</span>
          <span>{paused ? "Resume auto-scroll" : "Pause auto-scroll"}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
