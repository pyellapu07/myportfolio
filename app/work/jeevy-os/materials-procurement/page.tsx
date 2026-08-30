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
  FigureRow,
  Wide,
  GhostLink,
  FieldNotesWall,
  WideCallout,
  CANVAS,
} from "@/components/jeevy-os/editorial";
import { ProcurementPipeline } from "@/components/jeevy-os/materials-diagram";

/* ══════════════════════════════════════════════════════════════
   Engine 01 — Materials, Sourcing & Single-Table Ledger.
   First-person deep dive, same editorial language as the hub:
   720px measure, 28/18/14/12 type, no cards, no boxed sections.
   ══════════════════════════════════════════════════════════════ */

/** Verbatim quotes captured during the Cleburne shop huddles. */
const FIELD_NOTES = [
  {
    quote:
      "Estimators buy a single 6'×8' parent plate to cut four small child parts on the laser. We need to track what's left over as real shop stock, not scrap.",
    speaker: "Trevor Goldston · Shop Operations Lead",
  },
  {
    quote:
      "Material lists scroll is confusing. The part numbers get cut off, and the quote button just downloads a CSV instead of actually helping us compare vendor bids.",
    speaker: "Vinay Konuru · VP Technology",
  },
  {
    quote:
      "If 2 flanges arrive dinged in a crate of 20, I can't reject the whole delivery. I need to take the 18 good ones into stock now and quarantine the bad 2.",
    speaker: "Cleburne Dock Receiver",
  },
  {
    quote:
      "A single cell reference error in the Google Sheet distorted margins across the whole skid. We need the database to reject unapproved PO issuance structurally.",
    speaker: "Sai Tangudu · Engineering",
  },
];

const VERIFIED_OUTCOMES = [
  {
    lead: "96% turnaround reduction.",
    body: "BOM-to-RFQ generation dropped from ~48 hours across 15 Excel tabs to under 12 minutes via anchored popovers and formatted TSV drafts.",
  },
  {
    lead: "Zero unapproved spend.",
    body: "Server-side $1,000 spend gating backed by PostgreSQL check constraints (chk_mmi_approval_no_po_number), permanently separating draft IDs from legal PO numbers.",
  },
  {
    lead: "100% floor traceability.",
    body: "4-step unit dock QC with lot splitting cut receiving from 30 minutes to 3, while preserving full Material Test Report heat-number provenance for aerospace client QA.",
  },
  {
    lead: "Multi-shop scalability.",
    body: "Deployed to partner facility Prentex with zero codebase forks, using Notion-style custom columns and 1-to-N raw plate nesting at 78.4% utilization.",
  },
];

const STATE_MAP = [
  {
    modern: "needs, sent, opts, sel",
    legacy: "DRAFT",
    guard: "Applied only if the legacy value is not already terminal.",
    intent: "Pre-commitment demand; no money committed.",
  },
  {
    modern: "approval",
    legacy: "DRAFT",
    guard: "po_number forced NULL by check constraint.",
    intent: "Pending sign-off reads as uncommitted to accounting.",
  },
  {
    modern: "po",
    legacy: "PO ISSUED",
    guard: "Unconditional.",
    intent: "A legal purchase commitment exists against a vendor.",
  },
  {
    modern: "purch",
    legacy: "RECEIVED",
    guard: "Skipped if the legacy status is INVOICED.",
    intent: "Physical dock receipt cannot overwrite financial settlement.",
  },
];

export default function MaterialsProcurementPage() {
  return (
    <div data-ds="v1" className="min-h-screen" style={{ background: CANVAS }}>
      <Header initialDark />

      <article className="pb-28 pt-28">
        {/* ══ HEADER ══ */}
        <Prose>
          <nav aria-label="Breadcrumb">
            <Link
              href="/work/jeevy-os"
              className="font-mono text-[12px] uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
            >
              ← Case Studies / Jeevy Industrial OS / 01. Materials &amp; Procurement
            </Link>
          </nav>

          <h1 className="mt-10 text-[28px] font-semibold leading-tight tracking-tight text-white">
            Architecting the Single-Table Materials Ledger &amp; Spend Governance
          </h1>

          <div className="mt-8">
            <P>
              How I eliminated an un-audited $800k Google Sheet and replaced an unstable 1,078-line
              React monolith with an append-only PostgreSQL ledger, dynamic spend gates, 4-step unit
              QC, and 1-to-N bulk plate nesting.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/prod-materials-catalog-table.webp"
          alt="Production materials catalog table with photo thumbnails and per-line procurement state"
          caption={'The production Materials Catalog running on our [data-ds="v1"] design tokens, featuring monotonic elevation, 36px photo thumbnails, and contextual short names.'}
          width={2400}
          height={1112}
          priority
        />

        {/* ══ 1. THE SPREADSHEET BASELINE ══ */}
        <Prose>
          <H2 id="baseline">The spreadsheet that ran a rocket-part facility</H2>
          <div className="mt-8 space-y-6">
            <P>
              In industrial fabrication, inventory isn&rsquo;t an abstract eCommerce SKU. It&rsquo;s
              eight-inch Schedule 40 carbon steel pipe, forged 304L stainless weld-neck flanges, and
              cryogenic ball valves built to hold 3,000 PSI on an aerospace launchpad.
            </P>
            <P>
              When I arrived at our heavy fabrication facility in Cleburne, Texas, our primary tool
              for managing high-value bills of materials was a fragile 15-tab Google Sheet. It
              tracked $800,036.25 in raw materials across structural steel, process piping,
              instrumentation, and wiring.
            </P>
            <P>The spreadsheet was breaking under real shop velocity.</P>
            <P>
              <span className="text-white">Formula fragility.</span> A single typo in a cell formula
              silently wiped out projected margins on a $500k skid assembly without leaving a change
              log.
            </P>
            <P>
              <span className="text-white">Manual transposition.</span> Sourcing specialists spent two
              days copying part numbers from engineering drawings into spreadsheets, then re-typing
              those exact lines into supplier emails and Slack messages.
            </P>
            <P>
              <span className="text-white">The dock disconnect.</span> When steel arrived on a freight
              truck, the receiving crew tracked what came off it on dry-erase whiteboards. Front-office
              estimators had zero visibility into whether critical pipe was in the yard or still stuck
              on a highway.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/mat-legacy-quoting-sheet.webp"
          alt="The legacy multi-tab spreadsheet quoting engine with disconnected formula tabs"
          caption="The baseline $800,036.25 quoting sheet showing disconnected formula tabs, manual splits, and un-audited cost adjustments."
          width={1894}
          height={981}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              The legacy web interface was an unstable 1,078-line React monolith that made things
              worse. It had no approval controls — any user could click Generate PO and commit company
              capital with zero sign-off.
            </P>
            <P>
              Even worse, the project expenses tab was querying a deprecated table, permanently
              displaying $0 material spend across active jobs while hundreds of thousands of dollars
              were in flight.
            </P>
          </div>
        </Prose>

        {/* ══ FIELD NOTES ══ */}
        <FieldNotesWall notes={FIELD_NOTES} />

        {/* ══ 2. ARCHITECTURE ══ */}
        <Prose className="mt-24">
          <H2 id="architecture">The ledger dictates the user experience</H2>
          <div className="mt-8 space-y-6">
            <P>
              Rather than treating procurement as an isolated back-office task, Vinay Konuru (VP
              Technology) and I mapped it as a five-stage operational pipeline: recording, pricing,
              purchasing, tracking, and receiving.
            </P>
            <P>
              To eliminate relational desynchronization between office purchasing and dock receiving,
              I designed <span className="text-white">manual_material_items</span> — roughly 90
              columns — as the single authoritative ledger. Instead of mutating rows destructively on
              edits, every event appends to an audit trail.
            </P>
          </div>
        </Prose>

        <div className="my-16">
          <Wide>
            <div className="overflow-x-auto">
              <ProcurementPipeline />
            </div>
            <Caption>
              The procurement pipeline. Spend governance is resolved on the server, so the $1,000
              threshold cannot be bypassed by a client that decides not to ask.
            </Caption>
          </Wide>
        </div>

        <Prose>
          <H2 id="state-machine">Two state machines, one author of truth</H2>
          <div className="mt-8 space-y-6">
            <P>
              To stay compatible with legacy accounting scripts without allowing state drift, I
              engineered a dual state machine. The modern engine (<span className="text-white">qs_state</span>)
              is the sole author of truth; the legacy machine (<span className="text-white">status</span>)
              is an automatic, read-only database trigger projection.
            </P>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  {["Modern state", "Projected legacy", "Database guard", "Operational intent"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-white/10 pb-3 pr-6 align-bottom font-mono text-[12px] font-normal uppercase tracking-wider text-neutral-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {STATE_MAP.map((r) => (
                  <tr key={r.modern} className="align-top">
                    <th
                      scope="row"
                      className="border-b border-white/[0.06] py-5 pr-6 font-mono text-[13px] font-medium leading-[22px] text-amber-400/90"
                    >
                      {r.modern}
                    </th>
                    <td className="border-b border-white/[0.06] py-5 pr-6 font-mono text-[13px] leading-[22px] text-neutral-300">
                      {r.legacy}
                    </td>
                    <td className="border-b border-white/[0.06] py-5 pr-6 font-sans text-[14px] font-normal leading-[22px] text-neutral-400">
                      {r.guard}
                    </td>
                    <td className="border-b border-white/[0.06] py-5 font-sans text-[14px] font-normal leading-[22px] text-neutral-400">
                      {r.intent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Prose>

        {/* ══ 3. GOVERNANCE ══ */}
        <Prose className="mt-24">
          <H2 id="governance">Server-enforced financial governance</H2>
          <div className="mt-8 space-y-6">
            <P>
              Governance cannot be hardcoded into client JavaScript. A single-bay shop and a
              multi-line fabrication facility carry different risk appetites, so we architected spend
              governance as a facility property resolved on the server at request time, ranging from
              $250 to $10,000 and above.
            </P>
            <P>
              <span className="text-white">Zero-lock fallback.</span> A shop with no configured limit
              defaults to $1,000 — never to NULL, never to zero.
            </P>
            <P>
              <span className="text-white">Atomic check constraint.</span> We wrote
              chk_mmi_approval_no_po_number directly into PostgreSQL. A row in approval state is
              physically blocked by the database from holding a PO number, which stops rogue API calls
              or scripts from generating binding legal orders.
            </P>
            <P>
              <span className="text-white">Draft versus legal PO split.</span> Orders pending review
              carry ephemeral DRAFT-&lt;vendor&gt;-&lt;seq&gt; identifiers. Permanent legal PO numbers
              are only minted on formal authorization.
            </P>
            <P>
              <span className="text-white">Approval re-gating.</span> If an estimator raises a price on
              an unreceived PO and pushes total spend past $1,000, approval is instantly revoked, fresh
              draft IDs are minted, and an amber PO Outdated banner blocks execution until it is
              re-authorized.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/mat-raise-po-drawer.webp"
          alt="The Raise PO drawer showing vendor-grouped line totals and the sign-off warning banner"
          caption="The Raise PO Drawer evaluating vendor-grouped line totals and rendering the active $1,000 sign-off warning banner."
          width={2400}
          height={1112}
        />

        {/* ══ 4. DOCK QC ══ */}
        <Prose>
          <H2 id="dock-qc">Designing for grease, gloves, and heat numbers</H2>
          <div className="mt-8 space-y-6">
            <P>
              Receiving steel in a fabrication hangar is chaotic. Trucks arrive unannounced, drivers
              wait on cranes, and workers operate tablet touchscreens with greasy hands.
            </P>
            <P>
              I designed the 4-step QC wizard to turn dock check-in from a 30-minute clerical slog into
              a 3-minute physical inspection flow.
            </P>
            <P>
              <span className="text-white">Unit-batch lot splitting.</span> If 20 pipe flanges arrive
              and 2 have damaged sealing faces, the inspector checks 18 passed units into stock and
              routes 2 damaged units to quarantine in a single atomic transaction.
            </P>
            <P>
              <span className="text-white">Direct to inventory.</span> Off-the-shelf commercial goods —
              bolts, tape, paint — bypass the QA queue with a single toggle, immediately generating an
              AUTO_DIRECT_RECEIPT audit record and satisfying forward{" "}
              <GhostLink href="/work/jeevy-os/tasking-cpm-engine">Gantt CPM scheduling ↗</GhostLink>{" "}
              constraints.
            </P>
            <P>
              <span className="text-white">Bin allocation and digital sign-off.</span> Inspectors log
              physical warehouse coordinates and sign on a high-contrast digital signature canvas.
            </P>
          </div>
        </Prose>

        <FigureRow
          items={[
            {
              src: "/jeevy/mat-qc-step1.webp",
              alt: "Step one of the QC wizard showing unit-batch inspection allocation",
              caption:
                "Step 1 of the QC Wizard: unit-batch inspection allocation allowing partial lot check-ins without orphaned line items.",
              width: 957,
              height: 797,
            },
            {
              src: "/jeevy/mat-qc-step2.webp",
              alt: "Step two of the QC wizard showing structured defect categorization with photo attachments",
              caption:
                "Step 2 of the QC Wizard: structured defect categorization with photo attachments for vendor damage claims.",
              width: 1015,
              height: 1117,
            },
          ]}
        />

        {/* ══ 5. INVENTORY & NESTING ══ */}
        <Prose>
          <H2 id="inventory">5-column linear inventory and 1-to-N plate nesting</H2>
          <div className="mt-8 space-y-6">
            <P>
              Legacy MES systems bury stock inside multi-level accordion trees. I replaced this with a
              flat, five-column linear registry: item and part number, location, available quantity,
              project or stock, and action.
            </P>
            <P>
              <span className="text-white">Automated FIFO consumption.</span> Clicking Consume
              decrements stock from the oldest qc_log lots first while incrementing consumed_qty, which
              preserves the inspection history rather than overwriting it.
            </P>
            <P>
              <span className="text-white">Whole-PO void protection.</span> The system blocks PO
              cancellations once units have been consumed on the shop floor, enforcing append-only
              negative adjustments so the audit stays valid.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/mat-inventory-ledger.webp"
          alt="Production linear inventory table with photo thumbnails and single-click consumption"
          caption="Production linear inventory table with 36px photo thumbnails and single-click FIFO stock consumption."
          width={2400}
          height={1112}
        />

        <Prose>
          <div className="space-y-6">
            <P>
              During on-site reviews with Trevor Goldston, I watched estimators calculate plate cutting
              layouts on scratch paper — ordering a single 6&prime;×8&prime; raw plate to fulfil four
              smaller child parts.
            </P>
            <P>
              I architected the 1-to-N bulk parent cut model. Sourcing managers select child BOM cuts,
              choose a parent stock plate, and receive an automated nesting preview at 78.4%
              utilization.
            </P>
            <P>
              When the plate arrives, the system allocates the child parts to the job while logging the
              remaining 21.6% remnant sheet directly into shop inventory for future projects.
            </P>
          </div>
        </Prose>

        <Figure
          src="/jeevy/mat-bulk-nesting.webp"
          alt="Bulk sourcing workflow calculating plate nesting utilization and remnant offcuts"
          caption="Bulk sourcing interactive workflow calculating nesting utilization (78.4%) and tracking projected remnant plate offcuts."
          width={2400}
          height={1350}
        />

        {/* ══ 6. MULTI-SHOP ══ */}
        <Prose>
          <H2 id="multi-shop">Scaling to partner shops without code forks</H2>
          <div className="mt-8 space-y-6">
            <P>
              The real test of systems architecture was deploying Jeevy OS to our second partner
              manufacturing plant. Their shop coordinator needed a dedicated drawing callout and
              location column to link part rows directly to title-block coordinates on aerospace
              blueprints.
            </P>
            <P>
              Rather than running brittle SQL schema migrations for every unique partner requirement, I
              engineered a Notion-style dynamic property engine backed by PostgreSQL JSONB column maps
              and atomic RPCs.
            </P>
            <P>
              <span className="text-white">Zero-migration extensibility.</span> Shop managers create,
              rename, and reorder custom columns on the fly, across eleven typed fields: text, number,
              select, person, date, checkbox, URL and more.
            </P>
            <P>
              <span className="text-white">Contextual short names.</span> The importer parses
              human-readable nicknames on CSV import, so a row reads 4in Pipe Inlet Header rather than a
              40-character ASTM specification.
            </P>
          </div>
        </Prose>

        <Figure
          size="compact"
          src="/jeevy/mat-custom-columns.webp"
          alt="In-place custom property creation popover offering eleven typed field options"
          caption="In-place Notion-style custom property creation supporting 11 dynamic field types backed by PostgreSQL JSONB maps."
          width={511}
          height={602}
        />

        {/* ══ 7. RETROSPECTIVE ══ */}
        <Prose>
          <H2 id="retrospective">Systems reflection and executive reception</H2>
          <div className="mt-8 space-y-6">
            <P>
              Building the materials engine solo proved that enterprise UX cannot be separated from
              database constraints. By enforcing append-only single-table ledgers, dynamic spend
              limits, and 4-step dock QA, BOM-to-RFQ turnaround dropped from 48 hours to under 12
              minutes, and rogue spending was eliminated outright.
            </P>
          </div>
        </Prose>

        <WideCallout label="Verified Outcomes" items={VERIFIED_OUTCOMES} />

        <Prose>
          <blockquote className="border-l border-white/20 pl-6">
            <p className="text-[18px] font-normal leading-[28px] tracking-[-0.01em] text-white">
              &ldquo;I just want to share the good news with you… It really feels good when somebody
              gets to finally start using the software. Someone is actually going in every single day
              to start using the thing that you built.&rdquo;
            </p>
            <footer className="mt-3 text-[14px] leading-relaxed text-neutral-500">
              Vinay Konuru, VP Technology &amp; Product — milestone debrief
            </footer>
          </blockquote>
        </Prose>

        <Figure
          src="/jeevy/team-onsite-cleburne.jpg"
          alt="Three of the team on-site beside a tarped skid at the Cleburne fabrication plant"
          caption="Vinay Konuru (VP Tech), Sai Tangudu (Engineering), and Pradeep Y. on-site in Cleburne following the materials release."
          ratio="aspect-[16/10]"
        />

        {/* ══ 8. BOTTOM RAIL ══ */}
        <Prose>
          <div className="flex flex-col gap-5 border-t border-white/10 pt-10">
            <GhostLink href="/work/jeevy-os" size={14}>
              ← Return to Jeevy OS master hub
            </GhostLink>
            <GhostLink href="/work/jeevy-os/shop-kiosk-feedback" size={14}>
              Next blueprint: 02. Shop-Floor Kiosk &amp; Worker Feedback System →
            </GhostLink>
          </div>
        </Prose>
      </article>

      <Footer />
    </div>
  );
}
