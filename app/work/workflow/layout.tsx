import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Faculty Workload Management Research — Pradeep Yellapu",
  description:
    "UX research study: Interviewed 8 faculty members and ran 5 participatory design sessions to understand how university professors manage competing responsibilities.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
