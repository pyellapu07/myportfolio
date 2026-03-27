"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      setVisible(scrolled / total >= 0.9);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="scroll-to-top"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{    opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {/* Left label */}
          <span className="text-[12px] font-medium text-neutral-500 whitespace-nowrap select-none">
            You&apos;ve made it to the end
          </span>

          {/* Jump to Top button */}
          <button
            onClick={scrollToTop}
            aria-label="Jump to top"
            className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-white whitespace-nowrap transition-all duration-150 hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "#6366f1" }}
          >
            Jump to Top
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
