"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { backendConfigured, logout } from "@/lib/session";
import {
  getPlans,
  getSubscription,
  planName,
  type BillingPlan,
  type Subscription,
} from "@/lib/billing";
import { ChevronDownIcon, SignOutIcon } from "./icons";

export default function WorkspaceMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);

  useEffect(() => {
    if (!backendConfigured()) return;
    getSubscription().then(setSub).catch(() => setSub(null));
    getPlans()
      .then((body) => setPlans(body.plans))
      .catch(() => setPlans([]));
  }, []);

  async function handleSignOut() {
    if (backendConfigured()) await logout();
    signOut();
    router.replace("/");
  }

  // Sourced from the same subscription the trial pill above this reads —
  // "Free plan" used to be hardcoded here regardless of what plan (or trial,
  // or lack of one) was actually active, which contradicted TrialPill's
  // countdown by about 40px. Blank while unconfigured/unloaded rather than a
  // fabricated default: no line is better than a wrong one.
  const label = backendConfigured() ? planName(sub, plans) : "";

  return (
    <div className="relative">
      {open ? (
        <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-black/5 bg-card shadow-lg">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-ink/70 hover:bg-ink/5"
          >
            <SignOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-canvas px-3 py-2 text-left hover:border-ink/15"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
          NP
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">Your Workspace</span>
          {label ? (
            <span className="block truncate text-xs text-ink/50">{label}</span>
          ) : null}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-ink/40" />
      </button>
    </div>
  );
}
