import Button from "@/components/ui/Button";
import ProductMock from "./ProductMock";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 text-center">
      <p className="text-lg font-medium text-ink/60">Drowning in email?</p>
      <h1 className="mx-auto mt-3 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        Let InboxOS organize your inbox and write your next reply
      </h1>
      <p className="mt-6 text-base text-ink/60">Get started with</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button variant="dark" href="/login">
          Gmail
        </Button>
        <Button variant="outline" href="/login">
          Outlook
        </Button>
      </div>
      <div className="mt-14 flex justify-center">
        <ProductMock />
      </div>
    </section>
  );
}
