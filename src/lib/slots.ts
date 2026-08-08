import type { AvailabilityRange } from "@/lib/scheduling";

/** `YYYY-MM-DD` for an instant, as seen from a particular time zone.
 *
 *  `en-CA` is not decoration — it is the one common locale whose short date
 *  format is already ISO order, so this needs no reassembly from parts.
 */
export function dateKeyIn(value: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

/** `YYYY-MM-DD` for a Date read in the browser's own zone. */
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Regroup availability under the *viewer's* dates rather than the host's.
 *
 * This is the bug that makes cross-timezone booking pages feel broken. The API
 * answers in the host's local days, because that is what their working hours
 * are expressed in. A guest in Los Angeles clicking "10 August" on a host in
 * Kolkata was shown the host's 10 August — which, in the guest's own zone,
 * begins on the evening of the 9th. The times were right and every label
 * around them was wrong.
 *
 * Slots cross the wire as absolute instants, so the fix is to ignore the
 * server's day grouping entirely and rebuild it from the instants using the
 * zone the guest is actually reading in.
 */
export function slotsByViewerDate(
  range: AvailabilityRange | null,
  viewerTimezone: string,
): Map<string, string[]> {
  const grouped = new Map<string, string[]>();
  if (!range) return grouped;
  for (const day of range.days) {
    for (const slot of day.slots) {
      const key = dateKeyIn(slot, viewerTimezone);
      const bucket = grouped.get(key);
      if (bucket) bucket.push(slot);
      else grouped.set(key, [slot]);
    }
  }
  for (const slots of grouped.values()) slots.sort();
  return grouped;
}

/** The days of a month grid, `null` padding the week before the 1st. */
export function monthGrid(month: Date): (Date | null)[] {
  const leading = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [
    ...Array<null>(leading).fill(null),
    ...Array.from(
      { length: count },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    ),
  ];
}

export function formatTime(value: string | Date, timeZone: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
}

export function formatDateTime(value: string | Date, timeZone: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  });
}

export const COMMON_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
