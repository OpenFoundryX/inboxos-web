"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { deleteMeeting, meetingTitle, type MeetingRead } from "@/lib/meetings";

type Props = {
  /** The meeting to delete, or null when the dialog is closed. */
  meeting: MeetingRead | null;
  onClose: () => void;
  onDeleted: (meeting: MeetingRead) => void;
};

/**
 * Confirms an irreversible delete.
 *
 * Names the meeting rather than saying "this meeting", because the menu that
 * opened this dialog is attached to one row among many and the confirmation is
 * the last chance to notice it was the wrong one.
 */
export default function DeleteMeetingDialog({ meeting, onClose, onDeleted }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setError(null), [meeting]);

  function close() {
    if (busy) return;
    onClose();
  }

  async function confirm() {
    if (!meeting || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteMeeting(meeting.id);
      onDeleted(meeting);
      onClose();
    } catch (e) {
      // The server keeps the meeting when it can't recall the bot or remove the
      // recording, so staying open with the reason is accurate — retrying is a
      // real option, not a dead end.
      setError(e instanceof Error ? e.message : "Couldn't delete that meeting");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={meeting !== null} title="Delete meeting" onClose={close}>
      <p className="text-sm text-ink/70">
        Delete <span className="font-semibold text-ink">{meeting ? meetingTitle(meeting) : ""}</span>?
      </p>
      <p className="mt-2 text-sm text-ink/60">
        The recording, transcript, and summary go with it, and a notetaker still in the call is
        recalled. This can&apos;t be undone.
      </p>

      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={close} disabled={busy}>
          Keep it
        </Button>
        <Button onClick={confirm} disabled={busy}>
          {busy ? "Deleting…" : "Delete meeting"}
        </Button>
      </div>
    </Modal>
  );
}
