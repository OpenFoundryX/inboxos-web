"use client";

import Toggle from "@/components/ui/Toggle";
import type { Category } from "@/lib/categorization";

/** One toggle per category, and it means exactly one thing: does this leave my
 *  inbox? On is "move out", off is "keep in", so flipping it moves the row to
 *  the other column. That maps straight onto `actions.archive`. */
function Row({
  category,
  onToggle,
  disabled,
}: {
  category: Category;
  onToggle: (archive: boolean) => void;
  disabled?: boolean;
}) {
  const { display_name, description, color_bg, actions } = category;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color_bg }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink">{display_name}</span>
            {!category.is_builtin && (
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                Custom
              </span>
            )}
          </div>
          <div className="text-xs text-ink/50">{description}</div>
        </div>
      </div>
      <Toggle
        checked={actions.archive}
        onChange={onToggle}
        disabled={disabled}
        label={`Move ${display_name} out of my inbox`}
      />
    </div>
  );
}

function Column({
  title,
  categories,
  emptyText,
  onToggle,
  disabled,
}: {
  title: string;
  categories: Category[];
  emptyText: string;
  onToggle: (key: string, archive: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5">
      <div className="border-b border-black/5 bg-cream px-4 py-3 text-sm font-semibold text-ink">
        {title}
      </div>
      <div className="divide-y divide-black/5 bg-card">
        {categories.length === 0 ? (
          <div className="px-4 py-6 text-xs text-ink/40">{emptyText}</div>
        ) : (
          categories.map((c) => (
            <Row
              key={c.key}
              category={c}
              disabled={disabled}
              onToggle={(archive) => onToggle(c.key, archive)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function CategoryColumns({
  categories,
  onPatch,
  disabled,
}: {
  categories: Category[];
  onPatch: (key: string, patch: Partial<Category>) => void;
  disabled?: boolean;
}) {
  function toggle(key: string, archive: boolean) {
    const current = categories.find((c) => c.key === key);
    if (!current) return;
    onPatch(key, { actions: { ...current.actions, archive } });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Column
        title="Move these out of my Inbox"
        categories={categories.filter((c) => c.actions.archive)}
        emptyText="Nothing is being moved out yet."
        onToggle={toggle}
        disabled={disabled}
      />
      <Column
        title="Keep these in my Inbox"
        categories={categories.filter((c) => !c.actions.archive)}
        emptyText="Everything is being moved out."
        onToggle={toggle}
        disabled={disabled}
      />
    </div>
  );
}
