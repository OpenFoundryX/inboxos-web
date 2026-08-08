import type { ReactNode } from "react";

/** The frame every guest-facing scheduling page sits in.
 *
 *  These pages are seen by people who have never heard of the product and are
 *  not signed in, so they share no chrome with the dashboard. Keeping the frame
 *  in one component is what stops the booking page, the profile page and the
 *  manage page from drifting into three different-looking products. */
export default function PublicShell({
  aside,
  children,
}: {
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f6ef] p-4 md:grid md:place-items-center md:p-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#dce9df]/55 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#eee3d4]/60 blur-3xl" />
      <div className="relative w-full max-w-[900px]">
        <div
          className={`grid overflow-hidden rounded-[22px] border border-black/[0.07] bg-white/95 shadow-[0_20px_70px_-35px_rgba(22,33,28,0.35)] backdrop-blur ${
            aside ? "md:grid-cols-[240px_1fr]" : ""
          }`}
        >
          {aside ? (
            <aside className="border-b border-black/[0.06] bg-[#fbfcf8] p-6 md:border-b-0 md:border-r">
              {aside}
            </aside>
          ) : null}
          <section className="p-5 md:p-6">{children}</section>
        </div>
        <p className="mt-4 text-center text-xs text-ink/30">
          Powered by <b className="text-accent/80">InboxOS</b>
        </p>
      </div>
    </main>
  );
}
