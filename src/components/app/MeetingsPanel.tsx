"use client";

import Card from "@/components/ui/Card";
import MeetingRow from "@/components/app/MeetingRow";
import type { AgendaItem, DashboardMeetings } from "@/lib/dashboard";

function Column({
  title,
  items,
  timezone,
  onToggle,
}: {
  title: string;
  items: AgendaItem[];
  timezone: string;
  onToggle: (item: AgendaItem, next: boolean) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-black/5 bg-cream/50 px-5 py-3 text-sm font-semibold text-ink">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink/40">No meetings scheduled</div>
      ) : (
        <div>
          {items.map((item) => (
            <MeetingRow
              key={item.calendar_event_id}
              item={item}
              timezone={timezone}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default function MeetingsPanel({
  meetings,
  onToggle,
}: {
  meetings: DashboardMeetings;
  onToggle: (item: AgendaItem, next: boolean) => void;
}) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <Column
        title="Today"
        items={meetings.today}
        timezone={meetings.timezone}
        onToggle={onToggle}
      />
      <Column
        title="Tomorrow"
        items={meetings.tomorrow}
        timezone={meetings.timezone}
        onToggle={onToggle}
      />
    </div>
  );
}
