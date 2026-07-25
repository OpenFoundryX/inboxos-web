import { CheckIcon } from "./icons";

const STEPS = ["Connected", "Synced emails", "Categorizing", "Creating drafts"];

export default function SetupChecklist({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STEPS.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={label} className="flex items-center gap-2 rounded-xl border border-black/5 bg-card px-3 py-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                done ? "bg-accent text-white" : active ? "border-2 border-accent" : "border-2 border-ink/15"
              }`}
            >
              {done ? <CheckIcon className="h-3 w-3" /> : null}
            </span>
            <span className={`text-xs font-medium ${done || active ? "text-ink" : "text-ink/40"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
