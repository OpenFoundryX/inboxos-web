"use client";

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
};

export default function Stepper({ value, onChange, min = 0, max = 999, suffix }: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/5 bg-card p-2">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-lg text-ink disabled:opacity-40"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="text-sm font-semibold text-ink">
        {value}
        {suffix ? ` ${suffix}` : ""}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-lg text-ink disabled:opacity-40"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
