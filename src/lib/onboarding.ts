import { apiFetch } from "./api";
import { BATCHING_CHOICE_KEY, setOnboarded } from "./auth";
import { startBatching } from "./mailman";
import { backendConfigured, type UserRead } from "./session";

/** Set by the last onboarding step when batching could not be activated, read
 *  once by the dashboard. sessionStorage, not localStorage: the notice is about
 *  this hand-off, not a durable piece of user state. */
export const BATCHING_FAILED_KEY = "inboxos_batching_failed";

/** Written by the scheduled-mail step, read by the last step, which owns the
 *  Finish click. "live" means never call startBatching(). Re-exported here
 *  rather than imported from a step's own module so the two steps do not import
 *  each other; it is declared in `lib/auth` so `signOut()` clears it. */
export { BATCHING_CHOICE_KEY };

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
    window.localStorage.removeItem(BATCHING_CHOICE_KEY);
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
  // The choice has done its job. Left behind it would outlive this wizard and
  // this session, and a later direct hit on step 4 would act on a stale answer.
  // Cleared only after completion lands, so a retry still sees it.
  window.localStorage.removeItem(BATCHING_CHOICE_KEY);
  return { batchingFailed };
}
