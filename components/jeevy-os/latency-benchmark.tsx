/**
 * Inspection latency benchmark for Engine 03.
 *
 * Both workflows are plotted against one shared 0 to 90 second axis inside a
 * single chart frame, so the difference is read from the geometry rather than
 * from the numbers. Everything is font-sans; figures use tabular-nums so the
 * digits align without reaching for a monospace face.
 *
 * The gridlines are laid out with justify-between, which is only correct
 * because 0/30/60/90 are equidistant on a 0-90 axis. Adding an off-step tick
 * (15s, 45s) would need explicit positioning, or the axis would misstate the
 * scale it exists to show.
 */

/**
 * Fills and text carry different values on purpose. #4E8775 and #C25E43 read
 * fine as large solid shapes, but at small sizes they land near 4.6:1 on this
 * canvas, which is thin. The lighter pair is used wherever the tone becomes
 * type, and clears 7:1.
 */
const SAGE_FILL = "#4E8775";
const RUST_FILL = "#C25E43";
const SAGE_TEXT = "#6FA894";
const RUST_TEXT = "#E08A6E";

const GRIDLINES: { label: string; align: "left" | "right" }[] = [
  { label: "0s", align: "left" },
  { label: "30s (idle threshold)", align: "left" },
  { label: "60s", align: "left" },
  { label: "90s (severe stall)", align: "right" },
];

export function InspectionLatencyBenchmark() {
  return (
    <div className="mx-auto my-14 max-w-[840px] border-t border-white/[0.08] px-4 pt-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="text-[12px] font-normal text-neutral-400">
            Drawing retrieval and inspection latency
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-tight text-white">
            Sub-second browser rendering versus desktop SolidWorks boot
          </div>
        </div>
        <div
          className="text-[14px] font-medium tracking-tight tabular-nums"
          style={{ color: SAGE_TEXT }}
        >
          97% latency reduction
        </div>
      </div>

      {/* unified chart frame */}
      <div className="relative space-y-6 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 pb-4 pt-8">
        {/* background guides, sharing the rows' inner width so they line up */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex justify-between px-4">
          {GRIDLINES.map((g) => (
            <div key={g.label} className="relative h-full w-px bg-white/[0.05]">
              <span
                className={`absolute top-2 whitespace-nowrap text-[12px] text-neutral-400 ${
                  g.align === "right" ? "right-1" : "left-1"
                }`}
              >
                {g.label}
              </span>
            </div>
          ))}
        </div>

        {/* legacy: a range, because it never resolved to one number */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="font-medium text-neutral-200">
              Desktop CAD launch (SolidWorks on shop tablet)
            </span>
            <span className="font-medium tabular-nums" style={{ color: RUST_TEXT }}>
              45.0s – 90.0s
            </span>
          </div>

          <div className="relative h-7 w-full overflow-hidden rounded-[4px] border border-white/[0.06] bg-black/40">
            <div
              className="absolute bottom-0 left-[50%] right-0 top-0 flex items-center border-l px-3"
              style={{ backgroundColor: `${RUST_FILL}40`, borderLeftColor: `${RUST_FILL}99` }}
            >
              <span
                className="truncate text-[12px] font-medium"
                style={{ color: RUST_TEXT }}
              >
                Full CAD model download and background process boot
              </span>
            </div>
          </div>

          <p className="text-[14px] font-normal leading-[22px] text-neutral-400">
            Welders halt at the bay while tablets download multi-megabyte CAD assemblies, causing
            frequent crashes on shop terminals.
          </p>
        </div>

        {/* shipped: a sliver pinned at the origin of the same axis */}
        <div className="relative z-10 space-y-2 pt-2">
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="font-medium text-white">Jeevy browser-native 2D/3D split view</span>
            <span className="font-medium tabular-nums" style={{ color: SAGE_TEXT }}>
              1.2s
            </span>
          </div>

          <div className="relative flex h-7 w-full items-center rounded-[4px] border border-white/[0.06] bg-black/40">
            <div
              className="h-full w-[1.33%] min-w-[6px] rounded-l-[3px]"
              style={{ backgroundColor: SAGE_FILL }}
            />
            <span className="truncate pl-3 text-[12px] font-medium" style={{ color: SAGE_TEXT }}>
              1.2s · Instant cutaway and title block inspection
            </span>
          </div>

          <p className="text-[14px] font-normal leading-[22px] text-neutral-400">
            Zero desktop software required. Vector PDFs and 3D STP models render directly in the
            browser split view without leaving the active folder.
          </p>
        </div>
      </div>
    </div>
  );
}
