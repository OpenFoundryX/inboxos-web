"use client";

import Topbar from "@/components/app/Topbar";
import PlanPicker from "@/components/billing/PlanPicker";

/** Logged-in plan picker — resubscribe / pick a plan without dropping back
 *  into the onboarding wizard shell. First-time paywall after connect still
 *  lives at `/onboarding/plan`. */
export default function BillingPage() {
  return (
    <>
      <Topbar title="Billing" />
      <div className="p-8">
        <PlanPicker />
      </div>
    </>
  );
}
