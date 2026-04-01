"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { SITE } from "@/lib/constants";
import { Fira_Sans_Condensed } from "next/font/google";

const fira = Fira_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ── Receipt line items ───────────────────────────────────────────────── */
const RECEIPT_ITEMS = [
  {
    service: "Product Design",
    projects: "MarketCrunch AI, HackImpact, PrepSharp, Xylem",
  },
  {
    service: "UX Research",
    projects: "Transurban, NASA Harvest, Faculty Dashboard",
  },
  {
    service: "Design Systems",
    projects: "MarketCrunch AI, Xylem Institute, Esports",
  },
  {
    service: "Usability Testing",
    projects: "Transurban, MarketCrunch AI",
  },
  {
    service: "Info. Architecture",
    projects: "HackImpact, Faculty Dashboard",
  },
  {
    service: "Brand Identity",
    projects: "Xylem Institute, Terps Esports",
  },
];

const SOCIALS = [
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "GitHub",   href: SITE.github   },
  { label: "Medium",   href: SITE.medium   },
];

/* ── Zigzag SVG bottom edge ───────────────────────────────────────────── */
function ZigzagEdge() {
  // 20px teeth, viewBox 400×16, fill white so teeth bite into the section bg
  const teeth: string[] = [];
  const W = 400;
  const H = 16;
  const step = 20;
  let d = `M0,0 `;
  for (let x = 0; x <= W; x += step) {
    d += `L${x + step / 2},${H} L${x + step},0 `;
  }
  d += `L${W},0 Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: H }}
      aria-hidden
    >
      <path d={d} fill="white" />
    </svg>
  );
}

/* ── Dashed rule ──────────────────────────────────────────────────────── */
function Dash({ heavy = false }: { heavy?: boolean }) {
  return (
    <div
      style={{
        borderTop: heavy ? "1.5px solid #111" : "1px dashed #d1d5db",
        margin: heavy ? "14px 0" : "10px 0",
      }}
    />
  );
}

/* ── Component ────────────────────────────────────────────────────────── */
export default function Contact() {
  const now = new Date();
  const dateStr = now
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <SectionWrapper id="contact" alternate>
      <div className="mx-auto max-w-xl text-center">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
        >
          Contact
        </motion.span>

        {/* Section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-display text-3xl font-bold text-text md:text-4xl"
        >
          Here&apos;s your Bill
        </motion.h2>

        {/* ── Receipt card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={fira.className}
          style={{ maxWidth: 390, margin: "2.5rem auto 0", position: "relative" }}
        >
          {/* Card shadow wrapper */}
          <div
            style={{
              background: "white",
              boxShadow:
                "0 6px 28px rgba(0,0,0,0.10), 0 1px 6px rgba(0,0,0,0.06)",
              padding: "28px 28px 20px",
            }}
          >
            {/* ── Header ───────────────────────────────────────────── */}
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  color: "#111",
                  textTransform: "uppercase",
                }}
              >
                Pradeep Yellapu
              </div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.13em",
                  color: "#9ca3af",
                  marginTop: 3,
                  textTransform: "uppercase",
                }}
              >
                Product Design Studio
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  marginTop: 6,
                  letterSpacing: "0.04em",
                }}
              >
                {dateStr} &bull; {timeStr}
              </div>
            </div>

            {/* ── Email token box ───────────────────────────────────── */}
            <div
              style={{
                border: "1.5px dashed #9ca3af",
                borderRadius: 6,
                padding: "8px 14px 10px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    borderTop: "1px dashed #d1d5db",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Contact
                </span>
                <div
                  style={{
                    flex: 1,
                    borderTop: "1px dashed #d1d5db",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "#111",
                  textAlign: "center",
                }}
              >
                {SITE.email}
              </div>
            </div>

            {/* ── Meta row ──────────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#6b7280",
                letterSpacing: "0.04em",
              }}
            >
              <span>Designer Type</span>
              <span style={{ color: "#111", fontWeight: 600 }}>Mixed Methods</span>
            </div>

            <Dash />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#6b7280",
                letterSpacing: "0.04em",
              }}
            >
              <span>Status</span>
              <span style={{ color: "#22C55E", fontWeight: 600 }}>Open to Opportunities</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#6b7280",
                marginTop: 6,
                letterSpacing: "0.04em",
              }}
            >
              <span>Location</span>
              <span style={{ color: "#111", fontWeight: 600 }}>Open to Relocation</span>
            </div>

            <Dash />

            {/* ── Services column headers ───────────────────────────── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#9ca3af",
                marginBottom: 10,
              }}
            >
              <span>Service</span>
              <span>Projects</span>
            </div>

            {/* ── Line items ────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECEIPT_ITEMS.map((item, i) => (
                <div key={item.service}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111",
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {item.service}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        textAlign: "right",
                        lineHeight: 1.45,
                        maxWidth: 160,
                      }}
                    >
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

            {/* ── Summary rows ─────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#6b7280",
                letterSpacing: "0.04em",
              }}
            >
              <span>Total Experience</span>
              <span style={{ color: "#111", fontWeight: 600 }}>3+ Years</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#6b7280",
                letterSpacing: "0.04em",
                marginTop: 6,
              }}
            >
              <span>Satisfaction</span>
              <span style={{ color: "#111", fontWeight: 600 }}>Measurable ✓</span>
            </div>

            <Dash heavy />

            {/* ── Amount due ────────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#111",
                }}
              >
                Amount Due
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#FF5210",
                  textAlign: "right",
                  letterSpacing: "0.03em",
                  lineHeight: 1.3,
                }}
              >
                One Good<br />Conversation
              </span>
            </div>

            {/* ── Let's Talk CTA ────────────────────────────────────── */}
            <a
              href={`mailto:${SITE.email}`}
              style={{
                display: "block",
                width: "100%",
                background: "#111",
                color: "white",
                textAlign: "center",
                padding: "13px 0",
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Let&apos;s Talk &rarr;
            </a>

            <Dash />

            {/* ── Footer social + location ──────────────────────────── */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  marginBottom: 10,
                }}
              >
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      textDecoration: "none",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontSize: 10,
                  color: "#9ca3af",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                <MapPin size={10} />
                {SITE.location}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: "#d1d5db",
                  letterSpacing: "0.1em",
                }}
              >
                ✦&nbsp;&nbsp;THANK YOU&nbsp;&nbsp;✦
              </div>
            </div>
          </div>

          {/* ── Zigzag bottom edge ──────────────────────────────────── */}
          <ZigzagEdge />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
