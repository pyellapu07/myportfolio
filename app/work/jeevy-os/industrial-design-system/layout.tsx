import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Industrial Design System (v1.0.0) — Jeevy Industrial OS — Pradeep Yellapu",
  description:
    "101 semantic tokens, an anti-glare monotonic surface ladder, and a strict 44px glove-operable touch contract.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
