"use client";

import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Stepper from "@/components/ui/Stepper";
import TimeField from "@/components/ui/TimeField";
import type { DeliveryMode, MailmanSettings } from "@/lib/mailman";

const MODE_LABEL: Record<DeliveryMode, string> = {
  interval: "Interval",
  times: "Times per day",
  custom_daily: "Custom times",
};
const LABEL_MODE: Record<string, DeliveryMode> = {
  Interval: "interval",
  "Times per day": "times",
  "Custom times": "custom_daily",
};

type Props = {
  settings: MailmanSettings;
  disabled?: boolean;
  onChange: (patch: Partial<MailmanSettings>) => void;
};

export default function DeliveryScheduleCard({ settings, disabled, onChange }: Props) {
  const times = settings.custom_times;

  function setTime(i: number, v: string) {
    const next = [...times];
    next[i] = v;
    onChange({ custom_times: next });
  }

  return (
    <Card className="p-5">
      <div className="mb-4 text-sm font-bold text-ink">Delivery schedule</div>
      <Tabs
        tabs={["Interval", "Times per day", "Custom times"]}
        active={MODE_LABEL[settings.delivery_mode]}
        onChange={(t) => {
          const mode = LABEL_MODE[t];
          const patch: Partial<MailmanSettings> = { delivery_mode: mode };
          if (mode === "interval") {
            patch.interval_hours = settings.interval_hours ?? 4;
            patch.interval_minutes = null;
          } else if (mode === "times") {
            patch.times_per_day = settings.times_per_day ?? 3;
          } else if (mode === "custom_daily" && settings.custom_times.length === 0) {
            patch.custom_times = ["09:00"];
          }
          onChange(patch);
        }}
        className="mb-6"
      />

      {settings.delivery_mode === "interval" ? (
        <div className="max-w-xs">
          <div className="mb-2 text-sm text-ink/60">Deliver every</div>
          <Stepper
            value={settings.interval_hours ?? 4}
            onChange={(v) => onChange({ interval_hours: v, interval_minutes: null })}
            min={1}
            max={24}
            suffix="hours"
          />
        </div>
      ) : settings.delivery_mode === "times" ? (
        <div className="max-w-xs">
          <div className="mb-2 text-sm text-ink/60">Deliveries per day</div>
          <Stepper
            value={settings.times_per_day ?? 3}
            onChange={(v) => onChange({ times_per_day: v })}
            min={1}
            max={24}
            suffix="times"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-ink/60">Deliver at these times</div>
          <div className="flex flex-wrap gap-3">
            {times.map((t, i) => (
              <div key={i} className="flex items-end gap-1">
                <TimeField value={t} onChange={(v) => setTime(i, v)} disabled={disabled} />
                <button
                  type="button"
                  onClick={() => onChange({ custom_times: times.filter((_, idx) => idx !== i) })}
                  disabled={disabled}
                  className="mb-2 text-ink/40 hover:text-ink disabled:opacity-50"
                  aria-label="Remove time"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange({ custom_times: [...times, "12:00"] })}
            disabled={disabled}
            className="text-sm font-medium text-accent hover:text-accent-dark disabled:opacity-50"
          >
            + Add time
          </button>
        </div>
      )}

      <div className="mt-6 grid max-w-md gap-4 sm:grid-cols-2">
        <TimeField
          label="Active window start"
          value={settings.active_window_start}
          onChange={(v) => onChange({ active_window_start: v })}
          disabled={disabled}
        />
        <TimeField
          label="Active window end"
          value={settings.active_window_end}
          onChange={(v) => onChange({ active_window_end: v })}
          disabled={disabled}
        />
      </div>
      <label className="mt-4 flex max-w-md flex-col gap-1">
        <span className="text-xs font-medium text-ink/60">Timezone</span>
        <input
          value={settings.timezone}
          onChange={(e) => onChange({ timezone: e.target.value })}
          disabled={disabled}
          placeholder="e.g. Asia/Kolkata"
          className="rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-50"
        />
      </label>
    </Card>
  );
}
