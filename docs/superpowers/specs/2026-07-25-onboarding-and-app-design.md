# InboxOS Web — Onboarding + Full App — Design

Date: 2026-07-25
Project: `inboxos-web` (Next.js 14 App Router · TypeScript · Tailwind)
Builds on: `2026-07-25-landing-and-app-shell-design.md`

## Context

The landing page + protected app shell already exist (branch
`feat/landing-and-app-shell`): a mock login sets `inboxos_authed`, and
`dashboard/layout.tsx` gates on it. The current shell nav is
`Dashboard / Inbox / Drafts / Settings` with honestly-empty placeholder
pages.

This spec adds the **post-login onboarding flow** and the **full application
surface**, inspired by Fyxer (with InboxOS individuality — not a pixel
clone, and no Fyxer branding). The Google OAuth account-chooser/consent
screens in the reference are Google's own and are **not** built here.

## Decisions (locked)

- Scope: **full app IA** — onboarding wizard + rich dashboard + designed
  Categorization, Drafts, Notetaker, Scheduling, and Chat pages.
- Onboarding steps: **Connect calendar → Inbox setup → Meeting notes**
  (preceded by a transient "creating account" animation).
- Dashboard: **both states** — first-run setup-progress view that
  transitions into the mature steady-state view.
- Data: **empty states only.** No fabricated metrics, emails, or meetings.
  Interactive controls (toggles, tabs, radios, steppers) hold real local
  state but do not persist to a backend.
- Auth remains **mock** (localStorage flags + cookies), swappable later.
- No external image assets; integration glyphs are neutral inline SVG
  (not trademarked third-party logos).

## Empty-states reconciliation

"Both dashboard states" normally implies numbers; here it does not:

- The setup-progress **ring reflects genuine setup progression** through a
  mocked but honest sequence (`Connected → Synced → Categorizing →
  Creating drafts`), not a fabricated percentage.
- The mature dashboard's analytics/meetings render as honest empty states
  ("—", "No meetings yet"). The ask bar is present but non-functional.
- All settings-style controls are real interactive UI (local React state).

## Visual identity

Inherits the shell's tokens: cream `#F3F1EA`, card `#FCFBF7`, ink
`#1A1D26`, muted `#6B7280`, accent `#F0562D`, accent-dark `#D8451F`; Inter
via `next/font`. Pill buttons, `rounded-2xl` cards, `font-extrabold
tracking-tight` display. Individuality via InboxOS wordmark, our own copy
voice, and neutral integration glyphs.

## Navigation (IA refresh)

Sidebar nav changes to:

`Dashboard · Categorization · Drafts · Notetaker · Scheduling · Chat · Settings`

- `Inbox` route is retired; its "what stays in your inbox" concept moves
  into **Categorization**.
- Sidebar bottom gains a **trial pill** ("14 days left of trial"), a
  **workspace switcher + user menu** (with sign-out), matching the
  reference footer. A notification bell sits by the wordmark.

## Post-login flow & gating

```
/login → signIn() → /onboarding/creating (~2.5s animation)
       → /onboarding/calendar → /onboarding/inbox → /onboarding/notes
       → setOnboarded() → /dashboard (first run: setup-progress → mature)
```

Mock-state helpers (`lib/auth.ts`, extended):

- `isOnboarded()` / `setOnboarded()` / `resetOnboarding()` — localStorage
  key `inboxos_onboarded` + matching non-HttpOnly cookie.
- `isSetupDone()` / `setSetupDone()` — localStorage key `inboxos_setup_done`
  controls whether the dashboard shows the setup-progress or mature view.

Gating:

- `/onboarding/*` requires auth (else `/login`).
- `/dashboard/*` requires auth **and** onboarded (else `/onboarding/creating`).
- `/login` sends already-onboarded users to `/dashboard`.
- Render nothing (or a minimal spinner) until the client-side check
  resolves, to avoid a flash — same pattern as the existing shell.

## Routing & file structure

```
src/
  app/
    onboarding/
      layout.tsx              # auth gate; left stepper + centered card; no sidebar
      creating/page.tsx       # "Setting up your workspace…" orbit animation
      calendar/page.tsx       # step 1
      inbox/page.tsx          # step 2
      notes/page.tsx          # step 3
    dashboard/
      layout.tsx              # gate now also requires onboarded
      page.tsx                # setup-progress → mature (client-driven)
      categorization/page.tsx
      drafts/page.tsx         # enriched (replaces shell stub)
      notetaker/page.tsx
      scheduling/page.tsx
      chat/page.tsx
      settings/page.tsx       # enriched: replay-onboarding reset + sign out
      # inbox/ route removed
  components/
    onboarding/
      OnboardingStepper.tsx   # left vertical stepper, active via usePathname
      Orbit.tsx               # creating-account orbit of integration glyphs
    app/
      Sidebar.tsx             # updated nav + footer menu + trial pill
      Topbar.tsx              # + workspace switcher, refresh affordance
      ProgressRing.tsx        # SVG completion ring
      SetupChecklist.tsx      # Connected/Synced/Categorizing/Creating steps
      AnalyticsCard.tsx
      AskBar.tsx              # non-functional prompt bar + suggestion chips
      MeetingsPanel.tsx       # Today/Tomorrow empty state
      WorkspaceMenu.tsx       # workspace switcher + user menu (sign out)
      TrialPill.tsx
      icons.tsx               # extended set
    ui/
      Toggle.tsx  Tabs.tsx  RadioGroup.tsx  Stepper.tsx  SegmentedControl.tsx
  lib/
    auth.ts                   # extended with onboarded/setup helpers
    integrations.ts           # neutral glyph definitions for Orbit
```

`@/*` path alias → `src/*` (unchanged).

## Onboarding wizard

`onboarding/layout.tsx` (client): auth gate, then a two-column frame — a
left **vertical stepper** (labels: Connect calendar, Inbox setup, Meeting
notes; active + completed states via `usePathname`) and a centered content
card. InboxOS wordmark top-left; a gear/settings affordance top-right.

1. **`/onboarding/creating`** — full-screen **Orbit**: InboxOS wordmark, a
   center "Setting up your workspace…" label + spinner, and neutral
   integration glyphs orbiting. After ~2.5s, `router.replace` to
   `/onboarding/calendar`. (This screen renders without the stepper frame.)
2. **`/onboarding/calendar`** — left: "How InboxOS uses your calendar" with
   two bullets; right panel: calendar glyph, "Connect your calendar" copy,
   "Continue with Google" (dark pill) + "Continue with Outlook" (text).
   Both are mocked and simply advance to `/onboarding/inbox`. Reassurance
   line: "InboxOS never sends emails on your behalf · disconnect anytime."
3. **`/onboarding/inbox`** — "Choose what stays in your inbox" with 3
   selectable option cards:
   - *Only what needs my attention* (tags: To respond, FYI)
   - *All my emails* (tags: To respond, FYI, Comment, Notification)
   - *Don't label my emails*
   One selected at a time (radio semantics). Primary button
   "Start organizing my inbox" advances to `/onboarding/notes`. Selection
   stored in `localStorage["inboxos_inbox_pref"]` (a real user choice).
4. **`/onboarding/notes`** — "Never write meeting notes again" + a
   "Summarize my meetings" toggle. Primary button "Finish setup" calls
   `setOnboarded()` and `router.replace("/dashboard")`.

## Dashboard — two states

`dashboard/page.tsx` (client):

- If `!isSetupDone()` → render **setup-progress** view:
  - `ProgressRing` animating a client-driven sequence, alongside a
    `SetupChecklist` marking `Connected → Synced emails → Categorizing →
    Creating drafts`. Numeric stat slots render "—".
  - A "Subscribe for full access" banner (`View plans →`, links to
    `/#pricing`) and an "InboxOS gets smarter with your team" invite
    banner (dismissible).
  - When the sequence completes (a few seconds), call `setSetupDone()` and
    swap to the mature view.
- Else → render **mature** view:
  - Time-based greeting: "Good {morning|afternoon|evening} — anything
    you'd like to know?"
  - `AskBar`: prompt input + suggestion chips ("Show me my important
    emails", "What action items do I have?", "What's next for me?").
    Submitting routes to `/dashboard/chat` (no fake answers inline).
  - Analytics: 3 `AnalyticsCard`s (Emails processed, Drafts created,
    Meeting time) all showing "—".
  - `MeetingsPanel`: Today / Tomorrow columns, empty state.
  - Share-your-scheduling-link card: placeholder link + copy button.

Topbar shows the page title, a workspace switcher ("Personal ▾"), and a
refresh affordance.

## App pages (empty-state + interactive)

**Categorization** — `Tabs`: General / Advanced.
- General: two panels — "Move these out of my Inbox" (Comment, Notification,
  Meeting update, To follow up, Marketing — each a `Toggle`) and "Keep these
  in my Inbox" (To respond, FYI). "Existing categories → Respect my
  categories" toggle. "Update preferences" button enables on any change.
- Advanced: Enable categorization `Toggle`; "Archive threads after sending"
  `Toggle`; "Which emails count as marketing?" `RadioGroup` (4 options);
  Alternative emails (add-email affordance); Custom rules (add affordance).

**Drafts** — `Tabs`: General / Signatures / Custom Files.
- General: "Enable draft replies" toggle; "Unused drafts deleted after"
  `Stepper` (days); "Response style" select; "Enable follow-up drafts"
  toggle + days `Stepper`; "Custom instructions" toggle; "Font" select.
- Signatures: "Include signatures in drafts" toggle; default-signature
  textarea; account-specific signature textarea.
- Custom Files: simple empty/upload placeholder.

**Notetaker** — intro ("Never write meeting notes again"), "Summarize my
meetings" toggle, and an empty notes list ("No meeting notes yet").

**Scheduling** — `Tabs`: Links / Drafts / Availability / Teams.
- Links: share-scheduling-link card (placeholder + copy) + three feature
  cards (Customise availability, Configure scheduling drafts, Team
  scheduling).
- Drafts: "How InboxOS responds to meeting requests" — 3 toggles
  (include scheduling link, generate drafts for proposed times,
  confirmation email after proposal).
- Availability / Teams: lighter placeholder content.

**Chat** — two-pane: left conversation list (New Chat button, search input,
empty "No conversations yet"); right empty main with InboxOS wordmark, an
`AskBar`, and suggestion chips. Non-functional — no fabricated responses.

**Settings** — profile + workspace summary, a "Replay onboarding" action
(calls `resetOnboarding()` + clears `setup_done` + inbox pref, then routes
to `/onboarding/creating`) for demoing, and sign out.

## Shared primitives

`components/ui`:
- `Toggle` — accessible switch (`role="switch"`, controlled).
- `Tabs` — controlled tab bar + panels.
- `RadioGroup` — single-select list with radio semantics.
- `Stepper` — numeric −/value/+ with min/max.
- `SegmentedControl` — pill segmented selector (used by Tabs where apt).

## Error handling & states

- Mock flows cannot fail; no error UI beyond disabled/loading states.
- Gates render nothing until the client check resolves (no flash).
- Onboarding "connect" actions are optimistic mocks that always advance.

## Testing

No automated harness (consistent with the shell spec). Verification is
`npm run build` green + a manual `next dev` smoke walk:
login → creating → calendar → inbox → notes → dashboard (progress → mature)
→ each nav page renders and its controls toggle → Settings "Replay
onboarding" restarts the flow → sign out returns to `/`.

## Out of scope

- Real Google/Microsoft OAuth and any real backend/API calls.
- Real email, calendar, meeting, or AI-chat data and functionality.
- Persistence beyond localStorage flags/preferences.
- Billing/subscription flows (banners link to the marketing pricing anchor).
- Mobile-specific layouts beyond basic responsive behavior.
