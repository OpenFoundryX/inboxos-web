/**
 * A deliberately small markdown renderer for exactly what the assistant emits:
 * **bold**, `- ` bullets, [label](url), and blank-line paragraphs.
 *
 * It builds React nodes rather than HTML strings — model output can never
 * inject markup, and there is no `dangerouslySetInnerHTML` anywhere. Link
 * hrefs are restricted to http(s) so `javascript:` URLs can't slip through.
 */

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url, "https://example.invalid");
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function inline(text: string, keyPrefix: string) {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <span key={key}>{link[1]}</span>;
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/30 hover:decoration-accent"
        >
          {link[1]}
        </a>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];

  function flushBullets() {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5">
        {bullets.map((b, i) => (
          <li key={i}>{inline(b, `li-${blocks.length}-${i}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  }

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="my-2 first:mt-0 last:mb-0">
        {inline(paragraph.join(" "), `p-${blocks.length}`)}
      </p>,
    );
    paragraph = [];
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph();
      bullets.push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    }
    if (line.trim() === "") {
      flushBullets();
      flushParagraph();
      continue;
    }
    flushBullets();
    paragraph.push(line.trim());
  }
  flushBullets();
  flushParagraph();

  return <div className="text-sm leading-relaxed text-ink">{blocks}</div>;
}
