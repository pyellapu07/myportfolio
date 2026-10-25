"use client";

import { useState } from "react";
import AgentMark, { type AgentMood } from "@/components/agent/AgentMark";

// Lab page for the agent mark: sizes and moods side by side.
const MOODS: AgentMood[] = ["idle", "listening", "thinking", "answered"];

export default function AgentLab() {
  const [mood, setMood] = useState<AgentMood>("idle");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-white p-10">
      <div className="flex items-center gap-6">
        <AgentMark size={300} mood={mood} form="orbit" />
        <AgentMark size={300} mood={mood} form="knot" />
      </div>
      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(m)}
            className={`rounded-full border px-3 py-1.5 text-[13px] ${mood === m ? "border-black bg-black text-white" : "border-black/15 text-black/60"}`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-10">
        <AgentMark size={120} mood={mood} form="orbit" />
        <AgentMark size={64} mood={mood} form="orbit" />
        <AgentMark size={120} mood={mood} form="knot" />
        <AgentMark size={64} mood={mood} form="knot" />
      </div>
    </main>
  );
}
