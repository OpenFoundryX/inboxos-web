const KEY = "inboxos_authed";
const ONBOARDED = "inboxos_onboarded";

/** The scheduled-mail step's answer, read by the last step. It lives here, with
 *  the other browser-storage keys, so `signOut()` can clear it — left behind it
 *  survives a sign-out and an account switch on a shared browser. Re-exported
 *  from `lib/onboarding`, which is where the steps import it from. */
export const BATCHING_CHOICE_KEY = "inboxos_batching_choice";

function setFlag(key: string) {
  window.localStorage.setItem(key, "1");
  document.cookie = `${key}=1; path=/; max-age=${60 * 60 * 24 * 30}`;
}

function clearFlag(key: string) {
  window.localStorage.removeItem(key);
  document.cookie = `${key}=; path=/; max-age=0`;
}

export function signIn(): void {
  if (typeof window === "undefined") return;
  setFlag(KEY);
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  clearFlag(KEY);
  clearFlag(ONBOARDED);
  // Not a flag+cookie pair, just a localStorage value — but it is wizard state
  // and must not outlive the session that answered.
  window.localStorage.removeItem(BATCHING_CHOICE_KEY);
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDED) === "1";
}

export function setOnboarded(): void {
  if (typeof window === "undefined") return;
  setFlag(ONBOARDED);
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  clearFlag(ONBOARDED);
}
