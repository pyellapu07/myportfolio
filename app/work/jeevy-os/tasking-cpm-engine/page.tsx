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
  EngineeringSyncConsensus,
} from "@/components/jeevy-os/editorial";
import {
  GanttStatusLegend,
  MaterialCardStates,
  PilotMigrationFindings,
} from "@/components/jeevy-os/cpm-artifacts";

/* ══════════════════════════════════════════════════════════════
   Engine 05: Tasking & Critical Path Scheduling.

   Written as a design case study, not an engineering write-up:
   no function names, endpoints, status codes or table names, and
   no monospace anywhere in the running text. Emphasis is carried
   by weight and colour in the same typeface as the body.
   ══════════════════════════════════════════════════════════════ */

const LEGACY_FAILURES = [
  {
    finding: "Phantom start dates",
    detail:
      "The timeline claimed a crew could begin welding a 40-foot skid on Monday morning while the required structural steel was still on a vendor truck outside Dallas.",
  },
  {
    finding: "Supply over-allocation",
    detail:
      "Multiple coordinators claimed the same 10-unit purchase order with no inventory pooling, so two separate teams believed they had parts only one would receive.",
  },
  {
    finding: "Moving target distortions",
    detail:
      "Float was calculated against whichever task finished last, so arbitrary end tasks were highlighted as critical while real slips against client delivery milestones stayed masked.",
  },
  {
    finding: "Destructive subtask grouping",
    detail:
      "Adding a subtask to an active job converted the row into a generic container, silently breaking its linked material constraints and its task history.",
  },
];

/** Decisions settled with engineering rather than derived from a document. */
const CONSENSUS = [
  {
    topic: "Subtask gating and container integrity",
    decision:
      "Once a task is live, whether it is in progress, stalled, awaiting review or complete, it can no longer be converted into a group. Only work that has not started can become a container. That single rule is what prevents split labour timers and orphaned material allocations.",
  },
  {
    topic: "The four-day calendar and status purple",
    decision:
      "The shop-floor anchor respects the facility's Monday through Thursday schedule, so a Friday delivery schedules the earliest weld for Monday morning. Purple stays quarantined to material dependencies and is never permitted on a standard interface button.",
  },
];

const VERIFIED_OUTCOMES = [
  {
    lead: "100% physical material gating.",
    body: "Phantom start dates eliminated by flooring task readiness against verified dock receipts.",
  },
  {
    lead: "Zero supply over-allocation.",
    body: "Available-to-promise pooling structurally prevents duplicate inventory claims across simultaneous workstreams.",
  },
  {
    lead: "Non-destructive grouping.",
    body: "Re-pointing constraints on subtask creation eliminated orphaned material links and broken dependency chains.",
  },
  {
    lead: "31 production files migrated.",
    body: "Design System v1.0.0 validated in production, eliminating table row bloat and unmapped styling debt.",
  },
];

export default function TaskingCpmEnginePage() {
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
              ← Case Studies / Jeevy Industrial OS / 05. Tasking &amp; Critical Path Scheduling
            </Link>
          </nav>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            Bridging physical steel with critical path scheduling
          </h1>

          <p className="mt-3 max-w-[720px] text-[14px] font-normal leading-[22px] text-neutral-400">
            How I integrated warehouse dock receipts as first-class scheduling dependencies,
            engineered inventory supply pooling, anchored Gantt backward passes to expose contractual
            delivery risk, and proved Design System v1.0.0 across 31 production files.
          </p>
        </Prose>

        <Figure
          src="/jeevy/cpm-gantt-gated.webp"
          alt="The production Gantt engine showing a purple material-stalled bar auto-shifted to a delivery date, azure in-progress bars, and a crimson critical path chain"
          caption="The production Gantt scheduling engine: material-gated purple stalled bars annotated with the delivery they are waiting on, active azure workstreams, and a crimson critical path chain under delivery pressure."
          width={1920}
          height={888}
          priority
        />

        {/* ══ 1. THE DISCONNECT ══ */}
        <Prose>
          <H2 id="disconnect">When a schedule ignores the flatbed truck</H2>
          <div className="mt-8 space-y-6">
            <P>
              In heavy industrial manufacturing, scheduling tools frequently operate in corporate
              fiction. Traditional Gantt software places tasks based solely on typed calendar dates
              and task dependencies, assuming raw materials and hardware exist out of thin air.
            </P>
            <P>On the hangar floor, that assumption created daily operational friction.</P>
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
              I redesigned the scheduling engine to make physical warehouse deliveries a first-class
              scheduling predecessor, synchronising dock receipts directly with the active project
              timeline.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/cpm-legacy-gantt.webp"
          alt="The legacy Gantt view with un-gated start dates, detached bar captions and arbitrary critical path highlights"
          caption="The legacy Gantt view: un-gated start dates, detached bar captions, and arbitrary critical path highlights with no link to inventory."
          width={1914}
          height={903}
        />

        {/* ══ 2. THE 31-FILE PILOT ══ */}
        <Prose>
          <H2 id="pilot">Proving Design System v1.0.0 on our densest operational surface</H2>
          <div className="mt-8 space-y-6">
            <P>
              Before rolling the design system across the entire OS, the Tasking module served as the
              end-to-end pilot migration, 31 production files in all. It was the right proving ground
              precisely because it is the densest interface in the platform: a thousand rows of real
              project data will find a spacing rule that a static frame of six rows never will.
            </P>
            <P>
              Testing on live datasets surfaced physical constraints that no amount of review in a
              design file could have caught.
            </P>
          </div>
        </Prose>

        <PilotMigrationFindings />

        <Figure
          src="/jeevy/cpm-overview-workstreams.webp"
          alt="The production work streams overview with recessed cards, 1px sand borders, pinned health sentinels and de-escalated actions"
          caption="Production work streams overview: resting cards recede into clean dark surfaces with 1px sand borders, de-escalated action hierarchies, and pinned health sentinels."
          width={1914}
          height={883}
        />

        <Figure
          src="/jeevy/cpm-tasking-table-view.webp"
          alt="The production tasking table view with dense rows, inline material chips, hierarchical tree nesting and status pills"
          caption="Production tasking table view: dense 28px row actions, inline material chips carrying the delivery and its received ratio, and hierarchical tree nesting."
          width={1914}
          height={903}
        />

        <EngineeringSyncConsensus
          header="Engineering alignment · systems consensus with Sai Tangudu (full-stack engineering)"
          columns={CONSENSUS}
        />

        {/* ══ 3. MATERIAL GATING ══ */}
        <Prose>
          <H2 id="anchor">The shop-floor anchor and automated status lifecycles</H2>
          <div className="mt-8 space-y-6">
            <P>
              To guarantee that work cannot be scheduled before physical parts arrive, a
              task&rsquo;s earliest start is bounded by four operational constraints: its planned
              dates, its preceding tasks, its vendor delivery dates, and the shop-floor anchor. The
              latest of the four wins, because a constraint that can be overridden is not a
              constraint.
            </P>
            <P>
              <span className="font-medium text-white">The shop-floor anchor.</span> If a
              task&rsquo;s planned start has already passed while it sat waiting on delayed
              materials, an arrival today cannot revive an expired date in the past. The system snaps
              earliest fabrication forward to the active work shift, which is the only date a fitter
              can actually act on.
            </P>
            <P>
              <span className="font-medium text-white">Plant working calendar awareness.</span> The
              anchor respects the facility&rsquo;s four-day schedule, Monday through Thursday, so a
              Friday delivery schedules the earliest weld for Monday morning rather than for a day
              nobody is in the bay. The timeline says so on the bar itself rather than leaving the
              coordinator to work out why a date moved.
            </P>
            <P>
              <span className="font-medium text-white">Status purple isolation.</span> Purple is
              quarantined strictly as a material dependency indicator, powering the package badge,
              the purchase order tag and the stalled timeline bar. It is never allowed on a standard
              interface button, so a coordinator scanning a wall-mounted timeline can find every
              material blocker without reading a word.
            </P>
          </div>
        </Prose>

        <GanttStatusLegend />

        {/* ══ 4. ATP POOLING ══ */}
        <Prose>
          <H2 id="atp">Available-to-promise pooling and progressive disclosure</H2>
          <div className="mt-8 space-y-6">
            <P>
              A purchase order line is a finite pool, but the legacy system let every task claim
              against it independently. Two coordinators could each allocate the same eight units and
              both believe they were covered until the truck arrived. I implemented an
              available-to-promise model that calculates unallocated stock in real time, deducting
              every other task&rsquo;s claim before it will accept a new one.
            </P>
            <P>
              The arithmetic was the easy half. The harder half was showing it without turning every
              row into a spreadsheet, so the material link modal was rebuilt around progressive
              disclosure: fast to scan by default, complete on demand.
            </P>
            <P>
              <span className="font-medium text-white">Clean primary scannability.</span> Each line
              shows only what an operator needs to decide: the part title, the shipping status such
              as <span className="font-medium text-white">In-transit · ETA Aug 28</span>, the
              allocated ratio <span className="font-medium text-white">1 / 3</span>, and a single
              link trigger. Everything else is one interaction away.
            </P>
            <P>
              <span className="font-medium text-white">The over-allocation lock.</span> When a line
              is fully committed elsewhere, the stepper locks to{" "}
              <span className="font-medium text-white">1 / 0</span> and the row says so in plain
              words, fully allocated, nothing left to link, with the trigger disabled. A disabled
              control that does not explain itself is just a bug the user cannot report.
            </P>
            <P>
              <span className="font-medium text-white">Claimant popovers on demand.</span> Clicking
              an allocation ratio opens the breakdown: total ordered, what has actually landed at the
              dock, the unallocated balance, and the specific tasks currently holding units. That
              last part is what turns a refusal into a negotiation, because the coordinator who is
              blocked can now see exactly who to go and ask.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/jeevy/cpm-link-material-picker.webp"
          alt="The material link modal showing clean line rows with allocation ratios, a fully-allocated lock, and an open claimant breakdown popover"
          caption="The material link modal: progressive disclosure showing clean 1 of 3 allocations, a fully-allocated lock, and an interactive claimant breakdown naming the three tasks currently holding units."
          width={780}
          height={611}
        />

        {/* ══ 5. NON-DESTRUCTIVE GROUPING ══ */}
        <Prose>
          <H2 id="grouping">Non-destructive subtask grouping and drawer cards</H2>
          <div className="mt-8 space-y-6">
            <P>
              In legacy tasking systems, adding a subtask to an active job converted the row into a
              parent container and permanently destroyed its material links and dependencies. Which
              meant the safest thing a coordinator could do with a live task was leave it alone.
            </P>
            <P>
              <span className="font-medium text-white">Live constraint re-pointing.</span> When a
              task becomes a parent group, its material links and predecessor dependencies transfer
              automatically to the first subtask, preserving allocated quantities and history rather
              than recreating them. Nothing is dropped, so nothing has to be re-entered.
            </P>
            <P>
              <span className="font-medium text-white">Dynamic rollup envelopes.</span> The parent
              derives its timeline from its children, spanning the earliest child start to the latest
              child finish, so a summary bar can never contradict the work underneath it.
            </P>
            <P>
              Inside the task inspection drawer, material items render as structured state cards
              rather than flat text tags. A tag reading &ldquo;pending&rdquo; tells a coordinator
              nothing they can act on. A count and a date do.
            </P>
          </div>
        </Prose>

        <MaterialCardStates />

        <Figure
          size="prose"
          src="/jeevy/cpm-task-drawer-materials.webp"
          alt="The task drawer required materials list showing a met requirement, an in-transit partial receipt, and a slipped delivery with the superseded date struck through"
          caption="Task inspection drawer with structured material cards: requirement met at 2 of 2, an in-transit partial receipt at 1 of 2, and a slipped vendor ETA with the superseded baseline date struck through beside it."
          width={710}
          height={545}
        />

        {/* ══ 6. NEGATIVE FLOAT ══ */}
        <Prose>
          <H2 id="critical-path">
            Exposing true negative float against contractual launch pad delivery deadlines
          </H2>
          <div className="mt-8 space-y-6">
            <P>
              Traditional project management algorithms calculate float relative to whichever task
              happens to finish last. In aerospace fabrication that produces a dangerous blind spot:
              the algorithm moves the goalposts as the work slips, masking the upstream delays that
              threaten a fixed customer delivery date.
            </P>
            <P>
              I redesigned the backward pass to anchor directly to the workstream target delivery
              milestone. The deadline is fixed by contract, so the arithmetic should treat it as
              fixed.
            </P>
            <P>
              <span className="font-medium text-white">True negative float.</span> When an assembly
              chain slips past its contract delivery date, float drops below zero and the entire
              delayed sequence renders in crimson, making schedule pressure obvious at a glance. The
              value is not clamped, because a chain four days late and a chain one day late need
              different responses.
            </P>
            <P>
              <span className="font-medium text-white">Honest slack representation.</span> When work
              is comfortably ahead, the timeline displays zero critical path pressure rather than
              arbitrarily colouring the final task red. An indicator that is always populated teaches
              people to ignore it.
            </P>
            <P>
              <span className="font-medium text-white">Automatic graph recalculation.</span> Any
              delivery date change logged by purchasing updates downstream floats across the active
              project graph in real time. A vendor email at four in the afternoon moves the timeline
              before anyone has opened it.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/cpm-schedule-pressure.webp"
          alt="The critical path view with a crimson chain, a zero float advisory in the drawer, and annotations showing tasks shifted around off days and delivery dates"
          caption="Critical path schedule pressure: the backward pass anchored to the workstream target deadline, with the drawer stating the consequence rather than the metric, and bars annotating why each of them moved."
          width={1920}
          height={891}
        />

        {/* ══ 7. OUTCOMES ══ */}
        <WideCallout label="Verified Outcomes" items={VERIFIED_OUTCOMES} />

        <Prose>
          <H2 id="reflection">Scheduling without physical inventory is fiction</H2>
          <div className="mt-8 space-y-6">
            <P>
              The core insight of Engine 05 was proving that scheduling software cannot live in
              isolation from the shop floor and the warehouse. Every failure in the legacy system
              traced back to the same root: the timeline had no channel through which physical
              reality could reach it.
            </P>
            <P>
              When vendor delivery slips, dock receipts and piecework progress are embedded directly
              into the scheduling graph, the Gantt chart stops being a decorative presentation of the
              plan and becomes an authoritative industrial operating tool. The same instinct runs
              through the{" "}
              <GhostLink href="/work/jeevy-os/materials-procurement">
                materials and procurement ledger ↗
              </GhostLink>
              , where the constraint was the receipt rather than the schedule.
            </P>
          </div>
        </Prose>

        {/* ══ 8. BOTTOM RAIL ══ */}
        <Prose>
          <div className="flex flex-col gap-5 border-t border-white/10 pt-10">
            <GhostLink href="/work/jeevy-os/industrial-design-system" size={14}>
              ← Previous blueprint: 04. Industrial Design System (v1.0.0)
            </GhostLink>
            <GhostLink href="/work/jeevy-os/deliverables-map-dashboard" size={14}>
              Next blueprint: 06. Deliverables &amp; Milestones Dashboard →
            </GhostLink>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
