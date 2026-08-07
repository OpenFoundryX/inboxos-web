import { apiFetch } from "./api";

/** Mirrors `schemas/notes.py`. `note_date` is a calendar day, `YYYY-MM-DD`. */
export type DailyNote = {
  note_date: string;
  body: string;
  updated_at: string | null;
};

/**
 * A date as the server keys it: `YYYY-MM-DD` in the *browser's* timezone.
 *
 * Deliberately not `toISOString().slice(0, 10)`, which converts to UTC first —
 * anywhere west of Greenwich that yields yesterday's date for most of the
 * evening, so notes written at 9pm would land on the wrong day.
 */
export function toKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Local midnight `offset` days from today. Built by mutating the date rather
 *  than adding milliseconds, so DST transitions — where a local day is 23 or 25
 *  hours long — can't drift the result onto a neighbouring day. */
export function dayFromToday(offset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

export const isToday = (key: string) => key === toKey(new Date());

/** "Thu, August 6th, 2026" — the heading over each day. */
export function formatDayHeading(key: string): string {
  // Parsed as local noon, not midnight: `new Date("2026-08-06")` is treated as
  // UTC midnight, which renders as the 5th in any negative offset.
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(date);
  return `${weekday}, ${month} ${d}${ordinal(d)}, ${y}`;
}

function ordinal(day: number): string {
  // 11th, 12th, 13th are the exceptions the mod-10 rule gets wrong.
  if (day >= 11 && day <= 13) return "th";
  return { 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th";
}

export const getNotes = (from: string, to: string) =>
  apiFetch<DailyNote[]>(`/notes?from=${from}&to=${to}`);

export const saveNote = (date: string, body: string) =>
  apiFetch<DailyNote>(`/notes/${date}`, {
    method: "PUT",
    body: JSON.stringify({ body }),
  });
