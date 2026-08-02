"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { CalendarIcon, CheckIcon, CopyIcon } from "@/components/app/icons";
import { SCHEDULING_LINK, schedulingLinkUrl } from "@/lib/scheduling";

export default function SchedulingLinkCard() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(schedulingLinkUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the link is on screen to copy by hand.
    }
  }

  return (
    <Card className="flex items-center gap-4 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <CalendarIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">
          Share this link so others can book time with you
        </div>
        <div className="mt-0.5 truncate text-xs text-ink/40">{SCHEDULING_LINK}</div>
      </div>

      <button
        type="button"
        onClick={() => void copy()}
        className="flex shrink-0 items-center gap-2 rounded-full border border-ink/10 px-3.5 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink/25 hover:text-ink"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-accent" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
    </Card>
  );
}
