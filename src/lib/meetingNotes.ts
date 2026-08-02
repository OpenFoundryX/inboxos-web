/**
 * Browser-side edits to a meeting's action items.
 *
 * The API returns action items as plain `{what, owner, due_at}` with no id and
 * no completion flag, and exposes no endpoint to change them. Until it does,
 * ticking, editing, adding and removing are kept here — in `localStorage`, on
 * this device only — as an *overlay* on top of whatever the server last said.
 *
 * Storing an overlay rather than a copy is the point: the server's notes stay
 * the source of truth, so when the summary is regenerated the new items show
 * up instead of being masked by a stale local snapshot. It also leaves a clean
 * seam — once the endpoints exist, `mergeActionItems` keeps its shape and only
 * the load/save calls change.
 */

import type { ActionItem } from "./meetings";

const VERSION = "v1";
const key = (meetingId: string) => `inboxos.meeting-actions.${VERSION}.${meetingId}`;

export type MergedActionItem = {
  id: string;
  what: string;
  owner: string | null;
  due_at: string | null;
  done: boolean;
  /** Added in the browser — it isn't in the server's notes. */
  local: boolean;
};

type Overlay = {
  done: string[];
  hidden: string[];
  edited: Record<string, string>;
  added: { id: string; what: string; owner: string | null; done: boolean }[];
};

const EMPTY: Overlay = { done: [], hidden: [], edited: {}, added: [] };

/**
 * Identify a server item by position *and* by its opening words.
 *
 * Position alone would transfer a tick to whatever item later lands at that
 * index; the text alone would lose it the moment a word is reworded. Together
 * they're stable across reloads and deliberately brittle across a regenerated
 * summary — which is the safer way to be wrong.
 */
function serverId(item: ActionItem, index: number): string {
  const stem = item.what.trim().toLowerCase().slice(0, 40);
  return `s${index}:${stem}`;
}

function read(meetingId: string): Overlay {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(key(meetingId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Overlay>;
    return {
      done: Array.isArray(parsed.done) ? parsed.done : [],
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
      edited: parsed.edited && typeof parsed.edited === "object" ? parsed.edited : {},
      added: Array.isArray(parsed.added) ? parsed.added : [],
    };
  } catch {
    // Corrupt or unreadable (private mode, quota games) — start clean rather
    // than taking the page down over a checkbox.
    return EMPTY;
  }
}

function write(meetingId: string, overlay: Overlay) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(meetingId), JSON.stringify(overlay));
  } catch {
    // Out of quota or blocked. The in-memory state still reflects the change
    // for this session, which is the part the user is looking at.
  }
}

/**
 * The server's items with no overlay applied.
 *
 * Rendering starts here so the markup matches on both sides of hydration —
 * `localStorage` doesn't exist while the page is being server-rendered, and
 * reading it during the first client render would mismatch. The overlay is
 * applied in an effect immediately afterwards.
 */
export function baseActionItems(serverItems: ActionItem[]): MergedActionItem[] {
  return serverItems.map((item, i) => ({
    id: serverId(item, i),
    what: item.what,
    owner: item.owner,
    due_at: item.due_at,
    done: false,
    local: false,
  }));
}

/** The list to render: the server's items with local edits applied, then
 *  anything the user added, which belongs at the end where they typed it. */
export function mergeActionItems(
  meetingId: string,
  serverItems: ActionItem[],
): MergedActionItem[] {
  const overlay = read(meetingId);
  const done = new Set(overlay.done);
  const hidden = new Set(overlay.hidden);

  const fromServer = serverItems
    .map((item, i) => ({ item, id: serverId(item, i) }))
    .filter(({ id }) => !hidden.has(id))
    .map(({ item, id }) => ({
      id,
      what: overlay.edited[id] ?? item.what,
      owner: item.owner,
      due_at: item.due_at,
      done: done.has(id),
      local: false,
    }));

  const added = overlay.added
    .filter((a) => !hidden.has(a.id))
    .map((a) => ({
      id: a.id,
      what: overlay.edited[a.id] ?? a.what,
      owner: a.owner,
      due_at: null,
      done: done.has(a.id) || a.done,
      local: true,
    }));

  return [...fromServer, ...added];
}

export function setActionItemDone(meetingId: string, id: string, done: boolean) {
  const overlay = read(meetingId);
  const next = new Set(overlay.done);
  if (done) next.add(id);
  else next.delete(id);
  write(meetingId, { ...overlay, done: [...next] });
}

export function editActionItem(meetingId: string, id: string, what: string) {
  const overlay = read(meetingId);
  write(meetingId, { ...overlay, edited: { ...overlay.edited, [id]: what } });
}

export function removeActionItem(meetingId: string, id: string) {
  const overlay = read(meetingId);
  write(meetingId, {
    ...overlay,
    hidden: [...new Set([...overlay.hidden, id])],
    // A locally added item that's gone is gone — keeping it in `added` would
    // grow the record forever behind a `hidden` entry that also never expires.
    added: overlay.added.filter((a) => a.id !== id),
  });
}

export function addActionItem(meetingId: string, what: string, owner: string | null): string {
  const overlay = read(meetingId);
  const id = `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  write(meetingId, { ...overlay, added: [...overlay.added, { id, what, owner, done: false }] });
  return id;
}
