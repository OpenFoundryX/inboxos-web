"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RadioGroup from "@/components/ui/RadioGroup";
import StepShell from "@/components/onboarding/StepShell";
import Orbit from "@/components/onboarding/Orbit";
import { BATCHING_CHOICE_KEY, finishOnboarding } from "@/lib/onboarding";
import { backendConfigured } from "@/lib/session";
import { getNotetakerSettings, updateNotetakerSettings } from "@/lib/meetings";

type Choice = "ask" | "auto" | "off";

const OPTIONS = [
  {
    value: "ask",
    label: "Only when I ask",
    description: "Send the bot into a call from your dashboard, one meeting at a time.",
  },
  {
    value: "auto",
    label: "Join every meeting automatically",
    description: "The bot joins calendar meetings with two or more attendees.",
  },
  { value: "off", label: "No thanks", description: "No bot, no meeting notes." },
];

const SETTINGS: Record<Choice, { enabled: boolean; auto_join: boolean }> = {
  ask: { enabled: true, auto_join: false },
  auto: { enabled: true, auto_join: true },
  off: { enabled: false, auto_join: false },
};

export default function NotetakerStep() {
  const router = useRouter();
  // "ask" by default, never "auto": recording other people is the user's call to
  // make deliberately, not something onboarding switches on for them.
  const [choice, setChoice] = useState<Choice>("ask");
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!backendConfigured()) return;
    let active = true;
    getNotetakerSettings()
      .then((s) => {
        if (!active) return;
        setChoice(!s.enabled ? "off" : s.auto_join ? "auto" : "ask");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function finish(save: boolean) {
    setBusy(true);
    setError(null);
    try {
      if (save && backendConfigured()) {
        await updateNotetakerSettings(SETTINGS[choice]);
      }
      setApplying(true);
      const activateBatching =
        window.localStorage.getItem(BATCHING_CHOICE_KEY) !== null &&
        window.localStorage.getItem(BATCHING_CHOICE_KEY) !== "live";
      await finishOnboarding(activateBatching);
      router.replace("/dashboard");
    } catch {
      // finishOnboarding only throws when completeOnboarding failed — the one
      // call that must land, or the user re-enters the wizard on next login.
      setApplying(false);
      setError("Couldn't finish setting up your account. Try again.");
      setBusy(false);
    }
  }

  if (applying) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
        <Orbit />
        <p className="text-lg font-semibold text-ink">Setting up your workspace…</p>
      </div>
    );
  }

  return (
    <StepShell
      title="Should we join your meetings?"
      blurb="A notetaker bot joins your calls, records them, and turns each one into a summary email with action items. Everyone on the call sees it join."
      error={error}
      busy={busy}
      continueLabel="Finish setup"
      onContinue={() => finish(true)}
      onSkip={() => finish(false)}
    >
      <RadioGroup options={OPTIONS} value={choice} onChange={(v) => setChoice(v as Choice)} />
    </StepShell>
  );
}
