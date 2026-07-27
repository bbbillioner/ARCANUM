import type { MetadataRoute } from "next";

import { allProfiles } from "@/lib/stocks";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/stocks", "/compare", "/brief", "/learn", "/help"];
  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: route === "" ? ("weekly" as const) : ("daily" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...allProfiles.map((profile) => ({
      url: `${baseUrl}/stocks/${profile.ticker}`,
      changeFrequency: "daily" as const,
      priority: profile.deep ? 0.8 : 0.6,
    })),
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];
}
