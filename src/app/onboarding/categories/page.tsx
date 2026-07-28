"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepShell from "@/components/onboarding/StepShell";
import { backendConfigured } from "@/lib/session";
import {
  getSettings,
  listCategories,
  updateCategory,
  updateSettings,
  type Category,
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

/** The saved state read back as one of our three answers. `is_enabled: false` is
 *  "none"; otherwise the archive flag on `marketing` is the only thing that
 *  distinguishes "attention" from "all", since both enable all six labels. */
function choiceFrom(isEnabled: boolean, categories: Category[]): Choice {
  if (!isEnabled) return "none";
  const marketing = categories.find((c) => c.key === "marketing");
  if (!marketing) return "attention";
  return marketing.actions?.archive ? "attention" : "all";
}

export default function CategoriesStep() {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>("attention");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from what is actually saved so a resumed wizard cannot silently
  // re-answer for the user. Both reads are needed: settings carries "none", the
  // taxonomy carries the attention/all distinction. A failed fetch keeps the
  // defaults — not worth an error card here.
  useEffect(() => {
    if (!backendConfigured()) return;
    let active = true;
    Promise.all([getSettings(), listCategories()])
      .then(([s, categories]) => {
        if (!active) return;
        setChoice(choiceFrom(s.is_enabled, categories));
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
      const updates = categoryUpdates(choice);
      if (backendConfigured()) {
        await updateSettings({ is_enabled: choice !== "none" });
        if (updates.length > 0) {
          // Seed the taxonomy first, in one request. GET /categories creates the
          // six builtins on first call; the PATCHes below would otherwise each
          // seed concurrently in their own session and five of the six would
          // lose the unique-key race. The prefill above usually got here first —
          // this is the guard for the user who clicks Continue before it lands,
          // or whose prefill fetch failed.
          await listCategories();
          await Promise.all(updates.map(({ key, body }) => updateCategory(key, body)));
        }
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
