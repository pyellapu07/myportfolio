import { NextResponse } from "next/server";
import { parseCalendar, type Contributions } from "@/lib/contributions";

// The GitHub contribution calendar for the Index view's commit grid: every
// repo, private ones included when the profile shows them. Re-read daily.
// With GITHUB_TOKEN set it uses the GraphQL API; without, it reads the same
// public calendar fragment the profile page loads.

export const revalidate = 86400;

const USER = "pyellapu07";

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

async function fromGraphQL(token: string): Promise<Contributions> {
  const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
    totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USER } }),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`graphql ${res.status}`);
  const cal = (await res.json()).data.user.contributionsCollection.contributionCalendar;
  return {
    total: cal.totalContributions,
    days: cal.weeks.flatMap((w: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 })),
    ),
  };
}

async function fromProfile(): Promise<Contributions> {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { "User-Agent": "pradeep-portfolio" },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`profile ${res.status}`);
  return parseCalendar(await res.text());
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const data = token ? await fromGraphQL(token).catch(fromProfile) : await fromProfile();
    if (!data.days.length) throw new Error("empty calendar");
    return NextResponse.json(data);
  } catch {
    // The widget hides itself rather than showing an empty grid.
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
