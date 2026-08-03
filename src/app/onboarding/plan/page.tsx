"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getPlans, startCheckout, type BillingPlan } from "@/lib/billing";

type Interval = "monthly" | "annual";

// Deliberately no "already has a plan_id, skip straight to the dashboard"
// check on mount here. `plan_id` is set the instant `POST /checkout`
// succeeds — before the Razorpay modal even opens — so a currently-trialing
// user (TrialPill links here) and a locked, churned user re-subscribing
// (SubscribeBanner links here) both already have it set, same as someone
// mid-checkout. An auto-redirect keyed on `plan_id` alone would bounce
// exactly the two audiences this page has to stay reachable for; see
// `dashboard/layout.tsx` for the one place that distinguishes "never chosen
// a plan" (the real I9 gate) from "chose one, now locked or renewing".
export default function PlanPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [trialDays, setTrialDays] = useState(7);
  const [interval, setInterval] = useState<Interval>("monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then((body) => {
        setPlans(body.plans);
        setTrialDays(body.trial_days);
      })
      .catch(() => setPlans([]));
  }, []);

  // The backend catalog only ever contains purchasable tiers, so there is no
  // filtering to do here — Team and Enterprise are absent by construction
  // rather than by a list this page has to remember to maintain.
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-xl font-bold text-ink">Choose your plan</h1>
      <p className="mt-1 text-sm text-ink/60">
        {trialDays} days free. Cancel any time before then and you won&apos;t be charged.
      </p>

      <div className="mt-6 flex gap-2">
        {(["monthly", "annual"] as Interval[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setInterval(value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              interval === value ? "bg-accent text-white" : "bg-canvas text-ink/60"
            }`}
          >
            {value === "monthly" ? "Monthly" : "Annual"}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const cents =
            interval === "monthly" ? plan.monthly_price_cents : plan.annual_price_cents;
          return (
            <Card key={plan.id} className="p-5">
              <div className="text-sm font-bold text-ink">{plan.name}</div>
              <div className="mt-2 text-2xl font-bold text-ink">
                ${(cents / 100).toFixed(0)}
                <span className="text-sm font-medium text-ink/50">
                  {interval === "monthly" ? " / month" : " / year"}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-ink/60">
                <li>{plan.bot_hours_per_month} bot-hours a month</li>
                <li>
                  {plan.drafts_per_month === null
                    ? "Unlimited AI drafts"
                    : `${plan.drafts_per_month} AI drafts a month`}
                </li>
              </ul>
              <Button
                className="mt-4 w-full"
                disabled={busy !== null}
                onClick={() => {
                  setBusy(plan.id);
                  setError(null);
                  startCheckout(plan.id, interval, {
                    // Dismissing the modal is not an error — just let them try again.
                    onDismiss: () => setBusy(null),
                  }).catch(() => {
                    setBusy(null);
                    setError("Couldn't start checkout. Try again.");
                  });
                }}
              >
                {busy === plan.id ? "Opening checkout…" : `Start ${trialDays}-day trial`}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
