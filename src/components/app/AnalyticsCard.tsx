import Card from "@/components/ui/Card";

export default function AnalyticsCard({ label, value = "—" }: { label: string; value?: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-medium text-ink/60">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-ink/30">{value}</div>
    </Card>
  );
}
