"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ARCANUM_CLOUD_DATA_LOADED_EVENT,
  getCloudSyncStatus,
  requestCloudSync,
  type CloudSyncStatus,
} from "@/lib/cloud-sync";
import { isOnboardingAnswers } from "@/lib/portfolio";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OnboardingAnswers } from "@/types/investing";

type Status = "idle" | "loaded" | "no-onboarding";

const STORAGE_KEYS = [
  "arcanum-onboarding",
  "arcanum-onboarding-updated-at",
  "arcanum-simulator",
  "arcanum-watchlist",
];

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
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
      setSyncStatus(getCloudSyncStatus());

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

  useEffect(() => {
    function handleSyncStatus(event: Event) {
      const customEvent = event as CustomEvent<CloudSyncStatus>;
      setSyncStatus(customEvent.detail);
    }
    window.addEventListener("arcanum:sync-status", handleSyncStatus);
    return () => window.removeEventListener("arcanum:sync-status", handleSyncStatus);
  }, []);

  useEffect(() => {
    function handleCloudDataLoaded() {
      const raw = localStorage.getItem("arcanum-onboarding");
      if (raw) {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (isOnboardingAnswers(parsed)) {
            setAnswers(parsed);
            setStatus("loaded");
          }
        } catch {
          setAnswers(null);
          setStatus("no-onboarding");
        }
      }
      setSimPositions(countSimulatorPositions());
      setSimTxs(countSimulatorTransactions());
      setWatchCount(countWatchlist());
    }
    window.addEventListener(
      ARCANUM_CLOUD_DATA_LOADED_EVENT,
      handleCloudDataLoaded,
    );
    return () =>
      window.removeEventListener(
        ARCANUM_CLOUD_DATA_LOADED_EVENT,
        handleCloudDataLoaded,
      );
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
    requestCloudSync();
    window.setTimeout(() => setFlash(null), 3500);
  }

  function handleClearSimulator() {
    localStorage.removeItem("arcanum-simulator");
    setSimPositions(0);
    setSimTxs(0);
    setFlash("Simulator reset. Cash and history cleared.");
    requestCloudSync();
    window.setTimeout(() => setFlash(null), 3500);
  }

  function handleExportData() {
    const data = Object.fromEntries(
      STORAGE_KEYS.map((key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return [key, null];
        try {
          return [key, JSON.parse(raw) as unknown];
        } catch {
          return [key, raw];
        }
      }),
    );
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `arcanum-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFlash("Your ARCANUM data export is ready.");
    window.setTimeout(() => setFlash(null), 3500);
  }

  async function handleDeleteAccount() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      window.setTimeout(() => setConfirmingDelete(false), 5000);
      return;
    }

    setDeletingAccount(true);
    const response = await fetch("/api/account", { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setFlash(body?.error ?? "Account deletion failed. Please try again.");
      setDeletingAccount(false);
      setConfirmingDelete(false);
      return;
    }

    for (const key of STORAGE_KEYS) localStorage.removeItem(key);
    localStorage.removeItem("arcanum-cloud-user");
    window.location.assign("/");
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
            ARCANUM works locally without an account. When you sign in, your
            investor profile, watchlist, simulator, and journal sync across
            your devices.
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
            {userEmail ? (
              <div>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.94rem",
                    lineHeight: 1.65,
                  }}
                >
                  Cloud sync is{" "}
                  {syncStatus?.state === "syncing"
                    ? "working"
                    : syncStatus?.state === "error"
                      ? "temporarily unavailable"
                      : "active"}
                  .
                  {syncStatus?.state === "synced" && (
                    <> Last completed {new Date(syncStatus.updatedAt).toLocaleString()}.</>
                  )}
                </p>
                {syncStatus?.state === "error" && (
                  <p
                    style={{
                      color: "#ff9a66",
                      fontSize: "0.86rem",
                      marginTop: 8,
                    }}
                  >
                    Your local data is safe. ARCANUM will retry automatically.
                  </p>
                )}
              </div>
            ) : (
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
            <div style={{ marginTop: 18 }}>
              <button
                className="btn btn-ghost"
                onClick={handleExportData}
                type="button"
              >
                Export my data
              </button>
            </div>
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
              Clears your onboarding answers, simulator state, journal, and
              watchlist. When signed in, the synced copies are cleared too.
              This cannot be undone.
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
              {confirmingClear ? "Click again to confirm" : "Clear my ARCANUM data"}
            </button>

            {userEmail && (
              <div
                style={{
                  borderTop: "1px solid var(--stroke)",
                  marginTop: 28,
                  paddingTop: 24,
                }}
              >
                <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>
                  Delete account permanently
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  Deletes your sign-in identity and all associated cloud data.
                  Export anything you want to keep first.
                </p>
                <button
                  className="btn"
                  disabled={deletingAccount}
                  onClick={handleDeleteAccount}
                  type="button"
                  style={{
                    background: confirmingDelete ? "#ff6878" : "transparent",
                    color: confirmingDelete ? "#000" : "#ff6878",
                    border: `1px solid ${confirmingDelete ? "#ff6878" : "rgba(255,104,120,0.5)"}`,
                    opacity: deletingAccount ? 0.6 : 1,
                  }}
                >
                  {deletingAccount
                    ? "Deleting account..."
                    : confirmingDelete
                      ? "Click again to delete account"
                      : "Delete my account"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
