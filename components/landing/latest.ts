// What's new, newest first: articles, projects and recognition. Shared by
// the "Latest" stack and the Index view's side cards. Public material only.

export type LatestKind = "Article" | "Project" | "Recognition";

export type LatestItem = {
  id: string;
  kind: LatestKind;
  title: string;
  /** Where it lives: publication, organisation or issuer. */
  source: string;
  /** ISO date (day or month precision) for ordering. */
  date: string;
  /** As shown: a day for articles, a month for projects. */
  when: string;
  href: string;
  image: string;
  /** A silent loop played over the image (MP4 path; a .webm twin is tried first). */
  video?: string;
  external?: boolean;
};

export const LATEST: LatestItem[] = [
  {
    id: "memory-device",
    kind: "Article",
    title: "I Was Tired of Explaining My Life to AI. So I Built a Little Device That Remembers Everything.",
    source: "Substack",
    date: "2026-09-30",
    when: "Sep 30, 2026",
    href: "https://pyellapu07.substack.com/p/i-was-tired-of-explaining-my-life",
    image: "/latest/memory-device.webp",
    external: true,
  },
  {
    id: "design-system-audit",
    kind: "Article",
    title: "I Had Never Built a Design System. Then I Audited 122,939 Lines of CSS.",
    source: "Substack",
    date: "2026-09-23",
    when: "Sep 23, 2026",
    href: "https://pyellapu07.substack.com/p/i-had-never-built-a-design-system",
    image: "/latest/design-system-audit.webp",
    external: true,
  },
  {
    id: "tgi",
    kind: "Project",
    title: "TGI Crop Intelligence: cropland estimates for conflict-affected regions",
    source: "Taylor Geospatial Institute",
    date: "2026-09",
    when: "Sep 2026",
    href: "/work/tgi",
    image: "/thumbs/tgi-tall-poster.webp",
    video: "/thumbs/tgi-tall.mp4",
  },
  {
    id: "jeevy-os",
    kind: "Project",
    title: "Jeevy OS: an operating system for aerospace fabrication",
    source: "Jeevy Fabrication",
    date: "2026-07",
    when: "Jul 2026",
    href: "/work/jeevy-os",
    image: "/thumbs/jeevy-os-tall-poster.webp",
    video: "/thumbs/jeevy-os-tall.mp4",
  },
  {
    id: "xylem",
    kind: "Project",
    title: "Xylem AutoPilot: 3-day bulletins in 30 minutes, deployed in Nairobi",
    source: "NASA Harvest · Xylem Lab",
    date: "2026-03",
    when: "Mar 2026",
    href: "/work/xylem-institute",
    image: "/thumbs/xylem-tall-poster.webp",
    video: "/thumbs/xylem-tall.mp4",
  },
  {
    id: "marketcrunch",
    kind: "Project",
    title: "MarketCrunch AI: sole designer, from audit to shipped React",
    source: "MarketCrunch AI",
    date: "2025-09",
    when: "Sep 2025",
    href: "/work/marketcrunch",
    image: "/thumbs/marketcrunch.webp",
  },
  {
    id: "hack4impact",
    kind: "Project",
    title: "Hack4Impact: a recruitment portal for 750+ applicants",
    source: "Hack4Impact UMD",
    date: "2025-05",
    when: "May 2025",
    href: "/work/hack4impact",
    image: "/thumbs/hack4impact.webp",
  },
].sort((a, b) => b.date.localeCompare(a.date)) as LatestItem[];
