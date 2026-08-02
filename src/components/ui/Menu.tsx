"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Align = "left" | "right";

/**
 * A popover anchored to its trigger. Closes on outside click, on Escape, and —
 * because every menu here either navigates or mutates — as soon as an item is
 * chosen, which is why `children` is handed a `close` callback.
 */
export default function Menu({
  trigger,
  align = "right",
  panelClassName = "",
  label,
  children,
}: {
  trigger: (open: boolean) => ReactNode;
  align?: Align;
  panelClassName?: string;
  /** Accessible name for the trigger when it renders as an icon alone. */
  label?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center"
      >
        {trigger(open)}
      </button>

      {open ? (
        <div
          id={panelId}
          role="menu"
          className={`absolute top-[calc(100%+0.5rem)] z-30 min-w-[13rem] overflow-hidden rounded-xl border border-black/5 bg-card py-1.5 shadow-lg shadow-black/5 ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({
  icon,
  children,
  onSelect,
  disabled = false,
  destructive = false,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed text-ink/30"
          : destructive
            ? "text-accent hover:bg-accent/5"
            : "text-ink/80 hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {icon ? <span className="shrink-0 text-ink/40">{icon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

export function MenuNote({ children }: { children: ReactNode }) {
  return <p className="border-t border-black/5 px-3.5 py-2 text-xs text-ink/40">{children}</p>;
}
