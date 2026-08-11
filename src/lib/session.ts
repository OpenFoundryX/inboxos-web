import { apiFetch } from "./api";
import { isAuthed, isOnboarded } from "./auth";
import { getConnectionState } from "./connections";

export type UserRead = {
  id: string;
  email: string;
  full_name?: string | null;
  picture?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
  onboarded_at?: string | null;
};

/** True when a backend URL is configured; enables the real auth + API path. */
export function backendConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

/** Full-page nav (not fetch) so the browser follows Google's redirect chain
 *  and stores the resulting session cookies on this origin via the proxy. */
export function startGoogleLogin(): void {
  if (typeof window === "undefined") return;
  window.location.href = "/api/auth/google/login";
}

export async function getMe(): Promise<UserRead | null> {
  try {
    return await apiFetch<UserRead>("/auth/me");
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  } catch {
    // Ignore — clearing client state + redirecting is enough.
  }
}

export type Access = { authed: boolean; connected: boolean; onboarded: boolean };

/** `connected` is Google granted for both Gmail and Calendar; `onboarded` is the
 *  wizard actually finished. They used to be the same flag, which let a user
 *  reach the dashboard without ever seeing the settings steps. Without a
 *  backend, the mock flags stand in — there is no onboarded_at to read.
 *
 *  One request now, not two: Gmail and Calendar come from a single grant, so
 *  asking twice would just read the same row twice. */
export async function checkAccess(): Promise<Access> {
  if (backendConfigured()) {
    const me = await getMe();
    if (!me) return { authed: false, connected: false, onboarded: false };
    const onboarded = Boolean(me.onboarded_at);
    // getConnectionState never throws — an unreachable backend reports
    // not-connected, which sends the user to the connect step.
    const google = await getConnectionState();
    return { authed: true, connected: google.gmail && google.calendar, onboarded };
  }
  // `connected: true` without a backend — there is nothing to connect, and a
  // false here would ping-pong between the connect step and the dashboard.
  return { authed: isAuthed(), connected: true, onboarded: isOnboarded() };
}
