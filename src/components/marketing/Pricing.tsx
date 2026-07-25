import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const PRO = [
  "Drafts replies like you",
  "Organizes your inbox with labels",
  "Schedules meetings for you",
  "Ask your inbox anything",
  "Custom automation rules",
  "Priority support",
];

const ENT = [
  "Dedicated account manager",
  "Customized onboarding",
  "Custom integrations",
  "SSO, SCIM & security controls",
];

function Check() {
  return <span className="mt-0.5 text-accent">✓</span>;
}

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-20 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Get 2 hours back every day
      </h2>
      <p className="mt-4 text-ink/60">
        Start with a 14-day free trial. No credit card required.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="relative border-accent/40 p-8 text-left">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Most Popular
          </span>
          <h3 className="text-2xl font-bold">Professional</h3>
          <p className="mt-2 text-sm text-ink/60">
            For professionals who rely on email to get things done.
          </p>
          <div className="mt-6 flex items-end gap-2">
            <span className="text-4xl font-extrabold">$35</span>
            <span className="mb-1 text-ink/40 line-through">$50</span>
            <span className="mb-1 text-sm text-ink/50">per user / month</span>
          </div>
          <Button variant="primary" href="/login" className="mt-6 w-full">
            Start free trial
          </Button>
          <ul className="mt-6 space-y-3 border-t border-black/5 pt-6">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-ink/80">
                <Check /> {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-8 text-left">
          <h3 className="text-2xl font-bold">Enterprise</h3>
          <p className="mt-2 text-sm text-ink/60">
            For organizations that need scale and dedicated support.
          </p>
          <div className="mt-6">
            <span className="text-sm text-ink/50">Custom pricing</span>
            <div className="text-3xl font-extrabold">Get in touch</div>
          </div>
          <Button variant="outline" href="/login" className="mt-6 w-full">
            Talk to sales
          </Button>
          <ul className="mt-6 space-y-3 border-t border-black/5 pt-6">
            {ENT.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-ink/80">
                <Check /> {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
