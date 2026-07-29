"use client";

import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type StepShellProps = {
  title: string;
  blurb: string;
  error: string | null;
  busy: boolean;
  continueLabel?: string;
  onContinue: () => void;
  onSkip: () => void;
  children: ReactNode;
};

/** Shared chrome for onboarding steps 2-4: heading on the left, the one question
 *  on the right, Continue + Skip underneath. Skip is safe on every step — all
 *  three features are off by default in the backend, so skipping leaves nothing
 *  half-configured. */
export default function StepShell({
  title,
  blurb,
  error,
  busy,
  continueLabel = "Continue",
  onContinue,
  onSkip,
  children,
}: StepShellProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm text-ink/60">{blurb}</p>
        <p className="mt-10 text-xs text-ink/40">You can change this anytime from your dashboard.</p>
      </div>
      <div>
        {children}
        {error ? (
          <Card className="mt-4 border border-accent/30 p-4 text-sm text-accent-dark">{error}</Card>
        ) : null}
        <Button variant="dark" onClick={onContinue} disabled={busy} className="mt-4 w-full">
          {busy ? "Saving…" : continueLabel}
        </Button>
        <button
          type="button"
          onClick={onSkip}
          disabled={busy}
          className="mt-3 w-full text-sm font-medium text-ink/50 hover:text-ink disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
