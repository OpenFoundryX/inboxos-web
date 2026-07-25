# InboxOS Mailman Section + Real Backend Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an env-gated real Google-OAuth connection to the InboxPilot backend and a Mailman section (`/dashboard/mailman`) — batched delivery scheduling, Do Not Disturb, and a VIP allowlist — built against the backend's real API.

**Architecture:** Next.js 14 App Router. A typed client (`lib/session.ts`, `lib/mailman.ts`) calls the backend through the existing `/api` proxy so `httponly` session cookies live on the frontend origin. When `NEXT_PUBLIC_API_URL` is set, the app uses the real Google-OAuth login and the live Mailman API; when unset, the existing mock login/flow is unchanged so the offline demo keeps working and stays build-verifiable.

**Tech Stack:** Next.js 14.2.5, React 18.3.1, TypeScript (strict), Tailwind CSS 3.4.6.

## Global Constraints

- Palette tokens only (`bg-cream`, `bg-card`, `text-ink`, `text-accent`, `accent-dark`, `border-black/5`, etc.) — never raw hex in components.
- Path alias `@/*` → `src/*`.
- **Env-gated:** `backendConfigured()` = `Boolean(process.env.NEXT_PUBLIC_API_URL)`. When false, behavior falls back to the existing mock helpers in `@/lib/auth` (`isAuthed`, `isOnboarded`, `signIn`, `signOut`). Never remove the mock path.
- All backend calls go through `@/lib/api`'s `apiFetch` (path is prefixed with `/api`, which `next.config.mjs` rewrites to `$NEXT_PUBLIC_API_URL/v1`). Never call the backend origin directly (cookie constraint).
- Types mirror the backend schemas exactly, including enum values (`"interval" | "times" | "custom_daily"`) and numeric bounds (interval_hours 1–24, interval_minutes 1–1440, times_per_day 1–24). Times are `"HH:MM"` strings.
- Empty states only — no fabricated metrics/emails/meetings. Numeric slots render `—`; lists render honest empty states.
- **Lint:** `react/no-unescaped-entities` is on. Any literal apostrophe in JSX text must be written `&apos;`.
- **No automated test suite** (out of scope). Verification is `npm run build` green. The build runs with `NEXT_PUBLIC_API_URL` unset, so it exercises the mock/offline branch; the real-auth branch must still typecheck. There is no `npm test`.
- **Git hygiene:** git root is `/Users/abcom/Desktop` (project is a subdirectory). NEVER `git init`, NEVER `git add -A`/`git add .`. Stage only the explicit files each task lists. Commit from `/Users/abcom/Desktop/openfoundry/inboxos-web`.
- Reuse existing primitives: `@/components/ui/{Button,Card,Toggle,Tabs,Stepper}`, `@/components/app/{Topbar,PageHeader,icons}`.

**Backend contract (verified in `/Users/abcom/Desktop/openfoundry/InboxPilot`, frontend paths shown):**
- Auth: `GET /api/auth/google/login` (full-page redirect), `GET /api/auth/me` → `UserRead`, `POST /api/auth/logout` (204).
- `UserRead`: `{ id: string; email: string; full_name?: string|null; picture?: string|null; is_active: boolean; last_login_at?: string|null }`.
- Mailman: `GET /api/mailman/status` → `{is_active, held_count}`; `GET|PUT /api/mailman/settings`; `GET|PUT /api/mailman/vip`; `GET /api/mailman/held` → `EmailSummary[]`; `POST /api/mailman/start|stop` → settings.

---

## File structure

```
src/
  lib/
    api.ts              # MODIFY: tolerate 204/empty responses
    session.ts          # CREATE: real auth client + backendConfigured + checkAccess
    mailman.ts          # CREATE: typed mailman client + defaults
  components/
    app/
      icons.tsx         # MODIFY: add MailmanIcon
      Sidebar.tsx       # MODIFY: add Mailman nav item
      WorkspaceMenu.tsx # MODIFY: sign-out uses real logout when configured
    ui/
      TimeField.tsx     # CREATE
      TagListEditor.tsx # CREATE
    mailman/
      StatusBar.tsx            # CREATE
      DeliveryScheduleCard.tsx # CREATE
      DndCard.tsx              # CREATE
      VipCard.tsx              # CREATE
      HeldMailCard.tsx         # CREATE
  app/
    login/page.tsx          # MODIFY: real Google login when configured
    onboarding/layout.tsx   # MODIFY: gate via checkAccess
    dashboard/layout.tsx    # MODIFY: gate via checkAccess
    dashboard/settings/page.tsx # MODIFY: sign-out uses real logout when configured
    dashboard/mailman/page.tsx  # CREATE
.env.local.example        # MODIFY: document real-auth prerequisites
```

---

### Task 1: API 204 handling + session client

**Files:**
- Modify: `src/lib/api.ts`
- Create: `src/lib/session.ts`

**Interfaces:**
- Produces: `session.ts` exports `backendConfigured(): boolean`, `startGoogleLogin(): void`, `getMe(): Promise<UserRead | null>`, `logout(): Promise<void>`, `checkAccess(): Promise<{ authed: boolean; onboarded: boolean }>`, and `type UserRead`.

- [ ] **Step 1: Modify `src/lib/api.ts`** — replace the body of `apiFetch` after the `!res.ok` check so empty/204 responses don't crash `.json()`.

Replace:

```ts
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
```

with:

```ts
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
```

- [ ] **Step 2: Create `src/lib/session.ts`**

```ts
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS (route list unchanged from prior feature).

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts src/lib/session.ts
git commit -m "feat: env-gated backend session client + api 204 handling"
```

---

### Task 2: Wire gates, login, and sign-out (env-gated)

**Files:**
- Modify: `src/app/onboarding/layout.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/app/WorkspaceMenu.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: `checkAccess`, `backendConfigured`, `startGoogleLogin`, `logout` from `@/lib/session`; existing `signIn`, `isOnboarded`, `signOut`, `resetOnboarding` from `@/lib/auth`.

- [ ] **Step 1: Rewrite `src/app/onboarding/layout.tsx`** — swap the mock gate for `checkAccess`. Full file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { checkAccess } from "@/lib/session";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { SettingsIcon } from "@/components/app/icons";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    checkAccess().then(({ authed }) => {
      if (!active) return;
      if (!authed) {
        router.replace("/login");
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream text-ink/40">Loading…</div>
    );
  }

  if (pathname.startsWith("/onboarding/creating")) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-accent">
          InboxOS
        </Link>
        <SettingsIcon className="h-5 w-5 text-ink/30" />
      </header>
      <div className="mx-auto flex max-w-5xl gap-10 px-8 pb-16">
        <aside className="hidden w-56 shrink-0 pt-6 md:block">
          <OnboardingStepper />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/app/dashboard/layout.tsx`** — gate via `checkAccess`. Full file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAccess } from "@/lib/session";
import Sidebar from "@/components/app/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    checkAccess().then(({ authed, onboarded }) => {
      if (!active) return;
      if (!authed) {
        router.replace("/login");
        return;
      }
      if (!onboarded) {
        router.replace("/onboarding/creating");
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream text-ink/40">Loading…</div>
    );
  }

  return (
    <div className="flex h-screen bg-cream">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/login/page.tsx`** — real Google login when configured; mock otherwise. Full file:

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { signIn, isOnboarded } from "@/lib/auth";
import { backendConfigured, startGoogleLogin } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const configured = backendConfigured();

  function mockSignIn() {
    signIn();
    router.replace(isOnboarded() ? "/dashboard" : "/onboarding/creating");
  }

  function handleGoogle() {
    if (configured) startGoogleLogin();
    else mockSignIn();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <Link href="/" className="mb-8 text-2xl font-extrabold tracking-tight text-accent">
        InboxOS
      </Link>
      <Card className="w-full max-w-sm p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">Sign in to organize your inbox.</p>
        <div className="mt-8 space-y-3">
          <Button variant="dark" onClick={handleGoogle} className="w-full">
            Continue with Google
          </Button>
          <Button
            variant="outline"
            onClick={configured ? undefined : mockSignIn}
            disabled={configured}
            className="w-full"
          >
            Continue with Outlook
          </Button>
        </div>
        <p className="mt-6 text-xs text-ink/40">
          {configured
            ? "Connected to the InboxOS backend."
            : "Demo sign-in — no backend configured."}
        </p>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Modify `src/components/app/WorkspaceMenu.tsx`** — real logout when configured.

Change the auth import line to add the session import (place it after the existing `signOut` import):

```tsx
import { signOut } from "@/lib/auth";
import { backendConfigured, logout } from "@/lib/session";
```

Replace `handleSignOut`:

```tsx
  async function handleSignOut() {
    if (backendConfigured()) await logout();
    signOut();
    router.replace("/");
  }
```

- [ ] **Step 5: Modify `src/app/dashboard/settings/page.tsx`** — real logout when configured.

Add after the existing `@/lib/auth` import:

```tsx
import { backendConfigured, logout } from "@/lib/session";
```

Replace `handleSignOut`:

```tsx
  async function handleSignOut() {
    if (backendConfigured()) await logout();
    signOut();
    router.replace("/");
  }
```

- [ ] **Step 6: Overwrite `.env.local.example`** with documentation of the real-auth prerequisites:

```bash
# URL of the InboxOS (InboxPilot) FastAPI backend.
# When set, the web app uses the REAL Google-OAuth login and the live API,
# proxying /api/* -> $NEXT_PUBLIC_API_URL/v1/* (see next.config.mjs).
# When unset, the app runs in mock/demo mode (no backend calls).
NEXT_PUBLIC_API_URL=http://localhost:8000

# For live Google auth to work end-to-end (cookies must land on the :3000 origin,
# so all auth flows through the /api proxy), configure the BACKEND + Google console:
#   - Google OAuth Authorized redirect URI:
#       http://localhost:3000/api/auth/google/callback
#   - Backend .env: OAuth redirect_uri + POST_LOGIN_REDIRECT_URL must use the
#       :3000 proxied URLs (e.g. http://localhost:3000/dashboard).
#   - Backend running: `make up` (api/worker/beat/postgres/redis/rabbitmq).
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: PASS. `NEXT_PUBLIC_API_URL` is unset during build, so gates use the mock branch — existing flow behavior is preserved. Route list unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/app/onboarding/layout.tsx src/app/dashboard/layout.tsx src/app/login/page.tsx src/components/app/WorkspaceMenu.tsx src/app/dashboard/settings/page.tsx .env.local.example
git commit -m "feat: env-gated real Google auth across gates, login, sign-out"
```

---

### Task 3: Mailman client + form primitives

**Files:**
- Create: `src/lib/mailman.ts`
- Create: `src/components/ui/TimeField.tsx`
- Create: `src/components/ui/TagListEditor.tsx`

**Interfaces:**
- Produces:
  - `mailman.ts`: types `DeliveryMode`, `MailmanSettings`, `SettingsUpdate`, `Vip`, `VipUpdate`, `MailmanStatus`, `HeldEmail`; constants `DEFAULT_SETTINGS`, `DEFAULT_VIP`; functions `getStatus`, `getSettings`, `updateSettings`, `getVip`, `updateVip`, `listHeld`, `startBatching`, `stopBatching`.
  - `TimeField`: `{ label?: string; value: string; onChange: (v: string) => void; disabled?: boolean }`.
  - `TagListEditor`: `{ label: string; placeholder?: string; values: string[]; onChange: (values: string[]) => void; disabled?: boolean }`.

- [ ] **Step 1: Create `src/lib/mailman.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/components/ui/TimeField.tsx`**

```tsx
"use client";

type TimeFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function TimeField({ label, value, onChange, disabled }: TimeFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      {label ? <span className="text-xs font-medium text-ink/60">{label}</span> : null}
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink focus:outline-none disabled:opacity-50"
      />
    </label>
  );
}
```

- [ ] **Step 3: Create `src/components/ui/TagListEditor.tsx`**

```tsx
"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/app/icons";

type TagListEditorProps = {
  label: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
};

export default function TagListEditor({
  label,
  placeholder,
  values,
  onChange,
  disabled,
}: TagListEditorProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-ink/70">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs text-ink">
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              disabled={disabled}
              className="text-ink/40 hover:text-ink disabled:opacity-50"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        {values.length === 0 ? <span className="text-xs text-ink/40">None yet</span> : null}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream text-ink hover:bg-ink/5 disabled:opacity-50"
          aria-label="Add"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mailman.ts src/components/ui/TimeField.tsx src/components/ui/TagListEditor.tsx
git commit -m "feat: mailman api client + TimeField/TagListEditor primitives"
```

---

### Task 4: Mailman card components

**Files:**
- Create: `src/components/mailman/StatusBar.tsx`, `DeliveryScheduleCard.tsx`, `DndCard.tsx`, `VipCard.tsx`, `HeldMailCard.tsx`

**Interfaces:**
- Consumes: `Card`, `Toggle`, `Tabs`, `Stepper`, `TimeField`, `TagListEditor`; types from `@/lib/mailman`.
- Produces:
  - `StatusBar`: `{ active: boolean; heldCount: number | null; lastDeliveryAt: string | null; disabled?: boolean; onToggle: (v: boolean) => void }`.
  - `DeliveryScheduleCard`: `{ settings: MailmanSettings; disabled?: boolean; onChange: (patch: Partial<MailmanSettings>) => void }`.
  - `DndCard`: same props shape as DeliveryScheduleCard.
  - `VipCard`: `{ vip: Vip; disabled?: boolean; onChange: (patch: Partial<Vip>) => void }`.
  - `HeldMailCard`: `{ held: HeldEmail[] }`.

- [ ] **Step 1: Create `src/components/mailman/StatusBar.tsx`**

```tsx
"use client";

import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";

type StatusBarProps = {
  active: boolean;
  heldCount: number | null;
  lastDeliveryAt: string | null;
  disabled?: boolean;
  onToggle: (v: boolean) => void;
};

export default function StatusBar({ active, heldCount, lastDeliveryAt, disabled, onToggle }: StatusBarProps) {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Toggle checked={active} onChange={onToggle} disabled={disabled} label="Batching active" />
        <div>
          <div className="text-sm font-bold text-ink">Batched delivery {active ? "on" : "off"}</div>
          <div className="text-xs text-ink/50">
            {active
              ? "Incoming mail is held and delivered on your schedule."
              : "Mail lands in your inbox as it arrives."}
          </div>
        </div>
      </div>
      <div className="flex gap-8">
        <div>
          <div className="text-xs text-ink/50">Held now</div>
          <div className="text-lg font-extrabold text-ink">{heldCount ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-ink/50">Last delivery</div>
          <div className="text-sm font-semibold text-ink/70">
            {lastDeliveryAt ? new Date(lastDeliveryAt).toLocaleString() : "—"}
          </div>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Create `src/components/mailman/DeliveryScheduleCard.tsx`**

```tsx
"use client";

import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Stepper from "@/components/ui/Stepper";
import TimeField from "@/components/ui/TimeField";
import type { DeliveryMode, MailmanSettings } from "@/lib/mailman";

const MODE_LABEL: Record<DeliveryMode, string> = {
  interval: "Interval",
  times: "Times per day",
  custom_daily: "Custom times",
};
const LABEL_MODE: Record<string, DeliveryMode> = {
  Interval: "interval",
  "Times per day": "times",
  "Custom times": "custom_daily",
};

type Props = {
  settings: MailmanSettings;
  disabled?: boolean;
  onChange: (patch: Partial<MailmanSettings>) => void;
};

export default function DeliveryScheduleCard({ settings, disabled, onChange }: Props) {
  const times = settings.custom_times;

  function setTime(i: number, v: string) {
    const next = [...times];
    next[i] = v;
    onChange({ custom_times: next });
  }

  return (
    <Card className="p-5">
      <div className="mb-4 text-sm font-bold text-ink">Delivery schedule</div>
      <Tabs
        tabs={["Interval", "Times per day", "Custom times"]}
        active={MODE_LABEL[settings.delivery_mode]}
        onChange={(t) => onChange({ delivery_mode: LABEL_MODE[t] })}
        className="mb-6"
      />

      {settings.delivery_mode === "interval" ? (
        <div className="max-w-xs">
          <div className="mb-2 text-sm text-ink/60">Deliver every</div>
          <Stepper
            value={settings.interval_hours ?? 4}
            onChange={(v) => onChange({ interval_hours: v, interval_minutes: null })}
            min={1}
            max={24}
            suffix="hours"
          />
        </div>
      ) : settings.delivery_mode === "times" ? (
        <div className="max-w-xs">
          <div className="mb-2 text-sm text-ink/60">Deliveries per day</div>
          <Stepper
            value={settings.times_per_day ?? 3}
            onChange={(v) => onChange({ times_per_day: v })}
            min={1}
            max={24}
            suffix="times"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-ink/60">Deliver at these times</div>
          <div className="flex flex-wrap gap-3">
            {times.map((t, i) => (
              <div key={i} className="flex items-end gap-1">
                <TimeField value={t} onChange={(v) => setTime(i, v)} disabled={disabled} />
                <button
                  type="button"
                  onClick={() => onChange({ custom_times: times.filter((_, idx) => idx !== i) })}
                  disabled={disabled}
                  className="mb-2 text-ink/40 hover:text-ink disabled:opacity-50"
                  aria-label="Remove time"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange({ custom_times: [...times, "12:00"] })}
            disabled={disabled}
            className="text-sm font-medium text-accent hover:text-accent-dark disabled:opacity-50"
          >
            + Add time
          </button>
        </div>
      )}

      <div className="mt-6 grid max-w-md gap-4 sm:grid-cols-2">
        <TimeField
          label="Active window start"
          value={settings.active_window_start}
          onChange={(v) => onChange({ active_window_start: v })}
          disabled={disabled}
        />
        <TimeField
          label="Active window end"
          value={settings.active_window_end}
          onChange={(v) => onChange({ active_window_end: v })}
          disabled={disabled}
        />
      </div>
      <label className="mt-4 flex max-w-md flex-col gap-1">
        <span className="text-xs font-medium text-ink/60">Timezone</span>
        <input
          value={settings.timezone}
          onChange={(e) => onChange({ timezone: e.target.value })}
          disabled={disabled}
          placeholder="e.g. Asia/Kolkata"
          className="rounded-xl border border-black/10 bg-card px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-50"
        />
      </label>
    </Card>
  );
}
```

- [ ] **Step 3: Create `src/components/mailman/DndCard.tsx`**

```tsx
"use client";

import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import TimeField from "@/components/ui/TimeField";
import type { MailmanSettings } from "@/lib/mailman";

type Props = {
  settings: MailmanSettings;
  disabled?: boolean;
  onChange: (patch: Partial<MailmanSettings>) => void;
};

export default function DndCard({ settings, disabled, onChange }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-ink">Do Not Disturb</div>
          <div className="text-xs text-ink/50">Hold everything except VIPs during quiet hours.</div>
        </div>
        <Toggle
          checked={settings.dnd_enabled}
          onChange={(v) => onChange({ dnd_enabled: v })}
          disabled={disabled}
          label="Do Not Disturb"
        />
      </div>
      {settings.dnd_enabled ? (
        <div className="mt-4 grid max-w-md gap-4 sm:grid-cols-2">
          <TimeField
            label="Quiet hours start"
            value={settings.dnd_start ?? "22:00"}
            onChange={(v) => onChange({ dnd_start: v })}
            disabled={disabled}
          />
          <TimeField
            label="Quiet hours end"
            value={settings.dnd_end ?? "07:00"}
            onChange={(v) => onChange({ dnd_end: v })}
            disabled={disabled}
          />
        </div>
      ) : null}
    </Card>
  );
}
```

- [ ] **Step 4: Create `src/components/mailman/VipCard.tsx`**

```tsx
"use client";

import Card from "@/components/ui/Card";
import TagListEditor from "@/components/ui/TagListEditor";
import type { Vip } from "@/lib/mailman";

type Props = {
  vip: Vip;
  disabled?: boolean;
  onChange: (patch: Partial<Vip>) => void;
};

export default function VipCard({ vip, disabled, onChange }: Props) {
  return (
    <Card className="space-y-5 p-5">
      <div>
        <div className="text-sm font-bold text-ink">VIP list</div>
        <div className="text-xs text-ink/50">These always break through batching and Do Not Disturb.</div>
      </div>
      <TagListEditor label="Domains" placeholder="acme.com" values={vip.domains} disabled={disabled} onChange={(v) => onChange({ domains: v })} />
      <TagListEditor label="Addresses" placeholder="ceo@acme.com" values={vip.addresses} disabled={disabled} onChange={(v) => onChange({ addresses: v })} />
      <TagListEditor label="Keywords" placeholder="urgent" values={vip.keywords} disabled={disabled} onChange={(v) => onChange({ keywords: v })} />
    </Card>
  );
}
```

- [ ] **Step 5: Create `src/components/mailman/HeldMailCard.tsx`**

```tsx
"use client";

import Card from "@/components/ui/Card";
import type { HeldEmail } from "@/lib/mailman";

export default function HeldMailCard({ held }: { held: HeldEmail[] }) {
  return (
    <Card className="p-5">
      <div className="mb-4 text-sm font-bold text-ink">Held mail</div>
      {held.length === 0 ? (
        <div className="py-8 text-center text-sm text-ink/40">Nothing held right now.</div>
      ) : (
        <ul className="divide-y divide-black/5">
          {held.map((m, i) => (
            <li key={m.id ?? i} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-ink">{m.sender ?? "Unknown sender"}</span>
                <span className="shrink-0 text-xs text-ink/40">
                  {m.date ? new Date(m.date).toLocaleDateString() : ""}
                </span>
              </div>
              <div className="truncate text-sm text-ink/70">{m.subject ?? "(no subject)"}</div>
              {m.snippet ? <div className="truncate text-xs text-ink/40">{m.snippet}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: PASS (components compile; not yet routed).

- [ ] **Step 7: Commit**

```bash
git add src/components/mailman/StatusBar.tsx src/components/mailman/DeliveryScheduleCard.tsx src/components/mailman/DndCard.tsx src/components/mailman/VipCard.tsx src/components/mailman/HeldMailCard.tsx
git commit -m "feat: mailman card components"
```

---

### Task 5: Mailman page + nav + icon

**Files:**
- Modify: `src/components/app/icons.tsx`
- Modify: `src/components/app/Sidebar.tsx`
- Create: `src/app/dashboard/mailman/page.tsx`

**Interfaces:**
- Consumes: `Topbar`, `PageHeader`, `Button`, `Card`; the five mailman cards; `backendConfigured` from `@/lib/session`; the `@/lib/mailman` client + defaults + types.
- Produces: `MailmanIcon` export; `/dashboard/mailman` route.

- [ ] **Step 1: Add `MailmanIcon` to `src/components/app/icons.tsx`** — add this export (uses the existing `Base` wrapper), e.g. after `ChatIcon`:

```tsx
export function MailmanIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 12a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v6H3z" />
      <path d="M8 7v6M3 12h18" />
      <path d="M16 3h3v4" />
    </Base>
  );
}
```

- [ ] **Step 2: Modify `src/components/app/Sidebar.tsx`** — add the Mailman nav item after Categorization.

Add `MailmanIcon` to the icon import list, then insert into `NAV` between the Categorization and Drafts entries:

```tsx
  { href: "/dashboard/mailman", label: "Mailman", Icon: MailmanIcon },
```

- [ ] **Step 3: Create `src/app/dashboard/mailman/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatusBar from "@/components/mailman/StatusBar";
import DeliveryScheduleCard from "@/components/mailman/DeliveryScheduleCard";
import DndCard from "@/components/mailman/DndCard";
import VipCard from "@/components/mailman/VipCard";
import HeldMailCard from "@/components/mailman/HeldMailCard";
import { backendConfigured } from "@/lib/session";
import {
  DEFAULT_SETTINGS,
  DEFAULT_VIP,
  getSettings,
  getStatus,
  getVip,
  listHeld,
  updateSettings,
  updateVip,
  startBatching,
  stopBatching,
  type HeldEmail,
  type MailmanSettings,
  type Vip,
} from "@/lib/mailman";

export default function MailmanPage() {
  const configured = backendConfigured();
  const [loading, setLoading] = useState(configured);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState<MailmanSettings>(DEFAULT_SETTINGS);
  const [vip, setVip] = useState<Vip>(DEFAULT_VIP);
  const [held, setHeld] = useState<HeldEmail[]>([]);
  const [heldCount, setHeldCount] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    (async () => {
      try {
        const [s, v, st, h] = await Promise.all([getSettings(), getVip(), getStatus(), listHeld()]);
        if (!active) return;
        setSettings(s);
        setVip(v);
        setHeldCount(st.held_count);
        setHeld(h);
        setConnected(true);
      } catch {
        if (active) setConnected(false);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [configured]);

  function patchSettings(patch: Partial<MailmanSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
    setDirty(true);
  }

  function patchVip(patch: Partial<Vip>) {
    setVip((v) => ({ ...v, ...patch }));
    setDirty(true);
  }

  async function toggleActive(next: boolean) {
    if (!connected) {
      setSettings((s) => ({ ...s, is_active: next }));
      return;
    }
    try {
      setSettings(next ? await startBatching() : await stopBatching());
    } catch {
      setError("Couldn't update batching — check the backend.");
    }
  }

  async function save() {
    if (!connected) return;
    setSaving(true);
    setError(null);
    try {
      const [s, v] = await Promise.all([
        updateSettings({
          timezone: settings.timezone,
          delivery_mode: settings.delivery_mode,
          interval_hours: settings.interval_hours,
          interval_minutes: settings.interval_minutes,
          times_per_day: settings.times_per_day,
          custom_times: settings.custom_times,
          active_window_start: settings.active_window_start,
          active_window_end: settings.active_window_end,
          dnd_enabled: settings.dnd_enabled,
          dnd_start: settings.dnd_start,
          dnd_end: settings.dnd_end,
        }),
        updateVip(vip),
      ]);
      setSettings(s);
      setVip(v);
      setDirty(false);
    } catch {
      setError("Couldn't save — check the backend.");
    } finally {
      setSaving(false);
    }
  }

  const controlsDisabled = configured && !connected;

  return (
    <>
      <Topbar title="Mailman">
        <Button variant="dark" disabled={!dirty || saving || !connected} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </Topbar>
      <div className="p-8">
        <PageHeader
          title="Batched delivery"
          subtitle="Hold incoming mail and deliver it on your schedule — with VIPs breaking through."
        />

        {!configured ? (
          <Card className="mb-6 p-4 text-sm text-ink/60">
            Not connected to the InboxOS backend. Set{" "}
            <code className="text-ink">NEXT_PUBLIC_API_URL</code> to manage batched delivery.
            Showing default preferences.
          </Card>
        ) : loading ? (
          <Card className="mb-6 p-4 text-sm text-ink/50">Loading your settings…</Card>
        ) : !connected ? (
          <Card className="mb-6 p-4 text-sm text-ink/60">
            Couldn&apos;t reach the InboxOS backend. Sign in and make sure it&apos;s running.
          </Card>
        ) : null}

        {error ? (
          <Card className="mb-6 border-accent/30 p-4 text-sm text-accent-dark">{error}</Card>
        ) : null}

        <div className="space-y-6">
          <StatusBar
            active={settings.is_active}
            heldCount={heldCount}
            lastDeliveryAt={settings.last_delivery_at}
            disabled={controlsDisabled}
            onToggle={toggleActive}
          />
          <DeliveryScheduleCard settings={settings} disabled={controlsDisabled} onChange={patchSettings} />
          <DndCard settings={settings} disabled={controlsDisabled} onChange={patchSettings} />
          <VipCard vip={vip} disabled={controlsDisabled} onChange={patchVip} />
          <HeldMailCard held={held} />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS. `/dashboard/mailman` appears in the route list. (Build runs unconfigured → the page shows the "Not connected" banner + local-preview controls.)

- [ ] **Step 5: Manual smoke (mock mode — no backend needed)**

`npm run dev`: sign in (mock) → `/dashboard/mailman` renders, banner shows "Not connected", the delivery/DND/VIP controls edit locally, "Save changes" stays disabled, Held mail shows the empty state. Sidebar highlights Mailman.

- [ ] **Step 6: Commit**

```bash
git add src/components/app/icons.tsx src/components/app/Sidebar.tsx src/app/dashboard/mailman/page.tsx
git commit -m "feat: mailman section page + sidebar nav"
```

---

## Self-review notes

- **Spec coverage:** env-gated real auth (session client, gates, login, sign-out, env docs) ✓; Mailman client typed to the contract ✓; delivery-schedule (3 modes) + active window + timezone ✓; DND ✓; VIP (3 lists) ✓; held mail ✓; nav + icon ✓; honest connected/loading/not-connected/error/empty states ✓; no fabricated data ✓; interval mode pinned to `interval_hours` (single control) ✓.
- **Type consistency:** `patchSettings`/`patchVip` produce `Partial<MailmanSettings>`/`Partial<Vip>`; cards' `onChange` accept exactly those. `checkAccess()` returns `{authed, onboarded}` consumed by both layouts. `apiFetch` now tolerates 204 (used by `logout`).
- **Non-breaking:** build runs with `NEXT_PUBLIC_API_URL` unset → mock branch everywhere; existing routes/flows unchanged. Real branch typechecks but is only exercised at runtime when configured.
- **Cookie constraint** honored: every auth/data call is a `/api/...` proxied path; login is a full-page nav to `/api/auth/google/login`.
- **No test harness:** verification is `npm run build` + manual smoke (mock mode here; live mode needs backend + Google creds, documented in `.env.local.example`).
```
