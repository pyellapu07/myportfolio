import type { ReactNode } from "react";
import { RecruiterProvider } from "@/lib/recruiter-context";

export default function WorkLayout({ children }: { children: ReactNode }) {
  return (
    <RecruiterProvider>
      {children}
    </RecruiterProvider>
  );
}
