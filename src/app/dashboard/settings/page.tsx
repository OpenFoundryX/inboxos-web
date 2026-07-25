"use client";

import { useRouter } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import PageHeader from "@/components/app/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { resetOnboarding, signOut } from "@/lib/auth";
import { backendConfigured, logout } from "@/lib/session";

export default function SettingsPage() {
  const router = useRouter();

  function replay() {
    resetOnboarding();
    router.replace("/onboarding/creating");
  }

  async function handleSignOut() {
    if (backendConfigured()) await logout();
    signOut();
    router.replace("/");
  }

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-8">
        <PageHeader title="Settings" subtitle="Manage your workspace and account." />
        <div className="max-w-2xl space-y-6">
          <Card className="p-5">
            <div className="text-sm font-bold text-ink">Profile</div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                NP
              </span>
              <div>
                <div className="text-sm font-medium text-ink">Your Workspace</div>
                <div className="text-xs text-ink/50">Free plan</div>
              </div>
            </div>
          </Card>

          <Card className="flex items-center justify-between p-5">
            <div>
              <div className="text-sm font-bold text-ink">Replay onboarding</div>
              <div className="text-xs text-ink/50">
                Reset the setup flow and walk through onboarding again.
              </div>
            </div>
            <Button variant="outline" onClick={replay}>
              Replay
            </Button>
          </Card>

          <Card className="flex items-center justify-between p-5">
            <div>
              <div className="text-sm font-bold text-ink">Sign out</div>
              <div className="text-xs text-ink/50">End your session on this device.</div>
            </div>
            <Button variant="dark" onClick={handleSignOut}>
              Sign out
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
