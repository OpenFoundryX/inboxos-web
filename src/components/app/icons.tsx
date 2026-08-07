type IconProps = { className?: string };

const svg = "h-5 w-5";

function Base({ className = svg, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function DashboardIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Base>
  );
}

export function TagIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </Base>
  );
}

export function DraftsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </Base>
  );
}

export function NoteIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Base>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </Base>
  );
}

export function ChatIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Base>
  );
}

export function MailmanIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 12a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v6H3z" />
      <path d="M8 7v6M3 12h18" />
      <path d="M16 3h3v4" />
    </Base>
  );
}

export function EnvelopeIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Base>
  );
}

export function PlayIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5v7l6-3.5z" />
    </Base>
  );
}

export function ExternalLinkIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Base>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Base>
  );
}

export function SignOutIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Base>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Base>
  );
}

export function BellIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Base>
  );
}

export function RefreshIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </Base>
  );
}

export function ChevronDownIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

export function ChevronRightIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m9 18 6-6-6-6" />
    </Base>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  );
}

export function CopyIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Base>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function MicIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4" />
    </Base>
  );
}

export function TrashIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
    </Base>
  );
}

export function PencilIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 20h4l10-10a2.83 2.83 0 10-4-4L4 16v4zM13.5 6.5l4 4" />
    </Base>
  );
}

export function SendIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 12l16-8-8 16-2-6-6-2z" />
    </Base>
  );
}

export function PaperclipIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M8 12l6-6a3 3 0 014 4l-8 8a4 4 0 01-6-6l7-7" />
    </Base>
  );
}

export function UsersIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 5.74" />
    </Base>
  );
}

export function ArrowLeftIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Base>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </Base>
  );
}

export function ChevronUpIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m18 15-6-6-6 6" />
    </Base>
  );
}

export function DownloadIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3v12M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </Base>
  );
}

export function UploadIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 17V5M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </Base>
  );
}

export function ShareIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M12 15V3M8 7l4-4 4 4" />
    </Base>
  );
}

export function EllipsisIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </Base>
  );
}

export function SparkleIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z" />
    </Base>
  );
}

export function WandIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m4 20 10-10" />
      <path d="M16.5 3.5 18 6l2.5 1.5L18 9l-1.5 2.5L15 9l-2.5-1.5L15 6z" />
    </Base>
  );
}

export function VideoIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="2" y="6" width="13" height="12" rx="2" />
      <path d="m15 11 6-4v10l-6-4z" />
    </Base>
  );
}

export function WarnIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.01" />
    </Base>
  );
}

export function XIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}
