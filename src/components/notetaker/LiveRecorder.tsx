"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { finishLiveRecording, LIVE_MIME, type MeetingRead, type UploadTarget } from "@/lib/meetings";

type Props = {
  /** The row and upload permission the server issued when recording started. */
  target: UploadTarget;
  onFinished: (meeting: MeetingRead) => void;
  onFailed: (message: string) => void;
};

/** How often MediaRecorder hands us a chunk. Frequent enough that stopping is
 *  responsive, rare enough not to fragment the audio into thousands of blobs. */
const CHUNK_MS = 1000;

/** Bars in the waveform. Fixed so the strip's width doesn't shift as it fills. */
const BARS = 48;

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Records the microphone and uploads the result when stopped.
 *
 * The audio is held in memory until Stop — a two-hour recording is around
 * 30 MB of Opus, which a tab carries comfortably. The cost of that choice is
 * that a tab crash loses the recording; streaming chunks as they are produced
 * would fix it and is not worth the multipart bookkeeping until someone hits
 * it. The server's janitor clears the reserved row either way, so a lost
 * recording leaves no debris.
 */
export default function LiveRecorder({ target, onFinished, onFailed }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => new Array(BARS).fill(0));
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const frame = useRef<number | null>(null);
  // Guards the upload against running twice — Stop and unmount can both reach
  // it, and a second PUT to the same key would race the first.
  const finishing = useRef(false);

  /** Drop the microphone and every meter attached to it. Idempotent: unmount
   *  and an explicit stop both call it, and a browser that keeps a mic light
   *  on after recording ended is alarming in a way a bug report never explains
   *  well. */
  const teardown = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void audioContext.current?.close().catch(() => {});
    audioContext.current = null;
  }, []);

  const upload = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    setUploading(true);
    const blob = new Blob(chunks.current, { type: LIVE_MIME });
    try {
      if (blob.size === 0) throw new Error("Nothing was recorded");
      onFinished(await finishLiveRecording(target, blob, setProgress));
    } catch (e) {
      onFailed(e instanceof Error ? e.message : "Couldn't save that recording");
    } finally {
      setUploading(false);
    }
  }, [target, onFinished, onFailed]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let media: MediaStream;
      try {
        media = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        // Denied, dismissed, or no microphone. All three are the same to us,
        // and the browser has already explained itself to the user.
        onFailed("Microphone access is needed to record");
        return;
      }
      if (cancelled) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;

      // The container is the browser's to choose: Chrome and Firefox produce
      // WebM, Safari MP4. The upload was signed for one type, so a browser that
      // can't produce it has to say so rather than upload something the bucket
      // will reject.
      if (!MediaRecorder.isTypeSupported(LIVE_MIME)) {
        onFailed("This browser can't record audio in a supported format — try Chrome");
        media.getTracks().forEach((t) => t.stop());
        return;
      }

      const rec = new MediaRecorder(media, { mimeType: LIVE_MIME });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = () => void upload();
      rec.start(CHUNK_MS);
      recorder.current = rec;

      // Level meter. Reading the analyser on animation frames rather than on a
      // timer keeps it in step with painting and lets the browser stop it
      // entirely when the tab is hidden — nobody is watching a waveform they
      // can't see.
      const ctx = new AudioContext();
      audioContext.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(media).connect(analyser);
      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(buffer);
        // Peak deviation from the 128 midpoint: cheap, and it tracks speech
        // onsets more visibly than an RMS average does.
        let peak = 0;
        for (const v of buffer) peak = Math.max(peak, Math.abs(v - 128));
        setLevels((prev) => [...prev.slice(1), Math.min(1, peak / 96)]);
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [onFailed, teardown, upload]);

  useEffect(() => {
    if (uploading) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [uploading]);

  function stop() {
    const rec = recorder.current;
    // `onstop` fires the upload, so the recorder is asked to stop first and the
    // microphone released after — reversing that would cut the last chunk.
    if (rec && rec.state !== "inactive") rec.stop();
    else void upload();
    teardown();
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={stop}
          disabled={uploading}
          aria-label="Stop recording"
          className="shrink-0 rounded-lg bg-accent p-2.5 text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          <span className="block h-3 w-3 rounded-[2px] bg-white" />
        </button>

        <div className="flex h-10 min-w-0 flex-1 items-center justify-center gap-[3px]">
          {levels.map((level, i) => (
            <span
              key={i}
              className="w-[3px] shrink-0 rounded-full bg-accent/70"
              // A floor of 2px keeps silence as a flat line rather than a gap,
              // which reads as "listening" instead of "broken".
              style={{ height: `${Math.max(2, level * 36)}px` }}
            />
          ))}
        </div>

        <span className="shrink-0 font-mono text-sm tabular-nums text-ink/60">
          {mmss(seconds)}
        </span>
      </div>

      <p className="mt-3 text-center text-xs text-ink/50">
        {uploading
          ? progress >= 1
            ? "Processing your recording…"
            : `Saving… ${Math.round(progress * 100)}%`
          : "Recording — the transcript and summary appear when you stop."}
      </p>
    </div>
  );
}
