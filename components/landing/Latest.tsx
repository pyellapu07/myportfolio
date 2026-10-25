"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { immersion } from "@/components/map/immersion";
import { LATEST } from "./latest";

// "Latest": a header button that opens a glass stack of the newest work and
// writing down the right side, TinyWins-style, over a softly blurred page.

const EASE = [0.2, 0.6, 0.35, 1] as const;
const noop = () => () => {};

export default function Latest() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  // While open the scene holds still and the page doesn't scroll.
  useEffect(() => {
    if (!open) {
      if (immersion.get().detail === "latest") immersion.setDetail(null);
      return;
    }
    immersion.setDetail("latest");
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-black/10 bg-white/60 py-1.5 pl-2.5 pr-3 backdrop-blur-xl transition-colors hover:border-black/25"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff6b3d] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff6b3d]" />
        </span>
        Latest
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div key="latest" className="fixed inset-0 z-[46]" role="dialog" aria-modal="true" aria-label="Latest work and writing">
                <motion.button
                  type="button"
                  aria-label="Close"
                  // Deep frosted blur under a black wash, darkest behind the
                  // stack so the glass cards stand out from the page.
                  className="absolute inset-0 h-full w-full cursor-default bg-gradient-to-l from-black/45 via-black/30 to-black/20 backdrop-blur-[22px] backdrop-saturate-150"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  onClick={() => setOpen(false)}
                />
                <div
                  data-own-scroll
                  className="absolute bottom-4 right-4 top-4 w-[min(440px,calc(100vw-32px))] space-y-3.5 overflow-y-auto overscroll-contain pb-4 pr-1 sm:right-6 sm:top-6"
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-[12px] font-semibold tracking-[-0.01em] text-white/75">Latest · {LATEST.length}</span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close latest"
                      className="grid h-7 w-7 place-items-center rounded-[4px] bg-white text-[15px] leading-none text-black"
                    >
                      ×
                    </button>
                  </div>
                  {LATEST.map((item, i) => {
                    const body = (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- small, already-sized thumbs */}
                        <img src={item.image} alt="" className="h-[104px] w-[104px] shrink-0 rounded-[3px] object-cover" draggable={false} />
                        <span className="flex min-w-0 flex-1 flex-col justify-between py-1">
                          <span className="line-clamp-3 text-[14.5px] font-semibold leading-[1.35] tracking-[-0.02em] text-black">{item.title}</span>
                          <span className="mt-3 text-[11.5px] tracking-[-0.01em] text-black/45">
                            {item.kind} · {item.source} · {item.when}
                          </span>
                        </span>
                      </>
                    );
                    const cls =
                      "flex min-h-[128px] items-stretch gap-4 rounded-[6px] border border-white/80 bg-white/75 p-3 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-[background-color,transform] duration-300 hover:-translate-x-1 hover:bg-white/80";
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24, transition: { duration: 0.2, delay: 0 } }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.06 + i * 0.045 }}
                      >
                        {item.external ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
                            {body}
                          </a>
                        ) : (
                          <Link href={item.href} className={cls} onClick={() => setOpen(false)}>
                            {body}
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
