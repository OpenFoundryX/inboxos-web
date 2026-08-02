import { apiFetch } from "./api";

/** Mirrors `schemas/meetings.py`. */
export type ActionItem = {
  what: string;
  owner: string | null;
  due_at: string | null;
};

export type MeetingRead = {
  id: string;
  source: string;
  title: string | null;
  meeting_url: string;
  platform: string | null;
  starts_at: string | null;
  ends_at: string | null;
  attendees: string[];
  status: string;
  status_detail: string | null;
  summary: string | null;
  decisions: string[];
  action_items: ActionItem[];
  recap_sent_at: string | null;
  /** A video exists. Cheap for the server to answer, so every row carries it —
   *  unlike the link itself, which costs a provider call. */
  has_recording: boolean;
};

/** The list endpoint omits the transcript and the video link — one is too large
 *  to return per row, the other too expensive. */
export type MeetingDetail = MeetingRead & {
  transcript: string | null;
  /** A presigned provider link, resolved fresh each time the detail endpoint is
   *  called. Good for this page load only: it expires within hours, so it must
   *  never be cached, bookmarked, or pasted anywhere that outlives the tab.
   *  Re-fetch the meeting to get a working one. */
  recording_url: string | null;
  recording_url_expires_at: string | null;
};

export type NotetakerSettings = {
  enabled: boolean;
  auto_join: boolean;
  bot_name: string;
  min_attendees: number;
  skip_titles: string[];
  lookahead_minutes: number;
  email_recap: boolean;
  create_reminders: boolean;
  include_in_digest: boolean;
};

export type NotetakerSettingsUpdate = Partial<NotetakerSettings>;

/** Shown before the first fetch lands, and when there's no backend to ask. */
export const DEFAULT_SETTINGS: NotetakerSettings = {
  enabled: true,
  auto_join: false,
  bot_name: "InboxPilot Notetaker",
  min_attendees: 2,
  skip_titles: [],
  lookahead_minutes: 30,
  email_recap: true,
  create_reminders: true,
  include_in_digest: true,
};

export const getMeetings = () => apiFetch<MeetingRead[]>("/meetings");
export const getMeeting = (id: string) => apiFetch<MeetingDetail>(`/meetings/${id}`);
export const getNotetakerSettings = () => apiFetch<NotetakerSettings>("/meetings/settings");
export const updateNotetakerSettings = (body: NotetakerSettingsUpdate) =>
  apiFetch<NotetakerSettings>("/meetings/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const cancelMeetingBot = (id: string) =>
  apiFetch<MeetingRead>(`/meetings/${id}/bot`, { method: "DELETE" });

/* ------------------------------------------------------------------ status */

export type StatusTone = "neutral" | "live" | "done" | "error" | "muted";

/** The server tracks ten statuses; users care about six things. Collapsing them
 *  here — rather than at each call site — is what keeps the list, the row, and
 *  the detail view from ever describing the same meeting differently. */
const STATUS_DISPLAY: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Scheduled", tone: "neutral" },
  scheduled: { label: "Scheduled", tone: "neutral" },
  joining: { label: "Joining", tone: "live" },
  recording: { label: "Recording", tone: "live" },
  ended: { label: "Processing", tone: "live" },
  recorded: { label: "Processing", tone: "live" },
  processed: { label: "Notes ready", tone: "done" },
  delivered: { label: "Notes ready", tone: "done" },
  failed: { label: "Failed", tone: "error" },
  cancelled: { label: "Off", tone: "muted" },
};

export function statusDisplay(status: string): { label: string; tone: StatusTone } {
  // An unknown status means the backend grew one we haven't mapped. Showing it
  // raw beats showing nothing, and it makes the omission obvious.
  return STATUS_DISPLAY[status] ?? { label: status, tone: "neutral" };
}

/** Statuses that can still change on their own. Drives polling: once every
 *  meeting is out of this set, the page has nothing left to wait for. */
export const IN_FLIGHT = new Set([
  "pending",
  "scheduled",
  "joining",
  "recording",
  "ended",
  "recorded",
]);

/** Statuses where a bot is outstanding and can be recalled. Mirrors the
 *  server's guard in `cancel_bot` (ACTIVE_STATUSES plus pending) — offering the
 *  button anywhere else just buys a 409. */
export const CANCELLABLE = new Set(["pending", "scheduled", "joining", "recording", "ended"]);

export const isInFlight = (m: MeetingRead) => IN_FLIGHT.has(m.status);
export const isCancellable = (m: MeetingRead) => CANCELLABLE.has(m.status);

/** Meetings the bot hasn't sat in on yet. Everything else — live, processing,
 *  written up, failed — belongs under "Recorded", because the user's question
 *  there is "what happened?" rather than "what's coming?". */
const UPCOMING = new Set(["pending", "scheduled"]);
export const isUpcoming = (m: MeetingRead) => UPCOMING.has(m.status);

/* ------------------------------------------------------------------ format */

const parse = (iso: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Times are formatted in the browser's timezone. Unlike the dashboard agenda —
 *  which must echo the timezone the server bucketed Today/Tomorrow by — these
 *  lists aren't split into server-defined days, so local time is right. */
const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "21:15 - 21:17", or just the start when there's no end. */
export function formatTimeRange(startsAt: string | null, endsAt: string | null): string {
  const start = parse(startsAt);
  if (!start) return "Time unknown";
  const end = parse(endsAt);
  return end ? `${TIME.format(start)} - ${TIME.format(end)}` : TIME.format(start);
}

/** "31 Jul 2026" — the date line under a meeting's video. */
export function formatMeetingDate(startsAt: string | null): string {
  const start = parse(startsAt);
  if (!start) return "Date unknown";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(start);
}

/** "Friday, 31 July" — the sticky heading a day's meetings sit under. Today and
 *  yesterday are named instead, since that's how people refer to them. */
export function formatMeetingDay(startsAt: string | null): string {
  const start = parse(startsAt);
  if (!start) return "Date unknown";

  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(start) - midnight(new Date())) / 86_400_000);
  if (days === 0) return "Today";
  if (days === -1) return "Yesterday";
  if (days === 1) return "Tomorrow";

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    // A year only earns its space once it's ambiguous.
    ...(start.getFullYear() === new Date().getFullYear() ? {} : { year: "numeric" }),
  }).format(start);
}

/** Calendar titles are optional, and a bare "Untitled meeting" is useless in a
 *  list where every other row says the same. Falling back to the date at least
 *  distinguishes one row from the next. */
export function meetingTitle(m: Pick<MeetingRead, "title" | "starts_at">): string {
  const title = m.title?.trim();
  if (title) return title;
  const start = parse(m.starts_at);
  if (!start) return "Untitled meeting";
  return `Meeting on ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(start)}`;
}

export type MeetingDayGroup = { key: string; label: string; meetings: MeetingRead[] };

/**
 * Bucket meetings under day headings.
 *
 * `direction` decides both orderings at once: recorded meetings read
 * newest-first (the one that just ended is the one you came for), upcoming
 * ones soonest-first. Meetings with no start time sort last either way — they
 * can't be placed on the timeline, but dropping them would hide real rows.
 */
export function groupMeetingsByDay(
  meetings: MeetingRead[],
  direction: "newest" | "soonest",
): MeetingDayGroup[] {
  const groups = new Map<string, MeetingDayGroup>();

  for (const m of meetings) {
    const start = parse(m.starts_at);
    const key = start ? start.toDateString() : "unknown";
    let group = groups.get(key);
    if (!group) {
      group = { key, label: formatMeetingDay(m.starts_at), meetings: [] };
      groups.set(key, group);
    }
    group.meetings.push(m);
  }

  const sign = direction === "newest" ? -1 : 1;
  const at = (m: MeetingRead) => parse(m.starts_at)?.getTime() ?? null;

  const ordered = [...groups.values()].sort((a, b) => {
    const ta = at(a.meetings[0]);
    const tb = at(b.meetings[0]);
    if (ta === null) return 1;
    if (tb === null) return -1;
    return sign * (ta - tb);
  });

  for (const group of ordered) {
    group.meetings.sort((a, b) => {
      const ta = at(a);
      const tb = at(b);
      if (ta === null) return 1;
      if (tb === null) return -1;
      return sign * (ta - tb);
    });
  }

  return ordered;
}

/** Case-insensitive match across the fields a person would search by. */
export function matchesQuery(m: MeetingRead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    meetingTitle(m).toLowerCase().includes(q) ||
    m.attendees.some((a) => a.toLowerCase().includes(q)) ||
    (m.summary?.toLowerCase().includes(q) ?? false)
  );
}

/** The bit of an attendee string a human reads — "Ada Lovelace" from
 *  "Ada Lovelace <ada@example.com>", or the local part of a bare address. */
export function attendeeName(attendee: string): string {
  const named = /^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/.exec(attendee);
  if (named) return named[1];
  const at = attendee.indexOf("@");
  return at > 0 ? attendee.slice(0, at) : attendee;
}

export function initialOf(name: string): string {
  const first = name.trim()[0];
  return first ? first.toUpperCase() : "?";
}