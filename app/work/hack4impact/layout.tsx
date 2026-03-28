import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Hack4Impact Application Portal Redesign — Pradeep Yellapu",
  description:
    "UX case study: Redesigned the Hack4Impact application portal, reducing navigation time by 80% and supporting 750+ applicants annually.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
