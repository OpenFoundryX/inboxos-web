"use client";

import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

type StepShellProps = {
  title: string;
  blurb: string;
  error: string | null;
  busy: boolean;
  continueLabel?: string;
  continueDisabled?: boolean;
  onContinue: () => void;
  /** Defaults to the skip escape hatch. Steps 2-4 can all be skipped safely —
   *  every feature is off by default in the backend, so skipping leaves nothing
   *  half-configured. Connect overrides it, since nothing works without grants. */
  secondaryLabel?: string;
  onSecondary: () => void;
  footnote?: string;
  children: ReactNode;
};

/** Shared chrome for every onboarding step: the question centred at the top of
 *  the card, the one thing to answer beneath it, then Continue and the
 *  secondary action. The card itself comes from the onboarding layout. */
export default function StepShell({
  title,
  blurb,
  error,
  busy,
  continueLabel = "Continue",
  continueDisabled = false,
  onContinue,
  secondaryLabel = "Skip for now",
  onSecondary,
  footnote = "You can change this anytime from your dashboard.",
  children,
}: StepShellProps) {
  return (
    <div>
      <div className="text-center">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/55">{blurb}</p>
      </div>

      <div className="mt-7">{children}</div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-sm text-accent-dark">
          {error}
        </div>
      ) : null}

      <Button
        variant="dark"
        onClick={onContinue}
        disabled={busy || continueDisabled}
        className="mt-6 h-12 w-full shadow-[0_14px_30px_-16px_rgba(26,29,38,0.9)]"
      >
        {busy ? "Saving…" : continueLabel}
      </Button>
      <button
        type="button"
        onClick={onSecondary}
        disabled={busy}
        className="mt-2 h-10 w-full rounded-full text-sm font-semibold text-ink/45 transition-colors hover:bg-ink/[0.04] hover:text-ink disabled:opacity-50"
      >
        {secondaryLabel}
      </button>

      <p className="mt-5 text-center text-xs text-ink/35">{footnote}</p>
    </div>
  );
}
