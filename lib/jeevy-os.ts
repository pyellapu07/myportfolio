/**
 * Single source of truth for the Jeevy Industrial OS case study.
 * Consumed by the homepage featured card, the platform hub page,
 * and all six subsystem deep-dive pages.
 */

export interface JeevyEngine {
  /** Route segment under /work/jeevy-os */
  slug: string;
  /** 1-indexed display order */
  order: number;
  /** Full engine name */
  title: string;
  /** Single-line label for the compact homepage card grid */
  cardLabel: string;
  /** Compact label for breadcrumbs and nav rails */
  short: string;
  /** One-line summary shown under the link */
  subLabel: string;
  /** Metadata description for the subpage */
  description: string;
}

export const JEEVY_ENGINES: JeevyEngine[] = [
  {
    slug: "materials-procurement",
    cardLabel: "Materials Ledger",
    order: 1,
    title: "Materials & Procurement Ledger",
    short: "Materials & Procurement",
    subLabel:
      "Eliminating an $800k Google Sheet with a single-table JSONB ledger, $1k spend gates, and 4-step unit dock QC.",
    description:
      "How a single-table JSONB ledger, $1k spend gates, and 4-step unit dock QC replaced an $800k Google Sheet.",
  },
  {
    slug: "shop-kiosk-feedback",
    cardLabel: "Shop Kiosk",
    order: 2,
    title: "Shop-Floor Kiosk & Worker Feedback",
    short: "Shop-Floor Kiosk",
    subLabel:
      "Ephemeral 6-digit PIN identity, frozen break arithmetic, blocker notes, and 275-key zero-drift bilingual parity.",
    description:
      "Ephemeral 6-digit PIN identity, frozen break arithmetic, blocker notes, and 275-key zero-drift bilingual parity.",
  },
  {
    slug: "blueprint-cad-manager",
    cardLabel: "CAD Manager",
    order: 3,
    title: "Blueprint & CAD File Manager",
    short: "Blueprint & CAD",
    subLabel:
      "Sub-second 2D/3D browser drawing inspection, 3-gate security governance, and purging 2,457 lines of UI drift.",
    description:
      "Sub-second 2D/3D browser drawing inspection, 3-gate security governance, and purging 2,457 lines of UI drift.",
  },
  {
    slug: "industrial-design-system",
    cardLabel: "Design System",
    order: 4,
    title: "Industrial Design System (v1.0.0)",
    short: "Design System",
    subLabel:
      "101 semantic tokens, an anti-glare monotonic surface ladder, and a strict 44px glove-operable touch contract.",
    description:
      "101 semantic tokens, an anti-glare monotonic surface ladder, and a strict 44px glove-operable touch contract.",
  },
  {
    slug: "tasking-cpm-engine",
    cardLabel: "Gantt CPM",
    order: 5,
    title: "Tasking & Gantt CPM Engine",
    short: "Tasking & CPM",
    subLabel:
      "Critical path scheduling floored by supplier delivery ETAs, plus Available-to-Promise (ATP) inventory pooling.",
    description:
      "Critical path scheduling floored by supplier delivery ETAs, plus Available-to-Promise (ATP) inventory pooling.",
  },
  {
    slug: "deliverables-map-dashboard",
    cardLabel: "Deliverables Map",
    order: 6,
    title: "Deliverables Map & Project Dashboard",
    short: "Deliverables Map",
    subLabel:
      "Miro-style structural build breakdown, auto-linked milestones, and real-time Material Flow Sankey diagrams.",
    description:
      "Miro-style structural build breakdown, auto-linked milestones, and real-time Material Flow Sankey diagrams.",
  },
];

export const JEEVY_OS_ROOT = "/work/jeevy-os";

export function engineHref(slug: string) {
  return `${JEEVY_OS_ROOT}/${slug}`;
}

export function getEngine(slug: string) {
  return JEEVY_ENGINES.find((e) => e.slug === slug);
}

/** Adjacent engines for the bottom navigation rail (wraps at both ends). */
export function adjacentEngines(slug: string) {
  const i = JEEVY_ENGINES.findIndex((e) => e.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  const prev = i > 0 ? JEEVY_ENGINES[i - 1] : JEEVY_ENGINES[JEEVY_ENGINES.length - 1];
  const next = i < JEEVY_ENGINES.length - 1 ? JEEVY_ENGINES[i + 1] : JEEVY_ENGINES[0];
  return { prev, next };
}

export interface JeevyGalleryItem {
  src: string;
  alt: string;
  caption: string;
}

export const JEEVY_OS = {
  eyebrow: "Enterprise Operating System · Aerospace & Defense · 2026",
  title: "Jeevy Industrial OS",
  lead: "Heavy Fabrication & Materials Operating System",
  /** Subtitle shown under the title on the compact homepage card. */
  cardSubtitle: "Aerospace Fabrication & Materials OS, 2026",
  /** Full narrative: used on the platform hub page. */
  narrative:
    "Heavy manufacturing breaks consumer software. When multi-ton cryogenic pressure vessels and skids are built under high-bay glare by crews in leather gauntlets, disconnected spreadsheets cause five-figure schedule collapses. As Lead Product Designer & Systems Architect, I designed and built a 6-engine closed-loop operating system uniting PIN kiosks, CAD viewers, procurement ledgers, and Gantt CPM.",
  /** Tightened 3-sentence version: used on the compact homepage card. */
  narrativeShort:
    "Heavy manufacturing breaks consumer software. When multi-ton cryogenic skids are built by crews in leather gauntlets, disconnected spreadsheets cause five-figure schedule collapses. Built solo as Lead Systems Architect, Jeevy OS is a 6-engine closed-loop operating system uniting PIN kiosks, CAD viewers, procurement ledgers, and Gantt CPM.",
  ctaLabel: "Explore Platform Case Study",
  ctaHref: JEEVY_OS_ROOT,
  /** Primary image first, it is the one rendered large. */
  gallery: [
    {
      // Jeevy logo is composited into the top-left corner, so any crop of
      // this image must keep the left edge, see `object-left` on the card.
      src: "/jeevy/spacex-cape-canaveral-lc39a.jpg",
      alt: "Falcon 9 and Dragon stacked on the launchpad at dusk, crew access arm extended from the tower",
      caption: "Cleburne Hangar → SpaceX Cape Canaveral GSE Launchpad",
    },
    {
      src: "/jeevy/cleburne-hangar-skid-handoff.jpg",
      alt: "Completed skid tarped on a lowboy trailer inside the Cleburne high-bay, handed off for transport",
      caption: "Cleburne Hangar, completed skid handed off for transport",
    },
    {
      src: "/jeevy/custom-wing-box-transport-frame.jpg",
      alt: "Custom welded aluminium wing box transport frame staged on a shop pad",
      caption: "Custom wing box transport frame",
    },
    {
      src: "/jeevy/hp-cryogenic-manifold.jpg",
      alt: "High-pressure cryogenic manifold assembly on a structural skid base",
      caption: "High-pressure cryogenic manifold skid",
    },
  ] as JeevyGalleryItem[],
};

/** Placeholder section scaffold shared by every subsystem deep-dive page. */
export const SUBSYSTEM_SECTIONS = [
  {
    id: "executive-summary",
    number: "01",
    title: "Executive Summary",
    placeholder:
      "The problem, the constraint that made it hard, and the measurable outcome. Written last, read first.",
  },
  {
    id: "systems-architecture",
    number: "02",
    title: "Systems Architecture",
    placeholder:
      "Data model, service boundaries, and how this engine reads from and writes back into the closed loop.",
  },
  {
    id: "subsystem-deep-dives",
    number: "03",
    title: "Subsystem Deep-Dives",
    placeholder:
      "The two or three decisions worth defending in detail, with the alternatives that were rejected and why.",
  },
  {
    id: "test-matrix",
    number: "04",
    title: "Test Matrix",
    placeholder:
      "Coverage across shop-floor conditions: glove input, glare, offline states, bilingual parity, and load.",
  },
  {
    id: "retrospective",
    number: "05",
    title: "Retrospective",
    placeholder:
      "What held up under real fabrication load, what was rebuilt, and what would change on a second pass.",
  },
];
