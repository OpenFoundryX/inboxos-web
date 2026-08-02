"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Markdown from "@/components/chat/Markdown";
import ActionItems from "@/components/notetaker/ActionItems";
import SummaryFeedback from "@/components/notetaker/SummaryFeedback";
import Menu, { MenuItem, MenuNote } from "@/components/ui/Menu";
import { CheckIcon, CopyIcon, DownloadIcon, WandIcon } from "@/components/app/icons";
import { meetingTitle, type MeetingDetail } from "@/lib/meetings";

/** Summary shapes the backend would have to render. Listed so the control is
 *  discoverable, disabled until there's an endpoint to ask for them. */
const PRESETS = ["Default", "Executive brief", "Detailed notes", "Sales call"];

function asMarkdown(meeting: MeetingDetail): string {
  const parts = [`# ${meetingTitle(meeting)}`];
  if (meeting.action_items.length > 0) {
    parts.push(
      "## Action items",
      meeting.action_items
        .map((a) => `- ${a.what}${a.owner ? ` — ${a.owner}` : ""}${a.due_at ? ` (due ${a.due_at})` : ""}`)
        .join("\n"),
    );
  }
  if (meeting.summary) parts.push("## Summary", meeting.summary);
  if (meeting.decisions.length > 0) {
    parts.push("## Decisions", meeting.decisions.map((d) => `- ${d}`).join("\n"));
  }
  return parts.join("\n\n");
}

export default function SummaryPanel({ meeting }: { meeting: MeetingDetail }) {
  const [copied, setCopied] = useState(false);

  const hasNotes =
    Boolean(meeting.summary) || meeting.decisions.length > 0 || meeting.action_items.length > 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(asMarkdown(meeting));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused outright; the download is the way out.
    }
  }

  function download() {
    const blob = new Blob([asMarkdown(meeting)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meetingTitle(meeting).replace(/[^\w\s-]/g, "").trim() || "meeting"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-3">
        <Menu
          align="left"
          trigger={(open) => (
            <span
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition-colors hover:bg-ink/5 ${
                open ? "text-ink" : "text-ink/60"
              }`}
            >
              Presets
              <WandIcon className="h-4 w-4" />
            </span>
          )}
        >
          <>
            {PRESETS.map((p) => (
              <MenuItem key={p} disabled>
                {p}
              </MenuItem>
            ))}
            <MenuNote>Choosing a preset needs the summary to be regenerated server-side.</MenuNote>
          </>
        </Menu>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={download}
            aria-label="Download these notes as Markdown"
            title="Download as Markdown"
            disabled={!hasNotes}
            className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            aria-label="Copy these notes"
            title={copied ? "Copied" : "Copy notes"}
            disabled={!hasNotes}
            className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-accent" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {!hasNotes ? (
        <p className="px-5 py-12 text-center text-sm text-ink/50">
          No notes yet — they appear once the recording finishes processing.
        </p>
      ) : (
        <div className="space-y-6 px-5 py-5">
          <ActionItems meetingId={meeting.id} items={meeting.action_items} />

          {meeting.summary ? <Markdown text={meeting.summary} /> : null}

          {meeting.decisions.length > 0 ? (
            <section>
              <h3 className="text-base font-bold text-ink">Decisions</h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink/80">
                {meeting.decisions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <SummaryFeedback meetingId={meeting.id} />
        </div>
      )}
    </Card>
  );
}
