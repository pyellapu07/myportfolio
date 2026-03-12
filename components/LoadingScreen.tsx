"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ⏱ Set this to your GIF's exact single-loop duration in ms
const GIF_DURATION_MS = 8000;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Already seen this session → hide instantly, no animation
    if (sessionStorage.getItem("loadingSeen")) {
      setVisible(false);
      return;
    }

    // First visit — lock scroll and play full GIF
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
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999]"
          style={{ backgroundColor: "#F0E8DC" }}
        >
          {/* GIF fills entire viewport, cropped to cover on all screen sizes */}
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
