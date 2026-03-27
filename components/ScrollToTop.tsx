"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

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
        <motion.button
          key="scroll-to-top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1   }}
          exit={{    opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full px-4 py-2.5 text-white shadow-xl"
          style={{
            background: "linear-gradient(135deg, #E21833 0%, #c4102a 100%)",
            boxShadow: "0 4px 24px rgba(226,24,51,0.40), 0 1px 4px rgba(0,0,0,0.18)",
          }}
        >
          <span className="text-[11px] font-semibold leading-none tracking-wide whitespace-nowrap">
            You&apos;ve made it to the end
          </span>
          <span className="h-3.5 w-px bg-white/30" />
          <span className="flex items-center gap-1 text-[11px] font-bold leading-none whitespace-nowrap">
            Jump to Top
            <ArrowUp size={11} strokeWidth={2.5} />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
