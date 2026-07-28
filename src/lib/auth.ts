const KEY = "inboxos_authed";
const ONBOARDED = "inboxos_onboarded";

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
