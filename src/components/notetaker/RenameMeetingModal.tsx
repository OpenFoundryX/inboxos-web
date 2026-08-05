"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { renameMeeting, type MeetingRead } from "@/lib/meetings";

type Props = {
  /** The meeting to rename, or null when the dialog is closed. */
  meeting: MeetingRead | null;
  onClose: () => void;
  onRenamed: (meeting: MeetingRead) => void;
};

export default function RenameMeetingModal({ meeting, onClose, onRenamed }: Props) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reseed whenever a different meeting opens the dialog. Without this the
  // field would still hold the last meeting's name.
  useEffect(() => {
    setTitle(meeting?.title ?? "");
    setError(null);
  }, [meeting]);

  function close() {
    if (busy) return;
    onClose();
  }

  async function submit() {
    if (!meeting || busy) return;
    setBusy(true);
    setError(null);
    try {
      onRenamed(await renameMeeting(meeting.id, title.trim()));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't rename that meeting");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={meeting !== null} title="Rename meeting" onClose={close}>
      <label className="block">
        <span className="text-xs font-semibold text-ink/50">Meeting title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          placeholder="Enter meeting title…"
          maxLength={300}
          autoFocus
          disabled={busy}
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </label>
      <p className="mt-2 text-xs text-ink/40">
        Leave it empty to go back to naming the meeting by its date.
      </p>

      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={close} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}
