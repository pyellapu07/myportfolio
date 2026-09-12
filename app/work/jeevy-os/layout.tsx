import type { Metadata } from "next";
import type { ReactNode } from "react";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Jeevy Industrial OS · Pradeep Yellapu",
  description:
    "Heavy Fabrication & Materials Operating System: a 6-engine closed-loop platform uniting PIN kiosks, CAD viewers, procurement ledgers, and Gantt CPM for aerospace and defense fabrication.",
};

/**
 * The cursor is mounted here rather than in each page, so the hub and all six
 * engine routes get it from one place. Previously none of them did, which left
 * these pages on the native pointer while the rest of the site used the custom
 * one.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
