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
  // `pending` means a charge failed and Razorpay is still retrying.
  const pastDue = sub.status === "pending";
  if (sub.access !== "locked" && !pastDue) return null;

  return (
    <Card className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="text-2xl">
          🔒
        </span>
        <div>
          <div className="text-sm font-bold text-ink">
            {pastDue ? "Your payment didn't go through" : "Subscribe for full access"}
          </div>
          <div className="mt-0.5 text-xs text-ink/50">
            {pastDue
              ? "Update your card to keep your automations running."
              : "Start a subscription to keep your automations running."}
          </div>
        </div>
      </div>
      <a
        href="/onboarding/plan"
        className="shrink-0 text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
      >
        {pastDue ? "Update card →" : "View plans →"}
      </a>
    </Card>
  );
}
