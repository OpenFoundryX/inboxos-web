"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { getDashboardSummary, type AgendaItem } from "@/lib/dashboard";
import { uploadRecording, type MeetingRead } from "@/lib/meetings";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded: (meeting: MeetingRead) => void;
};

/** Matches the server's `MEDIA_UPLOAD_MAX_BYTES`. Checked here only to fail
 *  instantly on a file that would be refused after a long transfer. */
const MAX_BYTES = 1024 * 1024 * 1024;

const NEW_MEETING = "";

export default function UploadRecordingModal({ open, onClose, onUploaded }: Props) {
  const [events, setEvents] = useState<AgendaItem[]>([]);
  const [eventId, setEventId] = useState(NEW_MEETING);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const busy = progress !== null;

  // The event list is only worth fetching once the dialog is actually opened,
  // and only for its side of the choice — an upload with no event to link to
  // still works, so a failure here is silent rather than blocking.
  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const summary = await getDashboardSummary();
        if (!active) return;
        setEvents([...summary.meetings.today, ...summary.meetings.tomorrow]);
      } catch {
        if (active) setEvents([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  function close() {
    // Closing mid-upload would abandon the transfer with the row already
    // reserved. The dialog stays put until it resolves either way.
    if (busy) return;
    setFile(null);
    setTitle("");
    setEventId(NEW_MEETING);
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
    onClose();
  }

  function pick(next: File | null) {
    setError(null);
    if (next && next.size > MAX_BYTES) {
      setError("That file is larger than the 1 GB limit");
      setFile(null);
      return;
    }
    setFile(next);
  }

  async function submit() {
    if (!file || busy) return;
    setProgress(0);
    setError(null);
    try {
      const meeting = await uploadRecording(file, {
        title,
        calendarEventId: eventId || null,
        onProgress: setProgress,
      });
      onUploaded(meeting);
      setFile(null);
      setTitle("");
      setEventId(NEW_MEETING);
      if (fileInput.current) fileInput.current.value = "";
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't upload that recording");
    } finally {
      setProgress(null);
    }
  }

  return (
    <Modal open={open} title="Upload audio or video" badge="Beta" onClose={close}>
      <p className="text-sm text-ink/60">
        Upload a pre-recorded meeting file to generate a summary and transcript.
      </p>

      <label className="mt-5 block">
        <span className="text-xs font-semibold text-ink/50">Link to event (optional)</span>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          disabled={busy}
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-canvas px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-60"
        >
          <option value={NEW_MEETING}>New meeting</option>
          {events.map((e) => (
            <option key={e.calendar_event_id} value={e.calendar_event_id}>
              {e.title || "Untitled meeting"}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold text-ink/50">Meeting title (optional)</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter meeting title…"
          disabled={busy}
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </label>

      <div className="mt-4">
        <span className="text-xs font-semibold text-ink/50">Meeting file</span>
        <input
          ref={fileInput}
          type="file"
          accept="audio/*,video/*"
          disabled={busy}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          className="mt-1.5 w-full rounded-xl border border-black/10 bg-canvas px-3.5 py-2.5 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink hover:file:bg-ink/10 disabled:opacity-60"
        />
        <p className="mt-2 text-xs text-ink/40">Video and audio files up to 1 GB.</p>
      </div>

      {busy ? (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink/50">
            {progress !== null && progress >= 1
              ? "Processing…"
              : `Uploading… ${Math.round((progress ?? 0) * 100)}%`}
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <Button onClick={submit} disabled={!file || busy}>
          {busy ? "Uploading…" : "Import meeting"}
        </Button>
      </div>
    </Modal>
  );
}
