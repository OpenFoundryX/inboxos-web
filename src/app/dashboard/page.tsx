"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import AskBar from "@/components/app/AskBar";
import AnalyticsCard from "@/components/app/AnalyticsCard";
import SectionHeader from "@/components/app/SectionHeader";
import SchedulingLinkCard from "@/components/app/SchedulingLinkCard";
import DoMorePanel from "@/components/app/DoMorePanel";
import SubscribeBanner from "@/components/app/SubscribeBanner";
import InviteTeamBanner from "@/components/app/InviteTeamBanner";
import MeetingsPanel from "@/components/app/MeetingsPanel";
import Toast, { type ToastMessage } from "@/components/ui/Toast";
import { RefreshIcon } from "@/components/app/icons";
import {
  disableMeetingBot,
  enableMeetingBot,
  getDashboardSummary,
  meetingHoursToday,
  type AgendaItem,
  type DashboardSummary,
} from "@/lib/dashboard";
import { BATCHING_FAILED_KEY } from "@/lib/onboarding";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

function Skeleton() {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-2xl pt-4">
        <div className="mx-auto h-8 w-2/3 animate-pulse rounded-lg bg-ink/5" />
        <div className="mt-6 h-14 w-full animate-pulse rounded-full bg-ink/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl bg-ink/5" />
        <div className="h-32 animate-pulse rounded-2xl bg-ink/5" />
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await getDashboardSummary());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your dashboard");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Set by the last onboarding step when startBatching() failed. Read once, so
  // it does not nag on every dashboard visit.
  useEffect(() => {
    if (window.sessionStorage.getItem(BATCHING_FAILED_KEY) !== "1") return;
    window.sessionStorage.removeItem(BATCHING_FAILED_KEY);
    setToast({
      id: Date.now(),
      text: "Couldn't turn on batched delivery. Turn it on from Mailman settings.",
      variant: "error",
    });
  }, []);

  /** Flip the pill immediately, then reconcile. On failure we re-fetch rather
   *  than hand-rolling an undo: the server may have partly applied the change,
   *  and its answer is the one worth showing. */
  const toggleBot = useCallback(
    async (item: AgendaItem, next: boolean) => {
      setData((prev) => {
        if (!prev) return prev;
        const patch = (list: AgendaItem[]) =>
          list.map((i) =>
            i.calendar_event_id === item.calendar_event_id ? { ...i, bot_on: next } : i,
          );
        return {
          ...prev,
          meetings: {
            ...prev.meetings,
            today: patch(prev.meetings.today),
            tomorrow: patch(prev.meetings.tomorrow),
          },
        };
      });

      try {
        if (next) {
          await enableMeetingBot(item.calendar_event_id);
        } else if (item.meeting_id) {
          await disableMeetingBot(item.meeting_id);
        }
      } catch (e) {
        setToast({
          id: Date.now(),
          text: e instanceof Error ? e.message : "Could not update the notetaker",
          variant: "error",
        });
      }
      await load();
    },
    [load],
  );

  return (
    <>
      <Topbar title="Dashboard">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          aria-label="Refresh the dashboard"
          className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed"
        >
          <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </Topbar>

      <div className="p-8">
        {/* A failed refresh shouldn't take away a dashboard that's already on
            screen — the toast-free error page is only right when there's
            nothing to fall back to. */}
        {error && !data ? (
          <Card className="mx-auto max-w-md p-8 text-center">
            <div className="text-sm font-semibold text-ink">{error}</div>
            <button
              onClick={load}
              className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Try again
            </button>
          </Card>
        ) : !data ? (
          <Skeleton />
        ) : (
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="mx-auto max-w-2xl pt-4 text-center">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                {greeting()}, {data.user.first_name}. Anything you&apos;d like to know?
              </h2>
              <AskBar onSubmit={() => router.push("/dashboard/chat")} />
            </div>

            {/* Only while the first pass over the mailbox is running. Once it's
                done the numbers below say everything this would. */}
            {data.setup.state === "syncing" ? (
              <Card className="p-4 text-sm text-ink/60">
                Working through the mail already in your inbox. This usually takes a few minutes.
              </Card>
            ) : null}

            <section>
              <SectionHeader
                title="Analytics"
                action={
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink/50 transition-colors hover:text-ink"
                  >
                    Open Gmail →
                  </a>
                }
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <AnalyticsCard label="Emails processed" value={data.stats.emails_categorized} />
                <AnalyticsCard label="Drafts created" value={data.stats.drafts_created} />
                <AnalyticsCard
                  label="Meeting time"
                  value={meetingHoursToday(data.meetings)}
                  unit="h"
                />
              </div>
            </section>

            <section>
              <SectionHeader title="Your meetings" />
              <MeetingsPanel meetings={data.meetings} onToggle={toggleBot} />
            </section>

            <section>
              <SectionHeader
                title="Share your scheduling link"
                action={
                  <Link
                    href="/dashboard/scheduling"
                    className="text-sm text-ink/50 transition-colors hover:text-ink"
                  >
                    Update meeting settings →
                  </Link>
                }
              />
              <SchedulingLinkCard />
            </section>

            <section>
              <SectionHeader title="Do more with InboxOS" />
              <DoMorePanel />
            </section>

            <SubscribeBanner />
            <InviteTeamBanner />
          </div>
        )}
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
