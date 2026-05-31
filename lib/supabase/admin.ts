import { createClient } from "@supabase/supabase-js";

/**
 * Admin client uses the SERVICE_ROLE key and bypasses Row Level Security.
 * Use only in server-side code that needs to perform privileged operations
 * across users (admin tools, scheduled jobs, etc.). Never import this from
 * client code or expose its operations to unauthenticated callers.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
