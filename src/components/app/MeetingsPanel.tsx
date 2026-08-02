"use client";

import Card from "@/components/ui/Card";
import MeetingRow from "@/components/app/MeetingRow";
import type { AgendaItem, DashboardMeetings } from "@/lib/dashboard";

function Column({
  title,
  items,
  timezone,
  emptyMessage,
  onToggle,
}: {
  title: string;
  items: AgendaItem[];
  timezone: string;
  emptyMessage: string;
  onToggle: (item: AgendaItem, next: boolean) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-black/5 bg-canvas/60 px-4 py-2.5 text-xs font-medium text-ink/70">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink/40">{emptyMessage}</div>
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
        emptyMessage="No meetings today"
        onToggle={onToggle}
      />
      <Column
        title="Tomorrow"
        items={meetings.tomorrow}
        timezone={meetings.timezone}
        emptyMessage="No meetings tomorrow"
        onToggle={onToggle}
      />
    </div>
  );
}
