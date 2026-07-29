import type { ReactNode } from "react";

export default function FeatureRow({
  eyebrow,
  eyebrowColor,
  title,
  body,
  reverse = false,
  children,
}: {
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  body: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 py-16 md:grid-cols-2">
      <div className={reverse ? "md:order-2" : ""}>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: eyebrowColor }}
          />
          <span className="text-xs font-bold uppercase tracking-wide text-ink/60">
            {eyebrow}
          </span>
        </div>
        <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight">
          {title}
        </h2>
        <p className="mt-4 max-w-md leading-relaxed text-ink/60">{body}</p>
      </div>
      <div className={`flex justify-center ${reverse ? "md:order-1" : ""}`}>
        {children}
      </div>
    </div>
  );
}
