"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Menu, { MenuItem } from "@/components/ui/Menu";
import Toast, { type ToastMessage, type ToastVariant } from "@/components/ui/Toast";
import MeetingDetail from "@/components/notetaker/MeetingDetail";
import MeetingVideo from "@/components/notetaker/MeetingVideo";
import InsightsPanel from "@/components/notetaker/InsightsPanel";
import {
  ArrowLeftIcon,
  CheckIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  ShareIcon,
  TrashIcon,
} from "@/components/app/icons";
import { ApiError } from "@/lib/api";
import { backendConfigured } from "@/lib/session";
import {
  cancelMeetingBot,
  formatMeetingDate,
  getMeeting,
  isCancellable,
  meetingTitle,
  type MeetingDetail as Meeting,
} from "@/lib/meetings";

const SUGGESTIONS = [
  "List all action items from this meeting",
  "Show what was decided, and what wasn't",
  "Create a follow-up email or recap",
];

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, variant: ToastVariant = "success") => {
    setToast({ id: Date.now(), text, variant });
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    if (!backendConfigured()) {
      setError("Not connected to the InboxOS backend. Set NEXT_PUBLIC_API_URL to view meetings.");
      return;
    }
    setError(null);
    try {
      setMeeting(await getMeeting(id));
    } catch (e) {
      // A 404 here means the id is stale or belongs to someone else — the
      // server answers both the same way, and so should we.
      if (e instanceof ApiError && e.status === 404) {
        setError("That meeting doesn't exist, or isn't yours.");
      } else {
        setError(e instanceof Error ? e.message : "Could not load this meeting");
      }
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /** The recording link is signed for a few hours, so a tab left open long
   *  enough will hold a dead one. Re-fetching the meeting is all it takes —
   *  the server resolves a fresh link on every detail read. */
  const refreshRecording = useCallback(async () => {
    if (!id) return null;
    const fresh = await getMeeting(id);
    setMeeting(fresh);
    return fresh.recording_url;
  }, [id]);

  /** There's no sharing endpoint yet, so "share" is the page link. It only
   *  opens for someone already in the workspace, which is the honest limit. */
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      notify("Couldn't copy the link — your browser blocked the clipboard.", "error");
    }
  }

  async function cancelBot() {
    if (!meeting) return;
    try {
      const updated = await cancelMeetingBot(meeting.id);
      setMeeting((m) => (m ? { ...m, ...updated } : m));
      notify("Notetaker recalled");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Couldn't cancel the notetaker", "error");
    }
  }

  const title = meeting ? meetingTitle(meeting) : "Meeting";

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/notetaker"
            aria-label="Back to all meetings"
            className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <h1 className="truncate text-base font-bold text-ink">{title}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void share()}
            disabled={!meeting}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {shared ? <CheckIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
            {shared ? "Link copied" : "Share"}
          </button>

          <Menu
            label="More options"
            trigger={() => (
              <span className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink">
                <EllipsisIcon className="h-5 w-5" />
              </span>
            )}
          >
            {(close) => (
              <>
                {meeting?.meeting_url ? (
                  <MenuItem
                    icon={<ExternalLinkIcon className="h-4 w-4" />}
                    onSelect={() => {
                      close();
                      window.open(meeting.meeting_url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Open meeting link
                  </MenuItem>
                ) : null}
                {meeting && isCancellable(meeting) ? (
                  <MenuItem
                    icon={<TrashIcon className="h-4 w-4" />}
                    destructive
                    onSelect={() => {
                      close();
                      void cancelBot();
                    }}
                  >
                    Cancel notetaker
                  </MenuItem>
                ) : null}
                {!meeting?.meeting_url && !(meeting && isCancellable(meeting)) ? (
                  <p className="px-3.5 py-2 text-xs text-ink/40">Nothing to do here yet.</p>
                ) : null}
              </>
            )}
          </Menu>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-2xl">
            {error ? (
              <Card className="p-8 text-center">
                <div className="text-sm font-semibold text-ink">{error}</div>
                <button
                  onClick={load}
                  className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
                >
                  Try again
                </button>
              </Card>
            ) : !meeting ? (
              <div className="space-y-4">
                <MeetingVideo
                  src={null}
                  hasRecording={false}
                  loading
                  meta={
                    <div className="space-y-2">
                      <div className="h-3.5 w-28 animate-pulse rounded bg-ink/5" />
                      <div className="h-3.5 w-20 animate-pulse rounded bg-ink/5" />
                    </div>
                  }
                />
                <div className="h-11 animate-pulse rounded-xl bg-ink/5" />
                <div className="h-72 animate-pulse rounded-2xl bg-ink/5" />
              </div>
            ) : (
              <MeetingDetail meeting={meeting} onRefreshRecording={refreshRecording} />
            )}
          </div>
        </div>

        <div className="hidden w-[22rem] shrink-0 lg:block xl:w-[26rem]">
          <InsightsPanel
            scope={
              meeting
                ? { title: meetingTitle(meeting), when: formatMeetingDate(meeting.starts_at) }
                : null
            }
            headline={
              <>
                Your meetings, <span className="text-accent">understood</span>.
              </>
            }
            subhead="Ask questions and extract insights instantly."
            suggestions={SUGGESTIONS}
          />
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
