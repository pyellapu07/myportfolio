"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Grid, List } from "lucide-react";

/* ── Creative work data ─────────────────────────────────────────────
   Add your actual files to /public/creative-work/ and update src here.
   Leave src undefined to show the gradient placeholder.
────────────────────────────────────────────────────────────────────── */
interface CreativeFile {
  name: string;
  category: string;
  src?: string;
  gradient: string;
  year: string;
  size?: string;
}

const FILES: CreativeFile[] = [
  {
    name: "Enactus Rebrand",
    category: "Branding",
    gradient: "linear-gradient(135deg,#FF6B35 0%,#F7931E 100%)",
    year: "2023",
    size: "12 MB",
  },
  {
    name: "Event Poster Series",
    category: "Posters",
    gradient: "linear-gradient(135deg,#667EEA 0%,#764BA2 100%)",
    year: "2022",
    size: "8 MB",
  },
  {
    name: "Abstract Illustrations",
    category: "Illustrations",
    gradient: "linear-gradient(135deg,#11998E 0%,#38EF7D 100%)",
    year: "2023",
    size: "22 MB",
  },
  {
    name: "Gig Flyer",
    category: "Posters",
    gradient: "linear-gradient(135deg,#FC5C7D 0%,#6A3093 100%)",
    year: "2022",
    size: "4 MB",
  },
  {
    name: "App Icon Set",
    category: "Branding",
    gradient: "linear-gradient(135deg,#4FACFE 0%,#00F2FE 100%)",
    year: "2023",
    size: "6 MB",
  },
  {
    name: "Typography Play",
    category: "Illustrations",
    gradient: "linear-gradient(135deg,#43E97B 0%,#38F9D7 100%)",
    year: "2021",
    size: "3 MB",
  },
  {
    name: "Motion Reel",
    category: "Motion",
    gradient: "linear-gradient(135deg,#FA709A 0%,#FEE140 100%)",
    year: "2023",
    size: "180 MB",
  },
  {
    name: "Brand Style Guide",
    category: "Branding",
    gradient: "linear-gradient(135deg,#A18CD1 0%,#FBC2EB 100%)",
    year: "2022",
    size: "34 MB",
  },
  {
    name: "Spot Illustrations",
    category: "Illustrations",
    gradient: "linear-gradient(135deg,#FCCB90 0%,#D57EEB 100%)",
    year: "2021",
    size: "15 MB",
  },
  {
    name: "Merch Design",
    category: "Print",
    gradient: "linear-gradient(135deg,#84FAB0 0%,#8FD3F4 100%)",
    year: "2022",
    size: "20 MB",
  },
  {
    name: "Social Templates",
    category: "Branding",
    gradient: "linear-gradient(135deg,#F093FB 0%,#F5576C 100%)",
    year: "2023",
    size: "9 MB",
  },
  {
    name: "Zine Layout",
    category: "Print",
    gradient: "linear-gradient(135deg,#5EE7DF 0%,#B490CA 100%)",
    year: "2021",
    size: "28 MB",
  },
];

const SIDEBAR_ITEMS = [
  { label: "All", icon: "🗂️" },
  { label: "Branding", icon: "🎨" },
  { label: "Illustrations", icon: "✏️" },
  { label: "Posters", icon: "🖼️" },
  { label: "Motion", icon: "🎬" },
  { label: "Print", icon: "🖨️" },
];

/* ── Mac folder SVG ─────────────────────────────────────────────────── */
export function MacFolderIcon({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 60 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fb" x1="30" y1="8" x2="30" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#89CFFF" />
          <stop offset="100%" stopColor="#3A8EF5" />
        </linearGradient>
        <linearGradient id="ff" x1="30" y1="16" x2="30" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5BB8FF" />
          <stop offset="100%" stopColor="#2175E0" />
        </linearGradient>
        <linearGradient id="fsh" x1="30" y1="16" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Tab */}
      <path d="M4 14C4 11.8 5.8 10 8 10H22L26.5 14H4Z" fill="url(#fb)" />
      {/* Back plate */}
      <rect x="4" y="14" width="52" height="30" rx="4" fill="url(#fb)" />
      {/* Front plate */}
      <rect x="4" y="17" width="52" height="27" rx="3" fill="url(#ff)" />
      {/* Shine */}
      <rect x="4" y="17" width="52" height="8" rx="3" fill="url(#fsh)" />
    </svg>
  );
}

/* ── Component ─────────────────────────────────────────────────────── */
interface MacFinderWindowProps {
  onClose: () => void;
}

export default function MacFinderWindow({ onClose }: MacFinderWindowProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [preview, setPreview] = useState<CreativeFile | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered =
    activeCategory === "All"
      ? FILES
      : FILES.filter((f) => f.category === activeCategory);

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        />

        {/* Finder window */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.82, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.86, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative z-10 flex w-[700px] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/88 shadow-[0_32px_90px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl"
          style={{ height: "clamp(400px, 60vh, 480px)" }}
        >
          {/* ── Title bar ─────────────────────────────────────────── */}
          <div className="flex h-10 shrink-0 cursor-grab items-center gap-2 border-b border-black/[0.07] bg-white/55 px-4 active:cursor-grabbing">
            {/* Traffic lights */}
            <button
              onClick={onClose}
              className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57] transition-all hover:brightness-90"
              aria-label="Close"
            >
              <X size={6} className="text-[#820005] opacity-0 transition-opacity group-hover:opacity-80" />
            </button>
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E] opacity-70" />
            <div className="h-3 w-3 rounded-full bg-[#28C840] opacity-70" />

            {/* Title */}
            <span className="flex-1 select-none text-center font-mono text-[11px] font-medium text-neutral-500">
              creative work/
            </span>

            {/* View toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-1 transition-colors ${viewMode === "grid" ? "bg-neutral-200 text-neutral-700" : "text-neutral-400 hover:text-neutral-600"}`}
                aria-label="Grid view"
              >
                <Grid size={12} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded p-1 transition-colors ${viewMode === "list" ? "bg-neutral-200 text-neutral-700" : "text-neutral-400 hover:text-neutral-600"}`}
                aria-label="List view"
              >
                <List size={12} />
              </button>
            </div>
          </div>

          {/* ── Body ──────────────────────────────────────────────── */}
          <div className="flex min-h-0 flex-1">
            {/* Sidebar */}
            <div className="flex w-[130px] shrink-0 flex-col gap-0.5 border-r border-black/[0.06] bg-white/35 p-2.5 pt-3">
              <p className="mb-1.5 px-2 font-mono text-[8.5px] font-semibold uppercase tracking-widest text-neutral-400">
                Favorites
              </p>
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveCategory(item.label)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-mono text-[11px] transition-colors ${
                    activeCategory === item.label
                      ? "bg-accent/12 font-semibold text-accent"
                      : "text-neutral-600 hover:bg-black/[0.04]"
                  }`}
                >
                  <span className="text-[13px] leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* File area */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {viewMode === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {filtered.map((file, i) => (
                      <motion.button
                        key={file.name}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03, duration: 0.18 }}
                        onClick={() => setPreview(file)}
                        className="group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-black/[0.05] active:bg-black/[0.08]"
                      >
                        <div
                          className="h-20 w-full rounded-lg shadow-sm transition-shadow group-hover:shadow-md"
                          style={{ background: file.gradient }}
                        >
                          {file.src && (
                            <img
                              src={file.src}
                              alt={file.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          )}
                        </div>
                        <p className="w-full truncate text-center font-mono text-[10px] text-neutral-700 group-hover:text-neutral-900">
                          {file.name}
                        </p>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex flex-col divide-y divide-black/[0.05]"
                  >
                    {filtered.map((file, i) => (
                      <motion.button
                        key={file.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025, duration: 0.15 }}
                        onClick={() => setPreview(file)}
                        className="group flex items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-black/[0.04] rounded-lg"
                      >
                        <div
                          className="h-8 w-8 shrink-0 rounded-md shadow-sm"
                          style={{ background: file.gradient }}
                        >
                          {file.src && (
                            <img src={file.src} alt="" className="h-full w-full rounded-md object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[11px] font-medium text-neutral-800 group-hover:text-neutral-900">
                            {file.name}
                          </p>
                          <p className="font-mono text-[9px] text-neutral-400">{file.category}</p>
                        </div>
                        <span className="shrink-0 font-mono text-[9px] text-neutral-300">{file.year}</span>
                        <span className="shrink-0 font-mono text-[9px] text-neutral-300">{file.size}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Status bar ────────────────────────────────────────── */}
          <div className="flex shrink-0 items-center border-t border-black/[0.06] bg-white/40 px-4 py-1.5">
            <p className="font-mono text-[9px] text-neutral-400">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>
            <p className="ml-auto font-mono text-[9px] text-neutral-300">
              Drag window to reposition
            </p>
          </div>
        </motion.div>

        {/* ── Full preview overlay ───────────────────────────────── */}
        <AnimatePresence>
          {preview && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setPreview(null)}
                className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.86, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="absolute inset-0 z-30 flex items-center justify-center p-10"
                onClick={() => setPreview(null)}
              >
                <div
                  className="relative max-h-[80vh] max-w-[80vw] min-w-[300px] min-h-[300px] rounded-2xl shadow-2xl"
                  style={{ background: preview.gradient, aspectRatio: "4/3" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {preview.src && (
                    <img
                      src={preview.src}
                      alt={preview.name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  )}
                  {/* Info bar */}
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-5 pt-10">
                    <p className="font-mono text-sm font-semibold text-white">{preview.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-white/60">
                      {preview.category}, {preview.year}
                      {preview.size && ` · ${preview.size}`}
                    </p>
                  </div>
                  {/* Close */}
                  <button
                    onClick={() => setPreview(null)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Close preview"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>,
    document.body
  );
}
