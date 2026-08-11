/** The application's registered name.
 *
 *  IMPORTANT: this string must match the "App name" field on the Google Cloud
 *  OAuth consent screen character for character, including capitalisation.
 *  Google's verification review compares the name on the consent screen against
 *  the name shown on the home page and rejects the app when they differ. The
 *  stylised `Wordmark` lockup renders the name in two weights, so it is not a
 *  reliable source for that comparison — user-visible prose should use this
 *  constant instead.
 *
 *  If you change this, change the consent screen in the same sitting. */
export const APP_NAME = "InboxOS";

/** One-line description of the product. Kept next to the name so the home page,
 *  the document title and the consent screen can't drift apart. */
export const APP_TAGLINE =
  "An assistant for your Gmail inbox, your meetings and your scheduling.";
