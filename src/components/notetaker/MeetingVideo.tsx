"use client";

import { useState } from "react";
import RecordingPlayer from "@/components/notetaker/RecordingPlayer";
import { ChevronUpIcon, PlayIcon } from "@/components/app/icons";

/**
 * The recording at the top of a meeting.
 *
 * It collapses to a thumbnail because the two reasons for opening a meeting
 * pull in opposite directions: watching it wants the video large, reading the
 * notes wants it out of the way. Collapsing keeps the video one click away
 * without making everyone scroll past it.
 *
 * The thumbnail is the same file with `preload="metadata"` — the browser
 * paints its first frame, so it costs a header request rather than a poster
 * image the provider doesn't give us.
 */
export default function MeetingVideo({
  src,
  hasRecording,
  loading,
  onExpired,
  meta,
}: {
  src: string | null;
  hasRecording: boolean;
  /** The meeting itself is still being fetched — nothing is known yet. */
  loading: boolean;
  onExpired?: () => Promise<string | null>;
  /** Date, time and participants, shown beside the thumbnail when collapsed. */
  meta: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex h-[3.75rem] w-[6.5rem] shrink-0 animate-pulse items-center justify-center rounded-xl bg-ink/5 text-xs font-medium text-ink/35">
          Loading
        </div>
        <div className="min-w-0 flex-1">{meta}</div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex items-center gap-4">
        {hasRecording ? (
          // A recording exists but the provider wouldn't hand over a link just
          // now. Saying so beats showing nothing, which reads as "no video".
          <div className="flex h-[3.75rem] w-[6.5rem] shrink-0 items-center justify-center rounded-xl bg-ink/5 px-2 text-center text-[0.65rem] leading-tight text-ink/40">
            Reload to retry
          </div>
        ) : null}
        <div className="min-w-0 flex-1">{meta}</div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Expand the recording"
          className="group relative h-[3.75rem] w-[6.5rem] shrink-0 overflow-hidden rounded-xl bg-black"
        >
          <video src={src} preload="metadata" muted className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
            <PlayIcon className="h-6 w-6" />
          </span>
        </button>
        <div className="min-w-0 flex-1">{meta}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <RecordingPlayer src={src} onExpired={onExpired} />
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Collapse the recording"
          className="absolute right-3 top-3 rounded-full bg-black/45 p-1.5 text-white/90 backdrop-blur transition-colors hover:bg-black/65"
        >
          <ChevronUpIcon className="h-4 w-4" />
        </button>
      </div>
      {meta}
    </div>
  );
}
