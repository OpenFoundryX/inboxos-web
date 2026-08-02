import { initialOf } from "@/lib/meetings";

/** An initial in a circle. There are no profile pictures behind a calendar
 *  attendee list, so this is the whole of what we can show. */
export default function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      title={name}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[0.65rem] font-semibold text-canvas ${className}`}
    >
      {initialOf(name)}
    </span>
  );
}
