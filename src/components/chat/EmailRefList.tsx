import { EnvelopeIcon, ExternalLinkIcon } from "@/components/app/icons";

export type EmailRef = {
  /** The markdown link label — in practice the subject line. */
  title: string;
  /** Already validated as http(s) by the caller. */
  href: string | null;
  /** Whatever prose trailed the link, tidied for display. May be empty. */
  meta: string;
};

/** Best-effort tidying of the prose that follows an email link, so a line like
 *  "from Amazon Pay India (Due on 26 Jul 2026)" reads as a meta line rather
 *  than a sentence fragment. Anything that doesn't match falls through
 *  unchanged — this only ever cosmetically rearranges, never drops text. */
export function tidyMeta(trailing: string): string {
  let out = trailing.trim();
  if (!out) return "";
  // "from Acme" → "Acme": the envelope icon already says this is an email.
  out = out.replace(/^from\s+/i, "");
  // A trailing "(Due on 26 Jul)" becomes a middot-separated chunk, matching
  // how SourceList renders "sender · date".
  out = out.replace(/\s*\(([^)]+)\)\s*$/, (_, inner: string) => {
    const cleaned = String(inner).replace(/^due\s+on\s+/i, "Due ");
    return ` · ${cleaned}`;
  });
  return out.trim();
}

function Row({ email }: { email: EmailRef }) {
  const inner = (
    <>
      <EnvelopeIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink/40 group-hover:text-accent" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink group-hover:text-accent">
          {email.title}
        </span>
        {email.meta ? (
          <span className="block truncate text-xs text-ink/50">{email.meta}</span>
        ) : null}
      </span>
      {email.href ? (
        <ExternalLinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/0 transition-colors group-hover:text-ink/40" />
      ) : null}
    </>
  );

  const shared = "group flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm";

  // A reference whose URL failed the http(s) check still shows — losing the
  // link is better than silently dropping the email from the answer.
  return email.href ? (
    <a
      href={email.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${shared} transition-colors hover:bg-canvas`}
    >
      {inner}
    </a>
  ) : (
    <div className={shared}>{inner}</div>
  );
}

export default function EmailRefList({ emails }: { emails: EmailRef[] }) {
  if (emails.length === 0) return null;
  return (
    <div className="my-3 overflow-hidden rounded-xl border border-black/5 bg-card divide-y divide-black/5">
      {emails.map((email, i) => (
        <Row key={`${email.href ?? email.title}-${i}`} email={email} />
      ))}
    </div>
  );
}
