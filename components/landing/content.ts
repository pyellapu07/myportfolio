// Everything the sections under the hero say, in one place: roles, kind
// words and ways to get in touch. Components only lay it out.

import { SITE } from "@/lib/constants";

export type Role = {
  role: string;
  org: string;
  place: string;
  years: string;
  /** One line: what came of it. */
  outcome: string;
  /** Where it was, for the career globe. */
  lon: number;
  lat: number;
};

export const ROLES: Role[] = [
  {
    role: "Lead Product Designer",
    org: "Jeevy Fabrication",
    place: "Cleburne, TX",
    lon: -97.39,
    lat: 32.35,
    years: "2026",
    outcome: "I lead design on the OS that runs an aerospace fab shop: scheduling, materials, CAD and the floor, with the design system behind it.",
  },
  {
    role: "Product Research & Designer",
    org: "Xylem Lab · NASA Harvest, UMD",
    place: "College Park, MD",
    lon: -76.94,
    lat: 38.99,
    years: "2025–",
    outcome: "I took a 3-day manual QGIS workflow down to a 30-minute food security bulletin for ministries in 9 countries.",
  },
  {
    role: "Product Design & UX Research Intern",
    org: "MarketCrunch AI",
    place: "San Francisco, CA",
    lon: -122.42,
    lat: 37.77,
    years: "2025",
    outcome: "I ran a heuristic audit of 20+ screens and usability tests with 12 enterprise users, and cut reporting errors by 15%.",
  },
  {
    role: "UX Designer",
    org: "Hack4Impact, UMD",
    place: "College Park, MD",
    lon: -76.94,
    lat: 38.99,
    years: "2024–25",
    outcome: "I turned a 33-page application into a 4-step flow that 750+ applicants a year now get through.",
  },
  {
    role: "Technical UX Analyst",
    org: "Computacenter",
    place: "Bengaluru, India",
    lon: 77.59,
    lat: 12.97,
    years: "2023–24",
    outcome: "I designed diagnostic dashboards for support teams that cut mean time to resolve by 40%.",
  },
  {
    role: "Market Research Analyst, UI/UX",
    org: "My Equation",
    place: "Ahmedabad, India",
    lon: 72.57,
    lat: 23.02,
    years: "2022–23",
    outcome: "I ran user interviews and competitive analysis that fed a 35% jump in revenue.",
  },
];

export type Quote = {
  tag: string;
  name: string;
  role: string;
  avatar: string;
  /** The line shown first. */
  short: string;
  /** The whole recommendation, shown on Read more. */
  full: string;
};

export const QUOTES: Quote[] = [
  {
    tag: "Terps Esports · UMD",
    name: "Erica Javadpour",
    role: "Creative & Info Lead",
    avatar: "/Erica.jpeg",
    short:
      "Pradeep is an extremely talented, thorough, and wildly creative graphic designer. Any company will be beyond lucky to have Pradeep on their team.",
    full: "Pradeep is an extremely talented, thorough, and wildly creative graphic designer. He consistently thinks outside of the box to elevate our program's brand, while still maintaining within the creative guidelines. More importantly though, he is a diligent, communicative worker who is eager to learn and grow, both as a creative but also as a budding professional. He takes feedback and incorporates it immediately into his work, to the point where the change is evident and reflected instantaneously. Although bittersweet that he leaves our team as he graduates from UMD, I'm excited to see where he takes his talents in this next chapter. Any company will be beyond lucky to have Pradeep on their team.",
  },
  {
    tag: "Computacenter UK",
    name: "Ravi Kumar",
    role: "Service Delivery Manager",
    avatar: "/ravi kumar.jpeg",
    short: "Never delayed on any task. A true team player, and a creative artist when it comes to editing or drawing.",
    full: "Happy to write this recommendation for Pradeep, post working very closely for 18 months. He joined us as an intern from SRM College and later got converted to permanent employment. He is a knowledgeable person and easy going. Never delayed on any task assigned to him. A true team player, and a creative artist as well when it comes to editing or drawing. I wish him the best for his masters in the states. All the best and keep doing what you do!",
  },
];

export const CONTACT = {
  email: SITE.email,
  links: [
    { label: "LinkedIn", href: SITE.linkedin },
    { label: "GitHub", href: SITE.github },
    { label: "Substack", href: SITE.substack },
    { label: "Résumé", href: SITE.resumeUrl },
  ],
};

/** How the work runs, as a loop, in first person, from the real work. */
export const METHOD = [
  {
    key: "listen",
    title: "I listen first",
    body: "I start with contextual inquiry: I sit with the people doing the job and watch them do it. At Jeevy I surveyed our estimators and learned they lose 3 to 10 minutes per quote just picking files, and that they want to know why a shop is suggested before they trust it.",
  },
  {
    key: "system",
    title: "I turn it into a system",
    body: "I map what I heard into the information architecture, then into design tokens and components. The Jeevy design system ships in Figma and code together, with automated checks in CI so contrast and spacing can\u2019t quietly drift.",
  },
  {
    key: "ship",
    title: "I ship it, then I measure",
    body: "I prototype in code and put it in front of the same people. On TGI that meant filters that let analysts jump straight to the high-uncertainty fields. On AutoPilot it meant a 3-day workflow that now runs in under 30 minutes.",
  },
];

/** The reel between Journey and Method: the work itself, playing. */
export const REELS = [
  { video: "/thumbs/jeevy-os.mp4", poster: "/thumbs/jeevy-os-poster.webp", label: "Jeevy OS", caption: "I designed it on the shop floor, with the people who run it. Scheduling, materials, CAD and the floor, in one place." },
  { video: "/thumbs/xylem.mp4", poster: "/thumbs/xylem-poster.webp", label: "Xylem AutoPilot", caption: "I automated satellite data into food security bulletins. 30 minutes instead of 3 days, across 9 countries." },
  { video: "/thumbs/tgi.mp4", poster: "/thumbs/tgi-poster.webp", label: "TGI Crop Intelligence", caption: "I designed the workbench analysts use to check cropland estimates in Sudan, where nobody can survey the fields." },
];
