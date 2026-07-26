"use client";

import { useState } from "react";
import { MicIcon, SendIcon } from "./icons";

const CHIPS = ["Show me my important emails", "What action items do I have?", "What's next for me?"];

export default function AskBar({
  onSubmit,
  placeholder = "Ask me anything about your meetings or emails…",
  disabled = false,
  showChips = true,
}: {
  onSubmit?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showChips?: boolean;
}) {
  const [value, setValue] = useState("");

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    setValue("");
    onSubmit?.(trimmed);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="flex items-center gap-3 rounded-full border border-ink/10 bg-card px-4 py-3"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-60"
        />
        <MicIcon className="h-5 w-5 text-ink/20" />
        <button
          type="submit"
          aria-label="Send"
          disabled={disabled || !value.trim()}
          className="rounded-full bg-accent p-2 text-white hover:bg-accent-dark disabled:opacity-30"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>

      {showChips ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={disabled}
              onClick={() => send(chip)}
              className="rounded-full border border-ink/10 bg-card px-3 py-1.5 text-xs text-ink/60 hover:text-ink disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
