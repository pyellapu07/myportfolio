"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { MapPin } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { SITE } from "@/lib/constants";
import { Fira_Sans_Condensed } from "next/font/google";

const fira = Fira_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ── Widths ───────────────────────────────────────────────────────────── */
// Printer is 50% wider than receipt (25% extra on each side)
const PRINTER_W = 480;   // px
const RECEIPT_PCT = 66;  // receipt = 66% of printer width

/* ── Data ─────────────────────────────────────────────────────────────── */
const RECEIPT_ITEMS = [
  { service: "Product Design",     projects: "MarketCrunch AI, HackImpact, PrepSharp, Xylem" },
  { service: "UX Research",        projects: "Transurban, NASA Harvest, Faculty Dashboard"    },
  { service: "Design Systems",     projects: "MarketCrunch AI, Xylem Institute, Esports"      },
  { service: "Usability Testing",  projects: "Transurban, MarketCrunch AI"                    },
  { service: "Info. Architecture", projects: "HackImpact, Faculty Dashboard"                  },
  { service: "Brand Identity",     projects: "Xylem Institute, Terps Esports"                 },
];

const SOCIALS = [
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "GitHub",   href: SITE.github   },
  { label: "Medium",   href: SITE.medium   },
];

const NOT_YET = [
  { label: "Play the UX Rescue Game",    href: "#hero-section", ext: false },
  { label: "Browse the Work",            href: "#work",         ext: false },
  { label: "Read the Article on Medium", href: SITE.medium,     ext: true  },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */
function ZigzagEdge() {
  const W = 400, H = 16, step = 20;
  let d = `M0,0 `;
  for (let x = 0; x <= W; x += step) d += `L${x + step / 2},${H} L${x + step},0 `;
  d += `L${W},0 Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: H }} aria-hidden>
      <path d={d} fill="white" />
    </svg>
  );
}

const R: React.CSSProperties = { /* receipt base text */
  fontFamily: "inherit",
  fontSize: 11,
  color: "#111",
  letterSpacing: "0.03em",
};

function Divider({ thick }: { thick?: boolean }) {
  return (
    <div style={{
      borderTop: thick ? "1.5px solid #111" : "1px dashed #555",
      margin: thick ? "12px 0" : "9px 0",
    }} />
  );
}

/* ── Component ────────────────────────────────────────────────────────── */
export default function Contact() {
  const printerTopImgRef = useRef<HTMLImageElement>(null);
  const [printerTopH, setPrinterTopH]   = useState(0);
  const hasAnimated                      = useRef(false);
  const receiptCtrl                      = useAnimation();
  const printerCtrl                      = useAnimation();

  /* Measure printer-top height once the image loads */
  const onTopLoaded = useCallback(() => {
    setPrinterTopH(printerTopImgRef.current?.offsetHeight ?? 0);
  }, []);

  /* Triggered once when the scene enters the viewport */
  const startPrint = useCallback(async () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    /* Printer buzz — runs until receipt is done */
    printerCtrl.start({
      x: [0, -2, 2, -2, 2, -2, 2, -1.5, 1.5, -1, 1, 0],
      transition: { duration: 0.05, repeat: Infinity, repeatType: "loop" as const },
    });

    /* Receipt feeds out */
    await receiptCtrl.start({
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration: 2.8, ease: [0.33, 1, 0.68, 1] },
    });

    /* Buzz off */
    printerCtrl.start({ x: 0, transition: { duration: 0.12 } });
  }, [printerCtrl, receiptCtrl]);

  /* Date / time for receipt header */
  const now     = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "2-digit", year: "numeric",
  }).toUpperCase();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <SectionWrapper id="contact" alternate>

      {/* Section label + heading */}
      <div className="mx-auto max-w-2xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
        >
          Contact
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="mt-4 font-display text-3xl font-bold text-text md:text-4xl"
        >
          Here&apos;s your Receipt
        </motion.h2>
      </div>

      {/* ── Printer + Receipt scene ────────────────────────────────────── */}
      <motion.div
        onViewportEnter={startPrint}
        viewport={{ once: true, amount: 0.15 }}
        style={{
          maxWidth: PRINTER_W,
          margin: "2.5rem auto 0",
          position: "relative",
        }}
      >
        {/* MY TREAT sticker — overlaps top-right of printer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Mytreat starbucks.png"
          alt="My treat!"
          draggable={false}
          className="pointer-events-none hidden md:block"
          style={{
            position: "absolute",
            right: -80,
            top: 10,
            width: 126,
            transform: "rotate(12deg)",
            zIndex: 10,
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.20))",
          }}
        />

        {/* ── PRINTER TOP — z:3, sits on top of everything ── */}
        <motion.div
          animate={printerCtrl}
          style={{ position: "relative", zIndex: 3, lineHeight: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={printerTopImgRef}
            src="/printer top part.png"
            alt="Receipt printer"
            draggable={false}
            onLoad={onTopLoaded}
            style={{ width: "100%", display: "block" }}
          />
        </motion.div>

        {/* ── RECEIPT — z:2, centered in printer, feeds out from slot ── */}
        <motion.div
          animate={receiptCtrl}
          initial={{ clipPath: "inset(0% 0% 50% 0%)" }}
          className={fira.className}
          style={{
            position: "relative",
            zIndex: 2,
            width: `${RECEIPT_PCT}%`,
            margin: "0 auto",
            marginTop: -10,          /* tuck top edge into printer slot */
            boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ background: "white", padding: "24px 22px 18px" }}>

            {/* Store header */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.1em", color: "#111", textTransform: "uppercase" }}>
                Pradeep Yellapu
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#555", marginTop: 2, textTransform: "uppercase" }}>
                Product Design Studio
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 5, letterSpacing: "0.05em" }}>
                {dateStr} - {timeStr}
              </div>
            </div>

            <Divider />

            {/* Receipt of Acknowledgement */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#111", textAlign: "center", marginBottom: 6 }}>
                Receipt of Acknowledgement
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", textAlign: "center", marginBottom: 10 }}>
                Issued to: Fellow Human
              </div>

              <div style={{ ...R, fontStyle: "normal", marginBottom: 10, fontSize: 10, color: "#333" }}>
                You showed up. You looked around. Here is proof.
              </div>

              {/* Checked items */}
              {[
                "Visited Pradeep's Design Space",
                "Explored UX Processes and Methods",
                "Discovered Real-World Projects",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 7, marginBottom: 4, fontSize: 11, color: "#111", fontWeight: 600 }}>
                  <span>[OK]</span>
                  <span>{item}</span>
                </div>
              ))}

              <div style={{ borderTop: "1px dashed #999", margin: "8px 0" }} />

              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 5 }}>
                Pending — visit when ready:
              </div>
              {NOT_YET.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.ext ? "_blank" : undefined}
                  rel={link.ext ? "noopener noreferrer" : undefined}
                  style={{ display: "block", fontSize: 11, color: "#111", textDecoration: "underline", marginBottom: 3, fontWeight: 500 }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <Divider />

            {/* Contact */}
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>
                Contact
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#111" }}>
                {SITE.email}
              </div>
            </div>

            <Divider />

            {/* Meta */}
            {[
              { k: "Designer Type",  v: "Mixed Methods"         },
              { k: "Status",         v: "Open to Opportunities" },
              { k: "Location",       v: "Open to Relocation"    },
            ].map(({ k, v }, i) => (
              <div key={k}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#111" }}>
                  <span style={{ color: "#555" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
                {i < 2 && <Divider />}
              </div>
            ))}

            <Divider />

            {/* Services table */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>
              <span>Service</span>
              <span>Projects</span>
            </div>

            {RECEIPT_ITEMS.map((item, i) => (
              <div key={item.service}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {item.service}
                  </span>
                  <span style={{ fontSize: 10, color: "#555", textAlign: "right", lineHeight: 1.5 }}>
                    {item.projects}
                  </span>
                </div>
                {i < RECEIPT_ITEMS.length - 1 && <Divider />}
              </div>
            ))}

            <Divider />

            {/* Summary */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#111", marginBottom: 6 }}>
              <span style={{ color: "#555" }}>Total Experience</span>
              <span style={{ fontWeight: 600 }}>3+ Years</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#111" }}>
              <span style={{ color: "#555" }}>Satisfaction</span>
              <span style={{ fontWeight: 600 }}>Measurable</span>
            </div>

            <Divider thick />

            {/* Amount due */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#111" }}>
                Amount Due
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111", textAlign: "right", lineHeight: 1.35 }}>
                One Good<br />Conversation
              </span>
            </div>

            {/* CTA */}
            <a
              href={`mailto:${SITE.email}`}
              style={{
                display: "block", width: "100%", background: "#111", color: "white",
                textAlign: "center", padding: "12px 0", fontSize: 13,
                fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                textDecoration: "none", borderRadius: 2,
              }}
            >
              LET&apos;S TALK
            </a>

            <Divider />

            {/* Thank you */}
            <div style={{ textAlign: "center", ...R, lineHeight: 1.8, color: "#333" }}>
              <div>Seriously, thank you for making it this far.</div>
              <div>Most people just glance. You actually read.</div>
              <div style={{ marginTop: 4 }}>That means a lot.</div>
            </div>

            <Divider />

            {/* Chai latte */}
            <div style={{ textAlign: "center", ...R, fontWeight: 700, color: "#111" }}>
              Next time we are in the same city,
            </div>
            <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "0.04em" }}>
              chai latte is on me.
            </div>

            <Divider />

            {/* Footer */}
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 8 }}>
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10, color: "#111", textDecoration: "underline", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {s.label}
                  </a>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 10, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <MapPin size={10} />
                {SITE.location}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "#aaa", letterSpacing: "0.12em" }}>
                * * * THANK YOU * * *
              </div>
            </div>
          </div>

          {/* Zigzag paper tear at bottom */}
          <ZigzagEdge />
        </motion.div>

        {/* ── PRINTER BOTTOM — z:1, behind the receipt, at slot position ── */}
        {printerTopH > 0 && (
          <motion.div
            animate={printerCtrl}
            style={{
              position: "absolute",
              top: printerTopH - 8,     /* slight overlap with slot */
              left: 0,
              right: 0,
              zIndex: 1,
              lineHeight: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/printer bottom part.png"
              alt=""
              draggable={false}
              style={{ width: "100%", display: "block" }}
            />
          </motion.div>
        )}
      </motion.div>

    </SectionWrapper>
  );
}
