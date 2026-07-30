"use client";

import Card from "@/components/ui/Card";
import StatusPill from "@/components/notetaker/StatusPill";
import RecordingPlayer from "@/components/notetaker/RecordingPlayer";
import { ExternalLinkIcon } from "@/components/app/icons";
import { formatMeetingWhen, type MeetingDetail as Meeting } from "@/lib/meetings";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-3 text-sm font-bold text-ink">{title}</div>
      {children}
    </Card>
  );
}

export default function MeetingDetail({
  meeting,
  onRefreshRecording,
}: {
  meeting: Meeting;
  /** Re-resolve the recording link when the signed one expires mid-playback. */
  onRefreshRecording?: () => Promise<string | null>;
}) {
  const hasNotes =
    Boolean(meeting.summary) || meeting.decisions.length > 0 || meeting.action_items.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            {meeting.title ?? "Untitled meeting"}
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            {formatMeetingWhen(meeting.starts_at, meeting.ends_at)}
            {meeting.attendees.length > 0 ? ` · ${meeting.attendees.length} attendees` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusPill status={meeting.status} />
          {meeting.meeting_url ? (
            <a
              href={meeting.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-ink/50 transition-colors hover:text-ink"
            >
              Meeting link
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>

      {/* status_detail is the only thing that explains a failure — the backend
          stores the provider's reason there and nowhere else. */}
      {meeting.status_detail ? (
        <Card className="border-accent/20 bg-accent/5 p-4 text-sm text-ink/70">
          <span className="font-semibold text-ink">Why: </span>
          {meeting.status_detail}
        </Card>
      ) : null}

      {/* Above the notes: someone who opens a meeting they missed wants to
          watch it, and shouldn't have to scroll past a summary to find it. */}
      {meeting.recording_url ? (
        <Section title="Recording">
          <RecordingPlayer src={meeting.recording_url} onExpired={onRefreshRecording} />
        </Section>
      ) : meeting.has_recording ? (
        // A recording exists but the provider wouldn't hand over a link just
        // now. Saying so beats showing nothing, which would imply there is no
        // video at all.
        <Section title="Recording">
          <p className="text-sm text-ink/50">
            The recording couldn&apos;t be loaded just now. Reload the page to try again.
          </p>
        </Section>
      ) : null}

      {!hasNotes ? (
        <Card className="p-10 text-center text-sm text-ink/50">
          No notes yet — they appear once the recording finishes processing.
        </Card>
      ) : null}

      {meeting.summary ? (
        <Section title="Summary">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
            {meeting.summary}
          </p>
        </Section>
      ) : null}

      {meeting.decisions.length > 0 ? (
        <Section title="Decisions">
          <ul className="space-y-2">
            {meeting.decisions.map((d, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink/80">
                <span aria-hidden="true" className="text-ink/30">
                  •
                </span>
                {d}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {meeting.action_items.length > 0 ? (
        <Section title="Action items">
          <ul className="divide-y divide-black/5">
            {meeting.action_items.map((a, i) => (
              <li key={i} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                <span className="text-sm text-ink/80">{a.what}</span>
                <span className="shrink-0 text-xs text-ink/50">
                  {[a.owner, a.due_at].filter(Boolean).join(" · ") || "—"}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {meeting.transcript ? (
        <Card className="p-5">
          <details>
            <summary className="cursor-pointer text-sm font-bold text-ink">Transcript</summary>
            <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/70">
              {meeting.transcript}
            </pre>
          </details>
        </Card>
      ) : null}
    </div>
  );
}
