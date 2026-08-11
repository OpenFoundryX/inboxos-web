import Button from "@/components/ui/Button";
import ProductMock from "./ProductMock";
import { APP_NAME } from "@/lib/app";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20 pb-14 text-center">
      {/* The headline spells out the application name in plain text rather than
       *  leaving it to the stylised wordmark in the nav. Google's OAuth
       *  verification compares the name on the consent screen with the name on
       *  this page, and a two-tone logo lockup is not something a reviewer —
       *  human or automated — can be relied on to read as the app's name. */}
      <h1 className="mx-auto max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
        {APP_NAME} runs your inbox, your meetings and your scheduling
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
        Connect your Gmail and Google Calendar. {APP_NAME} delivers your mail
        sorted, drafts your replies, writes up your calls, and handles the
        scheduling back-and-forth.
      </p>
      <div className="mt-9 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="dark" href="/login">
            Start 7-day Pro trial
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
