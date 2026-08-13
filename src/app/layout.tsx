import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { APP_NAME } from "@/lib/app";
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
 *  The four tags the checker reads are `title`, `application-name`,
 *  `apple-mobile-web-app-title` and `og:site_name` / `og:title`. The first
 *  leads with the bare name before any tagline; the rest are the name alone,
 *  with the sentence about the product left to the descriptions. */
export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: `${APP_NAME} — an assistant for your Gmail inbox, meetings and scheduling`,
  description: DESCRIPTION,
  appleWebApp: { title: APP_NAME },
  openGraph: {
    siteName: APP_NAME,
    title: APP_NAME,
    description: DESCRIPTION,
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
