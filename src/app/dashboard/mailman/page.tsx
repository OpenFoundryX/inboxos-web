"use client";

import { useCallback, useEffect, useState } from "react";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Toast, { type ToastMessage, type ToastVariant } from "@/components/ui/Toast";
import StatusBar from "@/components/mailman/StatusBar";
import DeliveryScheduleCard from "@/components/mailman/DeliveryScheduleCard";
import DndCard from "@/components/mailman/DndCard";
import VipCard from "@/components/mailman/VipCard";
import { backendConfigured } from "@/lib/session";
import {
  DEFAULT_SETTINGS,
  DEFAULT_VIP,
  getSettings,
  getVip,
  updateSettings,
  updateVip,
  startBatching,
  stopBatching,
  type MailmanSettings,
  type Vip,
} from "@/lib/mailman";

const SCHEDULE_TAB = "Schedule";
const VIP_TAB = "VIP list";

export default function MailmanPage() {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState<MailmanSettings>(DEFAULT_SETTINGS);
  const [vip, setVip] = useState<Vip>(DEFAULT_VIP);
  const [tab, setTab] = useState(SCHEDULE_TAB);
  // Tracked per tab: schedule and VIP now save independently, and saving the
  // VIP list is far more expensive (it rebuilds the server-side Gmail filter).
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [vipDirty, setVipDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, variant: ToastVariant = "success") => {
    // Date.now() as the id so saving twice in a row replays the animation.
    setToast({ id: Date.now(), text, variant });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    (async () => {
      try {
        const [s, v] = await Promise.all([getSettings(), getVip()]);
        if (!active) return;
        setSettings(s);
        setVip(v);
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

  function patchSettings(patch: Partial<MailmanSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
    setSettingsDirty(true);
  }

  function patchVip(patch: Partial<Vip>) {
    setVip((v) => ({ ...v, ...patch }));
    setVipDirty(true);
  }

  async function toggleActive(next: boolean) {
    if (!connected) {
      setSettings((s) => ({ ...s, is_active: next }));
      return;
    }
    try {
      setSettings(next ? await startBatching() : await stopBatching());
      notify(next ? "Batching on" : "Batching off");
    } catch {
      notify("Couldn't update batching — check the backend.", "error");
    }
  }

  async function saveSettings() {
    if (!connected) return;
    setSaving(true);
    try {
      setSettings(
        await updateSettings({
          timezone: settings.timezone,
          delivery_mode: settings.delivery_mode,
          interval_hours: settings.interval_hours,
          interval_minutes: settings.interval_minutes,
          times_per_day: settings.times_per_day,
          custom_times: settings.custom_times,
          active_window_start: settings.active_window_start,
          active_window_end: settings.active_window_end,
          dnd_enabled: settings.dnd_enabled,
          dnd_start: settings.dnd_start,
          dnd_end: settings.dnd_end,
        }),
      );
      setSettingsDirty(false);
      notify("Schedule saved");
    } catch {
      notify("Couldn't save your schedule — check the backend.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveVip() {
    if (!connected) return;
    setSaving(true);
    try {
      setVip(await updateVip(vip));
      setVipDirty(false);
      notify("VIP list saved — Gmail filter updated");
    } catch {
      notify("Couldn't save your VIP list — check the backend.", "error");
    } finally {
      setSaving(false);
    }
  }

  const onVipTab = tab === VIP_TAB;
  const activeDirty = onVipTab ? vipDirty : settingsDirty;
  const otherTabDirty = onVipTab ? settingsDirty : vipDirty;
  const controlsDisabled = configured && !connected;

  return (
    <>
      <Topbar title="Mailman">
        <Button
          variant="dark"
          disabled={!activeDirty || saving || !connected}
          onClick={onVipTab ? saveVip : saveSettings}
        >
          {saving ? "Saving…" : onVipTab ? "Save VIP list" : "Save changes"}
        </Button>
      </Topbar>
      <div className="p-8">
        <PageHeader
          title="Batched delivery"
          subtitle="Hold incoming mail and deliver it on your schedule — with VIPs breaking through."
        />

        {!configured ? (
          <Card className="mb-6 p-4 text-sm text-ink/60">
            Not connected to the InboxOS backend. Set{" "}
            <code className="text-ink">NEXT_PUBLIC_API_URL</code> to manage batched delivery.
            Showing default preferences.
          </Card>
        ) : loading ? (
          <Card className="mb-6 p-4 text-sm text-ink/50">Loading your settings…</Card>
        ) : !connected ? (
          <Card className="mb-6 p-4 text-sm text-ink/60">
            Couldn&apos;t reach the InboxOS backend. Sign in and make sure it&apos;s running.
          </Card>
        ) : null}

        <div className="space-y-6">
          <StatusBar
            active={settings.is_active}
            lastDeliveryAt={settings.last_delivery_at}
            disabled={controlsDisabled}
            onToggle={toggleActive}
          />

          <Tabs tabs={[SCHEDULE_TAB, VIP_TAB]} active={tab} onChange={setTab} />

          {otherTabDirty ? (
            <Card className="p-3 text-xs text-ink/50">
              You have unsaved changes on the{" "}
              <span className="font-semibold text-ink/70">{onVipTab ? SCHEDULE_TAB : VIP_TAB}</span>{" "}
              tab. Switch back to save them.
            </Card>
          ) : null}

          {onVipTab ? (
            <VipCard vip={vip} disabled={controlsDisabled} onChange={patchVip} />
          ) : (
            <>
              <DeliveryScheduleCard settings={settings} disabled={controlsDisabled} onChange={patchSettings} />
              <DndCard settings={settings} disabled={controlsDisabled} onChange={patchSettings} />
            </>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
