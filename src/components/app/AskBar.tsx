"use client";

import { useMemo, useRef, useState } from "react";
import SlashMenu from "@/components/chat/SlashMenu";
import type { SlashCommandInfo } from "@/lib/chat";
import { MicIcon, SendIcon } from "./icons";

const CHIPS = ["Show me my important emails", "What action items do I have?", "What's next for me?"];

/** A message opens a command only while it is still one unbroken word. */
const NAME_FRAGMENT = /^\/([a-z-]*)$/i;

export default function AskBar({
  onSubmit,
  placeholder = "Ask me anything about your meetings or emails…",
  disabled = false,
  busy = false,
  showChips = true,
  commands,
  value: controlledValue,
  onValueChange,
}: {
  onSubmit?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // Waiting on an answer, as opposed to merely disabled: the button says so.
  busy?: boolean;
  showChips?: boolean;
  // Supplying commands turns on the slash menu. The dashboard's AskBar
  // discards its text and routes to the chat page, so it must not advertise
  // commands it will not run — it simply omits this prop.
  commands?: SlashCommandInfo[];
  // Optional controlled value, so prefill chips elsewhere can write into it.
  value?: string;
  onValueChange?: (v: string) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState("");
  const value = controlledValue ?? uncontrolled;
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function setValue(next: string) {
    if (onValueChange) onValueChange(next);
    else setUncontrolled(next);
  }

  // Only while the whole value is a bare "/name" fragment: once a space is
  // typed the user is into arguments and the menu would sit on top of them.
  const matches = useMemo(() => {
    if (!commands || dismissed) return [];
    const m = NAME_FRAGMENT.exec(value.trimStart());
    if (!m) return [];
    const prefix = m[1].toLowerCase();
    return commands.filter((c) => c.name.startsWith(prefix));
  }, [commands, value, dismissed]);

  const open = matches.length > 0;
  const activeIndex = Math.min(active, matches.length - 1);

  function change(next: string) {
    setValue(next);
    setDismissed(false);
    setActive(0);
  }

  function complete(name: string) {
    setValue(`/${name} `);
    setDismissed(true);
    setActive(0);
    inputRef.current?.focus();
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    setValue("");
    setDismissed(false);
    onSubmit?.(trimmed);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Tab" || e.key === "Enter") {
      // Completing, not sending: Enter submits only once the menu is closed.
      e.preventDefault();
      complete(matches[activeIndex].name);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDismissed(true);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (open) return;
          send(value);
        }}
        className="relative flex items-center gap-3 rounded-full border border-ink/15 bg-card px-5 py-4 shadow-sm"
      >
        {open ? (
          <SlashMenu commands={matches} activeIndex={activeIndex} onPick={complete} />
        ) : null}

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => change(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          // Only a combobox may carry aria-expanded, and only when there is a
          // popup to expand — a plain input keeps its implicit textbox role.
          role={commands ? "combobox" : undefined}
          aria-expanded={commands ? open : undefined}
          aria-controls={commands ? "slash-menu" : undefined}
          aria-autocomplete={commands ? "list" : undefined}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-60"
        />
        <MicIcon className="h-5 w-5 text-ink/20" />
        <button
          type="submit"
          aria-label={busy ? "Waiting for an answer" : "Send"}
          disabled={disabled || busy || !value.trim()}
          // The input is empty right after sending, so the usual disabled
          // dimming would fade the spinner to near-invisible.
          className={`rounded-full bg-accent p-2 text-white hover:bg-accent-dark ${
            busy ? "" : "disabled:opacity-30"
          }`}
        >
          {busy ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
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
