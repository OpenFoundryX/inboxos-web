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
