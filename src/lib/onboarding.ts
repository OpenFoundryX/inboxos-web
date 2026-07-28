import { apiFetch } from "./api";
import { setOnboarded } from "./auth";
import { startBatching } from "./mailman";
import { backendConfigured, type UserRead } from "./session";

/** Set by the last onboarding step when batching could not be activated, read
 *  once by the dashboard. sessionStorage, not localStorage: the notice is about
 *  this hand-off, not a durable piece of user state. */
export const BATCHING_FAILED_KEY = "inboxos_batching_failed";

/** Written by the scheduled-mail step, read by the last step, which owns the
 *  Finish click. "live" means never call startBatching(). It lives here rather
 *  than in the step's own module so the two steps do not import each other. */
export const BATCHING_CHOICE_KEY = "inboxos_batching_choice";

export const completeOnboarding = () =>
  apiFetch<UserRead>("/users/me/onboarding/complete", { method: "POST" });

/** The last step's write. Activating batching installs a Gmail filter, so it is
 *  deliberately deferred to here rather than run when the user picks a schedule.
 *
 *  A failed activation is not fatal — the user still lands on the dashboard,
 *  which reports it. Trapping someone in a wizard over a Gmail API hiccup is
 *  worse than an unbatched inbox they can fix from /dashboard/mailman. A failed
 *  completeOnboarding IS fatal and throws, because without it they re-enter the
 *  wizard on next login. */
export async function finishOnboarding(
  activateBatching: boolean,
): Promise<{ batchingFailed: boolean }> {
  if (!backendConfigured()) {
    setOnboarded();
    return { batchingFailed: false };
  }

  let batchingFailed = false;
  if (activateBatching) {
    try {
      await startBatching();
    } catch {
      batchingFailed = true;
      window.sessionStorage.setItem(BATCHING_FAILED_KEY, "1");
    }
  }

  await completeOnboarding();
  return { batchingFailed };
}
