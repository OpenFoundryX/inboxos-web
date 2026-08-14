import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: "weekly" as const,
    // The home page is the one Google's branding review reads, so it leads.
    priority: route === "/" ? 1 : 0.5,
  }));
}
