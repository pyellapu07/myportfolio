import type { Metadata } from "next";

// The previous homepage, kept reachable while the new one beds in; out of
// search results so it never competes with /.
export const metadata: Metadata = {
  title: "Pradeep's Canvas (classic)",
  robots: { index: false, follow: true },
};

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
