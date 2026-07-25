# InboxOS Web — Landing Page + App Shell — Design

Date: 2026-07-25
Project: `inboxos-web` (Next.js 14 App Router · TypeScript · Tailwind)

## Context

The working tree had no source (only a `.next/` build folder, `.env.local.example`,
`.gitignore`, and one tracked docs spec). This is therefore a **fresh scaffold**.
The product is **InboxOS**, an AI email assistant in the Fyxer / Supafax vein.
The existing `.env.local.example` establishes a `/api/*` → `$NEXT_PUBLIC_API_URL/v1/*`
proxy to a FastAPI backend, which we preserve for later feature wiring.

## Goal

Ship two things in this task:

1. A marketing **landing page** at `/` (Fyxer cream + orange identity).
2. A **protected app shell** reachable after a **mock** login: sidebar + topbar
   layout with navigable placeholder pages.

Real OAuth, real inbox data, and feature screens (e.g. Mailman) are out of scope.

## Decisions (locked)

- Stack: **Next.js 14 App Router**, TypeScript, Tailwind CSS.
- Identity: **Fyxer-inspired** — cream background, warm-white cards, near-black ink,
  orange accent.
- Auth: **mock session** (localStorage flag + cookie), swappable for real OAuth later.
- Scope: landing + app shell only. Placeholders are honestly empty (no faked data).
- All landing visuals are **pure HTML/CSS** — no external image assets.

## Visual identity

Tailwind theme tokens (`tailwind.config.ts`):

- `cream` background `#F3F1EA`, card `#FCFBF7`, ink `#1A1D26`, muted `#6B7280`,
  accent (orange) `#F0562D`, accent-dark `#D8451F`.
- Font: **Inter** via `next/font/google`, exposed as a CSS variable.
- Shapes: pill buttons (`rounded-full`), `rounded-2xl` cards, tight bold display
  headlines (`font-extrabold tracking-tight`).

## Routing & file structure

```
src/
  app/
    layout.tsx                 # root: font var, base bg, <html>/<body>
    globals.css                # tailwind directives + base tokens
    (marketing)/
      layout.tsx               # marketing Navbar + Footer wrapper
      page.tsx                 # landing (/)
    login/
      page.tsx                 # mock login (client)
    dashboard/
      layout.tsx               # protected shell: auth gate + Sidebar + Topbar
      page.tsx                 # dashboard home (placeholder)
      inbox/page.tsx           # placeholder
      drafts/page.tsx          # placeholder
      settings/page.tsx        # placeholder
  components/
    marketing/
      Navbar.tsx  Hero.tsx  FeatureRow.tsx  StatsGrid.tsx
      Pricing.tsx  Footer.tsx  ProductMock.tsx
    app/
      Sidebar.tsx  Topbar.tsx  PageHeader.tsx  icons.tsx
    ui/
      Button.tsx  Card.tsx
  lib/
    auth.ts                    # mock session helpers
    api.ts                     # apiFetch stub (kept for later backend wiring)
next.config.mjs                # /api/* → $NEXT_PUBLIC_API_URL/v1/* rewrite
tailwind.config.ts
tsconfig.json
package.json
```

`@/*` path alias → `src/*`.

## Landing page (`/`)

Composed in `(marketing)/page.tsx` from section components; `(marketing)/layout.tsx`
provides the sticky Navbar and Footer.

1. **Navbar** — wordmark, links (Pricing, Security, How it works, For teams),
   "Log in" (black pill) + "Start for free" (orange pill). All CTAs → `/login`.
2. **Hero** — eyebrow ("Drowning in email?"), big headline
   "Let InboxOS organize your inbox and write your next reply", subcopy,
   "Get started with" Gmail / Outlook pill buttons, plus a faux inbox
   **ProductMock** card (CSS only: window chrome, an email row, a DRAFT block,
   a "To Respond" tag).
3. **FeatureRow** (×3, alternating image side) — colored eyebrow label + headline +
   copy + a small CSS visual:
   - *Inbox Organizer* — "We organize your inbox"
   - *Draft Writer* — "We draft in your voice"
   - *Meeting Companion* — "We're plugged into every meeting"
4. **StatsGrid** — 2×2 card of metrics ("3.45hrs saved / person / week",
   "70% feel more effective", "640hrs recovered / week", "48% shift to proactive").
5. **Pricing** — two cards: Professional ($35/user/mo, "Most Popular", feature list,
   "Start free trial") and Enterprise ("Get in touch", "Talk to sales"). CTAs → `/login`.
6. **Footer** — multi-column link footer + large wordmark + copyright.

No external images; all mockups are HTML/CSS.

## Mock auth (`lib/auth.ts`)

- `signIn()` — sets `localStorage["inboxos_authed"]="1"` and a non-HttpOnly
  `inboxos_authed=1` cookie (so a future middleware swap is trivial).
- `signOut()` — clears both, redirects to `/`.
- `isAuthed()` — reads the localStorage flag (client-only).

`/login` (client): centered card, "Continue with Google" / "Continue with Outlook"
buttons (mocked — they just call `signIn()`), then `router.replace('/dashboard')`.

## App shell (post-login)

`dashboard/layout.tsx` is a client component:

- On mount, if `!isAuthed()` → `router.replace('/login')` (render nothing until
  the check resolves, to avoid a flash).
- Otherwise render a two-column layout: **Sidebar** (fixed left) + main column with
  **Topbar** and `{children}`.

**Sidebar** — wordmark; nav items (Dashboard, Inbox, Drafts, Settings) each with an
inline SVG icon from `icons.tsx` and active-state highlight via `usePathname`;
sign-out button pinned to the bottom.

**Topbar** — current page title, a disabled search input stub, and an avatar circle.

**Placeholder pages** — each uses shared `PageHeader` (title + subtitle) plus an
empty-state `Card` ("Coming soon — this is where <X> will live."). Navigable and
real, but no backend calls.

## API stub (`lib/api.ts`)

A minimal `apiFetch(path, init)` that prefixes `/api`, sets JSON headers, and throws
an `ApiError` on non-2xx. Not called anywhere yet; present so backend wiring is a
clean follow-up matching the prior spec's contract.

## Error handling & states

- Mock auth cannot fail; no error UI needed for login beyond basic disabled states.
- Dashboard gate shows nothing (or a minimal spinner) until `isAuthed()` resolves.
- Landing is fully static — no runtime error surfaces.

## Testing

Out of scope for this task (no test harness yet). Verification is a manual
`next dev` smoke check: landing renders, CTAs reach `/login`, mock sign-in reaches
`/dashboard`, nav switches active state, sign-out returns to `/`.

## Out of scope

- Real Google/Microsoft OAuth and any real backend calls.
- Inbox / Drafts / Settings feature functionality.
- The Mailman (Batched Inbox) feature UI from the prior spec.
- Automated tests, analytics, SEO/OG images beyond a basic title.
