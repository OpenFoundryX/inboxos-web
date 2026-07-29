import Card from "@/components/ui/Card";
import { ALTERNATIVES, ALTERNATIVES_TOTAL, PLANS } from "@/lib/plans";

const pro = PLANS.find((p) => p.id === "pro")!;

export default function ValueStack() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          Three tools, or one seat
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink/60">
          Most people doing this properly are paying for an email client, a
          notetaker and a scheduler separately.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Card className="p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Bought separately
          </h3>
          <ul className="mt-5 space-y-3">
            {ALTERNATIVES.map((a) => (
              <li
                key={a.label}
                className="flex items-baseline justify-between gap-4 border-b border-black/5 pb-3 text-sm"
              >
                <span className="text-ink/75">{a.label}</span>
                <span className="shrink-0 font-medium text-ink/60">{a.cost}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between gap-4">
            <span className="text-sm font-semibold">Monthly total</span>
            <span className="font-serif text-2xl font-semibold text-ink/70">
              {ALTERNATIVES_TOTAL}
            </span>
          </div>
        </Card>

        <Card className="border-accent/40 bg-accent/[0.04] p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
            InboxOS Pro
          </h3>
          <p className="mt-5 leading-relaxed text-ink/75">
            Inbox sorting and batched delivery, meeting recaps with action items,
            and Vela handling the scheduling back-and-forth. One subscription,
            one place to change your mind.
          </p>
          <div className="mt-8 flex items-end gap-2">
            <span className="text-5xl font-semibold">${pro.annual}</span>
            <span className="mb-1.5 text-sm text-ink/50">
              per seat / month, billed annually
            </span>
          </div>
          <p className="mt-2 text-sm text-ink/50">
            Or ${pro.monthly} billed monthly.
          </p>
        </Card>
      </div>
    </section>
  );
}
