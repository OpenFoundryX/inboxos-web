"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import StatusPill from "@/components/notetaker/StatusPill";
import MeetingVideo from "@/components/notetaker/MeetingVideo";
import ParticipantsMenu from "@/components/notetaker/ParticipantsMenu";
import SummaryPanel from "@/components/notetaker/SummaryPanel";
import TranscriptPanel from "@/components/notetaker/TranscriptPanel";
import {
  formatMeetingDate,
  formatTimeRange,
  isInFlight,
  type MeetingDetail as Meeting,
} from "@/lib/meetings";

const SUMMARY_TAB = "Summary";
const TRANSCRIPT_TAB = "Transcript";

export default function MeetingDetail({
  meeting,
  onRefreshRecording,
}: {
  meeting: Meeting;
  /** Re-resolve the recording link when the signed one expires mid-playback. */
  onRefreshRecording?: () => Promise<string | null>;
}) {
  const [tab, setTab] = useState(SUMMARY_TAB);

  const meta = (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <div className="text-sm text-ink/60">{formatMeetingDate(meeting.starts_at)}</div>
        <div className="text-sm text-ink/60">
          {formatTimeRange(meeting.starts_at, meeting.ends_at)}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/* The pill is noise on a meeting that's simply finished — its notes
            being on screen already say so. It earns its place while something
            is still moving, or when it went wrong. */}
        {isInFlight(meeting) || meeting.status === "failed" ? (
          <StatusPill status={meeting.status} />
        ) : null}
        <ParticipantsMenu attendees={meeting.attendees} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <MeetingVideo
        src={meeting.recording_url}
        hasRecording={meeting.has_recording}
        loading={false}
        onExpired={onRefreshRecording}
        meta={meta}
      />

      {/* status_detail is the only thing that explains a failure — the backend
          stores the provider's reason there and nowhere else. */}
      {meeting.status_detail ? (
        <Card className="border-accent/20 bg-accent/5 p-4 text-sm text-ink/70">
          <span className="font-semibold text-ink">Why: </span>
          {meeting.status_detail}
        </Card>
      ) : null}

      <Tabs fill tabs={[SUMMARY_TAB, TRANSCRIPT_TAB]} active={tab} onChange={setTab} />

      {tab === SUMMARY_TAB ? (
        <SummaryPanel meeting={meeting} />
      ) : (
        <TranscriptPanel transcript={meeting.transcript} />
      )}
    </div>
  );
}
