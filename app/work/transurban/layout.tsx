import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Transurban Express Lanes UX Research — Pradeep Yellapu",
  description:
    "Mixed-methods UX research study conducted at Transurban Virginia HQ, identifying critical usability barriers for 127 Express Lane users.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
