"use client";

import { useEffect, useState } from "react";
import EventTypeEditor from "@/components/app/scheduling/EventTypeEditor";
import { CopyIcon } from "@/components/app/icons";
import Card from "@/components/ui/Card";
import {
  createEventType,
  deleteEventType,
  listEventTypes,
  updateEventType,
  type EventType,
  type SchedulingSettings,
} from "@/lib/scheduling";

type Props = {
  settings: SchedulingSettings;
  onSaveSettings: (patch: Partial<SchedulingSettings>) => Promise<SchedulingSettings>;
  onNotify: (message: string) => void;
};

export default function EventTypesTab({ settings, onSaveSettings, onNotify }: Props) {
  const [events, setEvents] = useState<EventType[] | null>(null);
  const [editing, setEditing] = useState<EventType | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [slug, setSlug] = useState(settings.slug);

  useEffect(() => {
    listEventTypes()
      .then(setEvents)
      .catch((e) => onNotify(e instanceof Error ? e.message : "Could not load event types"));
  }, [onNotify]);

  async function saveSlug() {
    const normalized = slug.toLowerCase().trim();
    if (!/^[a-z0-9-]{3,80}$/.test(normalized)) {
      onNotify("Use 3–80 lowercase letters, numbers, or hyphens");
      return;
    }
    setBusy(true);
    try {
      await onSaveSettings({ slug: normalized });
      // Every event type's public URL is built from this slug, so they are all
      // now stale. Refetching is cheaper than patching each one by hand.
      setEvents(await listEventTypes());
      setEditingSlug(false);
      onNotify("Scheduling link updated");
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not update link");
    } finally {
      setBusy(false);
    }
  }

  async function save(values: Partial<EventType>) {
    setBusy(true);
    try {
      if (editing === "new") {
        setEvents([...(events ?? []), await createEventType(values)]);
        onNotify("Meeting type created");
      } else if (editing) {
        const updated = await updateEventType(editing.id, values);
        setEvents((events ?? []).map((e) => (e.id === updated.id ? updated : e)));
        onNotify("Meeting type saved");
      }
      setEditing(null);
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not save meeting type");
    } finally {
      setBusy(false);
    }
  }

  async function remove(event: EventType) {
    setBusy(true);
    try {
      await deleteEventType(event.id);
      setEvents((events ?? []).filter((e) => e.id !== event.id));
      setEditing(null);
      onNotify(`Deleted "${event.name}". Meetings already booked are unaffected.`);
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Could not delete meeting type");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <EventTypeEditor
        event={editing === "new" ? null : editing}
        busy={busy}
        onSave={save}
        onDelete={editing === "new" ? undefined : () => remove(editing)}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Your scheduling link</div>
          {editingSlug ? (
            <div className="mt-2 flex max-w-xl items-center gap-2">
              <span className="shrink-0 text-xs text-ink/40">
                {settings.public_url.replace(settings.slug, "")}
              </span>
              <input
                autoFocus
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") void saveSlug();
                  if (e.key === "Escape") {
                    setSlug(settings.slug);
                    setEditingSlug(false);
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-accent/30 px-2.5 py-1.5 text-xs outline-none ring-accent/10 focus:ring-2"
              />
              <button
                disabled={busy}
                onClick={() => void saveSlug()}
                className="text-xs font-semibold text-accent"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setSlug(settings.slug);
                  setEditingSlug(false);
                }}
                className="text-xs text-ink/40"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingSlug(true)}
              className="mt-1 block max-w-full truncate text-left text-xs text-ink/40 hover:text-accent"
            >
              {settings.public_url} <span className="ml-1 font-semibold">Edit</span>
            </button>
          )}
        </div>
        <button
          onClick={() => {
            void navigator.clipboard.writeText(settings.public_url);
            onNotify("Link copied");
          }}
          className="flex shrink-0 items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-sm font-medium hover:bg-canvas"
        >
          <CopyIcon className="h-4 w-4" />
          Copy link
        </button>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Meeting types</h2>
        <button
          onClick={() => setEditing("new")}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
        >
          New meeting type
        </button>
      </div>

      {events === null ? (
        <p className="text-sm text-ink/45">Loading…</p>
      ) : events.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink/45">
          No meeting types yet. Create one so people have something to book.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <b className="text-sm">{event.name}</b>
                    {event.enabled ? null : (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/45">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink/45">
                    {event.duration_minutes} min
                    {event.buffer_before_minutes || event.buffer_after_minutes
                      ? ` · ${event.buffer_before_minutes}/${event.buffer_after_minutes} min buffers`
                      : ""}
                    {event.max_bookings_per_day
                      ? ` · max ${event.max_bookings_per_day}/day`
                      : ""}
                  </p>
                  <p className="mt-1 truncate text-xs text-ink/35">{event.public_url}</p>
                </div>
                <button
                  onClick={() => setEditing(event)}
                  className="shrink-0 text-xs font-semibold text-accent"
                >
                  Edit
                </button>
              </div>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(event.public_url);
                  onNotify("Link copied");
                }}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink/50 hover:text-ink"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                Copy link
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
