"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { getCalendarConnectUrl, getCalendarStatus } from "@/lib/connections";
import {
  deleteOverride,
  listOverrides,
  upsertOverride,
  type DateOverride,
  type HoursWindow,
  type SchedulingSettings,
} from "@/lib/scheduling";
import { COMMON_TIMEZONES, deviceTimezone } from "@/lib/slots";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FIELD =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-accent/40";

type Props = {
  settings: SchedulingSettings;
  onSaveSettings: (patch: Partial<SchedulingSettings>) => Promise<SchedulingSettings>;
  onNotify: (message: string) => void;
};

export default function AvailabilityTab({ settings, onSaveSettings, onNotify }: Props) {
  const [draft, setDraft] = useState(settings);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [newOverrideDay, setNewOverrideDay] = useState("");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listOverrides()
      .then(setOverrides)
      .catch(() => undefined);
    getCalendarStatus()
      .then(({ connected }) => setConnected(connected))
      .catch(() => setConnected(false));
  }, []);

  const hours = new Map(draft.weekly_hours.map((h) => [h.weekday, h]));

  function setHour(weekday: number, enabled: boolean, key?: "start" | "end", value?: string) {
    const next = new Map(hours);
    if (!enabled) next.delete(weekday);
    else {
      const existing = next.get(weekday);
      next.set(weekday, {
        weekday,
        start: existing?.start ?? "09:00",
        end: existing?.end ?? "18:00",
        ...(key ? { [key]: value } : {}),
      } as HoursWindow);
    }
    setDraft({
      ...draft,
      weekly_hours: [...next.values()].sort((a, b) => a.weekday - b.weekday),
    });
  }

  async function save() {
    // Only the two fields this tab owns. Sending the whole object meant an
    // edit here also rewrote the draft toggles from a stale copy.
    const invalid = draft.weekly_hours.find((h) => h.start >= h.end);
    if (invalid) {
      onNotify(`${DAYS[invalid.weekday]} must end after it starts`);
      return;
    }
    setBusy(true);
    try {
      await onSaveSettings({
        timezone: draft.timezone,
        weekly_hours: draft.weekly_hours,
      });
      onNotify("Availability saved");
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not save availability");
    } finally {
      setBusy(false);
    }
  }

  async function addOverride(day: string, windows: DateOverride["windows"]) {
    setBusy(true);
    try {
      const saved = await upsertOverride({ day, windows, note: null });
      setOverrides(
        [...overrides.filter((o) => o.day !== day), saved].sort((a, b) =>
          a.day.localeCompare(b.day),
        ),
      );
      setNewOverrideDay("");
      onNotify("Date updated");
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not save that date");
    } finally {
      setBusy(false);
    }
  }

  async function removeOverride(day: string) {
    setBusy(true);
    try {
      await deleteOverride(day);
      setOverrides(overrides.filter((o) => o.day !== day));
      onNotify("Date restored to your weekly hours");
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not remove that date");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="overflow-hidden">
        <div className="bg-canvas px-5 py-4 text-sm font-bold">Calendar</div>
        <div className="p-5">
          <div
            className={`rounded-2xl border p-4 ${
              connected
                ? "border-emerald-600/15 bg-emerald-50/40"
                : "border-amber-600/15 bg-amber-50/40"
            }`}
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${
                    connected
                      ? "bg-emerald-600/10 text-emerald-700"
                      : "bg-amber-600/10 text-amber-700"
                  }`}
                >
                  G
                </span>
                <div>
                  <div className="text-sm font-semibold">Google Calendar</div>
                  <p className="mt-0.5 text-xs text-ink/45">
                    {connected
                      ? "Connected · busy events automatically block booking times"
                      : connected === null
                        ? "Checking connection…"
                        : "Connect to prevent double-bookings"}
                  </p>
                </div>
              </div>
              {connected ? (
                <span className="w-fit rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Connected
                </span>
              ) : (
                <button
                  disabled={busy || connected === null}
                  onClick={async () => {
                    try {
                      window.location.href = (await getCalendarConnectUrl()).redirect_url;
                    } catch (e) {
                      onNotify(
                        e instanceof Error ? e.message : "Could not start connection",
                      );
                    }
                  }}
                  className="w-fit rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Connect calendar
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="bg-canvas px-5 py-4 text-sm font-bold">Weekly hours</div>
        <div className="space-y-5 p-5">
          <div>
            <label className="text-sm font-semibold">
              Time zone
              <select
                value={draft.timezone}
                onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                className={FIELD}
              >
                {Array.from(new Set([draft.timezone, ...COMMON_TIMEZONES])).map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, timezone: deviceTimezone() })}
              className="mt-1.5 text-xs font-medium text-accent"
            >
              Use my device timezone
            </button>
          </div>

          <div className="space-y-2">
            {DAYS.map((day, i) => {
              const window = hours.get(i);
              return (
                <div key={day} className="grid grid-cols-[7rem_1fr_1fr] items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(window)}
                      onChange={(e) => setHour(i, e.target.checked)}
                      className="accent-ink"
                    />
                    {day.slice(0, 3)}
                  </label>
                  <input
                    type="time"
                    disabled={!window}
                    value={window?.start ?? "09:00"}
                    onChange={(e) => setHour(i, true, "start", e.target.value)}
                    className="rounded-lg border border-black/10 px-2 py-2 text-sm disabled:opacity-30"
                  />
                  <input
                    type="time"
                    disabled={!window}
                    value={window?.end ?? "18:00"}
                    onChange={(e) => setHour(i, true, "end", e.target.value)}
                    className="rounded-lg border border-black/10 px-2 py-2 text-sm disabled:opacity-30"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              disabled={busy}
              onClick={() => void save()}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save availability"}
            </button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="bg-canvas px-5 py-4 text-sm font-bold">Date overrides</div>
        <div className="space-y-4 p-5">
          <p className="text-sm text-ink/50">
            Block a holiday, or open hours you don&apos;t normally work. An override
            replaces your weekly hours for that date entirely.
          </p>

          {overrides.length > 0 ? (
            <ul className="space-y-2">
              {overrides.map((override) => (
                <li
                  key={override.day}
                  className="flex items-center justify-between gap-3 rounded-xl border border-black/5 p-3"
                >
                  <div>
                    <b className="text-sm">
                      {new Date(`${override.day}T12:00:00`).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </b>
                    <p className="text-xs text-ink/45">
                      {override.windows.length === 0
                        ? "Unavailable all day"
                        : override.windows.map((w) => `${w.start}–${w.end}`).join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => void removeOverride(override.day)}
                    className="text-xs font-semibold text-ink/45 hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold">
              Date
              <input
                type="date"
                value={newOverrideDay}
                onChange={(e) => setNewOverrideDay(e.target.value)}
                className="mt-1.5 block rounded-xl border border-black/10 px-3 py-2 text-sm font-normal"
              />
            </label>
            <button
              disabled={!newOverrideDay || busy}
              onClick={() => void addOverride(newOverrideDay, [])}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Mark unavailable
            </button>
            <button
              disabled={!newOverrideDay || busy}
              onClick={() =>
                void addOverride(newOverrideDay, [{ start: "09:00", end: "13:00" }])
              }
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Custom hours (09:00–13:00)
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
