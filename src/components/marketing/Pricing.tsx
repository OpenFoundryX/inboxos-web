"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { LEGAL } from "@/lib/legal";
import {
  PLANS,
  ANNUAL_SAVING_LABEL,
  type Plan,
} from "@/lib/plans";

type Period = "annual" | "monthly";

/** Starter and Pro are the only tiers `POST /billing/checkout` knows about —
 *  Team and Enterprise are per-seat, pooled-quota tiers with no workspace/org
 *  model in the codebase (see the billing spec's scope), so their CTA can't
 *  be the same `/login` -> onboarding -> Checkout path without landing a buyer
 *  on a dashboard that only offers the two tiers they didn't click. A mailto
 *  keeps the promise "talk to us" actually makes, rather than routing them
 *  into a sign-up flow that has nothing to sell them. */
function ctaHref(plan: Plan): string {
  if (plan.id === "team" || plan.id === "enterprise") {
    return `mailto:${LEGAL.salesEmail}?subject=${encodeURIComponent(`InboxOS ${plan.name}`)}`;
  }
  return "/login";
}

function BillingToggle({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Billing period"
      className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-card p-1"
    >
      {(["annual", "monthly"] as const).map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={period === p}
          onClick={() => onChange(p)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
            period === p ? "bg-accent text-white" : "text-ink/60 hover:text-ink"
          }`}
        >
          {p}
        </button>
      ))}
      <span className="px-2 text-xs font-medium text-accent">
        {ANNUAL_SAVING_LABEL}
      </span>
    </div>
  );
}

function Price({ plan, period }: { plan: Plan; period: Period }) {
  const amount = period === "annual" ? plan.annual : plan.monthly;

  // Enterprise has no number, so it gets a sentence where the figure would be
  // rather than an empty slot that makes the card look broken.
  if (amount === null) {
    return (
      <div className="mt-5">
        <div className="font-serif text-3xl font-semibold">Custom</div>
        <p className="mt-1 text-sm text-ink/50">Priced on seats and volume</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-end gap-1.5">
        <span className="text-4xl font-semibold">${amount}</span>
        <span className="mb-1 text-sm text-ink/50">{plan.unit}</span>
      </div>
      <p className="mt-1 text-sm text-ink/50">
        {period === "annual" ? "Billed annually" : "Billed monthly"}
      </p>
    </div>
  );
}

export default function Pricing() {
  const [period, setPeriod] = useState<Period>("annual");

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          One seat, not three subscriptions
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink/60">
          Every plan includes inbox sorting, batched delivery and meeting
          recaps. Meeting hours and scheduling threads are metered, so you only
          pay for the ones you use.
        </p>
        <div className="mt-8 flex justify-center">
          <BillingToggle period={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col p-6 ${
              plan.featured ? "border-accent/40 shadow-md" : ""
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Most popular
              </span>
            )}
            <h3 className="font-serif text-xl font-semibold">{plan.name}</h3>
            <p className="mt-2 min-h-[3.25rem] text-sm leading-relaxed text-ink/60">
              {plan.blurb}
            </p>

            <Price plan={plan} period={period} />

            <Button
              variant={plan.featured ? "primary" : "outline"}
              href={ctaHref(plan)}
              className="mt-6 w-full"
            >
              {plan.cta}
            </Button>

            <ul className="mt-6 space-y-2.5 border-t border-black/5 pt-5">
              {plan.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm text-ink/75">
                  <span className="mt-0.5 text-accent" aria-hidden="true">
                    &bull;
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-ink/50">
        The Pro trial runs 7 days with Pro&apos;s full 15 bot-hours included,
        card required up front, once per customer. Outlook is still in
        development and isn&apos;t billed on any plan yet.
      </p>
    </section>
  );
}
