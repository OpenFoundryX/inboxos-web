import { apiFetch } from "./api";
import { isAuthed, isOnboarded } from "./auth";
import { getCalendarStatus, getGmailStatus } from "./connections";

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

/** `connected` is both integrations granted; `onboarded` is the wizard actually
 *  finished. They used to be the same flag, which let a user reach the dashboard
 *  without ever seeing the settings steps. Without a backend, the mock flags
 *  stand in — there is no onboarded_at to read. */
export async function checkAccess(): Promise<Access> {
  if (backendConfigured()) {
    const me = await getMe();
    if (!me) return { authed: false, connected: false, onboarded: false };
    const onboarded = Boolean(me.onboarded_at);
    try {
      const [gmail, calendar] = await Promise.all([
        getGmailStatus(),
        getCalendarStatus(),
      ]);
      return { authed: true, connected: gmail.connected && calendar.connected, onboarded };
    } catch {
      // Status unreachable → treat as not-yet-connected (send to connect step).
      return { authed: true, connected: false, onboarded };
    }
  }
  // `connected: true` without a backend — there is nothing to connect, and a
  // false here would ping-pong between the connect step and the dashboard.
  return { authed: isAuthed(), connected: true, onboarded: isOnboarded() };
}
