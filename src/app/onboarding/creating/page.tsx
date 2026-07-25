"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Orbit from "@/components/onboarding/Orbit";

export default function CreatingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/onboarding/calendar"), 2500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <span className="text-2xl font-extrabold tracking-tight text-accent">InboxOS</span>
      <Orbit />
      <p className="text-lg font-semibold text-ink">Setting up your workspace…</p>
    </div>
  );
}
