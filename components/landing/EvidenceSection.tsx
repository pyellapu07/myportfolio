"use client";

import { CommitGrid, ResearchReport, SystemLedger } from "./Widgets";

// The evidence cards below the hero on phones and tablets, where the hero has
// no room for them (on wide screens they stand at its edges). Replaces the
// old metrics band.
export default function EvidenceSection() {
  return (
    <section aria-label="Evidence" className="border-y border-black/[0.06] bg-white px-4 py-14 lg:hidden">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-start justify-center gap-x-6 gap-y-8">
        <CommitGrid width={320} />
        <ResearchReport width={320} />
        <SystemLedger width={320} />
      </div>
    </section>
  );
}
