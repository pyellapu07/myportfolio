"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS, type Project } from "./projects";

// A card, clicked: it flies from where it sits in the scene to the centre of
// the screen, grows to its full-size cover, and the details settle in below.
// Closing sends it back to where it came from. Portalled to <body>, since
// the map lives inside a transformed container that would trap `fixed`.

const FLY = [0.76, 0, 0.24, 1] as const;
const SETTLE = [0.2, 0.6, 0.35, 1] as const;
const ASPECT = 0.625;

export type DetailOpen = { project: Project; from: DOMRect };

function target() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let w = Math.min(920, vw * 0.64, vw - 32);
  let h = w * ASPECT;
  const maxH = vh * 0.56;
  if (h > maxH) {
    h = maxH;
    w = h / ASPECT;
  }
  // Leave room below for the text block.
  const top = Math.max(84, (vh - h - 150) / 2);
  return { left: (vw - w) / 2, top, width: w, height: h };
}

export default function ProjectDetail({ open, onClose }: { open: DetailOpen | null; onClose: () => void }) {
  // Client only (the portal needs <body>), without a mount-flag re-render.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  const isOpen = !!open;
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  if (!mounted) return null;
  return createPortal(<AnimatePresence>{open && <Panel key={open.project.id} open={open} onClose={onClose} />}</AnimatePresence>, document.body);
}

function Panel({ open, onClose }: { open: DetailOpen; onClose: () => void }) {
  const { project: p, from } = open;
  const [to] = useState(target);
  const [coverReady, setCoverReady] = useState(false);
  const parent = p.parent ? PROJECTS.find((x) => x.id === p.parent) : undefined;
  const blurb = p.blurb ?? (parent ? `Part of ${parent.title}. ${parent.blurb ?? ""}` : "");
  const rect = { left: from.left, top: from.top, width: from.width, height: from.height };

  return (
    <div className="fixed inset-0 z-[45]" role="dialog" aria-modal="true" aria-label={p.title}>
      {/* Backdrop: the scene frosts over; a click anywhere on it closes. */}
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 h-full w-full cursor-default bg-white/70 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: SETTLE }}
        onClick={onClose}
      />

      <motion.div
        className="absolute overflow-hidden bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
        initial={rect}
        animate={to}
        exit={rect}
        transition={{ duration: 0.7, ease: FLY }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- already-sized thumb, swapped for the cover */}
        <img src={p.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {p.video ? (
          <video poster={p.thumb} muted loop playsInline autoPlay className="absolute inset-0 h-full w-full object-cover">
            <source src={p.video.replace(/\.mp4$/, ".webm")} type="video/webm" />
            <source src={p.video} type="video/mp4" />
          </video>
        ) : p.cover && (
          // eslint-disable-next-line @next/next/no-img-element -- covers include GIFs
          <img
            src={p.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: coverReady ? 1 : 0 }}
            onLoad={() => setCoverReady(true)}
            draggable={false}
          />
        )}
      </motion.div>

      <motion.div
        className="absolute"
        style={{ left: to.left, top: to.top + to.height + 22, width: to.width }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.55, ease: SETTLE } }}
        exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
      >
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.035em] text-black sm:text-[26px]">{p.title}</h2>
            <p className="mt-1.5 text-[13px] font-medium tracking-[-0.02em] text-black/50">
              {p.role} · {p.place}
            </p>
          </div>
          <Link
            href={p.href}
            className="shrink-0 whitespace-nowrap bg-black px-4 py-2.5 text-[13px] font-semibold tracking-[-0.02em] text-white transition-opacity hover:opacity-80"
          >
            View case study →
          </Link>
        </div>
        {blurb && <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed tracking-[-0.015em] text-black/75">{blurb}</p>}
      </motion.div>

      <motion.button
        type="button"
        onClick={onClose}
        aria-label="Close project"
        className="absolute right-6 top-6 grid h-10 w-10 place-items-center bg-black text-[18px] leading-none text-white sm:right-10 sm:top-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.35 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        ×
      </motion.button>
    </div>
  );
}
