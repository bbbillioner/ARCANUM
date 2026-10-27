const FALLBACK_SITE_URL = "http://localhost:3000";

/** Returns the value as an http(s) origin/path without a trailing slash, or null. */
function parseHttpUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const { protocol } = new URL(value);
    if (protocol !== "http:" && protocol !== "https:") return null;
    return value.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/**
 * Canonical public URL of the site, for metadata, robots.txt, the sitemap,
 * and the OG image. Server-side only in practice: `VERCEL_PROJECT_PRODUCTION_URL`
 * is not exposed to the browser.
 *
 * Order: `NEXT_PUBLIC_SITE_URL` (if it is a valid http(s) URL) →
 * Vercel's production hostname → `http://localhost:3000`. Never throws.
 */
export function getSiteUrl(): string {
  const explicit = parseHttpUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit;

  // Vercel system variable: a bare hostname such as "arcanum-gilt.vercel.app".
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(
    /^https?:\/\//i,
    "",
  );
  if (vercelHost) {
    const fromVercel = parseHttpUrl(`https://${vercelHost}`);
    if (fromVercel) return fromVercel;
  }

  return FALLBACK_SITE_URL;
}
