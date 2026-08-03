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
      // is a second, independent check: `plan_id` is only ever set once a
      // checkout has actually been started (see `api.v1.billing.
      // start_checkout`), so a user who reached the end of onboarding
      // without ever picking a plan — including one who abandoned the plan
      // step and is only now returning — has `plan_id === null` here and
      // gets sent back to finish it. A user whose subscription later goes
      // locked or churns keeps `plan_id` set from when they first chose one,
      // so this never bounces them: the dashboard stays reachable read-only,
      // per the spec, for anyone who has already been through this gate once.
      if (backendConfigured()) {
        try {
          const sub = await getSubscription();
          if (!active) return;
          if (!sub.plan_id) {
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
