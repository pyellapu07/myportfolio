import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RecruiterProvider } from "@/lib/recruiter-context";

export const metadata: Metadata = {
  title: "HackImpact Application Portal Redesign — Pradeep Yellapu",
  description:
    "UX case study: Redesigned the HackImpact application portal, reducing navigation time by 80% and supporting 750+ applicants annually.",
};

export default function WorkLayout({ children }: { children: ReactNode }) {
  return (
    <RecruiterProvider>
      {children}
    </RecruiterProvider>
  );
}
