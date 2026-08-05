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
  /** Null for uploads and browser recordings — there was no call to join. */
  meeting_url: string | null;
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

export const joinMeeting = (meetingUrl: string, title?: string) =>
  apiFetch<MeetingRead>("/meetings/join", {
    method: "POST",
    body: JSON.stringify({ meeting_url: meetingUrl, title: title || null }),
  });

/* ------------------------------------------------------------------ capture */

/** Permission to PUT one object, plus the row it belongs to. Mirrors
 *  `schemas/meetings.UploadTarget`. */
export type UploadTarget = {
  meeting: MeetingRead;
  upload_url: string;
  headers: Record<string, string>;
  expires_at: string;
};

/** What MediaRecorder produces, and what the server signs a live upload for.
 *  Must match `services/meetings/media.LIVE_CONTENT_TYPE` — the content type is
 *  part of the signature, so a mismatch is rejected by the bucket. */
export const LIVE_MIME = "audio/webm";

const startUpload = (body: {
  filename: string | null;
  content_type: string;
  size_bytes: number;
  title: string | null;
  calendar_event_id: string | null;
}) => apiFetch<UploadTarget>("/meetings/uploads", { method: "POST", body: JSON.stringify(body) });

export const startLiveRecording = (title?: string) =>
  apiFetch<UploadTarget>("/meetings/live", {
    method: "POST",
    body: JSON.stringify({ title: title || null }),
  });

const completeUpload = (id: string) =>
  apiFetch<MeetingRead>(`/meetings/${id}/uploads/complete`, { method: "POST" });

/**
 * PUT a blob straight to the bucket.
 *
 * Deliberately not `apiFetch`: this request goes to S3, not to our API, and
 * must carry none of our cookies or auth headers — sending them to a third
 * party would leak them, and S3 rejects unexpected signed headers anyway.
 *
 * XHR rather than fetch because only XHR reports upload progress, and a
 * gigabyte with no progress bar looks identical to a hang.
 */
function putToBucket(
  target: UploadTarget,
  blob: Blob,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", target.upload_url, true);
    for (const [name, value] of Object.entries(target.headers)) {
      xhr.setRequestHeader(name, value);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : // The body is S3's XML error. Surfacing the status alone is enough
          // for the user; the detail belongs in the console, not a toast.
          reject(new Error(`Upload failed (${xhr.status})`));
    // A network-level failure here is very often the bucket's CORS rule
    // missing rather than the network being down, and the browser deliberately
    // hides which. Saying so beats "an error occurred".
    xhr.onerror = () =>
      reject(new Error("Upload failed — the storage bucket may not allow uploads from this site"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    xhr.send(blob);
  });
}

/**
 * Upload a recording and hand it to the notetaker.
 *
 * Three steps, because a gigabyte can't be one request: reserve a row and a
 * URL, send the bytes to the bucket, then tell the server to look. The server
 * verifies the object itself — this function saying "done" is not what makes
 * it true.
 */
export async function uploadRecording(
  file: File,
  options: {
    title?: string;
    calendarEventId?: string | null;
    onProgress?: (fraction: number) => void;
  } = {},
): Promise<MeetingRead> {
  const target = await startUpload({
    filename: file.name || null,
    // Browsers leave `type` empty for extensions they don't recognize. Sending
    // "" would be rejected as not-audio-or-video, so fall back to something
    // the server accepts and let ffprobe determine what it actually is.
    content_type: file.type || "video/mp4",
    size_bytes: file.size,
    title: options.title?.trim() || null,
    calendar_event_id: options.calendarEventId || null,
  });

  await putToBucket(target, file, options.onProgress);
  return completeUpload(target.meeting.id);
}

/** Finish a browser recording: send the audio, then have the server confirm it. */
export async function finishLiveRecording(
  target: UploadTarget,
  audio: Blob,
  onProgress?: (fraction: number) => void,
): Promise<MeetingRead> {
  await putToBucket(target, audio, onProgress);
  return completeUpload(target.meeting.id);
}

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

/** Sources whose media we captured ourselves rather than sending a bot for.
 *  Mirrors `models/meetings.SELF_HOSTED_SOURCES`. */
const SELF_HOSTED = new Set(["upload", "live"]);
export const isSelfHosted = (m: MeetingRead) => SELF_HOSTED.has(m.source);

/** Meetings the bot hasn't sat in on yet. Everything else — live, processing,
 *  written up, failed — belongs under "Recorded", because the user's question
 *  there is "what happened?" rather than "what's coming?".
 *
 *  An upload is never upcoming, whatever its status. It sits at `pending` for
 *  the seconds between reserving the row and the bytes landing, and filing it
 *  under "Upcoming" would put a meeting that already happened in the list of
 *  ones that haven't — where the user would then wait for it. */
const UPCOMING = new Set(["pending", "scheduled"]);
export const isUpcoming = (m: MeetingRead) => UPCOMING.has(m.status) && !isSelfHosted(m);

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