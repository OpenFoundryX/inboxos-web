import type { ReactNode } from "react";

export default function Topbar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-card px-6 py-4">
      <h1 className="text-lg font-bold">{title}</h1>
      {children ? <div className="flex items-center gap-3">{children}</div> : null}
    </header>
  );
}
