"use client";

import { ExternalLinkIcon } from "@/components/app/icons";
import { formatTimeRange, type AgendaItem } from "@/lib/dashboard";

export default function MeetingRow({
  item,
  timezone,
  onToggle,
}: {
  item: AgendaItem;
  timezone: string;
  onToggle: (item: AgendaItem, next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-black/5 px-5 py-4 first:border-t-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ink">
          {item.title ?? "Untitled meeting"}
        </div>
        <div className="mt-0.5 text-xs text-ink/50">
          {formatTimeRange(item.starts_at, item.ends_at, timezone)}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={!item.bot_editable}
          onClick={() => onToggle(item, !item.bot_on)}
          aria-pressed={item.bot_on}
          aria-label={`Notetaker for ${item.title ?? "this meeting"}`}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            item.bot_on
              ? "border-ink/10 bg-canvas text-ink"
              : "border-transparent bg-canvas text-ink/35"
          } ${item.bot_editable ? "hover:border-ink/25" : "cursor-not-allowed opacity-60"}`}
        >
          {item.bot_on ? "Joining" : "Off"}
        </button>

        {item.meeting_url ? (
          <a
            href={item.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open meeting link"
            className="text-ink/30 transition-colors hover:text-ink"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
