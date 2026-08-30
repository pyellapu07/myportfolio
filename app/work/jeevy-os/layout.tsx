import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Jeevy Industrial OS · Pradeep Yellapu",
  description:
    "Heavy Fabrication & Materials Operating System: a 6-engine closed-loop platform uniting PIN kiosks, CAD viewers, procurement ledgers, and Gantt CPM for aerospace and defense fabrication.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
