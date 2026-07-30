"use client";

import { useCallback, useEffect, useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import Toast, { type ToastMessage, type ToastVariant } from "@/components/ui/Toast";
import CategoryGateCard from "@/components/drafts/CategoryGateCard";
import FilePreviewModal from "@/components/drafts/FilePreviewModal";
import FilesCard from "@/components/drafts/FilesCard";
import FollowUpCard from "@/components/drafts/FollowUpCard";
import InstructionsCard from "@/components/drafts/InstructionsCard";
import SignatureCard from "@/components/drafts/SignatureCard";
import StyleCard from "@/components/drafts/StyleCard";
import { backendConfigured } from "@/lib/session";
import {
  DEFAULT_CATEGORIES,
  listCategories,
  type Category,
} from "@/lib/categorization";
import {
  DEFAULT_SETTINGS,
  deleteFile,
  getSettings,
  listFiles,
  previewFile,
  updateFile,
  updateSettings,
  uploadFile,
  type DraftFile,
  type DraftFilePreview,
  type DraftSettings,
  type FilePurpose,
} from "@/lib/drafts";

const GENERAL = "General";
const SIGNATURE = "Signature";
const FILES = "Custom Files";

export default function DraftsPage() {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState(GENERAL);

  const [settings, setSettings] = useState<DraftSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [files, setFiles] = useState<DraftFile[]>([]);

  // Settings are edit-then-save, matching the Categorization page. Files apply
  // immediately, the way rules do there.
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const [preview, setPreview] = useState<DraftFilePreview | null>(null);
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
        const [s, c, f] = await Promise.all([
          getSettings(),
          listCategories(),
          listFiles(),
        ]);
        if (!active) return;
        setSettings(s);
        setCategories(c);
        setFiles(f);
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

  const readOnly = !connected && configured;

  function patch(next: Partial<DraftSettings>) {
    setSettings((s) => ({ ...s, ...next }));
    setDirty(true);
  }

  async function save() {
    if (!connected || !dirty) return;
    setSaving(true);
    try {
      // The whole settings object, not a diff: it is one row behind one PUT, and
      // sending everything keeps this from drifting as fields are added.
      setSettings(
        await updateSettings({
          is_enabled: settings.is_enabled,
          category_keys: settings.category_keys,
          selectivity: settings.selectivity,
          tone: settings.tone,
          length: settings.length,
          custom_instructions_enabled: settings.custom_instructions_enabled,
          custom_instructions: settings.custom_instructions,
          signature_enabled: settings.signature_enabled,
          signature: settings.signature,
          follow_up_enabled: settings.follow_up_enabled,
          follow_up_days: settings.follow_up_days,
        }),
      );
      setDirty(false);
      notify("Draft preferences updated");
    } catch (err) {
      fail(err, "Could not save your preferences");
    } finally {
      setSaving(false);
    }
  }

  /** Wraps an immediate action: blocks re-entry, reports errors. */
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

  const addFile = (purpose: FilePurpose) => (file: File) =>
    run(async () => {
      const created = await uploadFile(file, purpose);
      setFiles((prev) => [created, ...prev]);
      notify(`Added ${created.filename}`);
    }, "Could not upload that file");

  const toggleFile = (id: string, isEnabled: boolean) =>
    run(async () => {
      const updated = await updateFile(id, { is_enabled: isEnabled });
      setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }, "Could not update that file");

  const removeFile = (id: string) =>
    run(async () => {
      await deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      notify("File deleted");
    }, "Could not delete that file");

  const showPreview = (id: string) =>
    run(async () => {
      setPreview(await previewFile(id));
    }, "Could not read that file");

  if (loading) {
    return (
      <>
        <Topbar title="Drafts" />
        <div className="p-8 text-sm text-ink/50">Loading…</div>
      </>
    );
  }

  const instructionFiles = files.filter((f) => f.purpose === "instruction");
  const knowledgeFiles = files.filter((f) => f.purpose === "knowledge");

  return (
    <>
      <Topbar title="Drafts">
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
            Can&apos;t reach the server, so nothing here will save. Showing
            defaults.
          </div>
        )}

        <Tabs
          tabs={[GENERAL, SIGNATURE, FILES]}
          active={tab}
          onChange={setTab}
          className="mb-8"
        />

        {tab === GENERAL && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-ink">
                    Enable draft replies
                  </div>
                  <div className="text-xs text-ink/50">
                    Writes replies into your Gmail drafts as mail arrives.
                    Nothing is ever sent for you.
                  </div>
                </div>
                <Toggle
                  checked={settings.is_enabled}
                  disabled={readOnly}
                  onChange={(v) => patch({ is_enabled: v })}
                />
              </div>
            </Card>

            <CategoryGateCard
              categories={categories}
              selected={settings.category_keys}
              onChange={(keys) => patch({ category_keys: keys })}
              disabled={readOnly}
            />

            <StyleCard
              selectivity={settings.selectivity}
              tone={settings.tone}
              length={settings.length}
              onPatch={patch}
              disabled={readOnly}
            />

            <InstructionsCard
              enabled={settings.custom_instructions_enabled}
              text={settings.custom_instructions}
              onPatch={patch}
              disabled={readOnly}
            />

            <FollowUpCard
              enabled={settings.follow_up_enabled}
              days={settings.follow_up_days}
              onPatch={patch}
              disabled={readOnly}
            />
          </div>
        )}

        {tab === SIGNATURE && (
          <div className="max-w-2xl space-y-6">
            <SignatureCard
              enabled={settings.signature_enabled}
              signature={settings.signature}
              onPatch={patch}
              disabled={readOnly}
            />
          </div>
        )}

        {tab === FILES && (
          <div className="max-w-2xl space-y-6">
            <FilesCard
              purpose="instruction"
              files={instructionFiles}
              onUpload={addFile("instruction")}
              onToggle={toggleFile}
              onDelete={removeFile}
              onPreview={showPreview}
              busy={busy || readOnly}
            />
            <FilesCard
              purpose="knowledge"
              files={knowledgeFiles}
              onUpload={addFile("knowledge")}
              onToggle={toggleFile}
              onDelete={removeFile}
              onPreview={showPreview}
              busy={busy || readOnly}
            />
          </div>
        )}

      </div>

      <FilePreviewModal preview={preview} onClose={() => setPreview(null)} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
