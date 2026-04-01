"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { MapPin } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { SITE } from "@/lib/constants";
import { Fira_Sans_Condensed } from "next/font/google";

const fira = Fira_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ── Data ─────────────────────────────────────────────────────────────── */
const RECEIPT_ITEMS = [
  { service: "Product Design",    projects: "MarketCrunch AI, HackImpact, PrepSharp, Xylem"  },
  { service: "UX Research",       projects: "Transurban, NASA Harvest, Faculty Dashboard"     },
  { service: "Design Systems",    projects: "MarketCrunch AI, Xylem Institute, Esports"       },
  { service: "Usability Testing", projects: "Transurban, MarketCrunch AI"                     },
  { service: "Info. Architecture",projects: "HackImpact, Faculty Dashboard"                  },
  { service: "Brand Identity",    projects: "Xylem Institute, Terps Esports"                  },
];

const SOCIALS = [
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "GitHub",   href: SITE.github   },
  { label: "Medium",   href: SITE.medium   },
];

const NOT_YET_LINKS = [
  { label: "Play the UX Rescue Game",     href: "#hero-section", external: false },
  { label: "Browse the Work",             href: "#work",         external: false },
  { label: "Read the Article on Medium",  href: SITE.medium,     external: true  },
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

function Dash({ heavy = false }: { heavy?: boolean }) {
  return (
    <div style={{
      borderTop: heavy ? "1.5px solid #111" : "1px dashed #d1d5db",
      margin: heavy ? "14px 0" : "10px 0",
    }} />
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280" }}>
      <span>{label}</span>
      <span style={{ color: valueColor ?? "#111", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────────── */
export default function Contact() {
  const sceneRef      = useRef<HTMLDivElement>(null);
  const isInView      = useInView(sceneRef, { once: true, amount: 0.15 });
  const receiptCtrl   = useAnimation();
  const printerCtrl   = useAnimation();

  /* Trigger printer vibration + receipt feed when section enters viewport */
  useEffect(() => {
    if (!isInView) return;

    /* Fast mechanical buzz — no await, runs concurrently */
    printerCtrl.start({
      x: [0, -2, 2, -2, 2, -2, 2, -1.5, 1.5, -1, 1, 0],
      transition: { duration: 0.05, repeat: Infinity, repeatType: "loop" as const },
    });

    /* Receipt feeds out, then stop buzz */
    receiptCtrl
      .start({
        clipPath: "inset(0% 0% 0% 0%)",
        transition: { duration: 2.6, ease: [0.33, 1, 0.68, 1] },
      })
      .then(() => {
        printerCtrl.start({ x: 0, transition: { duration: 0.1 } });
      });
  }, [isInView, printerCtrl, receiptCtrl]);

  const now     = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <SectionWrapper id="contact" alternate>

      {/* ── Section label + heading ────────────────────────────────────── */}
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
      <div
        ref={sceneRef}
        style={{ maxWidth: 460, margin: "2.5rem auto 0", position: "relative" }}
      >
        {/* Chai latte sticker — floats to the right on desktop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Mytreat starbucks.png"
          alt="My Treat! Starbucks sticker"
          draggable={false}
          className="pointer-events-none absolute hidden md:block"
          style={{
            width: 130,
            right: -148,
            top: "44%",
            transform: "translateY(-50%) rotate(12deg)",
            zIndex: 50,
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.18))",
          }}
        />

        {/* ── Printer top — z:30, covers receipt's entry into slot ── */}
        <motion.div
          animate={printerCtrl}
          style={{ position: "relative", zIndex: 30, lineHeight: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/printer top part.png"
            alt="Receipt printer"
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />
        </motion.div>

        {/* ── Receipt paper — feeds out of slot with clipPath reveal ── */}
        <motion.div
          animate={receiptCtrl}
          initial={{ clipPath: "inset(0% 0% 50% 0%)" }}
          className={fira.className}
          style={{
            position: "relative",
            zIndex: 20,
            marginTop: -10, /* tuck top edge behind printer slot */
          }}
        >
          <div
            style={{
              background: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              padding: "28px 28px 20px",
            }}
          >

            {/* ── Store header ───────────────────────────────────────── */}
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.07em", color: "#111", textTransform: "uppercase" }}>
                Pradeep Yellapu
              </div>
              <div style={{ fontSize: 11, letterSpacing: "0.13em", color: "#9ca3af", marginTop: 3, textTransform: "uppercase" }}>
                Product Design Studio
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, letterSpacing: "0.04em" }}>
                {dateStr} &bull; {timeStr}
              </div>
            </div>

            {/* ── Receipt of Acknowledgement box ─────────────────────── */}
            <div
              style={{
                border: "1.5px dashed #9ca3af",
                borderRadius: 6,
                padding: "10px 14px 14px",
                marginBottom: 14,
              }}
            >
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, borderTop: "1px dashed #d1d5db" }} />
                <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }}>
                  Receipt of Acknowledgement
                </span>
                <div style={{ flex: 1, borderTop: "1px dashed #d1d5db" }} />
              </div>

              <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
                Issued to: Fellow Human &amp; Design Enthusiast
              </div>

              <p style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6, fontStyle: "italic", marginBottom: 10 }}>
                Here&apos;s a receipt of acknowledgement for visiting this space and everything you picked up along the way:
              </p>

              {/* Acknowledged items */}
              {[
                "Visited Pradeep\u2019s Design Space",
                "Explored UX Processes & Methods",
                "Discovered Real-World Projects",
              ].map((item) => (
                <div key={item}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 5 }}
                >
                  <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 13 }}>✓</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{item}</span>
                </div>
              ))}

              <div style={{ borderTop: "1px dashed #e5e7eb", margin: "10px 0 8px" }} />

              <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 7 }}>
                If not yet — start here:
              </div>
              {NOT_YET_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 11, color: "#6366F1", textDecoration: "none",
                    fontWeight: 600, marginBottom: 4,
                  }}
                >
                  <span style={{ color: "#9ca3af", fontSize: 10 }}>→</span>
                  {link.label}
                </a>
              ))}
            </div>

            {/* ── Email token ────────────────────────────────────────── */}
            <div
              style={{
                border: "1.5px dashed #d1d5db",
                borderRadius: 6,
                padding: "8px 14px 10px",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{ flex: 1, borderTop: "1px dashed #e5e7eb" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#9ca3af", textTransform: "uppercase", fontWeight: 600 }}>
                  Contact
                </span>
                <div style={{ flex: 1, borderTop: "1px dashed #e5e7eb" }} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#111", textAlign: "center" }}>
                {SITE.email}
              </div>
            </div>

            {/* ── Meta rows ──────────────────────────────────────────── */}
            <Row label="Designer Type" value="Mixed Methods" />
            <Dash />
            <Row label="Status" value="Open to Opportunities" valueColor="#22C55E" />
            <div style={{ marginTop: 6 }}>
              <Row label="Location" value="Open to Relocation" />
            </div>
            <Dash />

            {/* ── Services table ─────────────────────────────────────── */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#9ca3af", marginBottom: 10,
            }}>
              <span>Service</span>
              <span>Projects</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECEIPT_ITEMS.map((item, i) => (
                <div key={item.service}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {item.service}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280", textAlign: "right", lineHeight: 1.45, maxWidth: 160 }}>
                      {item.projects}
                    </span>
                  </div>
                  {i < RECEIPT_ITEMS.length - 1 && (
                    <div style={{ borderTop: "1px dashed #f3f4f6", marginTop: 8 }} />
                  )}
                </div>
              ))}
            </div>
            <Dash />

            {/* ── Summary ────────────────────────────────────────────── */}
            <Row label="Total Experience" value="3+ Years" />
            <div style={{ marginTop: 6 }}>
              <Row label="Satisfaction" value="Measurable ✓" />
            </div>
            <Dash heavy />

            {/* ── Amount due ─────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#111" }}>
                Amount Due
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FF5210", textAlign: "right", lineHeight: 1.3 }}>
                One Good<br />Conversation
              </span>
            </div>

            {/* ── CTA ────────────────────────────────────────────────── */}
            <a
              href={`mailto:${SITE.email}`}
              style={{
                display: "block", width: "100%", background: "#111", color: "white",
                textAlign: "center", padding: "13px 0", borderRadius: 4,
                fontSize: 14, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", textDecoration: "none",
              }}
            >
              Let&apos;s Talk &rarr;
            </a>
            <Dash />

            {/* ── Thank you ──────────────────────────────────────────── */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8, fontWeight: 500 }}>
                Thank you so much for showing up today.
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8, fontWeight: 500 }}>
                You have yourself a good rest of your day!
              </p>
            </div>
            <Dash />

            {/* ── Chai latte line ────────────────────────────────────── */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#92400e", fontWeight: 700, letterSpacing: "0.02em" }}>
                ☕ Chai Latte at Starbucks, on me.
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, letterSpacing: "0.04em" }}>
                My token of appreciation for your time.
              </p>
            </div>
            <Dash />

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 10 }}>
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, color: "#6b7280", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 4, fontSize: 10, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                <MapPin size={10} />
                {SITE.location}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: "#d1d5db", letterSpacing: "0.1em" }}>
                ✦&nbsp;&nbsp;THANK YOU&nbsp;&nbsp;✦
              </div>
            </div>

          </div>

          {/* Zigzag bottom tear */}
          <ZigzagEdge />
        </motion.div>

        {/* ── Printer bottom — z:10, sits behind receipt ─────────────── */}
        <motion.div
          animate={printerCtrl}
          style={{ position: "relative", zIndex: 10, lineHeight: 0, marginTop: -6 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/printer bottom part.png"
            alt=""
            draggable={false}
            style={{ width: "100%", display: "block" }}
          />
        </motion.div>
      </div>

    </SectionWrapper>
  );
}
