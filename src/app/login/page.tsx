"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Wordmark from "@/components/ui/Wordmark";
import { signIn, isOnboarded } from "@/lib/auth";
import { backendConfigured, startGoogleLogin } from "@/lib/session";
import { LEGAL } from "@/lib/legal";

function LoginPageContent() {
  const router = useRouter();
  const configured = backendConfigured();
  const notInvited = useSearchParams().get("error") === "not_invited";

  function mockSignIn() {
    signIn();
    router.replace(isOnboarded() ? "/dashboard" : "/onboarding/mail");
  }

  function handleGoogle() {
    if (configured) startGoogleLogin();
    else mockSignIn();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <div className="mb-8">
        <Wordmark size="lg" mark />
      </div>
      <Card className="w-full max-w-sm p-8 text-center shadow-sm">
        <h1 className="font-serif text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Sign in to pick up where your inbox left off.
        </p>
        {notInvited && (
          <p className="mt-4 rounded-lg bg-ink/5 p-3 text-sm leading-relaxed text-ink/70">
            InboxPilot is invite-only while we onboard our first users.{" "}
            <a href={LEGAL.bookingUrl} target="_blank" rel="noreferrer noopener" className="underline">
              Book a call
            </a>{" "}
            and we&apos;ll get you set up.
          </p>
        )}
        <div className="mt-8 space-y-3">
          <Button variant="dark" onClick={handleGoogle} className="w-full">
            Continue with Google
          </Button>
          {!configured && (
            <Button variant="outline" onClick={mockSignIn} className="w-full">
              Continue without a backend
            </Button>
          )}
        </div>
        <p className="mt-6 text-xs text-ink/40">
          {configured
            ? "Connected to the InboxOS backend."
            : "Demo sign-in — no backend configured."}
        </p>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
