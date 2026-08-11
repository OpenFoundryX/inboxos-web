/** Company facts quoted by the privacy policy and terms.
 *
 *  Anything still wrapped in TODO() is a value nobody has supplied yet. The
 *  pages render those markers visibly and show a warning banner, rather than
 *  quietly publishing a policy with a blank where the governing law should be.
 *  Fill these in — and have a lawyer read the pages — before going live. */

const TODO = (what: string) => `[TODO: ${what}]`;

export const LEGAL = {
  entity: "InboxOS Private Limited",
  /** Shown as the "last updated" date on both documents. Bumped whenever the
   *  substance changes — the subprocessor list and the transfers section were
   *  both rewritten on this date. */
  effectiveDate: "11 August 2026",

  /** City and country rather than a street address, by choice. If you later
   *  need the full registered office printed — some filings and some reviewers
   *  ask for it — expand this string; nothing else has to change. */
  registeredAddress: "Bengaluru, India",
  governingLaw: "India",
  /** Indian jurisdiction clauses name a city, not the country. Matches the
   *  registered office above. */
  courts: "Bengaluru",
  privacyEmail: "privacy@inboxhq.com",
  supportEmail: "support@inboxhq.com",
  legalEmail: "legal@inboxhq.com",
  /** Where Team/Enterprise's "Talk to us" CTAs point — those tiers have no
   *  Checkout path (no workspace/org model exists yet to sell against), so
   *  routing them anywhere but a real human contact is dishonest. */
  salesEmail: "sales@inboxhq.com",
  /** Public booking link for the "Talk to a human" section. Deliberately not
   *  a TODO(): it is a real live URL, so it is the one contact route on the
   *  site that works today. Not covered by `unresolvedLegalFields`. */
  bookingUrl: "https://calendly.com/nilesh-pant99/30min",
  /** Kept next to the URL so the copy and the actual calendar can't drift. */
  bookingMinutes: 30,
  // `euRepresentative` was removed: the service is not offered to EU/UK users,
  // so there is no Art. 27 representative to name. If that changes, appoint one
  // and put the field and its sentence in §9 of the privacy policy back.
} as const;

export const isPlaceholder = (v: string) => v.startsWith("[TODO:");

export const unresolvedLegalFields = () =>
  Object.entries(LEGAL)
    .filter(([, v]) => typeof v === "string" && isPlaceholder(v))
    .map(([k]) => k);

/** Third parties that touch customer data. This list is a compliance
 *  obligation, not marketing copy: it has to match what the backend actually
 *  calls, so update it whenever a provider changes.
 *
 *  Each entry below was read off the backend rather than assumed —
 *  `render.yaml` for hosting, `pyproject.toml` and `core/config.py` for the
 *  rest. There is deliberately no transactional-email provider in this list:
 *  briefings, recaps and scheduling mail are all sent through the user's own
 *  Gmail via `gmail.send_email` (`services/notify.py`), so no third party ever
 *  receives them. */
export const SUBPROCESSORS: {
  name: string;
  purpose: string;
  data: string;
}[] = [
  {
    name: "Render",
    purpose:
      "Application hosting, background workers, PostgreSQL database and Redis",
    data: "All service data",
  },
  {
    name: "OpenAI",
    purpose: "Categorization, draft generation, summaries, mailbox Q&A",
    data: "Email content and meeting transcripts, as needed per request",
  },
  {
    name: "Recall.ai",
    purpose: "Joining calls, recording, and producing transcripts",
    data: "Meeting audio, video, and transcripts",
  },
  {
    name: "Amazon Web Services (S3)",
    purpose: "Storage of meeting recordings and uploaded files",
    data: "Meeting audio and video, and files you upload for drafting",
  },
  {
    name: "Razorpay",
    purpose: "Subscription billing",
    data: "Billing contact and payment details (we never see full card numbers)",
  },
];
