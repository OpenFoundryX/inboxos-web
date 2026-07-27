/**
 * A deliberately small markdown renderer for exactly what the assistant emits:
 * **bold**, `- ` bullets, [label](url), and blank-line paragraphs.
 *
 * It builds React nodes rather than HTML strings — model output can never
 * inject markup, and there is no `dangerouslySetInnerHTML` anywhere. Link
 * hrefs are restricted to http(s) so `javascript:` URLs can't slip through.
 *
 * Lines that are a link plus trailing prose are lifted out as email references
 * and rendered as rows (see EmailRefList), matching how SourceList presents the
 * same thing. Consecutive ones group into a single card.
 */

import EmailRefList, { tidyMeta, type EmailRef } from "./EmailRefList";

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

// Known limitation: a link nested inside bold (**see [this](url)**) is consumed by the bold match and not parsed as an anchor.

export function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url, "https://example.invalid");
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function safeExternalHref(url: string): string | null {
  try {
    const parsed = new URL(url);
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

const BULLET = /^\s*[-*]\s+/;
/** A line that is a link followed by optional prose — how the assistant cites
 *  an email. Matched with or without a bullet marker, because the model emits
 *  both despite the prompt asking for a list. */
const EMAIL_REF = /^\[([^\]]+)\]\(([^)]+)\)\s*(.*)$/;

function asEmailRef(line: string): EmailRef | null {
  const m = EMAIL_REF.exec(line.replace(BULLET, "").trim());
  if (!m) return null;
  return { title: m[1], href: safeHref(m[2]), meta: tidyMeta(m[3]) };
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];
  let emails: EmailRef[] = [];

  function flushEmails() {
    if (emails.length === 0) return;
    blocks.push(<EmailRefList key={`mail-${blocks.length}`} emails={emails} />);
    emails = [];
  }

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
    const key = `p-${blocks.length}`;
    blocks.push(
      <p key={key} className="my-2 first:mt-0 last:mb-0">
        {/* Single newlines are soft breaks, not spaces. Joining them collapsed
            multi-line answers — a list of emails became one run-on sentence. */}
        {paragraph.map((line, i) => (
          <span key={`${key}-l${i}`}>
            {i > 0 ? <br /> : null}
            {inline(line, `${key}-${i}`)}
          </span>
        ))}
      </p>,
    );
    paragraph = [];
  }

  function flushAll() {
    flushEmails();
    flushBullets();
    flushParagraph();
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    const email = asEmailRef(line);
    if (email) {
      flushBullets();
      flushParagraph();
      emails.push(email);
      continue;
    }

    if (BULLET.test(line)) {
      flushEmails();
      flushParagraph();
      bullets.push(line.replace(BULLET, ""));
      continue;
    }

    flushEmails();
    flushBullets();
    paragraph.push(line.trim());
  }
  flushAll();

  return <div className="text-sm leading-relaxed text-ink">{blocks}</div>;
}
