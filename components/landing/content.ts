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
};

export const ROLES: Role[] = [
  {
    role: "Lead Product Designer",
    org: "Jeevy Fabrication",
    place: "Cleburne, TX",
    years: "2026",
    outcome: "An operating system for aerospace fabrication: scheduling, materials, CAD and the shop floor.",
  },
  {
    role: "Product Research & Designer",
    org: "Xylem Lab · NASA Harvest, UMD",
    place: "College Park, MD",
    years: "2025–",
    outcome: "A 3-day satellite workflow turned into 30-minute food-security bulletins.",
  },
  {
    role: "Product Design & UX Research Intern",
    org: "MarketCrunch AI",
    place: "San Francisco, CA",
    years: "2025",
    outcome: "UX audit of 20+ screens and testing with 12 enterprise users; 15% fewer reporting errors.",
  },
  {
    role: "UX Designer",
    org: "Hack4Impact, UMD",
    place: "College Park, MD",
    years: "2024–25",
    outcome: "A 33-page application cut to a 4-step flow for 750+ applicants a year.",
  },
  {
    role: "Technical UX Analyst",
    org: "Computacenter",
    place: "Bengaluru, India",
    years: "2023–24",
    outcome: "Diagnostic dashboards that cut mean time to resolve by 40%.",
  },
  {
    role: "Market Research Analyst, UI/UX",
    org: "My Equation",
    place: "Ahmedabad, India",
    years: "2022–23",
    outcome: "Interviews and competitive analysis behind 35% revenue growth.",
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

/** How the work runs, as a loop: hearing people, modelling the system, shipping it. */
export const METHOD = [
  {
    n: "01",
    title: "Hear it",
    body: "Interviews, contextual inquiry and surveys before any pixels: 143 participants across the studies on this site.",
    stat: "143 participants",
  },
  {
    n: "02",
    title: "Model it",
    body: "Turn what was heard into a system: tokens, components and the rules between them. Four design systems, 2,233 variants.",
    stat: "4 systems",
  },
  {
    n: "03",
    title: "Ship it",
    body: "Build it in code and measure what changed, then go back and listen again. 1,315 contributions in the last year.",
    stat: "97% less manual work",
  },
];

/** The reel between Journey and Method: the work itself, playing. */
export const REELS = [
  { video: "/thumbs/jeevy-os.mp4", poster: "/thumbs/jeevy-os-poster.webp", label: "Jeevy OS", caption: "An operating system for aerospace fabrication, from scheduling to the shop floor." },
  { video: "/thumbs/xylem.mp4", poster: "/thumbs/xylem-poster.webp", label: "Xylem AutoPilot", caption: "Satellite data to food-security bulletins in thirty minutes, for analysts in nine countries." },
  { video: "/thumbs/tgi.mp4", poster: "/thumbs/tgi-poster.webp", label: "TGI Crop Intelligence", caption: "Cropland estimates for conflict-affected regions, where no one can survey the ground." },
];
