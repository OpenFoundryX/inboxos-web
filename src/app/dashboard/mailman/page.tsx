"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatusBar from "@/components/mailman/StatusBar";
import DeliveryScheduleCard from "@/components/mailman/DeliveryScheduleCard";
import DndCard from "@/components/mailman/DndCard";
import VipCard from "@/components/mailman/VipCard";
import HeldMailCard from "@/components/mailman/HeldMailCard";
import { backendConfigured } from "@/lib/session";
import {
  DEFAULT_SETTINGS,
  DEFAULT_VIP,
  getSettings,
  getStatus,
  getVip,
  listHeld,
  updateSettings,
  updateVip,
  startBatching,
  stopBatching,
  type HeldEmail,
  type MailmanSettings,
  type Vip,
} from "@/lib/mailman";

export default function MailmanPage() {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState<MailmanSettings>(DEFAULT_SETTINGS);
  const [vip, setVip] = useState<Vip>(DEFAULT_VIP);
  const [held, setHeld] = useState<HeldEmail[]>([]);
  const [heldCount, setHeldCount] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    (async () => {
      try {
        const [s, v, st, h] = await Promise.all([getSettings(), getVip(), getStatus(), listHeld()]);
        if (!active) return;
        setSettings(s);
        setVip(v);
        setHeldCount(st.held_count);
        setHeld(h);
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
    setDirty(true);
  }

  function patchVip(patch: Partial<Vip>) {
    setVip((v) => ({ ...v, ...patch }));
    setDirty(true);
  }

  async function refreshStatus() {
    try {
      const st = await getStatus();
      setHeldCount(st.held_count);
    } catch {
      /* ignore */
    }
  }

  async function toggleActive(next: boolean) {
    if (!connected) {
      setSettings((s) => ({ ...s, is_active: next }));
      return;
    }
    try {
      setSettings(next ? await startBatching() : await stopBatching());
      await refreshStatus();
    } catch {
      setError("Couldn't update batching — check the backend.");
    }
  }

  async function save() {
    if (!connected) return;
    setSaving(true);
    setError(null);
    try {
      const [s, v] = await Promise.all([
        updateSettings({
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
        updateVip(vip),
      ]);
      setSettings(s);
      setVip(v);
      setDirty(false);
      await refreshStatus();
    } catch {
      setError("Couldn't save — check the backend.");
    } finally {
      setSaving(false);
    }
  }

  const controlsDisabled = configured && !connected;

  return (
    <>
      <Topbar title="Mailman">
        <Button variant="dark" disabled={!dirty || saving || !connected} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
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

        {error ? (
          <Card className="mb-6 border-accent/30 p-4 text-sm text-accent-dark">{error}</Card>
        ) : null}

        <div className="space-y-6">
          <StatusBar
            active={settings.is_active}
            heldCount={heldCount}
            lastDeliveryAt={settings.last_delivery_at}
            disabled={controlsDisabled}
            onToggle={toggleActive}
          />
          <DeliveryScheduleCard settings={settings} disabled={controlsDisabled} onChange={patchSettings} />
          <DndCard settings={settings} disabled={controlsDisabled} onChange={patchSettings} />
          <VipCard vip={vip} disabled={controlsDisabled} onChange={patchVip} />
          <HeldMailCard held={held} />
        </div>
      </div>
    </>
  );
}
