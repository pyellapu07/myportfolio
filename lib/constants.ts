import type { Project, TimelineItem, SkillCategory } from "@/types";

export const SITE = {
  name: "Pradeep Yellapu",
  title: "Product Designer & UX Researcher",
  tagline:
    "Creating user-centered digital products across enterprise SaaS, AI platforms, and consumer applications. 5+ years delivering designs that drive measurable business impact.",
  email: "pyellapu@umd.edu",
  phone: "240.610.7815",
  linkedin: "https://linkedin.com/in/pradeepyellapu",
  github: "https://github.com/pradeepyellapu",
  medium: "https://medium.com/design-bootcamp/why-ux-designers-matter-more-than-ever-in-the-age-of-ai-part-1-f74761c7a4c3",
  portfolio: "#",
  location: "Open to Relocation",
  resumeUrl: "/Pradeep_Yellapu_UX-Research_Product-Design_2026.pdf",
} as const;

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#journey" },
  { label: "Contact", href: "#contact" },
] as const;

/* Words that rotate in the hero */
export const ROTATING_WORDS = [
  "enterprise SaaS",
  "AI platforms",
  "consumer apps",
  "design systems",
  "data visualization",
];

/* Infinite ticker - companies / clients / institutions */
export const TICKER_ITEMS = [
  { name: "MarketCrunch AI", logo: "/MarketCrunch AI logo.png" },
  { name: "NASA Harvest (Xylem)", logo: "/xyleminstitute logo.png" },
  { name: "University of Maryland", logo: "/university-of-maryland-seeklogo.png" },
  { name: "HackImpact", logo: "/hack4impactumd.png" },
  { name: "Transurban", logo: "/transurbanlogo.png" },
  { name: "My Equation", logo: "/myequation logo.png" },
  { name: "Terps Esports", logo: "/esportslogo.png" },
  { name: "PrepSharp", logo: "/prepsharplogo.PNG" },
];

export const METRICS = [
  { value: 40, suffix: "%", label: "Reduced User Friction" },
  { value: 167, suffix: "%", label: "Boosted Engagement" },
  { value: 750, suffix: "+", label: "Applicants Supported" },
  { value: 5, suffix: "+", label: "Years of Experience" },
] as const;

export const PROJECTS: Project[] = [
  {
    title: "MarketCrunch AI",
    subtitle: "Product Design & UX Research — Trading Platform Redesign",
    impact: "167% increase in new user attempts · 40% boost in elite plan sales · 15% reduction in reporting errors",
    description:
      "Led a comprehensive UX audit across 20+ screens benchmarking against Robinhood, Yahoo Finance, and TradingView. Designed high-fidelity prototypes validated through moderated usability testing with 12 enterprise users. Built a scalable design system following atomic design principles, redesigned onboarding flow and dashboard information architecture resulting in dramatically improved conversion and feature adoption metrics.",
    techStack: ["Product Design", "UX Research", "Figma", "Design Systems", "Usability Testing", "Heuristic Evaluation"],
    image: "/marketcrunchaipreview.gif",
    link: "/work/marketcrunch",
    featured: true,
    cursorLabel: "View case study →",
  },
  {
    title: "Faculty Dashboard",
    subtitle: "UX Research — INFO Faculty Workload Tracking",
    impact: "Contextual interviews with UMD faculty · Affinity mapping · Journey maps & task flows",
    description:
      "Conducted contextual interviews with UMD iNFO faculty to understand workload tracking pain points. Performed affinity mapping to identify recurring themes and synthesized insights into journey maps and task flows, proposing a streamlined dashboard design that improved task ownership clarity.",
    techStack: ["UX Research", "Contextual Inquiry", "Affinity Mapping", "Journey Mapping", "Task Flows"],
    image: "/facultydashboardpreview.jpg",
    link: "/work/workflow",
    featured: true,
    cursorLabel: "View case study →",
  },
  {
    title: "NASA Harvest — Xylem Institute",
    subtitle: "Product Design · Design Systems · AI Pipeline — End-to-end from websites to bulletin automation",
    impact: "32% reduction in bounce rate · 2 live websites · 2 design systems · Nairobi workshop · AI bulletin pipeline",
    description:
      "Built the complete design layer for NASA Harvest-affiliated Xylem Lab: launched two production websites from zero, designed two distinct brand systems, ran a 3-day AGRA RFBS training workshop in Nairobi for analysts from 9 countries, and built Xylem Auto-Pilot — an AI pipeline that converts satellite crop data into publication-ready HTML bulletins in a single click.",
    techStack: ["Product Design", "Design Systems", "Brand Identity", "AI Pipeline", "UX Research", "Figma", "Python", "HTML/CSS", "QGIS"],
    image: "/xylemlabscreenrecording.gif",
    link: "/work/xylem-institute",
    featured: false,
    cursorLabel: "View case study →",
  },
  {
    title: "HackImpact Application Portal",
    subtitle: "Product Design — Nonprofit Application Redesign",
    impact: "80% reduction in navigation time · 750+ applicants annually · 33-page process simplified",
    description:
      "Designed a 4-step modular application flow applying progressive disclosure to condense a 33-page process. Built a centralized recruiter dashboard with role-based access control. Conducted generative user research with nonprofit stakeholders through semi-structured interviews and contextual inquiry to define design opportunities.",
    techStack: ["Product Design", "User Research", "Prototyping", "Dashboard Design", "Figma", "Progressive Disclosure"],
    image: "/hack4impactpreview.gif",
    link: "/work/hack4impact",
    featured: false,
    cursorLabel: "View case study →",
  },
  {
    title: "Transurban Express Lanes",
    subtitle: "UX Research — Toll Payment & Wayfinding Experience",
    impact: "127 survey participants · 8 in-depth interviews · SUS scores & qualitative analysis",
    description:
      "Conducted mixed-methods UX research using surveys, semi-structured interviews, and usability testing to evaluate express lane user experience. Applied thematic analysis and affinity mapping to identify critical usability issues in wayfinding, toll transparency, and account management that impacted user trust and adoption.",
    techStack: ["UX Research", "Surveys", "Usability Testing", "Thematic Analysis", "SUS", "Affinity Mapping"],
    image: "/transurbanpreview.gif",
    link: "/work/transurban",
    featured: true,
    cursorLabel: "View case study →",
  },
  {
    title: "PrepSharp",
    subtitle: "Product Design — Interview Preparation Platform",
    impact: "AI-powered interview prep · Full product design from concept to prototype",
    description:
      "Designed an AI-powered interview preparation platform from concept through high-fidelity prototypes. Created user flows, wireframes, and visual design for a product that helps candidates practice and improve their interview skills through personalized feedback and structured practice sessions.",
    techStack: ["Product Design", "Figma", "User Flows", "Visual Design", "AI/UX"],
    image: "/prepsharppreview.gif",
    link: "#",
    featured: true,
    cursorLabel: "Serving Soon.. 🍳",
  },
];

export const TIMELINE: TimelineItem[] = [
  {
    role: "Product Research & Designer",
    organization: "NASA Harvest — Xylem Institute, UMD",
    period: "Nov 2025 — Present",
    points: [
      "End-to-end UX research and interface design for geospatial climate reports",
      "Led iterative prototyping in Figma with information architecture principles",
      "Developed comprehensive brand identity system and style guide",
    ],
    color: "#6366F1",
  },
  {
    role: "Product Design & UX Research Intern",
    organization: "MarketCrunch AI, San Francisco",
    period: "Jun 2025 — Sep 2025",
    points: [
      "UX audit of 20+ screens, 15% reduction in reporting errors",
      "Moderated usability testing with 12 enterprise users, launched 2 features",
      "Scalable design system with atomic design principles",
    ],
    color: "#FF5210",
  },
  {
    role: "UX Designer",
    organization: "HackImpact @ UMD",
    period: "Nov 2024 — May 2025",
    points: [
      "Generative user research with nonprofit stakeholders",
      "4-step modular flow reducing 33-page process",
      "Recruiter dashboard supporting 750+ applicants annually",
    ],
    color: "#22C55E",
  },
  {
    role: "Technical UX Analyst",
    organization: "Computacenter, Bengaluru",
    period: "Jan 2023 — Jul 2024",
    points: [
      "Automated diagnostic dashboards reducing MTTR by 40%",
      "Workflow analysis and stakeholder interviews",
      "Information design for IT support teams",
    ],
    color: "#8E60F0",
  },
  {
    role: "Market Research Analyst, UI/UX Designer",
    organization: "My Equation, Ahmedabad",
    period: "May 2022 — Jun 2023",
    points: [
      "Mixed-methods UX research using Double Diamond methodology",
      "User interviews and competitive analysis driving 35% revenue growth",
    ],
    color: "#F59E0B",
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Design",
    icon: "pen-tool",
    skills: [
      "Human-Centric Design",
      "Interaction Design",
      "Visual Design",
      "Prototyping",
      "Information Architecture",
      "Design Systems",
      "Accessibility (WCAG 2.2)",
    ],
  },
  {
    title: "Research",
    icon: "search",
    skills: [
      "Journey Mapping",
      "Card Sorting",
      "In-Depth Interviews",
      "Ethnographic Research",
      "Competitive Analysis",
      "Heuristic Evaluation",
      "A/B Testing",
    ],
  },
  {
    title: "Tools",
    icon: "layout",
    skills: [
      "Figma",
      "Adobe XD",
      "Photoshop & Illustrator",
      "Miro & Notion",
      "Power BI & Tableau",
      "QGIS",
      "Generative-AI Tools",
    ],
  },
  {
    title: "Technical",
    icon: "code",
    skills: [
      "HTML / CSS",
      "JavaScript",
      "Python",
      "SQL",
      "Git / GitHub",
      "QGIS",
      "Data Visualization",
    ],
  },
];

export const CHAT_PLACEHOLDERS = [
  "Ask about my design process...",
  "What's your approach to user research?",
  "Tell me about MarketCrunch AI...",
  "How do you handle design systems?",
];

export const RECRUITER_PLACEHOLDER =
  "Paste a job description to see if I'm a match...";

export const QUICK_ACTIONS_GENERAL = [
  { label: "My Projects", prompt: "Tell me about your most impactful design projects" },
  { label: "Design Process", prompt: "Walk me through your UX research and design process" },
  { label: "Skills", prompt: "What are your strongest design and research skills?" },
  { label: "Experience", prompt: "Tell me about your work experience" },
];

export const QUICK_ACTIONS_RECRUITER = [
  { label: "Match Analysis", prompt: "Analyze my fit for this role" },
  { label: "Key Strengths", prompt: "What are my unique strengths for this role?" },
  { label: "Impact Metrics", prompt: "What measurable impact have I made?" },
  { label: "Relevant Work", prompt: "Which projects are most relevant for this role?" },
];

export const SKILL_PILLS = [
  "Product Design",
  "UX Research",
  "Figma",
  "Design Systems",
  "Usability Testing",
  "Data Viz",
];

export const ABOUT_TEXT = [
  "I'm a Product Designer & UX Researcher with 5+ years of experience creating user-centered digital products across enterprise SaaS, AI platforms, and consumer applications. Currently pursuing my MS in Data Science at the University of Maryland with a minor in UX Research Methods.",
  "I've delivered designs that reduced user friction by 40%, boosted engagement by 167%, and supported 750+ enterprise applicants annually. My approach bridges design, research, and development teams to ship products that drive real business value.",
  "I'm a strong believer in mixed-methods research — combining qualitative depth with quantitative rigor to uncover insights that shape better products.",
];

export const ABOUT_HIGHLIGHTS = [
  { label: "Product Design", icon: "pen-tool" },
  { label: "UX Research", icon: "search" },
  { label: "Design Systems", icon: "layout" },
  { label: "Accessibility", icon: "accessibility" },
  { label: "Prototyping", icon: "figma" },
  { label: "Information Architecture", icon: "sitemap" },
];
