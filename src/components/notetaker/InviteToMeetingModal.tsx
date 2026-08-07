"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { joinMeeting, type MeetingRead } from "@/lib/meetings";

type Props = {
  open: boolean;
  onClose: () => void;
  onJoined: (meeting: MeetingRead) => void;
};

/**
 * Send the notetaker into a call that isn't on the calendar.
 *
 * The whole invitation can be pasted, not just the URL — the server extracts
 * the joinable link — so "copy the meeting invite" is a valid way to use this,
 * which is what people actually have on their clipboard.
 */
export default function InviteToMeetingModal({ open, onClose, onJoined }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (busy) return;
    setUrl("");
    setTitle("");
    setError(null);
    onClose();
  }

  async function submit() {
    const trimmed = url.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const meeting = await joinMeeting(trimmed, title.trim() || undefined);
      setUrl("");
      setTitle("");
      onJoined(meeting);
      onClose();
    } catch (e) {
      // Stays open with the text intact: the usual failure is a link the
      // server didn't recognize, and clearing the field would make the user
      // paste it again to try a different one.
      setError(e instanceof Error ? e.message : "Couldn't join that meeting");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title="Add to video call" badge="Beta" onClose={close}>
      <p className="text-sm text-ink/60">
        Invite the notetaker to your online meeting to record it and generate a summary and
        transcript.
      </p>

      <label className="mt-5 block">
        <span className="text-xs font-semibold text-ink/50">Meeting URL</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          placeholder="https://zoom.us/j/…"
          autoFocus
          disabled={busy}
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </label>

      <p className="mt-2 text-xs text-ink/40">
        Zoom, Google Meet, and Teams. You can paste the whole invitation.
      </p>

      <label className="mt-4 block">
        <span className="text-xs font-semibold text-ink/50">Meeting name (optional)</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          placeholder="Enter meeting name…"
          maxLength={300}
          disabled={busy}
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </label>
      {/* Worth naming: a Google Meet room has no title of its own — the name in
          your calendar belongs to the event, not the room — so a link pasted
          for a call that isn't on your calendar has nothing to be named after
          until it has been transcribed. */}
      <p className="mt-2 text-xs text-ink/40">
        Google Meet doesn&apos;t share a name. Leave this blank and the notetaker will name the
        meeting from what was discussed.
      </p>

      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <Button onClick={submit} disabled={!url.trim() || busy}>
          {busy ? "Joining…" : "Start recording"}
        </Button>
      </div>
    </Modal>
  );
}
