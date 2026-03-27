"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Maze ────────────────────────────────────────────────────────────────────
const MAZE_COLS = 19;
const MAZE_ROWS = 22;
const CELL = 28;
const CANVAS_W = MAZE_COLS * CELL; // 532
const CANVAS_H = MAZE_ROWS * CELL; // 616

// 0=dot 1=wall 2=empty 3=powerPellet 4=ghostDoor
const MAZE_TEMPLATE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,2,2,2,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,2,4,2,1,2,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// ─── Types ───────────────────────────────────────────────────────────────────
type Dir = { dr: number; dc: number };
type Phase = "intro" | "playing" | "dead" | "levelup" | "gameover" | "win";

interface Entity {
  row: number;
  col: number;
  progress: number; // 0→1
  dr: number;
  dc: number;
  qdr: number;
  qdc: number;
}

interface Ghost extends Entity {
  id: number;
  name: string;
  color: string;
  state: "normal" | "scared" | "dead";
  scaredTimer: number;
  homeRow: number;
  homeCol: number;
  flashTimer: number;
}

interface GameState {
  maze: number[][];
  pac: Entity;
  ghosts: Ghost[];
  score: number;
  lives: number;
  phase: Phase;
  empathyMode: boolean;
  empathyTimer: number;
  empathyCombo: number;
  ghostNameEaten: string | null;
  ghostNameTimer: number;
  deathTimer: number;
  levelUpTimer: number;
  totalDots: number;
  dotsLeft: number;
  lastTime: number;
  animFrame: number;
  mouthAngle: number;
  mouthDir: number; // 1 open, -1 close
  pelletPulse: number;
}

const GHOST_DEFS = [
  { name: "Scope Creep",    color: "#FF4444", homeRow: 10, homeCol: 8  },
  { name: "Vague Feedback", color: "#FFB8FF", homeRow: 10, homeCol: 9  },
  { name: "Dev Handoff",    color: "#00FFFF", homeRow: 10, homeCol: 10 },
  { name: "The Stakeholder",color: "#FFB852", homeRow: 10, homeCol: 11 },
];

const PAC_SPEED  = 5.5;
const GHOST_SPEED_NORMAL = 4.5;
const GHOST_SPEED_SCARED = 2.5;
const GHOST_SPEED_DEAD   = 8.0;
const SCARED_DURATION    = 8.0;
const SCARED_FLASH_AT    = 3.0;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeMaze(): number[][] {
  return MAZE_TEMPLATE.map(row => [...row]);
}

function countDots(maze: number[][]): number {
  let n = 0;
  for (const row of maze) for (const c of row) if (c === 0 || c === 3) n++;
  return n;
}

function canMove(maze: number[][], row: number, col: number, isGhost: boolean): boolean {
  if (row < 0 || row >= MAZE_ROWS) return false;
  // tunnel rows
  const wrappedCol = ((col % MAZE_COLS) + MAZE_COLS) % MAZE_COLS;
  const cell = maze[row]?.[wrappedCol];
  if (cell === undefined) return false;
  if (cell === 1) return false;
  if (cell === 4) return isGhost;
  return true;
}

function wrap(col: number): number {
  return ((col % MAZE_COLS) + MAZE_COLS) % MAZE_COLS;
}

function isTunnelRow(row: number): boolean {
  return row === 8 || row === 10;
}

function manhattan(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

function initGhosts(): Ghost[] {
  return GHOST_DEFS.map((def, i) => ({
    id: i,
    name: def.name,
    color: def.color,
    row: def.homeRow,
    col: def.homeCol,
    progress: 0,
    dr: 0,
    dc: 1,
    qdr: 0,
    qdc: 0,
    state: "normal" as const,
    scaredTimer: 0,
    homeRow: def.homeRow,
    homeCol: def.homeCol,
    flashTimer: 0,
  }));
}

function initPac(): Entity {
  return { row: 16, col: 9, progress: 0, dr: 0, dc: -1, qdr: 0, qdc: 0 };
}

function makeGameState(): GameState {
  const maze = makeMaze();
  const totalDots = countDots(maze);
  return {
    maze,
    pac: initPac(),
    ghosts: initGhosts(),
    score: 0,
    lives: 3,
    phase: "intro",
    empathyMode: false,
    empathyTimer: 0,
    empathyCombo: 0,
    ghostNameEaten: null,
    ghostNameTimer: 0,
    deathTimer: 0,
    levelUpTimer: 0,
    totalDots,
    dotsLeft: totalDots,
    lastTime: 0,
    animFrame: 0,
    mouthAngle: 0.25,
    mouthDir: 1,
    pelletPulse: 0,
  };
}

// ─── Ghost AI helpers ─────────────────────────────────────────────────────────
const DIRS: Dir[] = [
  { dr: -1, dc: 0 },
  { dr: 1,  dc: 0 },
  { dr: 0,  dc: -1 },
  { dr: 0,  dc: 1 },
];

function chooseGhostDir(
  ghost: Ghost,
  maze: number[][],
  pac: Entity,
  scared: boolean,
  dead: boolean
): Dir {
  const opposite = { dr: -ghost.dr, dc: -ghost.dc };
  const valid = DIRS.filter(d => {
    if (d.dr === opposite.dr && d.dc === opposite.dc) return false;
    const nr = ghost.row + d.dr;
    const nc = wrap(ghost.col + d.dc);
    return canMove(maze, nr, nc, true);
  });
  if (valid.length === 0) return { dr: ghost.dr, dc: ghost.dc };

  if (dead) {
    // Move toward home cell
    valid.sort((a, b) =>
      manhattan(ghost.row + a.dr, wrap(ghost.col + a.dc), ghost.homeRow, ghost.homeCol) -
      manhattan(ghost.row + b.dr, wrap(ghost.col + b.dc), ghost.homeRow, ghost.homeCol)
    );
    return valid[0];
  }

  if (scared) {
    return valid[Math.floor(Math.random() * valid.length)];
  }

  // Blinky (id=0): always chase pac-man
  if (ghost.id === 0) {
    valid.sort((a, b) =>
      manhattan(ghost.row + a.dr, wrap(ghost.col + a.dc), pac.row, pac.col) -
      manhattan(ghost.row + b.dr, wrap(ghost.col + b.dc), pac.row, pac.col)
    );
    return valid[0];
  }

  // Others: 40% chase pac-man, 60% random
  if (Math.random() < 0.4) {
    valid.sort((a, b) =>
      manhattan(ghost.row + a.dr, wrap(ghost.col + a.dc), pac.row, pac.col) -
      manhattan(ghost.row + b.dr, wrap(ghost.col + b.dc), pac.row, pac.col)
    );
    return valid[0];
  }
  return valid[Math.floor(Math.random() * valid.length)];
}

// ─── Drawing ─────────────────────────────────────────────────────────────────
function drawGame(ctx: CanvasRenderingContext2D, gs: GameState, time: number): void {
  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw maze cells
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      const cell = gs.maze[r][c];
      const x = c * CELL;
      const y = r * CELL;

      if (cell === 1) {
        // Wall: filled dark blue with blueprint border
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(x, y, CELL, CELL);
        ctx.strokeStyle = "#2a2a5a";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
      } else if (cell === 0) {
        // Dot: 3x3 white square centered
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + CELL / 2 - 1.5, y + CELL / 2 - 1.5, 3, 3);
      } else if (cell === 3) {
        // Power pellet: pulsing orange circle
        const pulse = 0.8 + 0.2 * Math.sin(gs.pelletPulse);
        const r7 = 7 * pulse;
        ctx.fillStyle = "#FF5210";
        ctx.beginPath();
        ctx.arc(x + CELL / 2, y + CELL / 2, r7, 0, Math.PI * 2);
        ctx.fill();
      }
      // 2 = empty, 4 = ghost door (just draw slightly visible line)
      if (cell === 4) {
        ctx.fillStyle = "#888888";
        ctx.fillRect(x + 4, y + CELL / 2 - 1, CELL - 8, 2);
      }
    }
  }

  // Draw ghosts
  for (const ghost of gs.ghosts) {
    drawGhost(ctx, ghost, gs.empathyMode, gs.empathyTimer, time);
  }

  // Draw pac-man
  drawPac(ctx, gs.pac, gs.mouthAngle);
}

function drawPac(ctx: CanvasRenderingContext2D, pac: Entity, mouthAngle: number): void {
  // Interpolate position
  const drawCol = pac.col + pac.dc * pac.progress;
  const drawRow = pac.row + pac.dr * pac.progress;
  const px = drawCol * CELL + CELL / 2;
  const py = drawRow * CELL + CELL / 2;

  // Rotation based on direction
  let angle = 0;
  if (pac.dc === 1)  angle = 0;
  if (pac.dc === -1) angle = Math.PI;
  if (pac.dr === -1) angle = -Math.PI / 2;
  if (pac.dr === 1)  angle = Math.PI / 2;

  const mouth = mouthAngle * Math.PI;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle);
  ctx.fillStyle = "#FF5210";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 12, mouth, Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  ghost: Ghost,
  empathyMode: boolean,
  empathyTimer: number,
  _time: number
): void {
  const drawCol = ghost.col + ghost.dc * ghost.progress;
  const drawRow = ghost.row + ghost.dr * ghost.progress;
  const px = drawCol * CELL + CELL / 2;
  const py = drawRow * CELL + CELL / 2;
  const r = 12;

  if (ghost.state === "dead") {
    // Just draw eyes
    drawGhostEyes(ctx, px, py, ghost.dr, ghost.dc, false);
    return;
  }

  const scared = ghost.state === "scared";
  // Flash when about to revert
  const flash = scared && empathyTimer < SCARED_FLASH_AT && Math.floor(empathyTimer * 4) % 2 === 0;
  const bodyColor = scared ? (flash ? "#5555FF" : "#2222AA") : ghost.color;

  ctx.save();
  ctx.translate(px, py);

  // Ghost body: semicircle top + wavy bottom
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -r / 2, r, Math.PI, 0); // top semicircle
  // Wavy bottom
  const bottom = r / 2 + 2;
  ctx.lineTo(r, bottom);
  const waveW = r / 2;
  for (let i = 0; i < 3; i++) {
    const x1 = r - waveW * (i * 2 + 1);
    const x2 = r - waveW * (i * 2 + 2);
    ctx.quadraticCurveTo(x1 - waveW / 2, bottom + r / 2, x1 - waveW, bottom);
    if (i < 2) ctx.quadraticCurveTo(x2 - waveW / 2, bottom - r / 4, x2, bottom);
  }
  ctx.lineTo(-r, bottom);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.restore();
  drawGhostEyes(ctx, px, py, ghost.dr, ghost.dc, scared);
}

function drawGhostEyes(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  dr: number,
  dc: number,
  scared: boolean
): void {
  const eyeY = py - 4;
  const leftEyeX = px - 4;
  const rightEyeX = px + 4;

  // Pupil offset based on direction
  const pupilDx = dc * 2;
  const pupilDy = dr * 2;

  if (scared) {
    // Simple white dots
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(leftEyeX, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEyeX, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
  } else {
    // White sclera
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(leftEyeX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEyeX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
    // Blue pupil
    ctx.fillStyle = "#3333ff";
    ctx.beginPath(); ctx.arc(leftEyeX + pupilDx, eyeY + pupilDy, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEyeX + pupilDx, eyeY + pupilDy, 2, 0, Math.PI * 2); ctx.fill();
  }
}

// ─── Intro animation ──────────────────────────────────────────────────────────
function drawIntro(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Animated pac-man eating dots across middle
  const y = CANVAS_H / 2 + 40;
  const pacX = (time * 80) % (CANVAS_W + 60) - 30;

  // Dots
  for (let i = 0; i < 8; i++) {
    const dx = 60 + i * 60;
    if (dx > pacX + 20) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(dx - 1.5, y - 1.5, 3, 3);
    }
  }

  // Pac
  const mouth = 0.2 + 0.2 * Math.sin(time * 8);
  ctx.fillStyle = "#FF5210";
  ctx.beginPath();
  ctx.moveTo(pacX, y);
  ctx.arc(pacX, y, 14, mouth * Math.PI, (2 - mouth) * Math.PI);
  ctx.closePath();
  ctx.fill();

  // Title
  ctx.fillStyle = "#FF5210";
  ctx.font = "bold 36px monospace";
  ctx.textAlign = "center";
  ctx.fillText("PAC-DESIGNER", CANVAS_W / 2, CANVAS_H / 2 - 80);

  // Ghost list
  const names = GHOST_DEFS.map(g => `${g.name}`);
  ctx.font = "13px monospace";
  ctx.fillStyle = "#888888";
  ctx.fillText("AVOID:", CANVAS_W / 2, CANVAS_H / 2 - 40);
  GHOST_DEFS.forEach((g, i) => {
    ctx.fillStyle = g.color;
    ctx.fillText(g.name, CANVAS_W / 2, CANVAS_H / 2 - 20 + i * 18);
  });

  // Press any key
  const alpha = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.font = "14px monospace";
  ctx.fillText("PRESS ANY KEY TO START", CANVAS_W / 2, CANVAS_H / 2 + 110);

  void names;
}

function drawDead(ctx: CanvasRenderingContext2D, pac: Entity, progress: number): void {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const px = pac.col * CELL + CELL / 2;
  const py = pac.row * CELL + CELL / 2;

  // Death animation: mouth opens to full circle then pac shrinks
  const deathMouth = progress * Math.PI;
  const scale = 1 - progress * 0.8;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#FF5210";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 12, deathMouth, Math.PI * 2 - deathMouth);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PacDesignerGame({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState>(makeGameState());
  const rafRef = useRef<number>(0);

  // React UI state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState<Phase>("intro");
  const [empathyMode, setEmpathyMode] = useState(false);
  const [ghostName, setGhostName] = useState<string | null>(null);

  const syncUI = useCallback(() => {
    const gs = gsRef.current;
    setScore(gs.score);
    setLives(gs.lives);
    setPhase(gs.phase);
    setEmpathyMode(gs.empathyMode);
    setGhostName(gs.ghostNameEaten);
  }, []);

  const resetGame = useCallback(() => {
    gsRef.current = makeGameState();
    gsRef.current.phase = "playing";
    syncUI();
  }, [syncUI]);

  // ─── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    function loop(timestamp: number): void {
      if (!running) return;
      const gs = gsRef.current;

      const raw = timestamp / 1000;
      const dt = gs.lastTime === 0 ? 0 : Math.min(raw - gs.lastTime, 0.05);
      gs.lastTime = raw;

      // ── Intro ──────────────────────────────────────────────────────────────
      if (gs.phase === "intro") {
        drawIntro(ctx!, raw);
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // ── Playing ────────────────────────────────────────────────────────────
      if (gs.phase === "playing") {
        // Update mouth animation
        gs.mouthAngle += gs.mouthDir * 3.5 * dt;
        if (gs.mouthAngle > 0.45) { gs.mouthAngle = 0.45; gs.mouthDir = -1; }
        if (gs.mouthAngle < 0.05) { gs.mouthAngle = 0.05; gs.mouthDir = 1; }

        // Power pellet pulse
        gs.pelletPulse += dt * 3;

        // Empathy mode timer
        if (gs.empathyMode) {
          gs.empathyTimer -= dt;
          if (gs.empathyTimer <= 0) {
            gs.empathyMode = false;
            gs.empathyCombo = 0;
            gs.ghosts.forEach(g => { if (g.state === "scared") g.state = "normal"; });
          }
        }

        // Ghost name eaten timer
        if (gs.ghostNameTimer > 0) {
          gs.ghostNameTimer -= dt;
          if (gs.ghostNameTimer <= 0) gs.ghostNameEaten = null;
        }

        // ── Move Pac-Man ────────────────────────────────────────────────────
        const pac = gs.pac;
        pac.progress += PAC_SPEED * dt;

        if (pac.progress >= 1) {
          pac.progress -= 1;
          // Arrive at next cell
          let nr = pac.row + pac.dr;
          let nc = pac.col + pac.dc;

          // Tunnel wrapping
          if (isTunnelRow(pac.row)) {
            nc = wrap(nc);
          }

          // Only move if valid
          if (canMove(gs.maze, nr, nc, false)) {
            pac.row = nr;
            pac.col = nc;
          } else {
            pac.progress = 0;
          }

          // Eat dot / power pellet
          const cell = gs.maze[pac.row]?.[pac.col];
          if (cell === 0) {
            gs.maze[pac.row][pac.col] = 2;
            gs.score += 10;
            gs.dotsLeft--;
          } else if (cell === 3) {
            gs.maze[pac.row][pac.col] = 2;
            gs.score += 50;
            gs.dotsLeft--;
            gs.empathyMode = true;
            gs.empathyTimer = SCARED_DURATION;
            gs.empathyCombo = 0;
            gs.ghosts.forEach(g => {
              if (g.state !== "dead") {
                g.state = "scared";
                g.scaredTimer = SCARED_DURATION;
              }
            });
          }

          // Try queued direction
          if (pac.qdr !== 0 || pac.qdc !== 0) {
            const qnr = pac.row + pac.qdr;
            const qnc = wrap(pac.col + pac.qdc);
            if (canMove(gs.maze, qnr, qnc, false)) {
              pac.dr = pac.qdr;
              pac.dc = pac.qdc;
              pac.qdr = 0;
              pac.qdc = 0;
            }
          }

          // Check win
          if (gs.dotsLeft === 0) {
            gs.phase = "win";
            syncUI();
          }
        }

        // ── Move Ghosts ────────────────────────────────────────────────────
        for (const ghost of gs.ghosts) {
          const speed =
            ghost.state === "dead"   ? GHOST_SPEED_DEAD :
            ghost.state === "scared" ? GHOST_SPEED_SCARED :
            GHOST_SPEED_NORMAL;

          ghost.progress += speed * dt;

          if (ghost.progress >= 1) {
            ghost.progress -= 1;

            const nr = ghost.row + ghost.dr;
            const nc = wrap(ghost.col + ghost.dc);

            if (canMove(gs.maze, nr, nc, true)) {
              ghost.row = nr;
              ghost.col = nc;
            }

            // Check if dead ghost returned home
            if (ghost.state === "dead" &&
                ghost.row === ghost.homeRow &&
                ghost.col === ghost.homeCol) {
              ghost.state = "normal";
            }

            // Choose new direction at each cell
            const newDir = chooseGhostDir(ghost, gs.maze, pac, ghost.state === "scared", ghost.state === "dead");
            ghost.dr = newDir.dr;
            ghost.dc = newDir.dc;
          }
        }

        // ── Collision detection ────────────────────────────────────────────
        for (const ghost of gs.ghosts) {
          // Rough distance check (interpolated)
          const gDrawCol = ghost.col + ghost.dc * ghost.progress;
          const gDrawRow = ghost.row + ghost.dr * ghost.progress;
          const pDrawCol = pac.col + pac.dc * pac.progress;
          const pDrawRow = pac.row + pac.dr * pac.progress;

          const dist = Math.abs(gDrawRow - pDrawRow) + Math.abs(gDrawCol - pDrawCol);
          if (dist > 1.2) continue;

          if (ghost.state === "scared") {
            // Eat ghost
            ghost.state = "dead";
            gs.empathyCombo++;
            const pts = 200 * Math.pow(2, gs.empathyCombo - 1);
            gs.score += pts;
            gs.ghostNameEaten = `${ghost.name} eliminated`;
            gs.ghostNameTimer = 2.0;
          } else if (ghost.state === "normal") {
            // Pac dies
            gs.lives--;
            gs.phase = "dead";
            gs.deathTimer = 0;
            if (gs.lives <= 0) {
              // will transition to gameover after death anim
            }
            break;
          }
        }

        // Draw
        drawGame(ctx!, gs, raw);
        syncUI();
      }

      // ── Dead animation ──────────────────────────────────────────────────
      else if (gs.phase === "dead") {
        gs.deathTimer += dt;
        const progress = Math.min(gs.deathTimer / 1.5, 1);

        ctx!.fillStyle = "#0a0a0a";
        ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);
        // Draw maze without pac
        const savedPhase = gs.phase;
        gs.phase = "playing";
        drawGame(ctx!, gs, raw);
        gs.phase = savedPhase;
        drawDead(ctx!, gs.pac, progress);

        if (gs.deathTimer >= 1.8) {
          if (gs.lives <= 0) {
            gs.phase = "gameover";
          } else {
            // Reset pac and ghosts
            gs.pac = initPac();
            gs.ghosts = initGhosts();
            gs.empathyMode = false;
            gs.empathyTimer = 0;
            gs.phase = "playing";
          }
        }
        syncUI();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [syncUI]);

  // ─── Input handling ───────────────────────────────────────────────────────
  useEffect(() => {
    const gs = () => gsRef.current;

    function handleKey(e: KeyboardEvent): void {
      const g = gs();

      if (e.key === "Escape") {
        onExit();
        return;
      }

      if (e.key === "r" || e.key === "R") {
        if (g.phase === "gameover" || g.phase === "win") {
          resetGame();
          return;
        }
      }

      if (g.phase === "intro") {
        g.phase = "playing";
        return;
      }

      if (g.phase !== "playing") return;

      const dirMap: Record<string, { dr: number; dc: number }> = {
        ArrowUp:    { dr: -1, dc: 0 },
        ArrowDown:  { dr: 1,  dc: 0 },
        ArrowLeft:  { dr: 0,  dc: -1 },
        ArrowRight: { dr: 0,  dc: 1 },
        w: { dr: -1, dc: 0 },
        s: { dr: 1,  dc: 0 },
        a: { dr: 0,  dc: -1 },
        d: { dr: 0,  dc: 1 },
        W: { dr: -1, dc: 0 },
        S: { dr: 1,  dc: 0 },
        A: { dr: 0,  dc: -1 },
        D: { dr: 0,  dc: 1 },
      };

      const dir = dirMap[e.key];
      if (dir) {
        e.preventDefault();
        g.pac.qdr = dir.dr;
        g.pac.qdc = dir.dc;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onExit, resetGame]);

  // ─── Touch / swipe ────────────────────────────────────────────────────────
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    function handleTouchStart(e: TouchEvent): void {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent): void {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const g = gsRef.current;

      if (g.phase === "intro") {
        g.phase = "playing";
        return;
      }
      if (g.phase !== "playing") return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20)       { g.pac.qdr = 0; g.pac.qdc = 1; }
        else if (dx < -20) { g.pac.qdr = 0; g.pac.qdc = -1; }
      } else {
        if (dy > 20)       { g.pac.qdr = 1; g.pac.qdc = 0; }
        else if (dy < -20) { g.pac.qdr = -1; g.pac.qdc = 0; }
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // ─── Overlay screens (drawn via Canvas for gameover/win) ──────────────────
  useEffect(() => {
    if (phase !== "gameover" && phase !== "win") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgba(10,10,10,0.88)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.textAlign = "center";
    if (phase === "gameover") {
      ctx.fillStyle = "#FF4444";
      ctx.font = "bold 40px monospace";
      ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 40);
    } else {
      ctx.fillStyle = "#FF5210";
      ctx.font = "bold 36px monospace";
      ctx.fillText("DESIGN SHIPPED!", CANVAS_W / 2, CANVAS_H / 2 - 40);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px monospace";
    ctx.fillText(`INSIGHTS: ${score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);

    ctx.fillStyle = "#888888";
    ctx.font = "14px monospace";
    ctx.fillText("Press R to restart", CANVAS_W / 2, CANVAS_H / 2 + 50);
  }, [phase, score]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          width: CANVAS_W,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 0",
          marginBottom: 4,
        }}
      >
        {/* Score */}
        <span style={{ color: "#FF5210", fontFamily: "monospace", fontSize: 14, fontWeight: "bold" }}>
          INSIGHTS: {score}
        </span>
        {/* Title */}
        <span style={{ color: "#ffffff", fontFamily: "monospace", fontSize: 14, fontWeight: "bold", letterSpacing: 2 }}>
          PAC-DESIGNER
        </span>
        {/* Lives + X */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: lives }).map((_, i) => (
            <svg key={i} width={16} height={16} viewBox="0 0 16 16">
              <path d="M8 14 L2 5 Q2 2 5 2 Q7 2 8 4 Q9 2 11 2 Q14 2 14 5 Z" fill="#FF5210" />
            </svg>
          ))}
          <button
            onClick={onExit}
            style={{
              background: "none",
              border: "1px solid #555",
              color: "#888",
              cursor: "pointer",
              padding: "2px 8px",
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 12,
              marginLeft: 8,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Empathy Mode banner */}
      {empathyMode && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,82,16,0.15)",
            border: "1px solid #FF5210",
            borderRadius: 8,
            padding: "6px 20px",
            color: "#FF5210",
            fontFamily: "monospace",
            fontSize: 16,
            fontWeight: "bold",
            letterSpacing: 2,
            zIndex: 10001,
          }}
        >
          ⚡ EMPATHY MODE
        </div>
      )}

      {/* Ghost eaten name */}
      {ghostName && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#00FFFF",
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: "bold",
            zIndex: 10001,
            textShadow: "0 0 8px #00FFFF",
          }}
        >
          {ghostName}
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ display: "block", border: "1px solid #2a2a5a" }}
      />

      {/* Hint bar */}
      <div style={{ color: "#444", fontFamily: "monospace", fontSize: 11, marginTop: 6 }}>
        WASD / Arrows to move · ESC to exit · R to restart
      </div>
    </div>
  );
}
