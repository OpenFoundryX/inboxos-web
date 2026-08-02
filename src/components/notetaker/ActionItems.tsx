"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/notetaker/Avatar";
import Menu, { MenuItem } from "@/components/ui/Menu";
import { DraftsIcon, EllipsisIcon, PlusIcon, TrashIcon } from "@/components/app/icons";
import { attendeeName, type ActionItem } from "@/lib/meetings";
import {
  addActionItem,
  baseActionItems,
  editActionItem,
  mergeActionItems,
  removeActionItem,
  setActionItemDone,
  type MergedActionItem,
} from "@/lib/meetingNotes";

function dueLabel(dueAt: string | null): string | null {
  if (!dueAt) return null;
  const d = new Date(dueAt);
  if (Number.isNaN(d.getTime())) return dueAt;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(d);
}

export default function ActionItems({
  meetingId,
  items: serverItems,
}: {
  meetingId: string;
  items: ActionItem[];
}) {
  const [items, setItems] = useState<MergedActionItem[]>(() => baseActionItems(serverItems));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [touched, setTouched] = useState(false);

  // Overlay the browser's edits once mounted — see `meetingNotes` for why this
  // can't happen during the first render.
  useEffect(() => {
    setItems(mergeActionItems(meetingId, serverItems));
  }, [meetingId, serverItems]);

  function toggle(item: MergedActionItem) {
    setActionItemDone(meetingId, item.id, !item.done);
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)));
    setTouched(true);
  }

  function commitEdit(id: string, what: string) {
    const text = what.trim();
    setEditingId(null);
    if (!text) return;
    editActionItem(meetingId, id, text);
    setItems((list) => list.map((i) => (i.id === id ? { ...i, what: text } : i)));
    setTouched(true);
  }

  function remove(id: string) {
    removeActionItem(meetingId, id);
    setItems((list) => list.filter((i) => i.id !== id));
    setTouched(true);
  }

  function commitAdd() {
    const text = draft.trim();
    setDraft("");
    setAdding(false);
    if (!text) return;
    const id = addActionItem(meetingId, text, null);
    setItems((list) => [...list, { id, what: text, owner: null, due_at: null, done: false, local: true }]);
    setTouched(true);
  }

  return (
    <section>
      <h3 className="text-base font-bold text-ink">Action items</h3>

      <ul className="mt-2">
        {items.map((item) => {
          const owner = item.owner ? attendeeName(item.owner) : null;
          const due = dueLabel(item.due_at);
          return (
            <li key={item.id} className="group flex items-center gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggle(item)}
                aria-label={`Mark "${item.what}" as done`}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-ink/25 accent-accent"
              />

              {owner ? <Avatar name={owner} /> : null}

              {editingId === item.id ? (
                <input
                  autoFocus
                  defaultValue={item.what}
                  onBlur={(e) => commitEdit(item.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="min-w-0 flex-1 rounded-md border border-accent/30 bg-card px-2 py-0.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              ) : (
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${
                    item.done ? "text-ink/35 line-through" : "text-ink/80"
                  }`}
                >
                  {item.what}
                </span>
              )}

              {due ? <span className="shrink-0 text-xs text-ink/40">{due}</span> : null}

              <Menu
                label="Action item options"
                trigger={() => (
                  <span className="rounded-md p-1 text-ink/30 opacity-0 transition-opacity hover:bg-ink/5 hover:text-ink group-hover:opacity-100">
                    <EllipsisIcon className="h-4 w-4" />
                  </span>
                )}
                panelClassName="min-w-[9rem]"
              >
                {(close) => (
                  <>
                    <MenuItem
                      icon={<DraftsIcon className="h-4 w-4" />}
                      onSelect={() => {
                        close();
                        setEditingId(item.id);
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<TrashIcon className="h-4 w-4" />}
                      destructive
                      onSelect={() => {
                        close();
                        remove(item.id);
                      }}
                    >
                      Delete
                    </MenuItem>
                  </>
                )}
              </Menu>
            </li>
          );
        })}
      </ul>

      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitAdd}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          placeholder="What needs doing?"
          className="mt-1.5 w-full rounded-md border border-accent/30 bg-card px-2 py-1 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex items-center gap-1.5 rounded-md px-1 py-1 text-sm text-ink/40 transition-colors hover:text-ink"
        >
          <PlusIcon className="h-4 w-4" />
          Add action item
        </button>
      )}

      {touched ? (
        <p className="mt-2 text-xs text-ink/35">
          Saved in this browser only — action items don&apos;t sync yet.
        </p>
      ) : null}
    </section>
  );
}
