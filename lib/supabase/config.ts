export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

/**
 * Public Supabase settings, or null when accounts are not configured.
 *
 * Supabase is optional: without it ARCANUM runs anonymously from
 * localStorage and the sign-in and sync features stay hidden. A missing key
 * or a malformed URL counts as "not configured" so a bad deployment setting
 * can never take the whole site down.
 *
 * The env vars are referenced literally so Next.js inlines them into client
 * bundles at build time.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey || !isHttpUrl(url)) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
