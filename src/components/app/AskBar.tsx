"use client";

import { useState } from "react";
import { MicIcon, PlusIcon } from "./icons";

const CHIPS = ["Show me my important emails", "What action items do I have?", "What's next for me?"];

export default function AskBar({
  onSubmit,
  placeholder = "Ask me anything about your meetings or emails…",
}: {
  onSubmit?: () => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.();
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="flex items-center gap-3 rounded-full border border-ink/10 bg-card px-4 py-3"
      >
        <PlusIcon className="h-5 w-5 text-ink/30" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
        <MicIcon className="h-5 w-5 text-ink/30" />
      </form>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSubmit?.()}
            className="rounded-full border border-ink/10 bg-card px-3 py-1.5 text-xs text-ink/60 hover:text-ink"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
