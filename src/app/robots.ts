import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Until this existed, /robots.txt was a 404 — which is permissive, but it also
 *  meant no sitemap was advertised anywhere. On a domain registered days ago
 *  that matters: nothing links here yet, so a crawler has no path in except the
 *  sitemap, and Google's OAuth branding review needs to be able to read this
 *  home page.
 *
 *  The signed-in surfaces are disallowed rather than left open. They're behind
 *  auth so a crawler only ever gets the login redirect, and an index full of
 *  those is worse than no index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/onboarding/", "/schedule/", "/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
