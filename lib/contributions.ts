// The GitHub contribution calendar, as the Index view's commit grid reads it.

export type Day = { date: string; count: number; level: number };
export type Contributions = { total: number; days: Day[] };

/** Parses the profile's calendar fragment: one cell per day carrying its
 *  date and level, and a tooltip per cell carrying its count. */
export function parseCalendar(html: string): Contributions {
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>\s*([\d,]+|No) contributions?/g)) {
    counts.set(m[1], m[2] === "No" ? 0 : Number(m[2].replace(/,/g, "")));
  }
  const days: Day[] = [];
  for (const m of html.matchAll(/<td\b[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([\d-]+)"/)?.[1];
    if (!date) continue;
    const id = tag.match(/\bid="([^"]+)"/)?.[1] ?? "";
    days.push({ date, level: Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0), count: counts.get(id) ?? 0 });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  const total = Number(html.match(/([\d,]+)\s+contributions?\s+in the last year/)?.[1].replace(/,/g, "") ?? NaN);
  return { total: Number.isFinite(total) ? total : days.reduce((s, d) => s + d.count, 0), days };
}
