import type { ReactNode } from "react";

/** A section label with an optional action on the right. */
export default function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
