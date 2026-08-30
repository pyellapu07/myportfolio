/**
 * Shared primitives for the Jeevy OS architecture diagrams.
 *
 * Extracted so every diagram carries the same surface, stroke, arrowhead and
 * type treatment. These are the values tuned on the Engine 02 dual-clock
 * diagram: a solid grey panel rather than a low-alpha tint, because a tint
 * over a near-black canvas never actually reads as grey.
 *
 * Diagrams pin their viewBox width to 928, the content width of the 960px
 * breakout measure at px-4, so they render at scale 1 and their 15/13/12px
 * text is genuinely that size rather than being shrunk by `w-full`.
 */

export const FILL = "#2E3845";
export const STROKE = "rgba(255, 255, 255, 0.18)";
export const EDGE = "#85919E";
/** Floating labels and captions that sit on the dark canvas. */
export const SUB = "#9CA3AF";
/** Sub-text inside a node sits on the grey panel and needs to be lighter. */
export const NODE_SUB = "#D8DCE2";

export const DIAGRAM_W = 928;

export function Arrowhead({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 8 8"
        refX={6}
        refY={4}
        markerWidth={8}
        markerHeight={8}
        orient="auto-start-reverse"
      >
        {/* open chevron, not a filled triangle */}
        <path d="M 0 0 L 6 4 L 0 8" fill="none" stroke={EDGE} strokeWidth={1.5} />
      </marker>
    </defs>
  );
}

export function Node({
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
  sub?: string;
}) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={FILL} stroke={STROKE} strokeWidth={1} />
      <text
        x={cx}
        y={sub ? y + 30 : y + h / 2 + 5}
        fill="#FFFFFF"
        fontSize={15}
        fontWeight={600}
        textAnchor="middle"
      >
        {title}
      </text>
      {sub && (
        <text x={cx} y={y + 52} fill={NODE_SUB} fontSize={13} textAnchor="middle">
          {sub}
        </text>
      )}
    </g>
  );
}

export function Diamond({
  cx,
  cy,
  hw,
  hh,
  title,
}: {
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  title: string;
}) {
  return (
    <g>
      <polygon
        points={`${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={1}
      />
      <text x={cx} y={cy + 5} fill="#FFFFFF" fontSize={14} fontWeight={600} textAnchor="middle">
        {title}
      </text>
    </g>
  );
}

export const Edge = ({ d, marker }: { d: string; marker: string }) => (
  <path d={d} fill="none" stroke={EDGE} strokeWidth={1} markerEnd={`url(#${marker})`} />
);

/** Floating labels sit beside their connector, never on top of one. */
export const Lbl = ({
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
