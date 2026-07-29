import Hero from "@/components/marketing/Hero";
import FeatureRow from "@/components/marketing/FeatureRow";
import EmailFlow from "@/components/marketing/EmailFlow";
import ValueStack from "@/components/marketing/ValueStack";
import Pricing from "@/components/marketing/Pricing";
import PlanComparison from "@/components/marketing/PlanComparison";
import AddOns from "@/components/marketing/AddOns";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <section id="how" className="mx-auto max-w-6xl px-6">
        <FeatureRow
          eyebrow="Delivery"
          eyebrowColor="#1F6F5C"
          title="Your mail runs on a schedule"
          body="New mail is held and handed to you in batches — three times a day, every two hours, or whatever rhythm suits your work. Set quiet hours and it waits. Put someone on your VIP list and they never wait at all."
        >
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">
              Next delivery
            </span>
            <p className="mt-1 font-serif text-2xl font-semibold">1:00 PM</p>
            <p className="mt-3 text-sm text-ink/60">
              14 messages waiting · 2 VIPs already through
            </p>
          </div>
        </FeatureRow>
        <FeatureRow
          eyebrow="Sorting"
          eyebrowColor="#4C7A8C"
          title="Sorted before you open it"
          body="Every message is read, labelled, and ranked by what actually needs you. The low-value ones move out of the way. Nothing is ever deleted."
          reverse
        >
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
            <span className="h-4 w-4 rounded border border-ink/20" />
            <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              To respond
            </span>
            <span className="text-sm text-ink/70">Quick feedback on the sale</span>
          </div>
        </FeatureRow>
        <FeatureRow
          eyebrow="Drafting"
          eyebrowColor="#8C7A4C"
          title="Replies already written"
          body="Anything that needs an answer arrives with one drafted in your own phrasing, learned from how you have written before. Read it, adjust it, send it."
        >
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
            <p className="text-sm font-semibold">Hi Jamie,</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              Thanks for reaching out. Would love to jump on a quick call this
              week to walk through the details.
            </p>
            <p className="mt-2 text-sm text-ink/70">
              Best,
              <br />
              Jess
            </p>
          </div>
        </FeatureRow>
        <FeatureRow
          eyebrow="Meetings"
          eyebrowColor="#6B5C8C"
          title="Meetings, written up"
          body="InboxOS joins your Zoom, Meet and Teams calls, keeps the notes, and turns what was decided into the follow-up email and a set of reminders."
          reverse
        >
          <div className="flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">
              Meeting notes
            </span>
            <span className="h-2 w-3/4 rounded bg-ink/10" />
            <span className="h-2 w-2/3 rounded bg-ink/10" />
            <span className="h-2 w-1/2 rounded bg-ink/10" />
          </div>
        </FeatureRow>
        <FeatureRow
          eyebrow="Scheduling"
          eyebrowColor="#4C6B8C"
          title="Vela does the back-and-forth"
          body="CC Vela on a thread and it takes over the scheduling — proposing times, negotiating with up to eight people, booking the invite, and rearranging things when something clashes."
        >
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">
              Vela
            </span>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              Tuesday at 2pm works for everyone except Ravi. Proposing 3:30pm
              instead — I&apos;ll send the invite once he confirms.
            </p>
          </div>
        </FeatureRow>
      </section>
      <EmailFlow />
      <ValueStack />
      <Pricing />
      <PlanComparison />
      <AddOns />
    </>
  );
}
