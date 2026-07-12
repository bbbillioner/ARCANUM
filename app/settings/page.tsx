"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { isOnboardingAnswers } from "@/lib/portfolio";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OnboardingAnswers } from "@/types/investing";

type Status = "idle" | "loaded" | "no-onboarding";

const STORAGE_KEYS = ["arcanum-onboarding", "arcanum-simulator", "arcanum-watchlist"];

function countSimulatorPositions(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("arcanum-simulator");
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { holdings?: unknown[] };
    return Array.isArray(parsed.holdings) ? parsed.holdings.length : 0;
  } catch {
    return 0;
  }
}

function countSimulatorTransactions(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("arcanum-simulator");
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { transactions?: unknown[] };
    return Array.isArray(parsed.transactions) ? parsed.transactions.length : 0;
  } catch {
    return 0;
  }
}

function countWatchlist(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("arcanum-watchlist");
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default function SettingsPage() {
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [simPositions, setSimPositions] = useState(0);
  const [simTxs, setSimTxs] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;

      const raw = localStorage.getItem("arcanum-onboarding");
      if (!raw) {
        setStatus("no-onboarding");
      } else {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (isOnboardingAnswers(parsed)) {
            setAnswers(parsed);
            setStatus("loaded");
          } else {
            setStatus("no-onboarding");
          }
        } catch {
          setStatus("no-onboarding");
        }
      }
      setSimPositions(countSimulatorPositions());
      setSimTxs(countSimulatorTransactions());
      setWatchCount(countWatchlist());

      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        if (!cancelled) {
          setUserEmail(data.user?.email ?? null);
        }
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  function handleClearAll() {
    if (!confirmingClear) {
      setConfirmingClear(true);
      window.setTimeout(() => setConfirmingClear(false), 4000);
      return;
    }
    for (const key of STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    setAnswers(null);
    setStatus("no-onboarding");
    setSimPositions(0);
    setSimTxs(0);
    setWatchCount(0);
    setConfirmingClear(false);
    setFlash("Local data cleared. ARCANUM has forgotten you.");
    window.setTimeout(() => setFlash(null), 3500);
  }

  function handleClearSimulator() {
    localStorage.removeItem("arcanum-simulator");
    setSimPositions(0);
    setSimTxs(0);
    setFlash("Simulator reset. Cash and history cleared.");
    window.setTimeout(() => setFlash(null), 3500);
  }

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Settings
          </span>
          <h1>
            Your <em>profile</em> on this device.
          </h1>
          <p className="lede">
            ARCANUM stores everything locally — no account, no cloud. This page
            shows what&apos;s in your browser and lets you reset it.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="wrap" style={{ maxWidth: 820 }}>
          {flash && (
            <div
              style={{
                borderLeft: "2px solid var(--accent)",
                background: "var(--surface-2)",
                padding: "12px 16px",
                marginBottom: 24,
                fontSize: "0.92rem",
              }}
            >
              {flash}
            </div>
          )}

          {/* Account */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              padding: 28,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: userEmail ? 18 : 0,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: 8,
                  }}
                >
                  Account
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {userEmail ?? "Not signed in"}
                </h2>
              </div>
              {userEmail ? (
                <form action="/auth/sign-out" method="POST">
                  <button className="btn btn-ghost" type="submit">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link className="btn btn-primary" href="/sign-in">
                  Sign in
                </Link>
              )}
            </div>
            {!userEmail && (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.94rem",
                  lineHeight: 1.65,
                  marginTop: 14,
                }}
              >
                Right now your portfolio, journal, and onboarding answers live
                only in this browser. Sign in to sync them across devices.
              </p>
            )}
          </div>

          {/* Profile */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              padding: 28,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: 8,
                  }}
                >
                  Investor profile
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {status === "loaded" ? "Saved from onboarding" : "Not built yet"}
                </h2>
              </div>
              <Link className="btn btn-ghost" href="/onboarding">
                {status === "loaded" ? "Retake onboarding" : "Build profile"}
              </Link>
            </div>

            {status === "loaded" && answers ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["Budget", answers.budget],
                  ["Goal", answers.goal],
                  ["Time horizon", answers.timeHorizon],
                  ["Risk comfort", answers.riskComfort],
                  ["Experience", answers.experience],
                  ["Portfolio style", answers.portfolioStyle],
                  ["Approach", answers.investmentApproach],
                  ["Interests", answers.interests.join(", ") || "—"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      border: "1px solid var(--stroke)",
                      padding: 14,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: "0.92rem",
                        marginTop: 6,
                        color: "var(--foreground)",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "0.94rem" }}>
                Complete onboarding so ARCANUM can pick a starter portfolio and
                personalise the dashboard.
              </p>
            )}
          </div>

          {/* Simulator data */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              padding: 28,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: 8,
                  }}
                >
                  Simulator
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {simPositions} positions · {simTxs} transactions
                </h2>
              </div>
              <button
                className="btn btn-ghost"
                onClick={handleClearSimulator}
                type="button"
              >
                Clear simulator
              </button>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.94rem" }}>
              Resets your fake-cash balance, all open positions, and the
              transaction log. Your onboarding profile is kept.
            </p>
          </div>

          {/* Watchlist data */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              padding: 28,
              marginBottom: 18,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              Watchlist
            </p>
            <h2
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 600,
                fontSize: "1.5rem",
                letterSpacing: "-0.01em",
              }}
            >
              {watchCount} ticker{watchCount === 1 ? "" : "s"} followed
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.94rem",
                marginTop: 10,
              }}
            >
              Manage your watchlist from the{" "}
              <Link
                href="/watchlist"
                style={{
                  color: "var(--accent)",
                  borderBottom: "1px solid rgba(0,229,168,0.4)",
                }}
              >
                watchlist page
              </Link>
              .
            </p>
          </div>

          {/* Danger zone */}
          <div
            style={{
              borderLeft: "2px solid #ff6878",
              background: "var(--surface)",
              border: "1px solid var(--stroke)",
              borderLeftColor: "#ff6878",
              borderLeftWidth: 2,
              padding: 28,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.66rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#ff6878",
                marginBottom: 8,
              }}
            >
              Reset everything
            </p>
            <h2
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 600,
                fontSize: "1.5rem",
                letterSpacing: "-0.01em",
                marginBottom: 12,
              }}
            >
              Make ARCANUM <em>forget</em> you.
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.94rem",
                marginBottom: 18,
                maxWidth: "60ch",
                lineHeight: 1.65,
              }}
            >
              Clears your onboarding answers, simulator state, and watchlist.
              The next visit is a fresh install. This cannot be undone.
            </p>
            <button
              className="btn"
              data-confirming={confirmingClear}
              onClick={handleClearAll}
              type="button"
              style={{
                background: confirmingClear ? "#ff6878" : "transparent",
                color: confirmingClear ? "#000" : "#ff6878",
                border: `1px solid ${confirmingClear ? "#ff6878" : "rgba(255,104,120,0.5)"}`,
                fontWeight: 600,
              }}
            >
              {confirmingClear ? "Click again to confirm" : "Clear all local data"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
