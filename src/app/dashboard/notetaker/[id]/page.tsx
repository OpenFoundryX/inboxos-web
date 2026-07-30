"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import MeetingDetail from "@/components/notetaker/MeetingDetail";
import { ApiError } from "@/lib/api";
import { backendConfigured } from "@/lib/session";
import { getMeeting, type MeetingDetail as Meeting } from "@/lib/meetings";

function BackLink() {
  return (
    <Link
      href="/dashboard/notetaker"
      className="text-sm font-semibold text-ink/50 transition-colors hover:text-ink"
    >
      ← All meetings
    </Link>
  );
}

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <Topbar title="Notetaker" />
      <div className="p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <BackLink />

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
              <div className="h-8 w-1/2 animate-pulse rounded-lg bg-ink/5" />
              <div className="h-32 animate-pulse rounded-2xl bg-ink/5" />
              <div className="h-48 animate-pulse rounded-2xl bg-ink/5" />
            </div>
          ) : (
            <MeetingDetail meeting={meeting} onRefreshRecording={refreshRecording} />
          )}
        </div>
      </div>
    </>
  );
}
