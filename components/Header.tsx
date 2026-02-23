"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Download } from "lucide-react";
import RecruiterToggle from "./RecruiterToggle";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
          <div className="hidden items-center gap-5 md:flex">
            <RecruiterToggle size="sm" dark={!isDarkText} />
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

          {/* Mobile: recruiter toggle + menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <RecruiterToggle size="sm" dark={!isDarkText} />
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
