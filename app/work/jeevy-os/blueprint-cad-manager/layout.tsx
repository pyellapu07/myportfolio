import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Blueprint & CAD File Manager — Jeevy Industrial OS — Pradeep Yellapu",
  description:
    "Sub-second 2D/3D browser drawing inspection, 3-gate security governance, and purging 2,457 lines of UI drift.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
