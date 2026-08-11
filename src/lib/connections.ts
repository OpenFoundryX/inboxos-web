import { apiFetch } from "./api";

export type ConnectionStatus = { connected: boolean };
export type ConnectUrl = { redirect_url: string };

/** One Google grant now covers both Gmail and Calendar, so there is a single
 *  consent screen rather than one per product. The two are still reported
 *  separately because incremental auth means a user can end up holding one set
 *  of scopes and not the other — and `needs_reconnect` distinguishes a grant
 *  that was revoked from one that was never given, which are different prompts. */
export type GoogleStatus = {
  connected: boolean;
  gmail: boolean;
  calendar: boolean;
  /** A mailbox history cursor exists, i.e. new mail is actually being polled.
   *  Connected without listening is the silent-failure state. */
  listening: boolean;
  needs_reconnect: boolean;
  email: string | null;
};

export const getGoogleStatus = () =>
  apiFetch<GoogleStatus>("/integrations/google/status");
export const getGoogleConnectUrl = () =>
  apiFetch<ConnectUrl>("/integrations/google/connect");
export const disconnectGoogle = () =>
  apiFetch<void>("/integrations/google/disconnect", { method: "POST" });

/** Kept because the backend still exposes them and they answer a narrower
 *  question — "does the grant cover Calendar?" — without the caller having to
 *  know about scopes. Both now read the same underlying grant. */
export const getGmailStatus = () =>
  apiFetch<ConnectionStatus>("/integrations/gmail/status");
export const getCalendarStatus = () =>
  apiFetch<ConnectionStatus>("/integrations/calendar/status");

/** Everything the app needs from Google, in one call.
 *
 *  Falls back to `connected: false` rather than throwing: every caller treats
 *  an unreachable backend as not-yet-connected, and pushing that decision here
 *  keeps it from being made three slightly different ways. */
export async function getConnectionState(): Promise<GoogleStatus> {
  try {
    return await getGoogleStatus();
  } catch {
    return {
      connected: false,
      gmail: false,
      calendar: false,
      listening: false,
      needs_reconnect: false,
      email: null,
    };
  }
}
