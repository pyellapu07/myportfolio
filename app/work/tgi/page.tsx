"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordGate from "@/components/PasswordGate";
import {
  Prose,
  P,
  H2,
  Caption,
  Code,
  Figure,
  FigureRow,
  Wide,
  WideCallout,
  CANVAS,
} from "@/components/jeevy-os/editorial";

/* ══════════════════════════════════════════════════════════════
   TGI In-Season Crop Intelligence Workbench.
   Same editorial language as the Jeevy OS deep dives: 720px prose
   measure, 960px breakout for media and tables, no cards.
   Content follows the Notion case study as of 6 Oct 2026, read as a
   dated build log: the problem, the system, then each iteration in
   order, ending on the production-data rebuild and what it measured.

   People are never named on this page. Collaborators and stakeholders
   appear as role placeholders through <Ph>, and the banner at the top
   says so. Institutions and public organisations stay named.
   ══════════════════════════════════════════════════════════════ */

const LIVE_URL = "https://tgi-gifs-ui.vercel.app";

const EXT_LINK =
  "text-[#D97352] underline underline-offset-4 transition-colors hover:text-[#F2805B]";

const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={EXT_LINK}>
    {children}
  </a>
);

/**
 * A masked name. Rendered as a bracketed role in a dashed chip so it reads
 * as a deliberate placeholder, never as a typo or a real title.
 */
const Ph = ({ children }: { children: React.ReactNode }) => (
  <span className="whitespace-nowrap rounded border border-dashed border-white/25 px-1.5 py-px font-mono text-[0.85em] text-neutral-200">
    [{children}]
  </span>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[18px] font-semibold leading-snug tracking-tight text-white">{children}</h3>
);

/** Section eyebrow: number and build window, so the page reads as a log. */
const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 font-mono text-[12px] uppercase tracking-wider text-neutral-400">{children}</p>
);

/** Bulleted list at body size, each item led by a bold claim. */
const Points = ({ items }: { items: { lead: string; body: React.ReactNode }[] }) => (
  <ul className="space-y-4">
    {items.map((it) => (
      <li
        key={it.lead}
        className="text-[18px] font-normal leading-[28px] tracking-[-0.01em] text-neutral-300"
      >
        <span className="font-semibold text-white">{it.lead}</span> {it.body}
      </li>
    ))}
  </ul>
);

/** A labelled note at prose width: lighter than WideCallout, for asides. */
const Note = ({
  label,
  tone = "neutral",
  children,
}: {
  label: string;
  tone?: "neutral" | "warn" | "risk";
  children: React.ReactNode;
}) => {
  const bar =
    tone === "risk" ? "border-[#F87171]" : tone === "warn" ? "border-[#D4A373]" : "border-white/20";
  return (
    <div className={`my-10 border-l-2 ${bar} pl-5`}>
      <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400">{label}</p>
      <div className="mt-2 text-[16px] leading-[26px] text-neutral-300">{children}</div>
    </div>
  );
};

/**
 * Hairline table across the breakout measure. Scrolls inside its own box on
 * narrow screens so the page itself never scrolls sideways.
 */
function DataTable({
  head,
  rows,
  caption,
  rowHeaders = false,
}: {
  head: string[];
  rows: React.ReactNode[][];
  caption?: string;
  rowHeaders?: boolean;
}) {
  return (
    <Wide className="my-12">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[14px] leading-[22px]">
          <thead>
            <tr className="border-b border-white/[0.12]">
              {head.map((h) => (
                <th key={h} scope="col" className="py-3 pr-6 font-medium text-neutral-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-white/[0.06] align-top">
                {r.map((c, j) =>
                  j === 0 && rowHeaders ? (
                    <th key={j} scope="row" className="py-4 pr-6 font-semibold text-white">
                      {c}
                    </th>
                  ) : (
                    <td key={j} className="py-4 pr-6 tabular-nums text-neutral-300">
                      {c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <Caption>{caption}</Caption>}
    </Wide>
  );
}

/** Three tall panel crops side by side, stacking on mobile. */
function FigureTrio({
  items,
}: {
  items: { src: string; alt: string; caption: string; width: number; height: number }[];
}) {
  return (
    <div className="my-16">
      <Wide>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {items.map((it) => (
            <figure key={it.src}>
              <div className="w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={it.src}
                  alt={it.alt}
                  width={it.width}
                  height={it.height}
                  sizes="(max-width: 640px) 100vw, 300px"
                  quality={90}
                  className="h-auto w-full"
                />
              </div>
              <figcaption>
                <Caption>{it.caption}</Caption>
              </figcaption>
            </figure>
          ))}
        </div>
      </Wide>
    </div>
  );
}

/**
 * Command bar states as labelled strips. Each crop is ~20:1, so a caption
 * under every one would outweigh the image; the label sits beside it instead.
 */
function StateStrips({
  items,
  caption,
}: {
  items: { label: string; src: string; alt: string; width: number; height: number }[];
  caption: string;
}) {
  return (
    <figure className="my-16">
      <Wide>
        <div className="space-y-5 border-t border-white/[0.08] pt-6">
          {items.map((it) => (
            <div key={it.src} className="grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_1fr] md:gap-6">
              <div className="text-[12px] font-medium text-neutral-400">{it.label}</div>
              <div className="overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={it.src}
                  alt={it.alt}
                  width={it.width}
                  height={it.height}
                  sizes="(max-width: 960px) 100vw, 800px"
                  quality={90}
                  className="h-auto w-full"
                />
              </div>
            </div>
          ))}
        </div>
        <figcaption>
          <Caption>{caption}</Caption>
        </figcaption>
      </Wide>
    </figure>
  );
}

/* ── Impact at a glance ─────────────────────────────────────────
   Stat tiles, not a chart: each is one headline number with its
   before value in words, so nothing depends on colour. */

const STATS = [
  {
    value: "1.75M ha",
    unit: "± 0.12M",
    label: "2022 Al Jazirah estimate on 492 ground points",
    note: "Was 1.04M ± 0.21M on the 50-point sandbox: 43% narrower, and the old figure sat outside the new interval.",
  },
  {
    value: "3 of 3",
    unit: "seasons",
    label: "now publish a figure",
    note: "Was 2 of 3. The conflict-onset year, 2023, had been blank; it now reads 0.51M ha with a caution.",
  },
  {
    value: "~87%",
    unit: "smaller",
    label: "area moved by one mislabelled point",
    note: "46,300 ha per point on the sandbox, 5,000 to 6,100 ha across 492 points.",
  },
  {
    value: "82.4%",
    unit: "agreement",
    label: "caught before it shipped",
    note: "Model labels posing as ground truth. Calibrating on them would have reported zero error everywhere.",
  },
  {
    value: "+46.3%",
    unit: "phantom",
    label: "pixel counting over calibrated",
    note: "366,100 ha of cropland that is not there: 13% of the state, on a famine-planning figure.",
  },
  {
    value: "32×",
    unit: "data",
    label: "1,636 points · 4 states · 4 seasons",
    note: "From 50 synthetic points, with 12 monthly model scores per point.",
  },
];

function StatGrid() {
  return (
    <Wide className="my-16">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5 p-6" style={{ background: CANVAS }}>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight text-white">
                {s.value}
              </span>
              <span className="text-[14px] tabular-nums text-neutral-400">{s.unit}</span>
            </div>
            <p className="text-[14px] font-medium leading-[20px] text-neutral-200">{s.label}</p>
            <p className="text-[14px] leading-[22px] text-neutral-400">{s.note}</p>
          </div>
        ))}
      </div>
    </Wide>
  );
}

/* ── Timeline ───────────────────────────────────────────────────
   The spine of the page. Dates are as recorded in the case study;
   anything after 6 Oct 2026 is marked upcoming rather than done. */

const TIMELINE: {
  when: string;
  title: string;
  body: string;
  href?: string;
  upcoming?: boolean;
}[] = [
  {
    when: "8 Sep 2026",
    title: "UX/UI meeting 1",
    body: "Competitive review: Planet’s deep-research agent fails mid-answer; GANNET has no grounding.",
    href: "#benchmark",
  },
  {
    when: "Early Sep",
    title: "Iterations 1–3",
    body: "Paper grid → map-first canvas → one command bar and an intentional GIS workbench.",
    href: "#iterations",
  },
  {
    when: "14 Sep",
    title: "Milestone 1 live",
    body: "Static build on Vercel: 50-point sandbox, 1.04M ha ± 0.21M, scripted Co-Pilot.",
    href: "#iterations",
  },
  {
    when: "15–18 Sep",
    title: "Iteration 4: stakeholder round",
    body: "Six notes, four changes: Uncertainty card, cropland lock, CEO upload, Export PDF fix.",
    href: "#iteration-4",
  },
  {
    when: "Late Sep → Oct",
    title: "Iteration 5: production data",
    body: "492 ground points replace the sandbox; abstention gate and persona engine retired.",
    href: "#iteration-5",
  },
  {
    when: "7 Oct",
    title: "FEWS NET / Sudan preview",
    body: "Technical walkthrough of the Sudan build.",
    upcoming: true,
  },
  {
    when: "9 Oct",
    title: "NASA Harvest / Ukraine review",
    body: "Technical walkthrough for the Ukraine scope.",
    upcoming: true,
  },
  {
    when: "Aug 2027",
    title: "Operational hand-off",
    body: "Full delivery to the consortium.",
    upcoming: true,
  },
];

function Timeline() {
  return (
    <Wide className="my-14">
      <ol className="relative border-l border-white/[0.12] pl-6 md:pl-8">
        {TIMELINE.map((t) => (
          <li key={t.title} className="relative pb-7 last:pb-0">
            <span
              aria-hidden
              className={`absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full md:-left-[37px] ${
                t.upcoming ? "border border-white/40 bg-transparent" : "bg-[#7DB044]"
              }`}
            />
            <div className="grid grid-cols-1 gap-1 md:grid-cols-[150px_1fr] md:gap-6">
              <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">
                {t.when}
                {t.upcoming && <span className="ml-2 normal-case tracking-normal">· upcoming</span>}
              </p>
              <div>
                <p className="text-[16px] font-semibold leading-snug text-white">
                  {t.href ? (
                    <a href={t.href} className="transition-colors hover:text-[#F2805B]">
                      {t.title}
                    </a>
                  ) : (
                    t.title
                  )}
                </p>
                <p className="mt-1 text-[14px] leading-[22px] text-neutral-400">{t.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Wide>
  );
}

/* ── Phenology ──────────────────────────────────────────────────
   One series, one hue, values printed beside every bar, so there is
   no legend and nothing is read from colour alone. Bars are scaled to
   the November peak. */

const PHENOLOGY = [
  { month: "January", col: "asu_score_jan", area: 0, crop: 0, stage: "Bare, unplanted soil" },
  { month: "June", col: "asu_score_jun", area: 0.92, crop: 163, stage: "Onset: land preparation into sowing" },
  { month: "September", col: "asu_score_sep", area: 1.26, crop: 225, stage: "Peak vegetative greenness" },
  { month: "November", col: "asu_score_nov", area: 1.53, crop: 272, stage: "Harvest window" },
];

function PhenologyBars() {
  const max = 1.53;
  return (
    <Wide className="my-12">
      <div className="space-y-5 border-t border-white/[0.08] pt-6">
        {PHENOLOGY.map((p) => (
          <div
            key={p.month}
            className="grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr_220px] md:gap-6"
          >
            <div>
              <p className="text-[14px] font-semibold text-white">{p.month}</p>
              <p className="font-mono text-[12px] text-neutral-400">{p.col}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 flex-1 rounded-sm bg-white/[0.04]">
                {p.area > 0 && (
                  <div
                    className="h-3 rounded-r bg-[#7DB044]"
                    style={{ width: `${(p.area / max) * 100}%` }}
                  />
                )}
              </div>
              <span className="w-[72px] shrink-0 text-right text-[14px] font-medium tabular-nums text-white">
                {p.area === 0 ? "0 ha" : `${p.area.toFixed(2)}M ha`}
              </span>
            </div>
            <p className="text-[14px] leading-[20px] text-neutral-400">
              <span className="tabular-nums text-neutral-200">{p.crop} of 492</span> crop · {p.stage}
            </p>
          </div>
        ))}
      </div>
      <Caption>
        Al Jazirah 2022, re-read from the monthly score column as the month dock is scrubbed.
        Column names are generalised here; the export prefixes them with the model owner’s name.
      </Caption>
    </Wide>
  );
}

const PIPELINE = [
  {
    org: "ASU",
    role: "Vision foundation backbone",
    hue: "#E88AA8",
    body: "A student model distilled from OlmoEarth, Tessera and AEF turns monthly Sentinel-2 into 64-d and 128-d in-season embeddings per pixel.",
  },
  {
    org: "WashU",
    role: "Language-vision alignment",
    hue: "#B9A3E6",
    body: "An open-vocabulary text encoder maps prompts like “cropland” or “abandoned cropland” into the same latent space as the embeddings.",
  },
  {
    org: "UMD · Xylem Lab",
    role: "Calibration & decision UX",
    hue: "#7DB044",
    body: "Picks the confidence cutoff from reference labels, runs Olofsson (2014) stratified error adjustment in the browser, and hosts the workbench.",
  },
];

const PERSONAS = [
  {
    name: "Humanitarian early warning analyst",
    orgs: "FEWS NET, USAID, UN WFP, FAO",
    needs:
      "3-to-6-month projections, IPC famine-scale classifications, 3-minute executive briefings, Admin-2 drilldowns.",
    quote:
      "“Can we lower the confidence level from 95% to 90% to get a tighter range? How do you separate prepared fields from fallow weeds?”",
  },
  {
    name: "Investigative journalist",
    orgs: "Newsrooms, human rights monitors, OSINT desks",
    needs:
      "Verifiable evidence, plain-language causal explanations and before/after visual proof, with no GIS or Python skills and a clear line between observation and inference.",
  },
  {
    name: "Remote sensing / ML researcher",
    orgs: "Ai2, NASA Harvest, academic institutions",
    needs: "Feature distributions, distillation weights, cutoff thresholds and raw telemetry logs.",
  },
];

export default function TgiWorkbenchPage() {
  return (
    <PasswordGate
      password="tgi2026"
      storageKey="tgi-unlocked"
      projectName="TGI Crop Intelligence Workbench"
      note={
        <>
          Work ongoing: this case study is still being written.{" "}
          <a
            href="mailto:pyellapu@umd.edu"
            className="text-primary underline underline-offset-2 transition-opacity hover:opacity-75"
          >
            Reach out
          </a>{" "}
          for early access.
        </>
      }
    >
      <TgiWorkbench />
    </PasswordGate>
  );
}

function TgiWorkbench() {
  /* The homepage card links to sections (#personas and so on), but this
     content mounts only after the gate unlocks, by which point the browser
     has already given up on the hash. Scroll to it once on mount. */
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: CANVAS }}>
      <Header surface="dark" />

      <article className="pb-28 pt-28">
        {/* ══ HEADER ══ */}
        <Prose>
          <nav aria-label="Breadcrumb">
            <Link
              href="/#work"
              className="font-mono text-[12px] uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
            >
              ← Case Studies / TGI Food Security Initiative
            </Link>
          </nav>

          {/* Masking notice: first thing under the breadcrumb, before any
              content that uses a placeholder. */}
          <div className="mt-8 rounded-lg border border-dashed border-white/25 px-5 py-4">
            <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-200">
              Names withheld
            </p>
            <p className="mt-1.5 text-[14px] leading-[22px] text-neutral-400">
              Collaborators and stakeholders appear as role placeholders, like{" "}
              <Ph>Research Lead, ASU</Ph>, and model-owner prefixes in data column names are
              generalised. Institutions and public organisations are named. Figures are unchanged.
            </p>
          </div>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            An in-season crop intelligence workbench that publishes every number with its error bar
          </h1>

          <p className="mt-3 max-w-[720px] text-[14px] font-normal leading-[22px] text-neutral-400">
            Lead Product &amp; Systems Designer (UMD / Xylem Lab) for the Taylor Geospatial Institute
            Food Security Initiative, a consortium of ASU, WashU and UMD building for FEWS NET, NASA
            Harvest, WFP, FAO, USAID and investigative journalists. A 50-point prototype in mid
            September became a 1,636-point production build by October.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-4 border-t border-white/[0.08] pt-6 text-[14px] leading-[22px] sm:grid-cols-2">
            <div>
              <dt className="text-neutral-400">Live prototype</dt>
              <dd className="mt-0.5">
                <ExtLink href={LIVE_URL}>tgi-gifs-ui.vercel.app ↗</ExtLink>
              </dd>
              <dd className="mt-0.5 text-neutral-400">Opens on the Sudan reference set.</dd>
            </div>
            <div>
              <dt className="text-neutral-400">Status</dt>
              <dd className="mt-0.5 text-neutral-300">
                Iteration 5, October 2026. Stakeholder walkthroughs on 7 and 9 Oct; operational
                hand-off August 2027.
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">My role</dt>
              <dd className="mt-0.5 text-neutral-300">
                Product and systems design, front-end build, and the in-browser estimator, with{" "}
                <Ph>Statistics Collaborator, UMD</Ph>.
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">Research attribution</dt>
              <dd className="mt-0.5 text-neutral-300">
                User research, personas and competitive analysis led by{" "}
                <Ph>Research Lead, ASU</Ph>.
              </dd>
            </div>
          </dl>
        </Prose>

        <Figure
          src="/tgi/17-production-492-in-season.webp"
          alt="All 492 Al Jazirah reference points over September 2022 true-colour imagery, with the month dock set to September"
          caption="The current build: all 492 Al Jazirah reference points with the month dock at September, peak vegetative greenness. The basemap follows the window, so the monsoon cloud over the Gezira is the actual September sky."
          width={2000}
          height={1800}
          priority
        />

        {/* ══ IMPACT AT A GLANCE ══ */}
        <Prose>
          <H2 id="impact">Impact at a glance</H2>
          <div className="mt-6">
            <P>
              Measured against the running build, not estimated. The full accounting, including what
              is deliberately not claimed, is at the <a href="#outcomes" className={EXT_LINK}>end</a>.
            </P>
          </div>
        </Prose>

        <StatGrid />

        {/* ══ TIMELINE ══ */}
        <Prose>
          <H2 id="timeline">Timeline</H2>
          <div className="mt-6">
            <P>
              The page follows the build in order. Screenshots are labelled with the build they came
              from: sections before Iteration 5 show the 50-point sandbox, and where the two
              disagree, Iteration 5 is the current product.
            </P>
          </div>
        </Prose>

        <Timeline />

        {/* ══ 1. PROBLEM ══ */}
        <Prose>
          <Kicker>01 · Problem</Kicker>
          <H2 id="problem">Famine warnings from places no one can survey</H2>
          <div className="mt-8 space-y-6">
            <P>
              In conflict zones such as Sudan’s Al Jazirah State, armed clashes keep ground teams from
              running agricultural surveys. Early warning agencies like FEWS NET and WFP project
              production from orbit instead, using one identity:{" "}
              <span className="font-semibold text-white">
                Total Production = Harvested Area × Yield
              </span>
              .
            </P>
            <P>
              Traditional crop maps are retrospective, generated months after harvest once a full
              season of cloud-free imagery exists. Relief agencies need{" "}
              <span className="font-semibold text-white">in-season</span> area, 3 to 6 months before
              harvest, to move grain before acute famine strikes.
            </P>
          </div>
        </Prose>

        <WideCallout
          label="The Precision Trap"
          items={[
            {
              lead: "Naive models overestimate badly.",
              body: "Foundation models (e.g. OlmoEarth) and pixel classifiers produced overestimates of +98% to +246% in project analyses of conflict settings.",
            },
            {
              lead: "Area scaling is multiplicative.",
              body: "The Olofsson (2014) estimator multiplies each reference label across a very large stratum, so every label carries thousands of hectares.",
            },
            {
              lead: "The blast radius depends on sample size.",
              body: "On the 50-point sandbox one wrong point added about 46,300 ha. Across 492 points each carries 5,000 to 6,100 ha: roughly an eighth. More reference points buy a smaller error per mistake.",
            },
            {
              lead: "The hazard is humanitarian.",
              body: "Bloated estimates make conflict regions look food-secure, which can delay life-saving assistance.",
            },
          ]}
        />

        <Figure
          size="compact"
          src="/tgi/fig-1-1-conflict-background.webp"
          alt="A web-sourced analysis summarising the collapse of Sudan’s agriculture since April 2023"
          caption="Conflict background: Sudan’s cereal production fell an estimated 46% in 2023 against pre-war levels, and Gezira farmers flooded their own canals in December 2023 to block RSF vehicles. Context for the decline, not independent validation of any figure on this page."
          width={620}
          height={526}
        />

        {/* ══ 2. SYSTEM ══ */}
        <Prose>
          <Kicker>02 · System</Kicker>
          <H2 id="architecture">Three labs, two file boundaries, one workbench</H2>
          <div className="mt-8 space-y-6">
            <P>
              The platform joins three research systems into one interactive surface. Each keeps its
              institutional colour into the UI, so every provenance tag on a sample card says which
              lab produced that signal.
            </P>
          </div>
        </Prose>

        <Wide className="my-12">
          <ol className="grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-8 md:grid-cols-3">
            {PIPELINE.map((s, i) => (
              <li key={s.org} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.hue }}
                  />
                  <span className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">
                    {String(i + 1).padStart(2, "0")} · {s.org}
                  </span>
                </div>
                <H3>{s.role}</H3>
                <p className="text-[14px] leading-[22px] text-neutral-400">{s.body}</p>
              </li>
            ))}
          </ol>
        </Wide>

        <Prose>
          <div className="space-y-6">
            <H3>The in-season embedding hand-off</H3>
            <P>
              The division of labour is visible in the column names of the reference export the
              prototype reads.
            </P>
          </div>
        </Prose>

        <DataTable
          rowHeaders
          head={["Institution", "Owns", "Hands over"]}
          rows={[
            [
              <span key="a">
                ASU <Ph>Model Lead, ASU</Ph>
              </span>,
              "Subannual in-season embeddings, distilled from AlphaEarth (AEF) and Tessera across monthly Sentinel-2 scenes",
              <span key="a2">
                <Code>asu_score_jan</Code> … <Code>asu_score_dec</Code> and matching labels: one
                score per plot per month
              </span>,
            ],
            [
              <span key="w">
                WashU <Ph>Model Lead, WashU</Ph>
              </span>,
              "The language-vision alignment bridge: a prompt becomes a probability against the embedding space",
              <span key="w2">
                <Code>our_score</Code> and <Code>our_label</Code>: the annual prompt-alignment
                baseline
              </span>,
            ],
            [
              <span key="u">UMD / Xylem Lab (me, with <Ph>Statistics Collaborator, UMD</Ph>)</span>,
              "Client-side Olofsson (2014) and Stehman (2014) error adjustment: stratum weights, crop proportion, variance and the 95% interval, plus the interface",
              "The adjusted area and its bounds, recomputed in the browser on every scope change",
            ],
          ]}
          caption="Model-owner prefixes in column names are generalised to the institution."
        />

        <Prose>
          <Note label="Model-mismatch resolution" tone="warn">
            WashU’s text alignment is trained directly against global AlphaEarth embeddings rather
            than unaligned OLMoEarth projections, so the prompt scores and the monthly embeddings share
            one latent space. Aligning to an unaligned projection would have made the two hand-offs
            incomparable.
          </Note>
          <Note label="A model label is not a reference label" tone="risk">
            Checked against reviewer annotations for the same <Code>plotid</Code> and{" "}
            <Code>year</Code>, <Code>our_label</Code> agrees <strong className="text-white">82.4%</strong>{" "}
            of the time and the ASU August label <strong className="text-white">82.2%</strong>.
            Calibrating against either would compare a model with itself and report no error at all.
            The prototype joins the export to the reviewer annotations on <Code>plotid</Code> and{" "}
            <Code>year</Code> and calibrates against the reviewer column.
          </Note>
        </Prose>

        {/* ══ 3. RESEARCH ══ */}
        <Prose>
          <Kicker>03 · Research</Kicker>
          <H2 id="personas">Three readers of the same raster</H2>
          <div className="mt-8 space-y-6">
            <P>
              <Ph>Research Lead, ASU</Ph> found three personas inspecting the same remote sensing data
              through very different lenses. These findings are what the design was reasoned from.
            </P>
          </div>
          <div className="mt-10 space-y-10 border-t border-white/[0.08] pt-8">
            {PERSONAS.map((p) => (
              <div key={p.name} className="space-y-2">
                <H3>{p.name}</H3>
                <p className="text-[14px] leading-[22px] text-neutral-400">{p.orgs}</p>
                <P>{p.needs}</P>
                {p.quote && (
                  <blockquote className="border-l-2 border-[#D97352] pl-4 text-[18px] italic leading-[28px] text-neutral-200">
                    {p.quote}
                  </blockquote>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 space-y-6">
            <H3>The Workspace Persona Engine (Iterations 2–4)</H3>
            <P>
              Rather than three products, the UI recalibrated on three layers per role. Figures never
              changed between personas; only vocabulary, starter questions and drawer density did.
            </P>
          </div>
        </Prose>

        <DataTable
          rowHeaders
          head={["UI layer", "Humanitarian decision-maker", "Investigative journalist", "Remote sensing / ML researcher"]}
          rows={[
            ["Audience", "FEWS NET · WFP · USAID", "Newsrooms and fact-checkers", "Earth observation and ML teams"],
            [
              "Headline focus",
              "Crop area change against the 2022 baseline, with plain-language risk bounds",
              "What changed on the ground, how it was checked, and what the data cannot prove",
              "Olofsson error adjustment, the cutoff, embedding uncertainty",
            ],
            [
              "Language",
              "Authoritative, concise, policy-oriented",
              "Everyday words; no τ, strata or variance",
              "Rigorous, technical, statistical",
            ],
            [
              "Drawer density",
              "Telemetry folded under Technical details; brief export",
              "Folded as Model settings; actions lead to before/after",
              "Pipeline telemetry open by default",
            ],
          ]}
        />

        <Figure
          src="/tgi/02-workspace-persona.webp"
          alt="The Workspace persona panel with three preset cards and a Custom role input"
          caption="Iteration 3: the persona panel, with three presets and a Custom role (auto-tune) input. Retired in Iteration 5, where the build opens in the humanitarian layout for every reader."
          width={2000}
          height={1250}
        />

        {/* ══ 4. BENCHMARK ══ */}
        <Prose>
          <Kicker>04 · Benchmark · 8 Sep 2026</Kicker>
          <H2 id="benchmark">From black box to calibrated audit</H2>
          <div className="mt-8 space-y-6">
            <P>
              The competitive set ran from text-only agents to imagery-rich research assistants. None
              attached an interval to its number.
            </P>
          </div>
        </Prose>

        <DataTable
          rowHeaders
          head={["Dimension", "GANNET", "Planet AI Deep Research", "TGI Workbench"]}
          rows={[
            [
              "Output",
              "Plain text tables",
              "Before/after swipe sliders and NDVI curves",
              "Error-adjusted area with a 95% interval, plus before/after verification",
            ],
            [
              "Spatial grounding",
              "None",
              "Imagery-grounded",
              "492 reference pins for Al Jazirah from a 1,636-point, four-state set; Admin-2 filter",
            ],
            [
              "Calibration",
              "None",
              "Raw pixel counting; self-described order-of-magnitude estimate",
              "Confidence cutoff plus the Olofsson stratified estimator",
            ],
            [
              "Failure handling",
              "Repeated “Failed to load preview” errors",
              "Disclaimers disavow accuracy",
              "Every season publishes its figure and interval, with a caution where a reporting rule breaks",
            ],
          ]}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/fig-4-1-planet-basic-ux-failure.webp",
              alt: "Planet’s assistant showing an error message beside a toast that says Deep Research is done",
              caption: "Planet’s assistant fails with “Something went wrong” while a toast still says “Deep Research is done”, and its comparison carries no area, interval or uncertainty.",
              width: 921,
              height: 527,
            },
            {
              src: "/tgi/fig-4-2-olmoearth-explorer-panel.webp",
              alt: "The OlmoEarth Embeddings Explorer control panel",
              caption: "The predecessor, Ai2’s OlmoEarth Embeddings Explorer: embedding controls for ML developers, no calibrated area or interval.",
              width: 720,
              height: 946,
            },
          ]}
        />

        {/* ══ 5. ITERATIONS 1–3 ══ */}
        <Prose>
          <Kicker>05 · Build log · Iterations 1–3 · early Sep</Kicker>
          <H2 id="iterations">From a paper grid to a GIS workbench</H2>

          <div className="mt-10 space-y-6">
            <H3>Iteration 1: the multi-card grid</H3>
            <P>
              The first sketch put inputs in a left column beside equal boxes: the estimate, the pixel
              count, a small map with a telemetry log, and an AI chat strip. The map carried the same
              weight as a number card, so the reference points an analyst must inspect were trapped in
              one box.
            </P>
            <H3>Iteration 2: map-first, floating pills</H3>
            <P>
              “Map was too small in V1.” The map became the canvas, inputs moved to a top row, and a
              GIS toolkit let analysts measure fields directly. The same page noted that journalists
              can’t read ML language, which became the Persona Engine. In the build, the floating
              controls fought: pills collided, a 9999px container wrapped 8px inputs, and a static Run
              button clashed with auto-updating parameters.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: "/tgi/figure-5-1-low-fid-paper-v1.webp",
              alt: "Notebook sketch of a four-box layout",
              caption: "Iteration 1: the 4-box layout and “AI chat should be agentic enough to do tasks, not just answer”.",
              width: 1024,
              height: 768,
            },
            {
              src: "/tgi/figure-5-2-low-fid-paper-v2.webp",
              alt: "Notebook sketch of a full-bleed map with inputs across the top",
              caption: "Iteration 2 opens with “Map was too small in V1”.",
              width: 1024,
              height: 768,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Iteration 3: one command bar, read Where → When → What → Status</H3>
            <P>
              The wireframe below is the blueprint the shipped product grew from: one command strip, a
              map that owns the canvas, and a right-hand column for the decision, its warning and its
              evidence.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/figure-5-3-raw-4-unified-command-bar.webp"
          alt="Monochrome wireframe with a single command bar, full map and right-hand decision column"
          caption="The Iteration 3 wireframe: pill collisions resolved into one command bar with 8px radii and right-hand decision scaffolding."
          width={1440}
          height={900}
        />

        <Prose>
          <Points
            items={[
              {
                lead: "Unified command bar.",
                body: "Region, Admin-2, year, a month timeline, phenology stages and the query in one 42px row. The end slot holds Run only while the scope has changed; otherwise ✓ In sync.",
              },
              {
                lead: "Multi-season audit.",
                body: "2022 vs 2024 with Sentinel-2 cloudless chips in a split swipe or side by side.",
              },
              {
                lead: "Intentional override.",
                body: "Model labels stay read-only until the user asks “Do you think this is incorrect?”.",
              },
              {
                lead: "Abstention gate (later retired).",
                body: "2023 withheld its figure because its interval exceeded ±35%. Iteration 5 reverses this decision.",
              },
            ]}
          />
        </Prose>

        <Figure
          src="/tgi/03-unified-command-bar.webp"
          alt="The single-row command bar with September selected and the In sync status"
          caption="The single-row command bar with September selected and ✓ In sync."
          width={2000}
          height={105}
        />

        <Figure
          src="/tgi/01-hero-full-platform.webp"
          alt="The Milestone 1 workbench over Al Jazirah with 50 reference pins and the Statistical decision drawer reading 1.04M ha ± 0.21M"
          caption="Milestone 1, live 14 Sep 2026: 50 sandbox pins and the Statistical decision drawer (2022: 1.04M ha ± 0.21M). The drawer is now titled Planted area estimation."
          width={2000}
          height={1250}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/04-multi-season-compare.webp",
              alt: "Multi-season comparative audit drawer",
              caption: "Sandbox compare: 2022 at 1.04M ± 0.21M against 2024 at 0.52M ± 0.14M.",
              width: 760,
              height: 1800,
            },
            {
              src: "/tgi/06-abstention-2023.webp",
              alt: "The decision drawer in the Estimate abstained state",
              caption: "The abstention state as it behaved in Iteration 3: a ±50% interval, so no figure. Retired in Iteration 5.",
              width: 760,
              height: 1800,
            },
          ]}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/04b-visual-verification-swipe.webp",
              alt: "Split swipe between 2022 and 2024 Sentinel-2 composites",
              caption: "Visual verification: a split swipe between 2022 and 2024 Sentinel-2 cloudless annual composites (EOX).",
              width: 760,
              height: 1800,
            },
            {
              src: "/tgi/05-sample-card-sd22-020.webp",
              alt: "Inspection card for reference sample SD22-020",
              caption: "A sandbox sample card: provenance tags, model label vs ground reference, Ask AI and the override link.",
              width: 800,
              height: 1400,
            },
          ]}
        />

        {/* ══ 6. ITERATION 4 ══ */}
        <Prose>
          <Kicker>06 · Build log · Iteration 4 · 15–18 Sep</Kicker>
          <H2 id="iteration-4">The stakeholder round</H2>
          <div className="mt-8 space-y-6">
            <P>
              After the Milestone 1 walkthrough, <Ph>Research Lead, ASU</Ph> sent six notes. Two were
              keeps: the location and Admin-2 dropdowns, and relabelling a sample from the map. Four
              became changes, built and verified by 18 Sep.
            </P>
          </div>
        </Prose>

        <DataTable
          head={["Feedback", "Design decision", "What shipped"]}
          rows={[
            [
              "Uncertainty should be shared with the user, not something they set",
              "Replace a control with a read-only summary",
              "An Uncertainty card with a low / medium / high bar. The τ slider and risk barcode are gone.",
            ],
            [
              "No data for planted fields or sorghum in Sudan",
              "Scope the query to what the data supports",
              "The query is locked to cropland, with the reason on hover.",
            ],
            [
              "Collect Earth Online (CEO) uploads would be useful",
              "Show the ingestion path, then make it real",
              "Upload reference samples (CEO): first an explained placeholder, then live parsing.",
            ],
            [
              "Export PDF didn’t really work",
              "Diagnose before restyling",
              "The brief printed from inside a modal, which the browser pins to the top layer. It now prints a dedicated sheet.",
            ],
          ]}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/10-uncertainty-card.webp",
              alt: "Read-only Uncertainty card",
              caption: "Why a card, not a control: a slider invites tuning the number until it looks right.",
              width: 710,
              height: 616,
            },
            {
              src: "/tgi/15-ceo-uncertainty.webp",
              alt: "Uncertainty card after a CEO upload",
              caption: "After a CEO upload, with a neutral CEO share. Counts sit beside the bar so colour is never the only signal.",
              width: 710,
              height: 688,
            },
          ]}
        />

        <Figure
          src="/tgi/11-query-locked.webp"
          alt="Command bar with the query field showing cropland and a small lock"
          caption="The query locked to cropland: a lock replaces the suggestions caret."
          width={1622}
          height={116}
        />

        <Prose>
          <div className="space-y-6">
            <H3>CEO upload: from placeholder to live ingestion</H3>
            <Points
              items={[
                {
                  lead: "Three ways in.",
                  body: "Drop a file, choose one, or load a one-click illustrative sample of 20 Al Jazirah points.",
                },
                {
                  lead: "Forgiving column mapping.",
                  body: "lon/lat, longitude/latitude or a GeoJSON point; Cropland, Crop, Yes or 1 count as crop; the season comes from collection_time.",
                },
                {
                  lead: "Immediate recalculation.",
                  body: "The estimate, interval, pins and Uncertainty card recompute at once. Since Iteration 5 an upload adds to the 492-point base.",
                },
                {
                  lead: "Honest numbers.",
                  body: "CEO points are human labels with no model score, so they stay out of the cutoff calibration. Each borrows the Dynamic World stratum of the nearest sample, and the card says so. Nothing leaves the browser.",
                },
              ]}
            />
          </div>
        </Prose>

        <Figure
          src="/tgi/13-ceo-workspace.webp"
          alt="Workbench on the 2024 season with 70 pins after a CEO upload"
          caption="Iteration 4, on the sandbox: 20 CEO points with a dark ring and their own legend row, the estimate recomputed to 0.70M ha ± 0.24M."
          width={2000}
          height={1250}
        />

        <FigureTrio
          items={[
            {
              src: "/tgi/12-ceo-upload-loaded.webp",
              alt: "CEO upload dialog with a green confirmation",
              caption: "Success says what loaded and where it went.",
              width: 1119,
              height: 1045,
            },
            {
              src: "/tgi/16-ceo-upload-error.webp",
              alt: "CEO upload dialog with a red error banner",
              caption: "Failure says why nothing loaded and what was expected.",
              width: 1119,
              height: 887,
            },
            {
              src: "/tgi/14-ceo-sample-card-redacted.webp",
              alt: "Map card for CEO-1002 with a CEO reference chip and the label Non-Cropland",
              caption: "A CEO sample card, marked as not scored by the model. Interpreter email blurred.",
              width: 672,
              height: 1196,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Export PDF: diagnose before restyling</H3>
            <P>
              A modal dialog sits in the browser’s top layer, which forces its positioning, so the
              page height collapsed and the PDF clipped to one screen or came out blank. Export now
              prints a dedicated copy of the brief outside the dialog, flowing at A4 or Letter width
              with cards kept whole.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/tgi/17-export-pdf-page.webp"
          alt="Exported FEWS NET in-season food security briefing on a Letter page"
          caption="The Iteration 4 brief on the sandbox: 1.04M ha, strategic context, samples to verify and integrity checks. Iteration 5 redesigns it (below)."
          width={935}
          height={1210}
        />

        {/* ══ 7. ITERATION 5 ══ */}
        <Prose>
          <Kicker>07 · Build log · Iteration 5 · late Sep → Oct</Kicker>
          <H2 id="iteration-5">Production data, and the decisions that did not survive it</H2>
          <div className="mt-8 space-y-6">
            <P>
              Iteration 4 closed the design questions. Iteration 5 replaced the data underneath them,
              and several decisions that had looked settled did not survive contact with 492 real
              points.
            </P>
          </div>

          <div className="mt-12 space-y-6">
            <H3>From a 50-point sandbox to 492 ground reference points</H3>
            <P>
              Milestone 1 ran on a synthetic set: 50 points per season, <Code>SD22-001</Code> to{" "}
              <Code>SD22-050</Code>, split evenly across two strata. Convenient for building an
              interface, far too small to carry an area figure. The build now fetches a 1,636-point
              export on open: Al Jazirah (492), South Kordofan (432), Al Gedaref (399) and North Darfur
              (313), each labelled for 2022 to 2025.
            </P>
          </div>
        </Prose>

        <DataTable
          rowHeaders
          head={["Al Jazirah, 2022", "50-point sandbox", "492 ground reference points"]}
          rows={[
            ["Calibrated area", "1.04M ha", "1.75M ha"],
            ["95% margin of error", "± 0.21M ha", "± 0.12M ha"],
            ["95% interval", "0.83M to 1.25M ha", "1.63M to 1.87M ha"],
          ]}
          caption="The interval roughly halved, and the sandbox figure sits outside the production interval entirely: it was wrong, not merely imprecise. 1.75M ha lands close to the ~1.67M ha field baseline the research lead had been working from."
        />

        <Prose>
          <Note label="Which 1.75M ha">
            That figure is the area implied by the <strong className="text-white">reviewer
            annotations</strong> for 2022. The annual <strong className="text-white">model</strong>{" "}
            column at the calibrated cutoff reports 0.79M ha for the same scope, which is what the
            exported brief below quotes. Both are correct; they answer different questions, and a
            brief should say which one it is quoting.
          </Note>

          <div className="mt-12 space-y-6">
            <H3>In-season phenology, read from the data</H3>
            <P>
              The export carries one row per plot per year with two models side by side: ASU’s
              monthly in-season scores and WashU’s annual prompt alignment. Scrubbing the month dock
              re-reads the file against the window, so the season emerges rather than being asserted.
            </P>
          </div>
        </Prose>

        <PhenologyBars />

        <Prose>
          <P>
            January returning exactly zero is the useful result: the monthly model is not hedging
            toward an annual average, it is reporting an empty field. That is what makes the curve
            legible as phenology rather than noise.
          </P>

          <div className="mt-12 space-y-6">
            <H3>Removing the abstention gate</H3>
            <P>
              The prototype refused to report whenever the interval exceeded ±35% of the estimate.{" "}
              <Ph>Research Lead, ASU</Ph> and <Ph>Program Stakeholder</Ph> both read that as the system
              hiding a number rather than qualifying it, and the threshold was a round figure chosen
              in the sandbox phase, never derived from anything.
            </P>
            <P>
              It is gone. Every season reports its figure, standard error and interval, and the rules
              that used to withhold a number now raise a caution beside it. 2023, previously blank,
              reads <span className="font-semibold text-white">0.51M ha</span> with a wide-range
              caution.
            </P>
          </div>
        </Prose>

        <WideCallout
          label="Why a caution beats a blank"
          items={[
            {
              lead: "A blank says nothing.",
              body: "An abstention tells the reader nothing about how far off the figure might be.",
            },
            {
              lead: "A caution says how far.",
              body: "A figure carrying its own health warning tells them exactly that, and leaves the judgement with the planner.",
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>One audience, one vocabulary</H3>
            <P>
              The persona engine was the right research instrument and the wrong operational default:
              every reviewer had to pick a role before seeing a number. The build now opens in the
              humanitarian layout and stays there, and the copy was rewritten for that reader.
            </P>
          </div>
        </Prose>

        <DataTable
          head={["Was", "Is", "Why"]}
          rows={[
            ["Statistical decision: Stratified estimation", "Planted area estimation: Al Jazirah", "Names the decision and the place, not the method"],
            ["Raw satellite tally", "Pixel counting", "Says what the number is, in words a bulletin can carry"],
            ["Low confidence", "High uncertainty", "One scale, counted one way, matching the legend"],
            ["GLAD", "Dynamic World (DW 2024)", "Names the stratum map actually in use"],
            ["AA-CRC", "Confidence cutoff", "The acronym explained nothing outside the lab"],
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>A bar chart instead of a candlestick slider</H3>
            <P>
              The horizontal interval slider could show a spread but could not put two areas side by
              side, which is the comparison the figure exists for. It is now a vertical bar chart:
              the error-adjusted estimate with 95% whiskers against Dynamic World pixel counting, in
              the AGRA consortium’s presentation idiom.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: "/tgi/16-comparative-bar-chart.webp",
              alt: "Vertical bar chart: calibrated 1.26M ha with 95% whiskers beside a dashed 1.16M ha pixel count",
              caption: "At the September window: calibrated 1.26M ha (± 0.12M) beside the uncalibrated pixel count, with planning implications underneath.",
              width: 820,
              height: 960,
            },
            {
              src: "/tgi/18-pin-popup-model-scoring.webp",
              alt: "Reference sample P-780 popover with Dynamic World stratum, model label, score 0.93 and ground reference",
              caption: "A production reference pin: plotid, coordinates, the DW 2024 stratum, the model’s label and score for the window, and the reviewer label it is checked against.",
              width: 1240,
              height: 1400,
            },
          ]}
        />

        <Figure
          size="prose"
          src="/tgi/19-executive-one-page-pdf.webp"
          alt="One-page A4 briefing for Sudan (Al Jazirah) 2022: 0.79M ha error-adjusted, pixel counting +46.3%, samples to verify and integrity checks"
          caption="The redesigned one-page A4 brief (2 Oct 2026): figure and context left, sample quality right, integrity checks and citation in the footer. It quotes the model column, 0.79M ha ± 0.11M."
          width={1588}
          height={2246}
        />

        {/* ══ 8. DESIGN SYSTEM ══ */}
        <Prose>
          <Kicker>08 · Design system · 15 gates on every build</Kicker>
          <H2 id="system">A design system tuned for numbers people act on</H2>
          <div className="mt-8 space-y-6">
            <P>
              A warm sand canvas with institutional accents: Xylem Leaf for confident signal, UMD
              Precision Crimson for the Precision Trap, Academic Gold for uncertainty, ASU Maroon and
              WashU Purple for provenance. The token build fails if a documented text pair drops
              below its WCAG floor, in either theme. Component screenshots in this section were
              captured on the sandbox build.
            </P>
          </div>
        </Prose>

        <DataTable
          head={["Token", "Role", "Light", "Dark", "On white"]}
          rows={[
            [<Code key="p">--primary</Code>, "Xylem Leaf: primary actions", "#3B6B22", "#7DB044", "6.34:1 AA"],
            [<Code key="e">--error</Code>, "UMD Precision Crimson", "#DC2626", "#F87171", "4.83:1 AA"],
            [<Code key="w">--warning</Code>, "Academic Gold: uncertainty", "#B45309", "#FFC627", "5.02:1 AA"],
            [<Code key="v">--provenance-vision-label</Code>, "ASU Maroon", "#8C1D40", "#E88AA8", "8.88:1 AAA"],
            [<Code key="t">--provenance-text-label</Code>, "WashU Purple", "#32006E", "#B9A3E6", "15.43:1 AAA"],
            [<Code key="c">--bg-canvas</Code>, "Warm sand backdrop", "#F7F5F0", "#12151C", "Background"],
          ]}
          caption="Audit finding: --error reaches only 4.43:1 on the sand canvas, so crimson body text stays on white cards or runs at large-text size."
        />

        <Figure
          src="/tgi/card-bright-pair-matrix.webp"
          alt="Bright-pair token matrix with measured WCAG ratios"
          caption="Bright-pair matrix: each institutional hue as a container fill with a label tuned to pass on it."
          width={2000}
          height={1218}
        />

        <Figure
          src="/tgi/card-surface-ladder.webp"
          alt="Five warm sand surfaces plotted by L* lightness"
          caption="The surface ladder, by CIE L*: groove 92.8, rail 93.5, hover 94.9, canvas 96.6, card 100. The build enforces a strictly rising ladder and hover at least 2.0 L* below a card."
          width={2000}
          height={1320}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Tabular figures, never monospace</H3>
            <P>
              Monospace made the drawer read like a log dump; proportional digits jitter as live
              counts update. IBM Plex Sans with <Code>tabular-nums</Code> keeps proportional letters
              and fixed numeric advance, so 1.04M → 1.75M changes without the column moving.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/gov-6-2-tabular-figures.webp"
          alt="The same four figures set in monospace, proportional digits and tabular figures"
          caption="Numerals three ways: monospace (before), proportional (the risk), tabular (shipped)."
          width={2000}
          height={890}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Ask vs Do: intent by anatomy before colour</H3>
            <P>
              Ask chips carry a leading sparkle and only put a question to the Co-Pilot. Do chips carry
              a trailing arrow and change the workspace now. Same shape and type; the glyph position
              tells them apart.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/card-ask-do-chips.webp"
          alt="Ask and Do chip specifications"
          caption="Ask label 8.41:1, Do label 15.39:1; both 12px / 500, 4px 10px padding, fully rounded."
          width={2000}
          height={962}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/m-chip-ask-card.webp",
              alt: "An Ask chip inside the Precision Trap card",
              caption: "An Ask chip stays attached to the figure it explains.",
              width: 710,
              height: 336,
            },
            {
              src: "/tgi/m-copilot-chips.webp",
              alt: "The open Co-Pilot with Ask starter chips above a Do chip",
              caption: "The Co-Pilot: Ask starters above a Do chip.",
              width: 1064,
              height: 704,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Compare is a switch, and motion replaces spinners</H3>
            <P>
              Compare engages one mode over the canvas, so it is a 28 × 16px switch bound to{" "}
              <Code>role=&quot;switch&quot;</Code>, the only switch the gates allow. While a run works,
              the command bar’s border drifts leaf → gold → leaf every 3 s instead of spinning; only
              opacity, border and glow animate, and all of it pauses under{" "}
              <Code>prefers-reduced-motion</Code>.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: "/tgi/gov-6-4-compare-toggle.webp",
              alt: "The Compare toggle inactive and active",
              caption: "Compare off and on.",
              width: 2000,
              height: 1112,
            },
            {
              src: "/tgi/gov-6-5-ambient-aura.webp",
              alt: "Command bar at rest and at the amber peak of its breathing cycle",
              caption: "The aura at rest and at its amber peak.",
              width: 2000,
              height: 1270,
            },
          ]}
        />

        <Figure
          src="/tgi/gov-6-6-command-bar-anatomy.webp"
          alt="Measured anatomy of the command bar"
          caption="Command bar anatomy: an 8px outer radius shared with its direct controls, stepping to 6px and 4px for nested pieces, on one 28px centre line."
          width={2000}
          height={717}
        />

        <StateStrips
          caption="Command bar states from the running prototype."
          items={[
            { label: "Default", src: "/tgi/m-bar-default.webp", alt: "Command bar at rest", width: 2000, height: 99 },
            { label: "Hover", src: "/tgi/m-bar-hover-trigger.webp", alt: "Command bar with a trigger on hover", width: 2000, height: 99 },
            { label: "Active month", src: "/tgi/m-bar-active-month.webp", alt: "Command bar with September selected", width: 2000, height: 99 },
            { label: "Scope changed", src: "/tgi/m-bar-run.webp", alt: "Command bar with Run replacing In sync", width: 2000, height: 168 },
            { label: "Working", src: "/tgi/m-bar-breathing.webp", alt: "Command bar mid-run at the amber swing", width: 2000, height: 133 },
          ]}
        />

        <FigureTrio
          items={[
            {
              src: "/tgi/07a-search-samples.webp",
              alt: "Search samples panel",
              caption: "Search samples: find any reference point by ID and fly to it.",
              width: 856,
              height: 1800,
            },
            {
              src: "/tgi/07b-datasets.webp",
              alt: "Datasets panel",
              caption: "Datasets: the provenance ledger for references and samples.",
              width: 856,
              height: 1800,
            },
            {
              src: "/tgi/07c-run-history.webp",
              alt: "Run history panel",
              caption: "Run history, restorable in one click (captured when 2023 still abstained).",
              width: 816,
              height: 1800,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Pins that pass 3:1, and overrides that take two steps</H3>
            <P>
              The proposed emerald and grey pins measured 2.54:1 on white, under the WCAG 1.4.11
              floor. Shipped pins pair a muted leaf fill with a darker stroke; high uncertainty adds an
              amber ring, an override a dashed ink ring. Because one mislabel moves the published
              figure by thousands of hectares, a label is read-only until the analyst asks to override
              it, and overrides never touch the cutoff calibration.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: "/tgi/card-map-pins.webp",
              alt: "Reference sample pin states with legend and tokens",
              caption: "Pin states, captured on the sandbox after one override.",
              width: 2000,
              height: 1122,
            },
            {
              src: "/tgi/m-legend.webp",
              alt: "Map legend",
              caption: "The legend, with a running count of crop labels and overrides.",
              width: 492,
              height: 374,
            },
          ]}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/m-override-step1.webp",
              alt: "Sample with a read-only label and the override question",
              caption: "Step 1: a false positive, read-only, with the override behind a question.",
              width: 704,
              height: 1352,
            },
            {
              src: "/tgi/m-override-step2.webp",
              alt: "Sample with Crop and Non-crop choice revealed",
              caption: "Step 2: Crop / Non-crop and Cancel appear only after asking.",
              width: 704,
              height: 1464,
            },
          ]}
        />

        <Figure
          src="/tgi/card-override-sequence.webp"
          alt="Override in three states"
          caption="Read-only, unlocked, applied: on the sandbox one override moved 46,300 ha (1.04M → 0.99M); on the 492-point set it moves 5,000 to 6,100 ha."
          width={2000}
          height={1158}
        />

        {/* ══ 9. OUTCOMES ══ */}
        <Prose>
          <Kicker>09 · Outcomes · measured on the running build</Kicker>
          <H2 id="outcomes">What changed, what it prevented, and what it is worth</H2>
        </Prose>

        <DataTable
          rowHeaders
          head={["Measure", "Before", "After", "Change"]}
          rows={[
            ["2022 Al Jazirah estimate", "1.04M ha", "1.75M ha", "+68%, outside the old interval"],
            ["95% margin of error", "± 0.21M ha", "± 0.12M ha", "43% narrower"],
            ["Seasons that publish a figure", "2 of 3", "3 of 3", "The conflict-onset year is no longer blank"],
            ["Area moved by one mislabelled point", "46,300 ha", "5,000 to 6,100 ha", "~87% smaller blast radius"],
            ["Reference points", "50 synthetic", "1,636 ground-observed", "32×, across 4 states and 4 seasons"],
            ["In-season resolution", "1 annual figure", "12 monthly figures", "0 ha in January to 1.53M ha by November"],
          ]}
        />

        <WideCallout
          label="What the work prevented"
          items={[
            {
              lead: "A silent calibration failure.",
              body: "Two models’ labels shipped in columns that look exactly like ground truth, agreeing with reviewers only 82.4% and 82.2% of the time. Calibrating on them would have reported zero error on every season, in every region, indefinitely. Caught by joining on plotid and year and testing agreement before wiring anything up.",
            },
            {
              lead: "366,100 ha of phantom cropland.",
              body: "Uncalibrated pixel counting reads +46.3% high: 13% of the state’s land area. The interface now shows both bars side by side, so the gap is the first thing a reader sees.",
            },
            {
              lead: "A blank where the answer mattered most.",
              body: "An arbitrary ±35% clamp suppressed the conflict-onset year. It now reads 0.51M ha with a stated range.",
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>What this is worth, stated honestly</H3>
            <P>
              No dollar figure is claimed, because none can be sourced. The system measures cropland
              area, error-adjusted against ground reference points; not yield, price or food security
              outcomes. Its planning card converts area to tonnage under two stated assumptions (0.8
              t/ha rainfed sorghum, 146 kg of cereal per person per year) and labels every output as a
              conversion. Under those, the 2024 shortfall against 2022, 467,900 ha, is roughly 374,000 t
              of staple grain. Turning that into currency would need a verified price this project
              does not hold.
            </P>
          </div>

          <div className="mt-12">
            <Points
              items={[
                {
                  lead: "Decision quality.",
                  body: "The figure governs cropland reporting across 2.75M ha of Al Jazirah. Halving the interval halves the contingency band a planner has to carry.",
                },
                {
                  lead: "Trust under scrutiny.",
                  body: "Every figure carries its interval, its reference count and its caution, and the one-page brief exports with integrity checks and citation attached.",
                },
                {
                  lead: "Durability.",
                  body: "A 15-gate design system check runs on every build, and the estimator, ingestion and phenology windows ship as reviewable modules for the consortium’s statistics lead.",
                },
              ]}
            />
          </div>
        </Prose>

        <WideCallout
          label="The pattern underneath"
          items={[
            {
              lead: "Four times a figure looked right and was wrong:",
              body: "a sandbox that was precise and inaccurate, model labels that could not calibrate, a ±35% clamp with no derivation, and a per-point error weight quoted eight times too large. Each was found by measuring against the running system instead of trusting the artifact that described it.",
            },
          ]}
        />

        {/* ══ 10. SHIPPING & NEXT ══ */}
        <Prose>
          <Kicker>10 · Shipping &amp; next</Kicker>
          <H2 id="next">Where it stands</H2>
          <div className="mt-8">
            <Points
              items={[
                {
                  lead: "Live on Vercel since 14 Sep,",
                  body: "redeployed 18 Sep and again for Iteration 5: the build fetches the 1,636-point export on open, the month dock drives basemap and score column, and the brief prints as one A4 page.",
                },
                {
                  lead: "No key, no proxy.",
                  body: "A static bundle with no secrets; on a static host the Co-Pilot falls back to a labelled scripted planner.",
                },
                {
                  lead: "Next:",
                  body: "the FEWS NET / Sudan preview on 7 Oct, the NASA Harvest / Ukraine review on 9 Oct, and operational hand-off in August 2027.",
                },
              ]}
            />
          </div>
          <p className="mt-10 text-[14px] leading-[22px] text-neutral-400">
            Scope notes: estimates are evaluated at state level; sub-district selection is a spatial
            filter. Bounds are error-adjusted, not certified. Imagery chips are Sentinel-2 cloudless
            annual composites. The 2024 vs 2022 change is consistent with displacement after April
            2023; the figures alone do not prove cause. Try the build at{" "}
            <ExtLink href={LIVE_URL}>tgi-gifs-ui.vercel.app ↗</ExtLink>.
          </p>
        </Prose>

        {/* ══ BOTTOM RAIL ══ */}
        <Prose className="mt-16">
          <div className="border-t border-white/10 pt-10">
            <Link
              href="/#work"
              className="inline-flex items-center gap-1.5 text-[14px] leading-relaxed text-[#D97352] underline underline-offset-4 transition-colors hover:text-[#F2805B]"
            >
              ← Back to all case studies
            </Link>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
