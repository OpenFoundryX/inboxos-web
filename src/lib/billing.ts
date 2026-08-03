import { apiFetch } from "@/lib/api";

export type Access = "entitled" | "locked";

export type Subscription = {
  access: Access;
  plan_id: string | null;
  status: string | null;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
  usage: {
    bot_hours_used: number;
    bot_hours_included: number;
    drafts_used: number;
    drafts_included: number | null;
  };
};

export type BillingPlan = {
  id: string;
  name: string;
  currency: string;
  monthly_price_cents: number;
  annual_price_cents: number;
  bot_hours_per_month: number;
  drafts_per_month: number | null;
};

export function getSubscription() {
  return apiFetch<Subscription>("/v1/billing/subscription");
}

export function getPlans() {
  return apiFetch<{ plans: BillingPlan[]; trial_days: number }>("/v1/billing/plans");
}

type CheckoutSession = {
  subscription_id: string;
  key_id: string;
  plan_id: string;
  currency: string;
  amount_cents: number;
};

/** Razorpay Checkout is a modal, not a redirect, so its script must be present
 *  before we can open anything. Loaded on demand rather than in the app shell:
 *  users who never reach the plan picker never pay for it. */
function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout"));
    document.body.appendChild(script);
  });
}

export async function startCheckout(
  planId: string,
  interval: "monthly" | "annual",
  opts: { onDismiss?: () => void } = {},
) {
  const session = await apiFetch<CheckoutSession>("/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId, interval }),
  });
  await loadRazorpay();

  const rzp = new (window as any).Razorpay({
    key: session.key_id,
    subscription_id: session.subscription_id,
    name: "InboxPilot",
    description: `${session.plan_id} — ${interval}`,
    // Nothing is trusted from this callback: the subscription only becomes
    // active when Razorpay's webhook tells the backend so. This just returns
    // the user to a page that will reflect whatever actually happened.
    handler: () => {
      window.location.href = "/dashboard?checkout=complete";
    },
    modal: { ondismiss: opts.onDismiss },
  });
  rzp.open();
}

export function cancelSubscription() {
  return apiFetch<Subscription>("/v1/billing/cancel", { method: "POST" });
}

/** Whole days left, floored, never negative. A pill that reads "-3 days left"
 *  is worse than one that reads "0". */
export function daysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** The plan's display name, or an explicit "no plan" state — never a
 *  hardcoded default. Every place in the app that names the account's plan
 *  (WorkspaceMenu, Settings) should read this rather than keep its own copy,
 *  so a "Free plan" placeholder can't drift out of sync with reality the way
 *  it already has twice. Status nuance (trial countdown, past due, cancels-
 *  at-period-end) is deliberately not folded in here — that's TrialPill's and
 *  SubscribeBanner's job, and repeating it in a third place is how a fourth
 *  contradiction gets introduced later. */
export function planName(sub: Subscription | null, plans: BillingPlan[]): string {
  if (!sub) return "";
  if (!sub.plan_id) return "No active plan";
  return plans.find((p) => p.id === sub.plan_id)?.name ?? sub.plan_id;
}
