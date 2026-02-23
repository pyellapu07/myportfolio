"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search } from "lucide-react";

/* ── Natural dimensions (px) ────────────────────────────────────────── */
const NATURAL: Record<string, [number, number]> = {
  "alert component.png": [167, 232],
  "color figma.png": [147, 29],
  "componentfigma.png": [197, 37],
  "conversionviz.png": [170, 196],
  "CreationBarmiro.png": [70, 420],
  "Cursor miro.png": [76, 36],
  "exportwindow figma.png": [961, 490],
  "figmacomment.png": [414, 210],
  "filterby miro.png": [225, 261],
  "findbarfigma.png": [235, 34],
  "maincomponent figma.png": [147, 36],
  "miro PeopleBar.png": [358, 72],
  "navbar figma.png": [1492, 144],
  "pagination figma.png": [276, 38],
  "salesviz.png": [170, 128],
  "search figma.png": [289, 41],
  "togglefigma.png": [221, 115],
  "variants figma.png": [155, 239],
  "self emoticon.png": [1024, 1024],
};

const DISPLAY_W: Record<string, number> = {
  "alert component.png": 110,
  "color figma.png": 120,
  "componentfigma.png": 140,
  "conversionviz.png": 120,
  "CreationBarmiro.png": 52,
  "Cursor miro.png": 80,
  "exportwindow figma.png": 220,
  "figmacomment.png": 180,
  "filterby miro.png": 130,
  "findbarfigma.png": 160,
  "maincomponent figma.png": 130,
  "miro PeopleBar.png": 190,
  "navbar figma.png": 240,
  "pagination figma.png": 150,
  "salesviz.png": 120,
  "search figma.png": 160,
  "togglefigma.png": 130,
  "variants figma.png": 100,
  "self emoticon.png": 90,
};

interface SlotItem {
  file: string;
  left: number;   // % of hero width
  top: number;    // % of hero height
  depth: number;
  rotation: number;
  opacity: number;
  anchor?: "tl" | "tr" | "bl" | "br";
}

const SLOTS: SlotItem[] = [
  // ── TOP EDGE ───────────────────────────────────────────────────────
  { file: "navbar figma.png", left: 72, top: 12, depth: 0.10, rotation: -1, opacity: 0.48, anchor: "tl" },
  { file: "color figma.png", left: 84, top: 18, depth: 0.07, rotation: 2, opacity: 0.52, anchor: "tl" },
  { file: "componentfigma.png", left: 62, top: 22, depth: 0.13, rotation: -2, opacity: 0.50, anchor: "tl" },

  // ── RIGHT EDGE ─────────────────────────────────────────────────────
  { file: "exportwindow figma.png", left: 97, top: 28, depth: 0.18, rotation: 3, opacity: 0.46, anchor: "tr" },
  { file: "filterby miro.png", left: 99, top: 48, depth: 0.14, rotation: -4, opacity: 0.50, anchor: "tr" },
  { file: "figmacomment.png", left: 98, top: 64, depth: 0.16, rotation: 2, opacity: 0.48, anchor: "tr" },
  { file: "alert component.png", left: 99, top: 78, depth: 0.19, rotation: -3, opacity: 0.44, anchor: "tr" },

  // ── BOTTOM EDGE ────────────────────────────────────────────────────
  { file: "salesviz.png", left: 62, top: 94, depth: 0.20, rotation: -3, opacity: 0.50, anchor: "bl" },
  { file: "miro PeopleBar.png", left: 76, top: 97, depth: 0.17, rotation: 1, opacity: 0.48, anchor: "bl" },
  { file: "togglefigma.png", left: 88, top: 92, depth: 0.12, rotation: -2, opacity: 0.52, anchor: "bl" },

  // ── LEFT EDGE ──────────────────────────────────────────────────────
  { file: "CreationBarmiro.png", left: 0, top: 28, depth: 0.09, rotation: -5, opacity: 0.42, anchor: "tl" },
  { file: "conversionviz.png", left: 2, top: 52, depth: 0.14, rotation: 4, opacity: 0.40, anchor: "tl" },
  { file: "self emoticon.png", left: 3, top: 38, depth: 0.12, rotation: -6, opacity: 0.55, anchor: "tl" },
  { file: "variants figma.png", left: 1, top: 72, depth: 0.11, rotation: -3, opacity: 0.38, anchor: "tl" },

  // ── TOP-LEFT ───────────────────────────────────────────────────────
  { file: "Cursor miro.png", left: 3, top: 12, depth: 0.06, rotation: 8, opacity: 0.38, anchor: "tl" },
  { file: "maincomponent figma.png", left: 5, top: 17, depth: 0.08, rotation: -3, opacity: 0.40, anchor: "tl" },

  // ── BOTTOM-LEFT ────────────────────────────────────────────────────
  { file: "pagination figma.png", left: 2, top: 96, depth: 0.11, rotation: 2, opacity: 0.44, anchor: "bl" },
  { file: "search figma.png", left: 20, top: 98, depth: 0.14, rotation: -1, opacity: 0.46, anchor: "bl" },
  { file: "findbarfigma.png", left: 38, top: 97, depth: 0.15, rotation: 1, opacity: 0.44, anchor: "bl" },
];

/* ── Helpers ────────────────────────────────────────────────────────── */
function getDisplayH(file: string): number {
  const w = DISPLAY_W[file];
  const nat = NATURAL[file];
  return nat ? Math.round(w * (nat[1] / nat[0])) : 60;
}

function getAnchorOffset(anchor: SlotItem["anchor"], w: number, h: number) {
  const ox = (anchor === "tr" || anchor === "br") ? -w : 0;
  const oy = (anchor === "bl" || anchor === "br") ? -h : 0;
  return { ox, oy };
}

/* ── Types ──────────────────────────────────────────────────────────── */
interface PlacedOffset {
  // px offset FROM the original anchor position, accumulated across drags
  dx: number;
  dy: number;
}

/* ── Drop zone config ──────────────────────────────────────────────── */
const DROP_ZONE = { left: 2, top: 82, width: 14, height: 14 }; // % of hero
// Center exclusion: stickers dropped here won't trigger game
const CENTER_ZONE = { left: 18, right: 82, top: 15, bottom: 85 };

/* ── Component ──────────────────────────────────────────────────────── */
export default function HeroParticles({ onGameStart }: { onGameStart?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll parallax
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>(0);
  const latestY = useRef(0);

  // Hover state
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Drag state — all in refs so rAF loop stays stable
  const dragRef = useRef<{
    idx: number;
    startMouseX: number;
    startMouseY: number;
    startDx: number;
    startDy: number;
  } | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Per-item placed offsets (px), updated on drop
  const [placed, setPlaced] = useState<PlacedOffset[]>(
    () => SLOTS.map(() => ({ dx: 0, dy: 0 }))
  );
  // Live drag delta shown during drag (not committed yet)
  const [liveDelta, setLiveDelta] = useState<{ dx: number; dy: number } | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  /* ── Scroll loop ─────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => { latestY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    const loop = () => {
      setScrollY((prev) => {
        const next = prev + (latestY.current - prev) * 0.1;
        return Math.abs(next - prev) < 0.05 ? latestY.current : next;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Global pointer move + up ────────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!dragRef.current) return;
      const ddx = e.clientX - dragRef.current.startMouseX;
      const ddy = e.clientY - dragRef.current.startMouseY;
      setLiveDelta({ dx: dragRef.current.startDx + ddx, dy: dragRef.current.startDy + ddy });
    };

    const onUp = () => {
      if (!dragRef.current) return;
      const { idx, startMouseX, startMouseY, startDx, startDy } = dragRef.current;
      const ddx = mouseRef.current.x - startMouseX;
      const ddy = mouseRef.current.y - startMouseY;

      // Check drop zone hit
      const container = containerRef.current;
      if (container && onGameStart) {
        const rect = container.getBoundingClientRect();
        const dropLeft = rect.left + (DROP_ZONE.left / 100) * rect.width;
        const dropTop = rect.top + (DROP_ZONE.top / 100) * rect.height;
        const dropW = (DROP_ZONE.width / 100) * rect.width;
        const dropH = (DROP_ZONE.height / 100) * rect.height;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        // Also check NOT in center content zone
        const pctX = ((mx - rect.left) / rect.width) * 100;
        const pctY = ((my - rect.top) / rect.height) * 100;
        const inCenter = pctX > CENTER_ZONE.left && pctX < CENTER_ZONE.right && pctY > CENTER_ZONE.top && pctY < CENTER_ZONE.bottom;
        const inDrop = mx >= dropLeft && mx <= dropLeft + dropW && my >= dropTop && my <= dropTop + dropH;
        if (inDrop && !inCenter) {
          // Reset sticker position and start game
          dragRef.current = null;
          setDraggingIdx(null);
          setLiveDelta(null);
          onGameStart();
          return;
        }
      }

      setPlaced((prev) => {
        const next = [...prev];
        next[idx] = { dx: startDx + ddx, dy: startDy + ddy };
        return next;
      });
      dragRef.current = null;
      setDraggingIdx(null);
      setLiveDelta(null);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  /* ── Drag start ──────────────────────────────────────────────────── */
  const onPointerDown = useCallback((e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    dragRef.current = {
      idx,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startDx: placed[idx].dx,
      startDy: placed[idx].dy,
    };
    setDraggingIdx(idx);
  }, [placed]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-[5] hidden overflow-hidden md:block"
    >
      {/* ── Glowing drop zone ─────────────────────────────────── */}
      <div
        className="pointer-events-none absolute flex flex-col items-center justify-center gap-2"
        style={{
          left: `${DROP_ZONE.left}%`,
          top: `${DROP_ZONE.top}%`,
          width: `${DROP_ZONE.width}%`,
          height: `${DROP_ZONE.height}%`,
        }}
      >
        <div className="drop-zone-ring relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-accent/40">
          <div className="drop-zone-pulse absolute inset-0 rounded-full border-2 border-accent/20" />
          <Search size={20} className="text-accent/50" />
        </div>
        <span className="font-mono text-[10px] tracking-wider text-white/25 text-center leading-tight">
          Drop a sticker
        </span>
      </div>
      {SLOTS.map((item, i) => {
        const w = DISPLAY_W[item.file];
        const h = getDisplayH(item.file);
        const anchor = item.anchor ?? "tl";
        const { ox, oy } = getAnchorOffset(anchor, w, h);

        const parallaxDrift = scrollY * item.depth;
        const parallaxRotate = scrollY * item.depth * 0.035;

        // Placed offset (committed) or live drag offset
        const isDragging = draggingIdx === i;
        const effectiveDx = isDragging && liveDelta ? liveDelta.dx : placed[i].dx;
        const effectiveDy = isDragging && liveDelta ? liveDelta.dy : placed[i].dy;

        const isHovered = hoveredIdx === i;

        const scale = isDragging ? 1.04 : isHovered ? 1.04 : 1;
        const shadow = isDragging
          ? "drop-shadow(0 20px 40px rgba(0,0,0,0.7)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
          : isHovered
            ? "drop-shadow(0 12px 28px rgba(0,0,0,0.65)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))"
            : "drop-shadow(0 6px 20px rgba(0,0,0,0.5))";

        // Don't apply parallax to dragged item — feels more grounded
        const txParallax = isDragging ? 0 : 0;
        const tyParallax = isDragging ? 0 : -parallaxDrift;
        const rot = isDragging
          ? item.rotation                          // no extra spin while dragging
          : item.rotation + parallaxRotate;

        return (
          <div
            key={i}
            className="pointer-events-auto absolute"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              width: w,
              height: h,
              transform: `translate(${ox + effectiveDx + txParallax}px, ${oy + effectiveDy + tyParallax}px) rotate(${rot}deg) scale(${scale})`,
              opacity: isHovered || isDragging ? Math.min(item.opacity + 0.18, 0.92) : item.opacity,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 50 : isHovered ? 20 : 5,
              willChange: "transform, opacity",
              transition: isDragging
                ? "opacity 0.15s, filter 0.15s"   // no transform transition while dragging
                : "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s, filter 0.25s",
            }}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerEnter={() => setHoveredIdx(i)}
            onPointerLeave={() => { if (!isDragging) setHoveredIdx(null); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.file === "self emoticon.png" ? `/${item.file}` : `/anti gravity/${item.file}`}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                filter: shadow,

                userSelect: "none",
                pointerEvents: "none",
                transition: "filter 0.25s",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
