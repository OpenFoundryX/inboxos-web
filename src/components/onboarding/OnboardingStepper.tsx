"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { href: "/onboarding/connect", label: "Connect accounts" },
  { href: "/onboarding/mail", label: "Scheduled mail" },
  { href: "/onboarding/categories", label: "Inbox labels" },
  { href: "/onboarding/notetaker", label: "Meeting notes" },
];

/** Progress rail above the card: one bar per step, filled up to where you are.
 *  A horizontal rail reads at any width, so unlike the old sidebar it doesn't
 *  vanish on narrow screens — and it leaves the card centred on its own. */
export default function OnboardingStepper() {
  const pathname = usePathname();
  const found = STEPS.findIndex((s) => pathname.startsWith(s.href));
  const activeIndex = found === -1 ? 0 : found;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/35">
          Step {activeIndex + 1} of {STEPS.length}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          {STEPS[activeIndex].label}
        </span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {STEPS.map((step, i) => (
          <span key={step.href} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
            <span
              className={`block h-full rounded-full bg-accent transition-[width] duration-500 ease-out ${
                i <= activeIndex ? "w-full" : "w-0"
              }`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
