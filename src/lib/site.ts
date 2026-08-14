/** The canonical origin, apex-less. Everything the domain redirects to lands
 *  here — `inboxoshq.com` 308s to `www`, so `www` is what canonical URLs, the
 *  sitemap and the OAuth consent screen's "Application home page" field must
 *  all say. They have to agree: Google's branding review fetches the home page
 *  URL configured on the consent screen, and a mismatch there is a mismatch
 *  everywhere. */
export const SITE_URL = "https://www.inboxoshq.com";

/** Pages that should be crawlable and indexed. Deliberately a short list: the
 *  dashboard, onboarding and per-link scheduling pages are either behind auth
 *  or one-off, and none of them belong in an index. */
export const PUBLIC_ROUTES = ["/", "/privacy", "/terms"] as const;
