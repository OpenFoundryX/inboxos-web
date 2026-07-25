import Card from "@/components/ui/Card";

function Column({ title }: { title: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="mt-6 text-center text-sm text-ink/40">No meetings scheduled</div>
    </Card>
  );
}

export default function MeetingsPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Column title="Today" />
      <Column title="Tomorrow" />
    </div>
  );
}
