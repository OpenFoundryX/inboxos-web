"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { resetOnboarding, signOut } from "@/lib/auth";
import { backendConfigured, logout } from "@/lib/session";
import {
  cancelSubscription,
  getPlans,
  getSubscription,
  type BillingPlan,
  type Subscription,
} from "@/lib/billing";

/** Describes the account's plan state in one line. Falls back to the raw
 *  plan_id/status if the catalog hasn't loaded yet or the plan was retired —
 *  better than showing nothing. */
function planSummary(sub: Subscription | null, plans: BillingPlan[]): string {
  if (!sub) return "Loading…";
  if (sub.access === "locked" && !sub.plan_id) return "No active plan";
  const name = plans.find((p) => p.id === sub.plan_id)?.name ?? sub.plan_id ?? "Plan";
  if (sub.status === "authenticated") return `${name} — free trial`;
  if (sub.status === "pending") return `${name} — payment failed`;
  if (sub.cancel_at_period_end) return `${name} — cancels at period end`;
  if (sub.access === "locked") return `${name} — inactive`;
  return name;
}

export default function SettingsPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubscription().then(setSub).catch(() => setSub(null));
    getPlans()
      .then((body) => setPlans(body.plans))
      .catch(() => setPlans([]));
  }, []);

  function replay() {
    resetOnboarding();
    router.replace("/onboarding/mail");
  }

  async function handleSignOut() {
    if (backendConfigured()) await logout();
    signOut();
    router.replace("/");
  }

  async function handleCancel() {
    if (!window.confirm("Cancel your subscription? You'll keep access until the end of the current period.")) {
      return;
    }
    setCancelling(true);
    setError(null);
    try {
      const updated = await cancelSubscription();
      setSub(updated);
    } catch {
      setError("Couldn't cancel your subscription. Try again.");
    } finally {
      setCancelling(false);
    }
  }

  const showCancel =
    backendConfigured() && sub && sub.access === "entitled" && !sub.cancel_at_period_end;
  const showViewPlans = backendConfigured() && sub && sub.access === "locked";

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-8">
        <PageHeader title="Settings" subtitle="Manage your workspace and account." />
        <div className="max-w-2xl space-y-6">
          <Card className="p-5">
            <div className="text-sm font-bold text-ink">Profile</div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                NP
              </span>
              <div>
                <div className="text-sm font-medium text-ink">Your Workspace</div>
              </div>
            </div>
          </Card>

          {backendConfigured() && (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-ink">Billing</div>
                  <div className="mt-1 text-xs text-ink/50">{planSummary(sub, plans)}</div>
                </div>
                {showViewPlans && (
                  <Button variant="outline" href="/onboarding/plan">
                    View plans
                  </Button>
                )}
                {showCancel && (
                  <Button variant="outline" disabled={cancelling} onClick={handleCancel}>
                    {cancelling ? "Cancelling…" : "Cancel subscription"}
                  </Button>
                )}
              </div>
              {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
              {/* No card-update or plan-change path in v1 — Razorpay has no
                  billing portal, so those go through support. */}
            </Card>
          )}

          {backendConfigured() ? null : (
            <Card className="flex items-center justify-between p-5">
              <div>
                <div className="text-sm font-bold text-ink">Replay onboarding</div>
                <div className="text-xs text-ink/50">
                  Reset the setup flow and walk through onboarding again.
                </div>
              </div>
              <Button variant="outline" onClick={replay}>
                Replay
              </Button>
            </Card>
          )}

          <Card className="flex items-center justify-between p-5">
            <div>
              <div className="text-sm font-bold text-ink">Sign out</div>
              <div className="text-xs text-ink/50">End your session on this device.</div>
            </div>
            <Button variant="dark" onClick={handleSignOut}>
              Sign out
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
