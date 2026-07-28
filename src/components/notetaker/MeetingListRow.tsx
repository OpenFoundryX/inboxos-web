"use client";

import Link from "next/link";
import StatusPill from "@/components/notetaker/StatusPill";
import { ChevronRightIcon } from "@/components/app/icons";
import { formatMeetingWhen, isCancellable, type MeetingRead } from "@/lib/meetings";

export default function MeetingListRow({
  meeting,
  busy,
  onCancel,
}: {
  meeting: MeetingRead;
  busy: boolean;
  onCancel: (meeting: MeetingRead) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-black/5 px-5 py-4 first:border-t-0">
      {/* The link wraps only the text so the Cancel button stays clickable —
          nesting a button inside an anchor would swallow its click. */}
      <Link
        href={`/dashboard/notetaker/${meeting.id}`}
        className="group min-w-0 flex-1"
        aria-label={`Open ${meeting.title ?? "untitled meeting"}`}
      >
        <div className="truncate text-sm font-semibold text-ink group-hover:underline">
          {meeting.title ?? "Untitled meeting"}
        </div>
        <div className="mt-0.5 text-xs text-ink/50">
          {formatMeetingWhen(meeting.starts_at, meeting.ends_at)}
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        {isCancellable(meeting) ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel(meeting)}
            className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Cancelling…" : "Cancel bot"}
          </button>
        ) : null}
        <StatusPill status={meeting.status} />
        <Link
          href={`/dashboard/notetaker/${meeting.id}`}
          tabIndex={-1}
          aria-hidden="true"
          className="text-ink/25 transition-colors hover:text-ink"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
