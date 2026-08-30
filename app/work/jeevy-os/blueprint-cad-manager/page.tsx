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
  TapedSketchFrame,
  MentalModelPivot,
  DotCodedMatrix,
  WideCallout,
  CANVAS,
} from "@/components/jeevy-os/editorial";
import { SecurityGateDiagram } from "@/components/jeevy-os/security-diagram";
import { InspectionLatencyBenchmark } from "@/components/jeevy-os/latency-benchmark";

/* ══════════════════════════════════════════════════════════════
   Engine 03: Aerospace Blueprint & CAD File Manager (v5 to v8).
   Same editorial language as the hub and the other deep dives:
   720px prose measure, 960px breakout for media, no cards.
   ══════════════════════════════════════════════════════════════ */

const WORKSHOP_CONSENSUS = [
  {
    // staggered 3: two sage, one smaller sand tucked behind
    // left column: stamps sit apart rather than bleeding together
    overlap: false,
    title: "Visual geometry over part hashes",
    description:
      "Trevor identifies assemblies by shape (skid frames, 6-inch elbows, flanges), not 30-character alphanumeric strings. Demands large visual grid thumbnails.",
    dots: [
      { tone: "sage", dx: "translate-x-0", dy: "translate-y-0.5", rotate: "rotate-6", size: "w-3.5 h-3.5" },
      { tone: "sage", dx: "-translate-x-0.5", dy: "-translate-y-1", rotate: "-rotate-12", size: "w-4 h-4" },
      { tone: "sand", dx: "translate-x-0.5", dy: "translate-y-1", rotate: "rotate-45", size: "w-3 h-3" },
    ],
  },
  {
    // scattered 4 along a loose diagonal arc
    title: "SolidWorks desktop load overhead",
    description:
      "Waiting 45 to 90 seconds for heavy CAD to launch on rugged tablets halts fitters at the bay. Demands sub-second browser-native 2D/3D split views.",
    dots: [
      { tone: "rust", dx: "translate-x-0", dy: "-translate-y-1", rotate: "rotate-12", size: "w-3.5 h-3.5" },
      { tone: "rust", dx: "translate-x-1", dy: "translate-y-0.5", rotate: "-rotate-6", size: "w-4 h-4" },
      { tone: "sand", dx: "-translate-x-0.5", dy: "translate-y-1.5", rotate: "rotate-3", size: "w-3 h-3" },
      { tone: "rust", dx: "translate-x-1", dy: "-translate-y-0.5", rotate: "-rotate-45", size: "w-3.5 h-3.5" },
    ],
  },
  {
    // dense triangular stamp, three blockers, spaced not bled
    overlap: false,
    title: "Commercial quote and margin leaks",
    description:
      "Estimator pricing bids and markup percentages stored beside weld prints. Demands strict 3-gate database role isolation.",
    dots: [
      { tone: "rust", dx: "translate-x-0", dy: "translate-y-1", rotate: "-rotate-3", size: "w-3.5 h-3.5" },
      { tone: "rust", dx: "-translate-x-0.5", dy: "-translate-y-0.5", rotate: "rotate-12", size: "w-4 h-4" },
      { tone: "rust", dx: "translate-x-1", dy: "-translate-y-1", rotate: "rotate-45", size: "w-3.5 h-3.5" },
    ],
  },
  {
    // loose pair: sand high left, sage low right
    title: "Un-audited overwrites and limbo deletions",
    description:
      "Deleting folders left child drawings orphaned in the database. Demands safe re-parenting and stacked version containers.",
    dots: [
      { tone: "sand", dx: "translate-x-0", dy: "-translate-y-1.5", rotate: "rotate-12", size: "w-3.5 h-3.5" },
      { tone: "sage", dx: "translate-x-1", dy: "translate-y-1", rotate: "-rotate-6", size: "w-4 h-4" },
    ],
  },
] as const;

const CONSOLIDATION = [
  {
    module: "QuoteFileManagerV2/index.js",
    legacy: "4,542 lines",
    duplicate: "2,272 lines",
    shipped: "3,211 lines",
    removed: "-1,331 lines",
  },
  {
    module: "ProjectFileManagerV2/index.js",
    legacy: "3,773 lines",
    duplicate: "Byte-identical",
    shipped: "2,647 lines",
    removed: "-1,126 lines",
  },
  {
    module: "Total consolidation",
    legacy: "8,315 lines",
    duplicate: "~60% to 75%",
    shipped: "5,858 lines",
    removed: "-2,457 lines (-30%)",
  },
];

const VERIFIED_OUTCOMES = [
  {
    lead: "97% latency reduction.",
    body: "Drawing inspection dropped from 45 to 90 seconds in SolidWorks to under 1.2 seconds via native browser canvas split-views.",
  },
  {
    lead: "100% commercial data segregation.",
    body: "Multi-tier permissions eliminated quote and margin leaks to shop-floor terminals while keeping weld prints fully accessible.",
  },
  {
    lead: "2,457 lines of dead code removed.",
    body: "Unifying the dual codebase into shared domain components resolved 11 active behavioral drift bugs.",
  },
  {
    lead: "Zero orphaned files.",
    body: "Folder containment was rebuilt to re-parent child documents to the parent directory on deletion rather than leaving them in limbo.",
  },
];

export default function BlueprintCadManagerPage() {
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
              ← Case Studies / Jeevy Industrial OS / 03. Blueprint &amp; CAD File Manager
            </Link>
          </nav>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            Architecting the Aerospace Blueprint &amp; CAD File Manager (v5 → v8)
          </h1>

          <div className="mt-8">
            <P>
              How I scrapped a finished prototype to build Trevor&rsquo;s Windows Explorer mental
              model, delivering sub-second 2D/3D browser CAD inspection, an atomic 3-gate authorization
              pipeline, and eliminating 2,457 lines of drifted technical debt.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/fm-split-view.webp"
          alt="Production master split view pairing the file explorer with an interactive drawing inspector"
          caption="The production Master Split View pairing the central file explorer with an interactive drawing inspector displaying a SpaceX Starbase GSE specification."
          width={2400}
          height={1104}
          priority
        />

        {/* ══ 1. THE BOTTLENECK ══ */}
        <Prose>
          <H2 id="bottleneck">When a missing drawing halts an overhead crane</H2>
          <div className="mt-8 space-y-6">
            <P>
              In heavy aerospace manufacturing, software failure is measured in stalled welders and
              five-figure liquidated damages. When a 40-foot Ground Support Equipment skid or
              high-pressure cryogenic manifold is being fabricated for SpaceX Starbase, an un-synced
              drawing revision or an unreadable blueprint halts the line.
            </P>
            <P>
              Before this rebuild, engineering drawings, Material Test Reports, and supplier quotes
              were dumped into a flat, un-nested list. The system was breaking daily.
            </P>
            <P>
              <span className="text-white">SolidWorks bottlenecks.</span> Opening a 3D assembly on
              shop-floor tablets required downloading full CAD files and waiting 45 to 90 seconds in
              SolidWorks just to verify a nozzle schedule.
            </P>
            <P>
              <span className="text-white">Exposed commercial data.</span> Sourcing spreadsheets,
              internal markup margins, and vendor quotes were stored side by side with fabrication
              prints, accessible to anyone on the floor.
            </P>
            <P>
              <span className="text-white">Relational flatness and raw hashes.</span> Files were
              dumped into a flat database array with unformatted proxy strings and UUID hashes,
              lacking folder hierarchies and drag-and-drop organization.
            </P>
            <P>
              <span className="text-white">8,315 lines of drifting duplication.</span> Quote and
              project file managers were maintained as two separate monoliths, introducing 11 live
              behavioral bugs across renames, deletions, and folder creations.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/fm-legacy-flat-list.webp"
          alt="The legacy flat file list with no directory depth and a dead BOM sidebar"
          caption="The legacy flat file list: zero directory depth, unformatted proxy strings, and dead BOM sidebars consuming horizontal screen space."
          width={1915}
          height={985}
        />

        {/* ══ 2. PARTICIPATORY DISCOVERY ══ */}
        <Prose>
          <H2 id="discovery">The courage to scrap completed work</H2>
          <div className="mt-8 space-y-6">
            <P>
              Following my initial prototype pass, I ran participatory design sessions with Trevor
              Goldston (Shop Operations Lead), Vinay Konuru (VP Technology), and Joseph Leon
              (Engineering). That research revealed that my modern, abstract prototype broke down
              completely under actual shop-floor build rhythms.
            </P>
          </div>
        </Prose>

        <MentalModelPivot
          left={{
            label: "The initial office hypothesis",
            lead: "We initially built an abstract, deeply nested CAD tree. In Figma reviews, it looked modern and organized.",
            detail:
              "On the shop floor, it collapsed. Welders had to read 30-character alphanumeric part hashes to guess what was inside, and opening assemblies meant waiting 45 to 90 seconds for SolidWorks to load on a rugged tablet.",
          }}
          right={{
            label: "What actually worked on the floor",
            lead: "Trevor opened Windows File Explorer and showed us how he actually works: folders on the left, large visual thumbnails in the middle, and file details on the right.",
            detail:
              "We scrapped the tree and mirrored his spatial mental model. Welders spot part geometry instantly, inspect 2D/3D cutaways in the browser in under 1.2 seconds, and never wait on heavy desktop CAD.",
          }}
        />

        <Figure
          src="/jeevy/fm-trevor-mental-model.webp"
          alt="Trevor demonstrating the Windows File Explorer mental model with large visual thumbnails"
          caption="Trevor Goldston demonstrating his ground-truth mental model: Windows File Explorer with large visual thumbnails for rapid part geometry identification."
          width={1901}
          height={1012}
        />

        <DotCodedMatrix
          title="Participatory workshop consensus · Cleburne hangar huddle"
          blocks={WORKSHOP_CONSENSUS}
        />

        <TapedSketchFrame
          src="/jeevy/fm-trevor-sketch.webp"
          alt="Hand-drawn legal pad sketch mapping vendor drawing packages and RFQ folder containment"
          width={621}
          height={643}
          annotation="Trevor Goldston’s original yellow-pad sketch mapping 1-to-N vendor drawing packages and RFQ containment hierarchies."
        />

        <Prose>
          <div className="space-y-6">
            <P>
              I threw away the initial concept entirely and rebuilt the architecture around
              Trevor&rsquo;s Windows File Explorer mental model, engineering it for high-density touch
              displays and strict role-based data isolation.
            </P>
          </div>
        </Prose>

        {/* ══ 3. SECURITY ══ */}
        <Prose className="mt-24">
          <H2 id="security">The commercial leak we had to close structurally</H2>
          <div className="mt-8 space-y-6">
            <P>
              In aerospace fabrication, document management isn&rsquo;t just about organizing files.
              It is about strict operational boundaries.
            </P>
            <P>
              When we audited file permissions across shop terminals, we uncovered a dangerous blind
              spot in how revision histories were handled. The system checked whether a user was an
              authorized shop employee, but never whether they had clearance to see what was inside
              that specific document.
            </P>
            <P>
              That created an invisible loophole. An operator with general drawing upload access could
              unknowingly restore, overwrite, or mutate hidden commercial files, exposing client
              pricing, vendor quote markups, and profit margins on the shop floor.
            </P>
            <P>
              I resolved it by architecting a 3-gate resolution pipeline directly into the document
              lifecycle.
            </P>
          </div>

          <ol className="mt-8 space-y-6">
            <li className="text-[18px] font-normal leading-[28px] text-neutral-300">
              <span className="text-white">Tenancy isolation.</span> Verifies the user belongs to the
              active fabrication facility.
            </li>
            <li className="text-[18px] font-normal leading-[28px] text-neutral-300">
              <span className="text-white">View prerequisite, the non-negotiable rule.</span> You
              cannot edit, delete, or restore a file you do not have explicit clearance to view.
            </li>
            <li className="text-[18px] font-normal leading-[28px] text-neutral-300">
              <span className="text-white">Role mutation clearance.</span> Only estimators and project
              leads can touch commercial bids, while shop-floor crews are routed cleanly to fabrication
              prints and Material Test Reports.
            </li>
          </ol>
        </Prose>

        <div className="my-16">
          <Wide>
            <div className="overflow-x-auto">
              <SecurityGateDiagram />
            </div>
            <Caption>
              Every mutation resolves through all three gates in order. The view check sits before the
              write check, which is the specific ordering the audit found missing.
            </Caption>
          </Wide>
        </div>

        <Prose>
          <div className="space-y-6">
            <P>
              <span className="text-white">The view-before-write invariant.</span> A user without read
              clearance is blocked at the database layer from executing write, mutate, delete, or
              restore operations on any file container.
            </P>
            <P>
              <span className="text-white">Inherited folder permissions.</span> Moving a drawing into a
              restricted directory automatically applies that folder&rsquo;s security policy to its
              child documents, which is what prevents accidental leaks during reorganization.
            </P>
            <P>
              <span className="text-white">Role-based commercial segregation.</span> Project managers
              and estimators keep full commercial access, while shop-floor welders and dock inspectors
              are restricted to fabrication prints and MTR weld logs.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/fm-manage-access.webp"
          alt="Production manage access modal showing multi-tier role governance"
          caption="Production Manage Access modal enforcing multi-tiered role governance (Owner, Manager, Viewer) and commercial visibility locks."
          width={2400}
          height={1126}
        />

        {/* ══ 4. CAD INSPECTION ══ */}
        <Prose>
          <H2 id="inspection">Sub-second 2D/3D browser CAD inspection</H2>
          <div className="mt-8 space-y-6">
            <P>
              Welders cannot afford to wait two minutes for SolidWorks to load on a shop tablet. I
              engineered the master split view, pairing the directory explorer with a right-hand
              inspector that renders vector PDFs and 3D STP assemblies in under 1.2 seconds.
            </P>
            <P>
              <span className="text-white">Coordinate zoom and pan.</span> Welders move across title
              blocks, weld symbols, and nozzle cutaways inside their browser session.
            </P>
            <P>
              <span className="text-white">Single versus double-click.</span> A single click loads
              metadata, revision history, and a lightweight canvas preview in the inspector; a double
              click opens the full-screen drawing.
            </P>
            <P>
              <span className="text-white">Single-accordion tree rule.</span> Expanding one folder at a
              directory level collapses its sibling, which prevents vertical scroll fatigue on
              low-resolution shop displays.
            </P>
            <P>
              <span className="text-white">Pre-ingest upload parsing.</span> PDFs and CSV build
              schedules render inside the upload modal before anything is committed to cloud storage,
              so coordinators catch corrupted files immediately. That was Joseph&rsquo;s note, built
              directly.
            </P>
          </div>
        </Prose>

        <InspectionLatencyBenchmark />

        <Figure
          src="/jeevy/fm-grid-view.webp"
          alt="Production grid view with large thumbnails, folder pills, and type filters"
          caption="Production Grid View showing large visual thumbnails, folder pills, type filters, and 44px glove-operable touch boundaries."
          width={1958}
          height={1179}
        />

        <Figure
          src="/jeevy/fm-upload-preingest.webp"
          alt="Pre-ingest upload modal rendering a build schedule before it is committed"
          caption="Pre-ingest upload modal featuring client-side rendering, allowing managers to verify build schedules before writing to storage."
          width={2400}
          height={1104}
        />

        {/* ══ 5. VERSIONING & CONSOLIDATION ══ */}
        <Prose>
          <H2 id="versioning">Stacked revisions and eliminating 2,457 lines of drift</H2>
          <div className="mt-8 space-y-6">
            <P>
              Engineering prints evolve constantly across a fabrication lifecycle. Rather than
              tolerating file chaos, Jeevy groups revisions into stacked version containers with
              single-click server-sent-event rollbacks that update every connected shop terminal at
              once.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/fm-version-drawer.webp"
          alt="Version control drawer showing stacked revision history and rollbacks"
          caption="Version Control drawer showing stacked revision history with live rollbacks and audit timestamps."
          width={1586}
          height={775}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              To remove the maintenance overhead permanently, I consolidated the duplicate
              implementations into shared domain components with modular adapters.
            </P>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  {["Source module", "Legacy", "Duplicated", "Shipped", "Debt removed"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="border-b border-white/10 pb-3 pr-6 align-bottom text-[12px] font-medium text-neutral-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONSOLIDATION.map((r) => (
                  <tr key={r.module} className="align-top">
                    <th
                      scope="row"
                      className="border-b border-white/[0.06] py-5 pr-6 font-mono text-[14px] font-medium leading-[22px] text-amber-400/90"
                    >
                      {r.module}
                    </th>
                    <td className="border-b border-white/[0.06] py-5 pr-6 font-sans text-[14px] leading-[22px] text-neutral-400">
                      {r.legacy}
                    </td>
                    <td className="border-b border-white/[0.06] py-5 pr-6 font-sans text-[14px] leading-[22px] text-neutral-400">
                      {r.duplicate}
                    </td>
                    <td className="border-b border-white/[0.06] py-5 pr-6 font-sans text-[14px] leading-[22px] text-neutral-300">
                      {r.shipped}
                    </td>
                    <td className="border-b border-white/[0.06] py-5 font-mono text-[14px] leading-[22px] text-white">
                      {r.removed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 space-y-6">
            <P>
              Consolidating the code removed 11 active bugs, so file renames, folder deletions, and
              destination moves now behave identically across quoting and project execution.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/fm-qa-matrix.webp"
          alt="Round-one QA test matrix verifying folder creation, multi-drag, and deletion behaviour"
          caption="Vinay Konuru's Round-1 QA test matrix verifying context-aware folder creation, multi-drag operations, and non-destructive folder deletions."
          width={2211}
          height={946}
        />

        {/* ══ 6. OUTCOMES & RETROSPECTIVE ══ */}
        <WideCallout label="Verified Outcomes" items={VERIFIED_OUTCOMES} />

        <Prose>
          <H2 id="retrospective">Mental models beat novel interfaces</H2>
          <div className="mt-8 space-y-6">
            <P>
              The biggest breakthrough on the file manager was recognizing that an innovative UI
              pattern was the wrong thing to be proud of.
            </P>
            <P>
              By discarding an abstract prototype and anchoring in a model Trevor already trusted, we
              removed training friction entirely, built credibility with the shop leads, and delivered
              sub-second clarity to the crews building for SpaceX. The same instinct shows up in the{" "}
              <GhostLink href="/work/jeevy-os/industrial-design-system">
                industrial design system ↗
              </GhostLink>
              , where the constraint was the glove rather than the grid.
            </P>
          </div>

          <blockquote className="mt-10 border-l border-white/20 pl-6">
            <p className="text-[18px] font-normal leading-[28px] tracking-[-0.01em] text-white">
              &ldquo;New file manager is kickass. Love it, nice work!!&rdquo;
            </p>
            <footer className="mt-3 text-[14px] leading-relaxed text-neutral-400">
              Jeevesh Konuru, CEO &amp; Co-Founder · production release feedback
            </footer>
          </blockquote>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/fm-ceo-feedback.webp"
          alt="Message from the CEO reacting to the file manager release"
          caption="Spontaneous production feedback from Jeevesh Konuru (CEO & Co-Founder) validating the file manager release."
          width={397}
          height={217}
        />

        {/* ══ 7. BOTTOM RAIL ══ */}
        <Prose>
          <div className="flex flex-col gap-5 border-t border-white/10 pt-10">
            <GhostLink href="/work/jeevy-os/shop-kiosk-feedback" size={14}>
              ← Previous blueprint: 02. Shop-Floor Kiosk UX &amp; Worker Feedback
            </GhostLink>
            <GhostLink href="/work/jeevy-os/industrial-design-system" size={14}>
              Next blueprint: 04. Industrial Design System (v1.0.0) →
            </GhostLink>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
