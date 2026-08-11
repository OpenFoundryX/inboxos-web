import Link from "next/link";
import Card from "@/components/ui/Card";
import { APP_NAME } from "@/lib/app";

/** The scope justification Google's OAuth verification reviewers look for on the
 *  home page: every permission the consent screen asks for, next to the feature
 *  that needs it.
 *
 *  These mirror `CONNECT_SCOPES` in the backend's `models/google.py` — that
 *  tuple is the single source of truth for what the grant actually asks for.
 *  If a scope is added there, add the row here in the same sitting: a home page
 *  claiming a narrower grant than the app requests is worse for the review than
 *  no list at all. */
const SCOPES: {
  scope: string;
  permission: string;
  why: string;
  dot: string;
}[] = [
  {
    scope: "openid · email · profile",
    permission: "Sign you in",
    why: `Identifies whose mailbox ${APP_NAME} is working on, and shows your name and photo in the app.`,
    dot: "#4C7A8C",
  },
  {
    scope: "gmail.modify",
    permission: "Read, label and draft your mail",
    why: "Reads incoming mail to sort and rank it, applies the labels you see, and saves replies as Gmail drafts for you to review. Sending is limited to scheduling threads you have CC'd the agent on. The scope cannot bypass your Trash, so nothing can be permanently deleted.",
    dot: "#1F6F5C",
  },
  {
    scope: "gmail.settings.basic",
    permission: "Manage your Gmail filters",
    why: "Batched delivery is a real Gmail filter, not a trick of the interface — it holds new mail out of your inbox until the next delivery time. This creates and removes those filters, and nothing else.",
    dot: "#8C7A4C",
  },
  {
    scope: "calendar",
    permission: "See and manage your calendars",
    why: "Reads event times and free/busy status to offer slots that work and to know which calls to join. Places the invitation once a time is agreed, and moves it when plans change.",
    dot: "#6B5C8C",
  },
];

const SCOPE_PREFIX = "https://www.googleapis.com/auth/";

export default function GoogleData() {
  return (
    <section id="google-data" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          How {APP_NAME} uses your Google account
        </h2>
        <p className="mt-4 leading-relaxed text-ink/60">
          Every permission {APP_NAME} asks for when you sign in, and the feature
          that needs it.
        </p>
      </div>

      <Card className="mt-12 divide-y divide-black/5">
        {SCOPES.map((s) => (
          <div key={s.scope} className="grid gap-2 p-7 md:grid-cols-3 md:gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: s.dot }}
                />
                <h3 className="font-semibold leading-snug">{s.permission}</h3>
              </div>
              {/* Just the distinctive tail of the scope. The prefix every Google
               *  scope shares is noted once under the card instead of repeated
               *  four times — at this column width it could only be shown by
               *  breaking the URL mid-word, which reads as a typo. */}
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink/40">
                {s.scope}
              </p>
            </div>
            <p className="leading-relaxed text-ink/65 md:col-span-2">{s.why}</p>
          </div>
        ))}
      </Card>

      <div className="mx-auto mt-10 max-w-3xl space-y-4 text-center text-sm leading-relaxed text-ink/55">
        <p className="font-mono text-[11px] text-ink/40">
          Gmail and Calendar scopes are prefixed{" "}
          <span className="text-ink/55">{SCOPE_PREFIX}</span>
        </p>
        <p>
          {APP_NAME}&rsquo;s use of information received from Google APIs adheres
          to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-accent hover:underline"
          >
            Google API Services User Data Policy
          </a>
          , including its Limited Use requirements. Your Gmail and Calendar data
          is used only for the features above — never sold, never used for
          advertising, and never used to train any AI model.
        </p>
        <p>
          Revoke access at any time from your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-accent hover:underline"
          >
            Google account permissions
          </a>
          , or read the{" "}
          <Link href="/privacy" className="font-medium text-accent hover:underline">
            full privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
