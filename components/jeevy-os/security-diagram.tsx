import { Arrowhead, Node, Diamond, Edge, Lbl, DIAGRAM_W } from "./diagram-kit";

/**
 * Atomic 3-gate authorization pipeline for Engine 03.
 *
 * Every gate sits on a single vertical spine. Denials branch right to their
 * own 403, successes continue straight down, and each gate's question is set
 * to the left of its diamond where nothing else runs. That keeps the read
 * order top-to-bottom and leaves every label clear of a connector.
 */

const M = "secarrow";

/** Gate question, set left of the spine with 14px clearance from the shape. */
const Question = ({ y, children }: { y: number; children: string }) => (
  <text x={355} y={y} fill="#9CA3AF" fontSize={13} textAnchor="end">
    {children}
  </text>
);

export function SecurityGateDiagram() {
  return (
    <svg
      viewBox={`0 0 ${DIAGRAM_W} 634`}
      className="h-auto w-full"
      role="img"
      aria-label="Three-gate authorization pipeline. An incoming request carrying a user, file and action passes gate one, shop tenancy; a mismatch returns 403 cross-tenant forbidden. It then passes gate two, the view prerequisite; without read clearance it returns 403 for lacking view authorization. It then passes gate three, mutation clearance; without an active write or admin role it returns 403 for lacking mutation privilege. Only a request clearing all three gates executes the upload, confirm, restore or delete."
    >
      <Arrowhead id={M} />

      <Node x={284} y={0} w={360} h={72} title="Incoming request" sub="User · file · action" />
      <Edge d="M 464 72 L 464 120" marker={M} />

      {/* Gate 1: tenancy */}
      <Diamond cx={464} cy={160} hw={95} hh={36} title="Gate 1: tenancy" />
      <Question y={164}>Shop ID match?</Question>
      <Edge d="M 559 160 L 636 160" marker={M} />
      <Lbl x={597} y={150}>No</Lbl>
      <Node x={640} y={124} w={288} h={72} title="403 Forbidden" sub="Cross-tenant access" />
      <Edge d="M 464 196 L 464 256" marker={M} />
      <Lbl x={452} y={230} anchor="end">Yes</Lbl>

      {/* Gate 2: view prerequisite */}
      <Diamond cx={464} cy={296} hw={95} hh={36} title="Gate 2: view" />
      <Question y={300}>Read permission cleared?</Question>
      <Edge d="M 559 296 L 636 296" marker={M} />
      <Lbl x={597} y={286}>No</Lbl>
      <Node x={640} y={260} w={288} h={72} title="403 Forbidden" sub="Subject lacks view auth" />
      <Edge d="M 464 332 L 464 392" marker={M} />
      <Lbl x={452} y={366} anchor="end">Yes</Lbl>

      {/* Gate 3: mutation clearance */}
      <Diamond cx={464} cy={432} hw={95} hh={36} title="Gate 3: mutation" />
      <Question y={436}>Write or admin role active?</Question>
      <Edge d="M 559 432 L 636 432" marker={M} />
      <Lbl x={597} y={422}>No</Lbl>
      <Node x={640} y={396} w={288} h={72} title="403 Forbidden" sub="Lacks mutation privilege" />
      <Edge d="M 464 468 L 464 528" marker={M} />
      <Lbl x={452} y={502} anchor="end">Yes</Lbl>

      <Node
        x={284}
        y={532}
        w={360}
        h={72}
        title="Execute mutation"
        sub="Upload · confirm · restore · delete"
      />
    </svg>
  );
}
