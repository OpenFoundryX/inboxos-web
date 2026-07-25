# InboxOS Onboarding + Full App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the post-login onboarding wizard and the full InboxOS app surface (rich dashboard + Categorization, Drafts, Notetaker, Scheduling, Chat, Settings) on top of the existing landing + app shell.

**Architecture:** Next.js 14 App Router. A mock-auth gate already protects `/dashboard`; we add a second mock flag (`onboarded`) and an onboarding route group with a client-driven wizard, then rebuild the dashboard into a two-state (setup-progress → mature) view and add designed, interactive-but-empty app pages. All controls hold real local React state; nothing persists to a backend.

**Tech Stack:** Next.js 14.2.5, React 18.3.1, TypeScript (strict), Tailwind CSS 3.4.6, `next/font` (Inter).

## Global Constraints

- Palette tokens (already in `tailwind.config.ts`): cream `#F3F1EA`, card `#FCFBF7`, ink `#1A1D26`, muted `#6B7280`, accent `#F0562D`, accent-dark `#D8451F`. Use these token names (`bg-cream`, `text-ink`, `bg-accent`, etc.) — never raw hex in components.
- Path alias `@/*` → `src/*`.
- Auth is **mock only**: localStorage flags + non-HttpOnly cookies. No real OAuth, no backend/API calls, no data fetching.
- **Empty states only**: no fabricated metrics, emails, or meetings. Numeric stat slots render `—`. The setup-progress ring reflects a genuine client-driven setup sequence, not a fabricated percentage. Interactive controls (toggles/tabs/radios/steppers) hold real local state only.
- No external image assets. Integration glyphs are neutral inline SVG/letters, not trademarked third-party logos.
- Typography/shape: pill buttons (`rounded-full`), `rounded-2xl` cards, display headings `font-extrabold tracking-tight`.
- **No automated test harness exists** (out of scope). Each task's verification is `npm run build` passing green (plus the noted manual smoke check). There is no `npm test`; do not add a test runner.
- **Git hygiene:** the git root is `/Users/abcom/Desktop` (the project is a subdirectory). NEVER `git init`, NEVER `git add -A` / `git add .` at the repo root. Stage only the specific project files each task creates or modifies, by explicit path. Commit from the project directory `openfoundry/inboxos-web`.
- Reuse existing primitives: `@/components/ui/Button` (variants `primary`/`dark`/`outline`, optional `href`), `@/components/ui/Card` (`rounded-2xl border border-black/5 bg-card`), `@/components/app/PageHeader`.

**Note on spec deviation:** the design spec listed a `SegmentedControl` primitive; this plan folds the segmented-pill look into `Tabs` and does not create a separate `SegmentedControl` (YAGNI — no second consumer). This is intentional.

---

## File structure

```
src/
  lib/
    auth.ts               # MODIFY: add onboarded + setup helpers
    integrations.ts       # CREATE: neutral glyph data for the orbit
  components/
    ui/
      Toggle.tsx          # CREATE
      Tabs.tsx            # CREATE
      RadioGroup.tsx      # CREATE
      Stepper.tsx         # CREATE
    app/
      icons.tsx           # MODIFY: add icons, remove InboxIcon
      Sidebar.tsx         # MODIFY: new nav + footer
      Topbar.tsx          # MODIFY: title + optional right actions
      TrialPill.tsx       # CREATE
      WorkspaceMenu.tsx   # CREATE
      ProgressRing.tsx    # CREATE
      SetupChecklist.tsx  # CREATE
      AnalyticsCard.tsx   # CREATE
      AskBar.tsx          # CREATE
      MeetingsPanel.tsx   # CREATE
    onboarding/
      OnboardingStepper.tsx # CREATE
      Orbit.tsx           # CREATE
  app/
    login/page.tsx        # MODIFY: route to onboarding when not onboarded
    onboarding/
      layout.tsx          # CREATE: gate + conditional stepper frame
      creating/page.tsx   # CREATE
      calendar/page.tsx   # CREATE
      inbox/page.tsx      # CREATE
      notes/page.tsx      # CREATE
    dashboard/
      layout.tsx          # MODIFY: also require onboarded
      page.tsx            # MODIFY: two-state dashboard
      inbox/page.tsx      # DELETE (route retired)
      categorization/page.tsx # CREATE
      drafts/page.tsx     # MODIFY: enriched
      notetaker/page.tsx  # CREATE
      scheduling/page.tsx # CREATE
      chat/page.tsx       # CREATE
      settings/page.tsx   # MODIFY: replay-onboarding + sign out
```

---

### Task 1: State helpers + UI primitives

**Files:**
- Modify: `src/lib/auth.ts`
- Create: `src/lib/integrations.ts`
- Create: `src/components/ui/Toggle.tsx`, `Tabs.tsx`, `RadioGroup.tsx`, `Stepper.tsx`

**Interfaces:**
- Produces:
  - `auth.ts`: `signIn()`, `signOut()`, `isAuthed()` (existing) plus `isOnboarded(): boolean`, `setOnboarded(): void`, `isSetupDone(): boolean`, `setSetupDone(): void`, `resetOnboarding(): void`.
  - `integrations.ts`: `INTEGRATIONS: { id: string; label: string; letter: string; className: string }[]`.
  - `Toggle`: `{ checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }`.
  - `Tabs`: `{ tabs: string[]; active: string; onChange: (t: string) => void; className?: string }`.
  - `RadioGroup`: options `{ value: string; label: string; description?: string }[]`; props `{ options; value: string; onChange: (v: string) => void }`.
  - `Stepper`: `{ value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }`.

- [ ] **Step 1: Extend `src/lib/auth.ts`** (append after the existing `isAuthed`)

Replace the whole file with:

```ts
const KEY = "inboxos_authed";
const ONBOARDED = "inboxos_onboarded";
const SETUP = "inboxos_setup_done";
const INBOX_PREF = "inboxos_inbox_pref";

function setFlag(key: string) {
  window.localStorage.setItem(key, "1");
  document.cookie = `${key}=1; path=/; max-age=${60 * 60 * 24 * 30}`;
}

function clearFlag(key: string) {
  window.localStorage.removeItem(key);
  document.cookie = `${key}=; path=/; max-age=0`;
}

export function signIn(): void {
  if (typeof window === "undefined") return;
  setFlag(KEY);
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  clearFlag(KEY);
  clearFlag(ONBOARDED);
  clearFlag(SETUP);
  window.localStorage.removeItem(INBOX_PREF);
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDED) === "1";
}

export function setOnboarded(): void {
  if (typeof window === "undefined") return;
  setFlag(ONBOARDED);
}

export function isSetupDone(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SETUP) === "1";
}

export function setSetupDone(): void {
  if (typeof window === "undefined") return;
  setFlag(SETUP);
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  clearFlag(ONBOARDED);
  clearFlag(SETUP);
  window.localStorage.removeItem(INBOX_PREF);
}
```

- [ ] **Step 2: Create `src/lib/integrations.ts`**

```ts
export type Integration = {
  id: string;
  label: string;
  letter: string;
  className: string;
};

// Neutral glyphs (letters + brand-neutral colors) for the onboarding orbit.
// Intentionally NOT real third-party logos.
export const INTEGRATIONS: Integration[] = [
  { id: "mail", label: "Email", letter: "M", className: "bg-accent/15 text-accent" },
  { id: "calendar", label: "Calendar", letter: "C", className: "bg-blue-500/15 text-blue-600" },
  { id: "meet", label: "Meetings", letter: "V", className: "bg-violet-500/15 text-violet-600" },
  { id: "chat", label: "Chat", letter: "S", className: "bg-emerald-500/15 text-emerald-600" },
  { id: "docs", label: "Docs", letter: "D", className: "bg-amber-500/15 text-amber-600" },
  { id: "crm", label: "CRM", letter: "R", className: "bg-rose-500/15 text-rose-600" },
];
```

- [ ] **Step 3: Create `src/components/ui/Toggle.tsx`**

```tsx
"use client";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
};

export default function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-ink" : "bg-ink/15"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/Tabs.tsx`**

```tsx
"use client";

type TabsProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
};

export default function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`inline-flex rounded-xl border border-black/5 bg-card p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === tab ? "bg-cream text-ink" : "text-ink/50 hover:text-ink"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/ui/RadioGroup.tsx`**

```tsx
"use client";

export type RadioOption = { value: string; label: string; description?: string };

type RadioGroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex w-full items-start gap-3 rounded-xl border border-black/5 bg-card p-4 text-left hover:border-ink/20"
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                selected ? "border-ink" : "border-ink/30"
              }`}
            >
              {selected ? <span className="h-2 w-2 rounded-full bg-ink" /> : null}
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{opt.label}</span>
              {opt.description ? (
                <span className="mt-0.5 block text-xs text-ink/50">{opt.description}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/ui/Stepper.tsx`**

```tsx
"use client";

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
};

export default function Stepper({ value, onChange, min = 0, max = 999, suffix }: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/5 bg-card p-2">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-lg text-ink disabled:opacity-40"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="text-sm font-semibold text-ink">
        {value}
        {suffix ? ` ${suffix}` : ""}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-lg text-ink disabled:opacity-40"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: PASS. New files compile; no route changes yet, so route list is unchanged from the shell.

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts src/lib/integrations.ts src/components/ui/Toggle.tsx src/components/ui/Tabs.tsx src/components/ui/RadioGroup.tsx src/components/ui/Stepper.tsx
git commit -m "feat: mock onboarding state helpers + ui primitives"
```

---

### Task 2: Icons, Sidebar refresh, Topbar, sidebar footer

**Files:**
- Modify: `src/components/app/icons.tsx`
- Modify: `src/components/app/Topbar.tsx`
- Modify: `src/components/app/Sidebar.tsx`
- Create: `src/components/app/TrialPill.tsx`
- Create: `src/components/app/WorkspaceMenu.tsx`

**Interfaces:**
- Consumes: `Toggle`/etc. not needed here; uses `signOut`, `resetOnboarding` not here.
- Produces:
  - `icons.tsx` new exports: `TagIcon`, `NoteIcon`, `CalendarIcon`, `ChatIcon`, `BellIcon`, `RefreshIcon`, `ChevronDownIcon`, `CheckIcon`, `CopyIcon`, `PlusIcon`, `MicIcon`. Keeps `DashboardIcon`, `DraftsIcon`, `SettingsIcon`, `SignOutIcon`, `SearchIcon`. Removes `InboxIcon`.
  - `Topbar`: `{ title: string; children?: ReactNode }` — right actions optional.
  - `TrialPill`: no props.
  - `WorkspaceMenu`: no props.

- [ ] **Step 1: Rewrite `src/components/app/icons.tsx`**

```tsx
type IconProps = { className?: string };

const svg = "h-5 w-5";

function Base({ className = svg, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function DashboardIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Base>
  );
}

export function TagIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </Base>
  );
}

export function DraftsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </Base>
  );
}

export function NoteIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Base>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </Base>
  );
}

export function ChatIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Base>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Base>
  );
}

export function SignOutIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Base>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Base>
  );
}

export function BellIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Base>
  );
}

export function RefreshIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </Base>
  );
}

export function ChevronDownIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  );
}

export function CopyIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Base>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function MicIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4" />
    </Base>
  );
}
```

- [ ] **Step 2: Rewrite `src/components/app/Topbar.tsx`**

```tsx
import type { ReactNode } from "react";

export default function Topbar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-card px-6 py-4">
      <h1 className="text-lg font-bold">{title}</h1>
      {children ? <div className="flex items-center gap-3">{children}</div> : null}
    </header>
  );
}
```

- [ ] **Step 3: Create `src/components/app/TrialPill.tsx`**

```tsx
import Link from "next/link";

export default function TrialPill() {
  return (
    <Link
      href="/#pricing"
      className="flex items-center justify-between rounded-xl border border-black/5 bg-cream px-3 py-2 text-xs font-medium text-ink/70 hover:text-ink"
    >
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
        14 days left of trial
      </span>
      <span aria-hidden>→</span>
    </Link>
  );
}
```

- [ ] **Step 4: Create `src/components/app/WorkspaceMenu.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { ChevronDownIcon, SignOutIcon } from "./icons";

export default function WorkspaceMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <div className="relative">
      {open ? (
        <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-black/5 bg-card shadow-lg">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-ink/70 hover:bg-ink/5"
          >
            <SignOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-cream px-3 py-2 text-left hover:border-ink/15"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
          NP
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">Your Workspace</span>
          <span className="block truncate text-xs text-ink/50">Free plan</span>
        </span>
        <ChevronDownIcon className="h-4 w-4 text-ink/40" />
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `src/components/app/Sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TrialPill from "./TrialPill";
import WorkspaceMenu from "./WorkspaceMenu";
import {
  DashboardIcon,
  TagIcon,
  DraftsIcon,
  NoteIcon,
  CalendarIcon,
  ChatIcon,
  SettingsIcon,
  BellIcon,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/dashboard/categorization", label: "Categorization", Icon: TagIcon },
  { href: "/dashboard/drafts", label: "Drafts", Icon: DraftsIcon },
  { href: "/dashboard/notetaker", label: "Notetaker", Icon: NoteIcon },
  { href: "/dashboard/scheduling", label: "Scheduling", Icon: CalendarIcon },
  { href: "/dashboard/chat", label: "Chat", Icon: ChatIcon },
  { href: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-black/5 bg-card p-4">
      <div className="flex items-center justify-between px-2 py-3">
        <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-accent">
          InboxOS
        </Link>
        <button className="text-ink/40 hover:text-ink" aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-4 flex-1 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                active ? "bg-accent/10 text-accent" : "text-ink/70 hover:bg-ink/5"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3">
        <TrialPill />
        <WorkspaceMenu />
      </div>
    </aside>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: PASS. Note: the existing `dashboard/inbox` page still imports nothing removed; `InboxIcon` is no longer imported anywhere (Sidebar no longer references it). Confirm no file still imports `InboxIcon` — grep: `grep -rn "InboxIcon" src` should return nothing.

- [ ] **Step 7: Commit**

```bash
git add src/components/app/icons.tsx src/components/app/Topbar.tsx src/components/app/Sidebar.tsx src/components/app/TrialPill.tsx src/components/app/WorkspaceMenu.tsx
git commit -m "feat: refresh sidebar nav, footer menu, topbar, icons"
```

---

### Task 3: Onboarding shell + creating/orbit screen

**Files:**
- Create: `src/components/onboarding/Orbit.tsx`
- Create: `src/components/onboarding/OnboardingStepper.tsx`
- Create: `src/app/onboarding/layout.tsx`
- Create: `src/app/onboarding/creating/page.tsx`

**Interfaces:**
- Consumes: `isAuthed` from `@/lib/auth`; `INTEGRATIONS` from `@/lib/integrations`; `CheckIcon` from icons.
- Produces: `Orbit` (no props), `OnboardingStepper` (no props, reads pathname). The onboarding layout gates on auth and renders the stepper frame for every child EXCEPT `/onboarding/creating` (full-bleed).

- [ ] **Step 1: Create `src/components/onboarding/Orbit.tsx`**

```tsx
import { INTEGRATIONS } from "@/lib/integrations";

export default function Orbit() {
  const n = INTEGRATIONS.length;
  const radius = 130;
  return (
    <div className="relative h-80 w-80">
      <div className="absolute inset-8 rounded-full border border-black/5" />
      <div className="absolute inset-16 rounded-full border border-black/5" />
      <div className="absolute inset-0 animate-[spin_28s_linear_infinite]">
        {INTEGRATIONS.map((it, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div
              key={it.id}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
            >
              <div className="animate-[spin_28s_linear_infinite_reverse]">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${it.className}`}
                  title={it.label}
                >
                  {it.letter}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/onboarding/OnboardingStepper.tsx`**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { CheckIcon } from "@/components/app/icons";

const STEPS = [
  { href: "/onboarding/calendar", label: "Connect calendar" },
  { href: "/onboarding/inbox", label: "Inbox setup" },
  { href: "/onboarding/notes", label: "Meeting notes" },
];

export default function OnboardingStepper() {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((s) => pathname.startsWith(s.href));

  return (
    <ol className="space-y-1">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={step.href} className="flex items-center gap-3 py-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-accent text-white"
                  : active
                    ? "border-2 border-accent text-accent"
                    : "border-2 border-ink/15 text-ink/30"
              }`}
            >
              {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={`text-sm font-medium ${
                active ? "text-ink" : done ? "text-ink/60" : "text-ink/30"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Create `src/app/onboarding/layout.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { SettingsIcon } from "@/components/app/icons";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream text-ink/40">Loading…</div>
    );
  }

  // The "creating" screen renders full-bleed without the stepper frame.
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

- [ ] **Step 4: Create `src/app/onboarding/creating/page.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Orbit from "@/components/onboarding/Orbit";

export default function CreatingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/onboarding/calendar"), 2500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <span className="text-2xl font-extrabold tracking-tight text-accent">InboxOS</span>
      <Orbit />
      <p className="text-lg font-semibold text-ink">Setting up your workspace…</p>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS. New routes `/onboarding/creating` appears in the route list. `/onboarding/calendar`, `/inbox`, `/notes` do not exist yet — the creating page redirects to a not-yet-existing route at runtime; that is fine for build (Task 4 adds them).

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/Orbit.tsx src/components/onboarding/OnboardingStepper.tsx src/app/onboarding/layout.tsx src/app/onboarding/creating/page.tsx
git commit -m "feat: onboarding shell + creating orbit screen"
```

---

### Task 4: Onboarding steps + flow wiring (login + dashboard gate)

**Files:**
- Create: `src/app/onboarding/calendar/page.tsx`, `inbox/page.tsx`, `notes/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Delete: `src/app/dashboard/inbox/page.tsx`

**Interfaces:**
- Consumes: `Button`, `Card`, `Toggle`, `RadioGroup`; `setOnboarded`, `isOnboarded`, `isAuthed` from auth.
- Produces: the three wizard step routes; login now routes onboarded→`/dashboard`, else→`/onboarding/creating`; dashboard gate requires onboarded.

- [ ] **Step 1: Create `src/app/onboarding/calendar/page.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CalendarIcon } from "@/components/app/icons";

export default function CalendarStep() {
  const router = useRouter();
  const next = () => router.push("/onboarding/inbox");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight">How InboxOS uses your calendar</h1>
        <ul className="mt-6 space-y-4 text-sm text-ink/70">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
            We use meeting context to draft sharper follow-ups.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
            We help you schedule meetings faster.
          </li>
        </ul>
        <p className="mt-10 text-xs text-ink/40">
          InboxOS never sends emails on your behalf · disconnect anytime
        </p>
      </div>
      <Card className="flex flex-col items-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600">
          <CalendarIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold">Connect your calendar</h2>
        <p className="mt-2 text-sm text-ink/60">
          InboxOS syncs with your calendar to suggest your availability in draft emails.
        </p>
        <Button variant="dark" onClick={next} className="mt-6 w-full">
          Continue with Google
        </Button>
        <button onClick={next} className="mt-3 text-sm font-medium text-ink/50 hover:text-ink">
          Continue with Outlook
        </button>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/onboarding/inbox/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const OPTIONS = [
  {
    id: "attention",
    title: "Only what needs my attention",
    subtitle: "Your inbox shows what's important.",
    tags: ["To respond", "FYI"],
  },
  {
    id: "all",
    title: "All my emails",
    subtitle: "Your inbox shows everything but marketing.",
    tags: ["To respond", "FYI", "Comment", "Notification"],
  },
  {
    id: "none",
    title: "Don't label my emails",
    subtitle: "Keep your inbox exactly as it is.",
    tags: [],
  },
];

export default function InboxStep() {
  const router = useRouter();
  const [selected, setSelected] = useState("attention");

  function finish() {
    window.localStorage.setItem("inboxos_inbox_pref", selected);
    router.push("/onboarding/notes");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Choose what stays in your inbox</h1>
        <p className="mt-4 text-sm text-ink/60">
          InboxOS labels the emails you tell it to and moves them out of your inbox. You can change
          this anytime from your dashboard.
        </p>
      </div>
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const active = opt.id === selected;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                active ? "border-ink bg-card" : "border-black/5 bg-card hover:border-ink/20"
              }`}
            >
              <div className="text-sm font-bold text-ink">{opt.title}</div>
              <div className="mt-0.5 text-xs text-ink/50">{opt.subtitle}</div>
              {opt.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {opt.tags.map((t) => (
                    <span key={t} className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink/60">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
        <Button variant="dark" onClick={finish} className="w-full">
          Start organizing my inbox
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/onboarding/notes/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import { setOnboarded } from "@/lib/auth";

export default function NotesStep() {
  const router = useRouter();
  const [summarize, setSummarize] = useState(true);

  function finish() {
    setOnboarded();
    router.replace("/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Never write meeting notes again</h1>
        <p className="mt-3 text-sm text-ink/60">
          After every meeting you'll find actionable notes in your inbox and a follow-up email ready
          to send.
        </p>
        <div className="mt-6 h-40 rounded-xl bg-cream" />
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-ink">Summarize my meetings</div>
            <div className="mt-1 text-xs text-ink/50">
              InboxOS will join your meetings and handle the notes so you can focus on the
              conversation.
            </div>
          </div>
          <Toggle checked={summarize} onChange={setSummarize} label="Summarize my meetings" />
        </div>
      </Card>
      <Button variant="dark" onClick={finish} className="mt-6 w-full">
        Finish setup
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Modify `src/app/login/page.tsx`** — update imports and `handleSignIn`.

Change the import line:

```tsx
import { signIn, isOnboarded } from "@/lib/auth";
```

Replace `handleSignIn`:

```tsx
  function handleSignIn() {
    signIn();
    router.replace(isOnboarded() ? "/dashboard" : "/onboarding/creating");
  }
```

- [ ] **Step 5: Modify `src/app/dashboard/layout.tsx`** — require onboarded.

Change the import:

```tsx
import { isAuthed, isOnboarded } from "@/lib/auth";
```

Replace the effect body:

```tsx
  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding/creating");
      return;
    }
    setReady(true);
  }, [router]);
```

- [ ] **Step 6: Delete the retired inbox route**

```bash
git rm src/app/dashboard/inbox/page.tsx
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: PASS. Route list now includes `/onboarding/calendar`, `/onboarding/inbox`, `/onboarding/notes` and no longer includes `/dashboard/inbox`.

Manual smoke (optional here, full smoke at end): `npm run dev`, sign in → creating → calendar → inbox → notes → dashboard.

- [ ] **Step 8: Commit**

```bash
git add src/app/onboarding/calendar/page.tsx src/app/onboarding/inbox/page.tsx src/app/onboarding/notes/page.tsx src/app/login/page.tsx src/app/dashboard/layout.tsx
git commit -m "feat: onboarding steps + login/dashboard flow wiring"
```

---

### Task 5: Two-state dashboard

**Files:**
- Create: `src/components/app/ProgressRing.tsx`, `SetupChecklist.tsx`, `AnalyticsCard.tsx`, `AskBar.tsx`, `MeetingsPanel.tsx`
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `Card`, `Button`, `isSetupDone`, `setSetupDone`; icons `RefreshIcon`, `ChevronDownIcon`, `MicIcon`, `CopyIcon`, `CheckIcon`.
- Produces:
  - `ProgressRing`: `{ percent: number; label?: string }`.
  - `SetupChecklist`: `{ activeIndex: number }` (steps hardcoded).
  - `AnalyticsCard`: `{ label: string; value?: string }` (defaults to `—`).
  - `AskBar`: `{ onSubmit?: () => void; placeholder?: string }`.
  - `MeetingsPanel`: no props.

- [ ] **Step 1: Create `src/components/app/ProgressRing.tsx`**

```tsx
export default function ProgressRing({ percent, label }: { percent: number; label?: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-ink/10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-accent transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-ink">{Math.round(percent)}%</span>
        {label ? <span className="text-xs text-ink/50">{label}</span> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/app/SetupChecklist.tsx`**

```tsx
import { CheckIcon } from "./icons";

const STEPS = ["Connected", "Synced emails", "Categorizing", "Creating drafts"];

export default function SetupChecklist({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STEPS.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={label} className="flex items-center gap-2 rounded-xl border border-black/5 bg-card px-3 py-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                done ? "bg-accent text-white" : active ? "border-2 border-accent" : "border-2 border-ink/15"
              }`}
            >
              {done ? <CheckIcon className="h-3 w-3" /> : null}
            </span>
            <span className={`text-xs font-medium ${done || active ? "text-ink" : "text-ink/40"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/app/AnalyticsCard.tsx`**

```tsx
import Card from "@/components/ui/Card";

export default function AnalyticsCard({ label, value = "—" }: { label: string; value?: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-medium text-ink/60">{label}</div>
      <div className="mt-3 text-3xl font-extrabold text-ink/30">{value}</div>
    </Card>
  );
}
```

- [ ] **Step 4: Create `src/components/app/AskBar.tsx`**

```tsx
"use client";

import { useState } from "react";
import { MicIcon, PlusIcon } from "./icons";

const CHIPS = ["Show me my important emails", "What action items do I have?", "What's next for me?"];

export default function AskBar({
  onSubmit,
  placeholder = "Ask me anything about your meetings or emails…",
}: {
  onSubmit?: () => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.();
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="flex items-center gap-3 rounded-full border border-ink/10 bg-card px-4 py-3"
      >
        <PlusIcon className="h-5 w-5 text-ink/30" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
        <MicIcon className="h-5 w-5 text-ink/30" />
      </form>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSubmit?.()}
            className="rounded-full border border-ink/10 bg-card px-3 py-1.5 text-xs text-ink/60 hover:text-ink"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/app/MeetingsPanel.tsx`**

```tsx
import Card from "@/components/ui/Card";

function Column({ title }: { title: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="mt-6 text-center text-sm text-ink/40">No meetings scheduled</div>
    </Card>
  );
}

export default function MeetingsPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Column title="Today" />
      <Column title="Tomorrow" />
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `src/app/dashboard/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/app/ProgressRing";
import SetupChecklist from "@/components/app/SetupChecklist";
import AnalyticsCard from "@/components/app/AnalyticsCard";
import AskBar from "@/components/app/AskBar";
import MeetingsPanel from "@/components/app/MeetingsPanel";
import { ChevronDownIcon, RefreshIcon, CopyIcon } from "@/components/app/icons";
import { isSetupDone, setSetupDone } from "@/lib/auth";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function TopbarActions() {
  return (
    <>
      <button className="flex items-center gap-1 rounded-full border border-ink/10 bg-cream px-3 py-1.5 text-sm font-medium text-ink/70">
        Personal
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      <button className="text-ink/40 hover:text-ink" aria-label="Refresh">
        <RefreshIcon className="h-5 w-5" />
      </button>
    </>
  );
}

function SetupView({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const total = 4;

  useEffect(() => {
    if (step >= total) {
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const percent = (step / total) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
          <ProgressRing percent={percent} label={step >= total ? "complete" : "setting up"} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/60">Emails categorized</span>
              <span className="text-sm font-semibold text-ink/40">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/60">Drafts created</span>
              <span className="text-sm font-semibold text-ink/40">—</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <SetupChecklist activeIndex={step} />
        </div>
      </Card>
      <Card className="flex items-center justify-between p-5">
        <div>
          <div className="text-sm font-bold text-ink">Subscribe for full access</div>
          <div className="mt-0.5 text-xs text-ink/50">
            Keep your automations running after your trial.
          </div>
        </div>
        <a href="/#pricing" className="text-sm font-semibold text-accent hover:text-accent-dark">
          View plans →
        </a>
      </Card>
    </div>
  );
}

function MatureView() {
  const router = useRouter();
  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-2xl pt-4 text-center">
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight">
          {greeting()} — anything you'd like to know?
        </h2>
        <AskBar onSubmit={() => router.push("/dashboard/chat")} />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">Analytics</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <AnalyticsCard label="Emails processed" />
          <AnalyticsCard label="Drafts created" />
          <AnalyticsCard label="Meeting time" />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">Your meetings</h3>
        <MeetingsPanel />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/60">Share your scheduling link</h3>
        <Card className="flex items-center justify-between p-5">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">
              Share this link so others can book time with you
            </div>
            <div className="mt-0.5 truncate text-xs text-ink/40">
              inboxos.app/e/your-scheduling-link
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-sm font-medium text-ink/70 hover:text-ink">
            <CopyIcon className="h-4 w-4" />
            Copy link
          </button>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    setDone(isSetupDone());
  }, []);

  function handleDone() {
    setSetupDone();
    setDone(true);
  }

  return (
    <>
      <Topbar title="Dashboard">
        <TopbarActions />
      </Topbar>
      <div className="p-8">
        {done === null ? null : done ? <MatureView /> : <SetupView onDone={handleDone} />}
      </div>
    </>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/app/ProgressRing.tsx src/components/app/SetupChecklist.tsx src/components/app/AnalyticsCard.tsx src/components/app/AskBar.tsx src/components/app/MeetingsPanel.tsx src/app/dashboard/page.tsx
git commit -m "feat: two-state dashboard (setup progress + mature)"
```

---

### Task 6: Categorization page

**Files:**
- Create: `src/app/dashboard/categorization/page.tsx`

**Interfaces:**
- Consumes: `Topbar`, `Card`, `Button`, `Tabs`, `Toggle`, `RadioGroup`; `PlusIcon`.

- [ ] **Step 1: Create `src/app/dashboard/categorization/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import RadioGroup from "@/components/ui/RadioGroup";
import { PlusIcon } from "@/components/app/icons";

const MOVE_OUT = [
  { id: "comment", label: "Comment", desc: "Document comments & chats", color: "bg-amber-400" },
  { id: "notification", label: "Notification", desc: "Automated tool notifications", color: "bg-emerald-400" },
  { id: "meeting", label: "Meeting update", desc: "Calendar & meeting invites", color: "bg-blue-400" },
  { id: "followup", label: "To follow up", desc: "Waiting for their reply", color: "bg-violet-400" },
  { id: "marketing", label: "Marketing", desc: "Sales & marketing emails", color: "bg-rose-400" },
];

const KEEP_IN = [
  { id: "respond", label: "To respond", desc: "Need your response", color: "bg-accent" },
  { id: "fyi", label: "FYI", desc: "Important, no reply needed", color: "bg-amber-400" },
];

const MARKETING_OPTIONS = [
  { value: "obvious", label: "Just obvious sales outreach" },
  { value: "cold", label: "Cold emails and unknown senders" },
  { value: "newsletters", label: "Cold emails, unknown senders and newsletters" },
  { value: "anything", label: "Anything that's not directly useful to my work" },
];

function Row({
  label,
  desc,
  color,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  color: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/5 bg-card p-4">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 rounded-full ${color}`} />
        <div>
          <div className="text-sm font-medium text-ink">{label}</div>
          <div className="text-xs text-ink/50">{desc}</div>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export default function CategorizationPage() {
  const [tab, setTab] = useState("General");
  const [dirty, setDirty] = useState(false);

  const [moveOut, setMoveOut] = useState<Record<string, boolean>>(
    Object.fromEntries(MOVE_OUT.map((c) => [c.id, true])),
  );
  const [keepIn, setKeepIn] = useState<Record<string, boolean>>(
    Object.fromEntries(KEEP_IN.map((c) => [c.id, false])),
  );
  const [respect, setRespect] = useState(true);

  const [enabled, setEnabled] = useState(true);
  const [archive, setArchive] = useState(true);
  const [marketing, setMarketing] = useState("cold");

  function toggleMoveOut(id: string) {
    setMoveOut((prev) => ({ ...prev, [id]: !prev[id] }));
    setDirty(true);
  }

  function toggleKeepIn(id: string) {
    setKeepIn((prev) => ({ ...prev, [id]: !prev[id] }));
    setDirty(true);
  }

  return (
    <>
      <Topbar title="Categorization">
        <Button variant="dark" disabled={!dirty} onClick={() => setDirty(false)}>
          Update preferences
        </Button>
      </Topbar>
      <div className="p-8">
        <Tabs tabs={["General", "Advanced"]} active={tab} onChange={setTab} className="mb-8" />

        {tab === "General" ? (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink/60">Move these out of my Inbox</h3>
                <div className="space-y-2">
                  {MOVE_OUT.map((c) => (
                    <Row
                      key={c.id}
                      {...c}
                      checked={moveOut[c.id]}
                      onChange={() => toggleMoveOut(c.id)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink/60">Keep these in my Inbox</h3>
                <div className="space-y-2">
                  {KEEP_IN.map((c) => (
                    <Row
                      key={c.id}
                      {...c}
                      checked={keepIn[c.id]}
                      onChange={() => toggleKeepIn(c.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-ink/60">Existing categories</h3>
              <div className="flex items-center justify-between rounded-xl border border-black/5 bg-card p-4 lg:max-w-[calc(50%-0.75rem)]">
                <div>
                  <div className="text-sm font-medium text-ink">Respect my categories</div>
                  <div className="text-xs text-ink/50">We won't sort emails already labeled</div>
                </div>
                <Toggle
                  checked={respect}
                  onChange={(v) => {
                    setRespect(v);
                    setDirty(true);
                  }}
                  label="Respect my categories"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable categorization</div>
                  <div className="text-xs text-ink/50">Turn categorization on or off globally.</div>
                </div>
                <Toggle checked={enabled} onChange={(v) => { setEnabled(v); setDirty(true); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Archive threads after sending</div>
                  <div className="text-xs text-ink/50">
                    Move threads out of your inbox after you reply.
                  </div>
                </div>
                <Toggle checked={archive} onChange={(v) => { setArchive(v); setDirty(true); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-4 text-sm font-bold text-ink">
                Which emails should InboxOS filter as marketing?
              </div>
              <RadioGroup
                options={MARKETING_OPTIONS}
                value={marketing}
                onChange={(v) => { setMarketing(v); setDirty(true); }}
              />
            </Card>
            <Card className="p-5">
              <div className="mb-1 text-sm font-bold text-ink">Custom rules</div>
              <div className="mb-4 text-xs text-ink/50">
                Choose which addresses, domains, or subjects go to each category.
              </div>
              <button className="flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink">
                <PlusIcon className="h-4 w-4" />
                Add email, domain, or subject
              </button>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS. `/dashboard/categorization` in route list.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/categorization/page.tsx
git commit -m "feat: categorization page (general + advanced)"
```

---

### Task 7: Drafts (enriched) + Notetaker

**Files:**
- Modify: `src/app/dashboard/drafts/page.tsx`
- Create: `src/app/dashboard/notetaker/page.tsx`

**Interfaces:**
- Consumes: `Topbar`, `Card`, `Button`, `Tabs`, `Toggle`, `Stepper`.

- [ ] **Step 1: Rewrite `src/app/dashboard/drafts/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import Stepper from "@/components/ui/Stepper";

const RESPONSE_STYLES = [
  "I reply to almost everything, even just to be polite",
  "I reply when a response is needed",
  "I only reply to important emails",
];

export default function DraftsPage() {
  const [tab, setTab] = useState("General");
  const [dirty, setDirty] = useState(false);

  const [enableDrafts, setEnableDrafts] = useState(true);
  const [retention, setRetention] = useState(14);
  const [style, setStyle] = useState(RESPONSE_STYLES[0]);
  const [followUps, setFollowUps] = useState(true);
  const [followUpDays, setFollowUpDays] = useState(3);
  const [customTone, setCustomTone] = useState(false);
  const [includeSig, setIncludeSig] = useState(true);

  const mark = () => setDirty(true);

  return (
    <>
      <Topbar title="Drafts">
        <Button variant="dark" disabled={!dirty} onClick={() => setDirty(false)}>
          Update preferences
        </Button>
      </Topbar>
      <div className="p-8">
        <Tabs
          tabs={["General", "Signatures", "Custom Files"]}
          active={tab}
          onChange={setTab}
          className="mb-8"
        />

        {tab === "General" ? (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable draft replies</div>
                  <div className="text-xs text-ink/50">
                    Automatically generate draft replies for incoming emails.
                  </div>
                </div>
                <Toggle checked={enableDrafts} onChange={(v) => { setEnableDrafts(v); mark(); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-3 text-sm font-medium text-ink/70">Unused drafts are deleted after</div>
              <Stepper value={retention} onChange={(v) => { setRetention(v); mark(); }} min={1} max={90} suffix="days" />
            </Card>
            <Card className="p-5">
              <div className="mb-2 text-sm font-bold text-ink">Response style</div>
              <div className="mb-3 text-xs text-ink/50">How often do you like to reply?</div>
              <select
                value={style}
                onChange={(e) => { setStyle(e.target.value); mark(); }}
                className="w-full rounded-xl border border-black/10 bg-card px-3 py-2.5 text-sm text-ink focus:outline-none"
              >
                {RESPONSE_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable follow-up drafts</div>
                  <div className="text-xs text-ink/50">
                    Draft follow-ups when you haven't received a response.
                  </div>
                </div>
                <Toggle checked={followUps} onChange={(v) => { setFollowUps(v); mark(); }} />
              </div>
              {followUps ? (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-medium text-ink/70">Days before following up</div>
                  <Stepper value={followUpDays} onChange={(v) => { setFollowUpDays(v); mark(); }} min={1} max={30} suffix="days" />
                </div>
              ) : null}
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Enable custom instructions</div>
                  <div className="text-xs text-ink/50">
                    Add personalized instructions to guide how drafts are written.
                  </div>
                </div>
                <Toggle checked={customTone} onChange={(v) => { setCustomTone(v); mark(); }} />
              </div>
            </Card>
          </div>
        ) : tab === "Signatures" ? (
          <div className="max-w-2xl space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Include email signatures in drafts</div>
                  <div className="text-xs text-ink/50">
                    Disable if your organization already adds signatures automatically.
                  </div>
                </div>
                <Toggle checked={includeSig} onChange={(v) => { setIncludeSig(v); mark(); }} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-3 text-sm font-bold text-ink">Default signature</div>
              <textarea
                onChange={mark}
                placeholder="Write your default signature…"
                className="h-32 w-full resize-none rounded-xl border border-black/10 bg-cream p-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
              />
            </Card>
          </div>
        ) : (
          <Card className="max-w-2xl p-10 text-center text-sm text-ink/50">
            Custom files let InboxOS reference your documents when drafting. Coming soon.
          </Card>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create `src/app/dashboard/notetaker/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";

export default function NotetakerPage() {
  const [summarize, setSummarize] = useState(true);

  return (
    <>
      <Topbar title="Notetaker" />
      <div className="p-8">
        <PageHeader
          title="Never write meeting notes again"
          subtitle="InboxOS joins your meetings and turns them into actionable notes and follow-ups."
        />
        <Card className="mb-6 flex items-center justify-between p-5">
          <div>
            <div className="text-sm font-bold text-ink">Summarize my meetings</div>
            <div className="text-xs text-ink/50">
              InboxOS will join your meetings and handle the notes.
            </div>
          </div>
          <Toggle checked={summarize} onChange={setSummarize} label="Summarize my meetings" />
        </Card>
        <Card className="p-10 text-center text-sm text-ink/50">
          No meeting notes yet — they'll appear here after your first summarized meeting.
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS. `/dashboard/notetaker` in route list.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/drafts/page.tsx src/app/dashboard/notetaker/page.tsx
git commit -m "feat: enriched drafts page + notetaker page"
```

---

### Task 8: Scheduling + Chat

**Files:**
- Create: `src/app/dashboard/scheduling/page.tsx`
- Create: `src/app/dashboard/chat/page.tsx`

**Interfaces:**
- Consumes: `Topbar`, `Card`, `Tabs`, `Toggle`, `AskBar`; icons `CopyIcon`, `SearchIcon`, `PlusIcon`.

- [ ] **Step 1: Create `src/app/dashboard/scheduling/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import Topbar from "@/components/app/Topbar";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import { CopyIcon } from "@/components/app/icons";

const FEATURES = [
  {
    title: "Customise your availability",
    desc: "Set your working hours so InboxOS only shows times that work for you.",
  },
  {
    title: "Configure scheduling drafts",
    desc: "Set your preferences for how InboxOS responds to meeting requests.",
  },
  {
    title: "Team scheduling",
    desc: "Browse availability across your team and book meetings with multiple attendees.",
  },
];

export default function SchedulingPage() {
  const [tab, setTab] = useState("Links");
  const [includeLink, setIncludeLink] = useState(true);
  const [proposeDrafts, setProposeDrafts] = useState(true);
  const [confirmEmail, setConfirmEmail] = useState(true);

  return (
    <>
      <Topbar title="Scheduling" />
      <div className="p-8">
        <Tabs
          tabs={["Links", "Drafts", "Availability", "Teams"]}
          active={tab}
          onChange={setTab}
          className="mb-8"
        />

        {tab === "Links" ? (
          <div className="space-y-6">
            <Card className="flex items-center justify-between p-5">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">
                  Share this link so others can book time with you
                </div>
                <div className="mt-0.5 truncate text-xs text-ink/40">
                  inboxos.app/e/your-scheduling-link
                </div>
              </div>
              <button className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-sm font-medium text-ink/70 hover:text-ink">
                <CopyIcon className="h-4 w-4" />
                Copy link
              </button>
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="p-6">
                  <div className="mb-4 h-16 rounded-xl bg-cream" />
                  <div className="text-sm font-bold text-ink">{f.title}</div>
                  <div className="mt-2 text-xs text-ink/50">{f.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        ) : tab === "Drafts" ? (
          <Card className="max-w-2xl p-5">
            <div className="mb-4 text-sm font-bold text-ink">
              How InboxOS responds to meeting requests
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Include scheduling link in drafts</span>
                <Toggle checked={includeLink} onChange={setIncludeLink} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Generate drafts for proposed times</span>
                <Toggle checked={proposeDrafts} onChange={setProposeDrafts} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Confirmation email after proposal</span>
                <Toggle checked={confirmEmail} onChange={setConfirmEmail} />
              </div>
            </div>
          </Card>
        ) : (
          <Card className="max-w-2xl p-10 text-center text-sm text-ink/50">
            {tab} settings are coming soon.
          </Card>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create `src/app/dashboard/chat/page.tsx`**

```tsx
"use client";

import AskBar from "@/components/app/AskBar";
import { SearchIcon, PlusIcon } from "@/components/app/icons";

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <aside className="flex w-72 shrink-0 flex-col border-r border-black/5 bg-card p-4">
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-black/10 bg-cream px-3 py-2 text-sm text-ink/40">
          <SearchIcon className="h-4 w-4" />
          <span>Search</span>
        </div>
        <button className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
          <PlusIcon className="h-4 w-4" />
          New Chat
        </button>
        <div className="flex-1 text-center text-xs text-ink/40">No conversations yet</div>
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <span className="mb-8 text-3xl font-extrabold tracking-tight text-accent">InboxOS</span>
        <div className="w-full max-w-2xl">
          <AskBar placeholder="Ask me anything about your meetings & emails…" />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS. `/dashboard/scheduling` and `/dashboard/chat` in route list.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/scheduling/page.tsx src/app/dashboard/chat/page.tsx
git commit -m "feat: scheduling page + chat page"
```

---

### Task 9: Settings (replay onboarding + sign out)

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx`

**Interfaces:**
- Consumes: `Topbar`, `PageHeader`, `Card`, `Button`; `resetOnboarding`, `signOut`.

- [ ] **Step 1: Rewrite `src/app/dashboard/settings/page.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { resetOnboarding, signOut } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();

  function replay() {
    resetOnboarding();
    router.replace("/onboarding/creating");
  }

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-8">
        <PageHeader title="Settings" subtitle="Manage your workspace and account." />
        <div className="max-w-2xl space-y-6">
          <Card className="p-5">
            <div className="text-sm font-bold text-ink">Profile</div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                NP
              </span>
              <div>
                <div className="text-sm font-medium text-ink">Your Workspace</div>
                <div className="text-xs text-ink/50">Free plan</div>
              </div>
            </div>
          </Card>

          <Card className="flex items-center justify-between p-5">
            <div>
              <div className="text-sm font-bold text-ink">Replay onboarding</div>
              <div className="text-xs text-ink/50">
                Reset the setup flow and walk through onboarding again.
              </div>
            </div>
            <Button variant="outline" onClick={replay}>
              Replay
            </Button>
          </Card>

          <Card className="flex items-center justify-between p-5">
            <div>
              <div className="text-sm font-bold text-ink">Sign out</div>
              <div className="text-xs text-ink/50">End your session on this device.</div>
            </div>
            <Button variant="dark" onClick={handleSignOut}>
              Sign out
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS. Full route list: `/`, `/login`, `/onboarding/creating`, `/onboarding/calendar`, `/onboarding/inbox`, `/onboarding/notes`, `/dashboard`, `/dashboard/categorization`, `/dashboard/drafts`, `/dashboard/notetaker`, `/dashboard/scheduling`, `/dashboard/chat`, `/dashboard/settings` (plus `/_not-found`).

- [ ] **Step 3: Full manual smoke check**

`npm run dev`, then:
1. `/login` → Continue with Google → `/onboarding/creating` (orbit ~2.5s) → `/onboarding/calendar`.
2. Stepper highlights step 1; Continue → inbox setup (step 2) → select an option → Start organizing → meeting notes (step 3) → Finish setup → `/dashboard`.
3. Dashboard shows setup-progress ring filling through the 4 steps, then flips to the mature view (greeting + ask bar + empty analytics + meetings + scheduling link).
4. Refresh `/dashboard` → mature view directly (setup flag persisted).
5. Each sidebar nav item renders; toggles/tabs/radios/steppers respond.
6. Ask bar / suggestion chips route to `/dashboard/chat`.
7. Settings → Replay onboarding → returns to `/onboarding/creating`.
8. Sidebar workspace menu → Sign out → `/`. Visiting `/dashboard` now redirects to `/login`.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/settings/page.tsx
git commit -m "feat: settings page with replay onboarding + sign out"
```

---

## Self-review notes

- **Spec coverage:** onboarding (creating + 3 steps) ✓; gating ✓; two-state dashboard ✓; Categorization/Drafts/Notetaker/Scheduling/Chat/Settings ✓; sidebar refresh + workspace menu + trial pill ✓; UI primitives ✓; empty states / no fabricated data ✓; neutral glyphs ✓. `SegmentedControl` intentionally folded into `Tabs` (noted in Global Constraints).
- **Type consistency:** `Toggle.onChange(v: boolean)`, `Tabs.onChange(t: string)`, `RadioGroup.onChange(v: string)`, `Stepper.onChange(v: number)` used consistently across all pages. `Topbar` right actions passed as `children`. `AskBar.onSubmit` optional, used by dashboard (routes to chat) and chat (no-op).
- **Flow integrity:** `signOut()` clears all flags so a fresh login re-enters onboarding; `resetOnboarding()` clears onboarded+setup+pref; dashboard reads `isSetupDone()` client-side after mount (no SSR/localStorage mismatch — gated by `done === null`).
- **No test harness:** verification is `npm run build` + manual smoke, consistent with the shell spec.
