"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepShell from "@/components/onboarding/StepShell";
import { backendConfigured } from "@/lib/session";
import {
  getSettings,
  updateCategory,
  updateSettings,
  type CategoryUpdate,
} from "@/lib/categorization";

type Choice = "attention" | "all" | "none";

/** The six builtin keys, fixed in the backend (models/categorization.py). They
 *  name Gmail labels that already exist in users' mailboxes. */
const ATTENTION_KEEP = ["to_do", "to_follow_up", "fyi", "notification"];
const ATTENTION_ARCHIVE = ["marketing", "noise"];
const ALL_KEYS = [...ATTENTION_KEEP, ...ATTENTION_ARCHIVE];

const OPTIONS: { value: Choice; title: string; subtitle: string; tags: string[] }[] = [
  {
    value: "attention",
    title: "Only what needs my attention",
    subtitle: "Marketing and noise get labelled and archived out of your inbox.",
    tags: ["To do", "To follow up", "FYI", "Notification"],
  },
  {
    value: "all",
    title: "All my emails",
    subtitle: "Everything gets a label, nothing leaves your inbox.",
    tags: ["To do", "To follow up", "FYI", "Notification", "Marketing", "Noise"],
  },
  {
    value: "none",
    title: "Don't label my emails",
    subtitle: "Keep your inbox exactly as it is.",
    tags: [],
  },
];

/** One PATCH body per builtin category for the given choice. `archive` is what
 *  makes "only what needs my attention" true rather than just a label. */
function categoryUpdates(choice: Choice): { key: string; body: CategoryUpdate }[] {
  if (choice === "attention") {
    return [
      ...ATTENTION_KEEP.map((key) => ({
        key,
        body: { is_enabled: true, actions: { archive: false } },
      })),
      ...ATTENTION_ARCHIVE.map((key) => ({
        key,
        body: { is_enabled: true, actions: { archive: true } },
      })),
    ];
  }
  if (choice === "all") {
    return ALL_KEYS.map((key) => ({
      key,
      body: { is_enabled: true, actions: { archive: false } },
    }));
  }
  return [];
}

export default function CategoriesStep() {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>("attention");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!backendConfigured()) return;
    let active = true;
    getSettings()
      .then((s) => {
        if (!active || s.is_enabled) return;
        setChoice("none");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const next = () => router.push("/onboarding/notetaker");

  async function onContinue() {
    setBusy(true);
    setError(null);
    try {
      if (backendConfigured()) {
        await updateSettings({ is_enabled: choice !== "none" });
        await Promise.all(
          categoryUpdates(choice).map(({ key, body }) => updateCategory(key, body)),
        );
      }
      next();
    } catch {
      setError("Couldn't save your label settings. Try again.");
      setBusy(false);
    }
  }

  return (
    <StepShell
      title="Choose what stays in your inbox"
      blurb="InboxOS reads each new email, labels it, and — if you want — moves the low-value ones out of the way. It never deletes anything."
      error={error}
      busy={busy}
      onContinue={onContinue}
      onSkip={next}
    >
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const active = opt.value === choice;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setChoice(opt.value)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                active ? "border-ink bg-card" : "border-black/5 bg-card hover:border-ink/20"
              }`}
            >
              <div className="text-sm font-bold text-ink">{opt.title}</div>
              <div className="mt-0.5 text-xs text-ink/50">{opt.subtitle}</div>
              {opt.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {opt.tags.map((t) => (
                    <span key={t} className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink/60">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
