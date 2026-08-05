"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import Toast, { type ToastMessage, type ToastVariant } from "@/components/ui/Toast";
import MeetingList from "@/components/notetaker/MeetingList";
import NotetakerRules from "@/components/notetaker/NotetakerRules";
import InsightsPanel from "@/components/notetaker/InsightsPanel";
import RecordMeetingMenu from "@/components/notetaker/RecordMeetingMenu";
import InviteToMeetingModal from "@/components/notetaker/InviteToMeetingModal";
import UploadRecordingModal from "@/components/notetaker/UploadRecordingModal";
import LiveRecorder from "@/components/notetaker/LiveRecorder";
import { SearchIcon, SettingsIcon } from "@/components/app/icons";
import { backendConfigured } from "@/lib/session";
import {
  DEFAULT_SETTINGS,
  cancelMeetingBot,
  getMeetings,
  getNotetakerSettings,
  isInFlight,
  isUpcoming,
  matchesQuery,
  startLiveRecording,
  updateNotetakerSettings,
  type MeetingRead,
  type NotetakerSettings,
  type UploadTarget,
} from "@/lib/meetings";

const RECORDED_TAB = "Recorded";
const UPCOMING_TAB = "Upcoming";

/** How often to re-check meetings that are still moving. */
const POLL_MS = 15_000;

const SUGGESTIONS = [
  "Show all my action items across meetings",
  "Show decisions from recent meetings",
  "Summarize meetings I haven't reviewed yet",
];

export default function NotetakerPage() {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState<NotetakerSettings>(DEFAULT_SETTINGS);
  const [meetings, setMeetings] = useState<MeetingRead[]>([]);
  const [tab, setTab] = useState(RECORDED_TAB);
  const [query, setQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  // Non-null while a browser recording is running. Holds the row and the
  // upload permission the server issued when it started, so stopping has
  // somewhere to send the audio without another round trip at the one moment
  // where a failure would lose the recording.
  const [liveTarget, setLiveTarget] = useState<UploadTarget | null>(null);
  const [startingLive, setStartingLive] = useState(false);

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

  /** Put a newly captured meeting at the top of the list without waiting for a
   *  poll. The row exists server-side either way; this is only about the page
   *  reflecting what the user just did. */
  const adopt = useCallback((meeting: MeetingRead) => {
    setMeetings((list) => [meeting, ...list.filter((m) => m.id !== meeting.id)]);
  }, []);

  async function startRecording() {
    if (liveTarget || startingLive) return;
    setStartingLive(true);
    try {
      // The row and the upload URL are claimed before the microphone is
      // touched: a permission prompt the user accepts, followed by a 402 for
      // being over quota, would be a recording with nowhere to go.
      const target = await startLiveRecording();
      setLiveTarget(target);
      adopt(target.meeting);
      // The tab shows recorded meetings — including this one, live.
      setTab(RECORDED_TAB);
      setShowSettings(false);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Couldn't start recording", "error");
    } finally {
      setStartingLive(false);
    }
  }

  const finishRecording = useCallback(
    (meeting: MeetingRead) => {
      setLiveTarget(null);
      adopt(meeting);
      notify("Recording saved — the summary will appear shortly");
    },
    [adopt, notify],
  );

  const failRecording = useCallback(
    (message: string) => {
      setLiveTarget(null);
      notify(message, "error");
      // The reserved row is now a meeting with no media. The server's janitor
      // fails it within the day; refreshing just keeps the list honest sooner.
      void refreshMeetings();
    },
    [notify, refreshMeetings],
  );

  const controlsDisabled = configured && !connected;
  const onUpcoming = tab === UPCOMING_TAB;

  const visible = useMemo(
    () =>
      meetings.filter((m) => isUpcoming(m) === onUpcoming && matchesQuery(m, query)),
    [meetings, onUpcoming, query],
  );

  const banner = !configured ? (
    <>
      Not connected to the InboxOS backend. Set{" "}
      <code className="text-ink">NEXT_PUBLIC_API_URL</code> to manage the notetaker. Showing default
      preferences.
    </>
  ) : loading ? (
    "Loading your notetaker…"
  ) : !connected ? (
    "Couldn't reach the InboxOS backend. Sign in and make sure it's running."
  ) : null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-3">
        <h1 className="text-base font-bold text-ink">Notetaker</h1>
        <div className="flex shrink-0 items-center gap-2">
          <RecordMeetingMenu
            recording={liveTarget !== null || startingLive}
            onRecordNow={startRecording}
            onInvite={() => setShowInvite(true)}
            onUpload={() => setShowUpload(true)}
          />
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Notetaker settings"
            aria-pressed={showSettings}
            className={`rounded-lg p-2 transition-colors ${
              showSettings ? "bg-ink/5 text-ink" : "text-ink/40 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
          {banner ? (
            <Card className="mb-4 p-4 text-sm text-ink/60">{banner}</Card>
          ) : null}

          {showSettings ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold tracking-tight text-ink">Notetaker settings</h2>
                <Button variant="dark" disabled={!dirty || saving || !connected} onClick={save}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>

              <Card className="flex items-center gap-3 p-5">
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
                        : "Ready — turn it on per meeting from the dashboard, or switch on auto-join below."
                      : "No bot will join any meeting."}
                  </div>
                </div>
              </Card>

              <NotetakerRules settings={settings} disabled={controlsDisabled} onChange={patch} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Tabs tabs={[RECORDED_TAB, UPCOMING_TAB]} active={tab} onChange={setTab} />
                <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-xl border border-black/5 bg-card px-3.5 py-2.5">
                  <SearchIcon className="h-4 w-4 shrink-0 text-ink/30" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for meetings"
                    className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                  />
                </label>
              </div>

              {/* The master switch lives in settings now, so being off has to
                  announce itself here — otherwise an empty list looks like a
                  bug rather than a setting. */}
              {connected && !settings.enabled ? (
                <Card className="flex flex-wrap items-center justify-between gap-3 border-accent/20 bg-accent/5 p-4">
                  <span className="text-sm text-ink/70">
                    The notetaker is off — no bot will join any meeting.
                  </span>
                  <button
                    type="button"
                    onClick={() => void toggleEnabled(true)}
                    className="text-sm font-semibold text-accent hover:underline"
                  >
                    Turn it on
                  </button>
                </Card>
              ) : null}

              {dirty ? (
                <Card className="p-3 text-xs text-ink/50">
                  You have unsaved changes in settings. Open the gear to save them.
                </Card>
              ) : null}

              <MeetingList
                meetings={visible}
                loading={loading}
                cancellingId={cancellingId}
                onCancel={cancelBot}
                order={onUpcoming ? "soonest" : "newest"}
                emptyMessage={
                  query.trim()
                    ? `No ${onUpcoming ? "upcoming" : "recorded"} meetings match "${query.trim()}".`
                    : onUpcoming
                      ? "Nothing scheduled — upcoming calls with the notetaker on will appear here."
                      : "No meetings yet — they'll appear here once the notetaker joins its first call."
                }
              />
            </div>
          )}
        </div>

        <div className="hidden w-[22rem] shrink-0 lg:block xl:w-[26rem]">
          <InsightsPanel
            headline={
              <>
                Stay <span className="text-accent">on top</span> of your meetings
              </>
            }
            subhead="Ask questions and extract insights instantly."
            suggestions={SUGGESTIONS}
          />
        </div>
      </div>

      {/* Pinned below the list rather than inside it: the recorder has to
          outlive tab switches and searches, and unmounting it would drop the
          microphone mid-meeting. */}
      {liveTarget ? (
        <div className="shrink-0 border-t border-black/5 bg-canvas px-6 py-4">
          <LiveRecorder
            target={liveTarget}
            onFinished={finishRecording}
            onFailed={failRecording}
          />
        </div>
      ) : null}

      <InviteToMeetingModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onJoined={(meeting) => {
          adopt(meeting);
          notify("Notetaker is joining the call");
        }}
      />

      <UploadRecordingModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={(meeting) => {
          adopt(meeting);
          notify("Recording uploaded — the summary will appear shortly");
        }}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
