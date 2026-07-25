import { apiFetch } from "./api";

export type DeliveryMode = "interval" | "times" | "custom_daily";

export type MailmanSettings = {
  is_active: boolean;
  timezone: string;
  delivery_mode: DeliveryMode;
  interval_hours: number | null;
  interval_minutes: number | null;
  times_per_day: number | null;
  custom_times: string[];
  active_window_start: string;
  active_window_end: string;
  dnd_enabled: boolean;
  dnd_start: string | null;
  dnd_end: string | null;
  last_delivery_at: string | null;
};

export type SettingsUpdate = Partial<Omit<MailmanSettings, "is_active" | "last_delivery_at">>;

export type Vip = { domains: string[]; addresses: string[]; keywords: string[] };
export type VipUpdate = Partial<Vip>;

export type MailmanStatus = { is_active: boolean; held_count: number };

export type HeldEmail = {
  id?: string | null;
  thread_id?: string | null;
  sender?: string | null;
  subject?: string | null;
  snippet?: string | null;
  date?: string | null;
};

export const DEFAULT_SETTINGS: MailmanSettings = {
  is_active: false,
  timezone: "UTC",
  delivery_mode: "times",
  interval_hours: 4,
  interval_minutes: null,
  times_per_day: 3,
  custom_times: ["09:00", "13:00", "17:00"],
  active_window_start: "09:00",
  active_window_end: "21:00",
  dnd_enabled: false,
  dnd_start: null,
  dnd_end: null,
  last_delivery_at: null,
};

export const DEFAULT_VIP: Vip = { domains: [], addresses: [], keywords: [] };

export const getStatus = () => apiFetch<MailmanStatus>("/mailman/status");
export const getSettings = () => apiFetch<MailmanSettings>("/mailman/settings");
export const updateSettings = (body: SettingsUpdate) =>
  apiFetch<MailmanSettings>("/mailman/settings", { method: "PUT", body: JSON.stringify(body) });
export const getVip = () => apiFetch<Vip>("/mailman/vip");
export const updateVip = (body: VipUpdate) =>
  apiFetch<Vip>("/mailman/vip", { method: "PUT", body: JSON.stringify(body) });
export const listHeld = () => apiFetch<HeldEmail[]>("/mailman/held");
export const startBatching = () =>
  apiFetch<MailmanSettings>("/mailman/start", { method: "POST" });
export const stopBatching = () =>
  apiFetch<MailmanSettings>("/mailman/stop", { method: "POST" });
