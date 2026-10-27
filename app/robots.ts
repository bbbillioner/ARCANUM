import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/dashboard",
        "/journal",
        "/onboarding",
        "/portfolio-suggestion",
        "/settings",
        "/sign-in",
        "/simulator",
        "/today",
        "/watchlist",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
