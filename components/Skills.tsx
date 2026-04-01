"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { PenTool, Search, Code } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

/* ── Skill categories (3 — no Tools card) ────────────────────────────── */
const CATEGORIES = [
  {
    title: "Design",
    Icon: PenTool,
    skills: [
      "Human-Centric Design",
      "Interaction Design",
      "Visual Design",
      "Prototyping",
      "Information Architecture",
      "Design Systems",
      "Accessibility (WCAG 2.2)",
    ],
  },
  {
    title: "Research",
    Icon: Search,
    skills: [
      "Journey Mapping",
      "Card Sorting",
      "In-Depth Interviews",
      "Ethnographic Research",
      "Competitive Analysis",
      "Heuristic Evaluation",
      "A/B Testing",
    ],
  },
  {
    title: "Technical",
    Icon: Code,
    skills: [
      "HTML / CSS",
      "JavaScript",
      "Python",
      "SQL",
      "Git / GitHub",
      "QGIS",
      "Data Visualization",
    ],
  },
];

/* ── Toolbox logos ────────────────────────────────────────────────────── */
const TOOLS = [
  { name: "FIGMA",             src: "/logos tools/free-figma-logo-icon-svg-download-png-8630394.webp" },
  { name: "ADOBE XD",         src: "/logos tools/Adobe_XD_CC_icon.svg.png"                           },
  { name: "PHOTOSHOP",        src: "/logos tools/Adobe_Photoshop_CC_icon.svg.png"                    },
  { name: "ILLUSTRATOR",      src: "/logos tools/Adobe_Illustrator_CC_icon.svg.png"                  },
  { name: "AFTER EFFECTS",    src: "/logos tools/Adobe_After_Effects_CC_icon.svg.png"                },
  { name: "FRAMER",           src: "/logos tools/framer.avif"                                         },
  { name: "WEBFLOW",          src: "/logos tools/6699096cdd45ad7b198bbc43_partner-webflow.png"        },
  { name: "MIRO",             src: "/logos tools/Miro.png"                                            },
  { name: "HOTJAR",           src: "/logos tools/Hotjar.png"                                          },
  { name: "GOOGLE ANALYTICS", src: "/logos tools/Google analytics.png"                               },
  { name: "QGIS",             src: "/logos tools/qgis.png"                                            },
  { name: "GOOGLE COLAB",     src: "/logos tools/Colab.png"                                           },
  { name: "REACT",            src: "/logos tools/react.png"                                           },
  { name: "DOCKER",           src: "/logos tools/docker.png"                                          },
  { name: "CLAUDE AI",        src: "/logos tools/Claude-ai-icon.svg.png"                             },
];

/* ── Toolbox row with cursor-following tooltip ────────────────────────── */
function Toolbox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);

  function onContainerMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!tooltip || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null
    );
  }

  function onLogoEnter(name: string, e: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({ name, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border bg-white p-6"
    >
      {/* Header row */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
          {/* Grid icon inline SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-bold text-text tracking-wide uppercase">
          Toolbox
        </h3>
      </div>

      {/* Logos grid — cursor-tracked tooltip */}
      <div
        ref={containerRef}
        className="relative"
        onMouseMove={onContainerMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7">
          {TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="cursor-pointer transition-all duration-200 hover:scale-110"
              onMouseEnter={(e) => onLogoEnter(tool.name, e)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tool.src}
                alt={tool.name}
                draggable={false}
                className="h-9 w-9 object-contain md:h-10 md:w-10"
              />
            </div>
          ))}
        </div>

        {/* Sharp cursor-following tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-50 select-none"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 28,
              background: "#111",
              color: "#fff",
              padding: "4px 9px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              fontFamily: "monospace",
              borderRadius: 0,
              whiteSpace: "nowrap",
            }}
          >
            {tooltip.name}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function Skills() {
  return (
    <SectionWrapper id="skills" alternate>
      {/* Section header */}
      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs font-medium uppercase tracking-widest text-primary"
        >
          Expertise
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 font-display text-3xl font-bold text-text md:text-4xl"
        >
          Skills &amp; Expertise
        </motion.h2>
      </div>

      {/* Row 1 — 3 skill cards */}
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-border bg-white p-6 transition-all duration-300 hover:border-primary/20"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <cat.Icon size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-text">{cat.title}</h3>
            </div>
            <ul className="space-y-2.5">
              {cat.skills.map((skill) => (
                <li key={skill} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-primary/30" />
                  {skill}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Row 2 — full-width Toolbox */}
      <div className="mt-5">
        <Toolbox />
      </div>
    </SectionWrapper>
  );
}
