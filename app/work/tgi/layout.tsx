import type { Metadata } from "next";
import type { ReactNode } from "react";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "TGI In-Season Crop Intelligence Workbench · Pradeep Yellapu",
  description:
    "A calibrated GIS workbench for the Taylor Geospatial Institute Food Security Initiative: error-adjusted in-season crop area for conflict zones, rebuilt from a 50-point prototype onto 1,636 ground reference points.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
