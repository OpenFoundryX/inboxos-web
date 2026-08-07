"use client";

import { useRouter } from "next/navigation";
import Menu, { MenuItem } from "@/components/ui/Menu";
import { CalendarIcon, ChevronDownIcon, MicIcon, UploadIcon } from "@/components/app/icons";

type Props = {
  /** Begin a browser recording. Async because it reserves a row and an upload
   *  URL before the microphone is ever touched. */
  onRecordNow: () => void;
  onInvite: () => void;
  onUpload: () => void;
  /** True while a recording is already in progress — starting a second one
   *  would silently take over the microphone from the first. */
  recording?: boolean;
};

/** Ways to get a call recorded: send a bot to it, record it here, or hand over
 *  a file of one that already happened. */
export default function RecordMeetingMenu({
  onRecordNow,
  onInvite,
  onUpload,
  recording = false,
}: Props) {
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
            icon={<MicIcon className="h-4 w-4" />}
            disabled={recording}
            onSelect={() => {
              close();
              onRecordNow();
            }}
          >
            Start recording now
          </MenuItem>
          <MenuItem
            icon={<CalendarIcon className="h-4 w-4" />}
            onSelect={() => {
              close();
              onInvite();
            }}
          >
            Invite to meeting
          </MenuItem>
          <MenuItem
            icon={<UploadIcon className="h-4 w-4" />}
            onSelect={() => {
              close();
              onUpload();
            }}
          >
            Upload a recording
          </MenuItem>
          <MenuItem
            icon={<CalendarIcon className="h-4 w-4" />}
            onSelect={() => {
              close();
              router.push("/dashboard");
            }}
          >
            Record an upcoming meeting
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
