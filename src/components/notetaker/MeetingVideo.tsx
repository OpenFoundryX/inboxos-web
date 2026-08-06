"use client";

import { useRef, useState } from "react";
import RecordingPlayer from "@/components/notetaker/RecordingPlayer";
import { usePosterFrame } from "@/components/notetaker/usePosterFrame";
import { ChevronUpIcon, MicIcon, PlayIcon } from "@/components/app/icons";

/**
 * The recording at the top of a meeting.
 *
 * It collapses to a thumbnail because the two reasons for opening a meeting
 * pull in opposite directions: watching it wants the video large, reading the
 * notes wants it out of the way. Collapsing keeps the video one click away
 * without making everyone scroll past it.
 *
 * The thumbnail is the same file with `preload="metadata"`, seeked a little way
 * in — see `usePosterFrame`. That costs a range request rather than a poster
 * image nobody gives us, and avoids the opening frame of a call, which is
 * reliably black.
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
  const thumbnail = useRef<HTMLVideoElement>(null);
  const poster = usePosterFrame(thumbnail);

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
          className={`group relative h-[3.75rem] w-[6.5rem] shrink-0 overflow-hidden rounded-xl ${
            poster.hasVideo === false ? "bg-ink/5" : "bg-black"
          }`}
        >
          {/* Kept mounted even for audio-only files: it is what reports back
              that there is no picture. Hidden rather than unmounted so that
              answer doesn't get thrown away and re-asked on every render. */}
          <video
            ref={thumbnail}
            src={src}
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={poster.onLoadedMetadata}
            className={`h-full w-full object-cover ${poster.hasVideo === false ? "hidden" : ""}`}
          />
          {poster.hasVideo === false ? (
            // An audio recording has no frame to show, and a black rectangle
            // reads as a video that failed rather than as sound.
            <span className="absolute inset-0 flex items-center justify-center text-ink/40">
              <MicIcon className="h-5 w-5" />
            </span>
          ) : null}
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
