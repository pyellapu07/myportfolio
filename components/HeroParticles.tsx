"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, Volume2, VolumeX } from "lucide-react";

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
  "microsoft-logo.png": [100, 165],
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
  "microsoft-logo.png": 88,
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

  // ── MICROSOFT BADGE ────────────────────────────────────────────────
  { file: "microsoft-logo.png", left: 4, top: 55, depth: 0.13, rotation: 7, opacity: 1, anchor: "tl" },

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

  // Self-emoticon video audio state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

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
      className="pointer-events-none absolute inset-0 z-[15] hidden overflow-hidden md:block"
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
        <span className="font-mono text-[10px] tracking-wider text-neutral-400 text-center leading-tight">
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
        const shadow = "none";

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
              opacity: 1,
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
            {item.file === "microsoft-logo.png" ? (
              <>
                {/* Confetti keyframes — injected once per render, cheap */}
                <style>{`
                  @keyframes cf1{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(-22px,-34px) rotate(220deg) scale(0);opacity:0}}
                  @keyframes cf2{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(22px,-34px) rotate(-220deg) scale(0);opacity:0}}
                  @keyframes cf3{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(-10px,-44px) rotate(140deg) scale(0);opacity:0}}
                  @keyframes cf4{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(10px,-44px) rotate(-140deg) scale(0);opacity:0}}
                  @keyframes cf5{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(-32px,-14px) rotate(310deg) scale(0);opacity:0}}
                  @keyframes cf6{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(32px,-14px) rotate(-310deg) scale(0);opacity:0}}
                  @keyframes cf7{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(-4px,-50px) rotate(360deg) scale(0);opacity:0}}
                  @keyframes cf8{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(4px,-50px) rotate(-360deg) scale(0);opacity:0}}
                  @keyframes cf9{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(-38px,-6px) rotate(200deg) scale(0);opacity:0}}
                  @keyframes cf10{0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1}100%{transform:translate(38px,-6px) rotate(-200deg) scale(0);opacity:0}}
                `}</style>

                <div style={{ width: "100%", height: "100%", position: "relative", overflow: "visible", pointerEvents: "none", userSelect: "none" }}>

                  {/* Trophy + confetti — always visible, bounces on hover */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: 72,
                    height: 80,
                    transform: `translateX(-50%) scale(${isHovered ? 1.2 : 1}) rotate(${isHovered ? -6 : 0}deg)`,
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {/* Confetti pieces */}
                    {([
                      { a:"cf1",  c:"#FF5210", d:"0s",    s:5, r:true  },
                      { a:"cf2",  c:"#FFB800", d:"0.18s", s:4, r:false },
                      { a:"cf3",  c:"#8E60F0", d:"0.36s", s:5, r:false },
                      { a:"cf4",  c:"#22C55E", d:"0.54s", s:4, r:true  },
                      { a:"cf5",  c:"#FF5210", d:"0.72s", s:3, r:true  },
                      { a:"cf6",  c:"#FFB800", d:"0.9s",  s:4, r:false },
                      { a:"cf7",  c:"#8E60F0", d:"0.12s", s:3, r:true  },
                      { a:"cf8",  c:"#22C55E", d:"0.48s", s:5, r:false },
                      { a:"cf9",  c:"#FF5210", d:"0.66s", s:4, r:true  },
                      { a:"cf10", c:"#FFB800", d:"0.3s",  s:3, r:false },
                    ] as {a:string;c:string;d:string;s:number;r:boolean}[]).map((p, idx) => (
                      <div key={idx} style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        width: p.s, height: p.s,
                        marginTop: -(p.s/2), marginLeft: -(p.s/2),
                        borderRadius: p.r ? "50%" : "1px",
                        backgroundColor: p.c,
                        animation: `${p.a} 1.7s ease-out ${p.d} infinite`,
                      }}/>
                    ))}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Trophy.png" alt="" draggable={false}
                      style={{ width:"100%", height:"100%", objectFit:"contain", position:"relative", zIndex:5 }}
                    />
                  </div>

                  {/* Microsoft logo — pops on hover */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    transform: `scale(${isHovered ? 1.1 : 1})`,
                    transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                    transformOrigin: "center bottom",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/microsoft-logo.png" alt="Microsoft MLSA 1st Place" draggable={false}
                      style={{ width:"100%", height:"auto", display:"block" }}
                    />
                  </div>

                  {/* Hover tooltip */}
                  <div style={{
                    position: "absolute",
                    bottom: "calc(100% + 4px)",
                    left: "50%",
                    transform: `translateX(-50%) translateY(${isHovered ? "0px" : "6px"})`,
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.22s ease, transform 0.22s ease",
                    whiteSpace: "nowrap", zIndex: 100,
                  }}>
                    <div style={{
                      background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)",
                      borderRadius: 8, padding: "5px 10px",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                      fontFamily: "monospace", fontSize: 9, color: "#333",
                      letterSpacing: "0.04em", fontWeight: 500,
                    }}>
                      1st Place · MLSA Vinci Di UI · 2021
                    </div>
                  </div>
                </div>
              </>
            ) : item.file === "self emoticon.png" ? (
              <div className="relative" style={{ width: "100%", height: "100%" }}>
                <video
                  ref={videoRef}
                  src="/grok-video-202a19e2-8bfb-4c98-8ac7-c28be5820793.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Pradeep's animated avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    borderRadius: "50%",
                    objectFit: "cover",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                  onEnded={() => {
                    if (videoRef.current && !videoRef.current.muted) {
                      videoRef.current.muted = true;
                      videoRef.current.loop = true;
                      videoRef.current.play();
                      setIsMuted(true);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      if (isMuted) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.muted = false;
                        videoRef.current.loop = false;
                        videoRef.current.play();
                        setIsMuted(false);
                      } else {
                        videoRef.current.muted = true;
                        videoRef.current.loop = true;
                        setIsMuted(true);
                      }
                    }
                  }}
                  style={{ pointerEvents: "auto" }}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-500 backdrop-blur-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={isMuted ? "Listen to intro" : "Mute"}
                >
                  {isMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
                </button>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`/anti gravity/${item.file}`}
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
            )}
          </div>
        );
      })}
    </div>
  );
}
