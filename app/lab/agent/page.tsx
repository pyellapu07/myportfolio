"use client";

import { useState } from "react";
import AgentOrb, { type AgentMood } from "@/components/agent/AgentOrb";

// Lab page for the agent: the glass orb on white and on dark, both cores,
// every mood, and the smaller sizes it has to survive at.
const MOODS: AgentMood[] = ["idle", "listening", "thinking", "answered"];

export default function AgentLab() {
  const [mood, setMood] = useState<AgentMood>("idle");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-white p-10">
      <div className="flex items-center gap-6">
        <div className="grid place-items-center rounded-[20px] bg-white p-4">
          <AgentOrb size={300} mood={mood} core="brass" />
        </div>
        <div className="grid place-items-center rounded-[20px] bg-[#0b0d12] p-4">
          <AgentOrb size={300} mood={mood} core="brass" />
        </div>
        <div className="grid place-items-center rounded-[20px] bg-white p-4">
          <AgentOrb size={300} mood={mood} core="cyan" />
        </div>
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
      <div className="flex items-end gap-8">
        <AgentOrb size={120} mood={mood} />
        <AgentOrb size={64} mood={mood} />
        <AgentOrb size={120} mood={mood} core="cyan" />
        <AgentOrb size={64} mood={mood} core="cyan" />
      </div>
    </main>
  );
}
