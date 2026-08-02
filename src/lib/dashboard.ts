import { apiFetch } from "./api";

export type SetupState = "syncing" | "ready";

export type DashboardSetup = {
  state: SetupState;
  initial_sync_at: string | null;
};

export type DashboardStats = {
  emails_categorized: number;
  drafts_created: number;
};

export type AgendaItem = {
  calendar_event_id: string;
  meeting_id: string | null;
  title: string | null;
  starts_at: string;
  ends_at: string;
  meeting_url: string | null;
  bot_on: boolean;
  bot_editable: boolean;
};

export type DashboardMeetings = {
  timezone: string;
  today: AgendaItem[];
  tomorrow: AgendaItem[];
};

export type DashboardSummary = {
  user: { first_name: string };
  setup: DashboardSetup;
  stats: DashboardStats;
  meetings: DashboardMeetings;
};

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}

export function enableMeetingBot(calendarEventId: string): Promise<void> {
  return apiFetch<void>("/meetings/bot", {
    method: "POST",
    body: JSON.stringify({ calendar_event_id: calendarEventId }),
  });
}

export function disableMeetingBot(meetingId: string): Promise<void> {
  return apiFetch<void>(`/meetings/${meetingId}/bot`, { method: "DELETE" });
}

/**
 * Hours of meetings on today's agenda.
 *
 * Derived rather than fetched: the summary already carries today's events, and
 * their durations are timezone-independent, so there's nothing the server
 * could tell us that this doesn't. Rounded to a half hour, because the figure
 * is there to be glanced at.
 */
export function meetingHoursToday(meetings: DashboardMeetings): number {
  const ms = meetings.today.reduce((total, item) => {
    const start = new Date(item.starts_at).getTime();
    const end = new Date(item.ends_at).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return total;
    return total + (end - start);
  }, 0);
  return Math.round(ms / 1_800_000) / 2;
}

/** "12:00 - 12:30", rendered in the timezone the API bucketed the day by —
 *  not the browser's. A user checking their agenda from a laptop still set to
 *  UTC must read the same times the backend used to split Today from Tomorrow. */
export function formatTimeRange(startsAt: string, endsAt: string, timeZone: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  };
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", opts);
    return `${fmt.format(new Date(startsAt))} - ${fmt.format(new Date(endsAt))}`;
  } catch {
    // An unknown IANA zone throws in Intl; fall back to the browser's.
    const fmt = new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: undefined });
    return `${fmt.format(new Date(startsAt))} - ${fmt.format(new Date(endsAt))}`;
  }
}
