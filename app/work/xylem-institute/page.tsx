"use client";

import { useEffect } from "react";
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
   Xylem AutoPilot: the operational pipeline behind the AGRA / COMESA
   Regional Food Balance Sheet (RFBS) bulletins.
   Same editorial language as the TGI workbench: 720px prose measure,
   960px breakout for media and tables, no cards beyond the stat grids.

   Sources: the Nairobi training decks (Kenya training, Wednesday
   session, Manual and Autopilot pipeline walkthroughs), the v13 Colab
   notebook and its change log, the AIM Symposium poster, and the two
   Xylem Lab policy briefs. Figures quoted here are the ones those
   documents state; nothing is extrapolated.

   Collaborators are referred to by role, as on the TGI page.
   Institutions and public programmes stay named.
   ══════════════════════════════════════════════════════════════ */

const IMG = "/xylem-autopilot";

const TRAINING_URL = "https://xylem-lab.github.io/agra_rfbs_training/kenya2026.html";

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

/** Section eyebrow: number and window, so the page reads as a log. */
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

/* ── Meta grid ──────────────────────────────────────────────────
   The four facts a reader needs before anything else. Same tile
   anatomy as the impact grid below, two by two. */

const META = [
  {
    label: "Role",
    value: "Lead Product Designer & Pipeline Architect",
    note: "Pipeline architecture, the bulletin’s information design, the Colab operator UI, and the Nairobi training programme. Xylem Lab, University of Maryland.",
  },
  {
    label: "Timeline",
    value: "2025 – 2026",
    note: "First automated bulletin December 2025. Deployed with partner analysts in Nairobi, March 2026.",
  },
  {
    label: "Partners",
    value: "AGRA · COMESA · NASA Harvest",
    note: "With UMD, the Rockefeller Foundation, the Gates Foundation and the UK FCDO, for the Regional Food Balance Sheet programme.",
  },
  {
    label: "Impact",
    value: "2–3 days → under 30 min",
    note: "Per-country bulletin production, about 25 hours of manual work end to end, now 20–30× faster. 20 analysts trained across 9 partner countries.",
  },
];

function MetaGrid() {
  return (
    <Wide className="my-12">
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
        {META.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5 p-6" style={{ background: CANVAS }}>
            <dt className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">
              {m.label}
            </dt>
            <dd className="text-[18px] font-semibold leading-snug tracking-tight text-white">
              {m.value}
            </dd>
            <dd className="text-[14px] leading-[22px] text-neutral-400">{m.note}</dd>
          </div>
        ))}
      </dl>
    </Wide>
  );
}

/* ── Impact at a glance ─────────────────────────────────────────
   Stat tiles, not a chart: one headline number each, with its before
   value in words, so nothing depends on colour. */

const STATS = [
  {
    value: "20–30×",
    unit: "faster",
    label: "End-to-end bulletin cycle",
    note: "About 25 hours of manual work became about 2 hours of wall-clock time, most of it Earth Engine exporting in parallel.",
  },
  {
    value: "~20",
    unit: "min",
    label: "Active operator time",
    note: "Five notebook cells. The analyst uploads CSVs, picks a month and downloads a ZIP; the rest runs server-side.",
  },
  {
    value: "50+",
    unit: "maps",
    label: "Styled per bulletin, now automatically",
    note: "Each one used to take about 45 minutes in desktop QGIS, by the one person who knew the styling.",
  },
  {
    value: "21",
    unit: "CSVs",
    label: "6 countries · 3 crops",
    note: "Kenya, Tanzania, Uganda, Rwanda, Malawi and Zambia; maize, beans and rice; sub-national resolution with min–max ranges.",
  },
  {
    value: "20",
    unit: "analysts",
    label: "Trained from 9 countries",
    note: "Each generated a bulletin for their own country in Nairobi, in a browser, with nothing to install.",
  },
  {
    value: "$0.50–2",
    unit: "per run",
    label: "AI cost per full bulletin",
    note: "GPT-4.1-mini for narratives and map captions, plus embeddings. Every prompt and response is logged for audit.",
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
   Coarse on purpose: windows are as the source documents date them. */

const TIMELINE: { when: string; title: string; body: string; href?: string }[] = [
  {
    when: "Nov 2025",
    title: "The last manual bulletin",
    body: "50 maps styled one at a time in QGIS for the November cycle. The bottleneck, measured.",
    href: "#gap",
  },
  {
    when: "Dec 2025",
    title: "First AutoPilot bulletin",
    body: "Cell 3 generates every map in matplotlib; v10 adds gray No Data fills and Tanzania season shading.",
    href: "#pipeline",
  },
  {
    when: "Feb 2026",
    title: "Full in-season run",
    body: "All six countries in one pass: the yield anomaly output shown on the AIM Symposium poster.",
    href: "#ergonomics",
  },
  {
    when: "Mar 2026",
    title: "Nairobi deployment",
    body: "20 analysts from 9 countries run the pipeline live at the RFBS capacity-building workshop.",
    href: "#nairobi",
  },
  {
    when: "Spring 2026",
    title: "v11–v13 and the policy briefs",
    body: "Regional drill-down maps, the analyst accordion, a Positron basemap; two briefs on automation and data gaps.",
    href: "#briefs",
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
              className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#7DB044] md:-left-[37px]"
            />
            <div className="grid grid-cols-1 gap-1 md:grid-cols-[150px_1fr] md:gap-6">
              <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">{t.when}</p>
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

/* ── Five-stage pipeline ────────────────────────────────────────
   A rail rather than a flowchart: each stage is one row with what it
   takes in, what it guarantees, and the concrete settings behind it.
   The spec chips are plain text, so the list reads without colour. */

const STAGES: {
  n: string;
  title: string;
  guarantee: string;
  body: React.ReactNode;
  specs: string[];
}[] = [
  {
    n: "01",
    title: "Ingestion & validation",
    guarantee: "Nothing malformed reaches a map.",
    body: "Each uploaded CSV is parsed from its filename into country, crop, season, month and year. Region names are normalised, records classified, and the orchestrator fails fast with a named error if a requested country or crop is absent rather than rendering an empty chapter.",
    specs: ["21 CSVs per cycle", "Filename → metadata", "Fail-fast ValueError", "Stale data cleared every run"],
  },
  {
    n: "02",
    title: "Season-gating & crop calendar engine",
    guarantee: "Only in-season crops are reported.",
    body: "A month-by-month CROP_CALENDAR decides which country-season pairs are assessable and skips post-harvest files. Tanzania runs two seasons at once over different regions, so the engine routes each region to Msimu (17 Southern Highland regions) or Vuli (8 coastal and northern regions) and shades the other set blue with a “Different Season” label.",
    specs: ["Smart / Custom / All modes", "Msimu 17 · Vuli 8", "GAUL name mapping", "Post-harvest auto-skip"],
  },
  {
    n: "03",
    title: "Server-side GEE & cartographic engine",
    guarantee: "Every map is styled identically, by code.",
    body: "Google Earth Engine joins yield values onto FAO GAUL 2024 Level-1 boundaries, multiplies by the GLAD cropland mask so only farmland carries colour, and exports yield and anomaly GeoTIFFs at 500 m. matplotlib then styles each one: a yellow-to-green yield ramp, a red-to-green diverging anomaly ramp, overlap-free labels, a scale bar, and a CartoDB Positron basemap with minimal labels.",
    specs: ["500 m GeoTIFF", "GAUL 2024 L1", "GLAD cropland mask", "CartoDB Positron"],
  },
  {
    n: "04",
    title: "Grounded RAG narrative engine",
    guarantee: "Words from history, numbers from this month.",
    body: "PyMuPDF extracts 164 pages from past AGRA bulletins into a FAISS index of 1,536-dimension embeddings. For each country the engine retrieves the eight closest passages, filtered by country with an unfiltered fallback, and GPT-4.1-mini writes structured JSON: calendar, crop conditions, production forecast. GPT Vision captions every map. The prompt forbids any figure that is not in the current CSV.",
    specs: ["164 pages · FAISS", "Top-8 retrieval", "GPT-4.1-mini JSON", "Vision map captions"],
  },
  {
    n: "05",
    title: "Interactive bulletin compilation",
    guarantee: "One self-contained file a ministry can open offline.",
    body: "A 41 KB Jinja2 template receives the comparison table, narratives, charts and maps and renders a four-tab HTML bulletin with D3.js regional charts. Cell 5 packages the bulletin, maps, CSVs and the full GPT log into a timestamped ZIP that needs no internet once downloaded.",
    specs: ["4-tab HTML", "D3.js interactive charts", "Offline-first ZIP", "logs.txt audit trail"],
  },
];

function StageRail() {
  return (
    <Wide className="my-14">
      <ol className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {STAGES.map((s) => (
          <li
            key={s.n}
            className="grid grid-cols-1 gap-3 py-8 md:grid-cols-[180px_1fr] md:gap-10"
          >
            <div>
              <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">
                Stage {s.n}
              </p>
              <p className="mt-2 text-[14px] font-medium leading-[20px] text-[#9BC66B]">
                {s.guarantee}
              </p>
            </div>
            <div className="space-y-3">
              <H3>{s.title}</H3>
              <p className="text-[16px] leading-[26px] text-neutral-300">{s.body}</p>
              <ul className="flex flex-wrap gap-2 pt-1">
                {s.specs.map((sp) => (
                  <li
                    key={sp}
                    className="rounded border border-white/[0.12] px-2 py-0.5 text-[12px] tabular-nums text-neutral-300"
                  >
                    {sp}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Wide>
  );
}

/* ── Three readers, three depths ────────────────────────────────
   Progressive disclosure is a property of the bulletin's tabs, so
   each column names the tab, the reading time and the one question
   that reader brings to it. */

const AUDIENCES = [
  {
    tier: "Senior ministry official",
    tab: "Executive Summary",
    time: "~5 min",
    hue: "#7DB044",
    question: "Is this a normal season, and is any country-crop pair concerning?",
    gets: "UMD vs USDA vs FAO comparison table, a 120–180 word policy narrative and an all-sources chart.",
  },
  {
    tier: "Regional director",
    tab: "Country tabs",
    time: "~15 min",
    hue: "#D4A373",
    question: "Which districts in my region need follow-up this month?",
    gets: "Crop calendar, condition badges per region, magnitude-grouped production charts with min–max whiskers.",
  },
  {
    tier: "Field analyst",
    tab: "Drill-down & data",
    time: "Open-ended",
    hue: "#9DB8D9",
    question: "What are the production scenarios for my food balance model?",
    gets: "Collapsible regional accordions, zoomed drill-down maps, the full data table and a raw CSV export.",
  },
];

function AudienceLadder() {
  return (
    <Wide className="my-12">
      <ol className="grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-8 md:grid-cols-3">
        {AUDIENCES.map((a, i) => (
          <li key={a.tier} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.hue }} />
              <span className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">
                Depth {i + 1} · {a.time}
              </span>
            </div>
            <H3>{a.tier}</H3>
            <p className="text-[14px] font-medium leading-[20px] text-neutral-200">{a.tab}</p>
            <blockquote className="border-l-2 border-[#D97352] pl-3 text-[14px] italic leading-[22px] text-neutral-200">
              “{a.question}”
            </blockquote>
            <p className="text-[14px] leading-[22px] text-neutral-400">{a.gets}</p>
          </li>
        ))}
      </ol>
    </Wide>
  );
}

/** Condition badge as shipped in the bulletin: dot plus word, never dot alone. */
const Badge = ({ hue, children }: { hue: string; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 whitespace-nowrap font-semibold text-white">
    <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hue }} />
    {children}
  </span>
);

export default function XylemAutoPilotPage() {
  return (
    <PasswordGate
      password="nairobi2025"
      storageKey="xylem-unlocked"
      projectName="Xylem AutoPilot"
    >
      <XylemAutoPilot />
    </PasswordGate>
  );
}

function XylemAutoPilot() {
  /* Content mounts only after the gate unlocks, by which point the
     browser has given up on any #hash. Scroll to it once on mount. */
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: CANVAS }}>
      <Header surface="dark" />

      <article className="pb-28 pt-28">
        {/* ══ HERO ══ */}
        <Prose>
          <nav aria-label="Breadcrumb">
            <Link
              href="/#work"
              className="font-mono text-[12px] uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
            >
              ← Case Studies / NASA Harvest · Xylem Lab
            </Link>
          </nav>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            Xylem AutoPilot: operationalizing GeoAI and satellite telemetry for regional food
            security
          </h1>

          <p className="mt-3 max-w-[720px] text-[14px] font-normal leading-[22px] text-neutral-400">
            Translating multi-sensor satellite ensembles and RAG-driven intelligence into automated,
            policy-ready bulletins across six African nations. Designed and built at the Xylem Lab,
            University of Maryland, for the AGRA and COMESA Regional Food Balance Sheet (RFBS)
            programme.
          </p>
        </Prose>

        <MetaGrid />

        <Figure
          src={`${IMG}/01-nairobi-live-demo.webp`}
          alt="Presenting the AutoPilot pipeline at a lectern to partner analysts, with the Colab notebook on a large screen"
          caption="Nairobi, March 2026: walking partner analysts through the pipeline before they ran it themselves. By the end of the session each had generated a bulletin for their own country."
          width={2000}
          height={1334}
          priority
        />

        {/* ══ IMPACT ══ */}
        <Prose>
          <H2 id="impact">Impact at a glance</H2>
          <div className="mt-6">
            <P>
              Taken from the training decks, the workshop record and the policy briefs. What the
              pipeline still cannot do is listed at the{" "}
              <a href="#limits" className={EXT_LINK}>
                end
              </a>
              .
            </P>
          </div>
        </Prose>

        <StatGrid />

        {/* ══ TIMELINE ══ */}
        <Prose>
          <H2 id="timeline">Timeline</H2>
        </Prose>

        <Timeline />

        {/* ══ 1. SYSTEM GAP ══ */}
        <Prose>
          <Kicker>01 · The system gap · before Dec 2025</Kicker>
          <H2 id="gap">The three-day manual bottleneck</H2>
          <div className="mt-8 space-y-6">
            <P>
              Every month the lab’s yield ensemble produces region-level forecasts for six countries.
              It fuses six satellite signals (MODIS NDVI, CHIRPS rainfall, ERA5-Land temperature and
              evapotranspiration, SMAP soil moisture and the Evaporative Stress Index) through
              XGBoost, CatBoost and Random Forest. The forecasts were good. Getting them in front of a
              ministry took two to three analyst days per country.
            </P>
            <P>
              FAOSTAT, the global benchmark, is 84% imputed for Africa and updated once a year.
              The RFBS bulletin exists to beat that by months. A bulletin that arrives three days
              late, with national averages only, gives most of that lead time back.
            </P>
          </div>
        </Prose>

        <WideCallout
          label="Where the three days went"
          items={[
            {
              lead: "Manual data choreography.",
              body: "21 prediction CSVs a cycle, one per country × season × crop across Kenya, Tanzania, Uganda, Rwanda, Malawi and Zambia, for maize, beans and rice. Each was moved, renamed and checked by hand.",
            },
            {
              lead: "Cartographic friction.",
              body: "50+ maps styled one at a time in desktop QGIS at about 45 minutes each: colour ramps, boundaries, hand-placed labels, export at 300 DPI. A strict filename schema meant one lowercase letter left an empty slot in the bulletin, and the styling knowledge lived with one person.",
            },
            {
              lead: "Reporting latency.",
              body: "Analysts copied numbers from spreadsheets into Word. Decision-makers got last month’s data three days late, with no sub-national detail and a single point estimate with no uncertainty range.",
            },
          ]}
        />

        <FigureRow
          items={[
            {
              src: `${IMG}/02-qgis-manual-styling.webp`,
              alt: "QGIS desktop with a Kenya yield raster, colour ramp legend and hand-positioned county labels",
              caption: "The manual path: a Kenya yield raster in QGIS, with each county label positioned by hand. A careful workflow, inherited from the previous team, that could not scale past one operator.",
              width: 2000,
              height: 1126,
            },
            {
              src: `${IMG}/03-fifty-maps-november.webp`,
              alt: "A file browser showing about fifty yield and anomaly map PNGs for the November cycle",
              caption: "The November 2025 cycle: 50 maps, created one by one. Every new country or crop multiplied this folder.",
              width: 1676,
              height: 1324,
            },
          ]}
        />

        <DataTable
          rowHeaders
          head={["Failure mode", "How it showed up", "Why it mattered"]}
          rows={[
            [
              "Fragile filename schema",
              <span key="f">
                <Code>Kenya_Maize_December_Yield.png</Code> works;{" "}
                <Code>kenya_maize_dec_yield.png</Code> silently does not
              </span>,
              "A missing map reads as a missing country, and nothing raised an error",
            ],
            [
              "Knowledge silo",
              "One person knew the QGIS styling",
              "If they were unavailable, the monthly bulletin was blocked",
            ],
            [
              "Drift",
              "Styling varied month to month with who did it and how rushed they were",
              "Maps from different months could not be compared by eye",
            ],
            [
              "No growth path",
              "A new country meant days more QGIS work; a new crop multiplied it",
              "The programme could not expand to more COMESA members",
            ],
          ]}
          caption="From the manual-pipeline walkthrough used to onboard the Nairobi cohort."
        />

        {/* ══ 2. ARCHITECTURE ══ */}
        <Prose>
          <Kicker>02 · Architectural UX · Dec 2025 → Mar 2026</Kicker>
          <H2 id="pipeline">A five-stage pipeline from satellite to policy</H2>
          <div className="mt-8 space-y-6">
            <P>
              I treated the pipeline itself as the product. Its users are a monthly operator who is
              not a GIS specialist and a ministry reader who will never see the code. Every stage had
              to guarantee one thing, so that a failure surfaced as a clear message to the operator
              instead of a misleading bulletin for the reader.
            </P>
          </div>
        </Prose>

        <Figure
          src={`${IMG}/04-integrated-pipeline-architecture.webp`}
          alt="Architecture diagram: the YieldWatch engine feeding CSVs into the AutoPilot CSV parser, crop calendar engine, GEE maps, FAISS-backed GPT-4.1-mini report engine, and the packaged HTML bulletin"
          caption="YieldWatch + AutoPilot as presented at the AIM Symposium. The top band is the forecasting model; the bottom band is the operational pipeline this case study covers."
          width={1376}
          height={768}
        />

        <StageRail />

        <Prose>
          <Note label="The rule that makes RAG safe here" tone="risk">
            Retrieved passages from past bulletins are there for vocabulary, tone and structure:
            how AGRA analysts describe a Watch region, not what the yield was. The prompt states
            that every number must come from this month’s CSV and never from retrieved context.
            Every prompt and response is written to <Code>logs.txt</Code>, so a wrong sentence can
            be traced to the data it was given. In practice, when the text was wrong, the CSV
            usually was too.
          </Note>

          <div className="mt-12 space-y-6">
            <H3>The operator surface: five cells, one decision each</H3>
            <P>
              The pipeline ships as a Colab notebook because Colab was the one environment every
              partner already had: a browser and a Google account. I cut it to five cells, each
              finishing with a check mark and a plain-language summary, so an operator always knows
              whether it is safe to run the next one.
            </P>
          </div>
        </Prose>

        <DataTable
          rowHeaders
          head={["Cell", "What the operator does", "What runs", "Time"]}
          rows={[
            ["1 · Setup", "Signs in to Earth Engine and Drive", "Installs geemap, rasterio, FAISS, Jinja2 and the rest", "~2 min"],
            ["2 · Config", "Picks month and filter mode", "Loads the crop calendar, season regions and GAUL name map", "~30 s"],
            ["3 · Maps", "Uploads this month’s CSVs", "Parallel GEE exports, TIF download, styled PNGs", "~1 min active, 30–40 min wait"],
            ["4 · Bulletin", "Pastes an API key once", "RAG retrieval, GPT narratives, Vision captions, Jinja2 render", "~10 min"],
            ["5 · Download", "Clicks download", "Timestamped ZIP to Drive and to the laptop", "~1 min"],
          ]}
          caption="Most of the wall-clock time is Earth Engine exporting server-side; the operator’s attention is needed for about a minute of it."
        />

        <Figure
          src={`${IMG}/05-colab-five-cell-notebook.webp`}
          alt="The AutoPilot Colab notebook with Cell 3 configuration fields for folders, month, filtering mode, Tanzania season override and custom country selection"
          caption="Cell 3’s form: folders, month, filtering mode and a Tanzania season override. Forms replaced editable code, so an operator never edits Python to change a month."
          width={2000}
          height={1082}
        />

        <Figure
          src={`${IMG}/06-parallel-exports-log.webp`}
          alt="Cell output listing Tanzania Msimu CSVs saved and parsed with region counts"
          caption="Cell 3’s first feedback: each upload echoed back with the country, season and region count it was parsed into, before any export starts."
          width={1586}
          height={165}
        />

        <DataTable
          rowHeaders
          head={["Aspect", "Manual process", "With AutoPilot"]}
          rows={[
            ["Total time", "~25 hours", "~2 hours, mostly GEE exporting"],
            ["Active operator time", "~25 hours of focused work", "~20 minutes"],
            ["Map styling", "45 min × 50+ maps in QGIS", "Automated in matplotlib"],
            ["Who can run it", "One person with GIS expertise", "Anyone on the team"],
            ["Filenames", "Typed by hand; typos break the bulletin", "Generated, guaranteed to match"],
            ["Tanzania seasons", "Tracked by memory", "Crop calendar decides"],
            ["No-data regions", "Blank: read as zero", "Gray fill with a “No Data” label"],
            ["Human review", "Required", "Still required: the AI drafts, people decide"],
          ]}
        />

        {/* ══ 3. DATA-DESIGN ERGONOMICS ══ */}
        <Prose>
          <Kicker>03 · Data-design ergonomics &amp; visual cognition</Kicker>
          <H2 id="ergonomics">Designing so a blank never reads as a zero</H2>
          <div className="mt-8 space-y-6">
            <P>
              The bulletin’s readers make import, storage and assistance decisions from it. The
              design question at every element was the same: what will a busy reader conclude in
              five seconds, and is it true?
            </P>

            <H3>Preventing change blindness: missing is not zero</H3>
            <P>
              Before v10, regions without a model prediction were simply left unpainted. On a
              choropleth an empty polygon reads as the lowest value, so a gap in satellite coverage
              looked like a failed harvest. They now render in a flat <Code>#E0E0E0</Code> gray
              with a “No Data” label and a legend entry. In Tanzania the other season’s regions get
              a distinct blue with “Different Season”, so in-season, out-of-season and unknown are
              three separate visual states, not one.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: `${IMG}/07-zambia-maize-yield.webp`,
              alt: "Zambia December 2025 maize yield prediction map on a light basemap, with province labels and a No Data legend swatch",
              caption: "Zambia, December 2025, maize yield: GLAD-masked so only cropland carries colour, labels placed by code, a No Data swatch in the legend.",
              width: 1400,
              height: 1615,
            },
            {
              src: `${IMG}/08-zambia-maize-anomaly.webp`,
              alt: "Zambia December 2025 maize yield anomaly map with a diverging red-to-green ramp",
              caption: "The same month as an anomaly against the long-term mean, on a diverging ramp: the map a regional director actually triages from.",
              width: 1400,
              height: 1615,
            },
          ]}
        />

        <Prose>
          <Note label="The same idea, in the charts" tone="warn">
            Tanzania does not report harvested area for beans. Production is yield × area, so a
            bean region with a positive anomaly still drew an empty bar. The bulletin and its
            reading guide now say outright that an empty bar is a national statistics gap, not a
            satellite failure, and the decision table turns it into an action: advocate for crop
            area surveys.
          </Note>

          <div className="mt-12 space-y-6">
            <H3>Progressive disclosure for three readers</H3>
            <P>
              Rather than three products, one bulletin with three depths. The tab order follows how
              far down the chain of command a reader sits, and each tab answers one question
              before offering the next level of detail.
            </P>
          </div>
        </Prose>

        <AudienceLadder />

        <FigureRow
          items={[
            {
              src: `${IMG}/12-bulletin-homepage.webp`,
              alt: "Bulletin header with partner logos and tabs for Overview, Executive Summary, each country and Appendix",
              caption: "The tab bar is the disclosure model. Only countries with an in-season crop appear, so a missing tab is itself information.",
              width: 1342,
              height: 1046,
            },
            {
              src: `${IMG}/11-bulletin-overview-tab.webp`,
              alt: "Bulletin overview tab with data limitations, a current focus notice, a note on excluded countries and the executive summary",
              caption: "The Overview states its own caveats first, including which countries are excluded this month and why (post-harvest), before any number.",
              width: 1126,
              height: 1356,
            },
          ]}
        />

        <DataTable
          rowHeaders
          head={["Source", "Area (M ha)", "Yield (MT/ha)", "Production (M MT)"]}
          rows={[
            ["USDA · survey-based, annual", "4.0", "1.75", "7.0"],
            ["FAO · national + field, lags 6–12 months", "4.2", "1.90", "8.0"],
            ["UMD · satellite + ML, monthly, sub-national", "2.08", "1.58", "2.14 – 4.19"],
          ]}
          caption="The Executive Summary table, Tanzania maize, December 2025. UMD measures satellite-confirmed cropland under cultivation; USDA and FAO report planned or registered area. The bulletin explains the gap rather than hiding it, and its reading guide says when the gap should trigger field verification."
        />

        <Figure
          size="prose"
          src={`${IMG}/13-umd-usda-fao-chart.webp`}
          alt="Grouped bar chart of production by country for USDA, FAO and UMD, with min–max whiskers on the UMD bars"
          caption="The all-sources chart. Only the UMD bar carries a whisker, because only UMD publishes a range; the toggles let a minister isolate one source."
          width={874}
          height={461}
        />

        <Prose>
          <div className="space-y-6">
            <H3>Making statistical uncertainty legible</H3>
            <P>
              A standard error of 0.133 MT/ha means nothing in a ministry. The pipeline turns it
              into two things a planner can act on: a min–max production whisker on every bar, and
              a condition badge with a named trigger. Regions are grouped into panels by magnitude,
              at most seven to a chart, so a 5,000 t coastal region is never flattened beside
              Tabora’s 364,000 t.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: `${IMG}/10-tanzania-production-whiskers.webp`,
              alt: "Bar chart of mean predicted production by Tanzanian region with min–max whiskers",
              caption: "Tanzania production, part 1 of 2: whisker length is the uncertainty. Tall means wait for next month; short means plan on it.",
              width: 1500,
              height: 900,
            },
            {
              src: `${IMG}/09-tanzania-crop-calendar.webp`,
              alt: "Tanzania agricultural calendar showing bimodal Vuli and Masika seasons above the unimodal Msimu season",
              caption: "Every country chapter opens on its crop calendar, because a December Msimu estimate is mid-season and inherently wider than an April one.",
              width: 838,
              height: 451,
            },
          ]}
        />

        <DataTable
          rowHeaders
          head={["Condition", "Yield anomaly", "Meaning", "Ministry trigger"]}
          rows={[
            [
              <Badge key="e" hue="#2E7D32">Exceptional</Badge>,
              "≥ +1.0 MT/ha",
              "Much better than average; grain-filling to harvest only",
              "Plan for surplus; open storage and export corridors",
            ],
            [
              <Badge key="f" hue="#7DB044">Favorable</Badge>,
              "Near zero or positive",
              "A normal season",
              "No intervention; monitor through harvest",
            ],
            [
              <Badge key="w" hue="#D4A373">Watch</Badge>,
              "0 to −0.09 MT/ha",
              "Near average but at risk; recovery possible",
              "Start monitoring; prepare contingency assistance",
            ],
            [
              <Badge key="p" hue="#F87171">Poor</Badge>,
              "< −0.09 MT/ha",
              "10–25% below average; limited recovery likely",
              "Activate early warning; target input and food support",
            ],
          ]}
          caption="Each badge is a word as well as a colour, and each maps to an action, so the regional table can be filtered straight to this month’s priorities."
        />

        <Prose>
          <div className="space-y-6">
            <H3>A five-step protocol, printed in the bulletin’s own guide</H3>
            <Points
              items={[
                { lead: "1 · Overview.", body: "Is my country in the tab bar this month? If not, its calendar has no assessable crop." },
                { lead: "2 · Executive Summary.", body: "Is UMD well below USDA and FAO? Flag for field verification. Is the range wider than 2× the mean? Treat as indicative only." },
                { lead: "3 · Country tab.", body: "Filter to Watch and Poor. Those regions are this month’s intervention list." },
                { lead: "4 · Production charts.", body: "Check the top-three breadbasket regions across every panel, not just Part 1. A shortfall there is a national signal." },
                { lead: "5 · CSV.", body: "Update the food balance sheet with Min for conservative planning and Mean for the central case. Never plan national imports from a single number." },
              ]}
            />
          </div>
        </Prose>

        {/* ══ 4. FIELD DEPLOYMENT ══ */}
        <Prose>
          <Kicker>04 · Field deployment · Mövenpick, Nairobi · March 2026</Kicker>
          <H2 id="nairobi">Twenty analysts, nine countries, a browser each</H2>
          <div className="mt-8 space-y-6">
            <P>
              At the RFBS capacity-building workshop, 20 analysts from 9 Eastern and Southern African
              countries ran the full pipeline on live data in Google Colab. Requirements were three
              credentials and zero installed software. Each analyst generated a bulletin for their
              own country in the room, which made the speed tangible to the ministry officials
              watching.
            </P>
            <P>
              I designed the training as three passes: a reading guide for the bulletin, a
              walkthrough of the manual pipeline so the automation was not a black box, then the
              hands-on run. The materials live on as a public{" "}
              <ExtLink href={TRAINING_URL}>training site ↗</ExtLink> for the next cohort.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: `${IMG}/15-nairobi-floor-support.webp`,
              alt: "Sketching the pipeline on a flip chart for workshop participants",
              caption: "Sketching the five stages on a flip chart before the hands-on run.",
              width: 2000,
              height: 2299,
            },
            {
              src: `${IMG}/14-analysts-generating-bulletins.webp`,
              alt: "Partner analysts at laptops generating country bulletins, with a facilitator assisting",
              caption: "Partner analysts generating country-specific bulletins. Photograph from Policy Brief 2.",
              width: 876,
              height: 257,
            },
          ]}
        />

        <WideCallout
          label="What live deployment found that testing did not"
          items={[
            {
              lead: "Boundary mismatches.",
              body: "Partners’ own region names did not always match FAO GAUL’s. The country-name map handled the known cases (Tanzania → United Republic of Tanzania); live data exposed the rest.",
            },
            {
              lead: "Seasonal edge cases.",
              body: "Calendar inconsistencies only appear when someone runs their own country in their own month, not the synthetic December case.",
            },
            {
              lead: "Crop classification gaps.",
              body: "Crops and areas missing from national statistics surfaced as empty bars and gray regions, in front of the people who could fix them.",
            },
            {
              lead: "The design lesson.",
              body: "Automation did not just save time; it moved data-quality problems to the start of the cycle, where they are cheap, instead of the end, where they reach a minister.",
            },
          ]}
        />

        <Prose>
          <Note label="On the speed-up figures">
            The training decks measure the whole cycle: about 25 hours down to about 2 hours, or
            20–30×. Policy Brief 2 measures per country, from 2–3 analyst days to under 30 minutes,
            and reports that as 85×; the AIM poster calls it a 99.7% cut in analyst time. They
            measure different spans. This page leads with the most conservative.
          </Note>

          <div id="briefs" className="mt-12 scroll-mt-28 space-y-6">
            <H3>Policy briefs: from a tool to an institution</H3>
            <P>
              The deployment fed two Xylem Lab policy briefs, written for RFBS member governments.
              The first argues that ground truth, not modelling, limits accuracy: the ensemble
              reaches 25.4% regional MAPE across six countries but 7.9% in Zambia, where sustained
              crop-cut investment exists. The second argues that automation only lasts if it has an
              owner: named operators, budgeted Earth Engine and API access, and a review protocol
              before anything is published.
            </P>
          </div>
        </Prose>

        <Figure
          src={`${IMG}/16-ground-truth-availability.webp`}
          alt="Heatmap of yield training data availability by country and crop from 1970 to 2025, dense for Kenya and Malawi and sparse for Rwanda and Uganda"
          caption="Policy Brief 1, Figure 1: yield training data available by country and crop, 1970–2025. The countries most exposed to food insecurity have the sparsest records and so the widest error bars."
          width={950}
          height={360}
        />

        <FigureRow
          items={[
            {
              src: `${IMG}/17-policy-brief-1-cover.webp`,
              alt: "Cover page of the policy brief on data gaps and the scalability of EO and ML tools",
              caption: "Brief 1: data gaps and the sustainability of EO and ML tools. Recommends standardised quality control, strategic data augmentation, centralised data frameworks and sustained field investment.",
              width: 1275,
              height: 1806,
            },
            {
              src: `${IMG}/18-policy-brief-2-cover.webp`,
              alt: "Cover page of the policy brief on automation of workflows and capacity implications",
              caption: "Brief 2: automation of workflows and capacity. Recommends recurring training, budgeted national infrastructure, explicit data stewardship and output review before distribution.",
              width: 1275,
              height: 1806,
            },
          ]}
        />

        {/* ══ 5. LIMITS & NEXT ══ */}
        <Prose>
          <Kicker>05 · Limits &amp; next</Kicker>
          <H2 id="limits">What AutoPilot does not solve</H2>
          <div className="mt-8 space-y-6">
            <P>
              The walkthrough I gave in Nairobi had a slide titled “Known challenges &amp;
              limitations”. It belongs here too.
            </P>
          </div>
        </Prose>

        <DataTable
          rowHeaders
          head={["Area", "Limitation", "Current mitigation"]}
          rows={[
            ["Earth Engine", "3–15 min per raster; shared projects queue under load", "Parallel exports, and each analyst uses their own GEE project"],
            ["AI narrative", "GPT can misread a trend or a colourbar", "Numbers only from CSV, full prompt logs, mandatory human review"],
            ["Data schema", "Case-sensitive CSV headers can fail silently", "Validation on load; clearer error messages are next on the roadmap"],
            ["Uncertainty", "High-error regions (Laikipia, SE 1.589) produce very wide ranges", "Shown as wide whiskers with a “treat as directional” rule"],
            ["Cartography", "No north arrow or hand label nudging; QGIS is still the print standard", "QGIS stays available for publication maps"],
            ["Operations", "Run by hand each month; outputs not versioned", "Archiving and scheduling are on the roadmap"],
          ]}
        />

        <Prose>
          <Points
            items={[
              {
                lead: "Near term.",
                body: "A shared Drive so the yield modeller’s CSVs land where anyone can run the cycle, more countries and crops, and versioned archives of every run.",
              },
              {
                lead: "Medium term.",
                body: "Local-language country sections (Swahili, French, Chichewa), WhatsApp summaries for farmers, and a scheduled monthly trigger.",
              },
              {
                lead: "The goal.",
                body: "Anyone on the team can produce a publication-quality bulletin without GIS expertise, and the review step stays human.",
              },
            ]}
          />
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
