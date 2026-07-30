"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLinkIcon } from "@/components/app/icons";

/** Plays the meeting recording from the provider's signed link.
 *
 *  The video is streamed straight from the provider — nothing is proxied or
 *  stored by us. That works because the file is a plain mp4 over S3: byte-range
 *  requests make seeking work, and a bare `src` on a media element isn't subject
 *  to CORS the way a fetch would be.
 *
 *  The wrinkle is that S3 signs every request, not the session. A link that
 *  played fine can 403 the moment the user seeks past the buffered part, if it
 *  expired in between. So an error is treated as "the link went stale" first and
 *  a real failure second: we ask for a fresh one and pick playback back up where
 *  it dropped, which the user sees as a brief stall rather than a broken video.
 */
export default function RecordingPlayer({
  src,
  onExpired,
}: {
  src: string;
  /** Resolve a fresh link. Returns null when there isn't one to be had. */
  onExpired?: () => Promise<string | null>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeAt = useRef(0);
  const wasPlaying = useRef(false);
  const refreshing = useRef(false);
  const [failed, setFailed] = useState(false);

  // A changed `src` means a refreshed link arrived. Restoring position here —
  // rather than at the point we asked — is what makes the swap invisible.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || resumeAt.current === 0) return;

    const restore = () => {
      video.currentTime = resumeAt.current;
      // Autoplay can be refused; the user still has the controls.
      if (wasPlaying.current) void video.play().catch(() => {});
    };
    video.addEventListener("loadedmetadata", restore, { once: true });
    return () => video.removeEventListener("loadedmetadata", restore);
  }, [src]);

  const handleError = useCallback(async () => {
    // One refresh per failure, not per render: without the guard a link that is
    // genuinely dead would spin refresh → error → refresh forever.
    if (!onExpired || refreshing.current) {
      setFailed(true);
      return;
    }
    refreshing.current = true;

    const video = videoRef.current;
    wasPlaying.current = Boolean(video && !video.paused);

    const fresh = await onExpired().catch(() => null);
    if (!fresh) setFailed(true);
    // Left true until something actually plays, so a second dead link gives up
    // instead of looping. `onLoadedData` clears it.
  }, [onExpired]);

  if (failed) {
    return (
      <div className="rounded-xl bg-ink/5 p-6 text-center text-sm text-ink/60">
        This recording couldn&apos;t be loaded. Reload the page to try again.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        src={src}
        controls
        // Enough to render the scrubber and duration without pulling the whole
        // file down for someone who only came for the summary.
        preload="metadata"
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (t > 0) resumeAt.current = t;
        }}
        onLoadedData={() => {
          refreshing.current = false;
        }}
        onError={handleError}
        className="w-full rounded-xl bg-black"
      />
      {/* For anyone who wants the file itself — full screen, a download, or
          their own player. */}
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/50 transition-colors hover:text-ink"
      >
        Open in a new tab
        <ExternalLinkIcon className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
