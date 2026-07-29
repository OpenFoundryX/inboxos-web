"use client";

import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import TagListEditor from "@/components/ui/TagListEditor";
import type { NotetakerSettings } from "@/lib/meetings";

type Props = {
  settings: NotetakerSettings;
  disabled?: boolean;
  onChange: (patch: Partial<NotetakerSettings>) => void;
};

function SwitchRow({
  title,
  hint,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-black/5 px-5 py-4 first:border-t-0">
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-xs text-ink/50">{hint}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}

/** Bounds match the Pydantic `Field` constraints on `SettingsUpdate`, so the
 *  common case never round-trips a 422. Clamping happens on blur rather than on
 *  every keystroke — clamping as you type makes the field impossible to clear
 *  and edit. */
function NumberField({
  label,
  hint,
  value,
  min,
  max,
  suffix,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="mt-0.5 block text-xs text-ink/50">{hint}</span>
      <span className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (e.target.value !== "" && !Number.isNaN(n)) onChange(n);
          }}
          onBlur={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isNaN(n) ? min : Math.min(max, Math.max(min, Math.round(n))));
          }}
          className="w-24 rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink focus:outline-none disabled:opacity-50"
        />
        <span className="text-sm text-ink/50">{suffix}</span>
      </span>
    </label>
  );
}

export default function NotetakerRules({ settings, disabled, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <SwitchRow
          title="Join my meetings automatically"
          hint="Sends the notetaker to every calendar event that passes the rules below. With this off, you turn the notetaker on one meeting at a time."
          checked={settings.auto_join}
          disabled={disabled}
          onChange={(v) => onChange({ auto_join: v })}
        />
      </Card>

      <Card className="space-y-6 p-5">
        <div className="text-sm font-bold text-ink">Rules</div>

        <label className="block max-w-md">
          <span className="text-sm font-semibold text-ink">Bot name</span>
          <span className="mt-0.5 block text-xs text-ink/50">
            What everyone else in the call sees in the participant list.
          </span>
          <input
            value={settings.bot_name}
            maxLength={64}
            disabled={disabled}
            onChange={(e) => onChange({ bot_name: e.target.value })}
            className="mt-2 w-full rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-50"
          />
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField
            label="Join window"
            hint="How far ahead a meeting is booked. Meetings further out are picked up as they get closer."
            value={settings.lookahead_minutes}
            min={1}
            max={1440}
            suffix="minutes before"
            disabled={disabled}
            onChange={(v) => onChange({ lookahead_minutes: v })}
          />
          <NumberField
            label="Minimum attendees"
            hint="Skips solo holds. 2 means at least one other person has to be invited."
            value={settings.min_attendees}
            min={1}
            max={100}
            suffix="people"
            disabled={disabled}
            onChange={(v) => onChange({ min_attendees: v })}
          />
        </div>

        <div>
          <TagListEditor
            label="Never join meetings titled"
            placeholder="e.g. 1:1, focus block"
            values={settings.skip_titles}
            disabled={disabled}
            onChange={(v) => onChange({ skip_titles: v })}
          />
          <p className="mt-2 text-xs text-ink/50">
            Matched anywhere in the title, ignoring case.
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-black/5 bg-canvas/50 px-5 py-3 text-sm font-semibold text-ink">
          After the meeting
        </div>
        <SwitchRow
          title="Email me a recap"
          hint="Summary, decisions, and action items sent when the notes are ready."
          checked={settings.email_recap}
          disabled={disabled}
          onChange={(v) => onChange({ email_recap: v })}
        />
        <SwitchRow
          title="Create reminders from action items"
          hint="Anything assigned to you becomes a reminder."
          checked={settings.create_reminders}
          disabled={disabled}
          onChange={(v) => onChange({ create_reminders: v })}
        />
        <SwitchRow
          title="Include in my digest"
          hint="Meeting notes appear alongside your batched email digest."
          checked={settings.include_in_digest}
          disabled={disabled}
          onChange={(v) => onChange({ include_in_digest: v })}
        />
      </Card>
    </div>
  );
}
