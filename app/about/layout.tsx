import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Pradeep Yellapu — Product Designer & UX Researcher",
  description:
    "From coastal Vizag to NASA labs in Maryland — the full story of Pradeep Yellapu, Product Designer and UX Researcher.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
