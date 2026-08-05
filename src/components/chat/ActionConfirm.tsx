"use client";

import { useState } from "react";
import { CheckIcon, WarnIcon, XIcon } from "@/components/app/icons";
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

  // A single action names itself; several are counted, because listing the
  // first one in the title would misrepresent what Approve actually does.
  const title = actions.length === 1 ? actions[0].label : `${actions.length} changes`;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-card">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <WarnIcon className="h-5 w-5 shrink-0 text-ink" />
          <p className="text-sm font-semibold text-ink">{title}</p>
        </div>

        <ul className="space-y-2">
          {actions.map((a, i) => (
            <li key={i} className="text-sm">
              {actions.length > 1 ? (
                <span className="font-medium text-ink">{a.label}</span>
              ) : null}
              {a.detail ? <span className="block text-xs text-ink/50">{a.detail}</span> : null}
            </li>
          ))}
        </ul>

        {status === "rejected" ? (
          <p className="mt-3 text-xs text-ink/40">Denied — nothing was changed.</p>
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

      {status === "pending" ? (
        <div className="flex items-center gap-2 border-t border-ink/10 px-4 py-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/70 hover:text-ink disabled:opacity-50"
          >
            <XIcon className="h-4 w-4" />
            Deny
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4" />
            {busy ? "Working…" : "Approve"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
