"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const OPTIONS = [
  {
    id: "attention",
    title: "Only what needs my attention",
    subtitle: "Your inbox shows what's important.",
    tags: ["To respond", "FYI"],
  },
  {
    id: "all",
    title: "All my emails",
    subtitle: "Your inbox shows everything but marketing.",
    tags: ["To respond", "FYI", "Comment", "Notification"],
  },
  {
    id: "none",
    title: "Don't label my emails",
    subtitle: "Keep your inbox exactly as it is.",
    tags: [],
  },
];

export default function InboxStep() {
  const router = useRouter();
  const [selected, setSelected] = useState("attention");

  function finish() {
    window.localStorage.setItem("inboxos_inbox_pref", selected);
    router.push("/onboarding/notes");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Choose what stays in your inbox</h1>
        <p className="mt-4 text-sm text-ink/60">
          InboxOS labels the emails you tell it to and moves them out of your inbox. You can change
          this anytime from your dashboard.
        </p>
      </div>
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const active = opt.id === selected;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
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
        <Button variant="dark" onClick={finish} className="w-full">
          Start organizing my inbox
        </Button>
      </div>
    </div>
  );
}
