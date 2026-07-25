import Card from "@/components/ui/Card";

const STATS = [
  { value: "3.45hrs", label: "saved per person, per week" },
  { value: "70%", label: "feel more effective in their role" },
  { value: "640hrs", label: "of productive time recovered every week" },
  { value: "48%", label: "shift to proactive work" },
];

export default function StatsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight">
        Built to strengthen reputation.
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-ink/60">
        Customers measure InboxOS in hours reclaimed and work that finally feels
        proactive — not inbox busywork.
      </p>
      <Card className="mt-12 grid grid-cols-1 gap-px overflow-hidden bg-black/5 text-left sm:grid-cols-2">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card p-8">
            <div className="text-4xl font-extrabold text-accent">{s.value}</div>
            <div className="mt-2 text-sm font-medium text-ink/70">{s.label}</div>
          </div>
        ))}
      </Card>
    </section>
  );
}
