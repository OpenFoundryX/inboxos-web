"use client";

import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";

type StatusBarProps = {
  active: boolean;
  heldCount: number | null;
  lastDeliveryAt: string | null;
  disabled?: boolean;
  onToggle: (v: boolean) => void;
};

export default function StatusBar({ active, heldCount, lastDeliveryAt, disabled, onToggle }: StatusBarProps) {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Toggle checked={active} onChange={onToggle} disabled={disabled} label="Batching active" />
        <div>
          <div className="text-sm font-bold text-ink">Batched delivery {active ? "on" : "off"}</div>
          <div className="text-xs text-ink/50">
            {active
              ? "Incoming mail is held and delivered on your schedule."
              : "Mail lands in your inbox as it arrives."}
          </div>
        </div>
      </div>
      <div className="flex gap-8">
        <div>
          <div className="text-xs text-ink/50">Held now</div>
          <div className="text-lg font-extrabold text-ink">{heldCount ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-ink/50">Last delivery</div>
          <div className="text-sm font-semibold text-ink/70">
            {lastDeliveryAt ? new Date(lastDeliveryAt).toLocaleString() : "—"}
          </div>
        </div>
      </div>
    </Card>
  );
}
