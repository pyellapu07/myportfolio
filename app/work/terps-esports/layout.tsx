import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terps Esports Brand & Creative — Pradeep Yellapu",
  description:
    "Brand identity, motion graphics, and visual design for Terps Esports at the University of Maryland.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
