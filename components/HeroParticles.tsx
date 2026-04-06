"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

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
  "microsoft-logo.png": [100, 118],
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
  "self emoticon.png": 95,
  "microsoft-logo.png": 165,
};

interface SlotItem {
  file: string;
  left: number;   // % of hero width
  top: number;    // % of hero height
  depth: number;
  rotation: number;
  opacity: number;
  anchor?: "tl" | "tr" | "bl" | "br";
  hidden?: boolean;
}

const SLOTS: SlotItem[] = [
  // ── RIGHT EDGE — hidden ─────────────────────────────────────────────
  { file: "exportwindow figma.png", left: 97, top: 18, depth: 0.18, rotation: 3,  opacity: 0.46, anchor: "tr", hidden: true },
  { file: "figmacomment.png",       left: 98, top: 42, depth: 0.16, rotation: 2,  opacity: 0.48, anchor: "tr", hidden: true },
  { file: "filterby miro.png",      left: 99, top: 64, depth: 0.14, rotation: -4, opacity: 0.50, anchor: "tr", hidden: true },
  { file: "alert component.png",    left: 99, top: 82, depth: 0.19, rotation: -3, opacity: 0.44, anchor: "tr", hidden: true },

  // ── BOTTOM — hidden ─────────────────────────────────────────────────
  { file: "salesviz.png",           left: 60, top: 94, depth: 0.20, rotation: -3, opacity: 0.50, anchor: "bl", hidden: true },
  { file: "miro PeopleBar.png",     left: 80, top: 97, depth: 0.17, rotation: 1,  opacity: 0.48, anchor: "bl", hidden: true },

  // ── LEFT EDGE ───────────────────────────────────────────────────────
  { file: "CreationBarmiro.png",    left: 0,  top: 22, depth: 0.09, rotation: -5, opacity: 0.42, anchor: "tl", hidden: true },
  { file: "self emoticon.png",      left: 1,  top: 42, depth: 0.12, rotation: -6, opacity: 0.90, anchor: "tl" },
  { file: "conversionviz.png",      left: 1,  top: 68, depth: 0.14, rotation: 4,  opacity: 0.40, anchor: "tl", hidden: true },

  // ── MICROSOFT BADGE ─────────────────────────────────────────────────
  { file: "microsoft-logo.png",     left: 7,  top: 8,  depth: 0.13, rotation: 6,  opacity: 1,    anchor: "tl" },
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
const DROP_ZONE = { left: 3, top: 68, width: 17, height: 18 }; // % of hero
// Center exclusion: stickers dropped here won't trigger game
const CENTER_ZONE = { left: 18, right: 82, top: 15, bottom: 85 };

/* ── Component ──────────────────────────────────────────────────────── */
export default function HeroParticles({ onGameStart }: { onGameStart?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Self-emoticon video audio state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [dropFlash, setDropFlash] = useState(false);

  // Smooth scroll parallax
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>(0);
  const latestY = useRef(0);

  // Hover state
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // One-time drag hint on load — tilt all stickers then snap back
  // On first visit the loading screen covers for ~3300ms, so delay until after it lifts
  const [hintActive, setHintActive] = useState(false);
  useEffect(() => {
    const isFirstVisit = !sessionStorage.getItem("loadingSeen");
    const delay = isFirstVisit ? 3800 : 900;
    const t1 = setTimeout(() => setHintActive(true),  delay);
    const t2 = setTimeout(() => setHintActive(false), delay + 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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
          // Reset sticker position, flash, then start game
          dragRef.current = null;
          setDraggingIdx(null);
          setLiveDelta(null);
          setDropFlash(true);
          setTimeout(() => onGameStart(), 680);
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
      {/* ── Global keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes dropZoneBlink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
        @keyframes dropFlashAnim { 0% { opacity:0; } 18% { opacity:0.78; } 100% { opacity:0; } }
      `}</style>

      {/* ── Drop flash overlay ────────────────────────────────── */}
      {dropFlash && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{ zIndex: 9998, background: "#FF5210", animation: "dropFlashAnim 0.68s ease-out forwards" }}
          onAnimationEnd={() => setDropFlash(false)}
        />
      )}

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
        {/* Pixel character face */}
        <div
          className="drop-zone-ring relative flex h-20 w-20 items-center justify-center rounded-xl"
          style={{
            border: draggingIdx !== null ? "2px dashed rgba(255,82,16,0.8)" : "2px dashed transparent",
            background: draggingIdx !== null ? "rgba(255,82,16,0.07)" : "transparent",
            animation: draggingIdx !== null ? "dropZoneBlink 0.55s ease-in-out infinite" : "none",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          <div className="drop-zone-pulse absolute inset-0 rounded-xl" />
          {/* Pixel art face using CSS grid of divs */}
          <div style={{ position: "relative", width: 28, height: 36, imageRendering: "pixelated", flexShrink: 0 }}>
            {/* Hair */}
            <div style={{ position:"absolute", top:0, left:2, width:24, height:6, background:"#1a1a1a", borderRadius:1 }} />
            <div style={{ position:"absolute", top:2, left:0, width:4, height:8, background:"#1a1a1a" }} />
            {/* Head */}
            <div style={{ position:"absolute", top:4, left:2, width:22, height:14, background:"#D4956A" }} />
            {/* Visor / cap brim */}
            <div style={{ position:"absolute", top:6, left:2, width:22, height:3, background:"#FF5210" }} />
            {/* Eyes */}
            <div style={{ position:"absolute", top:10, left:6, width:4, height:4, background:"#1a1a1a" }} />
            <div style={{ position:"absolute", top:10, left:16, width:4, height:4, background:"#1a1a1a" }} />
            {/* Eye shines */}
            <div style={{ position:"absolute", top:10, left:8, width:1, height:1, background:"#fff" }} />
            <div style={{ position:"absolute", top:10, left:18, width:1, height:1, background:"#fff" }} />
            {/* Smile */}
            <div style={{ position:"absolute", top:15, left:7, width:12, height:2, background:"#c07850" }} />
            <div style={{ position:"absolute", top:17, left:8, width:10, height:1, background:"#8B4513" }} />
            {/* Body */}
            <div style={{ position:"absolute", top:18, left:4, width:18, height:10, background:"#FF5210" }} />
            {/* Badge */}
            <div style={{ position:"absolute", top:20, left:11, width:4, height:3, background:"#FFD700", border:"1px solid #cc8800" }} />
            {/* Legs */}
            <div style={{ position:"absolute", top:28, left:4, width:8, height:8, background:"#1a237e" }} />
            <div style={{ position:"absolute", top:28, left:14, width:8, height:8, background:"#283593" }} />
          </div>
        </div>
        {/* Game badge */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{
            background:"#FF5210", color:"#fff",
            fontFamily:"monospace", fontSize:8, fontWeight:700,
            padding:"2px 6px", borderRadius:3, letterSpacing:"0.08em",
            textTransform:"uppercase", border:"1px solid #cc4200",
          }}>
            🎮 GAME
          </div>
          <span className="font-mono text-[9px] font-bold tracking-wider text-accent text-center leading-tight">
            Save PixelCo
          </span>
          <span className="font-mono text-[8px] tracking-wide text-neutral-400 text-center leading-tight">
            drop sticker here
          </span>
        </div>
      </div>
      {SLOTS.map((item, i) => { if (item.hidden) return null;
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
        const imgFilter = `none`;
        const avatarFilter = `none`;

        // Don't apply parallax to dragged item — feels more grounded
        const txParallax = isDragging ? 0 : 0;
        const tyParallax = isDragging ? 0 : -parallaxDrift;
        // Hint tilt: alternates direction per sticker, staggered by index
        const hintRot = hintActive ? (i % 2 === 0 ? 10 : -10) : 0;
        const rot = isDragging
          ? item.rotation
          : item.rotation + parallaxRotate + hintRot;

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
                ? "opacity 0.15s"
                : `transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${hintActive ? `${i * 0.04}s` : "0s"}, opacity 0.25s`,
            }}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerEnter={() => setHoveredIdx(i)}
            onPointerLeave={() => { if (!isDragging) setHoveredIdx(null); }}
          >
            {item.file === "microsoft-logo.png" ? (
              <>
                {/* Confetti keyframes — injected once per render, cheap */}
                <style>{`
                  @keyframes cf1 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-38px,-62px) rotate(280deg);opacity:0}}
                  @keyframes cf2 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(34px,-68px) rotate(-260deg);opacity:0}}
                  @keyframes cf3 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-16px,-74px) rotate(190deg);opacity:0}}
                  @keyframes cf4 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(18px,-70px) rotate(-190deg);opacity:0}}
                  @keyframes cf5 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-54px,-28px) rotate(330deg);opacity:0}}
                  @keyframes cf6 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(52px,-32px) rotate(-330deg);opacity:0}}
                  @keyframes cf7 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-6px,-80px) rotate(400deg);opacity:0}}
                  @keyframes cf8 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(8px,-76px) rotate(-400deg);opacity:0}}
                  @keyframes cf9 {0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-62px,-10px) rotate(240deg);opacity:0}}
                  @keyframes cf10{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(60px,-14px) rotate(-240deg);opacity:0}}
                  @keyframes cf11{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-28px,-58px) rotate(160deg);opacity:0}}
                  @keyframes cf12{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(26px,-54px) rotate(-160deg);opacity:0}}
                `}</style>

                <div style={{ width: "100%", height: "100%", position: "relative", overflow: "visible", pointerEvents: "none", userSelect: "none" }}>

                  {/* Trophy + confetti — top-right corner of Microsoft logo */}
                  <div style={{
                    position: "absolute",
                    bottom: 48,
                    right: -10,
                    width: 60,
                    height: 68,
                    zIndex: 10,
                    transform: `scale(${isHovered ? 1.2 : 1}) rotate(${isHovered ? 8 : 0}deg)`,
                    transformOrigin: "center bottom",
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {/* Confetti pieces — bigger, more spread */}
                    {([
                      { a:"cf1",  c:"#FF5210", d:"0s",    w:7,  h:4,  r:false },
                      { a:"cf2",  c:"#FFB800", d:"0.5s",  w:5,  h:5,  r:true  },
                      { a:"cf3",  c:"#8E60F0", d:"1.0s",  w:7,  h:3,  r:false },
                      { a:"cf4",  c:"#22C55E", d:"1.5s",  w:5,  h:5,  r:true  },
                      { a:"cf5",  c:"#FF5210", d:"0.75s", w:6,  h:3,  r:false },
                      { a:"cf6",  c:"#FFB800", d:"1.25s", w:6,  h:4,  r:false },
                      { a:"cf7",  c:"#8E60F0", d:"0.25s", w:4,  h:6,  r:false },
                    ] as {a:string;c:string;d:string;w:number;h:number;r:boolean}[]).map((p, idx) => (
                      <div key={idx} style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        width: p.w, height: p.h,
                        marginTop: -(p.h/2), marginLeft: -(p.w/2),
                        borderRadius: p.r ? "50%" : "2px",
                        backgroundColor: p.c,
                        animation: `${p.a} 2.4s ease-out ${p.d} infinite`,
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
                      style={{ width:"100%", height:"auto", display:"block", filter: imgFilter }}
                    />
                  </div>

                  {/* Hover tooltip — plain text below the logo */}
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: "50%",
                    transform: `translateX(-50%) translateY(${isHovered ? "0px" : "-4px"}) rotate(-6deg)`,
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.22s ease, transform 0.22s ease",
                    zIndex: 100,
                    fontFamily: "monospace", fontSize: 9, color: "#555",
                    letterSpacing: "0.04em", fontWeight: 500,
                    textAlign: "center", lineHeight: 1.6, whiteSpace: "pre",
                  }}>
                    MLSA&apos;s Vinci di UI<br />Design Challenge Winner
                  </div>
                </div>
              </>
            ) : item.file === "self emoticon.png" ? (
              <div className="relative" style={{ width: "100%", height: "100%" }}>
                <video
                  ref={videoRef}
                  src="/Profileaudioalternative.mp4"
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
                    filter: avatarFilter,
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
                  filter: imgFilter,
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
