"use client";

import Link from "next/link";
import StatusPill from "@/components/notetaker/StatusPill";
import { UsersIcon, VideoIcon } from "@/components/app/icons";
import {
  formatTimeRange,
  isCancellable,
  isInFlight,
  meetingTitle,
  type MeetingRead,
} from "@/lib/meetings";

export default function MeetingListRow({
  meeting,
  busy,
  onCancel,
}: {
  meeting: MeetingRead;
  busy: boolean;
  onCancel: (meeting: MeetingRead) => void;
}) {
  // Once a meeting is simply done, its status pill says nothing the row
  // doesn't. It's kept for the states that are still going somewhere.
  const showStatus = isInFlight(meeting) || meeting.status === "failed";

  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-black/5 bg-card px-4 py-3 transition-colors hover:border-black/10">
      {/* The link is stretched over the whole row rather than wrapped around
          it, so the Cancel button beside it stays clickable — a button nested
          in an anchor would have its click swallowed. */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/notetaker/${meeting.id}`}
          className="text-sm font-semibold text-ink after:absolute after:inset-0 group-hover:underline"
        >
          {meetingTitle(meeting)}
        </Link>
        <div className="mt-0.5 text-xs text-ink/50">
          {formatTimeRange(meeting.starts_at, meeting.ends_at)}
        </div>
      </div>

      <div className="relative flex shrink-0 items-center gap-3 text-ink/35">
        {meeting.attendees.length > 0 ? (
          <span
            className="flex items-center gap-1 text-xs"
            title={`${meeting.attendees.length} participants`}
          >
            <UsersIcon className="h-3.5 w-3.5" />
            {meeting.attendees.length}
          </span>
        ) : null}

        {/* A marker, not a link: the playable URL costs a provider call, so it
            is resolved once on the detail page rather than for every row. */}
        {meeting.has_recording ? (
          <span title="Recording available">
            <VideoIcon className="h-4 w-4" />
          </span>
        ) : null}

        {showStatus ? <StatusPill status={meeting.status} /> : null}

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
      </div>
    </div>
  );
}
