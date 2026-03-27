"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────── */

interface CollectibleDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  x: number;
  y: number;
}

interface EnemyDef {
  id: number;
  label: string;
  method: string;
  color: string;
  x: number;
  desc: string;
}

interface PlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
}

interface GameCollectible extends CollectibleDef {
  collected: boolean;
  bobOffset: number;
}

interface GameEnemy extends EnemyDef {
  alive: boolean;
  px: number;
  py: number;
  vx: number;
  squishTimer: number;
  speechTimer: number;
  speechText: string;
  dir: number;
  spawnX: number;
}

interface DialogueBubble {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

interface SpeechBubble {
  text: string;
  x: number;
  y: number;
  timer: number;
}

interface GameState {
  playerX: number;
  playerY: number;
  playerVX: number;
  playerVY: number;
  playerOnGround: boolean;
  playerJumpsLeft: number;
  playerFacing: number;
  playerFlashRed: number;
  frameCount: number;
  cameraX: number;
  lives: number;
  collectedIds: Set<string>;
  enemiesDefeated: number;
  checkpointX: number;
  collectibles: GameCollectible[];
  enemies: GameEnemy[];
  dialogueBubble: DialogueBubble | null;
  nextDialogueIn: number;
  speechBubbles: SpeechBubble[];
  startTime: number;
  gameOver: boolean;
  won: boolean;
  invincibleTimer: number;
}

/* ─── Constants ──────────────────────────────────────────────── */

const CANVAS_H = 480;
const LEVEL_W = 7000;
const GRAVITY = 0.6;
const JUMP_VY = -13;
const RUN_SPEED = 4;
const MAX_FALL = 14;

const DIALOGUE_LINES = [
  "I hope this is a recruiter playing 👀",
  "one interview would be great right?? hehe",
  "no stress at all. really. REALLY.",
  "if you wanna reach out... 2406107815 📱",
  "another dark pattern? I've seen worse.",
  "scope creep. my old nemesis.",
  "this would look great in a case study 😏",
  "UX saves lives. well, products. same thing.",
  "I ship things that users actually use 🎯",
];

// Water bodies (level X positions, 120px wide each)
const WATER_BODIES = [
  { x: 1050, w: 120 },
  { x: 2800, w: 120 },
  { x: 4200, w: 120 },
];

// Background tree positions
const TREE_POSITIONS = [250, 900, 1500, 2100, 2700, 3300, 3900, 4500, 5100, 5700, 600, 1200, 1800, 2400, 3000];

// Bird definitions (world coords)
const BIRD_DEFS = [
  { x: 200,  y: 80,  speed: 0.8,  wingPhase: 0 },
  { x: 800,  y: 120, speed: 0.6,  wingPhase: 1 },
  { x: 1400, y: 60,  speed: 1.0,  wingPhase: 0.5 },
  { x: 2000, y: 100, speed: 0.7,  wingPhase: 1.5 },
  { x: 2600, y: 140, speed: 0.9,  wingPhase: 0.3 },
  { x: 3200, y: 75,  speed: 0.5,  wingPhase: 0.8 },
  { x: 3800, y: 110, speed: 0.8,  wingPhase: 1.2 },
  { x: 4400, y: 90,  speed: 0.6,  wingPhase: 0.6 },
];

function makePlatforms(H: number): PlatformDef[] {
  return [
    { x: 400, y: H - 160, w: 120, h: 18, c: "#6b3a1f" },
    { x: 600, y: H - 200, w: 100, h: 18, c: "#6b3a1f" },
    { x: 800, y: H - 150, w: 140, h: 18, c: "#6b3a1f" },
    { x: 1050, y: H - 220, w: 80, h: 18, c: "#6b3a1f" },
    { x: 1200, y: H - 170, w: 120, h: 18, c: "#6b3a1f" },
    { x: 1400, y: H - 200, w: 100, h: 18, c: "#6b3a1f" },
    { x: 1600, y: H - 160, w: 160, h: 18, c: "#6b3a1f" },
    { x: 1900, y: H - 230, w: 90, h: 18, c: "#6b3a1f" },
    { x: 2100, y: H - 180, w: 110, h: 18, c: "#6b3a1f" },
    { x: 2350, y: H - 210, w: 130, h: 18, c: "#6b3a1f" },
    { x: 2600, y: H - 160, w: 100, h: 18, c: "#6b3a1f" },
    { x: 2800, y: H - 240, w: 80, h: 18, c: "#6b3a1f" },
    { x: 3000, y: H - 190, w: 120, h: 18, c: "#6b3a1f" },
    { x: 3300, y: H - 220, w: 100, h: 18, c: "#6b3a1f" },
    { x: 3500, y: H - 170, w: 140, h: 18, c: "#6b3a1f" },
    { x: 3800, y: H - 200, w: 90, h: 18, c: "#6b3a1f" },
    { x: 4100, y: H - 160, w: 120, h: 18, c: "#6b3a1f" },
    { x: 4400, y: H - 230, w: 100, h: 18, c: "#6b3a1f" },
    { x: 4700, y: H - 190, w: 130, h: 18, c: "#6b3a1f" },
    { x: 5000, y: H - 210, w: 110, h: 18, c: "#6b3a1f" },
  ];
}

function makeCollectibles(H: number): GameCollectible[] {
  const defs: CollectibleDef[] = [
    { id: "research", label: "User Research", icon: "🔍", color: "#FF9800", x: 500, y: H - 200 },
    { id: "journey", label: "Journey Map", icon: "🗺️", color: "#9C27B0", x: 900, y: H - 190 },
    { id: "brainstorm", label: "Brainstorm", icon: "💡", color: "#FFC107", x: 1300, y: H - 210 },
    { id: "interviews", label: "Stakeholder Int.", icon: "👥", color: "#2196F3", x: 1700, y: H - 200 },
    { id: "wireframe", label: "Wireframes", icon: "📐", color: "#00BCD4", x: 2200, y: H - 260 },
    { id: "prototype", label: "Prototype", icon: "🎨", color: "#E91E63", x: 2700, y: H - 200 },
    { id: "testing", label: "User Testing", icon: "🧪", color: "#4CAF50", x: 3200, y: H - 220 },
    { id: "devhandoff", label: "Dev Handoff", icon: "💻", color: "#FF5722", x: 3700, y: H - 200 },
    { id: "deploy", label: "Deploy", icon: "🚀", color: "#673AB7", x: 4300, y: H - 200 },
    { id: "branding", label: "Branding", icon: "🏷️", color: "#FF5210", x: 5100, y: H - 210 },
  ];
  return defs.map((d, i) => ({ ...d, collected: false, bobOffset: i * 0.7 }));
}

function makeEnemies(H: number): GameEnemy[] {
  const defs: EnemyDef[] = [
    { id: 0, label: "Dark Pattern Dan", method: "User Testing", color: "#e74c3c", x: 700, desc: "Tricks users with fake UI" },
    { id: 1, label: "Scope Creep Steve", method: "Sprint Planning", color: "#8e44ad", x: 1100, desc: "Keeps adding features" },
    { id: 2, label: "Lorem Ipsum Larry", method: "Content Strategy", color: "#d35400", x: 1500, desc: "No real copy anywhere" },
    { id: 3, label: "Skip Research Rico", method: "User Interviews", color: "#c0392b", x: 2000, desc: "Ships without testing" },
    { id: 4, label: "Deadline Dave", method: "Agile Sprints", color: "#16a085", x: 2500, desc: "Ships broken products" },
    { id: 5, label: "No Accessibility Al", method: "WCAG Audit", color: "#2980b9", x: 3100, desc: "Ignores disabled users" },
    { id: 6, label: "Silo Sarah", method: "Cross-Func Teams", color: "#8e44ad", x: 3800, desc: "Never talks to devs" },
    { id: 7, label: "Deploy Friday Fred", method: "CI/CD Pipeline", color: "#e67e22", x: 4600, desc: "Deploys on Friday 5pm" },
  ];
  return defs.map((d) => ({
    ...d,
    alive: true,
    px: d.x,
    py: H - 60 - 24,
    vx: 1.2,
    squishTimer: 0,
    speechTimer: 0,
    speechText: "",
    dir: 1,
    spawnX: d.x,
  }));
}

/* ─── Web Audio helpers ──────────────────────────────────────── */

function playJump(actx: AudioContext) {
  try {
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.connect(g);
    g.connect(actx.destination);
    o.type = "square";
    o.frequency.setValueAtTime(300, actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(600, actx.currentTime + 0.1);
    g.gain.setValueAtTime(0.3, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.15);
    o.start();
    o.stop(actx.currentTime + 0.15);
  } catch (_) { /* ignore */ }
}

function playCollect(actx: AudioContext) {
  try {
    [523, 659, 784].forEach((freq, i) => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.connect(g);
      g.connect(actx.destination);
      o.type = "square";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.2, actx.currentTime + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.08 + 0.15);
      o.start(actx.currentTime + i * 0.08);
      o.stop(actx.currentTime + i * 0.08 + 0.15);
    });
  } catch (_) { /* ignore */ }
}

function playKill(actx: AudioContext) {
  try {
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.connect(g);
    g.connect(actx.destination);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(200, actx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, actx.currentTime + 0.2);
    g.gain.setValueAtTime(0.4, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.2);
    o.start();
    o.stop(actx.currentTime + 0.2);
  } catch (_) { /* ignore */ }
}

function playWin(actx: AudioContext) {
  try {
    const melody = [523, 523, 659, 523, 784, 740];
    melody.forEach((freq, i) => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.connect(g);
      g.connect(actx.destination);
      o.type = "square";
      o.frequency.value = freq;
      const t = actx.currentTime + i * 0.15;
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.start(t);
      o.stop(t + 0.14);
    });
  } catch (_) { /* ignore */ }
}

/* ─── Color helpers ──────────────────────────────────────────── */

function lightenColor(hex: string, amount: number): string {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function darkenColor(hex: string, amount = 40): string {
  return lightenColor(hex, -amount);
}

/* ─── Canvas draw helpers ────────────────────────────────────── */

function drawPixelCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillRect(10, 10, 40, 16);
  ctx.fillRect(6, 6, 20, 12);
  ctx.fillRect(24, 4, 18, 14);
  ctx.fillRect(40, 8, 14, 12);
  ctx.fillStyle = "rgba(200,220,240,0.6)";
  ctx.fillRect(10, 24, 40, 3);
  ctx.fillRect(12, 27, 36, 2);
  ctx.restore();
}

function drawBackgroundTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  heightMod: number
) {
  const trunkH = 30 + heightMod * 10;
  const trunkX = x - 5;
  // Trunk
  ctx.fillStyle = "#6b3a1f";
  ctx.fillRect(trunkX, groundY - trunkH, 10, trunkH);
  ctx.fillStyle = "#8B5523";
  ctx.fillRect(trunkX, groundY - trunkH, 2, trunkH);

  // Foliage layers
  const topY = groundY - trunkH;
  ctx.fillStyle = "#2d6a2d";
  ctx.fillRect(trunkX - 12, topY - 20, 34, 20);
  ctx.fillStyle = "#3d8b37";
  ctx.fillRect(trunkX - 8, topY - 36, 26, 18);
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(trunkX - 4, topY - 48, 18, 14);
  // Highlights
  ctx.fillStyle = "#6dbf67";
  ctx.fillRect(trunkX - 10, topY - 19, 2, 2);
  ctx.fillRect(trunkX - 6, topY - 35, 2, 2);
  ctx.fillRect(trunkX - 2, topY - 47, 2, 2);
  ctx.fillRect(trunkX + 2, topY - 48, 2, 2);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  W: number,
  H: number,
  frameCount: number,
  bgImg: HTMLImageElement | null
) {
  // Background image or gradient fallback
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, W, H);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#87CEEB");
    sky.addColorStop(1, "#c9e8ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }

  // Distant hills (parallax 0.1) - still drawn for depth
  const hillOffsetFar = cameraX * 0.1;
  ctx.fillStyle = "rgba(109,191,103,0.5)";
  for (let i = 0; i < 5; i++) {
    const hx = (i * 700 - (hillOffsetFar % 700) + LEVEL_W) % (W + 700) - 350;
    ctx.beginPath();
    ctx.ellipse(hx, H - 60, 200, 80, 0, Math.PI, 0);
    ctx.fill();
  }

  // Closer hills (parallax 0.2)
  ctx.fillStyle = "rgba(76,175,80,0.45)";
  const hillOffsetNear = cameraX * 0.2;
  for (let i = 0; i < 5; i++) {
    const hx = (i * 550 - (hillOffsetNear % 550) + LEVEL_W) % (W + 550) - 275;
    ctx.beginPath();
    ctx.ellipse(hx, H - 60, 160, 60, 0, Math.PI, 0);
    ctx.fill();
  }

  // Background trees (parallax 0.6)
  const groundY = H - 80;
  for (let i = 0; i < TREE_POSITIONS.length; i++) {
    const treeWorldX = TREE_POSITIONS[i] ?? 0;
    const treeScreenX = treeWorldX - cameraX * 0.6;
    if (treeScreenX > -60 && treeScreenX < W + 60) {
      drawBackgroundTree(ctx, treeScreenX, groundY, i % 3);
    }
  }

  // Pixel art clouds (parallax 0.15) on top of everything
  const cloudOffset = cameraX * 0.15;
  const cloudDefs = [
    { bx: 150, by: 55, scale: 0.9 },
    { bx: 420, by: 40, scale: 1.1 },
    { bx: 700, by: 65, scale: 0.8 },
    { bx: 980, by: 35, scale: 1.0 },
    { bx: 1250, by: 60, scale: 1.2 },
    { bx: 1550, by: 45, scale: 0.85 },
    { bx: 1850, by: 70, scale: 0.95 },
    { bx: 2100, by: 38, scale: 1.05 },
  ];
  const cloudSpan = W + 400;
  cloudDefs.forEach((c) => {
    const cx = ((c.bx - cloudOffset % cloudSpan + cloudSpan) % cloudSpan) - 200;
    drawPixelCloud(ctx, cx, c.by, c.scale);
  });

  void frameCount;
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  W: number,
  H: number,
  frameCount: number
) {
  // Determine visible world X range
  const visLeft = cameraX;
  const visRight = cameraX + W;

  // Check if a given world-x is in a water body
  function isWater(wx: number): boolean {
    for (const wb of WATER_BODIES) {
      if (wx >= wb.x && wx < wb.x + wb.w) return true;
    }
    return false;
  }

  // --- Layer A: Underground (dark brown base) ---
  const ugY = H - 50;
  ctx.fillStyle = "#3d1f00";
  ctx.fillRect(0, ugY, W, 50);

  // Underground details at fixed world positions
  // Fossil bones
  const fossilXs = [300, 1200, 2400, 3600, 4800];
  for (const wx of fossilXs) {
    const sx = wx - cameraX;
    if (sx > -40 && sx < W + 40) {
      ctx.fillStyle = "#e8dcc0";
      for (let rib = 0; rib < 5; rib++) {
        ctx.beginPath();
        ctx.arc(sx + rib * 4, ugY + 12, 3, Math.PI, 0);
        ctx.strokeStyle = "#c8bb99";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      // Spine
      ctx.fillStyle = "#c8bb99";
      ctx.fillRect(sx - 2, ugY + 10, 22, 2);
    }
  }

  // Retro CRT monitors underground
  const crtXs = [700, 2000, 3300, 4500];
  for (const wx of crtXs) {
    const sx = wx - cameraX;
    if (sx > -40 && sx < W + 40) {
      ctx.fillStyle = "#666";
      ctx.fillRect(sx, ugY + 4, 22, 16);
      ctx.fillStyle = "#222";
      ctx.fillRect(sx + 3, ugY + 6, 13, 9);
      ctx.fillStyle = "#444";
      ctx.fillRect(sx + 9, ugY + 19, 4, 4);
      ctx.fillRect(sx + 7, ugY + 22, 8, 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(sx + 4, ugY + 7, 2, 2);
      ctx.fillRect(sx + 7, ugY + 7, 2, 2);
    }
  }

  // Rocks scattered every ~400px
  for (let wx = 100; wx < LEVEL_W; wx += 400) {
    const sx = wx - cameraX;
    if (sx > -20 && sx < W + 20) {
      ctx.fillStyle = "#5a3a20";
      ctx.fillRect(sx, ugY + 8, 6, 4);
      ctx.fillRect(sx + 3, ugY + 6, 4, 3);
      ctx.fillStyle = "#7a5a3a";
      ctx.fillRect(sx, ugY + 8, 2, 2);
    }
  }

  // Sleeping pixel dog
  const dogXs = [1600, 4000];
  for (const wx of dogXs) {
    const sx = wx - cameraX;
    if (sx > -40 && sx < W + 40) {
      // Body
      ctx.fillStyle = "#8B5523";
      ctx.fillRect(sx, ugY + 12, 16, 8);
      // Head
      ctx.fillRect(sx + 12, ugY + 10, 8, 8);
      // Ears
      ctx.fillStyle = "#6b3a1f";
      ctx.fillRect(sx + 13, ugY + 8, 3, 3);
      ctx.fillRect(sx + 17, ugY + 9, 2, 3);
      // Closed eye
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(sx + 14, ugY + 13, 3, 1);
      // Curled tail
      ctx.fillStyle = "#8B5523";
      ctx.fillRect(sx - 3, ugY + 12, 4, 2);
      ctx.fillRect(sx - 4, ugY + 11, 2, 2);
      // ZZZ
      ctx.fillStyle = "rgba(200,220,255,0.7)";
      ctx.font = "6px monospace";
      ctx.fillText("zzz", sx + 8, ugY + 6);
    }
  }

  // Root tendrils from top of underground
  for (let wx = 50; wx < LEVEL_W; wx += 180) {
    const sx = wx - cameraX;
    if (sx > -10 && sx < W + 10) {
      ctx.strokeStyle = "#5a3010";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, ugY);
      ctx.bezierCurveTo(sx - 3, ugY + 8, sx + 2, ugY + 14, sx - 1, ugY + 22);
      ctx.stroke();
    }
  }

  // --- Layer B: Soil strip ---
  const soilY = H - 60;
  ctx.fillStyle = "#6b3a1f";
  ctx.fillRect(0, soilY, W, 10);
  ctx.fillStyle = "#4a2810";
  for (let sx = 4; sx < W - 4; sx += 8) {
    ctx.fillRect(sx, soilY + 3, 3, 2);
  }

  // --- Layer C: Grass top (with water gaps) ---
  const grassY = H - 80;
  const grassH = 20;

  // Draw grass in segments, skipping water body ranges
  let drawX = 0;
  while (drawX < W) {
    const worldX = drawX + cameraX;
    // Check if in water
    let inWater = false;
    let waterEnd = drawX;
    for (const wb of WATER_BODIES) {
      if (worldX >= wb.x && worldX < wb.x + wb.w) {
        inWater = true;
        waterEnd = wb.x + wb.w - cameraX;
        break;
      }
    }
    if (inWater) {
      drawX = waterEnd;
      continue;
    }
    // Next water start
    let segEnd = W;
    for (const wb of WATER_BODIES) {
      const wbScreenX = wb.x - cameraX;
      if (wbScreenX > drawX && wbScreenX < segEnd) {
        segEnd = wbScreenX;
      }
    }

    // Draw grass segment
    ctx.fillStyle = "#3d8b37";
    ctx.fillRect(drawX, grassY, segEnd - drawX, grassH);

    // Grass bumps
    let bx = drawX;
    let bump = 0;
    while (bx < segEnd) {
      const r = bump % 2 === 0 ? 14 : 10;
      ctx.fillStyle = "#3d8b37";
      ctx.beginPath();
      ctx.arc(bx + r, grassY, r, Math.PI, 0);
      ctx.fill();
      // Highlights on bump
      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(bx + 2, grassY - r + 2, 4, 2);
      // Grass blades between bumps
      ctx.fillStyle = "#4CAF50";
      for (let blade = 0; blade < 3; blade++) {
        ctx.fillRect(bx + r * 2 + blade * 3, grassY - 3, 1, 4);
      }
      bx += r * 2 + 4;
      bump++;
    }

    // Darker pixel dots on grass for texture
    ctx.fillStyle = "#2d6a2d";
    for (let tx = drawX + 2; tx < segEnd - 2; tx += 12) {
      ctx.fillRect(tx, grassY + 4, 2, 2);
    }

    drawX = segEnd;
  }

  // --- Layer D: Top highlight line ---
  ctx.fillStyle = "#6dbf67";
  // Draw the highlight line, also skipping water
  for (const seg of getGroundSegments(cameraX, W)) {
    ctx.fillRect(seg.sx, grassY, seg.w, 2);
  }

  // --- Water bodies ---
  for (const wb of WATER_BODIES) {
    const wsx = wb.x - cameraX;
    if (wsx + wb.w < 0 || wsx > W) continue;

    const wWid = wb.w;
    const waterY = grassY;

    // Base water
    ctx.fillStyle = "#1a6fa8";
    ctx.fillRect(wsx, waterY, wWid, 22);

    // Animated waves
    const time = frameCount * 0.04;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.5;
    for (let wi = 0; wi < 3; wi++) {
      ctx.beginPath();
      for (let ax = wsx; ax <= wsx + wWid; ax += 4) {
        const wy = waterY + 5 + wi * 5 + Math.sin(time * 2 + ax * 0.1 + wi) * 2;
        if (ax === wsx) ctx.moveTo(ax, wy);
        else ctx.lineTo(ax, wy);
      }
      ctx.stroke();
    }

    // Shimmer lines
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let sh = 0; sh < 4; sh++) {
      const shX = wsx + ((sh * 23 + Math.floor(frameCount * 0.02)) % (wWid - 4));
      ctx.fillRect(shX, waterY + 3, 2, 8);
    }

    // Pixel foam at edges
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(wsx, waterY, 3, 3);
    ctx.fillRect(wsx + wWid - 3, waterY, 3, 3);
    ctx.fillRect(wsx + 6, waterY + 1, 3, 3);
    ctx.fillRect(wsx + wWid - 9, waterY + 1, 3, 3);
  }
}

function getGroundSegments(
  cameraX: number,
  W: number
): Array<{ sx: number; w: number }> {
  const segments: Array<{ sx: number; w: number }> = [];
  let cur = 0;
  while (cur < W) {
    const worldX = cur + cameraX;
    let inWater = false;
    let waterEnd = cur;
    for (const wb of WATER_BODIES) {
      if (worldX >= wb.x && worldX < wb.x + wb.w) {
        inWater = true;
        waterEnd = wb.x + wb.w - cameraX;
        break;
      }
    }
    if (inWater) {
      cur = waterEnd;
      continue;
    }
    let segEnd = W;
    for (const wb of WATER_BODIES) {
      const wbSx = wb.x - cameraX;
      if (wbSx > cur && wbSx < segEnd) segEnd = wbSx;
    }
    segments.push({ sx: cur, w: segEnd - cur });
    cur = segEnd;
  }
  return segments;
}

function drawBirds(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  frameCount: number
) {
  for (let i = 0; i < BIRD_DEFS.length; i++) {
    const bird = BIRD_DEFS[i];
    if (!bird) continue;
    // Birds drift left slowly in world space, wrap around level
    const worldX = ((bird.x - frameCount * bird.speed * 0.5) % (LEVEL_W + 200) + LEVEL_W + 200) % (LEVEL_W + 200);
    const sx = worldX - cameraX * 0.4;
    if (sx < -20 || sx > ctx.canvas.width / (ctx.canvas.height / CANVAS_H) + 20) continue;
    const sy = bird.y;

    // Wing animation
    const wingVal = Math.sin(frameCount * 0.15 + bird.wingPhase);
    const wingAngle = wingVal * 4;

    ctx.save();
    ctx.translate(sx, sy);
    // Body
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(-4, -2, 8, 4);
    // Left wing
    ctx.fillStyle = "#d0d0d0";
    ctx.save();
    ctx.translate(-4, 0);
    ctx.rotate(-wingAngle * 0.3);
    ctx.fillRect(-6, -1, 6, 2);
    ctx.restore();
    // Right wing
    ctx.save();
    ctx.translate(4, 0);
    ctx.rotate(wingAngle * 0.3);
    ctx.fillRect(0, -1, 6, 2);
    ctx.restore();
    // Beak
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(4, -1, 2, 2);
    // Eye
    ctx.fillStyle = "#111";
    ctx.fillRect(2, -1, 1, 1);
    ctx.restore();

    // Formation buddies
    for (let f = 1; f <= 2; f++) {
      const bsx = sx + f * 14;
      const bsy = sy + f * 5;
      if (bsx > ctx.canvas.width / (ctx.canvas.height / CANVAS_H) + 10) continue;
      ctx.save();
      ctx.translate(bsx, bsy);
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(-3, -2, 7, 3);
      ctx.fillStyle = "#ccc";
      ctx.save();
      ctx.translate(-3, 0);
      ctx.rotate(-wingAngle * 0.3);
      ctx.fillRect(-5, -1, 5, 2);
      ctx.restore();
      ctx.save();
      ctx.translate(4, 0);
      ctx.rotate(wingAngle * 0.3);
      ctx.fillRect(0, -1, 5, 2);
      ctx.restore();
      ctx.restore();
    }
  }
}

function drawPlatform(ctx: CanvasRenderingContext2D, p: PlatformDef, cameraX: number) {
  const sx = p.x - cameraX;
  const x = sx;
  const y = p.y;
  const w = p.w;
  const h = p.h;

  // Soil body
  ctx.fillStyle = "#6b3a1f";
  ctx.fillRect(x, y + 8, w, h - 8);
  // Soil texture dots
  ctx.fillStyle = "#4a2810";
  for (let tx = x + 4; tx < x + w - 4; tx += 10) {
    ctx.fillRect(tx, y + 12, 3, 2);
    ctx.fillRect(tx + 5, y + 16, 2, 2);
  }
  // Soil highlight
  ctx.fillStyle = "#8B5523";
  ctx.fillRect(x, y + 8, w, 2);
  ctx.fillRect(x, y + 8, 2, h - 8);

  // Grass top
  ctx.fillStyle = "#3d8b37";
  ctx.fillRect(x, y, w, 10);
  // Grass highlight
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(x, y, w, 3);
  // Grass top pixel bumps
  ctx.fillStyle = "#2d6a2d";
  for (let bx = x; bx < x + w; bx += 8) {
    ctx.fillRect(bx, y - 2, 4, 3);
    ctx.fillRect(bx + 4, y - 1, 3, 2);
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  facing: number,
  frameCount: number,
  onGround: boolean,
  vy: number,
  flashRed: number,
  cameraX: number
) {
  const sx = px - cameraX;
  const isRunning = onGround && Math.abs(vy) < 1 && true; // keep running logic alive
  void isRunning;
  const isActuallyRunning = onGround;
  const isJumping = !onGround;
  const facingLeft = facing < 0;
  const P = 2.5;
  const x = sx;
  const y = py;

  if (flashRed > 0 && Math.floor(flashRed / 4) % 2 === 0) {
    ctx.save();
    ctx.globalAlpha = 0.5;
  }

  ctx.save();
  ctx.translate(x, y);
  if (facingLeft) {
    ctx.scale(-1, 1);
    ctx.translate(-35, 0);
  }

  // === HAIR (animated — slight wave) ===
  const hairWave = isActuallyRunning ? Math.sin(frameCount * 0.3) * 1.5 : 0;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(3 * P, (0 + hairWave) * P, 9 * P, 3 * P);
  ctx.fillRect(2 * P, 1 * P, 2 * P, 4 * P);
  ctx.fillRect(11 * P, 1 * P, 2 * P, 3 * P);
  ctx.fillStyle = "#333";
  ctx.fillRect(4 * P, 0, 3 * P, P);

  // === HEAD ===
  ctx.fillStyle = "#F4C28A";
  ctx.fillRect(3 * P, 3 * P, 9 * P, 7 * P);
  ctx.fillRect(2 * P, 5 * P, 2 * P, 3 * P);
  ctx.fillRect(11 * P, 5 * P, 2 * P, 3 * P);
  ctx.fillStyle = "#e8a870";
  ctx.fillRect(2 * P, 6 * P, P, 2 * P);

  // === EYES ===
  const blinkH = frameCount % 120 < 4 ? P : 3 * P;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(5 * P, 5 * P, 2 * P, blinkH);
  ctx.fillRect(8 * P, 5 * P, 2 * P, blinkH);
  if (blinkH > P) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(6 * P, 5 * P, P, P);
    ctx.fillRect(9 * P, 5 * P, P, P);
  }

  // === MOUTH ===
  const breathe = Math.sin(frameCount * 0.05) * 0.5;
  ctx.fillStyle = isActuallyRunning ? "#c0704a" : "#d4845a";
  ctx.fillRect(6 * P, (8 + breathe) * P, 3 * P, P);
  if (isActuallyRunning) {
    ctx.fillRect(6 * P, (8 + breathe) * P, 3 * P, 2 * P);
    ctx.fillStyle = "#8B1A1A";
    ctx.fillRect(6 * P, (9 + breathe) * P, 3 * P, P);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(6 * P, (8 + breathe) * P, P, P);
    ctx.fillRect(7 * P, (8 + breathe) * P, P, P);
    ctx.fillRect(8 * P, (8 + breathe) * P, P, P);
  }

  // === NECK ===
  ctx.fillStyle = "#F4C28A";
  ctx.fillRect(6 * P, 10 * P, 3 * P, 2 * P);

  // === BODY / JACKET ===
  const breatheBody = Math.sin(frameCount * 0.05) * 0.3;
  ctx.fillStyle = "#FF5210";
  ctx.fillRect(3 * P, (12 + breatheBody) * P, 9 * P, 7 * P);
  ctx.fillStyle = "#ff6b35";
  ctx.fillRect(3 * P, (12 + breatheBody) * P, P, 7 * P);
  ctx.fillRect(3 * P, (12 + breatheBody) * P, 9 * P, P);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(6 * P, (13 + breatheBody) * P, 3 * P, 5 * P);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(4 * P, (14 + breatheBody) * P, 2 * P, 2 * P);
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(4 * P, (14 + breatheBody) * P, P, P);

  // === ARMS ===
  const armSwing = isActuallyRunning ? Math.sin(frameCount * 0.25) * 3 : 0;
  ctx.fillStyle = "#FF5210";
  ctx.fillRect(P, (13 + armSwing) * P, 3 * P, 5 * P);
  ctx.fillRect(11 * P, (13 - armSwing) * P, 3 * P, 5 * P);
  ctx.fillStyle = "#F4C28A";
  ctx.fillRect(P, (17 + armSwing) * P, 3 * P, 2 * P);
  ctx.fillRect(11 * P, (17 - armSwing) * P, 3 * P, 2 * P);
  ctx.fillStyle = "#e8a870";
  ctx.fillRect(P, (19 + armSwing) * P, P, P);
  ctx.fillRect(2 * P, (19 + armSwing) * P, P, P);
  ctx.fillRect(3 * P, (18 + armSwing) * P, P, P);

  // === LEGS ===
  const legCycle = isActuallyRunning ? Math.sin(frameCount * 0.25) * 4 : 0;
  const leg2Cycle = isActuallyRunning ? Math.sin(frameCount * 0.25 + Math.PI) * 4 : 0;
  ctx.fillStyle = "#1a237e";
  ctx.fillRect(4 * P, (19 + legCycle) * P, 3 * P, 5 * P);
  ctx.fillRect(8 * P, (19 + leg2Cycle) * P, 3 * P, 5 * P);
  ctx.fillStyle = "#283593";
  ctx.fillRect(4 * P, (19 + legCycle) * P, P, 5 * P);
  ctx.fillRect(8 * P, (19 + leg2Cycle) * P, P, 5 * P);

  // === SHOES ===
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(3 * P, (24 + legCycle) * P, 4 * P, 2 * P);
  ctx.fillRect(7 * P, (24 + leg2Cycle) * P, 4 * P, 2 * P);
  ctx.fillStyle = "#FF5210";
  ctx.fillRect(3 * P, (25 + legCycle) * P, 4 * P, P);
  ctx.fillRect(7 * P, (25 + leg2Cycle) * P, 4 * P, P);

  ctx.restore();

  // === SPARKLES / WIND when running ===
  if (isActuallyRunning && !isJumping) {
    const particleX = facingLeft ? x + 35 : x;
    for (let s = 0; s < 3; s++) {
      const age = (frameCount + s * 7) % 15;
      const alpha = 1 - age / 15;
      const dirX = facingLeft ? 1 : -1;
      const spx = particleX + dirX * (age * 2 + s * 6);
      const spy = y + 30 + Math.sin(age * 0.8 + s) * 5;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s % 2 === 0 ? "#FFD700" : "#FF5210";
      ctx.fillRect(spx, spy, 2, 2);
      ctx.fillRect(spx - 1, spy + 1, 4, 1);
      ctx.fillRect(spx + 1, spy - 1, 1, 4);
      ctx.restore();
    }
  }

  if (flashRed > 0 && Math.floor(flashRed / 4) % 2 === 0) {
    ctx.restore();
  }
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: GameEnemy,
  frameCount: number,
  cameraX: number
) {
  if (!enemy.alive && enemy.squishTimer <= 0) return;
  const sx = enemy.px - cameraX;
  const P = 2.2;

  ctx.save();

  let scaleY = 1;
  if (enemy.squishTimer > 0) {
    scaleY = enemy.squishTimer / 30;
    ctx.translate(sx + 15, enemy.py + 24);
    ctx.scale(1, scaleY);
    ctx.translate(-(sx + 15), -(enemy.py + 24));
  }

  const facingLeft = enemy.dir < 0;
  ctx.translate(sx, enemy.py);
  if (!facingLeft) {
    ctx.scale(-1, 1);
    ctx.translate(-30, 0);
  }

  // === TAIL (animated) ===
  const tailWave = Math.sin(frameCount * 0.15) * 8;
  const tailWave2 = Math.sin(frameCount * 0.15 + 1) * 6;
  ctx.strokeStyle = enemy.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(2 * P, 14 * P);
  ctx.bezierCurveTo(
    -2 * P, (14 + tailWave) * P,
    -5 * P, (12 + tailWave2) * P,
    -8 * P, (10 + tailWave) * P
  );
  ctx.stroke();
  ctx.fillStyle = darkenColor(enemy.color, 30);
  ctx.fillRect(-8 * P - 2, (10 + tailWave) * P - 2, 4, 4);

  // === LEGS ===
  const legPhase = Math.sin(frameCount * 0.2) * 3;
  ctx.fillStyle = darkenColor(enemy.color, 20);
  ctx.fillRect(3 * P, 12 * P, 3 * P, 4 * P);
  ctx.fillRect(7 * P, 12 * P, 3 * P, 4 * P);
  ctx.fillRect(3 * P, (16 + legPhase) * P, 2 * P, 3 * P);
  ctx.fillRect(8 * P, (16 - legPhase) * P, 2 * P, 3 * P);
  ctx.fillStyle = "#222";
  ctx.fillRect(2 * P, (19 + legPhase) * P, 4 * P, 2 * P);
  ctx.fillRect(2 * P, (19 + legPhase) * P, P, 3 * P);
  ctx.fillRect(4 * P, (19 + legPhase) * P, P, 2 * P);
  ctx.fillRect(7 * P, (19 - legPhase) * P, 4 * P, 2 * P);
  ctx.fillRect(7 * P, (19 - legPhase) * P, P, 3 * P);
  ctx.fillRect(9 * P, (19 - legPhase) * P, P, 2 * P);

  // === BODY ===
  ctx.fillStyle = enemy.color;
  ctx.fillRect(2 * P, 5 * P, 10 * P, 8 * P);
  ctx.fillStyle = lightenColor(enemy.color, 30);
  ctx.fillRect(3 * P, 5 * P, 2 * P, 6 * P);
  ctx.fillRect(2 * P, 5 * P, 10 * P, P);
  ctx.fillStyle = darkenColor(enemy.color, 40);
  ctx.fillRect(4 * P, 5 * P, 6 * P, 2 * P);
  ctx.fillRect(5 * P, 3 * P, 4 * P, 2 * P);

  // === ARMS ===
  const armSwing = Math.sin(frameCount * 0.2) * 2;
  ctx.fillStyle = darkenColor(enemy.color, 10);
  ctx.fillRect(0, (7 + armSwing) * P, 3 * P, 4 * P);
  ctx.fillRect(11 * P, (7 - armSwing) * P, 3 * P, 4 * P);
  ctx.fillStyle = "#111";
  ctx.fillRect(-P, (11 + armSwing) * P, 2 * P, P);
  ctx.fillRect(-P, (11 + armSwing) * P, P, 2 * P);
  ctx.fillRect(11 * P, (11 - armSwing) * P, 2 * P, P);
  ctx.fillRect(13 * P, (11 - armSwing) * P, P, 2 * P);

  // === HEAD ===
  ctx.fillStyle = lightenColor(enemy.color, 10);
  ctx.fillRect(3 * P, 0, 8 * P, 6 * P);
  ctx.fillRect(4 * P, -2 * P, 6 * P, 3 * P);
  ctx.fillRect(5 * P, -4 * P, 4 * P, 3 * P);
  ctx.fillStyle = lightenColor(enemy.color, 50);
  ctx.fillRect(4 * P, 0, 2 * P, 3 * P);

  // === FACE ===
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(4 * P, 2 * P, 2 * P, 2 * P);
  ctx.fillRect(8 * P, 2 * P, 2 * P, 2 * P);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(4 * P, 2 * P, P, P);
  ctx.fillRect(8 * P, 2 * P, P, P);
  const mandPhase = Math.sin(frameCount * 0.1);
  ctx.fillStyle = "#111";
  ctx.fillRect(4 * P, (5 + mandPhase) * P, 2 * P, 2 * P);
  ctx.fillRect(8 * P, (5 + mandPhase) * P, 2 * P, 2 * P);
  ctx.fillRect(5 * P, (7 + mandPhase) * P, P, 2 * P);
  ctx.fillRect(8 * P, (7 + mandPhase) * P, P, 2 * P);

  // Name tag above
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform to draw label
  const label = enemy.label;
  ctx.font = "bold 7px monospace";
  const tw = ctx.measureText(label).width;
  const tagX = sx + 15 - tw / 2 - 4;
  const tagY = enemy.py - 14;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(tagX, tagY, tw + 8, 11);
  ctx.fillStyle = "#fff";
  ctx.fillText(label, tagX + 4, tagY + 8);

  ctx.restore();
}

function drawCollectible(
  ctx: CanvasRenderingContext2D,
  c: GameCollectible,
  frameCount: number,
  cameraX: number
) {
  if (c.collected) return;
  const sx = c.x - cameraX;
  const bob = Math.sin(frameCount * 0.05 + c.bobOffset) * 5;
  const sy = c.y + bob;

  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = c.color;

  ctx.fillStyle = c.color;
  ctx.fillRect(sx, sy, 20, 20);

  ctx.strokeStyle = darkenColor(c.color, 30);
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 1, sy + 1, 18, 18);

  ctx.shadowBlur = 0;

  ctx.font = "bold 8px monospace";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(c.label, sx + 10, sy + 32);
  ctx.textAlign = "left";

  ctx.restore();
}

function drawDialogueBubble(
  ctx: CanvasRenderingContext2D,
  bubble: DialogueBubble,
  cameraX: number
) {
  const sx = bubble.x - cameraX;
  const alpha = Math.min(1, bubble.life / 30) * Math.min(1, (bubble.maxLife - bubble.life) / 30);
  const floatY = bubble.y - (1 - bubble.life / bubble.maxLife) * 40;

  ctx.save();
  ctx.globalAlpha = alpha;

  const text = bubble.text;
  ctx.font = "bold 9px monospace";
  const tw = ctx.measureText(text).width;
  const bw = tw + 16;
  const bh = 22;
  const bx = sx - bw / 2;
  const by = floatY - bh - 12;

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(bx + 3, by, bw - 6, bh);
  ctx.fillRect(bx, by + 3, bw, bh - 6);
  ctx.fillRect(bx + 3, by, 1, 1);
  ctx.fillRect(bx + bw - 4, by, 1, 1);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(bx + 6, by + bh, 6, 4);
  ctx.fillRect(bx + 6, by + bh + 4, 4, 2);
  ctx.fillRect(bx + 6, by + bh + 6, 2, 2);

  ctx.fillStyle = "#111";
  ctx.fillText(text, bx + 8, by + 14);

  ctx.restore();
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  sb: SpeechBubble,
  cameraX: number
) {
  if (sb.timer <= 0) return;
  const sx = sb.x - cameraX;
  const alpha = Math.min(1, sb.timer / 20);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = "bold 8px monospace";
  const tw = ctx.measureText(sb.text).width;
  const bw = Math.min(tw + 16, 180);
  const bh = 22;
  const bx = sx - bw / 2;
  const by = sb.y - bh - 8;

  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.fillRect(bx + 3, by, bw - 6, bh);
  ctx.fillRect(bx, by + 3, bw, bh - 6);

  ctx.fillStyle = "#e74c3c";
  ctx.fillText(sb.text, bx + 8, by + 14);
  ctx.restore();
}

function drawHUDCanvas(
  ctx: CanvasRenderingContext2D,
  lives: number,
  collectedCount: number,
  W: number
) {
  ctx.save();
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(W - 80, 8, 72, 22);
  ctx.fillStyle = "#FF5210";
  const hearts = "♥".repeat(lives) + "♡".repeat(Math.max(0, 3 - lives));
  ctx.fillText(hearts, W - 74, 24);
  ctx.restore();

  ctx.save();
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(8, 8, 90, 22);
  ctx.fillStyle = "#FF5210";
  ctx.fillText(`PIECES: ${collectedCount}/10`, 12, 24);
  ctx.restore();
}

/* ─── Confetti component ─────────────────────────────────────── */

function Confetti() {
  const colors = ["#FF5210", "#ffd700", "#ff69b4", "#00ffcc", "#7c3aed", "#16a34a"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    delay: Math.random() * 1.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 7,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            rotate: p.rotation,
          }}
          animate={{ y: "110vh", rotate: p.rotation + 720, opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 1.5, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/* ─── Messenger Phase ────────────────────────────────────────── */

const PETE_MESSAGES = [
  "yo... you there? 👀",
  "our product is a complete MESS",
  "users are dropping off everywhere",
  "we need a UX designer. like NOW.",
  "not just any designer...",
  "someone who's been through the full process.",
  "research → wireframes → prototyping → dev handoff → deploy",
  "can you help us? 🙏",
];

const PLAYER_REPLY = "consider it done. I'll find every missing piece. 🎯";

interface MessengerPhaseProps {
  onStart: () => void;
}

function MessengerPhase({ onStart }: MessengerPhaseProps) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [showTyping, setShowTyping] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let delay = 500;

    for (let i = 0; i < PETE_MESSAGES.length; i++) {
      const capturedI = i;
      timeouts.push(setTimeout(() => setShowTyping(true), delay));
      delay += 700;
      timeouts.push(
        setTimeout(() => {
          setShowTyping(false);
          setVisibleMessages(capturedI + 1);
        }, delay)
      );
      delay += 800;
    }

    delay += 1000;
    timeouts.push(setTimeout(() => setShowReply(true), delay));
    delay += 800;
    timeouts.push(setTimeout(() => setShowButton(true), delay));

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex overflow-hidden"
      style={{ background: "#0d0d0d", cursor: "default", fontFamily: "monospace" }}
    >
      <div className="flex flex-col items-center justify-start pt-16 pl-8 pr-4" style={{ width: 160, flexShrink: 0 }}>
        <div className="relative">
          <div
            style={{
              width: 60,
              height: 60,
              background: "#4A90D9",
              position: "relative",
              imageRendering: "pixelated",
            }}
          >
            <div style={{ position: "absolute", top: 18, left: 10, width: 8, height: 8, background: "#111" }} />
            <div style={{ position: "absolute", top: 18, left: 30, width: 8, height: 8, background: "#111" }} />
            <div style={{ position: "absolute", bottom: 12, left: 14, width: 20, height: 4, background: "#111" }} />
            <div style={{ position: "absolute", bottom: 8, left: 18, width: 12, height: 3, background: "#111" }} />
          </div>
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 12,
              height: 12,
              background: "#e74c3c",
              borderRadius: "50%",
              border: "2px solid #0d0d0d",
            }}
          />
        </div>
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>Pete</div>
          <div style={{ color: "#888", fontSize: 9 }}>Head of Product</div>
          <div style={{ color: "#4A90D9", fontSize: 9 }}>@ PixelCo</div>
        </div>
      </div>

      <div
        className="flex flex-col flex-1 overflow-y-auto pb-8 pt-8 pr-8"
        style={{ gap: 8 }}
      >
        <div style={{ color: "#555", fontSize: 10, marginBottom: 8, textAlign: "center" }}>
          Today · Design Rescue Mission
        </div>

        <AnimatePresence>
          {PETE_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", justifyContent: "flex-start", marginBottom: 4 }}
            >
              <div
                style={{
                  background: "#2a2a2a",
                  color: "#eee",
                  padding: "8px 12px",
                  borderRadius: "2px 12px 12px 12px",
                  fontSize: 13,
                  maxWidth: "75%",
                  lineHeight: 1.5,
                }}
              >
                {msg}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {showTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", gap: 4, alignItems: "center", paddingLeft: 4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{ width: 6, height: 6, background: "#555", borderRadius: "50%" }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
            <span style={{ color: "#555", fontSize: 10, marginLeft: 4 }}>Pete is typing...</span>
          </motion.div>
        )}

        <AnimatePresence>
          {showReply && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
            >
              <div
                style={{
                  background: "#FF5210",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "12px 2px 12px 12px",
                  fontSize: 13,
                  maxWidth: "75%",
                  lineHeight: 1.5,
                  fontWeight: "bold",
                }}
              >
                {PLAYER_REPLY}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              style={{ display: "flex", justifyContent: "center", marginTop: 24 }}
            >
              <button
                onClick={onStart}
                style={{
                  background: "#FF5210",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: 14,
                  fontWeight: "bold",
                  padding: "12px 32px",
                  border: "3px solid #ff7a40",
                  boxShadow: "4px 4px 0px #a33000",
                  cursor: "pointer",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                START MISSION →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── HUD overlay ────────────────────────────────────────────── */

interface HUDProps {
  collectedIds: Set<string>;
  lives: number;
  collectibles: GameCollectible[];
}

function HUD({ collectedIds, lives, collectibles }: HUDProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        zIndex: 200,
        fontFamily: "monospace",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
        <span style={{ color: "#FF5210", fontSize: 10, fontWeight: "bold", marginRight: 6, letterSpacing: 1 }}>
          PIECES
        </span>
        {collectibles.map((c) => (
          <motion.div
            key={c.id}
            animate={collectedIds.has(c.id) ? { scale: [1.3, 1], y: [0, -4, 0] } : {}}
            transition={{ duration: 0.3 }}
            style={{
              width: 16,
              height: 16,
              background: collectedIds.has(c.id) ? c.color : "#333",
              border: collectedIds.has(c.id) ? `2px solid ${c.color}` : "2px solid #555",
              borderRadius: 2,
              position: "relative",
              boxShadow: collectedIds.has(c.id) ? `0 0 6px ${c.color}` : "none",
            }}
            title={c.label}
          >
            {collectedIds.has(c.id) && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  background: "#4CAF50",
                  borderRadius: "50%",
                  fontSize: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                ✓
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div
        style={{
          color: "#FF5210",
          fontSize: 14,
          fontWeight: "bold",
          letterSpacing: 2,
          textShadow: "0 0 8px #FF5210",
          whiteSpace: "nowrap",
        }}
      >
        DESIGN BOUNTY
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flex: 1 }}>
        <span style={{ color: "#FF5210", fontSize: 14 }}>
          {"♥".repeat(lives)}{"♡".repeat(Math.max(0, 3 - lives))}
        </span>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: "bold", letterSpacing: 1 }}>PRADEEP</span>
      </div>
    </div>
  );
}

/* ─── Win Screen ─────────────────────────────────────────────── */

interface WinScreenProps {
  collectedCount: number;
  enemiesDefeated: number;
  elapsed: number;
  onExit: () => void;
}

function WinScreen({ collectedCount, enemiesDefeated, elapsed, onExit }: WinScreenProps) {
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)", fontFamily: "monospace", cursor: "default" }}
    >
      <Confetti />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 max-w-lg">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          style={{ color: "#FF5210", fontSize: 36, fontWeight: "bold", textShadow: "0 0 20px #FF5210" }}
        >
          MISSION COMPLETE
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "rgba(255,82,16,0.1)",
            border: "2px solid rgba(255,82,16,0.4)",
            borderRadius: 8,
            padding: 20,
            width: "100%",
          }}
        >
          <div style={{ color: "#FF5210", fontSize: 13 }}>All design artifacts recovered. PixelCo is saved.</div>
          <div style={{ color: "#999", fontSize: 11, marginTop: 12 }}>Pieces collected: {collectedCount}/10</div>
          <div style={{ color: "#999", fontSize: 11, marginTop: 4 }}>Enemies defeated: {enemiesDefeated}</div>
          <div style={{ color: "#999", fontSize: 11, marginTop: 4 }}>Time: {timeStr}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            background: "#2a2a2a",
            borderRadius: 8,
            padding: 16,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "#4A90D9", flexShrink: 0, position: "relative" }}>
              <div style={{ position: "absolute", top: 10, left: 6, width: 5, height: 5, background: "#111" }} />
              <div style={{ position: "absolute", top: 10, left: 20, width: 5, height: 5, background: "#111" }} />
              <div style={{ position: "absolute", bottom: 7, left: 8, width: 12, height: 3, background: "#111" }} />
            </div>
            <div
              style={{
                background: "#3a3a3a",
                color: "#eee",
                padding: "8px 12px",
                borderRadius: "2px 12px 12px 12px",
                fontSize: 13,
                flex: 1,
              }}
            >
              you actually did it. hiring you rn 💸
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onExit}
          style={{
            background: "#FF5210",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: "bold",
            padding: "12px 28px",
            border: "3px solid #ff7a40",
            boxShadow: "4px 4px 0px #a33000",
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          ← Back to portfolio
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Game Over Screen ───────────────────────────────────────── */

interface GameOverProps {
  onRestart: () => void;
  onExit: () => void;
}

function GameOverScreen({ onRestart, onExit }: GameOverProps) {
  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)", fontFamily: "monospace", cursor: "default" }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ color: "#e74c3c", fontSize: 40, fontWeight: "bold", textShadow: "0 0 20px #e74c3c", marginBottom: 24 }}
      >
        GAME OVER
      </motion.div>
      <div style={{ display: "flex", gap: 16 }}>
        <button
          onClick={onRestart}
          style={{
            background: "#FF5210",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: "bold",
            padding: "10px 24px",
            border: "2px solid #ff7a40",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
        <button
          onClick={onExit}
          style={{
            background: "#333",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 13,
            padding: "10px 24px",
            border: "2px solid #555",
            cursor: "pointer",
          }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function DesignRescueGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<"messenger" | "playing" | "gameover" | "win">("messenger");
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [hudCollectibles, setHudCollectibles] = useState<GameCollectible[]>([]);
  const [lives, setLives] = useState(3);
  const [winStats, setWinStats] = useState({ collected: 0, enemies: 0, elapsed: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const gameStateRef = useRef<GameState | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => { /* ignore */ });
    }
    return audioCtxRef.current;
  }, []);

  const initGameState = useCallback((): GameState => {
    const H = CANVAS_H;
    const colls = makeCollectibles(H);
    setHudCollectibles(colls);
    return {
      playerX: 150,
      playerY: H - 60 - 42,
      playerVX: 0,
      playerVY: 0,
      playerOnGround: false,
      playerJumpsLeft: 2,
      playerFacing: 1,
      playerFlashRed: 0,
      frameCount: 0,
      cameraX: 0,
      lives: 3,
      collectedIds: new Set(),
      enemiesDefeated: 0,
      checkpointX: 150,
      collectibles: colls,
      enemies: makeEnemies(H),
      dialogueBubble: null,
      nextDialogueIn: 180 + Math.floor(Math.random() * 120),
      speechBubbles: [],
      startTime: Date.now(),
      gameOver: false,
      won: false,
      invincibleTimer: 0,
    };
  }, []);

  const handleStart = useCallback(() => {
    gameStateRef.current = initGameState();
    setPhase("playing");
    setCollectedIds(new Set());
    setLives(3);
  }, [initGameState]);

  const handleRestart = useCallback(() => {
    gameStateRef.current = initGameState();
    setPhase("playing");
    setCollectedIds(new Set());
    setLives(3);
  }, [initGameState]);

  // Load background image once
  useEffect(() => {
    const img = new Image();
    img.src = "/Game/Blue sky background.jpg";
    img.onload = () => {
      bgImgRef.current = img;
    };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gs = gameStateRef.current;
    if (!gs) return;

    const platforms = makePlatforms(CANVAS_H);

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function onKeyDown(e: KeyboardEvent) {
      ensureAudio();
      keysRef.current[e.code] = true;
      if (e.code === "Escape") onExit();
      if (
        (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") &&
        gs!.playerJumpsLeft > 0
      ) {
        gs!.playerVY = JUMP_VY;
        gs!.playerJumpsLeft -= 1;
        gs!.playerOnGround = false;
        const ac = ensureAudio();
        playJump(ac);
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current[e.code] = false;
    }

    function onTouchStart(e: TouchEvent) {
      ensureAudio();
      const t = e.touches[0];
      if (t) touchRef.current = { x: t.clientX, y: t.clientY };
    }
    function onTouchEnd(e: TouchEvent) {
      const t = e.changedTouches[0];
      if (!t || !touchRef.current) return;
      const dx = t.clientX - touchRef.current.x;
      const dy = t.clientY - touchRef.current.y;
      if (dy < -50 && gs!.playerJumpsLeft > 0) {
        gs!.playerVY = JUMP_VY;
        gs!.playerJumpsLeft -= 1;
        gs!.playerOnGround = false;
        const ac = ensureAudio();
        playJump(ac);
      }
      if (Math.abs(dx) > 30) {
        keysRef.current["ArrowRight"] = dx > 0;
        keysRef.current["ArrowLeft"] = dx < 0;
        setTimeout(() => {
          keysRef.current["ArrowRight"] = false;
          keysRef.current["ArrowLeft"] = false;
        }, 200);
      }
      touchRef.current = null;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    function gameLoop() {
      if (!canvas || !gs) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      // Scale so game is always CANVAS_H tall
      const scale = H / CANVAS_H;
      const logicalW = W / scale;

      ctx.save();
      ctx.scale(scale, scale);

      const lw = logicalW;

      // ── Input ──────────────────────────────────────────────
      const keys = keysRef.current;
      const left = keys["ArrowLeft"] || keys["KeyA"];
      const right = keys["ArrowRight"] || keys["KeyD"];

      if (left) {
        gs.playerVX = -RUN_SPEED;
        gs.playerFacing = -1;
      } else if (right) {
        gs.playerVX = RUN_SPEED;
        gs.playerFacing = 1;
      } else {
        gs.playerVX = 0;
      }

      // ── Physics ────────────────────────────────────────────
      gs.playerVY = Math.min(gs.playerVY + GRAVITY, MAX_FALL);
      gs.playerX += gs.playerVX;
      gs.playerY += gs.playerVY;

      gs.playerX = Math.max(0, Math.min(gs.playerX, LEVEL_W - 20));

      const groundY = CANVAS_H - 60 - 42;

      gs.playerOnGround = false;
      if (gs.playerY >= groundY) {
        gs.playerY = groundY;
        gs.playerVY = 0;
        gs.playerOnGround = true;
        gs.playerJumpsLeft = 2;
      }

      const playerBottom = gs.playerY + 42;
      const playerLeft = gs.playerX;
      const playerRight = gs.playerX + 20;

      for (const plat of platforms) {
        if (
          gs.playerVY >= 0 &&
          playerBottom - gs.playerVY <= plat.y + 4 &&
          playerBottom >= plat.y &&
          playerRight > plat.x + 4 &&
          playerLeft < plat.x + plat.w - 4
        ) {
          gs.playerY = plat.y - 42;
          gs.playerVY = 0;
          gs.playerOnGround = true;
          gs.playerJumpsLeft = 2;
        }
      }

      // ── Camera ────────────────────────────────────────────
      gs.cameraX = Math.max(0, Math.min(gs.playerX - lw * 0.35, LEVEL_W - lw));

      // ── Collectibles ──────────────────────────────────────
      for (const c of gs.collectibles) {
        if (c.collected) continue;
        const cx = c.x + 10;
        const cy = c.y + Math.sin(gs.frameCount * 0.05 + c.bobOffset) * 5 + 10;
        const px = gs.playerX + 10;
        const py = gs.playerY + 21;
        const dist = Math.hypot(cx - px, cy - py);
        if (dist < 22) {
          c.collected = true;
          gs.collectedIds.add(c.id);
          const ac = ensureAudio();
          playCollect(ac);
          setCollectedIds(new Set(gs.collectedIds));
          if (gs.collectedIds.size >= 10 || gs.playerX > 6500) {
            gs.won = true;
          }
        }
      }

      // ── Enemies ───────────────────────────────────────────
      if (gs.invincibleTimer > 0) gs.invincibleTimer -= 1;
      if (gs.playerFlashRed > 0) gs.playerFlashRed -= 1;

      for (const enemy of gs.enemies) {
        if (!enemy.alive) {
          if (enemy.squishTimer > 0) enemy.squishTimer -= 1;
          if (enemy.speechTimer > 0) enemy.speechTimer -= 1;
          continue;
        }

        // Patrol behavior
        enemy.px += enemy.vx;
        if (enemy.px < enemy.spawnX - 200 || enemy.px > enemy.spawnX + 200) {
          enemy.vx *= -1;
        }
        // Also reverse if hitting level bounds
        if (enemy.px < 10) { enemy.px = 10; enemy.vx = Math.abs(enemy.vx); }
        if (enemy.px > LEVEL_W - 30) { enemy.px = LEVEL_W - 30; enemy.vx = -Math.abs(enemy.vx); }

        enemy.dir = enemy.vx < 0 ? -1 : 1;

        // Enemy on ground or platform
        const eBottom = enemy.py + 24;
        const eGroundY = CANVAS_H - 60 - 24;
        if (enemy.py < eGroundY) {
          enemy.py = Math.min(enemy.py + 2, eGroundY);
        }
        for (const plat of platforms) {
          if (
            eBottom >= plat.y &&
            eBottom <= plat.y + 6 &&
            enemy.px + 20 > plat.x &&
            enemy.px < plat.x + plat.w
          ) {
            enemy.py = plat.y - 24;
          }
        }

        // Bounce at platform edges
        let onPlat = false;
        for (const plat of platforms) {
          if (
            Math.abs(eBottom - plat.y) < 4 &&
            enemy.px + 20 > plat.x &&
            enemy.px < plat.x + plat.w
          ) {
            onPlat = true;
            if (enemy.px <= plat.x + 2 && enemy.vx < 0) enemy.vx = Math.abs(enemy.vx);
            if (enemy.px + 20 >= plat.x + plat.w - 2 && enemy.vx > 0) enemy.vx = -Math.abs(enemy.vx);
          }
        }
        void onPlat;

        // Collision with player
        const eLeft = enemy.px;
        const eRight = enemy.px + 20;
        const eTop = enemy.py;
        const pLeft = gs.playerX;
        const pRight = gs.playerX + 20;
        const pTop = gs.playerY;
        const pBot = gs.playerY + 42;

        const overlap =
          eRight > pLeft + 4 &&
          eLeft < pRight - 4 &&
          eBottom > pTop + 8 &&
          eTop < pBot - 4;

        if (overlap) {
          if (gs.playerVY > 0 && pBot - gs.playerVY <= eTop + 6) {
            enemy.alive = false;
            enemy.squishTimer = 30;
            enemy.speechTimer = 120;
            enemy.speechText = `✓ ${enemy.method}`;
            gs.enemiesDefeated += 1;
            gs.playerVY = -8;
            const ac = ensureAudio();
            playKill(ac);
          } else if (gs.invincibleTimer === 0) {
            gs.lives -= 1;
            gs.playerFlashRed = 60;
            gs.invincibleTimer = 90;
            setLives(gs.lives);
            if (gs.lives <= 0) {
              gs.gameOver = true;
            } else {
              gs.playerX = gs.checkpointX;
              gs.playerY = groundY;
              gs.playerVX = 0;
              gs.playerVY = 0;
            }
          }
        }
      }

      // ── Checkpoint ────────────────────────────────────────
      const newCheckpoint = Math.floor(gs.playerX / 1000) * 1000 + 150;
      if (newCheckpoint > gs.checkpointX) gs.checkpointX = newCheckpoint;

      // ── Win condition ─────────────────────────────────────
      if (gs.playerX > 6500 && !gs.won) gs.won = true;

      // ── Dialogue bubbles ──────────────────────────────────
      gs.nextDialogueIn -= 1;
      if (gs.nextDialogueIn <= 0 && !gs.dialogueBubble) {
        const line = DIALOGUE_LINES[Math.floor(Math.random() * DIALOGUE_LINES.length)] ?? DIALOGUE_LINES[0]!;
        gs.dialogueBubble = {
          text: line,
          x: gs.playerX + 10,
          y: gs.playerY - 10,
          life: 180,
          maxLife: 180,
        };
        gs.nextDialogueIn = 600 + Math.floor(Math.random() * 300);
      }
      if (gs.dialogueBubble) {
        gs.dialogueBubble.life -= 1;
        if (gs.dialogueBubble.life <= 0) gs.dialogueBubble = null;
      }

      // ── Draw ──────────────────────────────────────────────

      // Background (sky image + parallax hills + trees + clouds)
      drawBackground(ctx, gs.cameraX, lw, CANVAS_H, gs.frameCount, bgImgRef.current);

      // Birds (parallax 0.4)
      drawBirds(ctx, gs.cameraX, gs.frameCount);

      // Ground (layered: underground, soil, grass + water)
      drawGround(ctx, gs.cameraX, lw, CANVAS_H, gs.frameCount);

      // Platforms
      for (const p of platforms) {
        drawPlatform(ctx, p, gs.cameraX);
      }

      // Collectibles
      for (const c of gs.collectibles) {
        drawCollectible(ctx, c, gs.frameCount, gs.cameraX);
      }

      // Enemies
      for (const enemy of gs.enemies) {
        drawEnemy(ctx, enemy, gs.frameCount, gs.cameraX);
        if (enemy.speechTimer > 0 && !enemy.alive) {
          drawSpeechBubble(
            ctx,
            {
              text: enemy.speechText,
              x: enemy.px + 10,
              y: enemy.py,
              timer: enemy.speechTimer,
            },
            gs.cameraX
          );
        }
      }

      // Player
      drawPlayer(
        ctx,
        gs.playerX,
        gs.playerY,
        gs.playerFacing,
        gs.frameCount,
        gs.playerOnGround,
        gs.playerVY,
        gs.playerFlashRed,
        gs.cameraX
      );

      // Dialogue bubble
      if (gs.dialogueBubble) {
        drawDialogueBubble(ctx, gs.dialogueBubble, gs.cameraX);
      }

      // HUD on canvas
      drawHUDCanvas(ctx, gs.lives, gs.collectedIds.size, lw);

      ctx.restore();

      gs.frameCount += 1;

      // ── Check end states ───────────────────────────────────
      if (gs.won) {
        setWinStats({
          collected: gs.collectedIds.size,
          enemies: gs.enemiesDefeated,
          elapsed: Date.now() - gs.startTime,
        });
        const ac = ensureAudio();
        playWin(ac);
        setPhase("win");
        return;
      }
      if (gs.gameOver) {
        setPhase("gameover");
        return;
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    }

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [phase, onExit, ensureAudio]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, cursor: "default" }}>
      <AnimatePresence mode="wait">
        {phase === "messenger" && (
          <motion.div key="messenger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MessengerPhase onStart={handleStart} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "playing" && (
        <>
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%", cursor: "default" }}
          />
          <HUD
            collectedIds={collectedIds}
            lives={lives}
            collectibles={hudCollectibles}
          />
          <button
            onClick={onExit}
            style={{
              position: "fixed",
              top: 12,
              right: 16,
              zIndex: 250,
              background: "transparent",
              border: "none",
              color: "#666",
              fontFamily: "monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ✕ exit
          </button>
        </>
      )}

      {phase === "win" && (
        <WinScreen
          collectedCount={winStats.collected}
          enemiesDefeated={winStats.enemies}
          elapsed={winStats.elapsed}
          onExit={onExit}
        />
      )}

      {phase === "gameover" && (
        <GameOverScreen onRestart={handleRestart} onExit={onExit} />
      )}
    </div>
  );
}
