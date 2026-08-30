import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tasking & Gantt CPM Engine · Jeevy Industrial OS · Pradeep Yellapu",
  description:
    "Critical path scheduling floored by supplier delivery ETAs, plus Available-to-Promise (ATP) inventory pooling.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
