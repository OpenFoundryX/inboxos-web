import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import type { SuggestionOptions } from "@tiptap/suggestion";

export type SlashItem = {
  title: string;
  hint: string;
  /** The badge on the left of the row — "H1", "T", and so on. */
  badge: string;
  run: (ctx: { editor: Editor; range: Range }) => void;
};

/**
 * The block types a note can be made of.
 *
 * Deliberately short. Every entry here is a thing someone reaches for while
 * writing notes in a hurry; anything they'd have to hunt for belongs in a
 * toolbar, not in a list that appears under the cursor.
 */
export const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Text",
    hint: "Plain paragraph",
    badge: "T",
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    hint: "Large heading",
    badge: "H1",
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Heading 2",
    hint: "Medium heading",
    badge: "H2",
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3",
    hint: "Small heading",
    badge: "H3",
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bullet List",
    hint: "Unordered list",
    badge: "••",
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    hint: "Ordered list",
    badge: "1.",
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
];

export const filterItems = (query: string): SlashItem[] => {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (i) => i.title.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q),
  );
};

type Renderer = SuggestionOptions<SlashItem>["render"];

/**
 * `/` opens the block menu.
 *
 * `startOfLine` is the important option: a slash mid-sentence is a slash — in
 * a date, a path, an "and/or" — and popping a menu there would fight the
 * person typing. Only a slash that begins a block means "change this block".
 */
export const SlashCommand = Extension.create<{ render: Renderer }>({
  name: "slashCommand",

  addOptions() {
    return { render: undefined as unknown as Renderer };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        char: "/",
        startOfLine: true,
        items: ({ query }) => filterItems(query),
        command: ({ editor, range, props }) => props.run({ editor, range }),
        render: this.options.render,
      }),
    ];
  },
});
