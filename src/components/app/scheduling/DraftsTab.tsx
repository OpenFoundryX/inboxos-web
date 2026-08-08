"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import type { SchedulingSettings } from "@/lib/scheduling";

/** Toggles whose backing behaviour actually exists.
 *
 *  `include_link_in_drafts` is read by `services.drafts.context`, which puts
 *  the link in the prompt; `confirmation_email` gates the mail carrying a
 *  guest's manage link; `reschedule_reminders` gates the pre-meeting reminder
 *  job. Nothing on this screen is decorative — the earlier version shipped
 *  four switches that wrote to the database and were read by nothing, and the
 *  fourth ("generate drafts for proposed times") was dropped rather than
 *  faked, because no code proposes times yet.
 */
const SWITCHES: [keyof SchedulingSettings, string, string][] = [
  [
    "include_link_in_drafts",
    "Include scheduling link in drafts",
    "Drafted replies that need a meeting offer your booking link instead of guessing at times.",
  ],
  [
    "confirmation_email",
    "Send booking confirmations",
    "Emails the guest with their meeting details and a link to reschedule or cancel.",
  ],
  [
    "reschedule_reminders",
    "Send reminders before meetings",
    "Emails the guest an hour ahead, with the same link to move or cancel.",
  ],
];

export default function DraftsTab({
  settings,
  onSaveSettings,
  onNotify,
}: {
  settings: SchedulingSettings;
  onSaveSettings: (patch: Partial<SchedulingSettings>) => Promise<SchedulingSettings>;
  onNotify: (message: string) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await onSaveSettings(
        Object.fromEntries(SWITCHES.map(([key]) => [key, draft[key]])),
      );
      onNotify("Preferences saved");
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not save preferences");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl overflow-hidden">
      <div className="bg-canvas px-5 py-4 text-sm font-bold">
        How InboxOS handles meeting requests
      </div>
      <div className="space-y-3 p-5">
        {SWITCHES.map(([key, label, description]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 rounded-xl border border-black/5 p-4"
          >
            <div className="min-w-0">
              <span className="text-sm font-semibold">{label}</span>
              <p className="mt-0.5 text-xs text-ink/45">{description}</p>
            </div>
            <Toggle
              checked={Boolean(draft[key])}
              onChange={(checked) => setDraft({ ...draft, [key]: checked })}
            />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button
            disabled={busy}
            onClick={() => void save()}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Update preferences"}
          </button>
        </div>
      </div>
    </Card>
  );
}
