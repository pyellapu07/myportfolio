"use client";

import { useState, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Menu, X, Download, Bell } from "lucide-react";
import RecruiterToggle from "./RecruiterToggle";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* Isolated so header scroll re-renders never restart the animation */
const DoodleCircle = memo(function DoodleCircle() {
  const controls = useAnimation();
  useEffect(() => {
    const t = setTimeout(() => {
      controls.start({ pathLength: 1, opacity: 1 });
    }, 1000);
    return () => clearTimeout(t);
  }, []); // runs exactly once

  return (
    <svg
      className="pointer-events-none absolute"
      style={{ top: "-10px", left: "-14px", width: "calc(100% + 28px)", height: "calc(100% + 20px)", overflow: "visible" }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      {/*
        Path draws a full ellipse then overshoots ~15% past the start —
        the endpoint curls inward slightly so it looks like a real pen stroke.
        No closing Z — open path only.
      */}
      <motion.path
        d="M 22,11 C 38,-5 76,-4 90,12 C 105,30 101,74 84,90 C 66,106 28,107 12,90 C -3,74 1,30 18,14 C 19,13 20,12 26,8"
        stroke="#3B82F6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={controls}
        transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  );
});

export default function Header({ initialDark = false }: { initialDark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // If initialDark is true, use dark text (text-text) when NOT scrolled too
  // Normal behavior: white text at top, dark text when scrolled
  const isDarkText = initialDark || scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-lg border-b border-border"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-8 md:px-16 lg:px-24">
          {/* Logo */}
          <a
            href="/"
            className={cn(
              "font-mono text-sm font-medium tracking-tight transition-colors",
              isDarkText ? "text-text" : "text-white"
            )}
            aria-label="Home"
          >
            pradeep.
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href.startsWith("#") ? `/${link.href}` : link.href}
                className={cn(
                  "font-mono text-xs tracking-wide transition-colors",
                  isDarkText
                    ? "text-text-secondary hover:text-text"
                    : "text-white/60 hover:text-white"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden items-center gap-5 md:flex" data-tour="recruiter">
            {/* Doodle circle around recruiter toggle */}
            <div className="relative inline-flex items-center">
              <RecruiterToggle size="sm" dark={!isDarkText} />
              <DoodleCircle />
            </div>
            <a
              href={SITE.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-all duration-200 hover:-translate-y-px",
                isDarkText
                  ? "bg-text text-white hover:bg-text/90"
                  : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border border-white/10"
              )}
            >
              <Download size={13} />
              Resume
            </a>
          </div>

          {/* Mobile: recruiter toggle + notification + menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <RecruiterToggle size="sm" dark={!isDarkText} />
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-testimonials"))}
              className={cn("relative", isDarkText ? "text-text" : "text-white")}
              aria-label="Testimonials"
            >
              <Bell size={19} />
              <span className="absolute -right-1.5 -top-1.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
                3
              </span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn("relative z-50", isDarkText ? "text-text" : "text-white")}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

      </header>

      {/* Mobile drawer — rendered via portal so it's never clipped by the header stacking context */}
      {mounted && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-dark md:hidden"
            >
              {/* Close button inside drawer */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-6 text-white/60 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>

              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href.startsWith("#") ? `/${link.href}` : link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-2xl font-semibold text-white transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
              <RecruiterToggle dark />
              <a
                href={SITE.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-mono text-sm text-white"
              >
                <Download size={14} />
                Download Resume
              </a>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
