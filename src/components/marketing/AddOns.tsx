import Card from "@/components/ui/Card";
import { ADD_ONS } from "@/lib/plans";

export default function AddOns() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight">
          Add-ons
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink/60">
          For the months that run heavier than usual. Add or drop them whenever.
        </p>
      </div>

      <Card className="mt-12 grid grid-cols-1 gap-px overflow-hidden bg-black/5 sm:grid-cols-2 lg:grid-cols-3">
        {ADD_ONS.map((a) => (
          <div key={a.name} className="flex flex-col bg-card p-6">
            <h3 className="text-sm font-semibold">{a.name}</h3>
            <div className="mt-3 flex items-end gap-1.5">
              <span className="text-2xl font-semibold">{a.price}</span>
              <span className="mb-0.5 text-xs text-ink/50">{a.unit}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">{a.note}</p>
          </div>
        ))}
      </Card>
    </section>
  );
}
