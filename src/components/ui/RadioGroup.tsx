"use client";

export type RadioOption = { value: string; label: string; description?: string };

type RadioGroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex w-full items-start gap-3 rounded-xl border border-black/5 bg-card p-4 text-left hover:border-ink/20"
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                selected ? "border-ink" : "border-ink/30"
              }`}
            >
              {selected ? <span className="h-2 w-2 rounded-full bg-ink" /> : null}
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{opt.label}</span>
              {opt.description ? (
                <span className="mt-0.5 block text-xs text-ink/50">{opt.description}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
