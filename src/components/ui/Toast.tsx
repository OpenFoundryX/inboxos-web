"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "error";

export type ToastMessage = {
  /** Bumped on every new toast so repeating the same text re-triggers it. */
  id: number;
  text: string;
  variant: ToastVariant;
};

type ToastProps = {
  toast: ToastMessage | null;
  onDismiss: () => void;
  /** How long before it auto-hides, in ms. Errors linger a little longer. */
  duration?: number;
};

export default function Toast({ toast, onDismiss, duration }: ToastProps) {
  const id = toast?.id;
  const ms = duration ?? (toast?.variant === "error" ? 5000 : 3000);

  useEffect(() => {
    if (id === undefined) return;
    const timer = setTimeout(onDismiss, ms);
    return () => clearTimeout(timer);
  }, [id, ms, onDismiss]);

  if (!toast) return null;

  const isError = toast.variant === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        key={toast.id}
        className={`animate-toast-in pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
          isError ? "bg-accent text-white" : "bg-ink text-canvas"
        }`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {isError ? "!" : "✓"}
        </span>
        <span>{toast.text}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-1 text-lg leading-none opacity-50 transition-opacity hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
