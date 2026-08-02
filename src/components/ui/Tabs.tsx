"use client";

type TabsProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  /** Stretch the group to its container and split it evenly between tabs. */
  fill?: boolean;
  className?: string;
};

export default function Tabs({ tabs, active, onChange, fill = false, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`${fill ? "flex w-full" : "inline-flex"} rounded-xl border border-black/5 bg-card p-1 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            fill ? "flex-1" : ""
          } ${active === tab ? "bg-canvas text-ink" : "text-ink/50 hover:text-ink"}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
