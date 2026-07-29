"use client";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  /** Optional chips under the description, e.g. the labels a choice applies. */
  tags?: string[];
};

type RadioGroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div role="radiogroup" className="space-y-2.5">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`group flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition duration-200 ${
              selected
                ? "border-accent/50 bg-accent/[0.05] shadow-[0_10px_24px_-16px_rgba(240,86,45,0.9)]"
                : "border-black/[0.07] bg-card hover:-translate-y-px hover:border-ink/15 hover:bg-white hover:shadow-[0_10px_22px_-16px_rgba(26,29,38,0.7)]"
            }`}
          >
            <span
              className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selected ? "border-accent bg-accent" : "border-ink/20 group-hover:border-ink/40"
              }`}
            >
              {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{opt.label}</span>
              {opt.description ? (
                <span className="mt-1 block text-xs leading-relaxed text-ink/50">
                  {opt.description}
                </span>
              ) : null}
              {opt.tags && opt.tags.length > 0 ? (
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {opt.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        selected ? "bg-white text-ink/60" : "bg-canvas text-ink/50"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
