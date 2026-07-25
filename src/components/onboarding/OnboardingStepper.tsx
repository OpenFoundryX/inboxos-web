"use client";

import { usePathname } from "next/navigation";
import { CheckIcon } from "@/components/app/icons";

const STEPS = [
  { href: "/onboarding/calendar", label: "Connect calendar" },
  { href: "/onboarding/inbox", label: "Inbox setup" },
  { href: "/onboarding/notes", label: "Meeting notes" },
];

export default function OnboardingStepper() {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((s) => pathname.startsWith(s.href));

  return (
    <ol className="space-y-1">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={step.href} className="flex items-center gap-3 py-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-accent text-white"
                  : active
                    ? "border-2 border-accent text-accent"
                    : "border-2 border-ink/15 text-ink/30"
              }`}
            >
              {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={`text-sm font-medium ${
                active ? "text-ink" : done ? "text-ink/60" : "text-ink/30"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
