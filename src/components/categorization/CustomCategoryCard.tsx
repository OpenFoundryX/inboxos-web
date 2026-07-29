"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PlusIcon, TrashIcon } from "@/components/app/icons";
import {
  LABEL_COLORS,
  textForLabelBg,
  type Category,
  type CategoryCreate,
} from "@/lib/categorization";

const PRESET_COLORS = LABEL_COLORS.map((c) => c.bg);

export default function CustomCategoryCard({
  categories,
  onCreate,
  onDelete,
  busy,
}: {
  categories: Category[];
  onCreate: (body: CategoryCreate) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[4]);

  const custom = categories.filter((c) => !c.is_builtin);
  const canSubmit = name.trim().length > 0 && description.trim().length > 0 && !busy;

  function reset() {
    setName("");
    setDescription("");
    setColor(PRESET_COLORS[4]);
    setOpen(false);
  }

  async function submit() {
    if (!canSubmit) return;
    await onCreate({
      display_name: name.trim(),
      description: description.trim(),
      color_bg: color,
      color_text: textForLabelBg(color),
    });
    reset();
  }

  return (
    <Card className="p-5">
      <div className="mb-1 text-sm font-bold text-ink">Your own categories</div>
      <div className="mb-4 text-xs text-ink/50">
        Each one becomes a Gmail label. The description is what the classifier reads
        to decide what belongs here, so be specific.
      </div>

      {custom.length > 0 && (
        <div className="mb-4 space-y-2">
          {custom.map((c) => (
            <div
              key={c.key}
              className="flex items-center justify-between rounded-xl border border-black/5 p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: c.color_bg,
                    boxShadow: `inset 0 0 0 1px ${c.color_text}`,
                  }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{c.display_name}</div>
                  <div className="truncate text-xs text-ink/50">{c.description}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(c.key)}
                disabled={busy}
                aria-label={`Delete ${c.display_name}`}
                className="shrink-0 rounded-lg p-2 text-ink/40 hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="space-y-3 rounded-xl border border-black/5 p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name, e.g. Client work"
            maxLength={64}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="When should mail land here? e.g. Anything from a paying client."
            rows={2}
            className="w-full resize-none rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/50">Colour</span>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Colour ${c}`}
                className={`h-5 w-5 rounded-full transition-transform ${
                  color === c ? "scale-110 ring-2 ring-ink/30 ring-offset-1" : ""
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow: `inset 0 0 0 1px ${textForLabelBg(c)}`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="dark" onClick={submit} disabled={!canSubmit}>
              Create category
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
          Add a category
        </button>
      )}
    </Card>
  );
}
