"use client";

import Toggle from "@/components/ui/Toggle";
import type { Category } from "@/lib/categorization";

/** The two columns are a view of one field: `actions.archive`. Archiving is
 *  what "move out of my inbox" means in Gmail, so moving a card between
 *  columns flips that flag rather than setting anything separate. */
function Row({
  category,
  onToggleEnabled,
  onToggleAction,
  onMove,
  disabled,
}: {
  category: Category;
  onToggleEnabled: (v: boolean) => void;
  onToggleAction: (action: "mark_read" | "star", v: boolean) => void;
  onMove: () => void;
  disabled?: boolean;
}) {
  const { display_name, description, color_bg, is_enabled, actions } = category;
  return (
    <div className="rounded-xl border border-black/5 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
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
          checked={is_enabled}
          onChange={onToggleEnabled}
          disabled={disabled}
          label={`Enable ${display_name}`}
        />
      </div>

      {/* Actions only matter for a category the classifier can still choose. */}
      {is_enabled && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/5 pt-3">
          <label className="flex items-center gap-1.5 text-xs text-ink/60">
            <input
              type="checkbox"
              checked={actions.mark_read}
              disabled={disabled}
              onChange={(e) => onToggleAction("mark_read", e.target.checked)}
              className="h-3.5 w-3.5 rounded border-ink/20"
            />
            Mark read
          </label>
          <label className="flex items-center gap-1.5 text-xs text-ink/60">
            <input
              type="checkbox"
              checked={actions.star}
              disabled={disabled}
              onChange={(e) => onToggleAction("star", e.target.checked)}
              className="h-3.5 w-3.5 rounded border-ink/20"
            />
            Star
          </label>
          <button
            type="button"
            onClick={onMove}
            disabled={disabled}
            className="ml-auto text-xs font-medium text-ink/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actions.archive ? "Keep in inbox →" : "← Move out of inbox"}
          </button>
        </div>
      )}
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
  const moveOut = categories.filter((c) => c.actions.archive);
  const keepIn = categories.filter((c) => !c.actions.archive);

  const render = (list: Category[], emptyText: string) =>
    list.length === 0 ? (
      <div className="rounded-xl border border-dashed border-black/10 p-4 text-xs text-ink/40">
        {emptyText}
      </div>
    ) : (
      list.map((c) => (
        <Row
          key={c.key}
          category={c}
          disabled={disabled}
          onToggleEnabled={(v) => onPatch(c.key, { is_enabled: v })}
          onToggleAction={(action, v) =>
            onPatch(c.key, { actions: { ...c.actions, [action]: v } })
          }
          onMove={() =>
            onPatch(c.key, { actions: { ...c.actions, archive: !c.actions.archive } })
          }
        />
      ))
    );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">
          Move these out of my Inbox
        </h3>
        <div className="space-y-2">
          {render(moveOut, "Nothing is archived on arrival.")}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">
          Keep these in my Inbox
        </h3>
        <div className="space-y-2">
          {render(keepIn, "Everything is archived on arrival.")}
        </div>
      </div>
    </div>
  );
}
