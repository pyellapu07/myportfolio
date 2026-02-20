"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { PROJECTS } from "@/lib/constants";

export default function Projects() {
  const featured = PROJECTS.filter((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);

  return (
    <SectionWrapper id="work">
      <div className="mb-16">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs uppercase tracking-widest text-text-muted"
        >
          Selected Work
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 font-display text-4xl font-extrabold tracking-tight text-text md:text-5xl"
        >
          Case Studies
        </motion.h2>
      </div>

      {/* Featured project — full width, big */}
      {featured.map((project) => {
        const isInternal = (project.link || "#").startsWith("/");
        const CardWrapper = isInternal
          ? ({ children }: { children: React.ReactNode }) => (
              <Link href={project.link!} className="block">
                {children}
              </Link>
            )
          : ({ children }: { children: React.ReactNode }) => (
              <a href={project.link || "#"} className="block">
                {children}
              </a>
            );

        return (
          <motion.article
            key={project.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="group mb-16 overflow-hidden rounded-xl border border-border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-smooth-hover cursor-pointer"
          >
            <CardWrapper>
              {/* GIF preview — gray bg, GIF centered with smooth shadow */}
              <div className="relative flex items-center justify-center overflow-hidden bg-[#EBEBEB] px-10 py-8 aspect-[16/9]">
                <div
                  className="relative w-full max-w-[88%] overflow-hidden rounded-xl"
                  style={{
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.10), 0 24px 56px rgba(0,0,0,0.12), 0 48px 80px rgba(0,0,0,0.06)",
                  }}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={1200}
                    height={675}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    priority
                    unoptimized={project.image.endsWith(".gif")}
                  />
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-extrabold text-text md:text-3xl">{project.title}</h3>
                    <p className="mt-1 font-mono text-xs text-text-muted">{project.subtitle}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border border-border p-2.5 text-text-muted transition-all duration-300 group-hover:border-text group-hover:text-text"
                    aria-hidden
                  >
                    <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-[30deg]" />
                  </span>
                </div>
                <p className="mt-4 font-mono text-sm font-medium text-accent">{project.impact}</p>
                <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-text-secondary">{project.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.techStack.map((t) => (
                    <span key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-secondary">{t}</span>
                  ))}
                </div>
              </div>
            </CardWrapper>
          </motion.article>
        );
      })}

      {/* Rest — 2 per row */}
      <div className="grid gap-6 md:grid-cols-2">
        {rest.map((project, i) => {
          const href = project.link || "#";
          const isInternal = href.startsWith("/");
          const CardWrapper = isInternal
            ? ({ children }: { children: React.ReactNode }) => (
                <Link href={href} className="block h-full">
                  {children}
                </Link>
              )
            : ({ children }: { children: React.ReactNode }) => (
                <a href={href} className="block h-full">
                  {children}
                </a>
              );

          return (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="group overflow-hidden rounded-xl border border-border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-smooth-hover cursor-pointer"
            >
              <CardWrapper>
                {/* GIF/image preview — gray bg with smooth shadow */}
                <div className="relative flex items-center justify-center overflow-hidden bg-[#EBEBEB] px-6 py-6 aspect-[16/10]">
                  <div
                    className="relative w-full max-w-[90%] overflow-hidden rounded-lg"
                    style={{
                      boxShadow:
                        "0 2px 6px rgba(0,0,0,0.07), 0 6px 18px rgba(0,0,0,0.09), 0 18px 40px rgba(0,0,0,0.10), 0 36px 60px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={640}
                      height={400}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      unoptimized={project.image.endsWith(".gif")}
                    />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-text">{project.title}</h3>
                      <p className="mt-1 font-mono text-[11px] text-text-muted">{project.subtitle}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full border border-border p-2.5 text-text-muted transition-all duration-300 group-hover:border-text group-hover:text-text"
                      aria-hidden
                    >
                      <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-[30deg]" />
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-xs font-medium text-accent">{project.impact}</p>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.techStack.map((t) => (
                      <span key={t} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-text-muted">{t}</span>
                    ))}
                  </div>
                </div>
              </CardWrapper>
            </motion.article>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
