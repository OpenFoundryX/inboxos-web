"use client";

import { useState } from "react";
import { ChevronDownIcon, PaperclipIcon } from "@/components/app/icons";
import { safeHref } from "@/components/chat/Markdown";
import type { ChatSource } from "@/lib/chat";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function SourceList({ sources }: { sources: ChatSource[] }) {
  const [open, setOpen] = useState(false);
  if (sources.length === 0) return null;

  const noun = sources.length === 1 ? "email" : "emails";

  return (
    <div className="mt-3 border-t border-ink/5 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-ink"
        aria-expanded={open}
      >
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
        />
        {sources.length} {noun}
      </button>
      {open ? (
        <ul className="mt-2 space-y-1.5">
          {sources.map((s, i) => {
            const href = s.link ? safeHref(s.link) : null;
            const content = (
              <>
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  {s.title || "(no subject)"}
                  {s.attachment_count > 0 ? (
                    <PaperclipIcon className="h-3 w-3 shrink-0 text-ink/40" />
                  ) : null}
                </span>
                <span className="text-ink/50">
                  {s.sender}
                  {formatDate(s.date) ? ` · ${formatDate(s.date)}` : ""}
                </span>
              </>
            );
            return (
              <li key={`${s.ref_id ?? "src"}-${i}`} className="text-xs">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg px-2 py-1.5 hover:bg-cream"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="block rounded-lg px-2 py-1.5">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
