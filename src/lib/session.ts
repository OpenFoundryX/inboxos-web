import { apiFetch } from "./api";
import { isAuthed, isOnboarded } from "./auth";

export type UserRead = {
  id: string;
  email: string;
  full_name?: string | null;
  picture?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
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

export type Access = { authed: boolean; onboarded: boolean };

/** Real session when configured (a real session counts as onboarded, since the
 *  backend has no onboarding flag); otherwise the mock flags. */
export async function checkAccess(): Promise<Access> {
  if (backendConfigured()) {
    const me = await getMe();
    return { authed: Boolean(me), onboarded: Boolean(me) };
  }
  return { authed: isAuthed(), onboarded: isOnboarded() };
}
