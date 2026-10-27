import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Admin client uses the SERVICE_ROLE key and bypasses Row Level Security.
 * Use only in server-side code that needs to perform privileged operations
 * across users (admin tools, scheduled jobs, etc.). Never import this from
 * client code or expose its operations to unauthenticated callers.
 *
 * Returns null when Supabase or the service-role key is not configured.
 */
export function createSupabaseAdminClient() {
  const config = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!config || !serviceRoleKey) return null;

  return createClient(
    config.url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
