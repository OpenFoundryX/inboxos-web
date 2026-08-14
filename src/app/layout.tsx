import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { APP_NAME } from "@/lib/app";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

const DESCRIPTION = `${APP_NAME} connects to your Gmail and Google Calendar to sort and batch your mail, draft your replies, write up the meetings it joins, and handle scheduling back-and-forth on your behalf.`;

/** Google's OAuth verification compares the "App name" on the consent screen
 *  with the name it finds on the home page, and rejects the app when they
 *  disagree — the comparison is exact, so "Inbox OS" or "Inboxos" would fail
 *  just as a different name would. Every name here therefore comes from
 *  APP_NAME and can only drift in one place.
 *
 *  The five tags the checker reads are `title`, `application-name`,
 *  `apple-mobile-web-app-title`, `og:site_name` and `og:title`. All five are
 *  the name and nothing else — no tagline, no separator — so that a check
 *  comparing the whole value rather than its leading word still passes. What
 *  the product does is left to `description` and to the page itself, which
 *  says it at length under `#what-it-is` and `#google-data`.
 *
 *  Once verification is granted, `title` can go back to carrying a tagline;
 *  it is the one tag here that costs anything as a bare name, since it is
 *  what search results and browser tabs show. */
export const metadata: Metadata = {
  // Without a metadataBase, `openGraph.url` and the canonical below resolve
  // against localhost at build time. It also has to be the `www` host: the apex
  // 308s there, and a canonical pointing at a URL that redirects is a canonical
  // Google gets to ignore.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  applicationName: APP_NAME,
  title: APP_NAME,
  description: DESCRIPTION,
  appleWebApp: { title: APP_NAME },
  openGraph: {
    siteName: APP_NAME,
    title: APP_NAME,
    description: DESCRIPTION,
    url: "/",
    type: "website",
  },
  // Wired from the logo files already in `public/`. Without this the document
  // declares no icon at all and /favicon.ico is a 404 — a thin signal on a
  // page whose whole job right now is to look like a real product's home.
  icons: {
    icon: [
      { url: "/logo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/logo-180.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
