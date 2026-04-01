"use client";

/*
  Self-contained Microsoft MLSA badge — logo + trophy + confetti.
  Mirrors the desktop HeroParticles sticker but as a reusable component.
  `displaySize` sets the logo width in px; everything else scales proportionally.
*/

const BASE_W = 165;      // authored width (matches HeroParticles DISPLAY_W)
const BASE_H = 140;      // authored canvas height (logo ~80px + trophy ~60px above)

const PIECES = [
  { a: "cfms1", c: "#FF5210", d: "0s",    tx: -38, ty: -62, rot:  280, w: 7, h: 4, round: false },
  { a: "cfms2", c: "#FFB800", d: "0.5s",  tx:  34, ty: -68, rot: -260, w: 5, h: 5, round: true  },
  { a: "cfms3", c: "#8E60F0", d: "1.0s",  tx: -16, ty: -74, rot:  190, w: 7, h: 3, round: false },
  { a: "cfms4", c: "#22C55E", d: "1.5s",  tx:  18, ty: -70, rot: -190, w: 5, h: 5, round: true  },
  { a: "cfms5", c: "#FF5210", d: "0.75s", tx: -54, ty: -28, rot:  330, w: 6, h: 3, round: false },
  { a: "cfms6", c: "#FFB800", d: "1.25s", tx:  52, ty: -32, rot: -330, w: 6, h: 4, round: false },
  { a: "cfms7", c: "#8E60F0", d: "0.25s", tx:  -6, ty: -80, rot:  400, w: 4, h: 6, round: false },
];

export default function MicrosoftBadgeSticker({ displaySize = 80 }: { displaySize?: number }) {
  const scale = displaySize / BASE_W;

  return (
    <>
      {/* Scaled confetti keyframes — unique names avoid collision with HeroParticles */}
      <style>{PIECES.map(p => `
        @keyframes ${p.a} {
          0%   { transform:translate(0,0) rotate(0deg); opacity:1 }
          100% { transform:translate(${Math.round(p.tx * scale)}px,${Math.round(p.ty * scale)}px) rotate(${p.rot}deg); opacity:0 }
        }
      `).join("")}</style>

      {/* Outer wrapper — sized to the scaled visual dimensions */}
      <div style={{ width: displaySize, height: Math.round(BASE_H * scale), position: "relative", overflow: "visible" }}>

        {/* Inner container — authored at BASE_W, scaled via CSS transform */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: BASE_W,
          overflow: "visible",
          transform: `scale(${scale})`,
          transformOrigin: "bottom left",
          pointerEvents: "none",
          userSelect: "none",
        }}>

          {/* Trophy + confetti — sits above the logo */}
          <div style={{
            position: "absolute",
            bottom: 48,
            right: -10,
            width: 60,
            height: 68,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {PIECES.map((p, idx) => (
              <div key={idx} style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: p.w, height: p.h,
                marginTop: -(p.h / 2), marginLeft: -(p.w / 2),
                borderRadius: p.round ? "50%" : "2px",
                backgroundColor: p.c,
                animation: `${p.a} 2.4s ease-out ${p.d} infinite`,
              }} />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Trophy.png"
              alt=""
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 5 }}
            />
          </div>

          {/* Microsoft logo */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/microsoft-logo.png"
              alt="Microsoft MLSA 1st Place"
              draggable={false}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

        </div>
      </div>
    </>
  );
}
