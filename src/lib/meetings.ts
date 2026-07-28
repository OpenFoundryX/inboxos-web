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
};

/** The list endpoint omits the transcript — it's too large to return per row. */
export type MeetingDetail = MeetingRead & { transcript: string | null };

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

/* ------------------------------------------------------------------ format */

/** "Mon 14 Jul, 14:00 - 14:30" in the browser's timezone. Unlike the dashboard
 *  agenda — which must echo the timezone the server bucketed Today/Tomorrow by —
 *  this list isn't split into server-defined days, so local time is right. */
export function formatMeetingWhen(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt) return "Time unknown";
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return "Time unknown";

  const day = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(start);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const end = endsAt ? new Date(endsAt) : null;
  const range =
    end && !Number.isNaN(end.getTime())
      ? `${time.format(start)} - ${time.format(end)}`
      : time.format(start);
  return `${day}, ${range}`;
}
