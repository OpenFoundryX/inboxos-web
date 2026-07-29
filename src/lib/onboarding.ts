import { apiFetch } from "./api";
import { BATCHING_CHOICE_KEY, CATEGORIES_CHOICE_KEY, setOnboarded } from "./auth";
import { startBatching } from "./mailman";
import { backendConfigured, type UserRead } from "./session";

/** Set by the last onboarding step when batching could not be activated, read
 *  once by the dashboard. sessionStorage, not localStorage: the notice is about
 *  this hand-off, not a durable piece of user state. */
export const BATCHING_FAILED_KEY = "inboxos_batching_failed";

/** Answers the API cannot reproduce, kept for the length of one wizard run.
 *
 *  `BATCHING_CHOICE_KEY` is written by the scheduled-mail step and read by the
 *  last step, which owns the Finish click; "live" means never call
 *  startBatching(). `CATEGORIES_CHOICE_KEY` is written and read by the
 *  inbox-labels step alone, to tell "never answered" from "answered: all".
 *
 *  Re-exported here rather than imported from a step's own module so the steps
 *  do not import each other; both are declared in `lib/auth` so `signOut()`
 *  clears them. Both are cleared again once onboarding completes, below. */
export { BATCHING_CHOICE_KEY, CATEGORIES_CHOICE_KEY };

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
    clearWizardChoices();
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
  clearWizardChoices();
  return { batchingFailed };
}

/** The stored answers have done their job. Left behind they would outlive this
 *  wizard and this session, and a later direct hit on a step would act on a
 *  stale answer. Called only after completion lands, so a retry still sees
 *  them. */
function clearWizardChoices(): void {
  window.localStorage.removeItem(BATCHING_CHOICE_KEY);
  window.localStorage.removeItem(CATEGORIES_CHOICE_KEY);
}
