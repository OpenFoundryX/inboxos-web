"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDayHeading, isToday, saveNote } from "@/lib/notes";

type Props = {
  /** `YYYY-MM-DD`. */
  dateKey: string;
  /** What the server last had. Undefined until the window's fetch lands. */
  initialBody: string | undefined;
  onSaved: (dateKey: string, body: string) => void;
  onError: (message: string) => void;
};

/** How long to wait after the last keystroke before saving. Long enough that
 *  ordinary typing is one request rather than dozens, short enough that
 *  glancing away and back feels already-saved. */
const DEBOUNCE_MS = 800;

export default function DayNote({ dateKey, initialBody, onSaved, onError }: Props) {
  const [body, setBody] = useState(initialBody ?? "");
  const [saving, setSaving] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // What the server is known to hold. Guards every flush, so blurring or
  // closing the tab without having typed sends nothing.
  const saved = useRef(initialBody ?? "");
  // Read by the pagehide handler, which is registered once and would otherwise
  // capture the body from first render forever.
  const pending = useRef(body);
  pending.current = body;

  // Adopt the fetched body once it arrives — but never over something already
  // being typed, which would delete words mid-sentence if the request was slow.
  useEffect(() => {
    if (initialBody === undefined) return;
    if (saved.current === "" && body === "") {
      setBody(initialBody);
      saved.current = initialBody;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBody]);

  /** Grow to fit. A scrollbar inside one day would trap the page's own scroll. */
  const resize = useCallback(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(resize, [body, resize]);

  const flush = useCallback(
    async (next: string) => {
      if (next === saved.current) return;
      setSaving(true);
      try {
        await saveNote(dateKey, next);
        saved.current = next;
        onSaved(dateKey, next);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Couldn't save your notes");
      } finally {
        setSaving(false);
      }
    },
    [dateKey, onSaved, onError],
  );

  // Closing the tab mid-sentence is the ordinary way people leave a page like
  // this, and the debounce would otherwise still be pending. `keepalive` lets
  // the request outlive the document; a normal fetch is cancelled on unload.
  useEffect(() => {
    const onLeave = () => {
      if (pending.current === saved.current) return;
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) return;
      void fetch(`${base}/notes/${dateKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: pending.current }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [dateKey]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function change(next: string) {
    setBody(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(next), DEBOUNCE_MS);
  }

  function blur() {
    if (timer.current) clearTimeout(timer.current);
    void flush(body);
  }

  const today = isToday(dateKey);

  return (
    <section className="py-6" data-date={dateKey}>
      <h2
        className={`flex items-center gap-2 text-2xl font-bold tracking-tight ${
          today ? "text-ink" : "text-ink/40"
        }`}
      >
        {formatDayHeading(dateKey)}
        {today ? (
          <span className="h-2 w-2 rounded-full bg-accent" aria-label="Today" />
        ) : null}
        {saving ? <span className="text-xs font-medium text-ink/30">Saving…</span> : null}
      </h2>

      {/* The tall minimum is what separates one day from the next, and it is on
          the textarea rather than the section so the whole gap is clickable —
          the empty space below a heading is where you aim to start writing.
          `resize()` sets an inline height, but CSS min-height still wins when
          that height is smaller, so a long day grows past this and a short one
          never shrinks below it. */}
      <textarea
        ref={textarea}
        value={body}
        onChange={(e) => change(e.target.value)}
        onBlur={blur}
        placeholder="Write notes…"
        rows={1}
        className="mt-3 min-h-[58vh] w-full resize-none overflow-hidden bg-transparent text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:outline-none"
      />
    </section>
  );
}
