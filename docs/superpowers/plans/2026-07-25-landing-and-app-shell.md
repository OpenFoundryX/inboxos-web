# Landing Page + App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a fresh Next.js app with a Fyxer-style marketing landing page and a mock-authenticated dashboard shell of navigable placeholder pages.

**Architecture:** Next.js 14 App Router. A `(marketing)` route group holds the public landing page with its own nav/footer chrome. A client-side mock session (`lib/auth.ts`) gates `/dashboard/*`, which renders a Sidebar + Topbar shell around placeholder pages. All landing visuals are pure HTML/CSS — no image assets. An `api.ts` stub is present for later backend wiring but unused.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, `next/font` (Inter).

## Global Constraints

- Next.js **14.x**, App Router only, TypeScript strict.
- Path alias `@/*` → `src/*`.
- Palette tokens: cream `#F3F1EA`, card `#FCFBF7`, ink `#1A1D26`, muted `#6B7280`, accent `#F0562D`, accent-dark `#D8451F`.
- Font: **Inter** via `next/font/google`.
- No external image assets — all mockups are HTML/CSS.
- Mock auth only: `localStorage["inboxos_authed"]` + `inboxos_authed` cookie. No real OAuth, no backend calls.
- All landing/pricing CTAs link to `/login`.
- Verification per task = `npm run build` succeeds (and/or dev smoke check). No automated tests this task.

---

### Task 1: Project scaffold + Tailwind + root layout

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.eslintrc.json`
- Create: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: Tailwind theme colors (`cream`, `card`, `ink`, `muted`, `accent`, `accent-dark`); `--font-inter` CSS var on `<body>`; working `@/*` alias; `/api/*` rewrite.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "inboxos-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.39",
    "tailwindcss": "3.4.6",
    "typescript": "5.5.3",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return [];
    return [{ source: "/api/:path*", destination: `${api}/v1/:path*` }];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
export default config;
```

- [ ] **Step 5: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F3F1EA",
        card: "#FCFBF7",
        ink: "#1A1D26",
        muted: "#6B7280",
        accent: "#F0562D",
        "accent-dark": "#D8451F",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `.eslintrc.json`**

```json
{ "extends": "next/core-web-vitals" }
```

- [ ] **Step 7: Create `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  background-color: theme("colors.cream");
  color: theme("colors.ink");
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 8: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InboxOS — Email, organized and answered for you",
  description:
    "InboxOS organizes your inbox and drafts your next reply, right inside Gmail and Outlook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`
Expected: completes without error, creates `node_modules` + `package-lock.json`.

- [ ] **Step 10: Verify the build boots**

Run: `npm run build`
Expected: Build fails gracefully only for "no pages" — if it errors on missing `page.tsx`, create a temporary `src/app/page.tsx` returning `<main>ok</main>`, rebuild to confirm success, then leave it (Task 4 overwrites it). Otherwise PASS.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 app with tailwind theme and root layout"
```

---

### Task 2: UI primitives, auth stub, api stub

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`
- Create: `src/lib/auth.ts`, `src/lib/api.ts`

**Interfaces:**
- Produces:
  - `Button` — props `{ variant?: "primary" | "dark" | "outline"; href?: string; className?; children; onClick?; type?; disabled? }`. Renders an `<a>` (Next `Link`) when `href` is set, else `<button>`. `primary` = orange, `dark` = near-black, `outline` = bordered on transparent.
  - `Card` — props `{ className?; children }`, renders `rounded-2xl border border-black/5 bg-card`.
  - `auth.ts` — `signIn(): void`, `signOut(): void`, `isAuthed(): boolean`.
  - `api.ts` — `apiFetch<T>(path: string, init?: RequestInit): Promise<T>`, `class ApiError extends Error { status: number }`.

- [ ] **Step 1: Create `src/components/ui/Button.tsx`**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "dark" | "outline";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  dark: "bg-ink text-white hover:bg-black",
  outline: "border border-ink/15 bg-transparent text-ink hover:bg-ink/5",
};

type ButtonProps = {
  variant?: Variant;
  href?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${
    disabled ? "cursor-not-allowed opacity-50" : ""
  } ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create `src/components/ui/Card.tsx`**

```tsx
import type { ReactNode } from "react";

export default function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-card ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/lib/auth.ts`**

```ts
const KEY = "inboxos_authed";

export function signIn(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
  document.cookie = `${KEY}=1; path=/; max-age=${60 * 60 * 24 * 30}`;
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  document.cookie = `${KEY}=; path=/; max-age=0`;
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}
```

- [ ] **Step 4: Create `src/lib/api.ts`**

```ts
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Thin stub kept for later backend wiring. Not called yet.
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
```

- [ ] **Step 5: Verify types compile**

Run: `npx tsc --noEmit`
Expected: PASS (no type errors).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui src/lib
git commit -m "feat: add Button/Card primitives, mock auth, and api stub"
```

---

### Task 3: Marketing chrome (Navbar, Footer, group layout)

**Files:**
- Create: `src/components/marketing/Navbar.tsx`, `src/components/marketing/Footer.tsx`
- Create: `src/app/(marketing)/layout.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/Button`.
- Produces: `Navbar`, `Footer` (default exports, no props); `(marketing)/layout.tsx` wrapping children with Navbar + Footer.

- [ ] **Step 1: Create `src/components/marketing/Navbar.tsx`**

```tsx
import Link from "next/link";
import Button from "@/components/ui/Button";

const LINKS = [
  { href: "#pricing", label: "Pricing" },
  { href: "#security", label: "Security" },
  { href: "#how", label: "How it works" },
  { href: "#teams", label: "For teams" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-black/5 bg-card px-5 py-3 shadow-sm mt-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-accent">
          InboxOS
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-ink/80 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" href="/login">
            Log in
          </Button>
          <Button variant="primary" href="/login">
            Start for free
          </Button>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Create `src/components/marketing/Footer.tsx`**

```tsx
import Link from "next/link";

const COLS: { title: string; links: string[] }[] = [
  { title: "Product", links: ["Pricing", "Features", "Security"] },
  { title: "How it works", links: ["Inbox organizer", "Draft writer", "Meeting companion"] },
  { title: "Company", links: ["About", "Blog", "Careers"] },
  { title: "Legal", links: ["Privacy policy", "Terms of service", "Cookie policy"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="/login" className="text-sm text-ink/70 hover:text-ink">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-8 md:flex-row md:items-center">
          <span className="text-4xl font-extrabold tracking-tight text-accent">
            InboxOS
          </span>
          <p className="text-sm text-ink/50">
            © 2026 InboxOS, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create `src/app/(marketing)/layout.tsx`**

```tsx
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS (marketing group compiles; landing page from Task 1 temp or Task 4 renders).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(marketing)/layout.tsx" src/components/marketing
git commit -m "feat: marketing navbar, footer, and route-group layout"
```

---

### Task 4: Landing page sections + compose

**Files:**
- Create: `src/components/marketing/ProductMock.tsx`, `Hero.tsx`, `FeatureRow.tsx`, `StatsGrid.tsx`, `Pricing.tsx`
- Create/Overwrite: `src/app/(marketing)/page.tsx`
- Delete (if created in Task 1): `src/app/page.tsx`

**Interfaces:**
- Consumes: `Button`, `Card`.
- Produces:
  - `ProductMock` (no props) — CSS faux Gmail inbox card.
  - `Hero` (no props).
  - `FeatureRow` props `{ eyebrow: string; eyebrowColor: string; title: string; body: string; reverse?: boolean; children: ReactNode }` (children = the CSS visual).
  - `StatsGrid` (no props).
  - `Pricing` (no props) — section with `id="pricing"`.

- [ ] **Step 1: Create `src/components/marketing/ProductMock.tsx`**

```tsx
export default function ProductMock() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 text-sm font-semibold text-ink/70">Inbox</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
            SC
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Sarah Chen</span>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                To Respond
              </span>
            </div>
            <span className="text-xs text-ink/60">Re: Q4 Budget Review</span>
          </div>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
            Draft
          </span>
          <p className="mt-1 text-xs text-ink/70">
            Thanks for the follow-up, Sarah. I&apos;ve reviewed the Q4 proposal and
            have a few thoughts on the allocation…
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/marketing/Hero.tsx`**

```tsx
import Button from "@/components/ui/Button";
import ProductMock from "./ProductMock";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 text-center">
      <p className="text-lg font-medium text-ink/60">Drowning in email?</p>
      <h1 className="mx-auto mt-3 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        Let InboxOS organize your inbox and write your next reply
      </h1>
      <p className="mt-6 text-base text-ink/60">Get started with</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button variant="dark" href="/login">
          Gmail
        </Button>
        <Button variant="outline" href="/login">
          Outlook
        </Button>
      </div>
      <div className="mt-14 flex justify-center">
        <ProductMock />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/marketing/FeatureRow.tsx`**

```tsx
import type { ReactNode } from "react";

export default function FeatureRow({
  eyebrow,
  eyebrowColor,
  title,
  body,
  reverse = false,
  children,
}: {
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  body: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 py-16 md:grid-cols-2">
      <div className={reverse ? "md:order-2" : ""}>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: eyebrowColor }}
          />
          <span className="text-xs font-bold uppercase tracking-wide text-ink/60">
            {eyebrow}
          </span>
        </div>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-4 max-w-md text-ink/60">{body}</p>
      </div>
      <div className={`flex justify-center ${reverse ? "md:order-1" : ""}`}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/marketing/StatsGrid.tsx`**

```tsx
import Card from "@/components/ui/Card";

const STATS = [
  { value: "3.45hrs", label: "saved per person, per week" },
  { value: "70%", label: "feel more effective in their role" },
  { value: "640hrs", label: "of productive time recovered every week" },
  { value: "48%", label: "shift to proactive work" },
];

export default function StatsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight">
        Built to strengthen reputation.
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-ink/60">
        Customers measure InboxOS in hours reclaimed and work that finally feels
        proactive — not inbox busywork.
      </p>
      <Card className="mt-12 grid grid-cols-1 gap-px overflow-hidden bg-black/5 text-left sm:grid-cols-2">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card p-8">
            <div className="text-4xl font-extrabold text-accent">{s.value}</div>
            <div className="mt-2 text-sm font-medium text-ink/70">{s.label}</div>
          </div>
        ))}
      </Card>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/marketing/Pricing.tsx`**

```tsx
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const PRO = [
  "Drafts replies like you",
  "Organizes your inbox with labels",
  "Schedules meetings for you",
  "Ask your inbox anything",
  "Custom automation rules",
  "Priority support",
];

const ENT = [
  "Dedicated account manager",
  "Customized onboarding",
  "Custom integrations",
  "SSO, SCIM & security controls",
];

function Check() {
  return <span className="mt-0.5 text-accent">✓</span>;
}

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-20 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Get 2 hours back every day
      </h2>
      <p className="mt-4 text-ink/60">
        Start with a 14-day free trial. No credit card required.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="relative border-accent/40 p-8 text-left">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Most Popular
          </span>
          <h3 className="text-2xl font-bold">Professional</h3>
          <p className="mt-2 text-sm text-ink/60">
            For professionals who rely on email to get things done.
          </p>
          <div className="mt-6 flex items-end gap-2">
            <span className="text-4xl font-extrabold">$35</span>
            <span className="mb-1 text-ink/40 line-through">$50</span>
            <span className="mb-1 text-sm text-ink/50">per user / month</span>
          </div>
          <Button variant="primary" href="/login" className="mt-6 w-full">
            Start free trial
          </Button>
          <ul className="mt-6 space-y-3 border-t border-black/5 pt-6">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-ink/80">
                <Check /> {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-8 text-left">
          <h3 className="text-2xl font-bold">Enterprise</h3>
          <p className="mt-2 text-sm text-ink/60">
            For organizations that need scale and dedicated support.
          </p>
          <div className="mt-6">
            <span className="text-sm text-ink/50">Custom pricing</span>
            <div className="text-3xl font-extrabold">Get in touch</div>
          </div>
          <Button variant="outline" href="/login" className="mt-6 w-full">
            Talk to sales
          </Button>
          <ul className="mt-6 space-y-3 border-t border-black/5 pt-6">
            {ENT.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-ink/80">
                <Check /> {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Overwrite `src/app/(marketing)/page.tsx`** (and delete any temp `src/app/page.tsx` from Task 1)

```tsx
import Hero from "@/components/marketing/Hero";
import FeatureRow from "@/components/marketing/FeatureRow";
import StatsGrid from "@/components/marketing/StatsGrid";
import Pricing from "@/components/marketing/Pricing";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <section id="how" className="mx-auto max-w-6xl px-6">
        <FeatureRow
          eyebrow="Inbox Organizer"
          eyebrowColor="#EC4899"
          title="We organize your inbox"
          body="InboxOS works within your email, highlighting what needs attention and prioritizing what's most urgent."
        >
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
            <span className="h-4 w-4 rounded border border-ink/20" />
            <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
              TO RESPOND
            </span>
            <span className="text-sm text-ink/70">Quick feedback on the sale</span>
          </div>
        </FeatureRow>
        <FeatureRow
          eyebrow="Draft Writer"
          eyebrowColor="#84CC16"
          title="We draft in your voice"
          body="InboxOS generates a response for any email that requires one, using your past conversations to write in your tone. Just review and send."
          reverse
        >
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
            <p className="text-sm font-semibold">Hi Jamie,</p>
            <p className="mt-2 text-sm text-ink/70">
              Thanks for reaching out. Would love to jump on a quick call this
              week to walk through the details.
            </p>
            <p className="mt-2 text-sm text-ink/70">Best,<br />Jess</p>
          </div>
        </FeatureRow>
        <FeatureRow
          eyebrow="Meeting Companion"
          eyebrowColor="#38BDF8"
          title="We're plugged into every meeting"
          body="InboxOS joins your calls, takes notes, and turns decisions into follow-up emails automatically."
        >
          <div className="flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wide text-ink/50">
              Meeting notes
            </span>
            <span className="h-2 w-3/4 rounded bg-ink/10" />
            <span className="h-2 w-2/3 rounded bg-ink/10" />
            <span className="h-2 w-1/2 rounded bg-ink/10" />
          </div>
        </FeatureRow>
      </section>
      <StatsGrid />
      <Pricing />
    </>
  );
}
```

Then: `rm -f src/app/page.tsx` if it exists.

- [ ] **Step 7: Verify build + dev smoke check**

Run: `npm run build`
Expected: PASS. Then `npm run dev`, open `/`, confirm hero, three feature rows, stats grid, pricing all render and CTAs point to `/login`.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(marketing)/page.tsx" src/components/marketing
git rm --cached src/app/page.tsx 2>/dev/null || true
git commit -m "feat: landing page sections (hero, features, stats, pricing)"
```

---

### Task 5: Mock login page

**Files:**
- Create: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `signIn` from `@/lib/auth`, `Button`, `Card`, `useRouter`.
- Produces: `/login` route that sets the mock session and redirects to `/dashboard`.

- [ ] **Step 1: Create `src/app/login/page.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  function handleSignIn() {
    signIn();
    router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <Link
        href="/"
        className="mb-8 text-2xl font-extrabold tracking-tight text-accent"
      >
        InboxOS
      </Link>
      <Card className="w-full max-w-sm p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">
          Sign in to organize your inbox.
        </p>
        <div className="mt-8 space-y-3">
          <Button variant="dark" onClick={handleSignIn} className="w-full">
            Continue with Google
          </Button>
          <Button variant="outline" onClick={handleSignIn} className="w-full">
            Continue with Outlook
          </Button>
        </div>
        <p className="mt-6 text-xs text-ink/40">
          Demo sign-in — no real authentication yet.
        </p>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Verify build + smoke check**

Run: `npm run build`, then `npm run dev`. Visit `/login`, click a button, confirm redirect to `/dashboard` (will 404 until Task 6/7 — that's expected here).
Expected: build PASS; click sets localStorage `inboxos_authed=1`.

- [ ] **Step 3: Commit**

```bash
git add src/app/login
git commit -m "feat: mock login page that sets session and redirects to dashboard"
```

---

### Task 6: Dashboard shell (icons, Sidebar, Topbar, PageHeader, protected layout)

**Files:**
- Create: `src/components/app/icons.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `PageHeader.tsx`
- Create: `src/app/dashboard/layout.tsx`

**Interfaces:**
- Consumes: `isAuthed`, `signOut` from `@/lib/auth`; `usePathname`, `useRouter`.
- Produces:
  - `icons.tsx` — named exports `DashboardIcon`, `InboxIcon`, `DraftsIcon`, `SettingsIcon`, `SignOutIcon`, `SearchIcon`, each `(props: { className?: string })` returning an inline SVG.
  - `Sidebar` (no props), `Topbar` props `{ title: string }`, `PageHeader` props `{ title: string; subtitle: string }`.
  - `dashboard/layout.tsx` — client gate + shell.

- [ ] **Step 1: Create `src/components/app/icons.tsx`**

```tsx
type IconProps = { className?: string };

const svg = "h-5 w-5";

export function DashboardIcon({ className = svg }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function InboxIcon({ className = svg }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M5 5h14l2 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-7z" />
    </svg>
  );
}

export function DraftsIcon({ className = svg }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function SettingsIcon({ className = svg }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function SignOutIcon({ className = svg }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function SearchIcon({ className = svg }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
```

- [ ] **Step 2: Create `src/components/app/Sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import {
  DashboardIcon,
  InboxIcon,
  DraftsIcon,
  SettingsIcon,
  SignOutIcon,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/dashboard/inbox", label: "Inbox", Icon: InboxIcon },
  { href: "/dashboard/drafts", label: "Drafts", Icon: DraftsIcon },
  { href: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-black/5 bg-card p-4">
      <Link
        href="/dashboard"
        className="px-2 py-3 text-xl font-extrabold tracking-tight text-accent"
      >
        InboxOS
      </Link>
      <nav className="mt-6 flex-1 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-ink/70 hover:bg-ink/5"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
      >
        <SignOutIcon className="h-5 w-5" />
        Sign out
      </button>
    </aside>
  );
}
```

- [ ] **Step 3: Create `src/components/app/Topbar.tsx`**

```tsx
import { SearchIcon } from "./icons";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-black/5 bg-card px-6 py-4">
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-cream px-3 py-1.5 text-sm text-ink/40 sm:flex">
          <SearchIcon className="h-4 w-4" />
          <span>Search…</span>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
          NP
        </span>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `src/components/app/PageHeader.tsx`**

```tsx
export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/app/dashboard/layout.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import Sidebar from "@/components/app/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
      <div className="flex h-screen items-center justify-center bg-cream text-ink/40">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: PASS (dashboard layout compiles; routes 404 until Task 7 adds pages).

- [ ] **Step 7: Commit**

```bash
git add src/components/app src/app/dashboard/layout.tsx
git commit -m "feat: protected dashboard shell with sidebar, topbar, and auth gate"
```

---

### Task 7: Dashboard placeholder pages

**Files:**
- Create: `src/app/dashboard/page.tsx`, `inbox/page.tsx`, `drafts/page.tsx`, `settings/page.tsx`

**Interfaces:**
- Consumes: `Topbar`, `PageHeader`, `Card`.
- Produces: four navigable placeholder routes under `/dashboard`.

- [ ] **Step 1: Create `src/app/dashboard/page.tsx`**

```tsx
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";

export default function DashboardHome() {
  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-8">
        <PageHeader
          title="Good to see you"
          subtitle="Here's where your inbox overview will live."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {["To respond", "Drafts ready", "Held by InboxOS"].map((label) => (
            <Card key={label} className="p-6">
              <div className="text-sm font-medium text-ink/60">{label}</div>
              <div className="mt-2 text-3xl font-extrabold text-ink/30">—</div>
            </Card>
          ))}
        </div>
        <Card className="mt-6 p-10 text-center text-ink/50">
          Coming soon — your prioritized inbox and daily brief.
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create `src/app/dashboard/inbox/page.tsx`**

```tsx
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";

export default function InboxPage() {
  return (
    <>
      <Topbar title="Inbox" />
      <div className="p-8">
        <PageHeader
          title="Inbox"
          subtitle="Your organized, prioritized email will appear here."
        />
        <Card className="p-10 text-center text-ink/50">
          Coming soon — this is where your organized inbox will live.
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create `src/app/dashboard/drafts/page.tsx`**

```tsx
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";

export default function DraftsPage() {
  return (
    <>
      <Topbar title="Drafts" />
      <div className="p-8">
        <PageHeader
          title="Drafts"
          subtitle="AI-written replies waiting for your review."
        />
        <Card className="p-10 text-center text-ink/50">
          Coming soon — this is where your drafted replies will live.
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Create `src/app/dashboard/settings/page.tsx`**

```tsx
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <div className="p-8">
        <PageHeader
          title="Settings"
          subtitle="Manage your account, connected inboxes, and automation rules."
        />
        <Card className="p-10 text-center text-ink/50">
          Coming soon — this is where your settings will live.
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Verify full build + end-to-end smoke check**

Run: `npm run build` (Expected: PASS, all routes compile).
Then `npm run dev` and verify the full flow:
1. `/` renders landing; "Start for free" → `/login`.
2. `/login` → click Google → lands on `/dashboard`.
3. Sidebar nav switches between Dashboard/Inbox/Drafts/Settings with active highlight.
4. Sign out → returns to `/`.
5. Visiting `/dashboard` directly while signed out → redirects to `/login`.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard
git commit -m "feat: dashboard placeholder pages (home, inbox, drafts, settings)"
```

---

## Self-Review Notes

- **Spec coverage:** landing sections (Task 4) ✓, marketing chrome (Task 3) ✓, mock auth (Task 2/5) ✓, protected shell (Task 6) ✓, placeholder pages (Task 7) ✓, api stub (Task 2) ✓, theme tokens/font (Task 1) ✓, `/api/*` rewrite (Task 1) ✓.
- **No image assets:** all mockups are HTML/CSS ✓.
- **Type consistency:** `signIn`/`signOut`/`isAuthed` used consistently; icon component names match Sidebar imports; `Button` variants (`primary`/`dark`/`outline`) used as defined.
- **CTA target:** every marketing/pricing CTA → `/login` ✓.
