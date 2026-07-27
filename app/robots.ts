import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export default function robots(): MetadataRoute.Robots {
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
