import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Materials & Procurement Ledger — Jeevy Industrial OS — Pradeep Yellapu",
  description:
    "How a single-table JSONB ledger, $1k spend gates, and 4-step unit dock QC replaced an $800k Google Sheet.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
