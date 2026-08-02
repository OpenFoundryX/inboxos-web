"use client";

import MeetingListRow from "@/components/notetaker/MeetingListRow";
import { groupMeetingsByDay, type MeetingRead } from "@/lib/meetings";

export default function MeetingList({
  meetings,
  loading,
  cancellingId,
  onCancel,
  /** Recorded meetings read newest-first; upcoming ones soonest-first. */
  order,
  emptyMessage,
}: {
  meetings: MeetingRead[];
  loading: boolean;
  cancellingId: string | null;
  onCancel: (meeting: MeetingRead) => void;
  order: "newest" | "soonest";
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3.5 w-28 animate-pulse rounded bg-ink/5" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-black/5 bg-card px-4 py-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-ink/5" />
            <div className="mt-2 h-3 w-1/5 animate-pulse rounded bg-ink/5" />
          </div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <p className="rounded-xl border border-black/5 bg-card px-5 py-12 text-center text-sm text-ink/50">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groupMeetingsByDay(meetings, order).map((group) => (
        <section key={group.key}>
          <h3 className="mb-2 text-xs font-semibold text-ink/45">{group.label}</h3>
          <div className="space-y-2">
            {group.meetings.map((meeting) => (
              <MeetingListRow
                key={meeting.id}
                meeting={meeting}
                busy={cancellingId === meeting.id}
                onCancel={onCancel}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
