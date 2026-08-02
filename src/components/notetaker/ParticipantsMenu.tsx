"use client";

import Menu from "@/components/ui/Menu";
import Avatar from "@/components/notetaker/Avatar";
import { ChevronDownIcon } from "@/components/app/icons";
import { attendeeName } from "@/lib/meetings";

export default function ParticipantsMenu({ attendees }: { attendees: string[] }) {
  const count = attendees.length;
  const label = `${count} ${count === 1 ? "participant" : "participants"}`;

  if (count === 0) {
    return <span className="shrink-0 text-sm text-ink/40">No participants recorded</span>;
  }

  return (
    <Menu
      trigger={(open) => (
        <span className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink">
          {label}
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      )}
      panelClassName="max-h-72 w-64 overflow-y-auto"
    >
      {attendees.map((attendee) => {
        const name = attendeeName(attendee);
        return (
          <div key={attendee} className="flex items-center gap-2.5 px-3.5 py-2">
            <Avatar name={name} />
            <div className="min-w-0">
              <div className="truncate text-sm text-ink">{name}</div>
              {/* Only worth a second line when it says something the name doesn't. */}
              {name !== attendee ? (
                <div className="truncate text-xs text-ink/40">{attendee}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </Menu>
  );
}
