"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !cleaned.includes("@")) {
      setStatus("error");
      setErrorText("Enter a valid email address.");
      return;
    }

    setStatus("sending");
    setErrorText(null);

    const supabase = createSupabaseBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: cleaned,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <main>
      <section
        style={{
          minHeight: "calc(100vh - 220px)",
          display: "flex",
          alignItems: "center",
          padding: "clamp(3rem, 8vw, 6rem) 0",
        }}
      >
        <div className="wrap" style={{ maxWidth: 520 }}>
          <span className="eyebrow">
            <span className="gem" />
            Sign in
          </span>
          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 600,
              fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              margin: "20px 0 16px",
            }}
          >
            Open your <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
              ARCANUM
            </em>{" "}
            account.
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.04rem",
              lineHeight: 1.65,
              marginBottom: 32,
              maxWidth: "44ch",
            }}
          >
            We&apos;ll email you a one-tap sign-in link. No password to set, no
            password to forget. New here? The same link signs you up and signs
            you in.
          </p>

          {status === "sent" ? (
            <div
              style={{
                borderLeft: "2px solid var(--accent)",
                background: "var(--surface-2)",
                padding: "16px 20px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}
              >
                Check your inbox
              </p>
              <p style={{ color: "var(--foreground)", lineHeight: 1.6 }}>
                A magic-link sign-in is on its way to{" "}
                <span style={{ color: "var(--accent)" }}>{email}</span>. Open it
                on this device and you&apos;ll land in ARCANUM signed in.
              </p>
              <p
                style={{
                  marginTop: 12,
                  fontSize: "0.86rem",
                  color: "var(--muted)",
                }}
              >
                Don&apos;t see it after a minute? Check spam, then{" "}
                <button
                  onClick={() => {
                    setStatus("idle");
                    setEmail("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(0,229,168,0.4)",
                    padding: 0,
                    fontFamily: "inherit",
                    fontSize: "inherit",
                  }}
                  type="button"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <label style={{ display: "grid", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  Email
                </span>
                <input
                  autoComplete="email"
                  className="signin-input"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              {errorText && (
                <div
                  style={{
                    borderLeft: "2px solid #ff6878",
                    background: "var(--surface-2)",
                    padding: "10px 14px",
                    fontSize: "0.9rem",
                  }}
                >
                  {errorText}
                </div>
              )}

              <button
                className="btn btn-primary"
                disabled={status === "sending"}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  opacity: status === "sending" ? 0.6 : 1,
                  cursor: status === "sending" ? "wait" : "pointer",
                }}
                type="submit"
              >
                {status === "sending"
                  ? "Sending magic link…"
                  : "Email me a sign-in link →"}
              </button>
            </form>
          )}

          <p
            style={{
              marginTop: 36,
              fontSize: "0.86rem",
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            Don&apos;t want an account? You can keep using ARCANUM without
            signing in — your data stays in your browser. Sign in only when you
            want it to sync across devices.{" "}
            <Link
              href="/"
              style={{
                color: "var(--accent)",
                borderBottom: "1px solid rgba(0,229,168,0.4)",
              }}
            >
              Skip for now
            </Link>
            .
          </p>
        </div>
      </section>

      <style>{`
        .signin-input {
          width: 100%;
          height: 52px;
          background: var(--surface-2);
          border: 1px solid var(--stroke);
          color: var(--foreground);
          padding: 0 18px;
          font-family: var(--font-inter);
          font-size: 1.05rem;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .signin-input::placeholder { color: var(--muted); }
        .signin-input:focus {
          border-color: var(--accent);
          background: var(--surface);
        }
      `}</style>
    </main>
  );
}
