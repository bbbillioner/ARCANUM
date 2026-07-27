import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Handles the magic-link redirect from Supabase Auth.
 * URL shape: /auth/callback?code=...&next=/dashboard
 * Exchanges the code for a session cookie, then redirects to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/today";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/today";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // On failure, send the user back to /sign-in with an error flag.
  return NextResponse.redirect(new URL("/sign-in?error=callback", url.origin));
}
