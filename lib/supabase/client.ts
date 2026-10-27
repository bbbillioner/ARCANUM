import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";

/** Browser Supabase client, or null when accounts are not configured. */
export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  return createBrowserClient(config.url, config.anonKey);
}
