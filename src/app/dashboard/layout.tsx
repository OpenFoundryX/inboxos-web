"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { backendConfigured, checkAccess } from "@/lib/session";
import { getSubscription } from "@/lib/billing";
import Sidebar from "@/components/app/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    checkAccess().then(async ({ authed, connected, onboarded }) => {
      if (!active) return;
      if (!authed) {
        router.replace("/login");
        return;
      }
      if (!onboarded) {
        router.replace(connected ? "/onboarding/mail" : "/onboarding/connect");
        return;
      }
      // The wizard itself is done, but the paywall's "before dashboard" gate
      // is a second, independent check: it must confirm the user actually
      // authorised a subscription, not just that `plan_id` is set. `plan_id`
      // is written by `start_checkout` the instant the Razorpay subscription
      // is created server-side — before the checkout modal even opens — so a
      // user who clicked a plan and then closed the modal without signing a
      // mandate already has `plan_id` set despite having authorised nothing.
      // `subscription_started` (see `schemas.billing.SubscriptionOut`) is the
      // field that actually answers "did this happen": derived from
      // Razorpay's status, it's `false` only for `created`/`expired`/no row
      // at all — exactly the abandoned-modal and never-checked-out cases —
      // so those are the only ones sent back to finish it. A user whose
      // subscription later goes locked or churns keeps `subscription_started`
      // true from when they first authorised, so this never bounces them:
      // the dashboard stays reachable read-only, per the spec, for anyone
      // who has already been through this gate once.
      if (backendConfigured()) {
        try {
          const sub = await getSubscription();
          if (!active) return;
          if (!sub.subscription_started) {
            router.replace("/onboarding/plan");
            return;
          }
        } catch {
          // Unreachable billing API: don't strand the user on a spinner over
          // a transient failure unrelated to whether they're onboarded.
        }
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-ink/40">Loading…</div>
    );
  }

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
