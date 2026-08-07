"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  /** A short qualifier beside the title, e.g. "Beta". */
  badge?: string;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * A centred dialog over a dimmed page.
 *
 * Escape and a backdrop click both close it, because a dialog that can only be
 * dismissed by finding the right button is a dialog people get stuck in.
 * Closing is always the caller's decision, though — a modal mid-upload passes
 * a no-op rather than losing the transfer.
 */
export default function Modal({ open, title, badge, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
            {title}
            {badge ? (
              <span className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] font-semibold text-ink/50">
                {badge}
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 shrink-0 rounded-lg p-2 text-ink/40 transition-colors hover:bg-canvas hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
