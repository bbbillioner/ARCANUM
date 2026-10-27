import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Proxy that refreshes the Supabase auth session on every request.
 * Required for cookie-based auth in the App Router.
 *
 * Accounts are optional. Without Supabase settings there is no session to
 * refresh, so requests pass straight through. This proxy protects no routes
 * (Row Level Security and the route handlers enforce access), so a Supabase
 * failure is logged and the request continues instead of failing the page.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const config = getSupabaseConfig();
  if (!config) return response;

  try {
    const supabase = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Touches the session to refresh it if needed.
    await supabase.auth.getUser();
  } catch (error) {
    console.error("ARCANUM proxy: Supabase session refresh failed", error);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
