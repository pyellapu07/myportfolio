/**
 * Procurement pipeline for Engine 01.
 *
 * Hand-authored SVG (Mermaid is not a dependency here; it ships ~2.5MB and
 * renders post-hydration). Surfaces and strokes come from the shared kit;
 * branch labels are parked beside their
 * connectors with 12px clearance so nothing overlaps a line.
 *
 * viewBox width is pinned to 928, the content width of the 960px breakout
 * measure at px-4, so the diagram renders at scale 1 and its 15/13/12px
 * text is genuinely that size.
 */

// tokens shared with the other diagrams so all three read as one system
import { FILL, STROKE, EDGE, SUB, NODE_SUB } from "./diagram-kit";

/** Vertical clearance between the decision diamond and its child nodes. */
const DIAMOND_BOTTOM = 288;
const CHILD_TOP = 360; // 72px of air, up from 42px

function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
}) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={FILL} stroke={STROKE} strokeWidth={1} />
      <text x={cx} y={y + 28} fill="#FFFFFF" fontSize={15} fontWeight={600} textAnchor="middle">
        {title}
      </text>
      <text x={cx} y={y + 50} fill={NODE_SUB} fontSize={13} textAnchor="middle">
        {sub}
      </text>
    </g>
  );
}

const Edge = ({ d }: { d: string }) => (
  <path d={d} fill="none" stroke={EDGE} strokeWidth={1} markerEnd="url(#matarrow)" />
);

/** Edge labels sit beside their connector, never on it. */
const Lbl = ({
  x,
  y,
  anchor = "middle",
  children,
}: {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  children: string;
}) => (
  <text x={x} y={y} fill={SUB} fontSize={12} textAnchor={anchor}>
    {children}
  </text>
);

export function ProcurementPipeline() {
  return (
    <svg
      viewBox="0 0 928 730"
      width={928}
      className="h-auto max-w-none"
      role="img"
      aria-label="Procurement pipeline: a BOM demand line enters a multi-vendor RFQ tray, then a server-resolved governance check. Orders at or above $1,000 route to an approval stage that mints a draft ID with a null PO number and require PM sign-off before a legal PO is minted; orders below the threshold mint a PO directly. Every PO passes through a 4-step dock QC wizard, which either releases units into FIFO inventory or holds them in quarantine."
    >
      <defs>
        {/* open arrowhead, a stroked chevron, not a filled triangle */}
        <marker
          id="matarrow"
          viewBox="0 0 8 8"
          refX={6}
          refY={4}
          markerWidth={8}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 6 4 L 0 8" fill="none" stroke={EDGE} strokeWidth={1.5} />
        </marker>
      </defs>

      <Node x={304} y={0} w={320} h={64} title="BOM demand line" sub="JSONB schema · short names" />
      <Edge d="M 464 64 L 464 100" />

      <Node x={304} y={104} w={320} h={64} title="Multi-vendor RFQ tray" sub="Anchored 430px popover" />
      <Edge d="M 464 168 L 464 200" />

      {/* decision */}
      <polygon
        points={`464,204 634,246 464,${DIAMOND_BOTTOM} 294,246`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={1}
      />
      <text x={464} y={242} fill="#FFFFFF" fontSize={14} fontWeight={600} textAnchor="middle">
        Governance check
      </text>
      <text x={464} y={262} fill={SUB} fontSize={12} textAnchor="middle">
        Server-resolved limit
      </text>

      {/* ≥ $1k → approval (left) */}
      <Edge d={`M 294 246 L 210 246 L 210 ${CHILD_TOP - 4}`} />
      <Lbl x={198} y={306} anchor="end">≥ $1k</Lbl>

      {/* < $1k → PO minted (right) */}
      <Edge d={`M 634 246 L 718 246 L 718 ${CHILD_TOP - 4}`} />
      <Lbl x={730} y={306} anchor="start">&lt; $1k</Lbl>

      <Node x={40} y={CHILD_TOP} w={340} h={76} title="Approval stage" sub="Draft ID · PO number NULL" />
      <Node x={548} y={CHILD_TOP} w={340} h={76} title="PO minted" sub="Legal counter SPX260101" />

      <Edge d="M 380 398 L 544 398" />
      <Lbl x={462} y={388}>PM sign-off</Lbl>

      <Edge d="M 718 436 L 718 472 L 464 472 L 464 504" />

      <Node x={304} y={512} w={320} h={64} title="4-step dock QC wizard" sub="Unit-batch splitting" />

      <Edge d="M 464 576 L 464 604 L 210 604 L 210 636" />
      <Lbl x={296} y={594} anchor="end">Passed</Lbl>

      <Edge d="M 464 576 L 464 604 L 718 604 L 718 636" />
      <Lbl x={632} y={594} anchor="start">Damaged</Lbl>

      <Node x={40} y={640} w={340} h={76} title="FIFO inventory" sub="Automatic lot deduction" />
      <Node x={548} y={640} w={340} h={76} title="Quarantine hold" sub="Vendor dispute log" />
    </svg>
  );
}
