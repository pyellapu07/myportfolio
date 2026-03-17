"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ClawMark {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isOnHero, setIsOnHero] = useState(false);
  const [isOnNoCursor, setIsOnNoCursor] = useState(false);
  const [clawMarks, setClawMarks] = useState<ClawMark[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const clawIdRef = useRef(0);
  const lastClawPos = useRef({ x: -999, y: -999 });

  // Raw mouse position — instant
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Inner dot — snappy
  const dotX = useSpring(mouseX, { stiffness: 900, damping: 40, mass: 0.3 });
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 40, mass: 0.3 });

  // Outer ring — lags behind for the trailing feel
  const ringX = useSpring(mouseX, { stiffness: 180, damping: 22, mass: 0.8 });
  const ringY = useSpring(mouseY, { stiffness: 180, damping: 22, mass: 0.8 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      // Hide custom cursor over any data-no-cursor zone
      const noCursorEl = (e.target as Element)?.closest("[data-no-cursor]");
      setIsOnNoCursor(!!noCursorEl);

      // Check if over hero section
      const hero = document.getElementById("hero-section");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const onHero =
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right;
        setIsOnHero(onHero);

        // Spawn claw mark only on hero, only if moved enough distance
        if (onHero) {
          const dx = e.clientX - lastClawPos.current.x;
          const dy = e.clientY - lastClawPos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 48) {
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const id = ++clawIdRef.current;
            setClawMarks((prev) => [
              ...prev.slice(-6), // max 7 at once
              { id, x: e.clientX, y: e.clientY, angle },
            ]);
            lastClawPos.current = { x: e.clientX, y: e.clientY };
            // Auto-remove after 700ms
            setTimeout(() => {
              setClawMarks((prev) => prev.filter((c) => c.id !== id));
            }, 700);
          }
        }
      }
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    // Track hoverable elements
    const addHover = () => setIsHovering(true);
    const removeHover = () => setIsHovering(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    // Observe all interactive elements
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

  // Don't render on touch/mobile
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Hide default cursor globally, restore inside chat */}
      <style>{`
        * { cursor: none !important; }
        [data-no-cursor], [data-no-cursor] * { cursor: auto !important; }
        [data-no-cursor] textarea, [data-no-cursor] input { cursor: text !important; }
        [data-no-cursor] button { cursor: pointer !important; }
      `}</style>

      {/* Claw scratch marks — only on hero */}
      {clawMarks.map((mark) => (
        <motion.div
          key={mark.id}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none fixed z-[9996]"
          style={{
            left: mark.x,
            top: mark.y,
            transform: `translate(-50%, -50%) rotate(${mark.angle}deg)`,
          }}
        >
          {/* Three claw lines */}
          <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
            <line x1="4"  y1="2" x2="4"  y2="16" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="2" x2="14" y2="16" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="2" x2="24" y2="16" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}

      {/* Outer ring — lags, morphs on hover */}
      <motion.div
        className="pointer-events-none fixed z-[9997]"
        animate={{
          width: isHovering ? 40 : 28,
          height: isHovering ? 40 : 28,
          opacity: isVisible && !isOnNoCursor ? 1 : 0,
          borderColor: isOnHero
            ? isHovering ? "rgba(255,100,50,0.8)" : "rgba(0,0,0,0.25)"
            : isHovering ? "rgba(99,102,241,0.7)" : "rgba(99,102,241,0.3)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: "50%",
          border: "1px solid",
          position: "fixed",
        }}
      />

      {/* Inner dot — snappy, always at exact cursor */}
      <motion.div
        className="pointer-events-none fixed z-[9998]"
        animate={{
          width: isHovering ? 5 : 4,
          height: isHovering ? 5 : 4,
          opacity: isVisible && !isOnNoCursor ? 1 : 0,
          backgroundColor: isOnHero
            ? isHovering ? "#FF5210" : "rgba(0,0,0,0.7)"
            : isHovering ? "#6366F1" : "#111111",
        }}
        transition={{ duration: 0.15 }}
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: "50%",
          position: "fixed",
        }}
      />
    </>
  );
}
