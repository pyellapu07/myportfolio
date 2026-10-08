"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Prose, P, H2, Figure } from "@/components/jeevy-os/editorial";

/* ══════════════════════════════════════════════════════════════
   Jeevy Industrial OS: first-person editorial essay.

   Prose sits directly on the canvas in a 720px measure, and images share
   that exact measure so text and media hold one common left and right edge
   down the page. No cards, no bento boxes, no pills, no tables.

   Type:
     28px semibold white: title and section breaks
     18px neutral-300: all body copy
     14px neutral-400: captions, metadata, eyebrow
   ══════════════════════════════════════════════════════════════ */

const SUB_STORIES = [
  {
    n: "01",
    title: "Materials, Sourcing & Single-Table Ledger",
    href: "/work/jeevy-os/materials-procurement",
    blurb:
      "How I replaced the $800k manual Google Sheet with an immutable single-table PostgreSQL JSONB ledger, $1k server spend gates, 4-step unit QC, and 1-to-N bulk plate nesting.",
  },
  {
    n: "02",
    title: "Shop-Floor Kiosk & Worker Feedback System",
    href: "/work/jeevy-os/shop-kiosk-feedback",
    blurb:
      "Designing for the human holding the torch. Ephemeral 6-digit PIN logins, frozen unpaid break arithmetic, tri-state blocker notes, and a 275-key zero-drift bilingual contract.",
  },
  {
    n: "03",
    title: "Aerospace Blueprint & CAD File Manager",
    href: "/work/jeevy-os/blueprint-cad-manager",
    blurb:
      "Scrapping an abstract prototype to build Trevor's Windows Explorer mental model: sub-second 2D/3D browser inspection, stacked revisions, and 3-gate role security.",
  },
  {
    n: "04",
    title: "Industrial Design System (v1.0.0)",
    href: "/work/jeevy-os/industrial-design-system",
    blurb:
      "101 semantic tokens, an anti-glare monotonic surface ladder, and what migrating 31 dense production files taught us about token-pipeline discipline.",
  },
  {
    n: "05",
    title: "Tasking & Gantt Critical Path (CPM) Engine",
    href: "/work/jeevy-os/tasking-cpm-engine",
    blurb:
      "Integrating supply transit dates directly into forward Gantt scheduling, plus cross-project Available-to-Promise (ATP) inventory pooling.",
  },
  {
    n: "06",
    title: "Deliverables Map & Executive Dashboard",
    href: "/work/jeevy-os/deliverables-map-dashboard",
    blurb:
      "The North Star: a Miro-style infinite canvas where managers map physical skid assemblies once to automatically derive tasks, milestones, and real-time Sankey cash-flow flows.",
  },
];

export default function JeevyOSCaseStudy() {
  return (
    <div data-ds="v1" className="min-h-screen bg-[#040D16]">
        {/* A dark surface keeps the bar dark and its text light at every
            scroll position, rather than dropping a white slab onto the page. */}
      <Header surface="dark" />

      <article className="pb-28 pt-28">
        {/* ══ HEADER ══ */}
        <Prose>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-white">
            Jeevy Industrial OS: Digitizing Heavy Aerospace Fabrication
          </h1>

          <div className="mt-8">
            <P>
              Over twelve weeks in Cleburne, Texas, I led product design and systems architecture
              for Jeevy OS, working with the VP of Technology, full-stack engineering and the shop
              operations lead. The system serves as the central operating system for heavy
              fabrication facilities building multi-ton cryogenic process skids and commercial
              orbital launch infrastructure.
            </P>
          </div>
        </Prose>

        {/* ══ HERO ══ */}
        <Figure
          size="prose"
          src="/jeevy/skid-delivery-launch-site.jpg"
          alt="Delivery day in Cleburne: the freight tractor loaded for the run to the launch site"
          caption="Completed cryogenic process skid package staged in Cleburne, Texas, and dispatched to a commercial launch customer’s pad."
          ratio="aspect-[16/9]"
          priority
        />

        {/* ══ 1. THE HANGAR & THE PROBLEM SPACE ══ */}
        <Prose>
          <H2 id="the-hangar">The reality on the fabrication floor</H2>
          <div className="mt-8 space-y-6">
            <P>
              In industrial manufacturing, software failure isn&rsquo;t an abstract metric or a
              dropped page view. It&rsquo;s an idle welding crew, a halted overhead gantry crane, and
              a five-figure expedited freight penalty when a dispatch window gets missed.
            </P>
            <P>
              Before this overhaul, our primary tool for managing high-value bills of materials was a
              15-tab Google Sheet. It was tracking $800,036.25 in raw materials across structural
              steel, piping, valves, and instrumentation. A single accidental edit in a formula cell
              would silently distort profit margins across an entire build, and when steel actually
              arrived at the dock, inventory was tracked on dry-erase whiteboards that buyers in the
              front office never saw.
            </P>
            <P>
              Software designed in quiet tech offices assumes clean hands, 4K monitors, and precision
              mice. The Cleburne fabrication hangar is the exact opposite.
            </P>
            <P>
              <span className="text-white">Work gloves.</span> Welders and fitters wear thick leather
              gauntlets. A standard 20px button or micro-dropdown cannot be tapped.
            </P>
            <P>
              <span className="text-white">High-bay glare.</span> Massive metal-halide overhead lights
              wash out subtle grey-on-grey UI palettes into unreadable smears.
            </P>
            <P>
              <span className="text-white">Hangar acoustics.</span> Plasma cutters and grinders make
              shouting across the shop impossible; blockers have to be communicated digitally and
              asynchronously.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/jeevy/interview-groundstaff-weld-shop.jpg"
          alt="Field research with ground staff in the Cleburne welding bays"
          caption="Field research in the Cleburne welding bays, testing touch targets and mapping physical-digital communication breakdowns."
          ratio="aspect-[4/3]"
        />

        {/* ══ 2. BUILDING FROM GROUND TRUTH ══ */}
        <Prose>
          <H2 id="closed-loop">Designing the closed loop</H2>
          <div className="mt-8 space-y-6">
            <P>
              I didn&rsquo;t start in Figma. I spent my first weeks on the floor talking to Trevor
              Goldston, our Shop Operations Lead, and the welding crew.
            </P>
            <P>
              I realized that treating procurement as an accounting chore was why industrial software
              fails. Sourcing, inventory, blueprints, and critical-path scheduling are not separate departments; they are a single physical loop.
            </P>
            <P>
              I architected Jeevy OS around one non-negotiable invariant: steel dictates the schedule.
              Most manufacturing tools treat inventory as a passive list, but in our Gantt Critical
              Path engine, verified dock delivery dates act as hard scheduling predecessors. A weld
              task cannot be scheduled for Tuesday if the pipe flange is still on a freight truck
              arriving Thursday.
            </P>
            <P>
              To make this work across the whole facility, I designed and implemented six compounding
              modular engines.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/jeevy/prod-tasking-gantt-v.webp"
          alt="Production Gantt timeline with stalled task bars gated by supplier delivery dates"
          caption="The production Gantt timeline showing stalled task bars floored automatically by supplier delivery ETAs."
          width={1914}
          height={903}
        />

        {/* ══ 3. THE DESIGN SYSTEM CONTRACT ══ */}
        <Prose>
          <H2 id="design-system">Reconciling design tokens with physics</H2>
          <div className="mt-8 space-y-6">
            <P>
              To make the interface survive contact with the shop floor, I built and published the
              Jeevy Industrial Design System.
            </P>
            <P>I authored 101 semantic tokens grounded in strict ergonomic rules.</P>
            <P>
              <span className="text-white">The monotonic surface ladder.</span> In a high-glare
              hangar, drop shadows disappear and look like dirt smudges. Elevation is communicated
              strictly through stepped background lightness, from the app shell up through canvas,
              surface, and hover.
            </P>
            <P>
              <span className="text-white">The 44px glove touch contract.</span> Buttons maintain a
              dense 28px visual height in table rows while extending an invisible 44px hit boundary
              via pseudo-elements, so operators in welding gloves never mis-tap.
            </P>
            <P>
              <span className="text-white">Terracotta as a scalpel.</span> I restricted primary action
              accents to one button per surface, de-escalating table elements to neutral outlines to
              prevent visual fatigue.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/jeevy/ds-button-matrix.webp"
          alt="Figma button coordinate matrix showing every token-bound variant and state"
          caption="The button coordinate matrix in Figma: 750 token-bound variants mapped across 10 styles, 3 sizes, and 5 interactive states."
          width={1920}
          height={812}
        />

        {/* ══ 4. OPERATIONAL GOVERNANCE ══ */}
        <Prose>
          <H2 id="governance">An operational governance model, not a set of screens</H2>
          <div className="mt-8 space-y-6">
            <P>
              Jeevy OS sits between three groups with different incentives. The shop floor
              optimizes for throughput and wants nothing that interrupts a live weld. Procurement
              optimizes for price and lead time. Engineering answers to a commercial launch
              customer’s revision-controlled drawings and acceptance milestones. Before Jeevy, each
              group kept its own version of the truth, and the gaps between them were where money
              leaked.
            </P>
            <P>
              The deliverables map and its workstream nodes are the governance layer that connects
              them. A manager maps each physical skid assembly once; tasks, milestones and material
              allocations derive from that single structure, so the BOM the dock receives against is
              the same BOM engineering revised and procurement priced.
            </P>
          </div>
        </Prose>

        <Prose>
          <div className="mt-10 space-y-6">
            <P>
              <span className="text-white">One BOM revision, everywhere.</span> A partner facility
              lost $50,000 on a fabrication error because teams worked from mismatched BOM revisions
              in un-synced files. In Jeevy the BOM lives in one ledger that tasking, purchasing and
              the dock all read from, so a revision reaches every team instead of forking.
            </P>
            <P>
              <span className="text-white">A boundary between client reporting and shop
              execution.</span> With the VP of Technology, we agreed that milestones are
              client-facing summaries (“70% complete on Skid 1 piping”) while tasks are internal
              execution (“weld 4 of this spool”). The data model keeps the two separate, so customer
              reporting never exposes shop-level noise and shop changes never rewrite a commitment.
            </P>
            <P>
              <span className="text-white">Deployment that respects the floor.</span> Engineering
              raised that releasing every workstream at once would disrupt active welder sessions.
              We negotiated per-workstream deployment, so a manager can update Skid 2 without
              touching terminals in use on Skid 1.
            </P>
          </div>
        </Prose>

        <Prose className="mb-20">
          <div className="mt-12 space-y-6">
            <h3 className="text-[18px] font-semibold tracking-tight text-white">
              Procurement controls as margin protection
            </h3>
            <P>
              The financial risk was concrete. The legacy 15-tab sheet carried $800,036.25 in raw
              materials, and a single formula typo once silently wiped the projected margin on a
              $500k skid assembly with no change log. The procurement workflow was designed as a set
              of risk controls rather than as data entry.
            </P>
            <P>
              <span className="text-white">Spend gating in the schema.</span> Purchases above
              $1,000 require approval, enforced by a PostgreSQL check constraint rather than a UI
              rule, which keeps draft IDs structurally separate from legal PO numbers. Unapproved
              spend dropped to zero.
            </P>
            <P>
              <span className="text-white">Faster, auditable sourcing.</span> BOM-to-RFQ
              turnaround fell from about 48 hours across 15 spreadsheet tabs to under 12 minutes,
              a 96% reduction, with every material movement recorded in an append-only ledger.
            </P>
            <P>
              <span className="text-white">Live cost visibility.</span> The executive dashboard
              tracks BOM materials from on order through received and signed off, so a project
              manager sees capital stuck in transit before it becomes a schedule slip or a margin
              surprise.
            </P>
          </div>
        </Prose>

        {/* ══ 5. PRODUCTION SCALE & RETROSPECTIVE ══ */}
        <Prose>
          <H2 id="scale">Scaling to partner shops, and what it taught me</H2>
          <div className="mt-8 space-y-6">
            <P>
              Deploying software into a second fabrication plant is the real test of systems
              architecture. When we rolled out Jeevy OS to our partner manufacturing plant, shop leads
              didn&rsquo;t want custom forks; they wanted immediate clarity. Features like dynamic
              Notion-style blueprint callout columns and 1-to-N raw plate nesting gave them
              flexibility without touching the database schema.
            </P>
            <P>
              Leading this build across shop operations, procurement and engineering reinforced
              that enterprise design is fundamentally systems architecture. A sleek modal cannot fix a broken data schema, and a pretty status badge
              cannot stop an unapproved $50k spend leak. When you align database check constraints and
              physical shop-floor constraints under one rhythm, software becomes an operational
              multiplier.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/jeevy/team-onsite-cleburne.jpg"
          alt="Three of the team on-site beside a tarped skid at the Cleburne fabrication plant"
          caption="Vinay Konuru (VP Technology), Sai Tangudu (Engineering), and Pradeep Y. on-site at the Cleburne fabrication plant."
          ratio="aspect-[16/10]"
        />

        {/* ══ 6. THE SIX SUB-STORIES ══ */}
        <Prose>
          <H2 id="deep-dives">The work splits into six deep-dive systems blueprints</H2>

          <div className="mt-10 space-y-8">
            {SUB_STORIES.map((s) => (
              <div key={s.n}>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1.5 text-[18px] leading-[28px] tracking-[-0.01em] text-[#D97352] underline underline-offset-4 transition-colors hover:text-[#F2805B]"
                >
                  {s.n} / {s.title}
                  <span aria-hidden>↗</span>
                </Link>
                <p className="mt-2 text-[18px] font-normal leading-[28px] tracking-[-0.01em] text-neutral-300">
                  {s.blurb}
                </p>
              </div>
            ))}
          </div>
        </Prose>

        {/* ══ FOOTER NAV ══ */}
        <Prose className="mt-24">
          <div className="border-t border-white/10 pt-10">
            <Link
              href="/#work"
              className="inline-flex items-center gap-1.5 text-[14px] leading-relaxed text-[#D97352] underline underline-offset-4 transition-colors hover:text-[#F2805B]"
            >
              ← Return to portfolio homepage
            </Link>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
