"use client";

import { useRouter } from "next/navigation";
import Menu, { MenuItem, MenuNote } from "@/components/ui/Menu";
import { CalendarIcon, ChevronDownIcon, MicIcon, UploadIcon } from "@/components/app/icons";

/**
 * Ways to get a call recorded.
 *
 * Only one of them exists today: the bot joins meetings it finds on your
 * calendar, which is switched on per meeting from the dashboard. Ad-hoc
 * recording and uploads both need endpoints the API doesn't have, so they're
 * shown disabled with the reason rather than left out — the gap is the useful
 * information here.
 */
export default function RecordMeetingMenu() {
  const router = useRouter();

  return (
    <Menu
      trigger={(open) => (
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark">
          Record meeting
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      )}
      panelClassName="w-64"
    >
      {(close) => (
        <>
          <MenuItem
            icon={<CalendarIcon className="h-4 w-4" />}
            onSelect={() => {
              close();
              router.push("/dashboard");
            }}
          >
            Record an upcoming meeting
          </MenuItem>
          <MenuItem icon={<MicIcon className="h-4 w-4" />} disabled>
            Start recording now
          </MenuItem>
          <MenuItem icon={<UploadIcon className="h-4 w-4" />} disabled>
            Upload a recording
          </MenuItem>
          <MenuNote>
            The notetaker joins calls from your calendar. Ad-hoc recording and uploads aren&apos;t
            available yet.
          </MenuNote>
        </>
      )}
    </Menu>
  );
}
