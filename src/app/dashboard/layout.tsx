"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAccess } from "@/lib/session";
import Sidebar from "@/components/app/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    checkAccess().then(({ authed, connected, onboarded }) => {
      if (!active) return;
      if (!authed) {
        router.replace("/login");
        return;
      }
      if (!onboarded) {
        router.replace(connected ? "/onboarding/mail" : "/onboarding/connect");
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-ink/40">Loading…</div>
    );
  }

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
