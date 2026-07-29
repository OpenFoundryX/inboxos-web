import type { ReactNode } from "react";
import { LEGAL, isPlaceholder, unresolvedLegalFields } from "@/lib/legal";

/** Renders an unfilled config value so it can't be missed on the page. */
export function Fill({ value }: { value: string }) {
  if (!isPlaceholder(value)) return <>{value}</>;
  return (
    <mark className="rounded bg-amber-200/70 px-1 py-0.5 text-[0.9em] font-medium text-amber-950">
      {value}
    </mark>
  );
}

export function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-black/5 pt-10">
      <h2 className="font-serif text-2xl font-semibold leading-tight">
        {heading}
      </h2>
      {/* Applied here rather than on every child so the document body reads as
          one consistent block of prose. */}
      <div className="mt-4 space-y-4 leading-relaxed text-ink/75 [&_a]:text-accent [&_a]:underline [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

/** Shown only while LEGAL still has TODO values, so an incomplete policy can't
 *  go out looking finished. Disappears on its own once they're filled. */
function DraftNotice() {
  const missing = unresolvedLegalFields();
  if (missing.length === 0) return null;
  return (
    <div className="mb-12 rounded-2xl border border-amber-300 bg-amber-50 p-5">
      <p className="text-sm font-semibold text-amber-950">
        Draft — not ready to publish
      </p>
      <p className="mt-2 text-sm leading-relaxed text-amber-900">
        {missing.length} value{missing.length === 1 ? "" : "s"} in{" "}
        <code className="rounded bg-amber-200/60 px-1">src/lib/legal.ts</code>{" "}
        are still placeholders ({missing.join(", ")}), and this document has not
        been reviewed by a lawyer. Highlighted text below marks each gap.
      </p>
    </div>
  );
}

export default function LegalDoc({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <header>
        <h1 className="font-serif text-4xl font-semibold leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-sm text-ink/50">
          {LEGAL.entity} · Last updated {LEGAL.effectiveDate}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-ink/70">{intro}</p>
      </header>

      <div className="mt-12">
        <DraftNotice />
      </div>

      <div className="space-y-10">{children}</div>
    </article>
  );
}
