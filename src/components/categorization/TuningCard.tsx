"use client";

import Card from "@/components/ui/Card";
import {
  CLASSIFIER_MODELS,
  type Category,
  type CategorizationSettings,
} from "@/lib/categorization";

export default function TuningCard({
  settings,
  categories,
  onPatch,
  disabled,
}: {
  settings: CategorizationSettings;
  categories: Category[];
  onPatch: (patch: Partial<CategorizationSettings>) => void;
  disabled?: boolean;
}) {
  const pct = Math.round(settings.confidence_threshold * 100);

  return (
    <Card className="p-5">
      <div className="mb-1 text-sm font-bold text-ink">Classifier</div>
      <div className="mb-5 text-xs text-ink/50">
        How the classifier behaves when it isn&apos;t sure, and what it knows about you.
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="fallback"
            className="mb-1.5 block text-xs font-semibold text-ink/60"
          >
            When it can&apos;t decide
          </label>
          <select
            id="fallback"
            value={settings.fallback_category_key ?? ""}
            disabled={disabled}
            onChange={(e) =>
              onPatch({ fallback_category_key: e.target.value || null })
            }
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30 disabled:opacity-50"
          >
            <option value="">Leave the email unlabelled</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                Put it in {c.display_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="threshold"
            className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink/60"
          >
            <span>Confidence needed</span>
            <span className="font-normal text-ink/40">
              {pct === 0 ? "Always accept" : `${pct}%`}
            </span>
          </label>
          <input
            id="threshold"
            type="range"
            min={0}
            max={100}
            step={5}
            value={pct}
            disabled={disabled}
            onChange={(e) =>
              onPatch({ confidence_threshold: Number(e.target.value) / 100 })
            }
            className="w-full accent-accent disabled:opacity-50"
          />
          <div className="mt-1 text-xs text-ink/40">
            Below this, the email goes to your fallback choice instead.
          </div>
        </div>

        <div>
          <label
            htmlFor="model"
            className="mb-1.5 block text-xs font-semibold text-ink/60"
          >
            Model
          </label>
          <select
            id="model"
            value={settings.model ?? ""}
            disabled={disabled}
            onChange={(e) => onPatch({ model: e.target.value || null })}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30 disabled:opacity-50"
          >
            <option value="">Default</option>
            {CLASSIFIER_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="instructions"
            className="mb-1.5 block text-xs font-semibold text-ink/60"
          >
            Anything else it should know
          </label>
          <textarea
            id="instructions"
            value={settings.extra_instructions ?? ""}
            disabled={disabled}
            maxLength={2000}
            rows={3}
            placeholder="I'm a freelance designer — treat proposals and briefs as To do."
            onChange={(e) =>
              onPatch({ extra_instructions: e.target.value || null })
            }
            className="w-full resize-none rounded-lg border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink/30 disabled:opacity-50"
          />
        </div>
      </div>
    </Card>
  );
}
