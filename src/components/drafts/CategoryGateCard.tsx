"use client";

import Card from "@/components/ui/Card";
import type { Category } from "@/lib/categorization";

type CategoryGateCardProps = {
  categories: Category[];
  selected: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
};

/** Which categories earn an auto-draft. The gate the backend actually checks:
 *  an email is only drafted for if the category the classifier gave it is in
 *  this list. Custom categories appear here automatically. */
export default function CategoryGateCard({
  categories,
  selected,
  onChange,
  disabled,
}: CategoryGateCardProps) {
  // A category the user has disabled in Categorization can never be applied to
  // mail, so drafting for it is unreachable. Hide it rather than offer a choice
  // that silently does nothing.
  const available = categories.filter((c) => c.is_enabled);

  function toggle(key: string) {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-1 text-sm font-bold text-ink">
        Create drafts for these categories
      </div>
      <div className="mb-4 text-xs text-ink/50">
        Only mail sorted into a checked category gets a draft. To do and To
        follow up are the ones that usually need a reply.
      </div>

      <div className="space-y-1">
        {available.map((category) => {
          const checked = selected.includes(category.key);
          return (
            <label
              key={category.key}
              className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                disabled ? "cursor-not-allowed opacity-60" : "hover:bg-canvas"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(category.key)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
              />
              <span className="min-w-0 flex-1">
                <span
                  className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: category.color_bg,
                    color: category.color_text,
                  }}
                >
                  {category.display_name}
                </span>
                <span className="mt-1 block text-xs text-ink/50">
                  {category.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {selected.length === 0 && (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Pick at least one category, or no drafts will ever be created.
        </div>
      )}
    </Card>
  );
}
