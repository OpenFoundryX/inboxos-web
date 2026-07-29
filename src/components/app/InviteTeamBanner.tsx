"use client";

import { useEffect, useState } from "react";
import { UsersIcon } from "@/components/app/icons";

const DISMISSED_KEY = "inboxos_invite_banner_dismissed";

export default function InviteTeamBanner() {
  // Starts hidden and reveals after mount: reading localStorage during render
  // would not match the server-rendered HTML and React would complain.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(DISMISSED_KEY) !== "1");
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-canvas px-5 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <UsersIcon className="h-4 w-4 text-ink/60" />
          Works better with your team on it
        </div>
        <div className="mt-1 text-xs text-ink/50">
          Shared meeting notes, drafts with more context to work from, and scheduling that
          already knows everyone&apos;s hours.
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          <UsersIcon className="h-4 w-4" />
          Invite team
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="px-1 text-lg leading-none text-ink/30 transition-colors hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  );
}
