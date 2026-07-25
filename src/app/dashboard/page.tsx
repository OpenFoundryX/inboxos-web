"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/app/ProgressRing";
import SetupChecklist from "@/components/app/SetupChecklist";
import AnalyticsCard from "@/components/app/AnalyticsCard";
import AskBar from "@/components/app/AskBar";
import MeetingsPanel from "@/components/app/MeetingsPanel";
import { ChevronDownIcon, RefreshIcon, CopyIcon } from "@/components/app/icons";
import { isSetupDone, setSetupDone } from "@/lib/auth";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function TopbarActions() {
  return (
    <>
      <button className="flex items-center gap-1 rounded-full border border-ink/10 bg-cream px-3 py-1.5 text-sm font-medium text-ink/70">
        Personal
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      <button className="text-ink/40 hover:text-ink" aria-label="Refresh">
        <RefreshIcon className="h-5 w-5" />
      </button>
    </>
  );
}

function SetupView({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const total = 4;

  useEffect(() => {
    if (step >= total) {
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const percent = (step / total) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
          <ProgressRing percent={percent} label={step >= total ? "complete" : "setting up"} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/60">Emails categorized</span>
              <span className="text-sm font-semibold text-ink/40">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/60">Drafts created</span>
              <span className="text-sm font-semibold text-ink/40">—</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <SetupChecklist activeIndex={step} />
        </div>
      </Card>
      <Card className="flex items-center justify-between p-5">
        <div>
          <div className="text-sm font-bold text-ink">Subscribe for full access</div>
          <div className="mt-0.5 text-xs text-ink/50">
            Keep your automations running after your trial.
          </div>
        </div>
        <a href="/#pricing" className="text-sm font-semibold text-accent hover:text-accent-dark">
          View plans →
        </a>
      </Card>
    </div>
  );
}

function MatureView() {
  const router = useRouter();
  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-2xl pt-4 text-center">
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight">
          {greeting()} &mdash; anything you&apos;d like to know?
        </h2>
        <AskBar onSubmit={() => router.push("/dashboard/chat")} />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">Analytics</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <AnalyticsCard label="Emails processed" />
          <AnalyticsCard label="Drafts created" />
          <AnalyticsCard label="Meeting time" />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">Your meetings</h3>
        <MeetingsPanel />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">Share your scheduling link</h3>
        <Card className="flex items-center justify-between p-5">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">
              Share this link so others can book time with you
            </div>
            <div className="mt-0.5 truncate text-xs text-ink/40">
              inboxos.app/e/your-scheduling-link
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-sm font-medium text-ink/70 hover:text-ink">
            <CopyIcon className="h-4 w-4" />
            Copy link
          </button>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    setDone(isSetupDone());
  }, []);

  function handleDone() {
    setSetupDone();
    setDone(true);
  }

  return (
    <>
      <Topbar title="Dashboard">
        <TopbarActions />
      </Topbar>
      <div className="p-8">
        {done === null ? null : done ? <MatureView /> : <SetupView onDone={handleDone} />}
      </div>
    </>
  );
}
