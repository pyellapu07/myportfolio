import type { Metadata } from "next";
import type { ReactNode } from "react";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Xylem AutoPilot · Pradeep Yellapu",
  description:
    "Designing the end-to-end operational pipeline for satellite-driven food security in Africa: multi-sensor yield ensembles and grounded RAG narratives turned into policy-ready bulletins for six countries, cut from 2–3 analyst days to under 30 minutes.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
