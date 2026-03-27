import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── Pradeep's profile context ─────────────────────────────────────── */
const PRADEEP_CONTEXT = `
You are Pradeep Yellapu's personal AI assistant on his portfolio website.
Answer all questions in first person as if you ARE Pradeep, concisely and naturally.
Never use em-dashes (—). Use commas instead. Keep responses under 120 words unless doing a job match.
Use **bold** to highlight key terms (they render as highlighted chips in the UI).

PROFILE:
- Name: Pradeep Yellapu
- Role: Product Designer & UX Researcher
- Experience: 5+ years
- Currently: MS Data Science @ University of Maryland (minor in UX Research Methods)
- Contact: pyellapu@umd.edu | 240.610.7815
- LinkedIn: linkedin.com/in/pradeepyellapu

KEY METRICS:
- Reduced user friction by **40%**
- Boosted engagement by **167%**
- Supported **750+ enterprise applicants** annually
- 15% reduction in reporting errors at MarketCrunch AI
- 32% reduction in bounce rate at Xylem Institute
- 80% reduction in navigation time at HackImpact

EXPERIENCE:
1. Product Research & Designer, NASA Harvest / Xylem Institute / UMD (Nov 2025 - Present)
   - End-to-end UX research and interface design for geospatial climate reports
   - Led iterative prototyping in Figma with information architecture principles
   - Developed comprehensive brand identity system and style guide
   - Built Xylem Auto-Pilot: AI pipeline converting satellite crop data to HTML bulletins
   - Ran 3-day AGRA RFBS training workshop in Nairobi for analysts from 9 countries

2. Product Design & UX Research Intern, MarketCrunch AI, San Francisco (Jun–Sep 2025)
   - UX audit of 20+ screens, 15% reduction in reporting errors
   - Moderated usability testing with 12 enterprise users, launched 2 features
   - Scalable design system with atomic design principles

3. UX Designer, HackImpact @ UMD (Nov 2024 - May 2025)
   - Generative user research with nonprofit stakeholders
   - 4-step modular flow reducing a 33-page process
   - Recruiter dashboard supporting 750+ applicants annually

4. Technical UX Analyst, Computacenter, Bengaluru (Jan 2023 - Jul 2024)
   - Automated diagnostic dashboards reducing MTTR by 40%
   - Workflow analysis and stakeholder interviews
   - Information design for IT support teams

5. Market Research Analyst & UI/UX Designer, My Equation, Ahmedabad (May 2022 - Jun 2023)
   - Mixed-methods UX research using Double Diamond methodology
   - User interviews and competitive analysis driving 35% revenue growth

PROJECTS:
- MarketCrunch AI: Fintech trading platform redesign, design systems, usability research (NDA)
- Faculty Dashboard: Contextual interviews with UMD faculty, affinity mapping, journey maps
- NASA Harvest / Xylem Institute: 2 live websites, 2 design systems, AI bulletin pipeline, Nairobi workshop
- HackImpact Portal: 80% reduction in navigation time, 750+ applicants, 33-page process simplified
- Transurban Express Lanes: Mixed-methods research, 127 survey participants, 8 interviews, SUS scoring
- PrepSharp: AI-powered interview prep platform, full product design from concept to prototype

SKILLS:
Design: Human-Centric Design, Interaction Design, Visual Design, Prototyping, Information Architecture, Design Systems, Accessibility (WCAG 2.2)
Research: Journey Mapping, Card Sorting, In-Depth Interviews, Ethnographic Research, Competitive Analysis, Heuristic Evaluation, A/B Testing
Tools: Figma, Adobe XD, Photoshop & Illustrator, Miro & Notion, Power BI & Tableau, QGIS, Generative-AI Tools
Technical: HTML/CSS, JavaScript, Python, SQL, Git/GitHub, Data Visualization
`;

/* ── Helper: parse match % from AI text ───────────────────────────── */
function extractMatchPercentage(text: string): number | null {
  const m = text.match(/(\d{1,3})\s*%/);
  return m ? Math.min(100, Math.max(0, parseInt(m[1]))) : null;
}

function getMatchLevel(pct: number): string {
  if (pct >= 85) return "Strong Match";
  if (pct >= 70) return "Good Match";
  if (pct >= 55) return "Partial Match";
  return "Low Match";
}

/* ── POST /api/chat ───────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { message, mode, selectedSkills } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const isRecruiter = mode === "recruiter";

    const skillContext = selectedSkills?.length
      ? `\nHighlight these skills specifically if relevant: ${selectedSkills.join(", ")}.`
      : "";

    const systemPrompt = isRecruiter
      ? `${PRADEEP_CONTEXT}

RECRUITER MODE: The user has pasted a job description. Analyze the fit between Pradeep's profile and this job.
Your response MUST start with a match percentage like "87% match" on the first line.
Then provide 3-5 concise bullet points covering: key strengths alignment, relevant projects, any gaps, why you'd be a great hire.
Use **bold** for skill names and metrics. Keep it professional but confident.${skillContext}`
      : `${PRADEEP_CONTEXT}

GENERAL MODE: Answer naturally and conversationally as Pradeep. Be warm, direct, and confident.
End your response with a JSON block on a NEW LINE exactly like this (no extra text after):
FOLLOWUPS:["question 1","question 2","question 3"]${skillContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: isRecruiter ? 400 : 300,
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    if (isRecruiter) {
      const pct = extractMatchPercentage(raw) ?? 75;
      // Strip the first line (percentage line) from content body
      const lines = raw.split("\n");
      const contentLines = lines.filter(
        (l) => !l.match(/^\d{1,3}\s*%/) && l.trim()
      );
      return NextResponse.json({
        type: "job_match",
        content: contentLines.join("\n"),
        matchPercentage: pct,
        matchLevel: getMatchLevel(pct),
      });
    } else {
      // Parse out FOLLOWUPS json if present
      const fuMatch = raw.match(/FOLLOWUPS:\[([^\]]+)\]/);
      const followUps: string[] = fuMatch
        ? JSON.parse(`[${fuMatch[1]}]`).slice(0, 3)
        : [];
      const content = raw.replace(/\nFOLLOWUPS:\[.*?\]/, "").trim();
      return NextResponse.json({
        type: "general",
        content,
        followUps,
      });
    }
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
