"use client";

import { useEffect, useState } from "react";
import {
  getDayTasks,
  senderName,
  type InboxTask,
  type InboxTasks as Payload,
} from "@/lib/notes";

/**
 * Emails from this day that the classifier decided are asking something of you.
 *
 * Deliberately *beside* the note, never inside it. The note body is
 * last-write-wins and the editor adopts the server's copy exactly once, so
 * anything written into it from outside would be invisible until reload and
 * then destroyed by the next keystroke. Adding a line is therefore always a
 * user action, routed through the editor so it rides along with their own save.
 */
export default function InboxTasks({
  dateKey,
  onInsert,
}: {
  dateKey: string;
  /** Puts a line into the note at the caret. */
  onInsert: (text: string) => void;
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [taken, setTaken] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    getDayTasks(dateKey)
      .then((d) => alive && setData(d))
      // A side panel is not worth an error banner over the page it sits on.
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [dateKey]);

  // Nothing to say: no category, no mail, or the inbox was unreachable. All
  // three render as absence rather than as an empty box on every past day.
  if (failed || !data || data.tasks.length === 0) return null;

  function add(task: InboxTask) {
    const who = senderName(task.sender);
    onInsert(`${task.subject || "(no subject)"} — ${who}`);
    setTaken((prev) => new Set(prev).add(task.id));
  }

  return (
    <div className="mt-3 rounded-xl border border-black/[0.07] bg-[#fbfcf8]">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-xs font-semibold text-ink/60">
          {data.tasks.length} email{data.tasks.length === 1 ? "" : "s"} needing you
          <span className="ml-1.5 font-normal text-ink/35">
            from &ldquo;{data.label}&rdquo;
          </span>
        </span>
        <span className="text-xs text-ink/35">{collapsed ? "Show" : "Hide"}</span>
      </button>

      {collapsed ? null : (
        <ul className="border-t border-black/[0.05]">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start justify-between gap-3 border-b border-black/[0.04] px-4 py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {task.subject || "(no subject)"}
                </p>
                <p className="truncate text-xs text-ink/45">
                  {senderName(task.sender)}
                  {task.snippet ? ` — ${task.snippet}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={task.gmail_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-ink/45 hover:text-ink"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => add(task)}
                  disabled={taken.has(task.id)}
                  className="rounded-full border border-ink/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/[0.06] disabled:opacity-40"
                >
                  {taken.has(task.id) ? "Added" : "Add"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
