import { ApiError, apiFetch } from "@/lib/api";

/* ------------------------------------------------------------------ types */

export type DayWindow = { start: string; end: string };
export type HoursWindow = DayWindow & { weekday: number };

export type QuestionDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox";
  required: boolean;
  options: string[];
};

export type SchedulingSettings = {
  slug: string;
  enabled: boolean;
  timezone: string;
  weekly_hours: HoursWindow[];
  include_link_in_drafts: boolean;
  confirmation_email: boolean;
  reschedule_reminders: boolean;
  public_url: string;
};

export type EventType = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  enabled: boolean;
  position: number;
  duration_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
  booking_horizon_days: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  max_bookings_per_day: number | null;
  questions: QuestionDef[];
  profile_slug: string;
  public_url: string;
};

export type DateOverride = { day: string; windows: DayWindow[]; note: string | null };

export type Booking = {
  id: string;
  starts_at: string;
  ends_at: string;
  booker_name: string;
  booker_email: string;
  attendee_emails: string[];
  title: string;
  notes: string | null;
  answers: Record<string, string>;
  status: string;
  meeting_url: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  rescheduled_at: string | null;
};

export type PublicEventType = {
  slug: string;
  name: string;
  description: string | null;
  duration_minutes: number;
};

export type PublicProfile = {
  slug: string;
  host_name: string;
  timezone: string;
  event_types: PublicEventType[];
};

export type PublicEventDetail = {
  slug: string;
  host_name: string;
  host_timezone: string;
  event: PublicEventType;
  questions: QuestionDef[];
  first_bookable_day: string;
  last_bookable_day: string;
};

export type AvailabilityDay = { date: string; slots: string[] };
export type AvailabilityRange = {
  timezone: string;
  duration_minutes: number;
  days: AvailabilityDay[];
};

export type ManagedBooking = {
  booking: Booking;
  host_name: string;
  host_timezone: string;
  profile_slug: string;
  event_slug: string | null;
  can_reschedule: boolean;
};

export type BookingInput = {
  starts_at: string;
  name: string;
  email: string;
  attendee_emails?: string[];
  notes?: string;
  answers?: Record<string, string | boolean>;
};

/* ------------------------------------------------------- public transport */

/** Requests made by people who are not signed in.
 *
 *  Deliberately not `apiFetch`. That helper exists for the dashboard: it
 *  replays through `/auth/refresh` on a 401 and, on a 402, sends the browser
 *  to `/dashboard/billing`. Both are wrong on a booking page — a guest has no
 *  session to refresh, and bouncing someone trying to book a meeting into a
 *  stranger's billing settings is the worst possible outcome of a lapsed
 *  subscription. Errors surface as `ApiError` either way, so callers are
 *  unchanged. */
async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      // Ngrok's free tier returns an HTML interstitial for browser UAs unless
      // this is set. Vercel rewrites forward it to the tunnel destination.
      "ngrok-skip-browser-warning": "true",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const detail = (await res.json())?.detail;
      if (typeof detail === "string") message = detail;
      else if (Array.isArray(detail)) {
        const msgs = detail.map((d) => d?.msg).filter(Boolean);
        if (msgs.length) message = msgs.join("; ");
      }
    } catch {
      // Non-JSON body — the status-code message stands.
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/* --------------------------------------------------------------- host API */

export const getSchedulingSettings = () =>
  apiFetch<SchedulingSettings>("/scheduling/settings");

export const updateSchedulingSettings = (body: Partial<SchedulingSettings>) =>
  apiFetch<SchedulingSettings>("/scheduling/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const listEventTypes = () => apiFetch<EventType[]>("/scheduling/event-types");

export const createEventType = (body: Partial<EventType>) =>
  apiFetch<EventType>("/scheduling/event-types", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateEventType = (id: string, body: Partial<EventType>) =>
  apiFetch<EventType>(`/scheduling/event-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteEventType = (id: string) =>
  apiFetch<void>(`/scheduling/event-types/${id}`, { method: "DELETE" });

export const listOverrides = (days = 120) =>
  apiFetch<DateOverride[]>(`/scheduling/overrides?days=${days}`);

export const upsertOverride = (body: DateOverride) =>
  apiFetch<DateOverride>("/scheduling/overrides", {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteOverride = (day: string) =>
  apiFetch<void>(`/scheduling/overrides/${day}`, { method: "DELETE" });

export const listBookings = (upcoming = false) =>
  apiFetch<Booking[]>(`/scheduling/bookings?upcoming=${upcoming}`);

export const cancelBookingAsHost = (id: string, reason?: string) =>
  apiFetch<Booking>(`/scheduling/bookings/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason || null }),
  });

/* ------------------------------------------------------------- public API */

const slug = encodeURIComponent;

export const getPublicProfile = (profile: string) =>
  publicFetch<PublicProfile>(`/scheduling/public/${slug(profile)}`);

export const getPublicEvent = (profile: string, event: string) =>
  publicFetch<PublicEventDetail>(`/scheduling/public/${slug(profile)}/${slug(event)}`);

export const getAvailability = (profile: string, event: string, from: string, to: string) =>
  publicFetch<AvailabilityRange>(
    `/scheduling/public/${slug(profile)}/${slug(event)}/availability?from=${from}&to=${to}`,
  );

export const createBooking = (profile: string, event: string, body: BookingInput) =>
  publicFetch<Booking>(`/scheduling/public/${slug(profile)}/${slug(event)}/book`, {
    method: "POST",
    body: JSON.stringify(body),
  });

/* ------------------------------------- managing a booking with your token */

export const getManagedBooking = (token: string) =>
  publicFetch<ManagedBooking>(`/scheduling/manage/${slug(token)}`);

export const getRescheduleAvailability = (token: string, from: string, to: string) =>
  publicFetch<AvailabilityRange>(
    `/scheduling/manage/${slug(token)}/availability?from=${from}&to=${to}`,
  );

export const cancelOwnBooking = (token: string, reason?: string) =>
  publicFetch<Booking>(`/scheduling/manage/${slug(token)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason || null }),
  });

export const rescheduleOwnBooking = (token: string, startsAt: string) =>
  publicFetch<Booking>(`/scheduling/manage/${slug(token)}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ starts_at: startsAt }),
  });
