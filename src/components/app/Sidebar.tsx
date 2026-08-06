"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "@/components/ui/Wordmark";
import TrialPill from "./TrialPill";
import WorkspaceMenu from "./WorkspaceMenu";
import {
  DashboardIcon,
  TagIcon,
  DraftsIcon,
  NoteIcon,
  CalendarIcon,
  ChatIcon,
  MailmanIcon,
  PencilIcon,
  SettingsIcon,
  BellIcon,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/dashboard/daily", label: "Daily", Icon: PencilIcon },
  { href: "/dashboard/categorization", label: "Categorization", Icon: TagIcon },
  { href: "/dashboard/mailman", label: "Mailman", Icon: MailmanIcon },
  { href: "/dashboard/drafts", label: "Drafts", Icon: DraftsIcon },
  { href: "/dashboard/notetaker", label: "Notetaker", Icon: NoteIcon },
  { href: "/dashboard/scheduling", label: "Scheduling", Icon: CalendarIcon },
  { href: "/dashboard/chat", label: "Chat", Icon: ChatIcon },
  { href: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-black/5 bg-card p-4">
      <div className="flex items-center justify-between px-2 py-3">
        <Wordmark size="md" href="/dashboard" />
        <button className="text-ink/40 hover:text-ink" aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-4 flex-1 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                active ? "bg-accent/10 text-accent" : "text-ink/70 hover:bg-ink/5"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3">
        <TrialPill />
        <WorkspaceMenu />
      </div>
    </aside>
  );
}
