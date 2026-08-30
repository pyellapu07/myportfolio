import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Shop-Floor Kiosk & Worker Feedback — Jeevy Industrial OS — Pradeep Yellapu",
  description:
    "Ephemeral 6-digit PIN identity, frozen break arithmetic, blocker notes, and 275-key zero-drift bilingual parity.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
