"use client";

import AskBar from "@/components/app/AskBar";
import { SearchIcon, PlusIcon } from "@/components/app/icons";

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <aside className="flex w-72 shrink-0 flex-col border-r border-black/5 bg-card p-4">
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-black/10 bg-cream px-3 py-2 text-sm text-ink/40">
          <SearchIcon className="h-4 w-4" />
          <span>Search</span>
        </div>
        <button className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
          <PlusIcon className="h-4 w-4" />
          New Chat
        </button>
        <div className="flex-1 text-center text-xs text-ink/40">No conversations yet</div>
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <span className="mb-8 text-3xl font-extrabold tracking-tight text-accent">InboxOS</span>
        <div className="w-full max-w-2xl">
          <AskBar placeholder="Ask me anything about your meetings & emails…" />
        </div>
      </main>
    </div>
  );
}
