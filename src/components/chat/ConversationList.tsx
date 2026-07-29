"use client";

import { useMemo, useState } from "react";
import { PlusIcon, SearchIcon, TrashIcon } from "@/components/app/icons";
import { deleteConversation, type Conversation } from "@/lib/chat";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDeleted,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDeleted: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Client-side only: there is no server-side conversation search endpoint.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, query]);

  async function remove(id: string) {
    setDeleting(id);
    try {
      await deleteConversation(id);
      onDeleted(id);
    } catch {
      // Leave the row in place; the next load will reconcile.
    } finally {
      setDeleting(null);
    }
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-black/5 bg-card p-4">
      <label className="mb-3 flex items-center gap-2 rounded-xl border border-black/10 bg-canvas px-3 py-2 text-sm">
        <SearchIcon className="h-4 w-4 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-transparent text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </label>

      <button
        type="button"
        onClick={onNew}
        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        <PlusIcon className="h-4 w-4" />
        New Chat
      </button>

      {filtered.length === 0 ? (
        <div className="flex-1 text-center text-xs text-ink/40">
          {conversations.length === 0 ? "No conversations yet" : "No matches"}
        </div>
      ) : (
        <ul className="flex-1 space-y-1 overflow-y-auto">
          {filtered.map((c) => (
            <li key={c.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={`w-full truncate rounded-xl px-3 py-2 pr-9 text-left text-sm ${
                  c.id === activeId
                    ? "bg-canvas font-medium text-ink"
                    : "text-ink/70 hover:bg-canvas hover:text-ink"
                }`}
              >
                {c.title}
              </button>
              <button
                type="button"
                aria-label={`Delete ${c.title}`}
                disabled={deleting === c.id}
                onClick={() => remove(c.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink/30 opacity-0 hover:text-accent focus:opacity-100 group-hover:opacity-100 disabled:opacity-30"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
