import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Deliverables Map & Project Dashboard · Jeevy Industrial OS · Pradeep Yellapu",
  description:
    "Miro-style structural build breakdown, auto-linked milestones, and real-time Material Flow Sankey diagrams.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
