"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Prose,
  P,
  H2,
  Caption,
  Figure,
  Wide,
  GhostLink,
  FieldNotesWall,
  WideCallout,
  CANVAS,
} from "@/components/jeevy-os/editorial";
import { DualClockDiagram } from "@/components/jeevy-os/kiosk-diagram";

/* ══════════════════════════════════════════════════════════════
   Engine 02: Shop-Floor Kiosk UX & Worker Feedback System.
   Same editorial language as the hub and Engine 01: 720px prose
   measure, 960px breakout for media, 28/18/14/12 type, no cards.
   ══════════════════════════════════════════════════════════════ */

/** Verbatim quotes from the contextual inquiries in the welding bays. */
const FIELD_NOTES = [
  {
    quote:
      "Welders shouldn't have to take off heavy gloves, walk 200 feet across the hangar, or call around just to report a completed joint or ask for crane support.",
    speaker: "Project Manager · fabrication",
  },
  {
    quote:
      "I clock in every day, but I never know what hours actually got recorded until Friday. If there's a payroll discrepancy, it turns into an argument after the fact.",
    speaker: "Weld Operator · pipe",
  },
  {
    quote:
      "In heavy fab, you're always jumping in to help fit a multi-ton frame. If I can't clock in to another guy's task, the system treats me as idle and PMs question my productivity.",
    speaker: "Weld Operator · steel department",
  },
  {
    quote:
      "When we run out of flanges or gussets, there's no way to put a task on hold. We end up clocking in and out aimlessly, with blocked jobs cluttering the terminal screen.",
    speaker: "Lead Fitter · pipe",
  },
];

const VERIFIED_OUTCOMES = [
  {
    lead: "92% authentication speedup.",
    body: "Ephemeral 6-digit PIN logins cut terminal authentication from ~30 seconds to under 3, while eliminating session cross-contamination on shared tablets.",
  },
  {
    lead: "12-minute blocker resolution.",
    body: "Mandatory pending-exit notes reduced supervisory resolution lag from roughly 4 hours to under 12 minutes.",
  },
  {
    lead: "100% net labor accuracy.",
    body: "Frozen break arithmetic and database-enforced single sessions eliminated phantom fabrication costs across every active heavy industrial process skid and cryogenic pressure vessel build.",
  },
  {
    lead: "100% bilingual floor adoption.",
    body: "Complete Spanish parity removed translation errors and operational onboarding friction across the entire workforce.",
  },
];

export default function ShopKioskFeedbackPage() {
  return (
    <div data-ds="v1" className="min-h-screen" style={{ background: CANVAS }}>
        {/* A dark surface keeps the bar dark and its text light at every
            scroll position, rather than dropping a white slab onto the page. */}
      <Header surface="dark" />

      <article className="pb-28 pt-28">
        {/* ══ HEADER ══ */}
        <Prose>
          <nav aria-label="Breadcrumb">
            <Link
              href="/work/jeevy-os"
              className="font-mono text-[12px] uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
            >
              ← Case Studies / Jeevy Industrial OS / 02. Shop Kiosk &amp; Worker Feedback
            </Link>
          </nav>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            Designing for the Human Holding the Welding Torch
          </h1>

          <div className="mt-8">
            <P>
              How I transformed an un-opinionated two-button clock-in wrapper into an asynchronous
              shop-floor feedback engine with ephemeral PIN sessions, dual-clock frozen break
              arithmetic, tri-state blocker escalation, and a 275-key zero-drift bilingual contract.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/kiosk-shop-home-v.webp"
          alt="Production kiosk worker dashboard showing the active task banner, elapsed timer, and category filters"
          caption="Production worker dashboard displaying the active task banner, elapsed timer, Lunch break trigger, and category filters."
          width={1912}
          height={900}
          priority
        />

        {/* ══ 1. THE TWO-BUTTON FAILURE ══ */}
        <Prose>
          <H2 id="two-button">The illusion of simple time tracking</H2>
          <div className="mt-8 space-y-6">
            <P>
              When enterprise software vendors design manufacturing software, they default to a binary
              model: an employee is either clocked in, or clocked out. Nothing in between is
              expressible.
            </P>
            <P>
              When I arrived at our Cleburne fabrication plant, the terminal running on our shop floor
              was a bare two-button wrapper. It was built for back-office payroll compliance, but as an
              operational tool it was broken.
            </P>
            <P>
              <span className="text-white">The finished-task dilemma.</span> When a welder finished a
              four-hour root-pass weld on a cryogenic pipe spool, there was no completion button. The
              task stayed open until a supervisor noticed, leaving active work indistinguishable from
              tasks nobody had touched.
            </P>
            <P>
              <span className="text-white">Silent material starvation.</span> When fitters ran out of
              structural gussets or discovered misaligned flanges, they walked away. The timer kept
              running against the job budget, poisoning job-costing takeoffs while the physical blocker
              lived only in the worker&rsquo;s head.
            </P>
            <P>
              <span className="text-white">Unpaid lunch distortion.</span> If a welder took a 45-minute
              unpaid lunch during a weldment, the legacy system added that time directly into
              fabrication labor, falsely reporting artificial inefficiency to management.
            </P>
            <P>
              <span className="text-white">The monolingual wall.</span> The entire system was
              English-only, creating daily hesitation and translation overhead across a predominantly
              Spanish-speaking welding crew.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/kiosk-legacy-home.webp"
          alt="The legacy two-button kiosk interface with no task context or escalation path"
          caption="The legacy two-button kiosk baseline: zero task categorization, no shift context, and no digital escalation path."
          width={1917}
          height={906}
        />

        {/* ══ 2. FIELD RESEARCH ══ */}
        <Prose>
          <H2 id="field-notes">What we heard in the welding bays</H2>
          <div className="mt-8 space-y-6">
            <P>
              I spent two weeks running contextual inquiries in the active welding bays, watching how
              operators handled pipe spools, heavy gauntlets, and paper weldment travelers under
              metal-halide glare.
            </P>
          </div>
        </Prose>

        <FieldNotesWall notes={FIELD_NOTES} />

        <Figure
          src="/jeevy/kiosk-user-testing.webp"
          alt="Usability validation session with shop-floor crew testing PIN entry on a tablet"
          caption="Usability validation session with shop-floor crew testing 6-digit PIN entry and shift reconciliation flows."
          width={2400}
          height={1800}
        />

        {/* ══ 3. ARCHITECTURE ══ */}
        <Prose>
          <H2 id="architecture">Dual-clock architecture and ephemeral PIN identity</H2>
          <div className="mt-8 space-y-6">
            <P>
              To support dozens of rotating workers sharing rugged tablets mounted to structural steel
              columns, I engineered a dual-layer architecture kept deliberately separate from corporate
              SSO.
            </P>
            <P>
              The split took a while to find. My first sketches tried to keep one clock and infer the
              rest, and it fell apart the moment a worker was on site but between jobs.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/kiosk-wireframe-shift-flows.webp"
          alt="Low-fidelity wireframe exploring the split between Shop In and task clock-in with end-of-shift reconciliation"
          caption="Early low-fidelity wireframe exploring the split between Shop In and local Task Clock-In, including end-of-shift reconciliation."
          width={1250}
          height={833}
        />

        <div className="my-16">
          <Wide>
            <div className="overflow-x-auto">
              <DualClockDiagram />
            </div>
            <Caption>
              Shop presence and direct task labour are recorded on two separate clocks, so a worker can
              be on site without a job absorbing their time.
            </Caption>
          </Wide>
        </div>

        <Prose>
          <div className="space-y-6">
            <P>
              <span className="text-white">Ephemeral PIN authentication.</span> Workers authenticate
              with a 6-digit PIN mapped to an ephemeral session. The server invalidates tokens on
              inactivity timeout or shift checkout, which is what prevents one worker&rsquo;s hours
              landing under another&rsquo;s name on a shared terminal.
            </P>
            <P>
              <span className="text-white">The dual-clock time model.</span> Fabrication accounting
              separates physical site presence from active fabrication labor. A database-level unique
              index on (shop_id, personnel_id) guarantees no operator can hold multiple concurrent
              sessions.
            </P>
            <P>
              <span className="text-white">Atomic break arithmetic.</span> Tapping Lunch freezes the
              on-screen task timer immediately. When the worker returns, the counter resumes from the
              exact pre-break minute: 40m stays 40m through lunch and resumes at 41m. On the backend,
              gross elapsed time minus break overlap yields net labor.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/kiosk-pin-entry.webp"
          alt="Production PIN keypad with large high-contrast circular touch keys"
          caption="Production PIN keypad featuring high-contrast 64px circular touch keys with 44px invisible hit-target contracts."
          width={2400}
          height={1128}
        />

        {/* ══ 4. FEEDBACK LOOP ══ */}
        <Prose>
          <H2 id="feedback-loop">Tri-state task resolution and blocker escalation</H2>
          <div className="mt-8 space-y-6">
            <P>
              Clocking out of a task triggers a tri-state exit modal that replaces shouting across the
              bay with structured digital escalation.
            </P>
            <P>
              <span className="text-white">Done.</span> Routes the task to the PM review queue for
              supervisory inspection and marks the item ready for client QA.
            </P>
            <P>
              <span className="text-white">Coming back to it.</span> Keeps the task assigned to the
              worker and pins it to the &ldquo;start where you left off&rdquo; banner at their next
              login.
            </P>
            <P>
              <span className="text-white">Pending.</span> Requires a structured explanation note, say missing 4x gusset plates from the cutting table. The system halts the labor timer,
              flags the task, and sends a live escalation straight to the project manager&rsquo;s queue.
              Those notes are what feed the material gates in the{" "}
              <GhostLink href="/work/jeevy-os/materials-procurement">
                materials ledger ↗
              </GhostLink>
              .
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/kiosk-wireframe-exit-modal.webp"
          alt="Wireframe of the tri-state feedback exit modal"
          caption="Wireframe establishing the tri-state feedback exit modal, where the choice a worker makes on the way out becomes the escalation signal."
          width={1448}
          height={888}
        />

        <Figure
          src="/jeevy/kiosk-task-history.webp"
          alt="Immutable task history drawer auditing every clock-in, pause, and blocker note"
          caption="Immutable task history drawer auditing every clock-in, pause, and blocker note to maintain complete build provenance."
          width={1912}
          height={905}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              In the PM review queue, supervisors assess submitted work against preset quality failure codes: wrong spec, missing welds, needs rework, needs inspection. If a task is sent back,
              a push notification reaches the worker at the kiosk terminal with the supervisor&rsquo;s
              notes attached, so the correction happens at the bay rather than at the end of the week.
            </P>
            <P>
              Preset codes were the point. Free-text rejection reasons had been the norm verbally, and
              they gave the welder no consistent signal about what to fix.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/kiosk-wireframe-pm-review.webp"
          alt="PM review dashboard wireframe introducing preset send-back reason codes"
          caption="PM Review dashboard wireframe introducing preset send-back codes (Rework needed, Missing welds, Wrong spec, Needs inspection) to maintain quality standards."
          width={1028}
          height={830}
        />

        <Figure
          src="/jeevy/kiosk-pm-review.webp"
          alt="Supervisor review history showing structured send-back reason codes"
          caption="Supervisor review history auditing structured send-back reasons (wrong spec, missing welds) to enforce aerospace quality standards."
          width={1906}
          height={904}
        />

        {/* ══ 5. SHIFT RECONCILIATION ══ */}
        <Prose>
          <H2 id="reconciliation">Shift reconciliation and capturing collaborative labor</H2>
          <div className="mt-8 space-y-6">
            <P>
              In heavy structural fabrication, nobody fits a 40-foot skid frame in isolation. Welders
              and fitters constantly jump between bays to help hoist assemblies, clamp flanges, or lay
              down root passes on tasks assigned to other crew members.
            </P>
            <P>
              In the legacy kiosk, tasks were assigned strictly one-to-one by office project managers.
              If a job wasn&rsquo;t explicitly routed to your profile, the terminal rendered a blank
              empty state saying no tasks are assigned to you yet, leaving helping hands unrecorded and
              making workers look idle in managerial productivity reports.
            </P>
            <P>I resolved this through the end-of-shift reconciliation dialog.</P>
            <P>
              <span className="text-white">
                &ldquo;Anything else you worked on?&rdquo; allocation.
              </span>{" "}
              When a worker taps Shop Out at the end of a shift, the reconciliation screen summarizes
              their actively tracked tasks alongside a selector for everything else.
            </P>
            <P>
              <span className="text-white">Self-service task attribution.</span> If a welder spent two
              hours helping another bay fit up a manifold, they search the project, pick the task, and
              log the hours directly at the terminal before final checkout.
            </P>
            <P>
              <span className="text-white">Closing the Friday payroll gap.</span> Reviewing this daily
              means cross-bay collaboration is captured in job costing at the time it happened, rather
              than argued about on a Friday afternoon.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/kiosk-reconciliation-wireframe.webp"
          alt="Shift reconciliation wireframe with an 'anything else you worked on?' selector before checkout"
          caption="The shift reconciliation wireframe introducing the “Anything else you worked on?” selector, allowing assisting crew members to account for collaborative labor before checkout."
          width={1910}
          height={898}
        />

        {/* ══ 6. LOCALIZATION & WORKER VALUE ══ */}
        <Prose>
          <H2 id="localization">275-key bilingual parity and pay transparency</H2>
          <div className="mt-8 space-y-6">
            <P>
              Multilingual support in industrial software cannot be a post-hoc translation plugin. A
              mistranslated weld specification is a physical safety risk, not a copy bug.
            </P>
            <P>
              I architected a 275-key zero-drift internationalization engine across 16 functional
              namespaces.
            </P>
            <P>
              <span className="text-white">Structural separation.</span> Fixed UI tokens and state
              labels resolve through strict dictionaries, so Shop Out becomes Salir del taller and Lunch becomes Almuerzo, while free-form worker notes and Material Test Reports are preserved
              verbatim, never machine-translated.
            </P>
            <P>
              <span className="text-white">100% key parity.</span> A continuous build-time audit
              verifies zero missing keys and zero unmapped tokens between languages, so a
              Spanish-speaking operator never falls through to an English string mid-flow.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/kiosk-language-switcher.webp"
          alt="In-place language selector toggling between English and Spanish"
          caption="In-place language selector toggling English and Spanish across all kiosk namespaces with zero layout shift."
          width={453}
          height={319}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              Workers bypass software when it functions only as a tool for managerial surveillance. To
              build trust, we gave them direct access to their own hours and pay from the kiosk
              terminal itself.
            </P>
            <P>
              At the end of each shift, a reconciliation dialog summarizes all tracked hours and
              prompts the worker to account for untracked work before final checkout, which is what
              removed the Friday payroll arguments the pipe welder described.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/kiosk-account-menu.webp"
          alt="In-kiosk worker account menu exposing shift history and wage transparency links"
          caption="In-kiosk worker account menu exposing personal productivity metrics, shift history, and wage transparency."
          width={543}
          height={490}
        />

        {/* ══ 7. OUTCOMES & RETROSPECTIVE ══ */}
        <WideCallout label="Verified Outcomes" items={VERIFIED_OUTCOMES} />

        <Prose>
          <H2 id="retrospective">Reciprocity drives compliance</H2>
          <div className="mt-8 space-y-6">
            <P>
              Designing the shop kiosk proved that user compliance is a function of respect. When
              software only extracts data for management, workers route around it.
            </P>
            <P>
              By giving workers immediate pay visibility, glove-operable touch targets, and a direct
              digital voice to unblock their own builds, time tracking stopped being a monitoring chore
              and became a tool they had a reason to use.
            </P>
          </div>
        </Prose>

        {/* ══ 8. BOTTOM RAIL ══ */}
        <Prose>
          <div className="flex flex-col gap-5 border-t border-white/10 pt-10">
            <GhostLink href="/work/jeevy-os/materials-procurement" size={14}>
              ← Previous blueprint: 01. Materials &amp; Procurement Ledger
            </GhostLink>
            <GhostLink href="/work/jeevy-os/blueprint-cad-manager" size={14}>
              Next blueprint: 03. Aerospace Blueprint &amp; CAD File Manager →
            </GhostLink>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
