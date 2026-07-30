"use client";

import Card from "@/components/ui/Card";
import {
  LENGTH_HINTS,
  LENGTH_LABELS,
  LENGTH_OPTIONS,
  SELECTIVITY_LABELS,
  SELECTIVITY_OPTIONS,
  TONE_HINTS,
  TONE_LABELS,
  TONE_OPTIONS,
  type Length,
  type Selectivity,
  type Tone,
} from "@/lib/drafts";

type StyleCardProps = {
  selectivity: Selectivity;
  tone: Tone;
  length: Length;
  onPatch: (patch: {
    selectivity?: Selectivity;
    tone?: Tone;
    length?: Length;
  }) => void;
  disabled?: boolean;
};

function Chips<T extends string>({
  options,
  value,
  labels,
  hints,
  onSelect,
  disabled,
}: {
  options: T[];
  value: T;
  labels: Record<T, string>;
  hints: Record<T, string>;
  onSelect: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              value === option
                ? "bg-ink text-white"
                : "border border-ink/15 text-ink hover:bg-ink/5"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {labels[option]}
          </button>
        ))}
      </div>
      <div className="mt-2 text-xs text-ink/50">{hints[value]}</div>
    </>
  );
}

export default function StyleCard({
  selectivity,
  tone,
  length,
  onPatch,
  disabled,
}: StyleCardProps) {
  return (
    <>
      <Card className="p-5">
        <div className="mb-2 text-sm font-bold text-ink">Response style</div>
        <div className="mb-3 text-xs text-ink/50">
          How often do you like to reply? On the strictest setting InboxOS will
          skip mail it judges doesn&apos;t need an answer, and no draft appears.
        </div>
        <select
          value={selectivity}
          disabled={disabled}
          onChange={(e) =>
            onPatch({ selectivity: e.target.value as Selectivity })
          }
          className="w-full rounded-xl border border-black/10 bg-card px-3 py-2.5 text-sm text-ink focus:outline-none disabled:opacity-60"
        >
          {SELECTIVITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {SELECTIVITY_LABELS[option]}
            </option>
          ))}
        </select>
      </Card>

      <Card className="p-5">
        <div className="mb-3 text-sm font-bold text-ink">Tone</div>
        <Chips
          options={TONE_OPTIONS}
          value={tone}
          labels={TONE_LABELS}
          hints={TONE_HINTS}
          onSelect={(t) => onPatch({ tone: t })}
          disabled={disabled}
        />
      </Card>

      <Card className="p-5">
        <div className="mb-3 text-sm font-bold text-ink">Reply length</div>
        <Chips
          options={LENGTH_OPTIONS}
          value={length}
          labels={LENGTH_LABELS}
          hints={LENGTH_HINTS}
          onSelect={(l) => onPatch({ length: l })}
          disabled={disabled}
        />
      </Card>
    </>
  );
}
