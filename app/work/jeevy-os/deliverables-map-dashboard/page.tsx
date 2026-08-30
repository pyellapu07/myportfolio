"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Prose,
  P,
  H2,
  Figure,
  GhostLink,
  WideCallout,
  CANVAS,
  FieldNotesWall,
  TapedStickyNote,
} from "@/components/jeevy-os/editorial";
import { NodeTierLegend, SlackThread } from "@/components/jeevy-os/dashboard-artifacts";

/* ══════════════════════════════════════════════════════════════
   Engine 06: Deliverables Map & Milestones Dashboard.

   Written as a design case study: no function names, endpoints or
   table names, and one typeface throughout. Emphasis is carried by
   weight and colour, never by a switch to monospace.
   ══════════════════════════════════════════════════════════════ */

const LEGACY_FAILURES = [
  {
    finding: "The single-user bottleneck",
    detail:
      "Only the shop owner updated the master schedule with any regularity. Everyone else avoided the shared file, so coordinators worked against data that was already days stale.",
  },
  {
    finding: "A $50,000 revision mistake",
    detail:
      "With no access control and no clear version history, an old bill of materials was worked from as though it were current. The error was found on the floor, in steel.",
  },
  {
    finding: "Double data entry fatigue",
    detail:
      "Project managers re-typed the same assembly hierarchy three times: once for quoting, once for scheduling, and again for purchasing.",
  },
];

/**
 * The discovery cluster. Four voices rather than one, because the case for
 * this refactor was made by the floor, the client-facing side, the partner
 * facility and engineering independently.
 */
const STAKEHOLDER_NOTES = [
  {
    quote:
      "I want to lay out the skid structure the same way it exists physically on the floor. I don't want to rebuild the work breakdown all over again in another tab just to assign people.",
    speaker: "Trevor Goldston",
    role: "Shop Operations Lead",
  },
  {
    quote:
      "To a client, I wouldn't say we are on weld number 4 of this pipe spool. I would say we are 70% done with piping on Skid 1. Milestones are client-facing summaries; tasking is internal shop execution.",
    speaker: "Vinay Konuru",
    role: "VP Technology & Product",
  },
  {
    quote:
      "Our entire facility was running off a single shared spreadsheet. A $50,000 fabrication mistake happened simply because teams looked at mismatched BOM revisions across un-synced files.",
    speaker: "Partner facility shop lead",
    role: "Partner facility reality",
  },
  {
    quote:
      "Deploying all work streams at once is dangerous because it disrupts active welder sessions. We need selective, per-work-stream deployment so a manager can update Skid 2 without touching active floor terminals.",
    speaker: "Sai Tangudu",
    role: "Full-stack engineering",
  },
];

/** Transcribed from the thread itself rather than paraphrased. */
const SANKEY_THREAD = [
  {
    author: "Pradeep Yellapu",
    hex: "#D97352",
    time: "8:10 PM",
    body: "Loving this idea for the material breakdown. It's a Sankey diagram. We could structure the data flow from left to right to track procurement. Imagine from the left: total BOM materials, then on order, received and sign-off, then material type allocation as a percentage, pipes and spools at 25%, electrical and wiring at 15% and so on, for the received ones. I think this helps PMs get an easy glance at whether BOM materials are stuck in on order, and gives an instant idea of which parts are assigned to which tasks.",
  },
  {
    author: "Vinay Konuru",
    hex: "#16A34A",
    time: "8:25 PM",
    body: "Oh yeah, that'd be great for materials! Love Sankey diagrams.",
  },
  {
    author: "Pradeep Yellapu",
    hex: "#D97352",
    time: "8:33 PM",
    reply: true,
    body: "I last saw them on the Loki series. Oh, those are timeline branches, my bad.",
  },
];

const VERIFIED_OUTCOMES = [
  {
    lead: "Zero double data entry.",
    body: "Auto-propagating structural nodes into the tasking module eliminated manual work-breakdown re-typing entirely.",
  },
  {
    lead: "Instant bottleneck visibility.",
    body: "Tracing material dependencies through the flow diagram reduced delay identification from days to seconds.",
  },
  {
    lead: "Dual-engine progress parity.",
    body: "Shop-floor completion signals and high-level contract milestones stay synchronised, removing status reporting discrepancies.",
  },
  {
    lead: "Safe structural governance.",
    body: "Draft and deploy sandboxing prevented accidental floor disruption during active shift operations.",
  },
];

export default function DeliverablesMapDashboardPage() {
  return (
    <div data-ds="v1" className="min-h-screen" style={{ background: CANVAS }}>
      {/* `initialDark` means "render dark text", so it is false on this
          dark canvas. It flips to dark automatically once scrolled,
          when the header paints its own white bar. */}
      <Header initialDark={false} />

      <article className="pb-28 pt-28">
        {/* ══ HEADER ══ */}
        <Prose>
          <nav aria-label="Breadcrumb">
            <Link
              href="/work/jeevy-os"
              className="text-[12px] font-medium tracking-wide text-neutral-400 transition-colors hover:text-white"
            >
              ← Case Studies / Jeevy Industrial OS / 06. Deliverables &amp; Milestones Dashboard
            </Link>
          </nav>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            Spatial blueprinting and the zero-redundancy project command center
          </h1>

          <p className="mt-3 max-w-[720px] text-[14px] font-normal leading-[22px] text-neutral-400">
            How I eliminated double data entry across manufacturing project management, unifying
            spatial build breakdown, dual-engine milestone tracking, live dock procurement sentinels
            and financial material flow into a single connected command center.
          </p>
        </Prose>

        <Figure
          src="/jeevy/dm-deliverables-map.webp"
          alt="The production deliverables map: an orange project root above a green workstream, branching into slate assembly groups and graphite task cards"
          caption="The production Deliverables Map. The orange root carries the project, the green node is the build program, slate headers are assembly groups holding rollup fractions such as 51 of 168, and graphite cards are the executable operations. The header states the boundary out loud: physical structural breakdown, separate from milestones."
          width={1537}
          height={852}
          priority
        />

        {/* ══ 1. THE ORIGIN ══ */}
        <Prose>
          <H2 id="origin">The $50,000 cost of running a hangar on a shared drive</H2>
          <div className="mt-8 space-y-6">
            <P>
              Custom aerospace manufacturing means orchestrating multi-ton piping skids,
              high-pressure vessels and thousands of raw fittings under strict delivery windows. A
              representative scope reads: an 8 inch Schedule 40 piping skid build, four
              sub-assemblies in 304L and 316L, with all piping hydrostatically tested and certified
              to client aerospace standards before final assembly sign-off.
            </P>
            <P>
              Yet across partner fabrication facilities, the entire operation ran off fragmented
              spreadsheets on a shared drive. That baseline created constant operational
              vulnerability.
            </P>
          </div>

          <div className="mt-10 border-t border-white/[0.08]">
            {LEGACY_FAILURES.map((f) => (
              <div
                key={f.finding}
                className="grid grid-cols-1 gap-x-8 gap-y-1 border-b border-white/[0.06] py-5 md:grid-cols-12"
              >
                <h3 className="text-[14px] font-medium leading-[22px] text-white md:col-span-5">
                  {f.finding}
                </h3>
                <p className="text-[14px] leading-[22px] text-neutral-400 md:col-span-7">
                  {f.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-6">
            <P>
              When Vinay Konuru, VP of Product and Technology, opened the request, he did not send a
              specification. He sent a photograph of the shop monitor.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/dm-legacy-shop-monitor.webp"
          alt="A photograph of a partner facility shop floor monitor running the legacy project status report as a colour-coded Excel workbook"
          caption="The baseline: a project status workbook on a shop monitor, its tabs and hand-coloured cells kept deliberately illegible. This photograph was the feature request."
          width={1920}
          height={1440}
        />

        <Prose>
          <blockquote className="border-l border-white/20 pl-6">
            <p className="text-[18px] font-normal leading-[28px] tracking-[-0.01em] text-white">
              &ldquo;We&rsquo;ve discussed in the past the need for tracking milestone progress
              markers on projects. I&rsquo;d like you to build a milestone builder and tracker for
              quotes and projects. This will give users a quick check on where we&rsquo;re at on the
              project, and allow us to get a total export on the project. Milestones can be connected
              up to line items in tasking.&rdquo;
            </p>
            <footer className="mt-3 text-[14px] leading-relaxed text-neutral-400">
              Vinay Konuru, VP Product &amp; Technology · project inception, July 2026
            </footer>
          </blockquote>
        </Prose>

        <FieldNotesWall notes={STAKEHOLDER_NOTES} />

        <Prose>
          <div className="space-y-6">
            <P>
              My first exploration tried to answer all of that on one screen. If the data existed, it
              got a panel: task counts, burn-down curves, activity feeds, progress rings. It reviewed
              well as a picture, and Vinay&rsquo;s note above is what ended it.
            </P>
            <P>
              That is not a critique of a layout, it is a scope boundary, and once it was named the
              architecture fell out of it.{" "}
              <span className="font-medium text-white">The Deliverables Map owns structure:</span>{" "}
              what is being built and how it decomposes physically, which is the client-facing model.{" "}
              <span className="font-medium text-white">Tasking owns execution:</span> who is doing the
              work, on which shift, against which weld, which a client should never see.
            </P>
            <P>
              The failed exploration was trying to show both at once, which is why it read as
              decoration. A chart is not insight if nobody on the floor is producing the number it
              plots.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/dm-midfid-dashboard.webp"
          alt="The mid-fidelity dashboard exploration with a details panel, upcoming deliveries, a deliverables map snippet and a project progress rail"
          caption="The exploration that got the pushback: four panels competing for one screen, several of them charting data the shop did not actually produce."
          width={1920}
          height={885}
        />

        {/* ══ 2. SPATIAL BLUEPRINTING ══ */}
        <Prose>
          <H2 id="spatial">Spatial blueprinting on an infinite canvas</H2>
          <div className="mt-8 space-y-6">
            <P>
              Manufacturing coordinators do not think in flat table rows. They think in skid frames,
              pipe manifolds and sub-assemblies, arranged in space. So I built the Deliverables Map
              as an infinite canvas with a strict four-tier hierarchy, where depth in the tree means
              depth in the physical build.
            </P>
          </div>
        </Prose>

        <NodeTierLegend />

        <Figure
          size="prose"
          src="/jeevy/dm-node-detail.webp"
          alt="Detail of the deliverables map nodes showing rollup fractions, milestone star badges, date windows, assignees and blocked node flags"
          caption="Node detail at working scale. Each group carries its date window, its rollup fraction, and the exceptions raised underneath it, so the shape of the tree already tells you where the trouble is."
          width={1043}
          height={1193}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              <span className="font-medium text-white">The structure cascades downstream.</span> The
              spatial breakdown is the single source of truth for build structure, so laying out a
              workstream and nesting operations under it generates the executable task rows
              automatically. Nobody re-types a hierarchy that already exists.
            </P>
            <P>
              This is where the double data entry went. It was never a discipline problem. The same
              structure genuinely was needed in three places, and until one of them owned it, all
              three had to be maintained by hand.
            </P>
          </div>
        </Prose>

        <TapedStickyNote
          tilt="left"
          eyebrow="Architecture huddle · August 13, 2026"
          quote="&ldquo;Forcing users to choose between a task or a group upfront creates friction. Treat everything like a clean to-do item. The moment an engineer nests a sub-operation underneath it, it should automatically convert into a group envelope.&rdquo;"
          attribution="Vinay Konuru &amp; Sai Tangudu"
          role="Product &amp; engineering consensus"
        />

        <Figure
          size="compact"
          src="/jeevy/dm-tasking-autogen.webp"
          alt="The tasking tab populated automatically from the deliverables map hierarchy"
          caption="The tasking view, generated from the map rather than entered into. The hierarchy arrives already built, and the shop adds only what is theirs: assignment, timing and progress."
          width={540}
          height={591}
        />

        {/* ══ 3. DUAL-ENGINE MILESTONES ══ */}
        <Prose>
          <H2 id="milestones">Automated signals and contract gates</H2>
          <div className="mt-8 space-y-6">
            <P>
              A manufacturing schedule carries two different kinds of milestone, and conflating them
              is what makes most project tools untrustworthy. One kind is objective physical
              progress. The other is a formal commercial gate. They are measured differently, so they
              are built differently.
            </P>
            <P>
              <span className="font-medium text-white">Auto-linked milestones.</span> A coordinator
              promotes any node on the map to a milestone with its star control. Its fraction and
              completion bar are then computed from the work signals underneath it, so the number
              moves when the floor moves and nobody maintains it.
            </P>
            <P>
              <span className="font-medium text-white">Manual checkpoints.</span> Commercial
              sign-offs such as hydrotest certification or invoice approval are created by hand and
              carry no percentage at all. A contract gate is either met or it is not, and inventing a
              completion figure for one would be worse than showing nothing.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/dm-milestone-auto.webp"
          alt="An auto-linked milestone promoted from a map node, showing its computed completion fraction"
          caption="An auto-linked milestone: promoted from a map node, with its fraction computed from the work beneath it."
          width={417}
          height={163}
        />

        <Figure
          size="prose"
          src="/jeevy/dm-milestone-manual.webp"
          alt="The new milestone dialog with a name field and an optional target date, and no percentage field"
          caption="The manual checkpoint dialog. A name and an optional target date, and deliberately no completion percentage: a contract gate is met or it is not."
          width={762}
          height={501}
        />

        {/* ══ 4. MATERIAL FLOW ══ */}
        <Prose>
          <H2 id="material-flow">Tracing bottlenecks through a financial flow diagram</H2>
          <div className="mt-8 space-y-6">
            <P>
              When a purchase order slips, a project manager needs one answer: which assembly steps
              are now starved of hardware. That is a flow question, not a table question, so I
              proposed a Sankey diagram in an ideation thread.
            </P>
          </div>
        </Prose>

        <SlackThread
          header="Design ideation · material flow visualisation thread"
          date="August 7, 2026"
          messages={SANKEY_THREAD}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              The flow runs in four tiers, left to right: the total project bill of materials, its
              supply status, the engineering category it belongs to, and the tasks that consume it.
              Read across, it answers where the money is sitting and what that money is holding up.
            </P>
            <P>
              <span className="font-medium text-white">Bottleneck tracing.</span> When a delivery is
              late, the affected ribbons turn crimson and carry an exception marker, so the eye
              follows the problem from the stalled order to the operation it is blocking without
              anyone running a query.
            </P>
            <P>
              <span className="font-medium text-white">Quantities or dollars.</span> The same flow
              can be scaled by item count or by financial exposure. Toggling to dollars re-weights
              every ribbon, which turns the diagram into a cash-flow review and makes it obvious when
              a single high-value capital component deserves expediting ahead of a larger pile of
              consumables.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/dm-sankey-dollars.webp"
          alt="The material flow Sankey in dollar mode, tracing a total bill of materials through supply status and category into tasks, with crimson delay ribbons"
          caption="Material flow in dollar mode: $219K of bill of materials resolving through $132K on order, $68K received and $20K signed off, into categories and then into the operations that consume them. The crimson ribbons carry the delays. The tasks tier is labelled in-product as proposed and not yet connected, which is the honest state of it today."
          width={1920}
          height={839}
        />

        {/* ══ 5. DRAFT AND DEPLOY ══ */}
        <Prose>
          <H2 id="deploy">Draft and deploy, borrowed from version control</H2>
          <div className="mt-8 space-y-6">
            <P>
              Restructuring a live project pushes changes to terminals that crews are actively
              working from. A re-parented assembly is an improvement to a planner and an interruption
              to a welder, which is the risk Sai named in the discovery notes above.
            </P>
          </div>
        </Prose>

        <Prose>
          <div className="space-y-6">
            <P>
              <span className="font-medium text-white">An isolated draft workspace.</span>{" "}
              Re-parenting sub-assemblies and creating new groups happens inside a draft version of
              the blueprint. The floor keeps running on the deployed one, so structural thinking
              costs the shop nothing until somebody decides it is ready.
            </P>
            <P>
              <span className="font-medium text-white">Selective deployment.</span> Changes ship per
              workstream through a deploy control with checkboxes, rather than as a single
              all-or-nothing overwrite. A coordinator can release the part they are confident about
              and keep working on the rest.
            </P>
            <P>
              <span className="font-medium text-white">Validation before release.</span> Deploying
              runs a sweep for circular dependencies and orphaned constraints first. The check exists
              because the failure it prevents is silent: a structure that looks correct on the canvas
              and deadlocks on the floor.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/dm-deploy-control.webp"
          alt="The blueprint version control array showing the active draft, a deploy dropdown with per-workstream checkboxes, and the validation action"
          caption="The blueprint version control: the active draft, per-workstream deploy selection, and the validation sweep that runs before anything reaches a floor terminal."
          width={464}
          height={293}
        />

        {/* ══ 6. OUTCOMES ══ */}
        <WideCallout label="Verified Outcomes" items={VERIFIED_OUTCOMES} />

        <Prose>
          <H2 id="reflection">One structural core, not more tabs</H2>
          <div className="mt-8 space-y-6">
            <P>
              The refactor proved that a complex manufacturing operation does not need more separate
              feature tabs. It needs one structural core that everything else reads from.
            </P>
            <P>
              Treating the physical skid build as the primary model is what made the rest resolve.
              Task dispatch, milestone reporting and procurement tracking stopped being three systems
              that had to be kept in agreement and became three views of the same object.
            </P>
            <P>
              The August 5 pushback is the part I would keep. A screen full of charts looked like
              progress and was actually the opposite, and it took someone who works the floor to say
              so. The same instinct runs through the{" "}
              <GhostLink href="/work/jeevy-os/tasking-cpm-engine">
                tasking and critical path engine ↗
              </GhostLink>
              , where the constraint was physical steel rather than scope.
            </P>
          </div>
        </Prose>

        {/* ══ 7. BOTTOM RAIL ══ */}
        <Prose>
          <div className="flex flex-col gap-5 border-t border-white/10 pt-10">
            <GhostLink href="/work/jeevy-os/tasking-cpm-engine" size={14}>
              ← Previous blueprint: 05. Tasking &amp; Critical Path Scheduling
            </GhostLink>
            <GhostLink href="/work/jeevy-os/materials-procurement" size={14}>
              Next blueprint: 01. Field Materials &amp; Mobile Yard Logistics →
            </GhostLink>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
