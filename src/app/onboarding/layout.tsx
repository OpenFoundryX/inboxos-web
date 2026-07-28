"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { checkAccess } from "@/lib/session";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import { SettingsIcon } from "@/components/app/icons";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    checkAccess().then(({ authed, connected, onboarded }) => {
      if (!active) return;
      if (!authed) {
        router.replace("/login");
        return;
      }
      // Already finished → the wizard is not somewhere to wander back into.
      if (onboarded) {
        router.replace("/dashboard");
        return;
      }
      // Nothing works without both grants, so the settings steps stay unreachable
      // until they land.
      if (!connected && !pathname.startsWith("/onboarding/connect")) {
        router.replace("/onboarding/connect");
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream text-ink/40">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-accent">
          InboxOS
        </Link>
        <SettingsIcon className="h-5 w-5 text-ink/30" />
      </header>
      <div className="mx-auto flex max-w-5xl gap-10 px-8 pb-16">
        <aside className="hidden w-56 shrink-0 pt-6 md:block">
          <OnboardingStepper />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
