"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { daysLeft, getSubscription, type Subscription } from "@/lib/billing";

export default function TrialPill() {
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    getSubscription().then(setSub).catch(() => setSub(null));
  }, []);

  // `authenticated` is Razorpay's "mandate signed, first charge not yet due" —
  // which is exactly what a trial is.
  if (!sub || sub.status !== "authenticated") return null;

  const left = daysLeft(sub.trial_ends_at);

  return (
    <Link
      href="/dashboard/billing"
      className="flex items-center justify-between rounded-xl border border-black/5 bg-canvas px-3 py-2 text-xs font-medium text-ink/70 hover:text-ink"
    >
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
        {left === 0 ? "Trial ends today" : `${left} ${left === 1 ? "day" : "days"} left of trial`}
      </span>
      <span aria-hidden>→</span>
    </Link>
  );
}
