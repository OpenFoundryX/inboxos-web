/** Pricing is defined once, here, and read by both the tier cards and the
 *  comparison matrix. Two hand-maintained copies of a price table drift, and
 *  the drift is always discovered by a customer. */

export type PlanId = "starter" | "pro" | "team" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  blurb: string;
  /** null means "talk to us" rather than a number. */
  monthly: number | null;
  annual: number | null;
  /** Rendered under the price. Seat-based plans say so; Enterprise doesn't. */
  unit: string | null;
  cta: string;
  featured?: boolean;
  /** Headline limits, surfaced on the card so the metered bits aren't a surprise. */
  highlights: string[];
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "Tame your inbox. Light meeting notes when you need them.",
    monthly: 19,
    annual: 15,
    unit: "per seat / month",
    cta: "Start free trial",
    highlights: [
      "1 mailbox",
      "5 bot-hours a month",
      "Overage $0.90 / hour",
      "Scheduling helpers only",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "The full assistant: smart mail, meeting recaps, and Vela scheduling.",
    monthly: 39,
    annual: 29,
    unit: "per seat / month",
    cta: "Start 14-day Pro trial",
    featured: true,
    highlights: [
      "2 mailboxes",
      "15 bot-hours a month",
      "Overage $0.80 / hour",
      "40 scheduling threads",
    ],
  },
  {
    id: "team",
    name: "Team",
    blurb: "Everything in Pro, shared across your team, with room to run.",
    monthly: 59,
    annual: 49,
    unit: "per seat / month",
    cta: "Start free trial",
    highlights: [
      "3 mailboxes per seat",
      "25 bot-hours per seat",
      "Overage $0.70 / hour",
      "100 scheduling threads per seat",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    blurb: "Security, admin, and volume pricing for orgs that live in meetings.",
    monthly: null,
    annual: null,
    unit: null,
    cta: "Talk to us",
    highlights: [
      "Pooled hours and threads",
      "SSO / SAML and SCIM",
      "Custom retention and residency",
      "Invoicing and net-30",
    ],
  },
];

/** Retention windows live here because two places quote them: the pricing
 *  matrix and the privacy policy. If those two ever disagree, the privacy
 *  policy is the one that becomes a problem. */
export const RETENTION: Record<PlanId, { video: string; transcript: string }> = {
  starter: { video: "7 days", transcript: "90 days" },
  pro: { video: "30 days", transcript: "1 year" },
  team: { video: "90 days", transcript: "2 years" },
  enterprise: { video: "Custom", transcript: "Custom" },
};

/** A matrix cell. `true`/`false` render as a tick or a dash; a string renders
 *  verbatim, which is how limits and "Coming" get expressed. */
export type Cell = boolean | string;

export type FeatureGroup = {
  title: string;
  caption: string;
  rows: { label: string; cells: Record<PlanId, Cell>; note?: string }[];
};

const all = (v: Cell): Record<PlanId, Cell> => ({
  starter: v,
  pro: v,
  team: v,
  enterprise: v,
});

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "Email",
    caption: "Sorting, batched delivery, and drafts across your mailboxes.",
    rows: [
      { label: "Gmail", cells: all(true) },
      {
        label: "Outlook / Microsoft 365",
        // Not shipped yet. The login screen still disables the Outlook path, so
        // this stays "Coming" on every tier until it actually works.
        cells: all("Coming"),
        note: "In development — not billable today",
      },
      { label: "Auto-categorization", cells: all(true) },
      {
        label: "Custom categories and rules",
        cells: { starter: "Basic", pro: true, team: true, enterprise: true },
      },
      { label: "Batched delivery and VIP bypass", cells: all(true) },
      { label: "Active hours and do-not-disturb", cells: all(true) },
      { label: "Web chat and email-to-self commands", cells: all(true) },
      {
        label: "AI drafts and reply assist",
        cells: {
          starter: "20 / month",
          pro: "Unlimited",
          team: "Unlimited",
          enterprise: "Unlimited",
        },
        note: "Unlimited subject to fair use",
      },
      { label: "Mailbox Q&A with sources", cells: all(true) },
      {
        label: "Routines: briefing, catch-up, chase, reconnect",
        cells: {
          starter: "Briefing only",
          pro: "All",
          team: "All",
          enterprise: "All",
        },
      },
      {
        label: "Invoice, deadline and newsletter digests",
        cells: { starter: false, pro: true, team: true, enterprise: true },
      },
      {
        label: "Shared team rules and playbooks",
        cells: { starter: false, pro: false, team: true, enterprise: true },
      },
      {
        label: "Shared and delegated mailboxes",
        cells: { starter: false, pro: false, team: true, enterprise: true },
      },
    ],
  },
  {
    title: "Meeting notes",
    caption: "Zoom, Meet and Teams. Hours are recorded bot time, prorated.",
    rows: [
      { label: "Ad-hoc join from a link", cells: all(true) },
      { label: "Calendar auto-join", cells: all(true) },
      { label: "Skip rules, attendee minimums, bot name", cells: all(true) },
      { label: "Recap email with decisions and actions", cells: all(true) },
      { label: "Action items become reminders", cells: all(true) },
      { label: "Meetings in the daily briefing", cells: all(true) },
      {
        label: "Included bot-hours per month",
        cells: {
          starter: "5",
          pro: "15",
          team: "25 / seat",
          enterprise: "Custom",
        },
        note: "Unused hours do not roll over",
      },
      {
        label: "Video retention",
        cells: {
          starter: RETENTION.starter.video,
          pro: RETENTION.pro.video,
          team: RETENTION.team.video,
          enterprise: RETENTION.enterprise.video,
        },
      },
      {
        label: "Transcript retention",
        cells: {
          starter: RETENTION.starter.transcript,
          pro: RETENTION.pro.transcript,
          team: RETENTION.team.transcript,
          enterprise: RETENTION.enterprise.transcript,
        },
      },
      {
        label: "Shared team meeting library",
        cells: { starter: false, pro: false, team: true, enterprise: true },
      },
      {
        label: "Push recaps to CRM and Slack",
        cells: { starter: false, pro: "Add-on", team: true, enterprise: true },
      },
    ],
  },
  {
    title: "Vela scheduling",
    caption:
      "A scheduling thread is one coordination job — from first outreach until booked, declined, or abandoned.",
    rows: [
      { label: "Google and Outlook calendar sync", cells: all(true) },
      { label: "Free/busy lookup", cells: all(true) },
      { label: "Double-booking and clash alerts", cells: all(true) },
      { label: "VIP meeting request becomes a draft reply", cells: all(true) },
      {
        label: "Vela agent: CC or forward to schedule",
        cells: { starter: false, pro: true, team: true, enterprise: true },
      },
      {
        label: "Multi-party negotiation",
        cells: {
          starter: false,
          pro: "Up to 4 parties",
          team: "Up to 8 parties",
          enterprise: "Custom",
        },
      },
      {
        label: "Auto-book and send the invite",
        cells: { starter: false, pro: true, team: true, enterprise: true },
      },
      {
        label: "Auto-reschedule on conflict",
        cells: { starter: false, pro: true, team: true, enterprise: true },
      },
      {
        label: "Booking link and intake page",
        cells: {
          starter: false,
          pro: "1 link",
          team: "Unlimited",
          enterprise: "Custom branded",
        },
      },
      {
        label: "Included scheduling threads per month",
        cells: {
          starter: false,
          pro: "40",
          team: "100 / seat",
          enterprise: "Custom",
        },
      },
      {
        label: "Scheduling overage",
        cells: {
          starter: false,
          pro: "$0.50 / thread",
          team: "$0.35 / thread",
          enterprise: "Volume",
        },
      },
      {
        label: "SMS and WhatsApp coordination",
        cells: { starter: false, pro: false, team: "Add-on", enterprise: true },
      },
      {
        label: "Team pool calendar and round-robin",
        cells: { starter: false, pro: false, team: true, enterprise: true },
      },
    ],
  },
];

export const ADD_ONS = [
  {
    name: "Extra bot-hours",
    price: "$7",
    unit: "per 10-hour pack",
    note: "Prepaid at roughly $0.70 an hour.",
  },
  {
    name: "Extra mailbox",
    price: "$8",
    unit: "per month",
    note: "Beyond what your plan includes.",
  },
  {
    name: "SMS and WhatsApp for Vela",
    price: "$15",
    unit: "per seat / month",
    note: "Carrier charges passed through where they apply.",
  },
  {
    name: "CRM recap sync",
    price: "$10",
    unit: "per seat / month",
    note: "HubSpot and Salesforce. Included on Team.",
  },
  {
    name: "Priority support",
    price: "$20",
    unit: "per month",
    note: "Under four business hours. Starter and Pro only.",
  },
];

/** What buyers are otherwise paying, stacked up against one Pro seat. */
export const ALTERNATIVES = [
  { label: "Email client (Superhuman, Shortwave)", cost: "$25–30" },
  { label: "Meeting notetaker (Fathom, Fireflies)", cost: "$0–20" },
  // Deliberately not naming Vela here — it's our own module name, and listing it
  // as a competitor on the same page reads as a mistake.
  { label: "Scheduling agent (Motion, Reclaim-class)", cost: "$19–29+" },
];

export const ALTERNATIVES_TOTAL = "$50–80";

export const ANNUAL_SAVING_LABEL = "Save 25%";
