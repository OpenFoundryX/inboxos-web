"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { PlusIcon, TrashIcon } from "@/components/app/icons";
import {
  BODY_KEYWORD_NOTE,
  MATCH_TYPES,
  MATCH_TYPE_LABELS,
  type Category,
  type MatchType,
  type Rule,
  type RuleAction,
  type RuleCreate,
} from "@/lib/categorization";

const PLACEHOLDERS: Record<MatchType, string> = {
  sender_address: "bo@acme.com",
  sender_domain: "@acme.com",
  subject_keyword: "invoice",
  body_keyword: "unsubscribe",
};

export default function RulesCard({
  rules,
  categories,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  busy,
}: {
  rules: Rule[];
  categories: Category[];
  onCreate: (body: RuleCreate) => Promise<void>;
  onUpdate: (id: string, patch: { is_enabled: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (ids: string[]) => Promise<void>;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [matchType, setMatchType] = useState<MatchType>("sender_domain");
  const [matchValue, setMatchValue] = useState("");
  const [action, setAction] = useState<RuleAction>("assign");
  const [categoryKey, setCategoryKey] = useState(categories[0]?.key ?? "");

  const canSubmit =
    matchValue.trim().length > 0 &&
    (action === "exclude" || categoryKey.length > 0) &&
    !busy;

  function reset() {
    setMatchValue("");
    setAction("assign");
    setOpen(false);
  }

  async function submit() {
    if (!canSubmit) return;
    await onCreate({
      match_type: matchType,
      match_value: matchValue.trim(),
      action,
      category_key: action === "assign" ? categoryKey : null,
    });
    reset();
  }

  /** Reorder is a whole-list PUT, so build the full id array with one pair swapped. */
  function move(index: number, delta: number) {
    const next = [...rules];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void onReorder(next.map((r) => r.id));
  }

  const nameFor = (key: string | null) =>
    categories.find((c) => c.key === key)?.display_name ?? key ?? "—";

  return (
    <Card className="p-5">
      <div className="mb-1 text-sm font-bold text-ink">Rules</div>
      <div className="mb-4 text-xs text-ink/50">
        Checked in order, top first — the first match wins and the classifier is
        skipped entirely for that email.
      </div>

      {rules.length > 0 && (
        <div className="mb-4 space-y-2">
          {rules.map((rule, i) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 rounded-xl border border-black/5 p-3"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={busy || i === 0}
                  aria-label="Move rule up"
                  className="px-1 text-xs leading-none text-ink/40 hover:text-ink disabled:opacity-25"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={busy || i === rules.length - 1}
                  aria-label="Move rule down"
                  className="px-1 text-xs leading-none text-ink/40 hover:text-ink disabled:opacity-25"
                >
                  ▼
                </button>
              </div>

              <div className="min-w-0 flex-1 text-sm">
                <span className="text-ink/50">{MATCH_TYPE_LABELS[rule.match_type]}</span>{" "}
                <span className="font-medium text-ink">{rule.match_value}</span>
                <span className="text-ink/50">
                  {rule.action === "exclude"
                    ? " → never categorise"
                    : ` → ${nameFor(rule.category_key)}`}
                </span>
              </div>

              <Toggle
                checked={rule.is_enabled}
                onChange={(v) => void onUpdate(rule.id, { is_enabled: v })}
                disabled={busy}
                label="Enable rule"
              />
              <button
                type="button"
                onClick={() => void onDelete(rule.id)}
                disabled={busy}
                aria-label="Delete rule"
                className="rounded-lg p-2 text-ink/40 hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="space-y-3 rounded-xl border border-black/5 p-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as MatchType)}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
            >
              {MATCH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MATCH_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <input
              value={matchValue}
              onChange={(e) => setMatchValue(e.target.value)}
              placeholder={PLACEHOLDERS[matchType]}
              maxLength={320}
              className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
            />
          </div>

          {matchType === "body_keyword" && (
            <div className="text-xs text-ink/40">{BODY_KEYWORD_NOTE}</div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as RuleAction)}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
            >
              <option value="assign">Put in category</option>
              <option value="exclude">Never categorise</option>
            </select>
            {action === "assign" && (
              <select
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.display_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="dark" onClick={submit} disabled={!canSubmit}>
              Add rule
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={busy}
          className="flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Add email, domain, or subject
        </button>
      )}
    </Card>
  );
}
