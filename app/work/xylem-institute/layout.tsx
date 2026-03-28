import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "NASA Harvest & Xylem Institute — Pradeep Yellapu",
  description:
    "Product research & design: Built the design layer for satellite intelligence — two live websites, two design systems, and an AI pipeline converting satellite data into policy bulletins.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
