import { apiFetch } from "./api";

export type ConnectionStatus = { connected: boolean };
export type ConnectUrl = { redirect_url: string };

export const getGmailStatus = () =>
  apiFetch<ConnectionStatus>("/integrations/gmail/status");
export const getGmailConnectUrl = () =>
  apiFetch<ConnectUrl>("/integrations/gmail/connect");
export const getCalendarStatus = () =>
  apiFetch<ConnectionStatus>("/integrations/calendar/status");
export const getCalendarConnectUrl = () =>
  apiFetch<ConnectUrl>("/integrations/calendar/connect");
