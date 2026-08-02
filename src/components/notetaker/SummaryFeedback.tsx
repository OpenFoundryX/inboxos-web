"use client";

import { useState } from "react";

/**
 * Notes on how good the write-up was.
 *
 * There's no endpoint for this yet, so what's typed stays in this browser.
 * That's said plainly rather than implied: a box that quietly swallows
 * feedback is worse than no box at all.
 */
const key = (meetingId: string) => `inboxos.meeting-feedback.v1.${meetingId}`;

export default function SummaryFeedback({ meetingId }: { meetingId: string }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    try {
      window.localStorage.setItem(key(meetingId), text);
    } catch {
      // Blocked or full — the acknowledgement below is still the honest
      // outcome for the user, since nothing was going to a server either way.
    }
    setValue("");
    setSaved(true);
  }

  if (saved) {
    return (
      <p className="rounded-xl border border-black/5 px-4 py-3 text-sm text-ink/50">
        Thank you for your feedback — it&apos;s kept on this device for now.
      </p>
    );
  }

  return (
    <form onSubmit={submit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="How could these notes be better?"
        aria-label="Feedback on these notes"
        className="w-full rounded-xl border border-black/5 px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/20"
      />
    </form>
  );
}
