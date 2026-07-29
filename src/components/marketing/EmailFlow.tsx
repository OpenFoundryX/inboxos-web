import Card from "@/components/ui/Card";

const STEPS = [
  {
    step: "Arrives",
    body: "A message lands. Instead of interrupting you, it goes into a holding queue.",
  },
  {
    step: "Read and labelled",
    body: "It gets categorized and ranked by whether it genuinely needs a reply from you.",
  },
  {
    step: "Drafted",
    body: "If an answer is expected, one is written in your phrasing and attached to the thread.",
  },
  {
    step: "Delivered",
    body: "At your next scheduled time, the whole batch appears — sorted, labelled, ready to clear.",
  },
];

const PROMISES = [
  "Nothing is ever deleted — low-value mail is moved, not thrown away.",
  "VIPs bypass the queue entirely and arrive the moment they are sent.",
  "Quiet hours are respected; nothing is delivered inside them.",
  "Turn batching off at any time and mail goes back to arriving live.",
];

export default function EmailFlow() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          What happens to your email
        </h2>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink/60">
          No inbox is emptied behind your back. Here is the whole path a message
          takes, start to finish.
        </p>
      </div>

      <ol className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-black/5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.step} className="bg-card p-7">
            <span className="font-serif text-sm font-semibold text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-semibold">{s.step}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.body}</p>
          </li>
        ))}
      </ol>

      <Card className="mt-8 p-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          What stays under your control
        </h3>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {PROMISES.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-ink/75">
              <span className="mt-0.5 text-accent" aria-hidden="true">
                &bull;
              </span>
              {p}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
