"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RadioGroup from "@/components/ui/RadioGroup";
import StepShell from "@/components/onboarding/StepShell";
import { backendConfigured } from "@/lib/session";
import { BATCHING_CHOICE_KEY } from "@/lib/onboarding";
import { getSettings, updateSettings, type SettingsUpdate } from "@/lib/mailman";

type Choice = "times" | "interval" | "live";

const OPTIONS: { value: Choice; label: string; description?: string }[] = [
  {
    value: "times",
    label: "A few times a day",
    description: "Mail is held and delivered in three batches.",
  },
  {
    value: "interval",
    label: "Every 2 hours",
    description: "A steadier drip through your working day.",
  },
  {
    value: "live",
    label: "Keep mail arriving live",
    description: "No batching. Mail lands the moment it is sent.",
  },
];

/** The browser's zone beats the backend's UTC default — delivery slots are only
 *  meaningful in the user's own day. */
const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

function payloadFor(choice: Choice): SettingsUpdate | null {
  if (choice === "times") {
    return { delivery_mode: "times", times_per_day: 3, timezone: browserTimezone() };
  }
  if (choice === "interval") {
    return { delivery_mode: "interval", interval_hours: 2, timezone: browserTimezone() };
  }
  return null;
}

export default function MailStep() {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>("times");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from whatever is already saved so a resumed wizard shows the real
  // state. A failed fetch is not worth an error here — the defaults are fine.
  //
  // The stored answer wins over the settings row, because "live" writes nothing:
  // its delivery_mode is whatever was there before, so settings alone can never
  // reproduce that choice.
  useEffect(() => {
    const stored = window.localStorage.getItem(BATCHING_CHOICE_KEY);
    if (stored === "times" || stored === "interval" || stored === "live") {
      setChoice(stored);
      return;
    }
    if (!backendConfigured()) return;
    let active = true;
    getSettings()
      .then((s) => {
        if (!active) return;
        setChoice(s.delivery_mode === "interval" ? "interval" : "times");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const next = () => router.push("/onboarding/categories");

  async function onContinue() {
    setBusy(true);
    setError(null);
    try {
      const payload = payloadFor(choice);
      if (payload && backendConfigured()) {
        await updateSettings(payload);
      }
      window.localStorage.setItem(BATCHING_CHOICE_KEY, choice);
      next();
    } catch {
      setError("Couldn't save your delivery schedule. Try again.");
      setBusy(false);
    }
  }

  function onSkip() {
    window.localStorage.setItem(BATCHING_CHOICE_KEY, "live");
    next();
  }

  return (
    <StepShell
      title="When should we deliver your email?"
      blurb="InboxOS holds new mail and hands it to you in batches, so you read email when you choose to instead of the moment it arrives. Anyone on your VIP list always comes straight through."
      error={error}
      busy={busy}
      onContinue={onContinue}
      onSkip={onSkip}
    >
      <RadioGroup options={OPTIONS} value={choice} onChange={(v) => setChoice(v as Choice)} />
    </StepShell>
  );
}
