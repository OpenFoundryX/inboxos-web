"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Paint a real frame instead of a black one.
 *
 * A `<video>` with `preload="metadata"` shows its first frame, and the first
 * frame of a meeting is reliably useless: the bot is still joining, or nobody's
 * camera has faded in yet. Seeking a little way in and letting the browser
 * paint *that* frame costs one byte-range request and needs nothing stored.
 *
 * Also answers whether the file has a picture at all. Browser recordings are
 * audio-only, and without this the caller renders a black rectangle for them
 * that looks like a broken video rather than a sound file.
 */

/** How far in to look, as a share of the running time. Far enough past the
 *  joining shuffle to show faces, early enough to still be the start. */
const FRACTION = 0.1;
/** Bounds on that. A two-hour call doesn't want its poster twelve minutes in,
 *  and a very short clip still wants to clear its opening frame. */
const MIN_SECONDS = 1;
const MAX_SECONDS = 10;
/** When the container reports no usable duration — some WebM has none until
 *  fully buffered — seek to a fixed point instead of computing from NaN. */
const FALLBACK_SECONDS = 1.5;

type Options = {
  /**
   * Rewind to the start the first time the user presses play.
   *
   * For a real player: the seek is only there to fill the frame, and starting
   * playback 10% in would silently skip the opening of every meeting. The
   * decorative thumbnail never plays, so it leaves this off.
   */
  resetOnPlay?: boolean;
};

export function usePosterFrame(
  ref: React.RefObject<HTMLVideoElement | null>,
  { resetOnPlay = false }: Options = {},
) {
  /** null until metadata lands — "not known yet", which is not the same as
   *  "no video" and must not render as one. */
  const [hasVideo, setHasVideo] = useState<boolean | null>(null);
  /** Where we parked the playhead, so play can tell our seek from the user's. */
  const parkedAt = useRef<number | null>(null);

  const onLoadedMetadata = useCallback(() => {
    const video = ref.current;
    if (!video) return;

    // videoWidth is 0 for a file with no picture — an audio-only recording.
    setHasVideo(video.videoWidth > 0);
    if (video.videoWidth === 0) return;

    const duration = video.duration;
    const usable = Number.isFinite(duration) && duration > 0;
    let target = usable
      ? Math.min(Math.max(duration * FRACTION, MIN_SECONDS), MAX_SECONDS)
      : FALLBACK_SECONDS;
    // Never past the end: seeking beyond it parks on the last frame, which for
    // a call is the "meeting ended" screen — worse than the black one.
    if (usable) target = Math.min(target, Math.max(duration - 0.1, 0));
    if (target <= 0) return;

    try {
      video.currentTime = target;
      parkedAt.current = target;
    } catch {
      // Not seekable yet, or a source that refuses. A black frame is a poor
      // thumbnail, not a broken page.
    }
  }, [ref]);

  const onPlay = useCallback(() => {
    const video = ref.current;
    if (!resetOnPlay || !video || parkedAt.current === null) return;

    // Only rewind if the playhead is still where we parked it. A user who
    // scrubbed somewhere before pressing play chose that spot, and yanking
    // them back to zero would be the player fighting them.
    if (Math.abs(video.currentTime - parkedAt.current) < 0.25) {
      video.currentTime = 0;
    }
    parkedAt.current = null;
  }, [ref, resetOnPlay]);

  return { hasVideo, onLoadedMetadata, onPlay };
}
