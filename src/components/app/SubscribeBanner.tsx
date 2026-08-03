"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import { getSubscription, type Subscription } from "@/lib/billing";

export default function SubscribeBanner() {
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    getSubscription().then(setSub).catch(() => setSub(null));
  }, []);

  if (!sub) return null;
  // `pending` means a charge failed and Razorpay is retrying automatically —
  // the account's `access` is still "entitled" while that happens, so this is
  // a warning, not a lockout, and the copy has to read that way. It also must
  // not point at checkout: the backend 409s a new checkout while a
  // non-terminal subscription already exists, and there is no in-app
  // card-update path to send them to instead (Razorpay has no billing portal
  // in v1) — Settings, where cancel lives, is the honest destination.
  const pastDue = sub.status === "pending";
  if (sub.access !== "locked" && !pastDue) return null;

  return (
    <Card className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="text-2xl">
          {pastDue ? "⚠️" : "🔒"}
        </span>
        <div>
          <div className="text-sm font-bold text-ink">
            {pastDue ? "A recent payment didn't go through" : "Subscribe for full access"}
          </div>
          <div className="mt-0.5 text-xs text-ink/50">
            {pastDue
              ? "We're retrying automatically and your access isn't affected. Contact support if this keeps happening."
              : "Start a subscription to keep your automations running."}
          </div>
        </div>
      </div>
      <a
        href={pastDue ? "/dashboard/settings" : "/onboarding/plan"}
        className="shrink-0 text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
      >
        {pastDue ? "View billing →" : "View plans →"}
      </a>
    </Card>
  );
}
