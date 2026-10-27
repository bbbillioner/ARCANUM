import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "@/lib/supabase/config";

/** Server Supabase client, or null when accounts are not configured. */
export async function createSupabaseServerClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if there's middleware refreshing sessions.
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
