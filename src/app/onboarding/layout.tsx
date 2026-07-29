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
      // Missing grants come first, and outrank `onboarded`: connect is the only
      // screen in the app that can re-grant Gmail/Calendar, so an already-
      // onboarded user whose access was revoked has to be able to reach it. Its
      // Continue goes to /onboarding/mail, which bounces such a user on to the
      // dashboard, so the flow still terminates.
      if (!connected) {
        if (!pathname.startsWith("/onboarding/connect")) {
          router.replace("/onboarding/connect");
          return;
        }
        setReady(true);
        return;
      }
      // Connected and already finished → the wizard is not somewhere to wander
      // back into.
      if (onboarded) {
        router.replace("/dashboard");
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
      <div className="flex h-screen items-center justify-center bg-cream">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-ink/15 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      {/* Soft colour wash behind the card. Purely decorative, and blurred far
          enough that it never competes with the content sitting on top of it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[130px]" />
        <div className="absolute -bottom-56 -right-40 h-[34rem] w-[34rem] rounded-full bg-blue-400/15 blur-[130px]" />
      </div>

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/dashboard" className="text-lg font-extrabold tracking-tight text-accent">
          InboxOS
        </Link>
        <SettingsIcon className="h-5 w-5 text-ink/25" />
      </header>

      {/* The wizard is one thing to look at, so it sits in the middle of the
          viewport rather than hugging the top. py-24 keeps it clear of the
          header once a tall step stops fitting in the centred space. */}
      <main className="relative flex min-h-screen items-center justify-center px-5 py-24">
        <div className="w-full max-w-xl">
          <OnboardingStepper />
          <div
            key={pathname}
            className="animate-step-in mt-5 rounded-[28px] border border-white/60 bg-card/80 p-6 shadow-[0_1px_2px_rgba(26,29,38,0.04),0_24px_70px_-28px_rgba(26,29,38,0.35)] backdrop-blur-xl sm:p-9"
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
