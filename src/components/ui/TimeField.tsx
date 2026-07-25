"use client";

type TimeFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function TimeField({ label, value, onChange, disabled }: TimeFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      {label ? <span className="text-xs font-medium text-ink/60">{label}</span> : null}
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink focus:outline-none disabled:opacity-50"
      />
    </label>
  );
}
