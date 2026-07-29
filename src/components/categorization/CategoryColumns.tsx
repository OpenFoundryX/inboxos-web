"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import type { Category } from "@/lib/categorization";

/** Must match the animation durations in globals.css. */
const LEAVE_MS = 200;
const ENTER_MS = 260;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** One toggle per category, and it means exactly one thing: does this leave my
 *  inbox? On is "move out", off is "keep in", so flipping it moves the row to
 *  the other column. That maps straight onto `actions.archive`. */
function Row({
  category,
  onToggle,
  disabled,
  animation,
}: {
  category: Category;
  onToggle: (archive: boolean) => void;
  disabled?: boolean;
  animation?: string;
}) {
  const { display_name, description, color_bg, color_text, actions } = category;
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3.5 ${animation ?? ""}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {/* The label colours are pastels so they sit quietly in Gmail, which
            leaves them near-invisible on white here — the ring in the paired
            text colour gives the dot its edge back. */}
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: color_bg,
            boxShadow: `inset 0 0 0 1px ${color_text}`,
          }}
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
  animationFor,
}: {
  title: string;
  categories: Category[];
  emptyText: string;
  onToggle: (key: string, archive: boolean) => void;
  disabled?: boolean;
  animationFor: (key: string) => string | undefined;
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
              animation={animationFor(c.key)}
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
  // The row being animated out of its current column, and where it is headed.
  const [leaving, setLeaving] = useState<{ key: string; toArchive: boolean } | null>(
    null,
  );
  // The row that just landed, so it can animate in on the other side.
  const [landed, setLanded] = useState<{ key: string; toArchive: boolean } | null>(
    null,
  );
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  const toggle = useCallback(
    (key: string, archive: boolean) => {
      const current = categories.find((c) => c.key === key);
      if (!current) return;
      const patch = { actions: { ...current.actions, archive } };

      // One at a time: a second flip mid-flight would leave a row stranded in
      // the wrong column, since the commit is deferred.
      if (leaving) return;

      if (prefersReducedMotion()) {
        onPatch(key, patch);
        return;
      }

      setLeaving({ key, toArchive: archive });
      timers.current.push(
        window.setTimeout(() => {
          onPatch(key, patch);
          setLeaving(null);
          setLanded({ key, toArchive: archive });
          timers.current.push(
            window.setTimeout(() => setLanded(null), ENTER_MS),
          );
        }, LEAVE_MS),
      );
    },
    [categories, leaving, onPatch],
  );

  /** Leaving "keep in" (right) heads left; leaving "move out" (left) heads
   *  right — and each row enters from the edge it crossed. */
  const animationFor = useCallback(
    (key: string): string | undefined => {
      if (leaving?.key === key) {
        return leaving.toArchive
          ? "animate-row-leave-left"
          : "animate-row-leave-right";
      }
      if (landed?.key === key) {
        return landed.toArchive
          ? "animate-row-enter-from-right"
          : "animate-row-enter-from-left";
      }
      return undefined;
    },
    [leaving, landed],
  );

  // While a row is animating out it must stay in the column it is leaving, so
  // the columns are derived from the committed state, which the patch hasn't
  // reached yet. That falls out of deferring onPatch until the timer fires.
  const movedOut = categories.filter((c) => c.actions.archive);
  const keptIn = categories.filter((c) => !c.actions.archive);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Column
        title="Move these out of my Inbox"
        categories={movedOut}
        emptyText="Nothing is being moved out yet."
        onToggle={toggle}
        disabled={disabled || leaving !== null}
        animationFor={animationFor}
      />
      <Column
        title="Keep these in my Inbox"
        categories={keptIn}
        emptyText="Everything is being moved out."
        onToggle={toggle}
        disabled={disabled || leaving !== null}
        animationFor={animationFor}
      />
    </div>
  );
}
