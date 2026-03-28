import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MarketCrunch AI Product Design — Pradeep Yellapu",
  description:
    "UX case study: End-to-end product design & research for MarketCrunch AI, an AI-driven investment research platform for retail investors.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
