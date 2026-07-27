"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/app/icons";
import { confirmActions, type ActionStatus, type ChatAction } from "@/lib/chat";

export default function ActionConfirm({
  messageId,
  actions,
  status,
  results,
  onResolved,
}: {
  messageId: string;
  actions: ChatAction[];
  status: ActionStatus;
  results: string[];
  onResolved: (status: ActionStatus, results: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const updated = await confirmActions(messageId, approve);
      onResolved(updated.action_status, updated.action_results);
    } catch {
      setError("That didn't go through. Try again?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">
        {status === "pending" ? "Confirm to continue" : "Requested changes"}
      </p>

      <ul className="space-y-2">
        {actions.map((a, i) => (
          <li key={i} className="text-sm">
            <span className="font-medium text-ink">{a.label}</span>
            {a.detail ? <span className="block text-xs text-ink/50">{a.detail}</span> : null}
          </li>
        ))}
      </ul>

      {status === "pending" ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {busy ? "Working…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="rounded-xl border border-ink/10 px-3 py-2 text-sm font-medium text-ink/70 hover:text-ink disabled:opacity-50"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {status === "rejected" ? (
        <p className="mt-3 text-xs text-ink/40">Dismissed — nothing was changed.</p>
      ) : null}

      {status === "confirmed" ? (
        <ul className="mt-3 space-y-1">
          {results.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-ink/60">
              <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              {r}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="mt-3 text-xs text-accent">{error}</p> : null}
    </div>
  );
}
