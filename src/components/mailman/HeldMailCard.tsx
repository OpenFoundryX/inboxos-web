"use client";

import Card from "@/components/ui/Card";
import type { HeldEmail } from "@/lib/mailman";

export default function HeldMailCard({ held }: { held: HeldEmail[] }) {
  return (
    <Card className="p-5">
      <div className="mb-4 text-sm font-bold text-ink">Held mail</div>
      {held.length === 0 ? (
        <div className="py-8 text-center text-sm text-ink/40">Nothing held right now.</div>
      ) : (
        <ul className="divide-y divide-black/5">
          {held.map((m, i) => (
            <li key={m.id ?? i} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-ink">{m.sender ?? "Unknown sender"}</span>
                <span className="shrink-0 text-xs text-ink/40">
                  {m.date ? new Date(m.date).toLocaleDateString() : ""}
                </span>
              </div>
              <div className="truncate text-sm text-ink/70">{m.subject ?? "(no subject)"}</div>
              {m.snippet ? <div className="truncate text-xs text-ink/40">{m.snippet}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
