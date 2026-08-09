export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** FastAPI puts the human-readable reason in `detail`, either as a string or,
 *  for validation errors, as a list of {msg, loc} objects. Without this the UI
 *  can only show "Request failed: 422" — but the categorization endpoints
 *  return messages worth reading ("a category is already named 'Client work'"). */
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const msgs = detail.map((d) => d?.msg).filter(Boolean);
      if (msgs.length) return msgs.join("; ");
    }
  } catch {
    // Non-JSON or empty body — fall through to the generic message.
  }
  return `Request failed: ${res.status}`;
}

/** The one request that must never trigger the refresh-and-replay below —
 *  refreshing a refresh would recurse. */
const REFRESH_PATH = "/auth/refresh";

/** Where a 402 sends the browser. The backend returns this status from any
 *  feature endpoint once `require_entitled`/`entitlements.check` decides the
 *  account is locked (no subscription, trial elapsed, quota exhausted) or the
 *  plan doesn't include the feature — see `services/billing/dependencies.py`.
 *  Handled once, here, rather than in every caller: a component-by-component
 *  catch is exactly the kind of second entrance that has already let a gate
 *  go missing more than once on this branch (see the ledger's recurring
 *  "second-path" findings). */
const PLAN_PICKER_PATH = "/dashboard/billing";

/** A full navigation, not a router push: this module has no access to
 *  Next's router (it isn't a hook, and is called from plain async
 *  functions), and a hard redirect is also the right behaviour here — the
 *  in-flight page's state was built for an entitled account and shouldn't be
 *  patched around a 402 that showed up mid-session. Already on the plan
 *  picker itself, do nothing: fetches from that very page (e.g. checking
 *  status while abandoned/returning) must not bounce it to itself.
 */
function redirectToPlanPicker(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  // Either picker is fine — don't bounce between them mid-session.
  if (path === PLAN_PICKER_PATH || path === "/onboarding/plan") return;
  window.location.href = PLAN_PICKER_PATH;
}

/** In-flight refresh, shared by every caller that 401s at the same moment.
 *
 *  This has to be deduplicated. The backend spends refresh tokens single-use
 *  (`oauth.rotate_refresh_token` revokes the row it just used), and the app
 *  fans out parallel requests all over — `checkAccess` alone fires /auth/me
 *  then gmail+calendar status together. Unguarded, N simultaneous 401s send N
 *  refreshes, and which way that breaks depends on timing: bunched together
 *  they all read the row before any of them commits and all succeed, leaving
 *  N-1 orphaned tokens and a cookie jar holding whichever Set-Cookie landed
 *  last; spread far enough apart that the first one commits, the rest present
 *  a spent token, 401, and bounce a perfectly valid session to /login.
 *  One shared refresh avoids having to care which. */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch(`/api${REFRESH_PATH}`, {
    method: "POST",
    headers: { "ngrok-skip-browser-warning": "true" },
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

function send(path: string, init?: RequestInit): Promise<Response> {
  // A FormData body must NOT carry an explicit Content-Type: the browser has to
  // set it itself so it can append the multipart boundary, and overriding it
  // leaves the server unable to parse a single field.
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  return fetch(`/api${path}`, {
    ...init,
    headers: {
      // Ngrok free tunnels serve an HTML warning page to browser UAs; without
      // this header every `/api` call through a tunnel returns DOCTYPE HTML
      // and JSON.parse blows up with "Unexpected token '<'".
      "ngrok-skip-browser-warning": "true",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let res = await send(path, init);

  // Access cookies last 30 minutes, refresh cookies 30 days. Both are httpOnly,
  // so expiry is invisible from here — a 401 is the only signal we get, and the
  // recovery is one refresh then one replay. Replaying is safe because every
  // body in this app is either an already-serialized string or a FormData
  // object; neither is consumed by the first attempt the way a stream would be.
  if (res.status === 401 && path !== REFRESH_PATH) {
    if (await refreshSession()) {
      res = await send(path, init);
    }
  }

  if (res.status === 402) {
    redirectToPlanPicker();
  }

  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
