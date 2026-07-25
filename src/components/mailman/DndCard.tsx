"use client";

import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import TimeField from "@/components/ui/TimeField";
import type { MailmanSettings } from "@/lib/mailman";

type Props = {
  settings: MailmanSettings;
  disabled?: boolean;
  onChange: (patch: Partial<MailmanSettings>) => void;
};

export default function DndCard({ settings, disabled, onChange }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-ink">Do Not Disturb</div>
          <div className="text-xs text-ink/50">Hold everything except VIPs during quiet hours.</div>
        </div>
        <Toggle
          checked={settings.dnd_enabled}
          onChange={(v) =>
            v
              ? onChange({
                  dnd_enabled: true,
                  dnd_start: settings.dnd_start ?? "22:00",
                  dnd_end: settings.dnd_end ?? "07:00",
                })
              : onChange({ dnd_enabled: false })
          }
          disabled={disabled}
          label="Do Not Disturb"
        />
      </div>
      {settings.dnd_enabled ? (
        <div className="mt-4 grid max-w-md gap-4 sm:grid-cols-2">
          <TimeField
            label="Quiet hours start"
            value={settings.dnd_start ?? "22:00"}
            onChange={(v) => onChange({ dnd_start: v })}
            disabled={disabled}
          />
          <TimeField
            label="Quiet hours end"
            value={settings.dnd_end ?? "07:00"}
            onChange={(v) => onChange({ dnd_end: v })}
            disabled={disabled}
          />
        </div>
      ) : null}
    </Card>
  );
}
