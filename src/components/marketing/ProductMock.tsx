export default function ProductMock() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 text-sm font-semibold text-ink/70">Inbox</span>
        <span className="ml-auto text-xs text-ink/45">Delivered 1:00 PM</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
            SC
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Sarah Chen</span>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                To respond
              </span>
            </div>
            <span className="text-xs text-ink/60">Re: Q4 Budget Review</span>
          </div>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
            Draft
          </span>
          <p className="mt-1 text-xs text-ink/70">
            Thanks for the follow-up, Sarah. I&apos;ve reviewed the Q4 proposal and
            have a few thoughts on the allocation…
          </p>
        </div>
      </div>
    </div>
  );
}
