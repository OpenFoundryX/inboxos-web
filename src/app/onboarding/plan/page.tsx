"use client";

import PlanPicker from "@/components/billing/PlanPicker";

// Deliberately no "already has a plan_id, skip straight to the dashboard"
// check on mount here. `plan_id` is set the instant `POST /checkout`
// succeeds — before the Razorpay modal even opens — so a currently-trialing
// user and a locked, churned user both already have it set. An auto-redirect
// keyed on `plan_id` alone would bounce exactly the audiences this page (and
// `/dashboard/billing`) have to stay reachable for. See `dashboard/layout.tsx`
// for the gate that only sends *never-chosen* plans here.
export default function PlanPage() {
  return <PlanPicker />;
}
