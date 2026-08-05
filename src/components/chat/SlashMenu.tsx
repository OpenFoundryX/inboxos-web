"use client";

import type { SlashCommandInfo } from "@/lib/chat";

/**
 * The command list that opens above the input when a message starts with "/".
 *
 * Purely presentational — filtering and keyboard state live in AskBar, which
 * owns the input those keys are travelling through.
 */
export default function SlashMenu({
  commands,
  activeIndex,
  onPick,
}: {
  commands: SlashCommandInfo[];
  activeIndex: number;
  onPick: (name: string) => void;
}) {
  if (commands.length === 0) return null;

  return (
    <div
      id="slash-menu"
      role="listbox"
      aria-label="Commands"
      className="absolute bottom-full left-0 right-0 z-10 mb-2 max-h-72 overflow-y-auto rounded-2xl border border-ink/10 bg-card py-1.5 shadow-lg"
    >
      {commands.map((c, i) => (
        <button
          key={c.name}
          type="button"
          role="option"
          aria-selected={i === activeIndex}
          // The input must keep focus; mousedown fires before blur.
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(c.name);
          }}
          className={`flex w-full items-baseline gap-3 px-4 py-2 text-left ${
            i === activeIndex ? "bg-ink/5" : ""
          }`}
        >
          <span className="font-mono text-sm font-medium text-ink">/{c.name}</span>
          <span className="flex-1 truncate text-xs text-ink/50">{c.summary}</span>
        </button>
      ))}
    </div>
  );
}
