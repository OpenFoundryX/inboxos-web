"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Toast, { type ToastMessage } from "@/components/ui/Toast";
import DayNote from "@/components/daily/DayNote";
import { backendConfigured } from "@/lib/session";
import { dayFromToday, getNotes, toKey } from "@/lib/notes";

/** The window on mount: a week behind, a few days ahead. Enough that yesterday
 *  is one glance away without fetching a month nobody scrolls to. */
const INITIAL_PAST = 7;
const INITIAL_FUTURE = 3;

/** How much each end grows when its sentinel comes into view. */
const PAGE_DAYS = 7;

export default function DailyPage() {
  const configured = backendConfigured();
  const [start, setStart] = useState(-INITIAL_PAST);
  const [end, setEnd] = useState(INITIAL_FUTURE);
  const [bodies, setBodies] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const scroller = useRef<HTMLDivElement>(null);
  const topSentinel = useRef<HTMLDivElement>(null);
  const bottomSentinel = useRef<HTMLDivElement>(null);
  const todayAnchor = useRef<HTMLDivElement>(null);
  // Set just before days are prepended, read once the DOM has them. Restoring
  // the scroll offset by this delta is what stops the page lurching downward
  // when history loads above the viewport.
  const anchorHeight = useRef<number | null>(null);
  // Extending is async; without this the observer fires again on the same
  // sentinel before the new days exist and pages several times over.
  const extending = useRef(false);
  // Which offsets have been fetched, so growing the window only asks for the
  // days it actually added.
  const fetchedFrom = useRef(0);
  const fetchedTo = useRef(0);

  const days: string[] = [];
  for (let offset = start; offset <= end; offset += 1) days.push(toKey(dayFromToday(offset)));

  const notify = useCallback((text: string) => {
    setToast({ id: Date.now(), text, variant: "error" });
  }, []);

  const fetchRange = useCallback(
    async (fromOffset: number, toOffset: number) => {
      if (!configured) return;
      try {
        const notes = await getNotes(
          toKey(dayFromToday(fromOffset)),
          toKey(dayFromToday(toOffset)),
        );
        setBodies((prev) => {
          const next = { ...prev };
          // Days the server omitted have nothing written on them. Seeding them
          // as "" is what tells DayNote its value has arrived — otherwise every
          // blank day would sit forever waiting for a body that never comes.
          for (let o = fromOffset; o <= toOffset; o += 1) next[toKey(dayFromToday(o))] ??= "";
          for (const note of notes) next[note.note_date] = note.body;
          return next;
        });
      } catch {
        // A failed page of history shouldn't blank the days already on screen.
        notify("Couldn't load some notes");
      }
    },
    [configured, notify],
  );

  useEffect(() => {
    fetchedFrom.current = -INITIAL_PAST;
    fetchedTo.current = INITIAL_FUTURE;
    void fetchRange(-INITIAL_PAST, INITIAL_FUTURE).finally(() => setLoaded(true));
  }, [fetchRange]);

  // Open on today rather than at the top of the window — the week of history
  // above it is there to scroll back to, not to land in.
  useEffect(() => {
    if (!loaded) return;
    todayAnchor.current?.scrollIntoView({ block: "start" });
  }, [loaded]);

  // Restore the scroll offset after history is prepended. useLayoutEffect, not
  // useEffect: this has to happen before the browser paints, or the jump is
  // visible as a flash even though it is corrected.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && anchorHeight.current !== null) {
      el.scrollTop += el.scrollHeight - anchorHeight.current;
      anchorHeight.current = null;
    }
    extending.current = false;
  }, [start]);

  useEffect(() => {
    if (!loaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || extending.current) continue;

          if (entry.target === topSentinel.current) {
            extending.current = true;
            // Measured before the state change so the layout effect above can
            // tell how much taller the list got.
            anchorHeight.current = scroller.current?.scrollHeight ?? null;
            const from = fetchedFrom.current - PAGE_DAYS;
            const to = fetchedFrom.current - 1;
            fetchedFrom.current = from;
            void fetchRange(from, to);
            setStart((s) => s - PAGE_DAYS);
          } else if (entry.target === bottomSentinel.current) {
            extending.current = true;
            const from = fetchedTo.current + 1;
            const to = fetchedTo.current + PAGE_DAYS;
            fetchedTo.current = to;
            void fetchRange(from, to);
            setEnd((e) => e + PAGE_DAYS);
            // Appending below the viewport moves nothing that is on screen, so
            // there is no anchoring to undo — just release the guard.
            extending.current = false;
          }
        }
      },
      { root: scroller.current, rootMargin: "400px" },
    );

    if (topSentinel.current) observer.observe(topSentinel.current);
    if (bottomSentinel.current) observer.observe(bottomSentinel.current);
    return () => observer.disconnect();
  }, [loaded, fetchRange]);

  const remember = useCallback((dateKey: string, body: string) => {
    setBodies((prev) => ({ ...prev, [dateKey]: body }));
  }, []);

  const todayKey = toKey(new Date());

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-black/5 bg-card px-6 py-3">
        <h1 className="text-base font-bold text-ink">Scratchpad</h1>
      </header>

      {/* Left-aligned rather than a centred column: the heading is the anchor
          you scan for when scrolling through days, and centring puts it in a
          different place on every viewport width. */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-6">
        <div>
          {!configured ? (
            <Card className="mt-4 p-4 text-sm text-ink/60">
              Not connected to the InboxOS backend. Set{" "}
              <code className="text-ink">NEXT_PUBLIC_API_URL</code> to keep daily notes.
            </Card>
          ) : null}

          <div ref={topSentinel} className="h-px" />

          {days.map((dateKey) => (
            <div key={dateKey} ref={dateKey === todayKey ? todayAnchor : undefined}>
              <DayNote
                dateKey={dateKey}
                initialBody={bodies[dateKey]}
                onSaved={remember}
                onError={notify}
              />
            </div>
          ))}

          <div ref={bottomSentinel} className="h-px" />
          {/* Each day is already most of a screen tall, so this only needs to
              keep the last one off the bottom edge. */}
          <div className="h-24" />
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
