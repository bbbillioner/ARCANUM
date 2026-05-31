"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type State = "loading" | "signed-out" | "signed-in";

export function AuthIndicator() {
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) {
        setEmail(data.user.email ?? null);
        setState("signed-in");
      } else {
        setState("signed-out");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setEmail(session.user.email ?? null);
        setState("signed-in");
      } else {
        setEmail(null);
        setState("signed-out");
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "loading") {
    return <span className="auth-pill auth-pill-loading" aria-hidden />;
  }

  if (state === "signed-in") {
    return (
      <Link className="auth-pill auth-pill-account" href="/settings">
        <span aria-hidden className="auth-pill-dot" />
        <span className="auth-pill-label">
          {email ? email.split("@")[0] : "Account"}
        </span>
        <style>{`
          .auth-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 7px 12px;
            border: 1px solid var(--stroke);
            background: var(--surface);
            color: var(--foreground);
            font-family: var(--font-inter);
            font-size: 0.85rem;
            font-weight: 500;
            text-decoration: none;
            transition: border-color 0.2s ease, background 0.2s ease;
            max-width: 160px;
            overflow: hidden;
          }
          .auth-pill:hover {
            border-color: var(--accent);
          }
          .auth-pill-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--accent);
            box-shadow: 0 0 8px rgba(0, 229, 168, 0.6);
            flex: none;
          }
          .auth-pill-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `}</style>
      </Link>
    );
  }

  return (
    <Link className="auth-pill auth-pill-signin" href="/sign-in">
      Sign in
      <style>{`
        .auth-pill-signin {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border: 1px solid var(--stroke);
          background: transparent;
          color: var(--muted);
          font-family: var(--font-inter);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .auth-pill-signin:hover {
          border-color: var(--stroke-strong);
          color: var(--foreground);
        }
        .auth-pill-loading {
          display: inline-block;
          width: 80px;
          height: 30px;
          background: var(--surface);
          border: 1px solid var(--stroke);
          opacity: 0.5;
        }
      `}</style>
    </Link>
  );
}
