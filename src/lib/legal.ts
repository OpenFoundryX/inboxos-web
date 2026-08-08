/** Company facts quoted by the privacy policy and terms.
 *
 *  Anything still wrapped in TODO() is a value nobody has supplied yet. The
 *  pages render those markers visibly and show a warning banner, rather than
 *  quietly publishing a policy with a blank where the governing law should be.
 *  Fill these in — and have a lawyer read the pages — before going live. */

const TODO = (what: string) => `[TODO: ${what}]`;

export const LEGAL = {
  entity: "InboxOS, Inc.",
  /** Shown as the "last updated" date on both documents. */
  effectiveDate: "30 July 2026",

  registeredAddress: TODO("registered company address"),
  governingLaw: TODO("governing law, e.g. State of Delaware, USA"),
  courts: TODO("courts with exclusive jurisdiction"),
  privacyEmail: TODO("privacy contact address"),
  supportEmail: TODO("support contact address"),
  legalEmail: TODO("legal notices address"),
  /** Where Team/Enterprise's "Talk to us" CTAs point — those tiers have no
   *  Checkout path (no workspace/org model exists yet to sell against), so
   *  routing them anywhere but a real human contact is dishonest. */
  salesEmail: TODO("sales contact address"),
  /** Public booking link for the "Talk to a human" section. Deliberately not
   *  a TODO(): it is a real live URL, so it is the one contact route on the
   *  site that works today. Not covered by `unresolvedLegalFields`. */
  bookingUrl: "https://calendly.com/nilesh-pant99/30min",
  /** Kept next to the URL so the copy and the actual calendar can't drift. */
  bookingMinutes: 30,
  /** Only needed if you have EU/UK users and appoint one. */
  euRepresentative: TODO("EU/UK representative, or delete this line"),
} as const;

export const isPlaceholder = (v: string) => v.startsWith("[TODO:");

export const unresolvedLegalFields = () =>
  Object.entries(LEGAL)
    .filter(([, v]) => typeof v === "string" && isPlaceholder(v))
    .map(([k]) => k);

/** Third parties that touch customer data. This list is a compliance
 *  obligation, not marketing copy: it has to match what the backend actually
 *  calls, so update it whenever a provider changes. */
export const SUBPROCESSORS: {
  name: string;
  purpose: string;
  data: string;
}[] = [
  {
    name: TODO("cloud hosting provider"),
    purpose: "Application hosting and database storage",
    data: "All service data",
  },
  {
    name: TODO("LLM provider"),
    purpose: "Categorization, draft generation, summaries, mailbox Q&A",
    data: "Email content and meeting transcripts, as needed per request",
  },
  {
    name: TODO("meeting bot / transcription provider"),
    purpose: "Joining calls, recording, and producing transcripts",
    data: "Meeting audio, video, and transcripts",
  },
  {
    name: TODO("payment processor"),
    purpose: "Subscription billing",
    data: "Billing contact and payment details (we never see full card numbers)",
  },
  {
    name: TODO("transactional email provider"),
    purpose: "Sending briefings, recaps, and account email",
    data: "Your email address and message contents we generate",
  },
];
