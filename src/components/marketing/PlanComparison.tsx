import { PLANS, FEATURE_GROUPS, type Cell } from "@/lib/plans";

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <span aria-hidden="true" className="text-accent">
          ✓
        </span>
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <span aria-hidden="true" className="text-ink/25">
          —
        </span>
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm text-ink/75">{value}</span>;
}

export default function PlanComparison() {
  return (
    <section id="compare" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight">
          Compare plans
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink/60">
          Everything each plan includes, including the limits. No asterisks.
        </p>
      </div>

      {/* Wide table on a narrow phone has to scroll inside its own box —
          otherwise the whole page scrolls sideways. */}
      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" className="w-[34%] pb-4" />
              {PLANS.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className="pb-4 text-center font-serif text-base font-semibold"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>

          {FEATURE_GROUPS.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={PLANS.length + 1}
                  className="border-t border-black/10 pt-8 pb-1 text-left"
                >
                  <span className="text-sm font-semibold uppercase tracking-wide text-ink">
                    {group.title}
                  </span>
                  <p className="mt-1 max-w-lg text-sm font-normal leading-relaxed text-ink/50">
                    {group.caption}
                  </p>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-t border-black/5">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-sm font-normal text-ink/80"
                  >
                    {row.label}
                    {row.note && (
                      <span className="mt-0.5 block text-xs text-ink/45">
                        {row.note}
                      </span>
                    )}
                  </th>
                  {PLANS.map((p) => (
                    <td key={p.id} className="py-3 text-center">
                      <CellValue value={row.cells[p.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
