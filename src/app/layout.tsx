import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { APP_NAME } from "@/lib/app";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

/** `applicationName` and the leading word of `title` must both match the "App
 *  name" on the Google OAuth consent screen — verification rejects the app when
 *  the consent screen and the home page disagree about what it is called. Both
 *  come from APP_NAME so they can only drift in one place. */
export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: `${APP_NAME} — an assistant for your Gmail inbox, meetings and scheduling`,
  description: `${APP_NAME} connects to your Gmail and Google Calendar to sort and batch your mail, draft your replies, write up the meetings it joins, and handle scheduling back-and-forth on your behalf.`,
  openGraph: {
    siteName: APP_NAME,
    title: `${APP_NAME} — an assistant for your Gmail inbox, meetings and scheduling`,
    description: `${APP_NAME} connects to your Gmail and Google Calendar to sort and batch your mail, draft your replies, write up the meetings it joins, and handle scheduling back-and-forth on your behalf.`,
    type: "website",
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
