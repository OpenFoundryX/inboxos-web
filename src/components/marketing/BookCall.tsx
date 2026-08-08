import Button from "@/components/ui/Button";
import { LEGAL } from "@/lib/legal";

/** What the call is actually for. Stated up front because the objection to
 *  booking one is never the calendar — it is not knowing whether it's a demo
 *  or a sales pitch. */
const AGENDA = [
  "A walkthrough of how delivery, sorting and drafting behave on a real mailbox",
  "Whether your setup fits Pro or needs Team's pooled seats",
  "Anything about security, retention or the Google scopes we ask for",
];

export default function BookCall() {
  return (
    <section id="talk" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-3xl border border-accent/40 bg-accent/[0.04] px-6 py-12 sm:px-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              Talk to a human
            </span>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Book {LEGAL.bookingMinutes} minutes with us
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink/60">
              If you would rather see it than read about it, pick a time that
              suits you. No deck — we open a mailbox and show you what InboxOS
              does to it.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button variant="primary" href={LEGAL.bookingUrl} external>
                Pick a time
              </Button>
              <span className="text-sm text-ink/45">
                Opens our calendar · {LEGAL.bookingMinutes} minutes
              </span>
            </div>
          </div>

          <ul className="space-y-3 rounded-2xl border border-black/5 bg-card p-6">
            <li className="text-xs font-semibold uppercase tracking-wide text-ink/45">
              What we&apos;ll cover
            </li>
            {AGENDA.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink/75">
                <span className="mt-0.5 text-accent" aria-hidden="true">
                  &bull;
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
