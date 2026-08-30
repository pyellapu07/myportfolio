/**
 * Dual-clock architecture for Engine 02.
 *
 * Hand-authored SVG. Surfaces are a solid grey panel over the canvas
 * with a thin hairline border, no saturated fills.
 *
 * The decision diamonds are deliberately compact (156×72). At that size a
 * two-line label cannot fit inside the shape, so each diamond carries a short
 * title only and its description sits directly beneath. Both diamonds route
 * their exits through the left and right vertices, which keeps the space
 * below them free for that description.
 *
 * Every floating label clears its connector by at least 14px.
 *
 * viewBox width is pinned to 928, the content width of the 960px breakout
 * measure at px-4, so it renders at scale 1 and its text is truly 15/13/12px.
 */

/**
 * Solid grey surface rather than a low-alpha tint, a tint over a near-black
 * canvas never actually reads as grey. Pitched to sit clearly above the
 * canvas without competing with it for attention.
 */
const FILL = "#2E3845";
const STROKE = "rgba(255, 255, 255, 0.18)";
const EDGE = "#85919E";
/** Floating labels and the diamond captions: these sit on the dark canvas. */
const SUB = "#9CA3AF";
/**
 * Sub-text *inside* a node sits on the grey panel, not the canvas, so it needs
 * its own value, the canvas grey would be too dim against the lighter fill.
 */
const NODE_SUB = "#D8DCE2";

/** Compact decision diamond: 156 wide, 72 tall. */
const DIA_HW = 78;
const DIA_HH = 36;

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
      <text x={cx} y={y + 30} fill="#FFFFFF" fontSize={15} fontWeight={600} textAnchor="middle">
        {title}
      </text>
      <text x={cx} y={y + 52} fill={NODE_SUB} fontSize={13} textAnchor="middle">
        {sub}
      </text>
    </g>
  );
}

/** Diamond holds a short title; the description renders beneath the shape. */
function Diamond({ cx, cy, title, sub }: { cx: number; cy: number; title: string; sub: string }) {
  return (
    <g>
      <polygon
        points={`${cx},${cy - DIA_HH} ${cx + DIA_HW},${cy} ${cx},${cy + DIA_HH} ${cx - DIA_HW},${cy}`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={1}
      />
      <text x={cx} y={cy + 5} fill="#FFFFFF" fontSize={14} fontWeight={600} textAnchor="middle">
        {title}
      </text>
      <text x={cx} y={cy + DIA_HH + 24} fill={SUB} fontSize={12} textAnchor="middle">
        {sub}
      </text>
    </g>
  );
}

const Edge = ({ d }: { d: string }) => (
  <path d={d} fill="none" stroke={EDGE} strokeWidth={1} markerEnd="url(#kioskarrow)" />
);

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

export function DualClockDiagram() {
  return (
    <svg
      viewBox="0 0 928 800"
      width={928}
      className="h-auto max-w-none"
      role="img"
      aria-label="Dual-clock kiosk architecture: a shared plant tablet authenticates a worker with a 6-digit ephemeral PIN, which dispatches into two separate clocks: shop attendance in shop_time_entries and direct task labour in task_time_entries. Task labour passes through a lunch-break trigger that freezes the timer, then a tri-state clock-out that routes finished work to the PM review queue and blocked work to a live blocker alert."
    >
      <defs>
        <marker
          id="kioskarrow"
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

      <Node x={284} y={0} w={360} h={64} title="Shared plant tablet" sub="Wall-mounted, gloves on, always awake" />
      <Edge d="M 464 64 L 464 92" />

      <Node x={284} y={100} w={360} h={64} title="6-digit ephemeral PIN" sub="Server-side expiry token" />
      <Edge d="M 464 164 L 464 202" />

      <Diamond cx={464} cy={242} title="Dispatch" sub="Dual-clock · database layer" />

      {/* left branch: shop attendance (label clears the 165 rule by 14px) */}
      <Edge d="M 386 242 L 165 242 L 165 332" />
      <Lbl x={151} y={300} anchor="end">Shop attendance</Lbl>
      <Node x={20} y={340} w={290} h={72} title="shop_time_entries" sub="Physical on-site clock" />

      {/* right branch: direct task labour (label clears the 614 rule by 14px) */}
      <Edge d="M 542 242 L 614 242 L 614 332" />
      <Lbl x={628} y={300} anchor="start">Task direct labour</Lbl>
      <Node x={469} y={340} w={290} h={72} title="task_time_entries" sub="Direct job costing" />

      <Edge d="M 614 412 L 614 440" />
      <Node x={469} y={448} w={290} h={72} title="Lunch break trigger" sub="Timer frozen at current minute" />

      <Edge d="M 614 520 L 614 556" />
      <Diamond cx={614} cy={596} title="Clock-out" sub="Tri-state resolution" />

      {/* done → PM review (label sits 16px above its rule) */}
      <Edge d="M 536 596 L 445 596 L 445 688" />
      <Lbl x={490} y={580}>Done</Lbl>
      <Node x={300} y={696} w={290} h={72} title="PM review queue" sub="Supervisory sign-off" />

      {/* pending → live alert */}
      <Edge d="M 692 596 L 783 596 L 783 688" />
      <Lbl x={737} y={580}>Pending + note</Lbl>
      <Node x={638} y={696} w={290} h={72} title="Live blocker alert" sub="Asynchronous PM push" />
    </svg>
  );
}
