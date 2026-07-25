"use client";

type TabsProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
};

export default function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`inline-flex rounded-xl border border-black/5 bg-card p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === tab ? "bg-cream text-ink" : "text-ink/50 hover:text-ink"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
