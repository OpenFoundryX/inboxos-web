"use client";

import Card from "@/components/ui/Card";
import MeetingListRow from "@/components/notetaker/MeetingListRow";
import type { MeetingRead } from "@/lib/meetings";

export default function MeetingList({
  meetings,
  loading,
  cancellingId,
  onCancel,
}: {
  meetings: MeetingRead[];
  loading: boolean;
  cancellingId: string | null;
  onCancel: (meeting: MeetingRead) => void;
}) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-t border-black/5 px-5 py-5 first:border-t-0">
            <div className="h-4 w-1/3 animate-pulse rounded bg-ink/5" />
            <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-ink/5" />
          </div>
        ))}
      </Card>
    );
  }

  if (meetings.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-ink/50">
        No meetings yet — they&apos;ll appear here once the notetaker joins its first call.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {meetings.map((meeting) => (
        <MeetingListRow
          key={meeting.id}
          meeting={meeting}
          busy={cancellingId === meeting.id}
          onCancel={onCancel}
        />
      ))}
    </Card>
  );
}
