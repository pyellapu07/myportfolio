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
