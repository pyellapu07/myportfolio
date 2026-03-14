import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";

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

export const metadata: Metadata = {
  title: "Pradeep's Canvas",
  description:
    "Product Designer & UX Researcher with 5+ years of experience creating user-centered digital products across enterprise SaaS, AI platforms, and consumer applications.",
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
    title: "Pradeep Yellapu — Product Designer & UX Researcher",
    description:
      "5+ years creating user-centered digital products. Reduced user friction by 40%, boosted engagement by 167%.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pradeep Yellapu — Product Designer",
    description:
      "Product Designer & UX Researcher crafting user-centered digital experiences.",
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
      <body className={`${manrope.variable} ${dmMono.variable} antialiased`}>
        <LoadingScreen />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
