import Card from "@/components/ui/Card";
import { APP_NAME } from "@/lib/app";

/** Google's OAuth verification reviewers check that the home page states, in
 *  plain language, what the application is and what it does. The feature rows
 *  below demonstrate it, but they never say it outright — and a reviewer who has
 *  never used the product cannot infer a purpose from a screenshot of a delivery
 *  time. This section is that plain statement.
 *
 *  Deliberately not another feature list: the rows under `#how` already walk
 *  through delivery, sorting, drafting, meetings and scheduling, and repeating
 *  them here would read as padding. This answers the three questions a reviewer
 *  actually has — what is it, who is it for, what does it touch. */

const FACTS = [
  {
    label: "What it is",
    body: `A web application that works on your existing mailbox. ${APP_NAME} is not an email client and does not replace Gmail — your mail stays where it is, and nothing is ever deleted.`,
  },
  {
    label: "Who it is for",
    body: "People whose day is mostly email and meetings. Sold as a paid subscription to individuals and to teams, with a seven-day trial.",
  },
  {
    label: "What it connects to",
    body: "Your Google account — Gmail and Google Calendar — plus Zoom, Google Meet and Microsoft Teams for the calls it is asked to take notes in.",
  },
];

export default function Purpose() {
  return (
    <section id="what-it-is" className="border-y border-black/5 bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            What {APP_NAME} is
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">
            <strong className="font-semibold text-ink">{APP_NAME}</strong> is an
            assistant for your email, your meetings and your scheduling. You
            connect your Google account, and it works on your Gmail mailbox and
            Google Calendar on your behalf — sorting and batching incoming mail,
            preparing draft replies for you to review, writing up the meetings it
            attends, and settling the times for new ones.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FACTS.map((f) => (
            <Card key={f.label} className="p-7">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                {f.label}
              </h3>
              <p className="mt-3 leading-relaxed text-ink/65">{f.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
