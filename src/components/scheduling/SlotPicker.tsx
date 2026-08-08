"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilityRange } from "@/lib/scheduling";
import {
  COMMON_TIMEZONES,
  formatTime,
  localDateKey,
  monthGrid,
  slotsByViewerDate,
} from "@/lib/slots";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type Props = {
  /** Given an inclusive `YYYY-MM-DD` range, resolve the host's open slots. */
  fetchRange: (from: string, to: string) => Promise<AvailabilityRange>;
  durationMinutes: number;
  viewerTimezone: string;
  onTimezoneChange: (timezone: string) => void;
  hostTimezone: string;
  /** Inclusive booking window, in the host's zone, from the event detail. */
  firstBookableDay: string;
  lastBookableDay: string;
  onPick: (startsAt: string) => void;
  /** The slot currently being submitted, if picking one starts a request.
   *
   *  The booking flow moves straight to a form, so a click there is instant.
   *  Rescheduling instead sends the choice to the server, which talks to
   *  Google before answering — seconds during which the old picker gave no
   *  sign at all that the click had registered, and stayed clickable. */
  pendingSlot?: string;
};

/**
 * Month calendar plus the times available on the chosen day.
 *
 * Shared by the booking flow and the reschedule flow rather than written
 * twice. They differ only in which endpoint supplies the slots — a reschedule
 * has to exclude the booking being moved — so that is the one thing passed in.
 *
 * A whole month is fetched at once, which is also all the API is asked for.
 * Fetching per clicked date meant a Google Calendar round trip every time a
 * guest changed their mind.
 */
export default function SlotPicker({
  fetchRange,
  durationMinutes,
  viewerTimezone,
  onTimezoneChange,
  hostTimezone,
  firstBookableDay,
  lastBookableDay,
  onPick,
  pendingSlot,
}: Props) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [range, setRange] = useState<AvailabilityRange | null>(null);
  const [day, setDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    // A day either side of the month: a slot at the far edge of the host's
    // day can land on the previous or next date once it is read in the
    // viewer's zone, and it would otherwise be missing from the grid.
    const from = new Date(month.getFullYear(), month.getMonth(), 0);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    try {
      setRange(await fetchRange(localDateKey(from), localDateKey(to)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load availability");
      setRange(null);
    } finally {
      setLoading(false);
    }
  }, [fetchRange, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDate = useMemo(
    () => slotsByViewerDate(range, viewerTimezone),
    [range, viewerTimezone],
  );

  // Changing zone can move every slot onto a different date, which may leave
  // the selected day empty. Drop the selection rather than show "no times" for
  // a date the guest never chose.
  useEffect(() => {
    if (day && !byDate.has(day)) setDay("");
  }, [byDate, day]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const atFirstMonth =
    month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const lastMonth = new Date(`${lastBookableDay}T12:00:00`);
  const atLastMonth =
    month.getFullYear() === lastMonth.getFullYear() &&
    month.getMonth() >= lastMonth.getMonth();

  const slots = day ? (byDate.get(day) ?? []) : [];
  const timezones = Array.from(new Set([viewerTimezone, hostTimezone, ...COMMON_TIMEZONES]));

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            disabled={atFirstMonth}
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:bg-canvas disabled:opacity-20"
          >
            ‹
          </button>
          <h3 className="text-sm font-bold">
            {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h3>
          <button
            type="button"
            disabled={atLastMonth}
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:bg-canvas disabled:opacity-20"
          >
            ›
          </button>
        </div>

        <div className="mb-1.5 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[10px] font-semibold text-ink/30">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {monthGrid(month).map((d, i) => {
            if (!d) return <span key={`blank-${i}`} />;
            const key = localDateKey(d);
            // Bookable means the host actually offers something, not merely
            // that the date is in the future — so a guest never clicks a day
            // only to be told there is nothing on it.
            const open = byDate.has(key);
            return (
              <button
                key={key}
                type="button"
                disabled={!open}
                aria-pressed={day === key}
                onClick={() => setDay(key)}
                className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-xs font-semibold transition ${
                  day === key
                    ? "bg-accent text-white"
                    : open
                      ? "bg-accent/10 text-accent hover:bg-accent/20"
                      : "text-ink/20"
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <label className="mt-5 block text-[11px] font-medium uppercase tracking-wider text-ink/30">
          Your time zone
          <select
            value={viewerTimezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-black/[0.07] bg-white px-2.5 py-2 text-xs font-medium normal-case tracking-normal text-ink/70 outline-none focus:border-accent/30"
          >
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="min-h-[280px]">
        {loading ? (
          <p className="grid h-full place-items-center text-sm text-ink/40">
            Checking the calendar…
          </p>
        ) : error ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-3 text-sm font-semibold text-accent"
              >
                Try again
              </button>
            </div>
          </div>
        ) : !day ? (
          <p className="grid h-full place-items-center text-sm text-ink/40">
            {byDate.size
              ? "Pick a date to see available times."
              : "No times are available this month."}
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-ink/40">
              {new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              · times in {viewerTimezone.replaceAll("_", " ")}
            </p>
            <div className="grid max-h-[320px] gap-2.5 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const pending = pendingSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    // One in-flight choice at a time. Without this a slow
                    // response invites a second click on a different time,
                    // and whichever request lands last silently wins.
                    disabled={Boolean(pendingSlot)}
                    aria-busy={pending}
                    onClick={() => onPick(slot)}
                    className={`rounded-xl border p-3 text-left transition ${
                      pending
                        ? "border-accent bg-accent/[0.06]"
                        : "border-black/[0.07] bg-[#fdfdfb] hover:border-accent/40 hover:bg-accent/[0.03]"
                    } ${pendingSlot && !pending ? "opacity-40" : ""}`}
                  >
                    <b className="text-sm">{formatTime(slot, viewerTimezone)}</b>
                    <span className="mt-1 block text-[11px] text-ink/35">
                      {pending ? (
                        <span className="font-semibold text-accent">Confirming…</span>
                      ) : (
                        <>
                          until{" "}
                          {formatTime(
                            new Date(new Date(slot).getTime() + durationMinutes * 60000),
                            viewerTimezone,
                          )}
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
