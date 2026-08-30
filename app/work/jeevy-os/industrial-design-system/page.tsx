"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Prose,
  P,
  H2,
  Caption,
  Code,
  Figure,
  Wide,
  GhostLink,
  WideCallout,
  CANVAS,
  MonotonicSurfaceLadder,
} from "@/components/jeevy-os/editorial";
import {
  BrightPairMatrix,
  GloveTouchContract,
  ReleaseTierTable,
  RetrospectiveAntiPatterns,
} from "@/components/jeevy-os/design-system-artifacts";

/* ══════════════════════════════════════════════════════════════
   Engine 04: The Industrial Design System, [data-ds="v1"].
   Same editorial language as the hub and the other deep dives:
   720px prose measure, 960px breakout for media, no cards.
   ══════════════════════════════════════════════════════════════ */

const AUDIT = [
  {
    finding: "520 unique hardcoded hex colours",
    detail: "8,189 occurrences forming a fragmented palette nobody had agreed to.",
  },
  {
    finding: "2,913 border-radius calls",
    detail:
      "Spread across 83 distinct values, which made corner curvature an arbitrary matter of developer opinion.",
  },
  {
    finding: "317 media queries",
    detail:
      "264 of them, 83%, were off-grid across 38 distinct breakpoints. Written by someone eyeballing a browser window at 881px.",
  },
  {
    finding: "84 table implementations",
    detail: "Plus 70 independent CSS modules each defining their own custom table styling.",
  },
];

const VERIFIED_OUTCOMES = [
  {
    lead: "10,507 bound paints.",
    body: "100% token coverage across 41 documented pages, eliminating all 520 unmapped hex values.",
  },
  {
    lead: "Zero contrast failures.",
    body: "104 text labels promoted to bright-pair tokens, achieving full WCAG 2.1 AA compliance verified under DHS Trusted Tester standards.",
  },
  {
    lead: "1,688 variants shipped.",
    body: "Consolidated into 10 component sets published to the live team library with zero drift.",
  },
  {
    lead: "Single-theme monotonicity.",
    body: "Fixing the root cascade bug restored brand terracotta across every web, kiosk, and mobile surface at once.",
  },
];

export default function IndustrialDesignSystemPage() {
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
              className="font-mono text-[12px] uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
            >
              ← Case Studies / Jeevy Industrial OS / 04. Industrial Design System (v1.0.0)
            </Link>
          </nav>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            An opinionated design system built for dense, dark-native shop-floor tools
          </h1>

          {/* Context strip runs at caption weight rather than body weight:
              it is metadata about the engagement, not the first paragraph. */}
          <p className="mt-3 max-w-[720px] text-[14px] font-normal leading-[22px] text-neutral-400">
            How I turned 122,939 lines of un-tokenized CSS debt, a silent <Code>:root</Code> blue
            brand override, and 520 raw hex codes into a published, 101-token system with 1,688
            variants, 0 contrast failures under DHS Trusted Tester certification, and a 44px
            glove-operable touch contract.
          </p>
        </Prose>

        <Figure
          src="/jeevy/ds-button-matrix.webp"
          alt="The button component set showing 750 variants on a two-tier coordinate grid across style, size, layout and interaction state"
          caption="The Button component set: 750 variants organized across a two-tier coordinate grid (10 styles × 3 sizes × 5 layouts × 5 states), where axis labels are driven by measured column widths to prevent alignment drift."
          width={1920}
          height={812}
          priority
        />

        {/* ══ 1. CODEBASE ARITHMETIC ══ */}
        <Prose>
          <H2 id="arithmetic">The arithmetic of an absent design system</H2>
          <div className="mt-8 space-y-6">
            <P>
              I did not start in Figma. I started by auditing <Code>frontend/src</Code> across 322 CSS
              files and 122,939 lines of CSS.
            </P>
            <P>
              When engineers have no central system to reference, inconsistency does not announce
              itself as a crisis. It shows up quietly, as velocity loss, duplicate CSS modules, and
              broken mental models.
            </P>
          </div>

          <div className="mt-10 border-t border-white/[0.08]">
            {AUDIT.map((a) => (
              <div
                key={a.finding}
                className="grid grid-cols-1 gap-x-8 gap-y-1 border-b border-white/[0.06] py-5 md:grid-cols-12"
              >
                <h3 className="text-[14px] font-medium leading-[22px] text-white md:col-span-5">
                  {a.finding}
                </h3>
                <p className="text-[14px] leading-[22px] text-neutral-400 md:col-span-7">
                  {a.detail}
                </p>
              </div>
            ))}
          </div>
        </Prose>

        {/* ══ 1b. THE SILENT :root CASCADE BUG ══ */}
        <Prose className="mt-16">
          <H2 id="cascade">The silent cascade bug</H2>
          <div className="mt-8 space-y-6">
            <P>
              The worst finding was not a number. It was seven lines of CSS inside{" "}
              <Code>frontend/src/app/globals.css</Code>. Lines 183 to 219 contained a secondary{" "}
              <Code>:root</Code> block sitting directly beneath a comment claiming duplicates had been
              resolved.
            </P>
          </div>

          <pre className="mt-8 overflow-x-auto border-l border-[#C25E43]/60 bg-[#061723]/60 py-5 pl-6 pr-5">
            <code className="font-mono text-[14px] leading-[22px] text-neutral-300">
              <span className="text-neutral-400">
                {"/* Commented out duplicate styles keeping only the active styles below */"}
              </span>
              {"\n:root {\n  --bg-surface: #1a1a1a;\n  --bg-elevated: #242424;\n  --primary: "}
              <span className="text-white">#3b82f6</span>
              {"; "}
              <span className="text-neutral-400">
                {"/* silently redefined terracotta to Tailwind blue */"}
              </span>
              {"\n}"}
            </code>
          </pre>

          <div className="mt-8 space-y-6">
            <P>
              Line 210 redefined our terracotta brand, <Code>#9C3B22</Code>, to generic blue, silently
              propagating to 189 occurrences across the frontend. Nobody intentionally built a blue
              design system. The CSS cascade wrote one for us.
            </P>
            <P>
              This is why every surface and semantic intent in <Code>v1.0.0</Code> is strictly bound
              to tokenized variables enforced at build time, rather than left to a convention people
              are asked to remember.
            </P>
          </div>
        </Prose>

        {/* ══ 2. BRAND VERSUS SHOP PHYSICS ══ */}
        <Prose className="mt-24">
          <H2 id="brand">Terracotta as a scalpel, and the monotonic surface ladder</H2>
          <div className="mt-8 space-y-6">
            <P>
              Solung Studio provided an opinionated brand deck specifying a 65% navy, 27% sand and
              white, 8% terracotta palette ratio. But a brand deck specifies a single static slide. An
              industrial operating system must govern 1,200 virtualized data rows, high-bay glare, and
              thick work gauntlets.
            </P>
            <P>
              I transformed the agency&rsquo;s 8% aesthetic ratio into an enforceable engineering
              contract: one filled terracotta primary per surface, reserved for dialogs and modals,
              de-escalating to secondary outlined buttons on dense dashboard grids to prevent dozens
              of primaries shouting at once.
            </P>
            <P>
              The surfaces underneath carried the harder constraint. Under high-bay lighting a card
              has to separate from its canvas without introducing a reflective bright patch, which
              rules out shadows and leaves lightness as the only instrument. That only works if the
              steps run in one direction.
            </P>
          </div>
        </Prose>

        <MonotonicSurfaceLadder />

        <BrightPairMatrix />

        <Figure
          size="compact"
          src="/jeevy/ds-indicator-set.webp"
          alt="Status indicator set showing neutral, success, warning, error, info and stage intents across pill, tag, count and dot forms"
          caption="The bright pairs in production: every semantic intent across pill, tag, count and dot forms, each pairing a soft tint container with its brightened type token."
          width={690}
          height={1400}
        />

        {/* ══ 3. ERGONOMIC CONTRACTS ══ */}
        <Prose>
          <H2 id="glove">Ergonomic contracts for gloved operators</H2>
          <div className="mt-8 space-y-6">
            <P>
              Welders and fitters wear heavy Kevlar and leather gauntlets. Standard 20px desktop
              controls cannot be targeted, while loose spacing destroys information density for
              project managers triaging 40 jobs. Both constraints are real, and neither one yields.
            </P>
            <P>
              I resolved it through two architectural component contracts.
            </P>
            <P>
              <span className="text-white">The 44px invisible hit target.</span> To keep data tables
              compact without sacrificing glove accessibility, table buttons and inline triggers
              maintain a visual height of 28px, backed by an invisible pseudo-element that expands the
              hit target to a non-negotiable 44px boundary. Because the expansion happens on{" "}
              <Code>::after</Code>, it never enters layout, so the row height does not move.
            </P>
          </div>
        </Prose>

        <div className="my-16">
          <Wide>
            <div className="overflow-x-auto">
              <GloveTouchContract />
            </div>
            <Caption>
              Drawn at true scale. The 44px hit area exactly fills the row it sits in, which is what
              makes glove operation free: density and touch accessibility stop competing once the
              target stops being the same object as the button.
            </Caption>
          </Wide>
        </div>

        <Prose>
          <div className="space-y-6">
            <P>
              <span className="text-white">The merged compound input.</span> The counter-and-commit
              pattern, logging received parts at the dock, is the highest-velocity control on the
              floor. The numeric field, denominator, and submit button share one border box with zero
              gaps, so the group reads as a single instrument rather than three adjacent controls.
            </P>
            <P>
              Focus is isolated to a 2px terracotta bottom border on the active cell. Illuminating the
              whole group would light the submit button before the operator has finished entering a
              count, which is exactly the moment you do not want to suggest that committing is the
              next step. Form inputs use that bottom border rather than a four-sided box for the same
              reason: a box around a text field reads as a button, and on a touch screen operators tap
              it expecting something to happen.
            </P>
          </div>
        </Prose>

        <Figure
          size="prose"
          src="/jeevy/ds-compound-input.webp"
          alt="Merged compound number input with the numeric field, denominator, and submit trigger sharing one border box"
          caption="Merged compound number input at close to its rendered size: 0px structural welding with focus isolated to the active entry cell."
          width={1237}
          height={53}
        />

        <Figure
          src="/jeevy/ds-input-set.webp"
          alt="The full input component set showing text fields, selects, multi-selects, date pickers and search across rest, hover, focus, error and disabled states"
          caption="The input set across text, select, multi-select, date and search variants. Reading down each column shows the 2px bottom-border standard carrying rest, hover, focus, error and disabled without ever closing into a four-sided box."
          width={1600}
          height={1371}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              <span className="text-white">Deterministic avatar geometry.</span> The third contract
              covers identity. Avatars encode entity type through shape rather than colour: a circle
              is a person, a hexagon is an automated parsing agent, a square is an external vendor.
              Shape survives glare, greasy screens, and colour vision deficiency, none of which
              colour does.
            </P>
            <P>
              The fill colour is hashed from the immutable user ID, never from rank or role
              permissions. Deriving it from permissions would have leaked the org chart into every
              comment thread on the floor.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/ds-avatar-set.webp"
          alt="Avatar set showing circle, hexagon and square geometries across sizes and stacked group configurations"
          caption="Deterministic avatar architecture: geometry encodes entity type (circle for a person, hexagon for an AI agent, square for a vendor), while colour is hashed from the immutable user ID so it can never encode rank."
          width={840}
          height={1016}
        />

        {/* ══ 4. GOVERNANCE ══ */}
        <Prose>
          <H2 id="governance">Governance that runs without me</H2>
          <div className="mt-8 space-y-6">
            <P>
              A design system that relies on verbal policing collapses the moment the author leaves
              the room. So the rules had to live somewhere that keeps working when I am not in the
              review: in Linear, and in the release pipeline.
            </P>
            <P>
              <span className="text-white">The component intake pipeline.</span> Additions are drafted
              on a Figma sandbox canvas and filed against the JEEVY-1197 request template in the Design
              System: Component Intake project. Two fields do the real work. &ldquo;Target consuming
              view&rdquo; means a component with no screen waiting for it is not approved. &ldquo;Why
              existing components do not work&rdquo; is the field that prevents duplicates, and if an
              engineer answers &ldquo;I could not find one,&rdquo; that is a discoverability bug in
              the Assets panel rather than a missing component.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/ds-intake-surface.webp"
          alt="The component intake draft surface showing the structured request fields and the sandbox canvas below them"
          caption="The intake surface. The page is a scratch and log surface, not a filing channel: duplicating the frame notifies nobody and starts no review, and anything left outside the sandbox is treated as production and swept."
          width={1000}
          height={818}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              <span className="text-white">Automated 14-day audit sweeps.</span> A continuous script
              scans active production views every 14 days to catch component detachment or unmapped
              hex codes before they reach a shop terminal. The sweep is what makes the sandbox rule
              enforceable rather than aspirational: staging surfaces are audited exactly like
              production, so nothing accumulates in a grey zone.
            </P>
            <P>
              <span className="text-white">Contrast as a gate, not a review note.</span> Every new
              layout variant introduced to cards or inputs is evaluated automatically against pure
              black and the dark navy surfaces, enforcing the 4.5:1 WCAG 2.1 AA text floor. Working
              from my DHS Trusted Tester certification, I also locked font sizes to whole-integer size
              and line-height pairs, so no label lands on a fractional pixel and turns to
              anti-aliasing blur on the low-DPI terminals mounted in the bays.
            </P>
          </div>
        </Prose>

        <ReleaseTierTable />

        <Prose>
          <div className="space-y-6">
            <P>
              The tiers exist so that breaking changes are predictable rather than polite. Consuming
              teams can plan against a semi-annual window instead of negotiating each change, and
              patches ride the sweep that found them.
            </P>
          </div>
        </Prose>

        {/* ══ 5. RETROSPECTIVE ══ */}
        <Prose>
          <H2 id="retrospective">Retrospective: the 7 measurable faults we eliminated</H2>
          <div className="mt-8 space-y-6">
            <P>
              During pilot deployment on the Tasking Planner, across 31 files, we encountered visual
              debt and interaction friction that no amount of Figma review had caught, because most of
              it only appears once real data is in the grid. We audited the root causes and locked
              them into system invariants.
            </P>
          </div>
        </Prose>

        <RetrospectiveAntiPatterns />

        <Figure
          size="prose"
          src="/jeevy/ds-compliance-panel.webp"
          alt="Quality compliance panel showing paired do and don't examples for button hierarchy, shape consistency, link states and semantic colour"
          caption="The production Quality Compliance Panel: each invariant paired with the specific anti-pattern it exists to prevent, so a reviewer can settle an argument by pointing rather than by explaining."
          width={774}
          height={1300}
        />

        {/* ══ 6. OUTCOMES ══ */}
        <WideCallout label="Verified Outcomes" items={VERIFIED_OUTCOMES} />

        <Prose>
          <H2 id="reflection">Systems reflection: measure before restyling</H2>
          <div className="mt-8 space-y-6">
            <P>
              The core lesson of building <Code>v1.0.0</Code> was recognising that visual flaws are
              almost always symptoms of broken underlying data models or inverted token ladders.
            </P>
            <P>
              The glowing card is the clearest case. It looked wrong, and every instinct said to pick
              a nicer blue. The actual fault was that the resting surface sat 1.26 points of lightness
              above its own hover state, so no colour choice at rest could have fixed it. Once the
              ladder was monotonic, the card stopped needing an opinion.
            </P>
            <P>
              A button does not look wrong because of subjective taste. It looks wrong because its
              contrast step is non-monotonic or its DOM tree is invalid. When a design system is
              treated as an engineering contract, consistency takes care of itself. The same instinct
              runs through the{" "}
              <GhostLink href="/work/jeevy-os/blueprint-cad-manager">
                blueprint and CAD file manager ↗
              </GhostLink>
              , where the constraint was a mental model rather than a token.
            </P>
          </div>
        </Prose>

        {/* ══ 7. BOTTOM RAIL ══ */}
        <Prose>
          <div className="flex flex-col gap-5 border-t border-white/10 pt-10">
            <GhostLink href="/work/jeevy-os/blueprint-cad-manager" size={14}>
              ← Previous blueprint: 03. Blueprint &amp; CAD File Manager
            </GhostLink>
            <GhostLink href="/work/jeevy-os/tasking-cpm-engine" size={14}>
              Next blueprint: 05. Tasking &amp; Critical Path Scheduling →
            </GhostLink>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
