# InboxOS Web — Mailman Section + Real Backend Auth — Design

Date: 2026-07-25
Project: `inboxos-web` (Next.js 14 App Router · TypeScript · Tailwind)
Backend: `InboxPilot` FastAPI monolith at `/Users/abcom/Desktop/openfoundry/InboxPilot`
Builds on: `2026-07-25-onboarding-and-app-design.md`

## Context

The web app so far uses **mock** auth (a `localStorage` flag) and renders every
page with honest empty states — no backend calls. The `InboxPilot` backend is
the real InboxOS API the frontend already proxies to
(`/api/*` → `$NEXT_PUBLIC_API_URL/v1/*`, see `next.config.mjs`).

This spec adds:

1. A **real backend connection with Google-OAuth auth**, wired through the
   existing `/api` proxy and **env-gated** so it does not break the mock demo.
2. A **Mailman section** (`/dashboard/mailman`) — batched delivery scheduling,
   Do Not Disturb, and a VIP allowlist — built against the backend's real
   `mailman` API contract.

## Backend API contract (verified by reading the source)

Mounted under `/v1`; from the frontend (via the `/api` proxy) the paths are:

### Auth (`src/api/v1/auth.py`) — cookie sessions, Google OAuth (PKCE)
- `GET  /api/auth/google/login` — 307 redirect to Google; sets `oauth_state` /
  `oauth_verifier` cookies; on callback sets `access_token` / `refresh_token`
  (all `httponly`, `samesite=lax`, `secure` only when backend `ENVIRONMENT != local`).
- `GET  /api/auth/google/callback?code&state` — completes login, then
  redirects to the backend's `POST_LOGIN_REDIRECT_URL`.
- `POST /api/auth/refresh` — 204, rotates tokens.
- `POST /api/auth/logout` — 204, clears cookies.
- `GET  /api/auth/me` → `UserRead` — current user; 401 when unauthenticated.

### Mailman (`src/api/v1/mailman.py`)
- `GET  /api/mailman/status` → `{ is_active: bool, held_count: int }`
- `GET  /api/mailman/settings` → `SettingsRead`
- `PUT  /api/mailman/settings` (`SettingsUpdate`, partial) → `SettingsRead`
- `GET  /api/mailman/vip` → `{ domains: string[], addresses: string[], keywords: string[] }`
- `PUT  /api/mailman/vip` (partial) → same shape
- `GET  /api/mailman/held` → `EmailSummary[]`
- `POST /api/mailman/start` → `SettingsRead` (activate batching / install Gmail hold filter)
- `POST /api/mailman/stop`  → `SettingsRead` (deactivate / remove filter)

`SettingsRead` / `SettingsUpdate` fields (bounds from Pydantic `Field`):
- `is_active: boolean` (read-only here; toggled via start/stop)
- `timezone: string` (IANA, e.g. `"Asia/Kolkata"`)
- `delivery_mode: "interval" | "times" | "custom_daily"`
- `interval_hours: number|null` (1–24), `interval_minutes: number|null` (1–1440)
- `times_per_day: number|null` (1–24)
- `custom_times: string[]` (`"HH:MM"`, e.g. `["09:00","13:00","17:00"]`)
- `active_window_start / active_window_end: string` (`"HH:MM"`, default `09:00` / `21:00`)
- `dnd_enabled: boolean`, `dnd_start / dnd_end: string|null` (`"HH:MM"`)
- `last_delivery_at: string|null` (ISO datetime; read-only)

`EmailSummary` (held mail): `id, thread_id, sender, to, subject, snippet, body,
date, labels[], attachments[]` — all optional/nullable.

## Decisions (locked)

- **Env-gated real auth.** When `NEXT_PUBLIC_API_URL` is set → real Google-OAuth
  path. When unset → the existing mock login/flow is unchanged (offline demo
  keeps working and stays build-verifiable). Mock login is **kept as fallback**,
  not removed.
- **All auth + data flow through the `/api` proxy** so `httponly` session
  cookies are set and read on the frontend origin (see Cookie constraint below).
- Mailman controls are typed exactly to the backend schemas (same enums, same
  numeric bounds).
- Honest loading / error / empty states everywhere; no fabricated data.
- Visual identity unchanged (cream + orange, InboxOS wordmark, `rounded-2xl`
  cards, pill buttons).

## Cookie / proxy constraint (why auth goes through `/api`)

Frontend (`:3000`) and backend (`:8000`) are different origins and the session
cookies are `httponly`. If the browser hit `:8000` directly for OAuth, cookies
would be stored under `:8000` and never sent on same-origin `:3000` requests.
Routing **every** auth call through the Next `/api` rewrite makes the browser
set/read those cookies on the `:3000` origin, and Next forwards them server-side
to `:8000`.

**Backend/Google config required for live end-to-end** (documented, not code in
this repo):
- Google OAuth **Authorized redirect URI** → `http://localhost:3000/api/auth/google/callback`.
- Backend `.env`: the OAuth `redirect_uri` and `POST_LOGIN_REDIRECT_URL` must use
  the `:3000` proxied URLs (`.../api/auth/google/callback` and e.g.
  `http://localhost:3000/onboarding/creating`).
- Backend running (`make up` → api/worker/beat/postgres/redis/rabbitmq).

Live OAuth **cannot be smoke-verified in this frontend task** without the backend
up and real Google credentials; `npm run build` verifies the frontend compiles.
A `.env.local.example` note documents `NEXT_PUBLIC_API_URL`.

## Routing & file structure

```
src/
  lib/
    session.ts            # CREATE: real auth client (env-gated) + backendConfigured()
    auth.ts               # MODIFY: keep mock; used only when backend not configured
    mailman.ts            # CREATE: typed client for the mailman endpoints
    api.ts                # (unchanged) apiFetch base
  components/
    app/
      Sidebar.tsx         # MODIFY: add "Mailman" nav item
      icons.tsx           # MODIFY: add MailmanIcon
    ui/
      TimeField.tsx       # CREATE: labeled <input type="time"> ("HH:MM")
      TagListEditor.tsx   # CREATE: add/remove chip list (domains/addresses/keywords)
    mailman/
      DeliveryScheduleCard.tsx  # CREATE
      DndCard.tsx               # CREATE
      VipCard.tsx               # CREATE
      HeldMailCard.tsx          # CREATE
      StatusBar.tsx             # CREATE
  app/
    login/page.tsx        # MODIFY: real "Continue with Google" when configured
    onboarding/layout.tsx # MODIFY: gate prefers real session when configured
    dashboard/
      layout.tsx          # MODIFY: gate prefers real session when configured
      mailman/page.tsx    # CREATE: the Mailman section
      settings/page.tsx   # MODIFY: sign-out uses real logout when configured
next.config.mjs           # (unchanged) proxy already present
.env.local.example        # MODIFY: note NEXT_PUBLIC_API_URL enables real backend
```

## Auth model (`src/lib/session.ts`)

- `backendConfigured(): boolean` — `!!process.env.NEXT_PUBLIC_API_URL`.
- `startGoogleLogin(): void` — full-page nav:
  `window.location.href = "/api/auth/google/login"` (proxied → backend). A
  full navigation (not `fetch`) is required so the browser follows the Google
  redirect chain and stores the resulting cookies.
- `getMe(): Promise<UserRead | null>` — `GET /api/auth/me`; returns `null` on 401.
- `logout(): Promise<void>` — `POST /api/auth/logout`.
- `UserRead` type: `{ id: string; email: string; name?: string | null; ... }`
  (mirror the backend `schemas/user.py` shape; extra fields tolerated).

**Unified gate helper** used by the layouts (client-side, after mount):
- If `backendConfigured()` → `await getMe()`; authed iff non-null. (Onboarding
  is considered satisfied under real auth — the backend has no onboarding flag,
  so real sessions go straight to `/dashboard`.)
- Else → fall back to the existing mock `isAuthed()` / `isOnboarded()`.

Render nothing (or "Loading…") until the check resolves — same no-flash pattern
as today.

## Login page

- When `backendConfigured()`: primary "Continue with Google" calls
  `startGoogleLogin()` (real). Outlook stays a disabled/"coming soon" affordance.
- When not configured: the existing mock buttons (unchanged), which set the
  mock flag and route into the mock onboarding.
- A small line states which mode is active ("Connected to InboxOS backend" vs
  "Demo sign-in — no backend configured").

## Mailman section (`/dashboard/mailman`)

Client page. On mount, if `backendConfigured()` it loads `status`, `settings`,
`vip`, `held` in parallel; otherwise it shows a non-blocking banner
("Not connected to the InboxOS backend — connect it to manage batched delivery")
and renders the controls in a **read-only/local preview** state (no fabricated
data; lists empty, numbers `—`).

Cards:
1. **StatusBar** — master switch (Batching on/off → `POST /start` / `/stop`),
   `held_count`, and `last_delivery_at` ("Last delivered …" or "—").
2. **DeliveryScheduleCard** — `delivery_mode` segmented control (Interval /
   Times per day / Custom times):
   - *Interval* → `interval_hours` (Stepper 1–24) or `interval_minutes`
     (Stepper 1–1440) — one active sub-control per the mode's convention.
   - *Times per day* → `times_per_day` (Stepper 1–24).
   - *Custom times* → editable `custom_times` list via `TimeField`s (add/remove).
   - Active window: `active_window_start` / `active_window_end` (`TimeField`).
   - Timezone: a text/select field bound to `timezone`.
3. **DndCard** — `dnd_enabled` Toggle + `dnd_start` / `dnd_end` `TimeField`s
   (shown when enabled).
4. **VipCard** — three `TagListEditor`s: `domains`, `addresses`, `keywords`.
5. **HeldMailCard** — list of `EmailSummary` (sender · subject · snippet · date);
   empty state "Nothing held right now."

A "Save changes" button (dirty-gated) issues `PUT /settings` and `PUT /vip`
(only when the backend is configured). Client-side validation mirrors the
backend bounds; the button is disabled until a field changes.

## Shared primitives

- `TimeField` — `{ label?: string; value: string; onChange: (v: string) => void;
  disabled?: boolean }` — wraps `<input type="time">`, value `"HH:MM"`.
- `TagListEditor` — `{ label: string; placeholder?: string; values: string[];
  onChange: (values: string[]) => void }` — chips with remove buttons + an add
  input (Enter or "+"), de-duplicates, trims.

Reuses existing `Toggle`, `Stepper`, `Tabs`, `Card`, `Button`, `PageHeader`,
`Topbar`.

## Navigation

Add **Mailman** to the sidebar nav (new `MailmanIcon`), placed after
Categorization (both govern what reaches the inbox). Order becomes: Dashboard,
Categorization, Mailman, Drafts, Notetaker, Scheduling, Chat, Settings.

## Error handling & states

- `getMe()` / mailman GETs failing → treat as "not connected"; show the banner,
  never crash. `ApiError` from `apiFetch` is caught per call.
- Save failures surface an inline error ("Couldn't save — check the backend");
  the button re-enables.
- Real-auth login failures are handled by the backend's own redirect (the
  frontend only initiates the redirect).

## Testing

No automated harness (consistent with prior specs). Verification:
- `npm run build` green (frontend compiles; both env modes typecheck).
- Manual (mock mode, no `NEXT_PUBLIC_API_URL`): existing flow unchanged;
  `/dashboard/mailman` renders the "not connected" banner + inert controls.
- Manual (live mode, backend up + Google creds + redirect URIs configured):
  login → Google → `/dashboard`; Mailman loads real settings/VIP/held; edits
  save; start/stop toggles batching. (Requires infra outside this repo.)

## Out of scope

- Standing up / configuring the backend, Google OAuth credentials, or the
  Google Cloud console redirect URIs (documented, not automated here).
- Replacing the mock login entirely (kept as the offline fallback by decision).
- Other backend domains (users/integrations/webhooks) beyond auth + mailman.
- Real-time updates/websockets for held mail (manual refresh only).
