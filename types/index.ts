/**
 * How a preview thumbnail sits in the card's media panel.
 *
 * `cover` fills the panel and crops, so it only suits art with a safe edge to
 * anchor to: the Jeevy and TGI shots both hold their subject against one side.
 * `contain` shows the whole frame on a mat, which is what the rest need, since
 * they are composed screenshots that lose their meaning the moment an edge is
 * cut off.
 */
export interface ProjectMedia {
  fit?: "cover" | "contain";
  /** Tailwind object-position class, only meaningful with `cover`. */
  position?: string;
}

export interface Project {
  title: string;
  subtitle: string;
  impact: string;
  description: string;
  techStack: string[];
  image: string;
  link?: string;
  caseStudy?: string;
  featured?: boolean;
  cursorLabel?: string;
  media?: ProjectMedia;
}

export interface TimelineItem {
  role: string;
  organization: string;
  period: string;
  points: string[];
  color: string;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  type: "general" | "job_match";
  content: string;
  matchPercentage?: number;
  matchLevel?: string;
  breakdown?: Record<string, string>;
  followUps?: string[];
}

export interface ContactLink {
  label: string;
  href: string;
  icon: string;
}
