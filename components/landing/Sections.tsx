"use client";

import { useState, useSyncExternalStore } from "react";
import { CONTACT, QUOTES, ROLES } from "./content";

// The page under the hero, in the hero's language: Manrope on white, black
// type, hairline rules, sharp corners and small mono labels. No illustration;
// the work and the words carry it.

const WRAP = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
const LABEL = "font-mono text-[10.5px] uppercase tracking-[0.06em] text-black/40";

function SectionHead({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
      <p className={`${LABEL} pt-2`}>{label}</p>
      <h2 className="max-w-[760px] text-[clamp(1.6rem,3.2vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-black">{children}</h2>
    </div>
  );
}

// ── Journey: a ledger of roles (Locomotive's project list) ──────────────────

export function Journey() {
  return (
    <section id="journey" className="bg-white py-24 sm:py-32">
      <div className={WRAP}>
        <SectionHead label="Journey">Six years across aerospace, food security, AI and enterprise IT.</SectionHead>
        <div className="mt-14 sm:mt-20">
          <div className={`hidden grid-cols-[180px_1.1fr_1fr_160px] gap-6 border-b border-black/10 pb-3 md:grid ${LABEL}`}>
            <span>Years</span>
            <span>Role</span>
            <span>Outcome</span>
            <span>Place</span>
          </div>
          <ul>
            {ROLES.map((r) => (
              <li
                key={r.org + r.years}
                className="group grid gap-1.5 border-b border-black/10 py-5 transition-colors hover:bg-black/[0.02] md:grid-cols-[180px_1.1fr_1fr_160px] md:gap-6 md:py-6"
              >
                <span className="font-mono text-[12px] tabular-nums text-black/45">{r.years}</span>
                <span>
                  <span className="block text-[17px] font-semibold leading-snug tracking-[-0.02em] text-black">{r.role}</span>
                  <span className="block text-[14px] tracking-[-0.01em] text-black/55">{r.org}</span>
                </span>
                <span className="text-[14px] leading-relaxed text-black/60">{r.outcome}</span>
                <span className="font-mono text-[11.5px] text-black/40 md:text-right">{r.place}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Kind words: two quotes on flat cards (Cursor, Origin) ───────────────────

function QuoteCard({ q }: { q: (typeof QUOTES)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <figure className="flex flex-col border border-black/10 bg-white p-6 sm:p-8">
      <p className={LABEL}>{q.tag}</p>
      <blockquote className="mt-5 flex-1 text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.45] tracking-[-0.015em] text-black">
        &ldquo;{open ? q.full : q.short}&rdquo;
      </blockquote>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-4 self-start font-mono text-[11px] text-black/45 underline decoration-black/20 underline-offset-4 hover:text-black"
      >
        {open ? "Show less" : "Read the full note"}
      </button>
      <figcaption className="mt-8 flex items-center gap-3 border-t border-black/10 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- small, local */}
        <img src={q.avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover grayscale" />
        <span>
          <span className="block text-[14px] font-semibold tracking-[-0.01em] text-black">{q.name}</span>
          <span className="block text-[12.5px] text-black/50">{q.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function KindWords() {
  return (
    <section id="testimonials" className="border-t border-black/[0.06] bg-[#fafafa] py-24 sm:py-32">
      <div className={WRAP}>
        <SectionHead label="Kind words">From the people I&rsquo;ve built with.</SectionHead>
        <div className="mt-14 grid gap-4 sm:mt-20 md:grid-cols-2">
          {QUOTES.map((q) => (
            <QuoteCard key={q.name} q={q} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact and sign-off (basement.studio, Aino, Vucko) ─────────────────────

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
const subscribeMinute = (cb: () => void) => {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
};

export function Closing() {
  const time = useSyncExternalStore(subscribeMinute, () => timeFmt.format(new Date()), () => "");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const btn = "border border-black/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-black/70 transition-colors hover:border-black hover:text-black";

  return (
    <footer id="contact" className="border-t border-black/[0.06] bg-white pb-36 pt-24 sm:pb-40 sm:pt-32">
      <div className={WRAP}>
        <p className={LABEL}>Contact</p>
        <h2 className="mt-5 text-[clamp(2.2rem,6vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-black">
          Let&rsquo;s build something
          <br />
          people rely on.
        </h2>
        <a
          href={`mailto:${CONTACT.email}`}
          className="mt-6 inline-block break-all text-[clamp(1.3rem,3.4vw,2.8rem)] font-medium tracking-[-0.035em] text-black underline decoration-black/20 decoration-2 underline-offset-[0.18em] transition-colors hover:decoration-black"
        >
          {CONTACT.email}
        </a>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={copy} className={btn}>
            {copied ? "Copied ✓" : "Copy email"}
          </button>
          <a className={btn} href={`https://mail.google.com/mail/?view=cm&to=${CONTACT.email}`} target="_blank" rel="noopener noreferrer">
            Open Gmail
          </a>
        </div>

        <div className="mt-20 grid gap-8 border-t border-black/10 pt-8 sm:grid-cols-3">
          <div>
            <p className={LABEL}>Based in</p>
            <p className="mt-2 text-[15px] tracking-[-0.01em] text-black">
              College Park, MD <span className="tabular-nums text-black/40">{time}</span>
            </p>
            <p className="text-[13px] text-black/50">Open to relocation</p>
          </div>
          <div className="sm:col-span-2">
            <p className={LABEL}>Elsewhere</p>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5">
              {CONTACT.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[15px] tracking-[-0.01em] text-black underline decoration-black/15 underline-offset-4 hover:decoration-black">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sign-off: the name across the full width. */}
        <p aria-hidden="true" className="mt-24 select-none whitespace-nowrap text-[clamp(2.6rem,11.2vw,10.5rem)] font-extrabold leading-[0.95] tracking-[-0.06em] text-black">
          Pradeep Yellapu
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-5 font-mono text-[11px] text-black/45">
          <span>© {new Date().getFullYear()} Pradeep Yellapu</span>
          <span>Built with Next.js and three.js</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-black">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
