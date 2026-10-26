import type { Metadata } from "next";
import { Manrope, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollToTop from "@/components/ScrollToTop";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// Absolute base for share images: the site's own URL when set, else the
// Vercel production domain, else local.
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Pradeep's Canvas",
  description:
    "Product Designer & UX Researcher creating user-centered digital products across enterprise SaaS, AI platforms, and consumer applications.",
  keywords: [
    "Pradeep Yellapu",
    "Product Designer",
    "UX Researcher",
    "Portfolio",
    "University of Maryland",
    "Figma",
    "Design Systems",
  ],
  authors: [{ name: "Pradeep Yellapu" }],
  openGraph: {
    title: "Pradeep Yellapu, Product Designer & UX Researcher",
    description:
      "Product Designer & UX Researcher. Reduced user friction by 40%, boosted engagement by 167%.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/Thumbnail portfolio.png",
        width: 1200,
        height: 630,
        alt: "Pradeep Yellapu — Product Designer & UX Researcher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pradeep Yellapu, Product Designer",
    description:
      "Product Designer & UX Researcher crafting user-centered digital experiences.",
    images: ["/Thumbnail portfolio.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/Favicon.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/Favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Favicon.png" />
      </head>
      {/* Extensions (e.g. Demoway) stamp attributes on <body> before hydration; this
          only ignores attribute diffs on this element, not on its children. */}
      <body
        className={`${manrope.variable} ${dmMono.variable} ${instrumentSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <Analytics />
        <LoadingScreen />
        <ScrollToTop />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
