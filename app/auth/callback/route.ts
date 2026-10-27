import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_NEXT = "/today";

/** True for backslashes, whitespace, and C0/C1 control characters. */
function hasUnsafeChars(value: string): boolean {
  if (value.includes("\\") || /\s/.test(value)) return true;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

/**
 * Resolves the post-sign-in redirect. Only same-origin paths are allowed:
 * URL parsing treats "\" as "/" and strips tabs/newlines, so "/\evil.com" or
 * "/<TAB>/evil.com" would otherwise resolve to another host.
 */
function resolveNext(requested: string | null, origin: string): URL {
  const fallback = new URL(DEFAULT_NEXT, origin);
  if (
    !requested ||
    !requested.startsWith("/") ||
    requested.startsWith("//") ||
    hasUnsafeChars(requested)
  ) {
    return fallback;
  }
  try {
    const target = new URL(requested, origin);
    return target.origin === origin ? target : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Handles the magic-link redirect from Supabase Auth.
 * URL shape: /auth/callback?code=...&next=/dashboard
 * Exchanges the code for a session cookie, then redirects to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = resolveNext(url.searchParams.get("next"), url.origin);

  // Without Supabase there is no session to exchange; fall through to the
  // sign-in page, which explains that accounts are unavailable.
  const supabase = code ? await createSupabaseServerClient() : null;
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(next);
    }
  }

  // On failure, send the user back to /sign-in with an error flag.
  return NextResponse.redirect(new URL("/sign-in?error=callback", url.origin));
}
