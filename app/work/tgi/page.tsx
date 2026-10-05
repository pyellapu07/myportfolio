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
   Content follows the Notion case study of 18 Sep 2026.
   ══════════════════════════════════════════════════════════════ */

const LIVE_URL = "https://tgi-gifs-ui.vercel.app";

const EXT_LINK =
  "text-[#D97352] underline underline-offset-4 transition-colors hover:text-[#F2805B]";

const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={EXT_LINK}>
    {children}
  </a>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[18px] font-semibold leading-snug tracking-tight text-white">{children}</h3>
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

const PIPELINE = [
  {
    org: "ASU",
    role: "Vision foundation backbone",
    hue: "#E88AA8",
    body: "A student model distilled from OlmoEarth, Tessera and AEF turns Sentinel-2 into 64-d and 128-d in-season feature embeddings per pixel.",
  },
  {
    org: "WashU",
    role: "Language-vision alignment",
    hue: "#B9A3E6",
    body: "An open-vocabulary contrastive text encoder maps prompts like “cropland” or “fallow soil” into ASU’s visual latent space.",
  },
  {
    org: "UMD · Xylem Lab",
    role: "Statistical calibration & decision UX",
    hue: "#7DB044",
    body: "AA-CRC picks the cutoff τ, the Olofsson estimator produces error-adjusted bounds (1.04M ha ± 0.21M), abstention gates hold back indefensible figures, and the workbench hosts the human in the loop.",
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
      "Verifiable evidence, plain-language causal explanations, publication-ready graphics and before/after visual proof, with no GIS or Python skills and a clear line between observation and inference.",
  },
  {
    name: "Remote sensing / ML researcher",
    orgs: "Ai2, NASA Harvest, academic institutions",
    needs:
      "Feature distributions, student model distillation weights, AA-CRC τ thresholds and raw telemetry logs.",
  },
];

const OUTCOMES = [
  {
    lead: "Live on Vercel.",
    body: "Deployed 14 Sep 2026 as a prebuilt static bundle and redeployed 18 Sep with the Iteration 4 changes. 50 sample pins, the 1.04M ha estimate and the scripted Co-Pilot load with no errors.",
  },
  {
    lead: "Four stakeholder notes shipped in three days.",
    body: "The Uncertainty card, the cropland-only query, CEO reference ingestion and the Export PDF fix were built and verified between 15 and 18 Sep 2026.",
  },
  {
    lead: "Contrast enforced by the build.",
    body: "The token build fails if a documented text pair drops below its WCAG floor, in both themes.",
  },
  {
    lead: "No figure without a defence.",
    body: "The 2023 conflict-onset season abstains: its ±50% interval exceeds the ±35% reporting limit, so nothing is published.",
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

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            An in-season crop intelligence workbench that refuses to publish a number it cannot defend
          </h1>

          <p className="mt-3 max-w-[720px] text-[14px] font-normal leading-[22px] text-neutral-400">
            Lead Product &amp; Systems Designer (UMD / Xylem Lab) for the Taylor Geospatial Institute
            Food Security Initiative, a consortium of ASU, WashU and UMD building for FEWS NET, NASA
            Harvest RAAPID, WFP, FAO, USAID and investigative journalists. Milestone 1 prototype in
            September 2026, Demo Day 1 in early October 2026, full operational delivery in August 2027.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-4 border-t border-white/[0.08] pt-6 text-[14px] leading-[22px] sm:grid-cols-2">
            <div>
              <dt className="text-neutral-400">Live prototype</dt>
              <dd className="mt-0.5">
                <ExtLink href={LIVE_URL}>tgi-gifs-ui.vercel.app ↗</ExtLink>
              </dd>
              <dd className="mt-0.5 text-neutral-400">
                Precomputed scenarios; the Co-Pilot answers as Scripted preview.
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">Research attribution</dt>
              <dd className="mt-0.5 text-neutral-300">
                User research, persona architectures and competitive analysis led by{" "}
                <span className="font-semibold text-white">Ana M. Tárano</span> (ASU UX/UI Ecosystem
                Lead).
              </dd>
            </div>
          </dl>
        </Prose>

        <Figure
          src="/tgi/01-hero-full-platform.webp"
          alt="The workbench over Al Jazirah on a satellite basemap: unified command bar, 50 reference sample pins, a vertical map toolbar and the Statistical decision drawer reading 1.04M ha ± 0.21M"
          caption="Al Jazirah on the satellite basemap: the unified command bar, 50 reference sample pins, the vertical map toolbar and the Statistical decision drawer (2022: 1.04M ha ± 0.21M, 95% confidence). Milestone 1 prototype at 1440 × 900."
          width={2000}
          height={1250}
          priority
        />

        {/* ══ 1. PROBLEM ══ */}
        <Prose>
          <H2 id="problem">The problem: famine warnings from places no one can survey</H2>
          <div className="mt-8 space-y-6">
            <P>
              In active conflict zones such as Sudan (Al Jazirah State), Syria, Haiti and Ukraine,
              armed clashes keep ground teams from running agricultural surveys. Early warning agencies
              like FEWS NET and WFP project seasonal production from orbit instead, using one identity:{" "}
              <span className="font-semibold text-white">
                Total Production = Harvested Area × Yield
              </span>
              .
            </P>
            <P>
              Traditional satellite crop maps are retrospective. They are generated months after
              harvest, once a full season of cloud-free imagery exists. Relief agencies need{" "}
              <span className="font-semibold text-white">in-season</span> intelligence, mid-growth and
              3 to 6 months before harvest, to move grain before acute famine strikes.
            </P>
          </div>
        </Prose>

        <WideCallout
          label="The Precision Trap"
          items={[
            {
              lead: "Naive models overestimate badly.",
              body: "Standard foundation models (e.g. OlmoEarth) and pixel classifiers (e.g. GLAD) produced overestimates of +98% to +246% in project analyses of conflict settings.",
            },
            {
              lead: "Area scaling is multiplicative.",
              body: "The Olofsson (2014) sample-based estimator multiplies each sample label across very large strata.",
            },
            {
              lead: "One false positive moves the map.",
              body: "Dry grass or fallow soil read as active crop inflates the regional estimate by roughly 46,300 to 121,000 ha. In the 2022 Al Jazirah scenario, one wrongly counted reference point adds about 46,300 ha.",
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
          caption="Conflict background for the Al Jazirah decline: Sudan’s cereal production fell an estimated 46% in 2023 against pre-war levels, and Gezira farmers flooded their own canals in December 2023 to block RSF vehicles. The prototype’s 2024 decline comes from illustrative reference samples, so this is context, not independent validation."
          width={620}
          height={526}
        />

        {/* ══ 2. ARCHITECTURE ══ */}
        <Prose>
          <H2 id="architecture">Three institutions, one workbench</H2>
          <div className="mt-8 space-y-6">
            <P>
              The platform joins three academic systems into one interactive surface. Each stage keeps
              its own institutional colour all the way into the UI, so every provenance tag on a sample
              card says which lab produced that signal.
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

        {/* ══ 3. PERSONAS ══ */}
        <Prose>
          <H2 id="personas">Three readers of the same raster</H2>
          <div className="mt-8 space-y-6">
            <P>
              Ana Tárano’s research found three personas inspecting the same remote sensing data
              through very different lenses.
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
            <H3>The Workspace Persona Engine</H3>
            <P>
              Rather than three products, the UI recalibrates on three layers based on the active role.
              Figures never change between personas; only vocabulary, starter questions and drawer
              density do. A fourth option, Custom role (auto-tune), lets a user describe their mission
              and adapts from the nearest preset.
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
              "Crop area change against the 2022 baseline (−0.52M ha, −50.0% in 2024) with plain-language risk bounds",
              "What changed on the ground, how it was checked, and what the data cannot prove",
              "Olofsson error adjustment, the AA-CRC cutoff τ, embedding uncertainty",
            ],
            [
              "Language",
              "Authoritative, concise, policy-oriented",
              "Everyday words; no τ, strata or variance",
              "Rigorous, technical, statistical",
            ],
            [
              "Drawer density",
              "Telemetry folded under Technical details; executive brief export",
              "Folded as Model settings; actions lead to the before/after comparison",
              "Pipeline telemetry open by default",
            ],
          ]}
        />

        <Figure
          src="/tgi/02-workspace-persona.webp"
          alt="The Workspace persona panel with three preset cards and a Custom role input"
          caption="The Workspace persona panel: three preset cards and the Custom role (auto-tune) input."
          width={2000}
          height={1250}
        />

        {/* ══ 4. BENCHMARK ══ */}
        <Prose>
          <H2 id="benchmark">From black box to calibrated audit</H2>
          <div className="mt-8 space-y-6">
            <P>
              The competitive set ran from text-only agents to imagery-rich research assistants. None
              attached an interval to its number, and none would decline to answer.
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
              "50 reference sample pins with coordinates, Admin-2 filter",
            ],
            [
              "Calibration",
              "None",
              "Raw pixel counting; self-described order-of-magnitude estimate",
              "AA-CRC cutoff τ plus the Olofsson stratified estimator",
            ],
            [
              "Failure handling",
              "Repeated “Failed to load preview” errors",
              "Disclaimers disavow accuracy",
              "Explicit abstention above the ±35% limit; intentional human override",
            ],
          ]}
        />

        <Figure
          src="/tgi/fig-4-1-planet-basic-ux-failure.webp"
          alt="Planet’s assistant showing an error message beside a toast that says Deep Research is done"
          caption="Asked about agricultural decline in Sudan, Planet’s assistant failed with “Something went wrong” while a toast still read “Deep Research is done”, and its Gezira comparison carried no area figure, interval or uncertainty. Two contradictory states on one screen are the fragility this workbench designs against."
          width={921}
          height={527}
        />

        <Figure
          size="compact"
          src="/tgi/fig-4-2-olmoearth-explorer-panel.webp"
          alt="The OlmoEarth Embeddings Explorer control panel"
          caption="The predecessor: Ai2’s OlmoEarth Embeddings Explorer exposes embedding width, PCA modes and similarity search, but no calibrated area estimate, confidence interval or abstention."
          width={720}
          height={946}
        />

        {/* ══ 5. ITERATIONS ══ */}
        <Prose>
          <H2 id="iterations">0 to 1 in four iterations</H2>

          <div className="mt-10 space-y-6">
            <H3>Iteration 1: the multi-card analytical grid</H3>
            <P>
              The first notebook sketch put the inputs in a left column beside a grid of equal boxes:
              the UMD estimate, the GLAD pixel count, a small map with a telemetry log, and an AI chat
              strip. The map carried the same weight as a number card, so the reference points an
              analyst has to inspect were trapped in one box. The sketch already noted that the chat
              should act on the map, not only answer.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: "/tgi/figure-5-1-low-fid-paper-v1.webp",
              alt: "Notebook sketch of a four-box layout",
              caption: "Iteration 1: the 4-box layout, Olofsson vs GLAD, and “AI chat should be agentic enough to do tasks, not just answer”.",
              width: 1024,
              height: 768,
            },
            {
              src: "/tgi/figure-5-2-low-fid-paper-v2.webp",
              alt: "Notebook sketch of a full-bleed map with inputs across the top",
              caption: "Iteration 2 opens with “Map was too small in V1” and the note that journalists can’t read ML language.",
              width: 1024,
              height: 768,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Iteration 2: map-centric canvas with floating pills</H3>
            <P>
              The map became the whole canvas, inputs moved to a row across the top, and a GIS toolkit
              (scale, length and area measurement) let analysts measure fields directly. The same page
              produced the note that became the Persona Engine. In the build, though, the floating
              controls fought: the two bottom pills collided, a 9999px container wrapped 8px inputs,
              and a static Run button clashed with auto-updating parameters.
            </P>
          </div>

          <div className="mt-16 space-y-6">
            <H3>Iteration 3: one command bar, one intentional GIS workbench</H3>
            <P>
              The monochrome wireframe below is the blueprint the shipped product grew from: one command
              strip read left to right (Where → When → What → Status), a map that owns the canvas, and a
              right-hand column for the decision, its warning and its evidence.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/figure-5-3-raw-4-unified-command-bar.webp"
          alt="Monochrome wireframe with a single command bar, full map and right-hand decision column"
          caption="The Iteration 3 wireframe: floating pill collisions resolved into one consolidated command bar with 8px radii and right-hand decision scaffolding."
          width={1440}
          height={900}
        />

        <Prose>
          <Points
            items={[
              {
                lead: "Unified command bar.",
                body: "Region, Admin-2 sub-districts, year, an inline month timeline, phenology stages and the query in one 42px row. The end slot holds Run only while the scope has changed; otherwise it reads ✓ In sync.",
              },
              {
                lead: "Vertical map toolbar.",
                body: "Basemap (Light 2D / Satellite), distance measurement, parcel hectare calculation and recentring, docked right.",
              },
              {
                lead: "Multi-season audit.",
                body: "2022 vs 2024 (−0.52M ha, −50.0%) with Sentinel-2 cloudless composite chips in a split swipe or side by side.",
              },
              {
                lead: "Intentional override.",
                body: "Model labels stay read-only until the user chooses “Do you think this is incorrect? Override to refine the estimator”.",
              },
              {
                lead: "Explicit abstention.",
                body: "The 2023 conflict-onset season abstains because its 95% interval (about ±50%) exceeds the ±35% reporting limit.",
              },
            ]}
          />
        </Prose>

        <Figure
          src="/tgi/03-unified-command-bar.webp"
          alt="The single-row command bar with September selected and the In sync status"
          caption="The single-row command bar with September selected in the month timeline and the ✓ In sync status."
          width={2000}
          height={105}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/04-multi-season-compare.webp",
              alt: "Multi-season comparative audit drawer",
              caption: "2022 baseline 1.04M ha ± 0.21M against 2024 at 0.52M ha ± 0.14M. Consistent with displacement after April 2023; attributing cause needs field reporting.",
              width: 760,
              height: 1800,
            },
            {
              src: "/tgi/06-abstention-2023.webp",
              alt: "The decision drawer in the Estimate abstained state",
              caption: "2023 abstains: the interval spans ±50% of the estimate, so the GLAD pixel count is shown for context only.",
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
              caption: "Visual verification for SD22-007: a split swipe between 2022 and 2024 Sentinel-2 cloudless annual composites (EOX).",
              width: 760,
              height: 1800,
            },
            {
              src: "/tgi/05-sample-card-sd22-020.webp",
              alt: "Inspection card for reference sample SD22-020",
              caption: "Sample SD22-020: coordinates, date, ASU and WashU provenance tags, model label vs ground reference, Ask AI and the override link.",
              width: 800,
              height: 1400,
            },
          ]}
        />

        {/* ══ ITERATION 4 ══ */}
        <Prose>
          <div className="space-y-6">
            <H3>Iteration 4: the stakeholder round (15 to 18 Sep 2026)</H3>
            <P>
              After the Milestone 1 walkthrough, Ana sent six notes. Two were keeps: the location and
              Admin-2 dropdowns, and relabelling a sample from the map. Four became changes, all built
              and verified on 18 Sep ahead of the Friday walkthrough.
            </P>
          </div>
        </Prose>

        <DataTable
          head={["Feedback", "Design decision", "What shipped"]}
          rows={[
            [
              "The project doesn’t use the AA-CRC risk controller; uncertainty should be shared, not set",
              "Replace a control with a read-only summary",
              "An Uncertainty card: query, crop labels (22 of 50) and a low / medium / high bar (23, 16, 11). The τ slider and risk barcode are gone.",
            ],
            [
              "No data for planted fields or sorghum in Sudan",
              "Scope the query to what the data supports",
              "The query is locked to cropland, with a lock and the reason on hover.",
            ],
            [
              "Collect Earth Online (CEO) uploads would be useful",
              "Show the ingestion path, then make it real",
              "Upload reference samples (CEO): first an explained placeholder, then live parsing.",
            ],
            [
              "Export PDF didn’t really work",
              "Diagnose before restyling",
              "The brief printed from inside a modal dialog, which the browser pins to the top layer. It now prints a dedicated sheet at paper width.",
            ],
          ]}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/10-uncertainty-card.webp",
              alt: "Read-only Uncertainty card",
              caption: "Why a card, not a control: a slider invites tuning the number until it looks right. Nothing on this card can be set.",
              width: 710,
              height: 616,
            },
            {
              src: "/tgi/15-ceo-uncertainty.webp",
              alt: "Uncertainty card after a CEO upload",
              caption: "After a CEO upload: 29 of 70 crop labels, with a neutral CEO reference share. Counts sit beside the bar so colour is never the only signal.",
              width: 710,
              height: 688,
            },
          ]}
        />

        <Figure
          src="/tgi/11-query-locked.webp"
          alt="Command bar with the query field showing cropland and a small lock"
          caption="The query locked to cropland: a small lock replaces the suggestions caret, and hovering it gives the reason."
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
                  body: "Drop a file, choose one, or load a one-click sample of 20 illustrative Al Jazirah points (12 cropland, 8 non-cropland).",
                },
                {
                  lead: "Forgiving column mapping.",
                  body: "lon/lat, longitude/latitude or a GeoJSON point; Cropland, Crop, Yes or 1 count as crop; the season comes from collection_time.",
                },
                {
                  lead: "Immediate recalculation.",
                  body: "The Olofsson estimate, interval, pins and Uncertainty card recompute at once. The sample moves 2024 from 0.52M ± 0.14M ha to 0.70M ± 0.24M ha across 70 samples.",
                },
                {
                  lead: "Honest numbers.",
                  body: "CEO points are human labels with no model score, so they stay out of the τ calibration. Each borrows the GLAD stratum of the nearest precomputed sample, and the card says so. Nothing leaves the browser.",
                },
              ]}
            />
          </div>
        </Prose>

        <Figure
          src="/tgi/13-ceo-workspace.webp"
          alt="Workbench on the 2024 season with 70 pins after a CEO upload"
          caption="The 2024 season with 70 pins: the 20 CEO points carry a dark ring and their own legend row, and the estimate reads 0.70M ha ± 0.24M."
          width={2000}
          height={1250}
        />

        <Figure
          size="compact"
          src="/tgi/14-ceo-sample-card-redacted.webp"
          alt="Map card for CEO-1002 with a CEO reference chip and the CEO label Non-Cropland"
          caption="A CEO sample card: the CEO reference chip, the GLAD stratum stand-in note, and the label marked as not scored by the model."
          width={672}
          height={1196}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/12-ceo-upload-loaded.webp",
              alt: "CEO upload dialog with a green confirmation",
              caption: "Success says what was loaded and where it went.",
              width: 1119,
              height: 1045,
            },
            {
              src: "/tgi/16-ceo-upload-error.webp",
              alt: "CEO upload dialog with a red error banner",
              caption: "Failure says why nothing was loaded and what was expected.",
              width: 1119,
              height: 887,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Export PDF: diagnose before restyling</H3>
            <P>
              A modal dialog sits in the browser’s top layer, which forces its positioning, so the page
              height collapsed and the PDF was clipped to one screen or came out blank. Export now
              prints a dedicated copy of the brief outside the dialog: print styles hide the workspace,
              flow the brief at A4 or Letter width and keep cards from splitting. Checked on a one-page
              brief, a two-page stress test, a phone-width screen and a second press.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/tgi/17-export-pdf-page.webp"
          alt="Exported FEWS NET in-season food security briefing on a Letter page"
          caption="The exported brief: 1.04M ha error-adjusted crop area, strategic context, samples to verify with Sentinel-2 chips, and the methodological integrity checks."
          width={935}
          height={1210}
        />

        {/* ══ 6. DESIGN SYSTEM ══ */}
        <Prose>
          <H2 id="system">A design system tuned for numbers people act on</H2>
          <div className="mt-8 space-y-6">
            <P>
              The palette is a warm sand canvas with institutional accents: Xylem Leaf for confident
              signal, UMD Precision Crimson for the Precision Trap, Academic Gold for uncertainty, ASU
              Maroon and WashU Purple for provenance. Every text and background pair is checked for WCAG
              AA in both themes by the token build.
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
          caption="Audit finding: --error reaches only 4.43:1 on the sand canvas, so crimson body text stays on white cards (4.83:1) or runs at large-text size."
        />

        <Figure
          src="/tgi/card-bright-pair-matrix.webp"
          alt="Bright-pair token matrix with measured WCAG ratios"
          caption="Bright-pair matrix: each institutional hue as a container fill with a label tuned to pass on it. Base crimson and amber fail as body text on their own tints, so each family ships a darker label token."
          width={2000}
          height={1218}
        />

        <Prose>
          <div className="space-y-6">
            <H3>A warm sand surface ladder</H3>
            <P>
              Five surfaces, ordered by CIE L*: the segmented-control groove at 92.8, the left rail at
              93.5, hover at 94.9, the canvas at 96.6 and white cards at 100. The token build enforces
              that the structural ladder rises strictly in every theme, and that hover sits at least 2.0
              L* below a white card.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/card-surface-ladder.webp"
          alt="Five warm sand surfaces plotted by L* lightness"
          caption="The warm sand surface ladder: five shipped surfaces with their L* and ΔL*, plotted on an L* 90 to 100 scale."
          width={2000}
          height={1320}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Tabular figures, never monospace</H3>
            <P>
              Iteration 1 set figures in terminal monospace, and the drawer read like a log dump.
              Proportional digits fix the rhythm but jitter as live counts update. The shipped answer
              is IBM Plex Sans with <Code>tabular-nums</Code>: proportional letterforms, fixed numeric
              advance, so 1.04M → 0.52M changes without the column moving.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/gov-6-2-tabular-figures.webp"
          alt="The same four figures set in monospace, proportional digits and tabular figures"
          caption="Numerals set three ways: monospace (before), proportional digits (the risk) and IBM Plex Sans tabular figures (shipped)."
          width={2000}
          height={890}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Ask vs Do: intent signalled by anatomy before colour</H3>
            <P>
              Ask chips carry a leading sparkle on a faint leaf tint and only put a question to the
              Co-Pilot. Do chips carry a trailing arrow on a neutral container and change the workspace
              now: fly to a sample, relabel it, switch season, open the comparison or the briefing.
              Same shape and type; the glyph position tells them apart.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/card-ask-do-chips.webp"
          alt="Ask and Do chip specifications"
          caption="Ask chip label at 8.41:1, Do chip label at 15.39:1; both 12px / 500, 4px 10px padding, 9999px radius."
          width={2000}
          height={962}
        />

        <FigureRow
          items={[
            {
              src: "/tgi/m-chip-ask-card.webp",
              alt: "An Ask chip inside the Precision Trap card",
              caption: "An Ask chip inside the Precision Trap card: the question stays attached to the figure it explains.",
              width: 710,
              height: 336,
            },
            {
              src: "/tgi/m-copilot-chips.webp",
              alt: "The open Co-Pilot with Ask starter chips above a Do chip",
              caption: "The open Co-Pilot: Ask starter chips above a Do chip (Audit false positive sample SD22-018 →).",
              width: 1064,
              height: 704,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Compare is a switch, not a segmented control</H3>
            <P>
              A segmented control implies several peer categories; a switch engages one mode over the
              canvas. Compare is that kind of mode, so it is a 28 × 16px track with a 12px thumb, bound
              to <Code>role=&quot;switch&quot;</Code> and <Code>aria-checked</Code>. The design system
              gates allow the switch role on this component only.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/gov-6-4-compare-toggle.webp"
          alt="The Compare toggle inactive and active in the decision drawer header"
          caption="Compare off and on: the off track sits at 3:1 against the drawer, the on track fills Xylem Leaf and the drawer becomes the multi-season audit."
          width={2000}
          height={1112}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Ambient motion instead of spinners</H3>
            <P>
              While a run or the Co-Pilot works, the command bar’s border and glow drift from Xylem Leaf
              to Academic Gold and back every 3 seconds, and the status reads “Calibrating estimate…”.
              Only opacity, border colour and glow animate, nothing scales inside a clipped container,
              and every ambient animation pauses under <Code>prefers-reduced-motion</Code>.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/gov-6-5-ambient-aura.webp"
          alt="Command bar at rest and at the amber peak of its breathing cycle"
          caption="The aura at rest with ✓ In sync, and mid-run at its amber peak while the estimate calibrates."
          width={2000}
          height={1270}
        />

        <Figure
          src="/tgi/gov-6-6-command-bar-anatomy.webp"
          alt="Measured anatomy of the command bar"
          caption="Command bar anatomy at 1920px: an 8px outer radius shared with its direct controls, stepping to 6px and 4px for nested pieces, all on one 28px centre line."
          width={2000}
          height={717}
        />

        <StateStrips
          caption="Command bar states from the running prototype. In the breathing state the border was sampled at rgba(214, 119, 7, 0.45) at the amber swing."
          items={[
            {
              label: "Default",
              src: "/tgi/m-bar-default.webp",
              alt: "Command bar at rest with every item on one 28px centre line and In sync at the end",
              width: 2000,
              height: 99,
            },
            {
              label: "Hover",
              src: "/tgi/m-bar-hover-trigger.webp",
              alt: "Command bar with the Stages trigger filled on hover",
              width: 2000,
              height: 99,
            },
            {
              label: "Active month",
              src: "/tgi/m-bar-active-month.webp",
              alt: "Command bar with September selected and June showing the pill hover",
              width: 2000,
              height: 99,
            },
            {
              label: "Scope changed",
              src: "/tgi/m-bar-run.webp",
              alt: "Command bar where an edited query replaces In sync with Run and explains why",
              width: 2000,
              height: 168,
            },
            {
              label: "Working",
              src: "/tgi/m-bar-breathing.webp",
              alt: "Command bar at the amber swing of its aura with Calibrating estimate in the status pill",
              width: 2000,
              height: 133,
            },
          ]}
        />

        <FigureTrio
          items={[
            {
              src: "/tgi/07a-search-samples.webp",
              alt: "Search samples panel listing reference samples by ID",
              caption: "Search samples: find any of the 50 reference samples by ID and fly to it.",
              width: 856,
              height: 1800,
            },
            {
              src: "/tgi/07b-datasets.webp",
              alt: "Datasets panel listing reference annotations and external sources",
              caption: "Datasets: the provenance ledger for reference annotations and samples.",
              width: 856,
              height: 1800,
            },
            {
              src: "/tgi/07c-run-history.webp",
              alt: "Run history panel listing session runs including the 2023 abstention",
              caption: "Run history: every run in the session, including the 2023 abstention, restorable in one click.",
              width: 816,
              height: 1800,
            },
          ]}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Map pins that pass 3:1</H3>
            <P>
              The proposed emerald and grey pins measured 2.54:1 on white, under the WCAG 1.4.11 floor
              for meaningful graphics. The shipped pins pair a muted leaf fill (#4E8727, 4.36:1) with a
              darker stroke (7.69:1); high uncertainty adds an amber ring, an override a dashed ink ring.
            </P>
          </div>
        </Prose>

        <Figure
          src="/tgi/card-map-pins.webp"
          alt="Reference sample pin states with legend and tokens"
          caption="Crop, non-crop, uncertain ring and dashed override, captured after overriding SD22-018 (21 of 50 labelled crop, 1 overridden)."
          width={2000}
          height={1122}
        />

        <Figure
          size="compact"
          src="/tgi/m-legend.webp"
          alt="Map legend showing crop, non-crop, high uncertainty and overridden states"
          caption="The map legend, with the running count of crop labels and overrides."
          width={492}
          height={374}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Overrides are a deliberate act</H3>
            <P>
              One stray click on a false positive moves the published figure by about 46,300 ha, so the
              label is read-only until the analyst asks to override it. Only then do Crop / Non-crop and
              Cancel appear. An override changes only that sample in the Olofsson estimate; the AA-CRC
              cutoff τ is computed from model scores against ground reference, which overrides never
              touch. Every figure traces back to either the calibrated model or a named analyst
              correction.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: "/tgi/m-override-step1.webp",
              alt: "Sample SD22-018 with a read-only label and the override question",
              caption: "Step 1: SD22-018 is a false positive (model Crop 0.70, reference Fallow / Non-crop). The label is read-only and the override sits behind an explicit question.",
              width: 704,
              height: 1352,
            },
            {
              src: "/tgi/m-override-step2.webp",
              alt: "Sample SD22-018 with the Crop and Non-crop choice and Cancel revealed",
              caption: "Step 2: after the analyst asks to override, Set the label reveals Crop / Non-crop with Cancel.",
              width: 704,
              height: 1464,
            },
          ]}
        />

        <Figure
          src="/tgi/card-override-sequence.webp"
          alt="Override on SD22-018 in three states"
          caption="SD22-018 read-only, unlocked, and applied: 46,300 ha out, estimate 1.04M → 0.99M ha, with Undo."
          width={2000}
          height={1158}
        />

        {/* ══ 7. AI2 ══ */}
        <Prose>
          <H2 id="ai2">Strategic alignment with Ai2’s “Agents for Earth”</H2>
          <div className="mt-8">
            <Points
              items={[
                {
                  lead: "The research-to-product gap.",
                  body: "Fragile standalone scripts (ASU embeddings, WashU encoders, UMD calculators) become one production-grade interface.",
                },
                {
                  lead: "The executive translation gap.",
                  body: "Decision-makers can’t read GeoTIFFs, so the workbench produces a 3-minute briefing with Sentinel-2 chips and error-adjusted bounds.",
                },
                {
                  lead: "Agentic guardrails.",
                  body: "A pre-flight temporal guard blocks future-date leakage, and conformal bounds plus explicit abstention replace hallucinated pixel counts.",
                },
              ]}
            />
          </div>
        </Prose>

        {/* ══ 8. OUTCOMES ══ */}
        <WideCallout label="Where it stands" items={OUTCOMES} />

        <Prose>
          <div className="space-y-6">
            <P>
              The static build is 1.3 MB with no keys and no proxy: every figure comes from precomputed
              scenarios, and on a static host the Co-Pilot falls back to a labelled scripted planner.
              Try it at <ExtLink href={LIVE_URL}>tgi-gifs-ui.vercel.app ↗</ExtLink>.
            </P>
            <p className="text-[14px] leading-[22px] text-neutral-400">
              Scope notes: scenarios are precomputed and the 50 reference samples per season are
              illustrative stand-ins, evaluated at state level. Bounds are described as error-adjusted,
              not certified. The 2024 vs 2022 change is consistent with displacement after the April
              2023 conflict; the figures alone do not prove cause.
            </p>
          </div>
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
