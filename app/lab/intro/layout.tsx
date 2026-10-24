import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Intro lab",
  robots: { index: false, follow: false },
};

export default function IntroLabLayout({ children }: { children: ReactNode }) {
  return children;
}
