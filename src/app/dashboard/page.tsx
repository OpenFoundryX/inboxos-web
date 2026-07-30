"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import AskBar from "@/components/app/AskBar";
import InboxSetupCard from "@/components/app/InboxSetupCard";
import SubscribeBanner from "@/components/app/SubscribeBanner";
import InviteTeamBanner from "@/components/app/InviteTeamBanner";
import MeetingsPanel from "@/components/app/MeetingsPanel";
import Toast, { type ToastMessage } from "@/components/ui/Toast";
import { ChevronDownIcon, RefreshIcon } from "@/components/app/icons";
import {
  disableMeetingBot,
  enableMeetingBot,
  getDashboardSummary,
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
    <div className="space-y-10">
      <div className="mx-auto max-w-2xl pt-4">
        <div className="mx-auto h-8 w-2/3 animate-pulse rounded-lg bg-ink/5" />
        <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-ink/5" />
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-ink/5" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-ink/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-ink/5" />
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      </Topbar>

      <div className="p-8">
        {error ? (
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
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="mx-auto max-w-2xl pt-4 text-center">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                {greeting()}, {data.user.first_name}. Anything you&apos;d like to know?
              </h2>
              <AskBar onSubmit={() => router.push("/dashboard/chat")} />
            </div>

            <InboxSetupCard setup={data.setup} stats={data.stats} />
            <SubscribeBanner />
            <InviteTeamBanner />

            <div>
              <h3 className="mb-3 text-lg font-semibold tracking-tight text-ink">Your meetings</h3>
              <MeetingsPanel meetings={data.meetings} onToggle={toggleBot} />
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
