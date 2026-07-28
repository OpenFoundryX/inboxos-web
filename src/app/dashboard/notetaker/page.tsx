"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import Toast, { type ToastMessage, type ToastVariant } from "@/components/ui/Toast";
import MeetingList from "@/components/notetaker/MeetingList";
import NotetakerRules from "@/components/notetaker/NotetakerRules";
import { backendConfigured } from "@/lib/session";
import {
  DEFAULT_SETTINGS,
  cancelMeetingBot,
  getMeetings,
  getNotetakerSettings,
  isInFlight,
  updateNotetakerSettings,
  type MeetingRead,
  type NotetakerSettings,
} from "@/lib/meetings";

const MEETINGS_TAB = "Meetings";
const SETTINGS_TAB = "Settings";

/** How often to re-check meetings that are still moving. */
const POLL_MS = 15_000;

export default function NotetakerPage() {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState<NotetakerSettings>(DEFAULT_SETTINGS);
  const [meetings, setMeetings] = useState<MeetingRead[]>([]);
  const [tab, setTab] = useState(MEETINGS_TAB);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, variant: ToastVariant = "success") => {
    // Date.now() as the id so the same message twice replays the animation.
    setToast({ id: Date.now(), text, variant });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  const refreshMeetings = useCallback(async () => {
    try {
      setMeetings(await getMeetings());
    } catch {
      // A failed background poll shouldn't tear down a page that's already
      // showing good data — the next tick can recover.
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    (async () => {
      try {
        const [s, m] = await Promise.all([getNotetakerSettings(), getMeetings()]);
        if (!active) return;
        setSettings(s);
        setMeetings(m);
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

  /** Poll only while something can still change, and only while the tab is
   *  visible. Meetings settle within minutes of ending, so an idle page — the
   *  usual case — makes no background requests at all. */
  const anyInFlight = meetings.some(isInFlight);
  const refreshRef = useRef(refreshMeetings);
  refreshRef.current = refreshMeetings;

  useEffect(() => {
    if (!connected || !anyInFlight) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer === null) timer = setInterval(() => refreshRef.current(), POLL_MS);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        // Catch up immediately on return, then resume the cadence.
        refreshRef.current();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [connected, anyInFlight]);

  function patch(next: Partial<NotetakerSettings>) {
    setSettings((s) => ({ ...s, ...next }));
    setDirty(true);
  }

  /** The master switch writes straight through: it's a kill switch, and leaving
   *  it staged behind "Save changes" would misrepresent what's running. */
  async function toggleEnabled(next: boolean) {
    if (!connected) {
      setSettings((s) => ({ ...s, enabled: next }));
      return;
    }
    const previous = settings;
    setSettings((s) => ({ ...s, enabled: next }));
    try {
      setSettings(await updateNotetakerSettings({ enabled: next }));
      notify(next ? "Notetaker on" : "Notetaker off");
    } catch (e) {
      setSettings(previous);
      notify(e instanceof Error ? e.message : "Couldn't update the notetaker", "error");
    }
  }

  async function save() {
    if (!connected) return;
    setSaving(true);
    try {
      setSettings(
        await updateNotetakerSettings({
          auto_join: settings.auto_join,
          bot_name: settings.bot_name,
          min_attendees: settings.min_attendees,
          skip_titles: settings.skip_titles,
          lookahead_minutes: settings.lookahead_minutes,
          email_recap: settings.email_recap,
          create_reminders: settings.create_reminders,
          include_in_digest: settings.include_in_digest,
        }),
      );
      setDirty(false);
      notify("Notetaker settings saved");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Couldn't save your settings", "error");
    } finally {
      setSaving(false);
    }
  }

  async function cancelBot(meeting: MeetingRead) {
    setCancellingId(meeting.id);
    try {
      const updated = await cancelMeetingBot(meeting.id);
      setMeetings((list) => list.map((m) => (m.id === updated.id ? updated : m)));
      notify("Notetaker recalled");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Couldn't cancel the notetaker", "error");
      await refreshMeetings();
    } finally {
      setCancellingId(null);
    }
  }

  const controlsDisabled = configured && !connected;
  const onSettingsTab = tab === SETTINGS_TAB;

  return (
    <>
      <Topbar title="Notetaker">
        {onSettingsTab ? (
          <Button variant="dark" disabled={!dirty || saving || !connected} onClick={save}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        ) : null}
      </Topbar>

      <div className="p-8">
        <PageHeader
          title="Never write meeting notes again"
          subtitle="InboxOS joins your meetings and turns them into actionable notes and follow-ups."
        />

        {!configured ? (
          <Card className="mb-6 p-4 text-sm text-ink/60">
            Not connected to the InboxOS backend. Set{" "}
            <code className="text-ink">NEXT_PUBLIC_API_URL</code> to manage the notetaker. Showing
            default preferences.
          </Card>
        ) : loading ? (
          <Card className="mb-6 p-4 text-sm text-ink/50">Loading your notetaker…</Card>
        ) : !connected ? (
          <Card className="mb-6 p-4 text-sm text-ink/60">
            Couldn&apos;t reach the InboxOS backend. Sign in and make sure it&apos;s running.
          </Card>
        ) : null}

        <div className="space-y-6">
          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Toggle
                checked={settings.enabled}
                onChange={toggleEnabled}
                disabled={controlsDisabled}
                label="Notetaker enabled"
              />
              <div>
                <div className="text-sm font-bold text-ink">
                  Notetaker {settings.enabled ? "on" : "off"}
                </div>
                <div className="text-xs text-ink/50">
                  {settings.enabled
                    ? settings.auto_join
                      ? "Joining your meetings automatically."
                      : "Ready — turn it on per meeting, or switch on auto-join in Settings."
                    : "No bot will join any meeting."}
                </div>
              </div>
            </div>
          </Card>

          <Tabs tabs={[MEETINGS_TAB, SETTINGS_TAB]} active={tab} onChange={setTab} />

          {!onSettingsTab && dirty ? (
            <Card className="p-3 text-xs text-ink/50">
              You have unsaved changes on the{" "}
              <span className="font-semibold text-ink/70">{SETTINGS_TAB}</span> tab. Switch back to
              save them.
            </Card>
          ) : null}

          {onSettingsTab ? (
            <NotetakerRules settings={settings} disabled={controlsDisabled} onChange={patch} />
          ) : (
            <MeetingList
              meetings={meetings}
              loading={loading}
              cancellingId={cancellingId}
              onCancel={cancelBot}
            />
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
