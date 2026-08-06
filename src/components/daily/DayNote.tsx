"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import SlashMenu, { type SlashMenuHandle } from "./SlashMenu";
import { SlashCommand, type SlashItem } from "./slashCommand";
import { formatDayHeading, isToday, saveNote } from "@/lib/notes";

type Props = {
  /** `YYYY-MM-DD`. */
  dateKey: string;
  /** What the server last had, as HTML. Undefined until the fetch lands. */
  initialBody: string | undefined;
  onSaved: (dateKey: string, body: string) => void;
  onError: (message: string) => void;
};

/** How long to wait after the last keystroke before saving. Long enough that
 *  ordinary typing is one request rather than dozens, short enough that
 *  glancing away and back feels already-saved. */
const DEBOUNCE_MS = 800;

type MenuState = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
  rect: DOMRect | null;
};

export default function DayNote({ dateKey, initialBody, onSaved, onError }: Props) {
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<SlashMenuHandle>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** What the server is known to hold. Guards every flush, so blurring or
   *  closing the tab without having typed sends nothing. */
  const saved = useRef(initialBody ?? "");
  /** Read by the pagehide handler, which is registered once and would
   *  otherwise capture the body from first render forever. */
  const pending = useRef(saved.current);
  /** Whether the fetched body has been put into the editor yet. */
  const seeded = useRef(false);

  const flush = useCallback(
    async (next: string) => {
      if (next === saved.current) return;
      setSaving(true);
      try {
        await saveNote(dateKey, next);
        saved.current = next;
        onSaved(dateKey, next);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Couldn't save your notes");
      } finally {
        setSaving(false);
      }
    },
    [dateKey, onSaved, onError],
  );

  const editor = useEditor({
    // Next renders this on the server first; letting Tiptap paint immediately
    // produces markup React then disagrees with on hydration.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: "Write notes…" }),
      SlashCommand.configure({
        render: () => ({
          onStart: (props) =>
            setMenu({
              items: props.items,
              command: props.command,
              rect: props.clientRect?.() ?? null,
            }),
          onUpdate: (props) =>
            setMenu({
              items: props.items,
              command: props.command,
              rect: props.clientRect?.() ?? null,
            }),
          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              setMenu(null);
              return true;
            }
            return menuRef.current?.onKeyDown(props.event) ?? false;
          },
          onExit: () => setMenu(null),
        }),
      }),
    ],
    editorProps: {
      attributes: { class: "note-editor min-h-[58vh] focus:outline-none" },
    },
    onUpdate: ({ editor: ed }) => {
      // An empty document still serializes as "<p></p>"; sending that would
      // store a row for a day nobody wrote on, which the server deletes rows
      // to avoid. Empty means empty.
      const html = ed.isEmpty ? "" : ed.getHTML();
      pending.current = html;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(html), DEBOUNCE_MS);
    },
    onBlur: () => {
      if (timer.current) clearTimeout(timer.current);
      void flush(pending.current);
    },
  });

  // Adopt the fetched body once it arrives — but only once, and never over
  // something already typed, which would delete words mid-sentence if the
  // request was slow. `emitUpdate: false` stops the seed counting as an edit,
  // which would otherwise schedule a save of what the server just sent us.
  useEffect(() => {
    if (!editor || initialBody === undefined || seeded.current) return;
    seeded.current = true;
    saved.current = initialBody;
    pending.current = initialBody;
    if (initialBody && editor.isEmpty) {
      editor.commands.setContent(initialBody, { emitUpdate: false });
    }
  }, [editor, initialBody]);

  // Closing the tab mid-sentence is the ordinary way people leave a page like
  // this, and the debounce would otherwise still be pending. `keepalive` lets
  // the request outlive the document; a normal fetch is cancelled on unload.
  useEffect(() => {
    const onLeave = () => {
      if (pending.current === saved.current) return;
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) return;
      void fetch(`${base}/notes/${dateKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: pending.current }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [dateKey]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const today = isToday(dateKey);

  return (
    <section className="py-6" data-date={dateKey}>
      <h2
        className={`flex items-center gap-2 text-2xl font-bold tracking-tight ${
          today ? "text-ink" : "text-ink/40"
        }`}
      >
        {formatDayHeading(dateKey)}
        {today ? <span className="h-2 w-2 rounded-full bg-accent" aria-label="Today" /> : null}
        {saving ? <span className="text-xs font-medium text-ink/30">Saving…</span> : null}
      </h2>

      <div className="mt-3 text-sm leading-relaxed text-ink">
        <EditorContent editor={editor} />
      </div>

      {menu?.rect ? (
        <div
          className="fixed z-50"
          style={{
            left: menu.rect.left,
            // Flip above the caret when there isn't room below, so the menu is
            // never half off the bottom of a day that sits low in the window.
            top:
              menu.rect.bottom + 260 > window.innerHeight
                ? undefined
                : menu.rect.bottom + 6,
            bottom:
              menu.rect.bottom + 260 > window.innerHeight
                ? window.innerHeight - menu.rect.top + 6
                : undefined,
          }}
        >
          <SlashMenu ref={menuRef} items={menu.items} command={menu.command} />
        </div>
      ) : null}
    </section>
  );
}
