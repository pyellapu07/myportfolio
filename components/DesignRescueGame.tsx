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
  velY: number;
  onGround: boolean;
  squishTimer: number;
  speechTimer: number;
  speechText: string;
  dir: number;
  spawnX: number;
  jumpTimer: number;
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

interface WaterSplash {
  active: boolean;
  x: number;
  frame: number;
}

interface Companion {
  id: 'scooby' | 'walle';
  x: number;
  y: number;
  velY: number;
  alive: boolean;
  frame: number;
  state: 'follow' | 'scared' | 'attack';
  shootCooldown: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'teamup';
  collected: boolean;
  bobOffset: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  active: boolean;
}

interface HelicopterDrop {
  active: boolean;
  x: number;
  y: number;
  frame: number;
  phase: 'descend' | 'drop' | 'ascend';
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
  waterSplash: WaterSplash | null;
  prevPlayerOnGround: boolean;
  idleTimer: number;
  idleAction: string | null;
  idleActionFrame: number;
  blushTimer: number;
  lastDialogue: string;
  companions: Companion[];
  powerUps: PowerUp[];
  playerBullets: number;
  bullets: Bullet[];
  helicopterDrop: HelicopterDrop | null;
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
  "one interview would be great rn hehe",
  "no stress at all. REALLY. I'm fine.",
  "if you wanna reach out... 2406107815 📱",
  "another dark pattern? I've seen worse.",
  "scope creep. my old nemesis.",
  "this would look great in a case study 😏",
  "UX saves lives. well, products. same thing.",
  "I ship things that users actually use 🎯",
  "5 years of this and I still love it tbh",
  "a good designer never blames the user 💡",
  "dark patterns are just evil. full stop.",
  "lorem ipsum is a war crime in design",
  "deploy on friday? hold my figma file",
  "the user always wins. always.",
  "stakeholder: 'make it pop' me: 🙃",
  "accessibility is not optional. period.",
  "my portfolio is literally right there →",
  "hire me and I promise no lorem ipsum",
  "what if the real UX was the friends we made",
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
    py: H - 80 - 40,
    vx: 1.2,
    velY: 0,
    onGround: true,
    squishTimer: 0,
    speechTimer: 0,
    speechText: "",
    dir: 1,
    spawnX: d.x,
    jumpTimer: 0,
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

function drawSingleBird(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  frameCount: number,
  wingPhase: number
) {
  const wingPhaseVal = Math.sin(frameCount * 0.10 + wingPhase);

  ctx.save();
  ctx.translate(sx, sy);

  // Body (white/light gray) — bird flies LEFT, so beak on left
  ctx.fillStyle = '#f8f8f0';
  ctx.fillRect(0, 2, 8, 3);
  // Wings flap up and down
  const wingY = wingPhaseVal > 0 ? -2 : 2;
  ctx.fillStyle = '#e8e8e0';
  ctx.fillRect(-2, 2 + wingY, 5, 2); // left wing
  ctx.fillRect(5, 2 + wingY, 5, 2);  // right wing
  // Wing tips darker
  ctx.fillStyle = '#555';
  ctx.fillRect(-3, 2 + wingY, 2, 1);
  ctx.fillRect(9, 2 + wingY, 2, 1);
  // Beak on left (front of bird flying left)
  ctx.fillStyle = '#FFB800';
  ctx.fillRect(-2, 3, 3, 2);
  // Eye near beak
  ctx.fillStyle = '#111';
  ctx.fillRect(1, 2, 1, 1);
  // Tail on right
  ctx.fillStyle = '#ddd';
  ctx.fillRect(7, 3, 3, 2);

  ctx.restore();
}

function drawBirds(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  frameCount: number
) {
  const logicalW = ctx.canvas.width / (ctx.canvas.height / CANVAS_H);
  for (let i = 0; i < BIRD_DEFS.length; i++) {
    const bird = BIRD_DEFS[i];
    if (!bird) continue;
    // Birds fly LEFT — worldX decreases each frame, wraps from right
    const worldX = ((bird.x - frameCount * bird.speed * 0.5) % (LEVEL_W + 200) + LEVEL_W + 200) % (LEVEL_W + 200);
    const sx = worldX - cameraX * 0.4;
    if (sx < -50 || sx > logicalW + 50) continue;
    const sy = bird.y;

    drawSingleBird(ctx, sx, sy, frameCount, bird.wingPhase);

    // Formation buddies trailing behind (to the right since flying left)
    for (let f = 1; f <= 2; f++) {
      const bsx = sx + f * 16;
      const bsy = sy + f * 6;
      if (bsx > logicalW + 20) continue;
      drawSingleBird(ctx, bsx, bsy, frameCount, bird.wingPhase + f * 0.4);
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

function drawSparkles(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  frame: number,
  facingLeft: boolean
) {
  const trailDir = facingLeft ? 1 : -1;
  const colors = ['#FFD700', '#FF5210', '#ffffff', '#FFB800'];
  for (let i = 0; i < 4; i++) {
    const age = (frame + i * 5) % 20;
    if (age > 15) continue;
    const alpha = 1 - age / 15;
    const tx = px + trailDir * (age * 3 + i * 5) + 18;
    const ty = py + 40 + Math.sin(age * 0.6 + i) * 4;
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = colors[i] ?? '#FFD700';
    ctx.fillRect(tx,   ty,   1, 1);
    ctx.fillRect(tx-1, ty,   1, 1);
    ctx.fillRect(tx+1, ty,   1, 1);
    ctx.fillRect(tx,   ty-1, 1, 1);
    ctx.fillRect(tx,   ty+1, 1, 1);
    ctx.restore();
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  frame: number,
  velX: number,
  velY: number,
  onGround: boolean,
  facingLeft: boolean,
  flashRed: number,
  cameraX: number
) {
  void velY;
  const sx = px - cameraX;
  const sy = py;
  const S = 1.8; // pixelSize — smaller, cuter Mario-style

  const isRunning = Math.abs(velX) > 0 && onGround;
  const isJumping = !onGround;

  if (flashRed > 0 && Math.floor(flashRed / 4) % 2 === 0) {
    ctx.save();
    ctx.globalAlpha = 0.5;
  }

  // Breathing: always active slow sin wave on body
  const breatheY = Math.sin(frame * 0.04) * 0.8;
  // Blink: every 150 frames, 1-frame closure
  const eyeH = frame % 150 < 2 ? 1 : 2;
  // Run leg swap: every 8 frames alternate
  const legPhase = isRunning ? Math.floor(frame / 8) % 2 : 0;
  // Arm swing for running
  const armFwdOffset = isRunning ? (legPhase === 0 ? -1 : 1) : 0;

  // Total height = 44px. Head 40% = 17.6, Body 30% = 13.2, Legs 30% = 13.2
  // In S units: Head≈10S, Body≈7S, Legs≈7S total = 24S = 43.2px ≈ 44px

  ctx.save();
  if (facingLeft) {
    ctx.translate(2 * (sx + 16 * S / 2), 0);
    ctx.scale(-1, 1);
  }

  const bx = sx;
  const by = sy + breatheY;

  function p(lx: number, ly: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(bx + lx * S, by + ly * S, w * S, h * S);
  }

  // ── HEAD (big, cute — 40% of 44px = ~17px = ~9.5S) ────────
  p(3, 0, 10, 10, '#D4956A');          // Big round skull
  p(2, 0,  11, 4, '#1a1a1a');          // Hair top wide
  p(2, 1,  2,  6, '#1a1a1a');          // Hair left side
  p(3, 4,  2,  2, '#2d2d2d');          // Hair highlight
  p(11, 5, 2,  2, '#c07850');          // Nose
  p(8,  4, 2,  eyeH, '#1a1a1a');       // Eye
  if (eyeH > 1) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + 9 * S, by + 4 * S, S, S);
  }
  p(10, 7, 2, 1, '#c07850');           // Mouth
  p(2,  5, 2, 3, '#c07850');           // Ear
  p(4,  9, 6, 1, '#D4956A');           // Jaw
  p(6, 10, 3, 1, '#D4956A');           // Neck

  // ── BODY (30% of 44px = ~13px = ~7S) ───────────────────────
  const bodyY = 11;
  p(4, bodyY,   8, 7, '#FF5210');      // Torso
  p(4, bodyY,   1, 7, '#ff6b35');      // Jacket left highlight
  p(11,bodyY,   1, 7, '#cc4200');      // Jacket right shadow
  p(5, bodyY+5, 6, 2, '#ffffff');      // White shirt bottom
  p(9, bodyY+1, 2, 2, '#cc4200');      // Chest pocket
  p(9, bodyY+2, 2, 1, '#FFD700');      // Badge

  // ── ARMS ───────────────────────────────────────────────────
  const backArmY = bodyY + (isRunning ? -armFwdOffset : 0);
  p(12, backArmY,   2, 6, '#e04800'); // Back arm
  p(12, backArmY+5, 2, 2, '#c07850'); // Back hand

  const frontArmY = bodyY + (isRunning ? armFwdOffset : 0);
  p(2,  frontArmY,   2, 6, '#FF5210'); // Front arm
  p(2,  frontArmY+5, 2, 2, '#D4956A'); // Front hand

  // ── LEGS (30% of 44px = ~13px = ~7S) ──────────────────────
  const walkFrame4 = Math.floor(frame / 8) % 4;
  const legsBaseY = 18;

  if (isJumping) {
    p(6, legsBaseY+1, 3, 4, '#283593');
    p(4, legsBaseY+1, 3, 4, '#1a237e');
    p(4, legsBaseY+4, 4, 2, '#f5f5f5');
    p(6, legsBaseY+4, 3, 2, '#f5f5f5');
    p(4, legsBaseY+5, 4, 1, '#FF5210');
  } else if (isRunning) {
    const frontLegForward = (walkFrame4 === 0 || walkFrame4 === 1);
    const fLegOffset = frontLegForward ? S : -S;
    const bLegOffset = -fLegOffset;
    ctx.fillStyle = '#283593';
    const bUpperX = bx + (5 * S) + bLegOffset;
    ctx.fillRect(bUpperX, by + 18 * S, 3 * S, 3 * S);
    const bKneeX = bUpperX + (bLegOffset > 0 ? S : -S);
    ctx.fillRect(bKneeX, by + 21 * S, 3 * S, 3 * S);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(bKneeX - S, by + 24 * S, 4 * S, 2 * S);
    ctx.fillStyle = '#FF5210';
    ctx.fillRect(bKneeX - S, by + 25 * S, 4 * S, S);
    ctx.fillStyle = '#1a237e';
    const fUpperX = bx + (7 * S) + fLegOffset;
    ctx.fillRect(fUpperX, by + 18 * S, 3 * S, 3 * S);
    const fKneeX = fUpperX + (fLegOffset > 0 ? 0 : -S);
    ctx.fillRect(fKneeX, by + 21 * S, 3 * S, 3 * S);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(fKneeX, by + 24 * S, 4 * S, 2 * S);
    ctx.fillStyle = '#FF5210';
    ctx.fillRect(fKneeX, by + 25 * S, 4 * S, S);
  } else {
    ctx.fillStyle = '#1a237e';
    ctx.fillRect(bx + 4 * S, by + 18 * S, 3 * S, 6 * S);
    ctx.fillStyle = '#283593';
    ctx.fillRect(bx + 7 * S, by + 18 * S, 3 * S, 6 * S);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(bx + 3 * S, by + 23 * S, 4 * S, 2 * S);
    ctx.fillRect(bx + 7 * S, by + 23 * S, 4 * S, 2 * S);
    ctx.fillStyle = '#FF5210';
    ctx.fillRect(bx + 3 * S, by + 24 * S, 4 * S, S);
    ctx.fillRect(bx + 7 * S, by + 24 * S, 4 * S, S);
  }

  void walkFrame4;

  ctx.restore();

  if (isRunning) {
    drawSparkles(ctx, sx, sy, frame, facingLeft);
  }

  if (flashRed > 0 && Math.floor(flashRed / 4) % 2 === 0) {
    ctx.restore();
  }
}
function drawEnemyNameTag(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  name: string
) {
  const padding = 4;
  ctx.font = 'bold 8px monospace';
  const tw = ctx.measureText(name).width;
  const bw = tw + padding * 2;
  const bh = 14;
  const bx = screenX - bw / 2;
  const by = screenY - bh - 6;
  // Dark pill background
  ctx.fillStyle = 'rgba(20,20,20,0.85)';
  ctx.fillRect(bx, by, bw, bh);
  // Colored left border
  ctx.fillStyle = '#FF5210';
  ctx.fillRect(bx, by, 2, bh);
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, bx + padding + 2, by + bh - 4);
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: GameEnemy,
  frameCount: number,
  cameraX: number
) {
  if (!enemy.alive && enemy.squishTimer <= 0) return;
  const sx = enemy.px - cameraX;
  const S = 2;
  // enemyHeight = 40; sy = top of sprite, feet at sy + 40 = groundY
  const sy = enemy.py;

  ctx.save();

  if (enemy.squishTimer > 0) {
    const scaleY = enemy.squishTimer / 30;
    ctx.translate(sx + 14, sy + 20);
    ctx.scale(1, scaleY);
    ctx.translate(-(sx + 14), -(sy + 20));
  }

  ctx.translate(sx, sy);
  // Alien faces LEFT by default (toward player who comes from left)
  // If enemy moving RIGHT (vx > 0), flip so it still faces the direction of travel
  // vx < 0 = moving left = faces left (normal, no flip)
  // vx > 0 = moving right = flip to face right
  if (enemy.vx > 0) {
    ctx.translate(28, 0);
    ctx.scale(-1, 1);
  }

  const walkFrame = Math.floor(frameCount / 8) % 4;

  // === TAIL (sinuous, side view) ===
  ctx.strokeStyle = enemy.color;
  ctx.lineWidth = S;
  ctx.lineCap = 'round';
  const tw2 = Math.sin(frameCount * 0.10) * 5;
  ctx.beginPath();
  ctx.moveTo(12 * S, 14 * S);
  ctx.quadraticCurveTo(8 * S, (16 + tw2) * S, 4 * S, (18 + tw2 * 0.5) * S);
  ctx.quadraticCurveTo(1 * S, (19 + tw2) * S, 0, (17 + tw2 * 0.8) * S);
  ctx.stroke();
  ctx.fillStyle = darkenColor(enemy.color, 30);
  ctx.fillRect(0, (17 + tw2 * 0.8) * S - S, S, S * 2);

  // === BACK LEG (side profile, alternating walk) ===
  const backLegPhase = (walkFrame === 0 || walkFrame === 1) ? 1 : -1;
  const frontLegPhase = -backLegPhase;

  ctx.fillStyle = darkenColor(enemy.color, 25);
  const bUpperY = 13 * S + backLegPhase * S;
  ctx.fillRect(6 * S, bUpperY, 2 * S, 4 * S);
  const bKneeX = 6 * S + (backLegPhase > 0 ? S : -S);
  ctx.fillRect(bKneeX, bUpperY + 4 * S, 2 * S, 3 * S);
  ctx.fillStyle = '#222';
  ctx.fillRect(bKneeX - S, bUpperY + 7 * S, 3 * S, S);

  // === BODY (hunched, side profile) ===
  ctx.fillStyle = enemy.color;
  ctx.fillRect(4 * S, 5 * S, 8 * S, 9 * S);
  ctx.fillRect(3 * S, 6 * S, 2 * S, 5 * S);
  ctx.fillStyle = darkenColor(enemy.color, 35);
  ctx.fillRect(4 * S, 5 * S, 8 * S, S);
  ctx.fillRect(4 * S, 7 * S, 8 * S, S);
  ctx.fillRect(4 * S, 9 * S, 6 * S, S);
  ctx.fillStyle = lightenColor(enemy.color, 35);
  ctx.fillRect(3 * S, 6 * S, S, 4 * S);

  // === FRONT LEG (side profile) ===
  ctx.fillStyle = darkenColor(enemy.color, 15);
  const fUpperY = 13 * S + frontLegPhase * S;
  ctx.fillRect(7 * S, fUpperY, 2 * S, 4 * S);
  const fKneeX = 7 * S + (frontLegPhase > 0 ? S : -S);
  ctx.fillRect(fKneeX, fUpperY + 4 * S, 2 * S, 3 * S);
  ctx.fillStyle = '#111';
  ctx.fillRect(fKneeX, fUpperY + 7 * S, 3 * S, S);
  ctx.fillRect(fKneeX + 2 * S, fUpperY + 7 * S, S, S + 1);

  // === FRONT ARM ===
  const armSwing = Math.sin(frameCount * 0.12) * 2;
  ctx.fillStyle = darkenColor(enemy.color, 10);
  ctx.fillRect(10 * S, (7 + armSwing) * S, 3 * S, 4 * S);
  ctx.fillRect(11 * S, (10 + armSwing + 1) * S, 2 * S, 3 * S);
  ctx.fillStyle = '#111';
  ctx.fillRect(10 * S, (12 + armSwing + 1) * S, S, S);
  ctx.fillRect(12 * S, (12 + armSwing) * S, S, S);

  // === HEAD (elongated dome, side profile) ===
  const headBob = (walkFrame === 1 || walkFrame === 3) ? S : 0;
  ctx.fillStyle = lightenColor(enemy.color, 10);
  ctx.fillRect(6 * S, headBob, 7 * S, 6 * S);
  ctx.fillRect(7 * S, headBob - S, 5 * S, S);
  ctx.fillRect(8 * S, headBob - 2 * S, 3 * S, S);
  ctx.fillStyle = lightenColor(enemy.color, 45);
  ctx.fillRect(6 * S, headBob, S, 4 * S);
  ctx.fillRect(7 * S, headBob - S, 2 * S, S);
  // Glowing eye
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(10 * S, (2 + headBob / S) * S, 2 * S, 2 * S);
  ctx.fillStyle = '#fff';
  ctx.fillRect(11 * S, (2 + headBob / S) * S, S, S);
  // Mandible
  const mandPhase = Math.sin(frameCount * 0.10);
  ctx.fillStyle = darkenColor(enemy.color, 20);
  ctx.fillRect(11 * S, (5 + mandPhase) * S, 2 * S, 2 * S);
  ctx.fillStyle = '#111';
  ctx.fillRect(12 * S, (6 + mandPhase) * S, S, S);

  ctx.restore();

  // Draw name tag directly above enemy, using current screen position
  // screenX = center of sprite = sx + 14, screenY = top of sprite = sy
  // But we need absolute screen coords (post-transform). We saved and restored so coords are back.
  drawEnemyNameTag(ctx, sx + 14, sy - 2, enemy.label);
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

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function drawDialogueBubble(
  ctx: CanvasRenderingContext2D,
  bubble: DialogueBubble,
  cameraX: number,
  canvasW: number
) {
  const alpha = Math.min(1, bubble.life / 30) * Math.min(1, (bubble.maxLife - bubble.life) / 30);
  // Player screen x (center of head) — bubble.x is world coord of player center
  const px = bubble.x - cameraX;
  const py = bubble.y;

  ctx.save();
  ctx.globalAlpha = alpha;

  const lines = wrapText(bubble.text, 22);
  const lineH = 14;
  const padX = 8, padY = 6;
  const bw = 180;
  const bh = lines.length * lineH + padY * 2;
  const bx = Math.max(4, Math.min(px + 18 - bw / 2, canvasW - bw - 4));
  const by = py - bh - 18;

  // White box
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, bh);

  // Arrow pointing down at player head center
  const arrowX = Math.min(Math.max(px + 18, bx + 10), bx + bw - 10);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(arrowX - 6, by + bh);
  ctx.lineTo(arrowX + 6, by + bh);
  ctx.lineTo(arrowX, by + bh + 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(arrowX - 6, by + bh + 1);
  ctx.lineTo(arrowX, by + bh + 10);
  ctx.lineTo(arrowX + 6, by + bh + 1);
  ctx.stroke();

  // Text
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 9px monospace';
  lines.forEach((line, i) => {
    ctx.fillText(line, bx + padX, by + padY + 10 + i * lineH);
  });

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

function drawWaterSplash(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  splashFrame: number
) {
  if (splashFrame > 20) return;
  const alpha = 1 - splashFrame / 20;
  ctx.save();
  ctx.globalAlpha = alpha;
  // Left spray
  for (let d = 0; d < 5; d++) {
    const t = splashFrame * 0.15 + d;
    const dx = -8 + d * 4 + Math.sin(t) * 3;
    const dy = -(splashFrame * 1.5) + d * 2;
    ctx.fillStyle = d % 2 === 0 ? '#64B5F6' : '#ffffff';
    ctx.fillRect(sx + dx - 12, sy + dy, 3, 3);
  }
  // Right spray (mirror)
  for (let d = 0; d < 5; d++) {
    const t = splashFrame * 0.15 + d;
    const dx = 8 - d * 4 + Math.sin(t) * 3;
    const dy = -(splashFrame * 1.5) + d * 2;
    ctx.fillStyle = d % 2 === 0 ? '#64B5F6' : '#ffffff';
    ctx.fillRect(sx + dx + 12, sy + dy, 3, 3);
  }
  ctx.restore();
}

function drawCoin(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, collected: boolean) {
  const r = 10;
  const c = collected ? color : '#666';
  const light = collected ? lightenColor(color, 40) : '#888';
  const dark = collected ? darkenColor(color, 40) : '#444';

  // Coin outer ring (pixel circle approximation)
  ctx.fillStyle = dark;
  ctx.fillRect(cx-4, cy-r-1, 8, 3);
  ctx.fillRect(cx-4, cy+r-2, 8, 3);
  ctx.fillRect(cx-r-1, cy-4, 3, 8);
  ctx.fillRect(cx+r-2, cy-4, 3, 8);
  ctx.fillRect(cx-7, cy-8, 2, 2);
  ctx.fillRect(cx+5, cy-8, 2, 2);
  ctx.fillRect(cx-7, cy+6, 2, 2);
  ctx.fillRect(cx+5, cy+6, 2, 2);

  // Coin face fill
  ctx.fillStyle = c;
  ctx.fillRect(cx-8, cy-7, 16, 14);
  ctx.fillRect(cx-6, cy-9, 12, 18);
  ctx.fillRect(cx-9, cy-5, 18, 10);

  // Inner highlight
  ctx.fillStyle = light;
  ctx.fillRect(cx-5, cy-6, 4, 8);
  ctx.fillRect(cx-5, cy-6, 8, 3);

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(cx-6, cy-7, 3, 2);
  ctx.fillRect(cx-7, cy-5, 2, 3);

  if (collected) {
    ctx.fillStyle = '#00e676';
    ctx.fillRect(cx-3, cy+2, 2, 4);
    ctx.fillRect(cx-1, cy+4, 2, 2);
    ctx.fillRect(cx+1, cy, 2, 5);
  }
}

function drawPiecesHUD(
  ctx: CanvasRenderingContext2D,
  collectibles: GameCollectible[],
  canvasW: number
) {
  const total = collectibles.length;
  const spacing = canvasW / (total + 1);

  collectibles.forEach((item, i) => {
    const cx = spacing * (i + 1);
    const cy = 28;
    const collected = item.collected;

    drawCoin(ctx, cx, cy, item.color, collected);

    // Full label below coin — split into 2 lines if long
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    const label = item.label;
    const words = label.split(' ');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(words[0] ?? '', cx + 1, cy + 16);
    if (words[1]) ctx.fillText(words.slice(1).join(' '), cx + 1, cy + 24);
    ctx.fillStyle = collected ? '#ffffff' : '#aaaaaa';
    ctx.fillText(words[0] ?? '', cx, cy + 15);
    if (words[1]) ctx.fillText(words.slice(1).join(' '), cx, cy + 23);
    ctx.textAlign = 'left';
  });
}

function drawPowerUp(ctx: CanvasRenderingContext2D, sx: number, sy: number, frame: number) {
  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#FF5210';
  // Helicopter body
  ctx.fillStyle = '#FF5210';
  ctx.fillRect(sx-2, sy+2, 14, 6);
  ctx.fillStyle = '#cc4200';
  ctx.fillRect(sx-2, sy+2, 14, 2);
  // Rotor
  ctx.fillStyle = '#fff';
  if (Math.floor(frame * 0.3) % 2 === 0) {
    ctx.fillRect(sx-6, sy, 22, 2);
  } else {
    ctx.fillRect(sx+5, sy-5, 2, 12);
  }
  // Tail
  ctx.fillStyle = '#FF5210';
  ctx.fillRect(sx+12, sy+3, 6, 3);
  ctx.fillRect(sx+16, sy+1, 2, 5);
  // Landing skids
  ctx.fillStyle = '#888';
  ctx.fillRect(sx, sy+8, 10, 1);
  ctx.restore();
  // Label
  ctx.font = 'bold 7px monospace';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.fillText('TEAM COLLAB', sx + 5, sy + 20);
  ctx.textAlign = 'left';
}

function drawScooby(ctx: CanvasRenderingContext2D, sx: number, sy: number, frame: number, scared: boolean) {
  const S = 1.5;
  const shake = scared ? Math.sin(frame * 0.5) * 2 : 0;
  ctx.save();
  ctx.translate(sx + shake, sy);
  // Body
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(2*S, 6*S, 12*S, 8*S);
  ctx.fillRect(4*S, 4*S, 10*S, 5*S);
  ctx.fillStyle = '#D2691E';
  ctx.fillRect(4*S, 9*S, 8*S, 5*S);
  // Head
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(8*S, 0, 9*S, 8*S);
  ctx.fillRect(10*S, -S, 6*S, 3*S);
  // Ear
  ctx.fillRect(6*S, S, 4*S, 6*S);
  ctx.fillStyle = '#A0522D';
  ctx.fillRect(6*S, 2*S, 3*S, 5*S);
  // Eye
  ctx.fillStyle = scared ? '#ffff00' : '#ffffff';
  ctx.fillRect(13*S, 2*S, 3*S, 3*S);
  ctx.fillStyle = '#111';
  ctx.fillRect(14*S, 2*S, 2*S, 2*S);
  ctx.fillStyle = '#fff';
  ctx.fillRect(14*S, 2*S, S, S);
  // Nose
  ctx.fillStyle = '#111';
  ctx.fillRect(16*S, 5*S, 2*S, S);
  // Collar
  ctx.fillStyle = '#00BCD4';
  ctx.fillRect(9*S, 7*S, 7*S, 2*S);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(12*S, 8*S, 2*S, 2*S);
  // Legs
  const lw = Math.sin(frame * 0.15) * 2;
  ctx.fillStyle = '#8B4513';
  ctx.fillRect((3 + lw)*S, 13*S, 3*S, 4*S);
  ctx.fillRect((8 - lw)*S, 13*S, 3*S, 4*S);
  // Tail
  const tailWag = Math.sin(frame * 0.2) * 3;
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2*S;
  ctx.beginPath();
  ctx.moveTo(2*S, 8*S);
  ctx.quadraticCurveTo(0, (5 + tailWag)*S, 2*S, (2 + tailWag)*S);
  ctx.stroke();
  ctx.restore();
}

function drawWallE(ctx: CanvasRenderingContext2D, sx: number, sy: number, frame: number, shooting: boolean) {
  void frame;
  const S = 1.6;
  ctx.save();
  ctx.translate(sx, sy);
  // Tracks
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(0, 13*S, 14*S, 5*S);
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(S, 14*S, 12*S, 3*S);
  ctx.fillStyle = '#111';
  [2,5,8,11].forEach(wx => ctx.fillRect(wx*S, 14*S, S, 2*S));
  // Body
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(2*S, 7*S, 10*S, 7*S);
  ctx.fillStyle = '#795548';
  ctx.fillRect(2*S, 7*S, 10*S, 2*S);
  // Chest panel
  ctx.fillStyle = '#333';
  ctx.fillRect(4*S, 9*S, 6*S, 4*S);
  ctx.fillStyle = '#e53935';
  ctx.fillRect(5*S, 10*S, 2*S, 2*S);
  ctx.fillStyle = '#FF8F00';
  ctx.fillRect(8*S, 10*S, 2*S, 2*S);
  // Neck
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(5*S, 4*S, 4*S, 4*S);
  // Head
  ctx.fillStyle = '#6D4C41';
  ctx.fillRect(S, S, 12*S, 5*S);
  // Left eye
  ctx.fillStyle = '#333';
  ctx.fillRect(S, 0, 5*S, 5*S);
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(2*S, S, 3*S, 3*S);
  ctx.fillStyle = '#555';
  ctx.fillRect(3*S, 2*S, S, S);
  ctx.fillStyle = '#fff';
  ctx.fillRect(2*S, S, S, S);
  // Right eye
  ctx.fillStyle = '#333';
  ctx.fillRect(8*S, 0, 5*S, 5*S);
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(9*S, S, 3*S, 3*S);
  ctx.fillStyle = '#555';
  ctx.fillRect(10*S, 2*S, S, S);
  ctx.fillStyle = '#fff';
  ctx.fillRect(9*S, S, S, S);
  // Arm
  if (shooting) {
    ctx.fillStyle = '#555';
    ctx.fillRect(13*S, 8*S, 5*S, 2*S);
    ctx.fillStyle = '#FF5210';
    ctx.fillRect(18*S, 8*S, 2*S, 2*S);
  } else {
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(13*S, 9*S, 3*S, 3*S);
  }
  ctx.restore();
}

function drawHelicopterDrop(ctx: CanvasRenderingContext2D, hd: HelicopterDrop, frame: number) {
  const sx = hd.x - 20;
  const sy = hd.y;
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#FF5210';
  // Body
  ctx.fillStyle = '#FF5210';
  ctx.fillRect(sx, sy+6, 40, 14);
  ctx.fillStyle = '#cc4200';
  ctx.fillRect(sx, sy+6, 40, 4);
  // Rotor
  ctx.fillStyle = '#fff';
  if (Math.floor(frame * 0.3) % 2 === 0) {
    ctx.fillRect(sx-10, sy+2, 60, 4);
  } else {
    ctx.fillRect(sx+18, sy-8, 4, 24);
  }
  // Tail
  ctx.fillStyle = '#FF5210';
  ctx.fillRect(sx+40, sy+8, 14, 6);
  ctx.fillRect(sx+52, sy+4, 4, 14);
  // Windows
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(sx+6, sy+8, 10, 8);
  ctx.fillRect(sx+20, sy+8, 10, 8);
  // Skids
  ctx.fillStyle = '#888';
  ctx.fillRect(sx+4, sy+20, 32, 2);
  ctx.restore();
}

function drawBigPixelText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, color: string, pixelSize: number) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = `bold ${pixelSize * 8}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx + 3, cy + 3);
  ctx.fillStyle = darkenColor(color, 50);
  ctx.fillText(text, cx + 1, cy + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);
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
  onExit: () => void;
}

function MessengerPhase({ onStart, onExit }: MessengerPhaseProps) {
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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "#0d0d0d", fontFamily: "monospace", cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 1 L2 15 L5 12 L7.5 17.5 L9.5 16.5 L7 11 L11 11 Z' fill='white' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E\") 2 1, auto", position: "relative" }}
    >
      <button
        onClick={onExit}
        style={{
          position: "absolute", top: 20, left: 24,
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#aaa", fontFamily: "monospace", fontSize: 11,
          padding: "6px 14px", borderRadius: 4, cursor: "pointer",
          letterSpacing: "0.05em", zIndex: 10,
        }}
      >
        ← exit
      </button>
      <button
        onClick={onStart}
        style={{
          position: "absolute", top: 20, right: 24,
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#aaa", fontFamily: "monospace", fontSize: 11,
          padding: "6px 14px", borderRadius: 4, cursor: "pointer",
          letterSpacing: "0.05em", zIndex: 10,
        }}
      >
        skip →
      </button>

      <div style={{ maxWidth: 520, width: "100%", margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", height: "100%", maxHeight: "100vh", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingTop: 48 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                background: "#4A90D9",
                position: "relative",
                imageRendering: "pixelated",
              }}
            >
              <div style={{ position: "absolute", top: 14, left: 8, width: 6, height: 6, background: "#111" }} />
              <div style={{ position: "absolute", top: 14, left: 24, width: 6, height: 6, background: "#111" }} />
              <div style={{ position: "absolute", bottom: 9, left: 11, width: 16, height: 3, background: "#111" }} />
              <div style={{ position: "absolute", bottom: 6, left: 14, width: 10, height: 2, background: "#111" }} />
            </div>
            <div
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                width: 10,
                height: 10,
                background: "#e74c3c",
                borderRadius: "50%",
                border: "2px solid #0d0d0d",
              }}
            />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>Pete</div>
            <div style={{ color: "#888", fontSize: 9 }}>Head of Product @ PixelCo</div>
          </div>
        </div>

        <div
          className="flex flex-col flex-1 overflow-y-auto pb-8"
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
                    maxWidth: 320,
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
                    maxWidth: 320,
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
  void collectibles;
  void collectedIds;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "transparent",
        display: "flex",
        alignItems: "flex-start",
        padding: "8px 16px 0",
        zIndex: 200,
        fontFamily: "monospace",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      <div style={{ flex: 1 }} />

      <div
        style={{
          color: "#FF5210",
          fontSize: 14,
          fontWeight: "bold",
          letterSpacing: 2,
          textShadow: "0 0 8px #FF5210, 1px 1px 0 #000",
          whiteSpace: "nowrap",
          marginTop: 4,
        }}
      >
        DESIGN BOUNTY
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flex: 1 }}>
        <span style={{ color: "#FF5210", fontSize: 14, textShadow: "1px 1px 0 #000" }}>
          {"♥".repeat(lives)}{"♡".repeat(Math.max(0, 3 - lives))}
        </span>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: "bold", letterSpacing: 1, textShadow: "1px 1px 0 #000" }}>PRADEEP</span>
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
      style={{ background: "rgba(0,0,0,0.92)", fontFamily: "monospace", cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 1 L2 15 L5 12 L7.5 17.5 L9.5 16.5 L7 11 L11 11 Z' fill='white' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E\") 2 1, auto" }}
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
      style={{ background: "rgba(0,0,0,0.92)", fontFamily: "monospace", cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 1 L2 15 L5 12 L7.5 17.5 L9.5 16.5 L7 11 L11 11 Z' fill='white' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E\") 2 1, auto" }}
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
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

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
    const groundY = H - 80;
    return {
      playerX: 150,
      playerY: groundY - 44,
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
      waterSplash: null,
      prevPlayerOnGround: false,
      idleTimer: 0,
      idleAction: null,
      idleActionFrame: 0,
      blushTimer: 0,
      lastDialogue: '',
      companions: [],
      powerUps: [
        { x: 2600, y: groundY - 60, type: 'teamup', collected: false, bobOffset: 0 },
        { x: 5200, y: groundY - 60, type: 'teamup', collected: false, bobOffset: 1.5 },
      ],
      playerBullets: 0,
      bullets: [],
      helicopterDrop: null,
    };
  }, []);

  const handleStart = useCallback(() => {
    gameStateRef.current = initGameState();
    setPhase("playing");
    setCollectedIds(new Set());
    setLives(3);
  }, [initGameState]);

  const handleRestart = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
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
      if (e.code === "Escape" || e.code === "KeyP") {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        return;
      }
      if (pausedRef.current) return;
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
      // If paused, keep RAF alive so we can unpause, but don't update game state
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(gameLoop);
        return;
      }
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

      const groundY = CANVAS_H - 80; // grass top is at H-80, player feet at bottom of 44px sprite
      const PLAYER_H = 44;

      gs.playerOnGround = false;
      if (gs.playerY + PLAYER_H >= groundY) {
        gs.playerY = groundY - PLAYER_H;
        gs.playerVY = 0;
        gs.playerOnGround = true;
        gs.playerJumpsLeft = 2;
      }

      const playerBottom = gs.playerY + PLAYER_H;
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
          gs.playerY = plat.y - PLAYER_H;
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
        const py = gs.playerY + 28;
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

        // Enemy on ground or platform (enemyHeight = 40)
        const eBottom = enemy.py + 40;
        const eGroundY = CANVAS_H - 80 - 40; // grass at H-80, enemy feet at bottom of 40px sprite
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
            enemy.py = plat.y - 40;
          }
        }

        // Bounce at platform edges
        let onPlat = false;
        for (const plat of platforms) {
          if (
            Math.abs(eBottom - plat.y) < 6 &&
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
        const pBot = gs.playerY + PLAYER_H;

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
              gs.playerY = groundY - PLAYER_H;
              gs.playerVX = 0;
              gs.playerVY = 0;
            }
          }
        }
      }

      // ── Idle animations (FIX 4) ───────────────────────────
      if (gs.playerVX === 0 && gs.playerOnGround) {
        gs.idleTimer++;
        if (gs.idleTimer > 200 + Math.random() * 80) {
          gs.idleTimer = 0;
          const actions = ["excited","lookaround","stretch","wave"];
          gs.idleAction = actions[Math.floor(Math.random() * actions.length)] ?? null;
          gs.idleActionFrame = 0;
        }
        gs.idleActionFrame++;
        if (gs.idleActionFrame > 40) { gs.idleAction = null; gs.idleActionFrame = 0; }
      } else {
        gs.idleTimer = 0;
        gs.idleAction = null;
      }
      // Blush from dialogue
      if (gs.lastDialogue && (gs.lastDialogue.includes('hire') || gs.lastDialogue.includes('recruiter') || gs.lastDialogue.includes('interview'))) {
        gs.blushTimer = 180;
      }
      if (gs.blushTimer > 0) gs.blushTimer--;

      // ── Enemy AI upgrade when companions present (FIX 7) ──
      const hasCompanions = gs.companions.some(c => c.alive);
      if (hasCompanions) {
        for (const enemy of gs.enemies) {
          if (!enemy.alive) continue;
          enemy.jumpTimer = (enemy.jumpTimer || 0) + 1;
          if (enemy.jumpTimer > 200 + Math.floor(Math.random() * 100)) {
            const distToPlayer = Math.abs(enemy.px - gs.playerX);
            if (distToPlayer < 300 && enemy.onGround) {
              enemy.velY = -10;
              enemy.jumpTimer = 0;
            }
          }
          // Apply gravity to enemy
          enemy.velY = Math.min((enemy.velY || 0) + GRAVITY, MAX_FALL);
          enemy.py += enemy.velY;
          const eGroundY2 = CANVAS_H - 80 - 40;
          if (enemy.py >= eGroundY2) {
            enemy.py = eGroundY2;
            enemy.velY = 0;
            enemy.onGround = true;
          } else {
            enemy.onGround = false;
          }
        }
      }

      // ── Power-ups (FIX 5) ─────────────────────────────────
      for (const pu of gs.powerUps) {
        if (pu.collected) continue;
        const dist = Math.hypot((pu.x + 8) - (gs.playerX + 10), (pu.y + 8) - (gs.playerY + 22));
        if (dist < 28) {
          pu.collected = true;
          // Start helicopter drop
          gs.helicopterDrop = {
            active: true,
            x: gs.playerX - gs.cameraX + 10,
            y: -80,
            frame: 0,
            phase: 'descend',
          };
        }
      }

      // ── Helicopter drop animation ──────────────────────────
      if (gs.helicopterDrop && gs.helicopterDrop.active) {
        const hd = gs.helicopterDrop;
        hd.frame++;
        if (hd.phase === 'descend') {
          hd.y += 3;
          if (hd.y >= 100) { hd.phase = 'drop'; }
        } else if (hd.phase === 'drop') {
          if (hd.frame % 60 === 0 && gs.companions.length < 2) {
            // Drop companions
            const worldX = gs.playerX;
            gs.companions = [
              { id: 'scooby', x: worldX - 40, y: groundY - 36, velY: 0, alive: true, frame: 0, state: 'follow', shootCooldown: 0 },
              { id: 'walle', x: worldX + 60, y: groundY - 36, velY: 0, alive: true, frame: 60, state: 'attack', shootCooldown: 0 },
            ];
            gs.playerBullets = 5;
            hd.phase = 'ascend';
          }
        } else if (hd.phase === 'ascend') {
          hd.y -= 3;
          if (hd.y < -100) hd.active = false;
        }
      }

      // ── Companion AI ──────────────────────────────────────
      for (const comp of gs.companions) {
        if (!comp.alive) continue;
        comp.frame++;
        if (comp.id === 'scooby') {
          const targetX = gs.playerX - 50;
          const dxComp = targetX - comp.x;
          comp.x += dxComp * 0.08;
          // Scared if enemy within 120px
          let scared = false;
          for (const en of gs.enemies) {
            if (en.alive && Math.abs(en.px - comp.x) < 120) { scared = true; break; }
          }
          comp.state = scared ? 'scared' : 'follow';
          if (scared) comp.x -= 0.5; // run away
        } else if (comp.id === 'walle') {
          let nearestEnemy: GameEnemy | null = null;
          let nearestDist = Infinity;
          for (const en of gs.enemies) {
            if (!en.alive) continue;
            const d = Math.abs(en.px - comp.x);
            if (d < nearestDist) { nearestDist = d; nearestEnemy = en; }
          }
          if (nearestEnemy && nearestDist < 300) {
            comp.x += (nearestEnemy.px > comp.x ? 1 : -1) * 0.8;
            comp.shootCooldown--;
            if (comp.shootCooldown <= 0) {
              gs.bullets.push({ x: comp.x, y: comp.y - 10, vx: nearestEnemy.px > comp.x ? 4 : -4, active: true });
              comp.shootCooldown = 60;
            }
          } else {
            comp.x += 0.5;
          }
        }
        // Keep companion on ground
        comp.velY = Math.min(comp.velY + GRAVITY, MAX_FALL);
        comp.y += comp.velY;
        if (comp.y >= groundY - 36) { comp.y = groundY - 36; comp.velY = 0; }
      }

      // ── Bullets ───────────────────────────────────────────
      for (const bullet of gs.bullets) {
        if (!bullet.active) continue;
        bullet.x += bullet.vx;
        if (bullet.x < 0 || bullet.x > LEVEL_W) { bullet.active = false; continue; }
        for (const en of gs.enemies) {
          if (!en.alive) continue;
          if (Math.abs(bullet.x - en.px) < 20 && Math.abs(bullet.y - en.py) < 40) {
            en.alive = false;
            en.squishTimer = 30;
            en.speechTimer = 120;
            en.speechText = `✓ ${en.method}`;
            gs.enemiesDefeated += 1;
            bullet.active = false;
            const ac2 = ensureAudio();
            playKill(ac2);
          }
        }
      }
      gs.bullets = gs.bullets.filter(b => b.active);

      // ── Water splash ──────────────────────────────────────
      const playerGroundY = CANVAS_H - 80;
      const playerFeetY = gs.playerY + PLAYER_H;
      const playerCenterX = gs.playerX + 10;
      // Detect landing on ground while over a water body
      if (gs.playerOnGround && !gs.prevPlayerOnGround) {
        for (const wb of WATER_BODIES) {
          if (playerCenterX >= wb.x && playerCenterX <= wb.x + wb.w) {
            gs.waterSplash = { active: true, x: playerCenterX, frame: 0 };
          }
        }
      }
      gs.prevPlayerOnGround = gs.playerOnGround;
      void playerFeetY; void playerGroundY;
      // Advance splash frame
      if (gs.waterSplash) {
        gs.waterSplash.frame += 1;
        if (gs.waterSplash.frame > 20) gs.waterSplash = null;
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
        gs.lastDialogue = line;
        gs.dialogueBubble = {
          text: line,
          x: gs.playerX + 10,
          y: gs.playerY,
          life: 180,
          maxLife: 180,
        };
        gs.nextDialogueIn = 600 + Math.floor(Math.random() * 300);
      }
      if (gs.dialogueBubble) {
        gs.dialogueBubble.life -= 1;
        // Track player position
        gs.dialogueBubble.x = gs.playerX + 10;
        gs.dialogueBubble.y = gs.playerY;
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

      // Power-ups
      for (const pu of gs.powerUps) {
        if (pu.collected) continue;
        const bob = Math.sin(gs.frameCount * 0.05 + pu.bobOffset) * 4;
        const puSx = pu.x - gs.cameraX;
        drawPowerUp(ctx, puSx, pu.y + bob, gs.frameCount);
      }

      // Companions (Scooby + Wall-E)
      for (const comp of gs.companions) {
        if (!comp.alive) continue;
        const csx = comp.x - gs.cameraX;
        const csy = comp.y;
        if (comp.id === 'scooby') {
          drawScooby(ctx, csx, csy, comp.frame, comp.state === 'scared');
        } else {
          const isShooting = comp.shootCooldown > 55;
          drawWallE(ctx, csx, csy, comp.frame, isShooting);
        }
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

      // Bullets
      for (const bullet of gs.bullets) {
        if (!bullet.active) continue;
        const bsx = bullet.x - gs.cameraX;
        ctx.fillStyle = '#FF5210';
        ctx.fillRect(bsx - 3, bullet.y - 2, 6, 4);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(bsx - 2, bullet.y - 1, 4, 2);
      }

      // Player
      drawPlayer(
        ctx,
        gs.playerX,
        gs.playerY,
        gs.frameCount,
        gs.playerVX,
        gs.playerVY,
        gs.playerOnGround,
        gs.playerFacing < 0,
        gs.playerFlashRed,
        gs.cameraX
      );

      // Bullet count HUD near player
      if (gs.playerBullets > 0) {
        const plrSx = gs.playerX - gs.cameraX;
        const plrSy = gs.playerY;
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`\uD83D\uDD2B ${gs.playerBullets}`, plrSx + 10, plrSy - 10);
        ctx.textAlign = 'left';
      }

      // Water splash
      if (gs.waterSplash) {
        const splashScreenX = gs.waterSplash.x - gs.cameraX;
        const splashScreenY = CANVAS_H - 80;
        drawWaterSplash(ctx, splashScreenX, splashScreenY, gs.waterSplash.frame);
      }

      // Helicopter drop (screen-space)
      if (gs.helicopterDrop && gs.helicopterDrop.active) {
        drawHelicopterDrop(ctx, gs.helicopterDrop, gs.frameCount);
      }

      // Dialogue bubble
      if (gs.dialogueBubble) {
        drawDialogueBubble(ctx, gs.dialogueBubble, gs.cameraX, lw);
      }

      // Pieces HUD (coin row at top of canvas — drawn last so it's on top)
      drawPiecesHUD(ctx, gs.collectibles, lw);

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

  const WHITE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 1 L2 15 L5 12 L7.5 17.5 L9.5 16.5 L7 11 L11 11 Z' fill='white' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E") 2 1, auto`;

  return (
    <div className="design-rescue-root" style={{ position: "fixed", inset: 0, zIndex: 100, cursor: WHITE_CURSOR }}>
      {/* Force white cursor on every child element across all game phases */}
      <style>{`
        .design-rescue-root, .design-rescue-root * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 1 L2 15 L5 12 L7.5 17.5 L9.5 16.5 L7 11 L11 11 Z' fill='white' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E") 2 1, auto !important;
        }
        .design-rescue-root button, .design-rescue-root a {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 1 L2 15 L5 12 L7.5 17.5 L9.5 16.5 L7 11 L11 11 Z' fill='white' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E") 2 1, pointer !important;
        }
      `}</style>
      <AnimatePresence mode="wait">
        {phase === "messenger" && (
          <motion.div key="messenger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MessengerPhase onStart={handleStart} onExit={onExit} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "playing" && (
        <>
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%", cursor: WHITE_CURSOR }}
          />
          <HUD
            collectedIds={collectedIds}
            lives={lives}
            collectibles={hudCollectibles}
          />
          {/* Top-right controls: pause + exit */}
          <div style={{ position: "fixed", top: 12, right: 16, zIndex: 250, display: "flex", gap: 8 }}>
            <button
              onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); }}
              style={{
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 6,
                color: "#fff",
                fontFamily: "monospace",
                fontSize: 11,
                padding: "3px 10px",
                cursor: WHITE_CURSOR,
              }}
            >
              {paused ? "▶ resume" : "⏸ pause"}
            </button>
            <button
              onClick={onExit}
              style={{
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 6,
                color: "#aaa",
                fontFamily: "monospace",
                fontSize: 11,
                padding: "3px 10px",
                cursor: WHITE_CURSOR,
              }}
            >
              ✕ exit
            </button>
          </div>

          {/* Pause menu overlay */}
          {paused && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 300,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(3px)",
            }}>
              <div style={{
                background: "#1a1a2e",
                border: "2px solid #FF5210",
                borderRadius: 12,
                padding: "36px 48px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
                fontFamily: "monospace",
                boxShadow: "0 0 40px rgba(255,82,16,0.25)",
              }}>
                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#FF5210", textTransform: "uppercase" }}>
                  — paused —
                </div>
                {[
                  { label: "▶  Resume", sub: "P / Esc", action: () => { pausedRef.current = false; setPaused(false); } },
                  { label: "↺  Restart", sub: "from beginning", action: handleRestart },
                  { label: "✕  Exit", sub: "back to portfolio", action: onExit },
                ].map(({ label, sub, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{
                      width: 220,
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8,
                      color: "#fff",
                      fontFamily: "monospace",
                      fontSize: 14,
                      padding: "12px 0",
                      cursor: WHITE_CURSOR,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,82,16,0.15)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF5210"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
                  >
                    <span>{label}</span>
                    <span style={{ fontSize: 10, color: "#666" }}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
