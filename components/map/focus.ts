// Which project the chat is talking about, so the ring can turn to it and
// light it up. A tiny store: the chat (AskBar) sets it, MapCards listens.

import { PROJECTS } from "./projects";

let focus: string | null = null;
const listeners = new Set<() => void>();

export const ringFocus = {
  get: () => focus,
  set(id: string | null) {
    if (id === focus) return;
    focus = id;
    listeners.forEach((f) => f());
  },
  subscribe(f: () => void) {
    listeners.add(f);
    return () => void listeners.delete(f);
  },
};

// Words that name a project. Sub-projects first, so "Jeevy's kiosk" lands on
// the kiosk rather than on Jeevy OS as a whole.
const ALIASES: [string, RegExp][] = [
  ["jeevy-tasking", /\b(tasking|cpm|critical path)\b/i],
  ["jeevy-deliverables", /\bdeliverables?\b/i],
  ["jeevy-kiosk", /\bkiosk\b/i],
  ["jeevy-materials", /\b(materials|procurement|bom|rfq)\b/i],
  ["jeevy-blueprint", /\b(blueprint|cad)\b/i],
  ["jeevy-design-system", /\bindustrial design system\b/i],
  ["jeevy-os", /\bjeevy\b/i],
  ["xylem", /\b(xylem|autopilot|agra)\b/i],
  ["tgi", /\b(tgi|crop intelligence|cropland)\b/i],
  ["hack4impact", /\bhack\s?4\s?impact\b/i],
  ["terps-esports", /\b(terps|esports)\b/i],
  // Only as a project, not "faculty" or "workload" on their own.
  ["workflow", /\b(faculty (dashboard|workload)|workload (dashboard|management|tracking))\b/i],
  ["transurban", /\b(transurban|express lanes)\b/i],
  ["marketcrunch", /\bmarket\s?crunch\b/i],
];

/** The project a piece of text is about: the first one named, if any. */
export function projectIn(text: string): string | null {
  let best: { id: string; at: number } | null = null;
  for (const [id, re] of ALIASES) {
    const m = re.exec(text);
    // Earliest mention wins; on a tie the more specific alias (listed first) stays.
    if (m && (!best || m.index < best.at)) best = { id, at: m.index };
  }
  return best && PROJECTS.some((p) => p.id === best.id) ? best.id : null;
}
