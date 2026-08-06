"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { SlashItem } from "./slashCommand";

export type SlashMenuHandle = {
  /** Returns true when the key was consumed, which stops the editor seeing it. */
  onKeyDown: (event: KeyboardEvent) => boolean;
};

type Props = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
};

/**
 * The block picker that appears under the cursor.
 *
 * Keyboard-first: it opens with a slash, so the hands are already on the keys
 * and reaching for the mouse to choose "Heading 2" would be slower than typing
 * the markdown would have been.
 */
const SlashMenu = forwardRef<SlashMenuHandle, Props>(function SlashMenu({ items, command }, ref) {
  const [selected, setSelected] = useState(0);

  // A narrowing query can leave the selection past the end of the list.
  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowUp") {
        setSelected((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) return null;

  return (
    <div className="w-60 overflow-hidden rounded-xl border border-black/5 bg-card py-1 shadow-lg">
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          // The editor still owns focus, so a blur before the click would close
          // the menu and cancel the choice.
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => setSelected(i)}
          onClick={() => command(item)}
          className={`flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors ${
            i === selected ? "bg-ink/5" : ""
          }`}
        >
          <span className="w-6 shrink-0 text-center text-[0.7rem] font-semibold text-ink/40">
            {item.badge}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
            <span className="block truncate text-xs text-ink/45">{item.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
});

export default SlashMenu;
