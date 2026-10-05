import type { Metadata } from "next";
import type { ReactNode } from "react";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "TGI In-Season Crop Intelligence Workbench · Pradeep Yellapu",
  description:
    "A calibrated GIS workbench for the Taylor Geospatial Institute Food Security Initiative: error-adjusted crop area estimates for conflict zones, with explicit abstention, intentional overrides and a persona engine for analysts, journalists and researchers.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
