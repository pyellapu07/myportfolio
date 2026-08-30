"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import {
  JEEVY_OS,
  JEEVY_OS_ROOT,
  SUBSYSTEM_SECTIONS,
  adjacentEngines,
  engineHref,
  getEngine,
} from "@/lib/jeevy-os";

/**
 * Shared shell for the six Jeevy OS subsystem deep-dive pages.
 *
 * Holds the sticky breadcrumb, the 28px title, the placeholder section
 * scaffold, and the adjacent-engine navigation rail, so each route file
 * stays a one-line declaration of which engine it renders.
 *
 * Typography follows the platform's two-size rule: 28px for the page
 * title only, 14px muted grey for everything else.
 */
export default function SubsystemShell({ slug }: { slug: string }) {
  const engine = getEngine(slug);
  if (!engine) return null;

  const { prev, next } = adjacentEngines(slug);
  const orderLabel = String(engine.order).padStart(2, "0");

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-text selection:bg-primary/20">
      <CustomCursor />
      {/* light #FAFAFA canvas, so dark header text */}
      <Header initialDark />

      {/* ══ STICKY BREADCRUMB ══ */}
      <nav
        aria-label="Breadcrumb"
        className="sticky top-16 z-40 border-b border-border bg-white/85 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-[1080px] items-center gap-2 px-8 py-3 md:px-16 lg:px-24">
          <Link
            href={JEEVY_OS_ROOT}
            className="group inline-flex items-center gap-1.5 font-mono text-[14px] leading-none text-text-secondary transition-colors duration-300 hover:text-text"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden
            />
            Jeevy OS
          </Link>
          <span className="font-mono text-[14px] leading-none text-text-muted" aria-hidden>
            /
          </span>
          <span className="font-mono text-[14px] leading-none text-text-muted">
            {engine.short}
          </span>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative z-10 px-8 pb-16 pt-20 md:px-16 md:pt-28 lg:px-24">
        <div className="mx-auto max-w-[1080px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono text-[14px] uppercase leading-relaxed tracking-widest text-text-muted">
              Engine {orderLabel} · {JEEVY_OS.title}
            </p>
            <h1 className="mt-4 max-w-[900px] font-display text-[28px] leading-tight tracking-tight text-text">
              {engine.title}
            </h1>
            <p className="mt-4 max-w-[720px] text-[14px] leading-relaxed text-text-secondary">
              {engine.subLabel}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ PLACEHOLDER SECTIONS ══ */}
      <div className="relative z-10 px-8 pb-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1080px]">
          {SUBSYSTEM_SECTIONS.map((section) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="border-t border-border py-12"
            >
              <p className="font-mono text-[14px] uppercase leading-relaxed tracking-widest text-text-muted">
                {section.number}
              </p>
              <h2 className="mt-3 font-display text-[28px] leading-tight tracking-tight text-text">
                {section.title}
              </h2>
              <p className="mt-4 max-w-[720px] text-[14px] leading-relaxed text-text-secondary">
                {section.placeholder}
              </p>
              <p className="mt-6 font-mono text-[14px] leading-relaxed text-text-muted">
                {/* TODO: replace with real content */}
                Content pending.
              </p>
            </motion.section>
          ))}
        </div>
      </div>

      {/* ══ ADJACENT ENGINE NAV RAIL ══ */}
      <nav
        aria-label="Adjacent engines"
        className="relative z-10 border-t border-border bg-white px-8 py-12 md:px-16 lg:px-24"
      >
        <div className="mx-auto grid max-w-[1080px] gap-8 md:grid-cols-2">
          {prev && (
            <Link href={engineHref(prev.slug)} className="group block">
              <span className="font-mono text-[14px] uppercase leading-relaxed tracking-widest text-text-muted">
                ← Previous engine
              </span>
              <span className="mt-2 block text-[14px] font-semibold leading-relaxed text-text-secondary transition-colors duration-300 group-hover:text-text">
                {prev.title}
              </span>
            </Link>
          )}
          {next && (
            <Link href={engineHref(next.slug)} className="group block md:text-right">
              <span className="font-mono text-[14px] uppercase leading-relaxed tracking-widest text-text-muted">
                Next engine →
              </span>
              <span className="mt-2 block text-[14px] font-semibold leading-relaxed text-text-secondary transition-colors duration-300 group-hover:text-text">
                {next.title}
              </span>
            </Link>
          )}
        </div>

        <div className="mx-auto mt-10 max-w-[1080px] border-t border-border pt-8">
          <Link
            href={JEEVY_OS_ROOT}
            className="group inline-flex items-center gap-2 border-b border-accent/40 pb-1 font-mono text-[14px] leading-relaxed text-accent transition-colors duration-300 hover:border-accent"
          >
            Back to the full platform case study
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </nav>

      <Footer />
    </div>
  );
}
