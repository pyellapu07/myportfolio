"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ClawMark {
  id: number;
  x: number;
  y: number;
  angle: number;
}

/* Returns true if the element (or nearest ancestor with a background) is dark */
function isDarkBackground(el: Element | null): boolean {
  let node = el as HTMLElement | null;
  while (node && node !== document.body) {
    const bg = window.getComputedStyle(node).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const nums = bg.match(/\d+/g);
      if (nums) {
        const [r, g, b] = nums.map(Number);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.45;
      }
    }
    node = node.parentElement;
  }
  return false;
}

export default function CustomCursor() {
  const [isHovering, setIsHovering]       = useState(false);
  const [isOnHero, setIsOnHero]           = useState(false);
  const [isOnDark, setIsOnDark]           = useState(false);
  const [isOnNoCursor, setIsOnNoCursor]   = useState(false);
  const [clawMarks, setClawMarks]         = useState<ClawMark[]>([]);
  const [isVisible, setIsVisible]         = useState(false);
  const clawIdRef   = useRef(0);
  const lastClawPos = useRef({ x: -999, y: -999 });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX  = useSpring(mouseX, { stiffness: 900, damping: 40, mass: 0.3 });
  const dotY  = useSpring(mouseY, { stiffness: 900, damping: 40, mass: 0.3 });
  const ringX = useSpring(mouseX, { stiffness: 180, damping: 22, mass: 0.8 });
  const ringY = useSpring(mouseY, { stiffness: 180, damping: 22, mass: 0.8 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      // No-cursor zones
      const noCursorEl = (e.target as Element)?.closest("[data-no-cursor]");
      setIsOnNoCursor(!!noCursorEl);

      // Dark background detection
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      setIsOnDark(isDarkBackground(elUnder));

      // Hero section — for claw marks
      const hero = document.getElementById("hero-section");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const onHero =
          e.clientY >= rect.top    &&
          e.clientY <= rect.bottom &&
          e.clientX >= rect.left   &&
          e.clientX <= rect.right;
        setIsOnHero(onHero);

        if (onHero) {
          const dx = e.clientX - lastClawPos.current.x;
          const dy = e.clientY - lastClawPos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 48) {
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const id = ++clawIdRef.current;
            setClawMarks((prev) => [
              ...prev.slice(-6),
              { id, x: e.clientX, y: e.clientY, angle },
            ]);
            lastClawPos.current = { x: e.clientX, y: e.clientY };
            setTimeout(() => {
              setClawMarks((prev) => prev.filter((c) => c.id !== id));
            }, 700);
          }
        }
      }
    };

    const onLeave  = () => setIsVisible(false);
    const onEnter  = () => setIsVisible(true);
    const addHover    = () => setIsHovering(true);
    const removeHover = () => setIsHovering(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const interactives = document.querySelectorAll(
      "a, button, [role='button'], input, textarea, select, label"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", addHover);
        el.removeEventListener("mouseleave", removeHover);
      });
    };
  }, [mouseX, mouseY]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  /* ── colour logic ──────────────────────────────────────── */
  const ringColor = isOnDark
    ? isHovering ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)"
    : isHovering ? "rgba(99,102,241,0.75)" : "rgba(99,102,241,0.35)";

  const dotColor = isOnDark
    ? isHovering ? "#ffffff" : "rgba(255,255,255,0.85)"
    : isHovering ? "#6366F1" : "#111111";

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        [data-no-cursor], [data-no-cursor] * { cursor: auto !important; }
        [data-no-cursor] textarea, [data-no-cursor] input { cursor: text !important; }
        [data-no-cursor] button { cursor: pointer !important; }
      `}</style>

      {/* Claw scratch marks — hero only */}
      {clawMarks.map((mark) => (
        <motion.div
          key={mark.id}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0,   scale: 1.1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none fixed"
          style={{
            zIndex: 99997,
            left: mark.x,
            top: mark.y,
            transform: `translate(-50%, -50%) rotate(${mark.angle}deg)`,
          }}
        >
          <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
            <line x1="4"  y1="2" x2="4"  y2="16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="2" x2="14" y2="16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="2" x2="24" y2="16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}

      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed"
        style={{ zIndex: 99998, x: ringX, y: ringY, translateX: "-50%", translateY: "-50%", borderRadius: "50%", border: "1px solid", position: "fixed" }}
        animate={{
          width:       isHovering ? 40 : 28,
          height:      isHovering ? 40 : 28,
          opacity:     isVisible && !isOnNoCursor ? 1 : 0,
          borderColor: ringColor,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed"
        style={{ zIndex: 99999, x: dotX, y: dotY, translateX: "-50%", translateY: "-50%", borderRadius: "50%", position: "fixed" }}
        animate={{
          width:           isHovering ? 5 : 4,
          height:          isHovering ? 5 : 4,
          opacity:         isVisible && !isOnNoCursor ? 1 : 0,
          backgroundColor: dotColor,
        }}
        transition={{ duration: 0.13 }}
      />
    </>
  );
}
