import Button from "@/components/ui/Button";
import ProductMock from "./ProductMock";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20 pb-14 text-center">
      <h1 className="mx-auto max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
        Inbox, meetings and scheduling — one seat
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
        InboxOS holds your mail and delivers it sorted, sits in on your calls and
        writes them up, and lets Vela handle the scheduling back-and-forth.
      </p>
      <div className="mt-9 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="dark" href="/login">
            Start 14-day Pro trial
          </Button>
          <Button variant="outline" href="#pricing">
            Compare plans
          </Button>
        </div>
        <span className="text-sm text-ink/45">
          Gmail today · Outlook on the Pro waitlist · Zoom, Meet and Teams
        </span>
      </div>
      <div className="mt-16 flex justify-center">
        <ProductMock />
      </div>
    </section>
  );
}
