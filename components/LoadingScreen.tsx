"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Exact GIF duration — 60 frames × 100ms = 6000ms
const GIF_DURATION_MS = 6000;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Already seen this session → vanish instantly, no fade
    if (sessionStorage.getItem("loadingSeen")) {
      setVisible(false);
      return;
    }

    // First visit — play full GIF with fade-out at the end
    setShouldAnimate(true);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("loadingSeen", "1");
      document.body.style.overflow = "";
    }, GIF_DURATION_MS);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999]"
          style={{ backgroundColor: "#F0E8DC" }}
        >
          <Image
            src="/voxel/loadinganimation.gif"
            alt=""
            fill
            className="object-cover"
            unoptimized
            priority
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
