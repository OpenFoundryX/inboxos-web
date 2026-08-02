import Card from "@/components/ui/Card";

export default function AnalyticsCard({
  label,
  value,
  /** Rendered small beside the figure — "h" for hours, and so on. */
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-black/5 bg-canvas/60 px-4 py-2.5 text-xs font-medium text-ink/70">
        {label}
      </div>
      <div className="px-4 py-4">
        <span className="text-3xl font-semibold text-ink">{value}</span>
        {unit ? <span className="ml-1 text-sm text-ink/40">{unit}</span> : null}
      </div>
    </Card>
  );
}
