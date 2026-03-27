"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Film,
  Palette,
  Mail,
  Users,
  Zap,
  Clapperboard,
  Lightbulb,
  MonitorPlay,
  BookOpen,
  Trophy,
  CalendarDays,
} from "lucide-react";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

/* ── accent colours: UMD ── */
const RED  = "#E21833";
const GOLD = "#FFD200";

/* ─────────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────────── */
function Fade({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function MediaPop({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.34, 1.2, 0.64, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ number, title, light = false }: { number: string; title: string; light?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mb-12 md:mb-16"
    >
      <span className="mb-3 block font-mono text-[11px]" style={{ color: RED }}>{number}</span>
      <h2 className={cn("font-manrope text-3xl font-medium tracking-tight md:text-5xl", light ? "text-white" : "text-text")}>{title}</h2>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      <div className="font-mono text-sm font-medium leading-tight text-text">{value}</div>
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-secondary">
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION NAV — scroll-aware
───────────────────────────────────────────────────────────── */
const SECTION_NAV = [
  { id: "te-entry",      label: "The Entry" },
  { id: "te-gameday",    label: "Game Day" },
  { id: "te-brand",      label: "Brand" },
  { id: "te-coed",       label: "Co-Ed Film" },
  { id: "te-campaign",   label: "Giving Day" },
  { id: "te-gallery",    label: "Gallery" },
  { id: "te-team",       label: "The Team" },
  { id: "te-newsletters",label: "Newsletters" },
  { id: "te-reflection", label: "Reflection" },
];

function VerticalNav() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTION_NAV.forEach((section, i) => {
      const el = document.getElementById(section.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIdx(i); },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div className="fixed top-1/2 z-50 hidden -translate-y-1/2 xl:flex flex-col gap-3" style={{ right: "40px" }}>
      {SECTION_NAV.map((section, i) => {
        const isActive = i === activeIdx;
        return (
          <button
            key={i}
            onClick={() => {
              setActiveIdx(i);
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group relative flex items-center justify-end"
            aria-label={`Go to ${section.label}`}
          >
            <span className={cn(
              "absolute right-6 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100",
              isActive ? "opacity-100 font-medium" : "text-text-muted"
            )}
            style={isActive ? { color: RED } : {}}>
              {section.label}
            </span>
            <span className={cn(
              "block w-1.5 rounded-full transition-all duration-300",
              isActive ? "h-6 shadow-sm" : "h-1.5 bg-border/50 group-hover:h-3 group-hover:bg-border"
            )}
            style={isActive ? { background: RED } : {}} />
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function TerpsEsportsPage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-text selection:bg-red-100" style={{ cursor: "auto" }}>
      <CustomCursor />
      <Header initialDark={true} />
      <VerticalNav />

      {/* ══════════════════════════════════════════════
          HERO — full-bleed, no overlapping text
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden">
        {/* Full viewport image — no padding, starts from top edge */}
        <div className="relative h-[70vh] min-h-[480px] w-full">
          <Image
            src="/Esports/TeamPicturewiththecrew.jpg"
            alt="Terps Esports crew"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Subtle vignette only — no text blocking the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
          {/* Breadcrumb overlaid top-left — minimal */}
          <div className="absolute top-20 left-0 right-0 px-6 md:px-12">
            <Link href="/#work" className="group inline-flex items-center gap-2 font-mono text-xs text-white/70 transition-colors hover:text-white">
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
              Back to Work
            </Link>
          </div>
          {/* Category tag bottom-left */}
          <div className="absolute bottom-6 left-6 md:left-12">
            <span className="rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm" style={{ color: GOLD }}>
              Creative Direction · Visual Branding
            </span>
          </div>
        </div>

        {/* Title block — below the image, dark background */}
        <div className="bg-[#0a0a0a] px-6 py-12 md:px-12 md:py-16" style={{ cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='4' fill='white' /%3E%3C/svg%3E\") 12 12, auto" }}>
          <div className="mx-auto max-w-[1280px]">
            <h1 className="font-manrope text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
              Terps Esports
              <br />
              <span style={{ color: GOLD }}>Where Design Meets the Arena.</span>
            </h1>
            <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-white/60 md:text-base">
              Graphic designer, video director, and content strategist for the University of Maryland's competitive esports program. From game day graphics to a green-screen Valorant intro film built from scratch.
            </p>
          </div>
        </div>

        {/* Meta strip */}
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid gap-8 border-b border-border/40 py-10 md:grid-cols-4">
            <DetailRow label="Role" value="Graphic Designer · Video Director · Content Strategist" />
            <DetailRow label="Organisation" value="Terps Esports, University of Maryland" />
            <DetailRow label="Timeline" value="Nov 2024 – Present" />
            <DetailRow label="Status" value={
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Active
              </span>
            } />
          </div>
          <div className="grid gap-8 border-b border-border/40 py-8 md:grid-cols-3">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Responsibilities</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Brand identity, game day graphics, video direction and editing, script writing, green screen production, MailChimp newsletters, social media content, photo direction
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Collaborators</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Coach Sergio Brack, Creative Director Erica Javapor, Videographer Seth, Player AnPhu, Co-Ed Valorant team, 9-game rosters
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Tools and Stack</p>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                Adobe Premiere Pro, After Effects, Photoshop, Illustrator, MailChimp, Green Screen / Chroma Key, Lighting rigs, DSLR camera
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          01 — THE ENTRY
      ══════════════════════════════════════════════ */}
      <section id="te-entry" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="01" title="The Cold Email That Started It All." />

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Fade>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                In November 2024, I reached out cold to <strong className="text-text">Coach Sergio Brack</strong> — no introduction, no connection, just a direct message expressing my interest in supporting the program's visual identity. Sergio was kind enough to sit down for an interview, and I walked in with a clear vision of what I could bring.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                I got in. Starting from scratch, learning the rosters, the games, the culture, and immediately jumping into designing <strong className="text-text">Game Day graphics</strong> for match days.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                What I didn't know at the time was that this cold email would lead to one of the most creatively fulfilling projects of my life — directing a full-scale, green-screen Valorant character intro film with real players, real lights, and real stakes.
              </p>
            </Fade>

            <MediaPop className="overflow-hidden rounded-2xl border border-border">
              <Image
                src="/Esports/Val UMD COach Interview thumbnail.png"
                alt="UMD Coach interview"
                width={720}
                height={480}
                className="w-full h-auto object-cover"
              />
            </MediaPop>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          02 — GAME DAY GRAPHICS
      ══════════════════════════════════════════════ */}
      <section id="te-gameday" className="relative z-10 bg-[#f5f5f5] py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="02" title="Game Day Graphics — Setting the Visual Tone." />

          <Fade className="mb-12 max-w-2xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              My first contribution was designing graphics for match days — thumbnails, hype posts, and event visuals that needed to feel <strong className="text-text">competitive, collegiate, and on-brand</strong> simultaneously. Every piece had to honor UMD's brand guidelines while pushing the esports aesthetic.
            </p>
            <p className="mt-4 font-mono text-sm leading-relaxed text-text-secondary">
              Strict rules applied: <strong className="text-text">no AI-generated imagery</strong>, strict adherence to{" "}
              <a href="https://brand.umd.edu/colors" target="_blank" rel="noopener noreferrer" className="underline hover:text-text">
                UMD brand colors
              </a>{" "}
              (Terrapin Red, Maryland Gold, black and white), and everything built from scratch in Photoshop and Illustrator.
            </p>
          </Fade>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: "/Esports/NJC valorant thumbnail_1.5x.png",     alt: "NJC Valorant thumbnail" },
              { src: "/Esports/hype up overwatch bec2_1.5x.png",     alt: "Overwatch hype graphic" },
              { src: "/Esports/hype up rocketleague bec1_1.5x.png",  alt: "Rocket League hype graphic" },
              { src: "/Esports/thumbnail RL6_2x.png",                 alt: "Rocket League thumbnail" },
              { src: "/Esports/valorant premier 2_1.5x_2x.jpg",      alt: "Valorant Premier" },
              { src: "/Esports/TerpsEsportsGraphic.jpeg",             alt: "Terps Esports graphic" },
            ].map((img, i) => (
              <MediaPop key={i} delay={i * 0.06} className="overflow-hidden rounded-xl border border-border">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </MediaPop>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          03 — BRAND STRATEGY
      ══════════════════════════════════════════════ */}
      <section id="te-brand" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="03" title="Elevating the Brand Identity." />

          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Fade>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                When <strong className="text-text">Erica Javapor</strong> came on as manager of the standalone creatives department, she brought a new strategic lens to the work. Under her leadership, we moved beyond individual graphics and started thinking about Terps Esports as a <strong className="text-text">cohesive visual brand</strong>.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                We audited our existing assets, aligned on a shared visual language, and pushed the question: <em>"What makes Terps Esports immediately recognizable?"</em> The answer wasn't just colors or logos — it was <strong className="text-text">narrative consistency</strong> across every touchpoint.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                One breakthrough idea: evolve the traditional game day photo shoot into something cinematic. Each team could bring their own concept, set their own scene, and tell their own story, adding a video layer to what was previously static photography.
              </p>
            </Fade>

            <div className="space-y-4">
              {[
                { icon: <Palette size={18} />, title: "Brand Constraints as Creative Fuel", desc: "No AI tools. UMD brand colors only. These weren't limitations — they became the creative challenge that sharpened every decision." },
                { icon: <Users size={18} />, title: "Student-Led, Coach-Approved", desc: "Every design went through a feedback loop with coaches and team managers, making collaboration part of the process, not an afterthought." },
                { icon: <Film size={18} />, title: "From Photography to Film", desc: "The pivot from static shoots to scripted video productions was the conceptual leap that changed everything for the program's visual identity." },
              ].map((item, i) => (
                <Fade key={i} delay={i * 0.1}>
                  <div className="flex gap-4 rounded-xl border border-border bg-white p-5">
                    <div className="mt-0.5 shrink-0" style={{ color: RED }}>{item.icon}</div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-text">{item.title}</p>
                      <p className="mt-1 font-mono text-sm leading-relaxed text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          04 — CO-ED VALORANT INTRO FILM
      ══════════════════════════════════════════════ */}
      <section id="te-coed" className="relative z-10 bg-[#0a0a0a] py-24 md:py-32" style={{ cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='4' fill='white'/%3E%3C/svg%3E\") 10 10, auto" }}>
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="04" title="The Co-Ed Valorant Intro Film." light />

          <Fade className="mb-12 max-w-3xl">
            <p className="font-mono text-base leading-relaxed text-white/60">
              This was the one that pushed everything. Days and nights in front of Adobe Premiere Pro and After Effects. Script drafts. Lighting tests. Green screen setups. A storyboard built from scratch. And a vision: present the Co-Ed Valorant team as their favorite Valorant characters, each player <strong className="text-white">transitions into their agent</strong> in a moment of cinematic transformation.
            </p>
          </Fade>

          {/* Story arc cards */}
          <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <BookOpen size={18} />, step: "01", label: "The Script", desc: "Spent days writing the narrative arc — player introductions, character reveals, timing beats. Every second of the film was planned on paper first." },
              { icon: <Clapperboard size={18} />, step: "02", label: "The Storyboard", desc: "Scene-by-scene visual breakdown: camera angles, lighting moods, green screen placements, transition cues. Shared with the team before a single frame was shot." },
              { icon: <Camera size={18} />, step: "03", label: "The Shoot", desc: "Set up green screens, positioned lighting rigs, directed each player through their scenes. Did mock runs with Seth the videographer and player AnPhu." },
              { icon: <MonitorPlay size={18} />, step: "04", label: "The Edit", desc: "Post-production in Premiere Pro and After Effects: chroma key, character compositing, motion graphics, color grading, and sound design. Late nights in the office." },
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.08}>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 h-full">
                  <div className="mb-3 flex items-center gap-2">
                    <span style={{ color: RED }}>{item.icon}</span>
                    <span className="font-mono text-[11px]" style={{ color: RED }}>{item.step}</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-white mb-2">{item.label}</p>
                  <p className="font-mono text-xs leading-relaxed text-white/50">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>

          {/* Storyboard embed */}
          <Fade className="mb-12">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/30">The Storyboard</p>
            <div className="overflow-hidden rounded-2xl border border-white/10" style={{ aspectRatio: "16/9" }}>
              <iframe
                src="https://docs.google.com/presentation/d/1w58d4kyFiArqaRsV-YmZ8QnDTc5l8eqx7KAlmoCmkr0/embed?start=false&loop=false&delayms=4000"
                frameBorder="0"
                width="100%"
                height="100%"
                allowFullScreen
                title="Co-Ed Valorant Team Intro Storyboard"
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          </Fade>

          {/* BTS images */}
          <Fade className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Behind the Scenes</p>
          </Fade>
          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: "/Esports/me explaining seth the camera man for the camera angles.jpeg", caption: "Explaining camera angles to Seth" },
              { src: "/Esports/Me and Camera man Seth in the picture me explaining to the players.jpeg", caption: "Briefing Seth and the players on set" },
              { src: "/Esports/Me hustling days and nights editing the footage from the office post production.jpeg", caption: "Late-night post-production edit session" },
            ].map((img, i) => (
              <MediaPop key={i} delay={i * 0.08} className="overflow-hidden rounded-xl border border-white/10">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.caption}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="font-mono text-[10px] text-white/70">{img.caption}</p>
                  </div>
                </div>
              </MediaPop>
            ))}
          </div>

          {/* Small scene videos */}
          <Fade className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">On-Set Clips</p>
          </Fade>
          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: "/Esports/Explaiing Seth about the player positions while doing a mock with him (me and seth in the frame).mp4", caption: "Mock run with Seth" },
              { src: "/Esports/in the frame is AnPhu where I'm holding the camera doing mock shooting.mp4", caption: "Mock shoot with AnPhu" },
              { src: "/Esports/Me Explaining Scene to the Women's team.mp4", caption: "Briefing the Women's team" },
            ].map((vid, i) => (
              <MediaPop key={i} delay={i * 0.08} className="overflow-hidden rounded-xl border border-white/10">
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <video
                    src={vid.src}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <p className="px-3 py-2 font-mono text-[10px] text-white/50">{vid.caption}</p>
                </div>
              </MediaPop>
            ))}
          </div>

          {/* Full intro film — YouTube embed (replaces 178 MB local file) */}
          <Fade>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/30">The Full Co-Ed Valorant Intro Film</p>
            <div className="overflow-hidden rounded-2xl border border-white/10" style={{ aspectRatio: "16/9" }}>
              <iframe
                src="https://www.youtube.com/embed/DzViorYUK3Q"
                title="Terps Esports Co-Ed Valorant Intro Film"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              />
            </div>
            <p className="mt-3 font-mono text-[10px] text-white/30">
              Written, directed, and edited by Pradeep Yellapu · Adobe Premiere Pro + After Effects · Chroma key compositing
            </p>
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          05 — UMD GIVING DAY CAMPAIGN
      ══════════════════════════════════════════════ */}
      <section id="te-campaign" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="05" title="UMD Giving Day — I Drowned Myself for Donations." />

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Fade>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                For UMD's annual Giving Day fundraising campaign, I contributed both creative direction <em>and</em> on-screen talent. The brief was simple: make it funny enough that people actually share it.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                The result was a video of me <strong className="text-text">literally drowning into a pool</strong>. Embarrassing, chaotic, and exactly what it needed to be. The campaign hit its donation target, and the video got shared far beyond our usual audience.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                This project reinforced something I believe deeply: good creative work isn't always polished. Sometimes the most effective storytelling is the stuff that makes people laugh out loud and immediately send it to their friends.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Video Production", "Creative Direction", "Fundraising Campaign", "Social Media", "Acting (Unfortunately)"].map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </Fade>

            <MediaPop>
              <div className="overflow-hidden rounded-2xl border border-border" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src="https://www.youtube.com/embed/l4u8BRluzqM"
                  title="UMD Giving Day Campaign Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 font-mono text-[10px] text-text-muted">Yes, that's me. Yes, it helped hit the goal.</p>
            </MediaPop>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          06 — MOST LOVED WORK / GALLERY
      ══════════════════════════════════════════════ */}
      <section id="te-gallery" className="relative z-10 bg-[#f5f5f5] py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="06" title="Most Loved Work." />

          {/* Blossom poster — contained layout */}
          <Fade className="mb-12">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="p-8 md:p-12">
                  <span className="mb-3 block font-mono text-[10px] uppercase tracking-widest" style={{ color: RED }}>
                    Most loved on social media
                  </span>
                  <h3 className="font-manrope text-2xl font-bold text-text md:text-3xl">The Blossom Poster</h3>
                  <p className="mt-4 font-mono text-sm leading-relaxed text-text-secondary">
                    Spring blossoms meet esports arena energy. This poster for the Overwatch 5 season was the most-engaged piece we put out, resonating far beyond the usual esports audience because of its unexpected softness against the competitive backdrop.
                  </p>
                  <p className="mt-3 font-mono text-sm leading-relaxed text-text-secondary">
                    The challenge: make something that feels like spring and competition at the same time, without compromising either. No AI. Hand-crafted in Photoshop.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Photoshop", "UMD Brand Colors", "Seasonal Design", "Social Media"].map(t => <Tag key={t}>{t}</Tag>)}
                  </div>
                </div>
                {/* Image constrained to card height — no overflow */}
                <div className="relative h-[380px] overflow-hidden lg:h-full lg:min-h-[400px]">
                  <Image
                    src="/Esports/blossom poster OW5_1.5x.png"
                    alt="Blossom Poster - Overwatch 5"
                    fill
                    className="object-cover object-top transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </Fade>

          {/* Graphics grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: "/Esports/RL lan event Grand Chanmpions poster@1.5x.png", alt: "Rocket League LAN Event Grand Champions" },
              { src: "/Esports/mariokart lan event.png",                        alt: "Mario Kart LAN Event" },
              { src: "/Esports/Terps Rival Hunger Games.jpg",                   alt: "Terps Rival Hunger Games" },
              { src: "/Esports/esports vlog thumbnail-Recovered_2x.jpg",        alt: "Esports vlog thumbnail" },
              { src: "/Esports/phone to phone thumbanail_2x.png",               alt: "Phone to phone thumbnail" },
              { src: "/Esports/thumbnail giving day.png",                        alt: "Giving Day thumbnail" },
            ].map((img, i) => (
              <MediaPop key={i} delay={i * 0.05} className="overflow-hidden rounded-xl border border-border bg-white">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.04]"
                />
              </MediaPop>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          07 — THE TEAM
      ══════════════════════════════════════════════ */}
      <section id="te-team" className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="07" title="The People Behind It." />

          <Fade className="mb-10 max-w-xl">
            <p className="font-mono text-base leading-relaxed text-text-secondary">
              This project was built on collaboration — students, coaches, managers, and players all pulling in the same direction. These are the people that made it happen.
            </p>
          </Fade>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MediaPop className="overflow-hidden rounded-2xl border border-border col-span-full lg:col-span-2">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src="/Esports/TeamPicturewiththecrew.jpg"
                  alt="The full Terps Esports crew"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                  <p className="font-mono text-xs text-white/70">The full crew after the Co-Ed Valorant shoot</p>
                </div>
              </div>
            </MediaPop>
            <MediaPop delay={0.1} className="overflow-hidden rounded-2xl border border-border">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/Esports/Funtimewiththeteam.jpg"
                  alt="Fun time with the Terps Esports team"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                  <p className="font-mono text-xs text-white/70">Good times with the team</p>
                </div>
              </div>
            </MediaPop>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          08 — NEWSLETTERS
      ══════════════════════════════════════════════ */}
      <section id="te-newsletters" className="relative z-10 bg-[#f5f5f5] py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="08" title="Newsletters — Reaching Beyond the Arena." />

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Fade>
              <p className="font-mono text-base leading-relaxed text-text-secondary">
                One of my ongoing responsibilities is designing the <strong className="text-text">seasonal MailChimp newsletters</strong> for Terps Esports — sent to players, alumni, coaches, donors, and fans.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                Each newsletter covers future plans, season achievements, director's notes, and upcoming events. The goal is to <strong className="text-text">build community beyond game day</strong> — reaching people who care about the program but may never sit in the arena.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-text-secondary">
                Designed to feel editorial, not transactional — structured with hierarchy, seasonal imagery, and consistent brand voice.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["MailChimp", "Email Design", "Copywriting", "Brand Voice", "Community Building"].map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </Fade>

            <MediaPop>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Mail size={16} style={{ color: RED }} />
                  <span className="font-mono text-xs font-semibold text-text">Seasonal Newsletter</span>
                  <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 font-mono text-[10px] text-green-700">Sent · March</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-text-muted">
                  <div className="rounded-lg bg-[#f5f5f5] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb size={13} style={{ color: RED }} />
                      <p className="font-semibold text-text">Director's Notes</p>
                    </div>
                    <p className="leading-relaxed">Season highlights, team milestones, and what's coming next semester...</p>
                  </div>
                  <div className="rounded-lg bg-[#f5f5f5] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={13} style={{ color: GOLD }} />
                      <p className="font-semibold text-text">Season Achievements</p>
                    </div>
                    <p className="leading-relaxed">Match results, tournament placements, and standout performances...</p>
                  </div>
                  <div className="rounded-lg bg-[#f5f5f5] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays size={13} style={{ color: RED }} />
                      <p className="font-semibold text-text">Upcoming Events</p>
                    </div>
                    <p className="leading-relaxed">LAN events, game days, open tryouts, and community watch parties...</p>
                  </div>
                </div>
              </div>
            </MediaPop>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          09 — REFLECTION
      ══════════════════════════════════════════════ */}
      <section id="te-reflection" className="relative z-10 bg-[#0a0a0a] py-24 md:py-32" style={{ cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='4' fill='white'/%3E%3C/svg%3E\") 10 10, auto" }}>
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <SectionHeading number="09" title="What This Project Gave Me." light />

          <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Film size={22} />,    value: "1",     label: "Full-length intro film directed and edited" },
              { icon: <Camera size={22} />,  value: "9+",    label: "Game rosters designed for" },
              { icon: <Zap size={22} />,     value: "100%",  label: "Donation target reached on Giving Day" },
              { icon: <Mail size={22} />,    value: "4",     label: "Seasonal newsletters shipped" },
              { icon: <Palette size={22} />, value: "20+",   label: "Original graphics designed" },
              { icon: <Users size={22} />,   value: "0 AI",  label: "Tools. Every pixel hand-crafted." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-3" style={{ color: GOLD }}>{item.icon}</div>
                <p className="font-manrope text-3xl font-bold text-white">{item.value}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-wide text-white/40">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <Fade>
            <div className="max-w-2xl">
              <p className="font-mono text-base leading-relaxed text-white/60">
                This project pushed me in directions I didn't expect. I came in as a graphic designer and ended up writing scripts, directing camera angles, explaining lighting setups to players, and editing footage at 2am.
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-white/60">
                What it reinforced: <strong className="text-white">design is storytelling</strong>. Whether it's a poster, a newsletter, or a 90-second film — the question is always the same: <em>"What do we want people to feel?"</em>
              </p>
              <p className="mt-4 font-mono text-base leading-relaxed text-white/60">
                And working within constraints — no AI, strict brand guidelines, student budgets, college schedules — made every output more intentional. Limitation is a design tool.
              </p>
            </div>
          </Fade>

          <Fade className="mt-12">
            <Link
              href="/#work"
              className="inline-flex items-center gap-2 font-mono text-sm text-white/40 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to all work
            </Link>
          </Fade>
        </div>
      </section>

      <Footer />
    </div>
  );
}
