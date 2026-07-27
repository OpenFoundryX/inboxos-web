"use client";

import { useCallback, useEffect, useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import Toast, { type ToastMessage, type ToastVariant } from "@/components/ui/Toast";
import CategoryColumns from "@/components/categorization/CategoryColumns";
import CustomCategoryCard from "@/components/categorization/CustomCategoryCard";
import RulesCard from "@/components/categorization/RulesCard";
import TuningCard from "@/components/categorization/TuningCard";
import { backendConfigured } from "@/lib/session";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  createCategory,
  createRule,
  deleteCategory,
  deleteRule,
  getSettings,
  listCategories,
  listRules,
  reclassify,
  reorderRules,
  updateCategory,
  updateRule,
  updateSettings,
  type CategorizationSettings,
  type Category,
  type CategoryCreate,
  type Rule,
  type RuleCreate,
} from "@/lib/categorization";

const GENERAL = "General";
const ADVANCED = "Advanced";

export default function CategorizationPage() {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState(GENERAL);

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [rules, setRules] = useState<Rule[]>([]);
  const [settings, setSettings] = useState<CategorizationSettings>(DEFAULT_SETTINGS);

  // Categories and settings are edit-then-save; only the keys actually touched
  // get PATCHed, so an untouched taxonomy costs no requests.
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  // Rules and custom categories apply immediately; this blocks double-submits.
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, variant: ToastVariant = "success") => {
    setToast({ id: Date.now(), text, variant });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  const fail = useCallback(
    (err: unknown, fallback: string) =>
      notify(err instanceof Error ? err.message : fallback, "error"),
    [notify],
  );

  useEffect(() => {
    if (!configured) return;
    let active = true;
    (async () => {
      try {
        const [c, r, s] = await Promise.all([
          listCategories(),
          listRules(),
          getSettings(),
        ]);
        if (!active) return;
        setCategories(c);
        setRules(r);
        setSettings(s);
        setConnected(true);
      } catch {
        if (active) setConnected(false);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [configured]);

  const dirty = dirtyKeys.size > 0 || settingsDirty;
  const readOnly = !connected && configured;

  function patchCategory(key: string, patch: Partial<Category>) {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    );
    setDirtyKeys((prev) => new Set(prev).add(key));
  }

  function patchSettings(patch: Partial<CategorizationSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
    setSettingsDirty(true);
  }

  async function save() {
    if (!connected || !dirty) return;
    setSaving(true);
    try {
      const touched = categories.filter((c) => dirtyKeys.has(c.key));
      const updated = await Promise.all(
        touched.map((c) =>
          updateCategory(c.key, {
            is_enabled: c.is_enabled,
            actions: c.actions,
          }),
        ),
      );
      // Trust the server's copy — it merges partial actions and may normalise.
      if (updated.length) {
        const byKey = new Map(updated.map((c) => [c.key, c]));
        setCategories((prev) => prev.map((c) => byKey.get(c.key) ?? c));
      }

      if (settingsDirty) {
        setSettings(
          await updateSettings({
            is_enabled: settings.is_enabled,
            fallback_category_key: settings.fallback_category_key,
            confidence_threshold: settings.confidence_threshold,
            model: settings.model,
            extra_instructions: settings.extra_instructions,
          }),
        );
      }

      setDirtyKeys(new Set());
      setSettingsDirty(false);
      notify("Preferences updated");
    } catch (err) {
      fail(err, "Could not save your preferences");
    } finally {
      setSaving(false);
    }
  }

  /** Wraps an immediate action: blocks re-entry, refreshes state, reports errors. */
  async function run(fn: () => Promise<void>, errorText: string) {
    if (!connected || busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      fail(err, errorText);
    } finally {
      setBusy(false);
    }
  }

  const addCategory = (body: CategoryCreate) =>
    run(async () => {
      const created = await createCategory(body);
      setCategories((prev) => [...prev, created]);
      notify(`Created ${created.display_name}`);
    }, "Could not create that category");

  const removeCategory = (key: string) =>
    run(async () => {
      await deleteCategory(key);
      setCategories((prev) => prev.filter((c) => c.key !== key));
      // Deleting a category also drops rules pointing at it, server-side.
      setRules(await listRules());
      setSettings((s) =>
        s.fallback_category_key === key ? { ...s, fallback_category_key: null } : s,
      );
      notify("Category deleted");
    }, "Could not delete that category");

  const addRule = (body: RuleCreate) =>
    run(async () => {
      const created = await createRule(body);
      setRules((prev) => [...prev, created]);
      notify("Rule added");
    }, "Could not add that rule");

  const toggleRule = (id: string, patch: { is_enabled: boolean }) =>
    run(async () => {
      const updated = await updateRule(id, patch);
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }, "Could not update that rule");

  const removeRule = (id: string) =>
    run(async () => {
      await deleteRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      notify("Rule deleted");
    }, "Could not delete that rule");

  const applyOrder = (ids: string[]) =>
    run(async () => {
      setRules(await reorderRules(ids));
    }, "Could not reorder your rules");

  const runReclassify = () =>
    run(async () => {
      await reclassify(7);
      notify("Re-classifying your recent mail — this runs in the background");
    }, "Could not start re-classification");

  if (loading) {
    return (
      <>
        <Topbar title="Categorization" />
        <div className="p-8 text-sm text-ink/50">Loading…</div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Categorization">
        <Button
          variant="dark"
          disabled={!dirty || saving || readOnly}
          onClick={save}
        >
          {saving ? "Saving…" : "Update preferences"}
        </Button>
      </Topbar>

      <div className="p-8">
        {readOnly && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Can&apos;t reach the server, so nothing here will save. Showing defaults.
          </div>
        )}

        <Tabs
          tabs={[GENERAL, ADVANCED]}
          active={tab}
          onChange={setTab}
          className="mb-8"
        />

        {tab === GENERAL ? (
          <div className="space-y-8">
            <CategoryColumns
              categories={categories}
              onPatch={patchCategory}
              disabled={readOnly}
            />

            <Card className="p-5 lg:max-w-[calc(50%-0.75rem)]">
              <div className="mb-1 text-sm font-bold text-ink">
                Re-sort my recent mail
              </div>
              <div className="mb-4 text-xs text-ink/50">
                Applies your current setup to the last 7 days. Mail already sorted
                is left alone, so this is safe to run more than once.
              </div>
              <Button
                variant="outline"
                onClick={runReclassify}
                disabled={busy || readOnly || !settings.is_enabled}
              >
                Re-sort last 7 days
              </Button>
              {!settings.is_enabled && (
                <div className="mt-2 text-xs text-ink/40">
                  Turn categorization on in Advanced first.
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">
                    Enable categorization
                  </div>
                  <div className="text-xs text-ink/50">
                    Turn categorization on or off globally.
                  </div>
                </div>
                <Toggle
                  checked={settings.is_enabled}
                  disabled={readOnly}
                  onChange={(v) => patchSettings({ is_enabled: v })}
                />
              </div>
            </Card>

            <CustomCategoryCard
              categories={categories}
              onCreate={addCategory}
              onDelete={removeCategory}
              busy={busy || readOnly}
            />

            <RulesCard
              rules={rules}
              categories={categories}
              onCreate={addRule}
              onUpdate={toggleRule}
              onDelete={removeRule}
              onReorder={applyOrder}
              busy={busy || readOnly}
            />

            <TuningCard
              settings={settings}
              categories={categories}
              onPatch={patchSettings}
              disabled={readOnly}
            />
          </div>
        )}
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
