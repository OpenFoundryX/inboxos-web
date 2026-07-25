"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { signIn, isOnboarded } from "@/lib/auth";
import { backendConfigured, startGoogleLogin } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const configured = backendConfigured();

  function mockSignIn() {
    signIn();
    router.replace(isOnboarded() ? "/dashboard" : "/onboarding/creating");
  }

  function handleGoogle() {
    if (configured) startGoogleLogin();
    else mockSignIn();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <Link href="/" className="mb-8 text-2xl font-extrabold tracking-tight text-accent">
        InboxOS
      </Link>
      <Card className="w-full max-w-sm p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">Sign in to organize your inbox.</p>
        <div className="mt-8 space-y-3">
          <Button variant="dark" onClick={handleGoogle} className="w-full">
            Continue with Google
          </Button>
          <Button
            variant="outline"
            onClick={configured ? undefined : mockSignIn}
            disabled={configured}
            className="w-full"
          >
            Continue with Outlook
          </Button>
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
