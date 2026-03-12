"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ⏱ Adjust this to match the GIF's single-loop duration in ms
const GIF_DURATION_MS = 4000;

export default function LoadingScreen() {
  // Start visible — immediately hide if already seen this session
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Already seen this session → hide instantly
    if (sessionStorage.getItem("loadingSeen")) {
      setVisible(false);
      return;
    }

    // Lock scroll while loading
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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "#F0E8DC" }}
        >
          <Image
            src="/voxel/loadinganimation.gif"
            alt=""
            width={700}
            height={394}
            className="w-[90vw] max-w-[700px]"
            unoptimized
            priority
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
