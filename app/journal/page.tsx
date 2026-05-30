"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useQuotes } from "@/components/hooks/use-quotes";
import { getCurrentPrice } from "@/lib/prices";
import {
  addThesisReview,
  calculateSimulatorSummary,
  getSimulator,
} from "@/lib/simulator";
import type {
  SimulatorState,
  SimulatorTransaction,
} from "@/types/investing";

type ReviewState = "needs-review" | "reviewed" | "fresh";

const REVIEW_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

function reviewState(tx: SimulatorTransaction): ReviewState {
  const age = Date.now() - new Date(tx.createdAt).getTime();
  if (age < REVIEW_AFTER_MS) return "fresh";
  return (tx.reviews?.length ?? 0) > 0 ? "reviewed" : "needs-review";
}

export default function JournalPage() {
  const [simulator, setSimulator] = useState<SimulatorState | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [openReview, setOpenReview] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState("");
  const [flash, setFlash] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setSimulator(getSimulator());
    setHasLoaded(true);
  }, []);

  const buys = useMemo<SimulatorTransaction[]>(
    () =>
      simulator
        ? simulator.transactions.filter((t) => t.type === "buy" && t.thesis)
        : [],
    [simulator],
  );

  const tickers = useMemo(
    () => Array.from(new Set(buys.map((b) => b.ticker))),
    [buys],
  );
  const { quotes } = useQuotes(tickers);

  const needsReviewCount = useMemo(
    () => buys.filter((b) => reviewState(b) === "needs-review").length,
    [buys],
  );

  const summary = simulator ? calculateSimulatorSummary(simulator) : null;

  function handleSubmitReview(txId: string) {
    const result = addThesisReview(txId, reviewDraft);
    setSimulator(result.state);
    setFlash({
      type: result.success ? "success" : "error",
      text: result.message,
    });
    if (result.success) {
      setOpenReview(null);
      setReviewDraft("");
    }
    window.setTimeout(() => setFlash(null), 3500);
  }

  if (!hasLoaded) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap">
            <span className="eyebrow">
              <span className="gem" />
              Journal
            </span>
            <h1>Loading…</h1>
          </div>
        </section>
      </main>
    );
  }

  if (!simulator || buys.length === 0) {
    return (
      <main>
        <section className="page-hero">
          <div className="wrap">
            <span className="eyebrow">
              <span className="gem" />
              Journal
            </span>
            <h1>
              Where your <em>thinking</em> compounds.
            </h1>
            <p className="lede">
              Every paper trade in the simulator asks you to write a one-line
              thesis when you buy. Thirty days later, ARCANUM asks if you were
              right. The only investing skill that compounds is the one most
              apps don&apos;t teach.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link className="btn btn-primary" href="/simulator">
                Make your first thesis <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap" style={{ maxWidth: 720 }}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--stroke)",
                padding: 32,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.66rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 14,
                }}
              >
                How it works
              </p>
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 18,
                }}
              >
                {[
                  "Open the simulator and pick any stock or ETF.",
                  "Write one sentence on why you're buying — 10–240 characters.",
                  "Trade executes at the live price. Your thesis is saved.",
                  "30 days later, the journal flags it for review. Add a follow-up note: was your reasoning right? What changed?",
                  "Over months, patterns emerge. You learn which kinds of theses you tend to get right — and which you don't.",
                ].map((step, i) => (
                  <li
                    key={step}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        color: "var(--accent)",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        minWidth: 22,
                      }}
                    >
                      0{i + 1}
                    </span>
                    <span
                      style={{
                        color: "var(--foreground)",
                        fontSize: "0.95rem",
                        lineHeight: 1.65,
                      }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Journal
          </span>
          <h1>
            Your <em>thinking</em>, written down.
          </h1>
          <p className="lede">
            Every buy you&apos;ve made in the simulator with the thesis you
            wrote at the time. Compare the thesis to what actually happened.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
              marginTop: 28,
              maxWidth: 720,
            }}
          >
            <div className="metric-line">
              <div className="label">Theses written</div>
              <div className="value" style={{ color: "var(--accent)" }}>
                {buys.length}
              </div>
            </div>
            <div className="metric-line">
              <div className="label">Needs review</div>
              <div
                className="value"
                style={{
                  color: needsReviewCount > 0 ? "#ff6878" : "var(--muted)",
                }}
              >
                {needsReviewCount}
              </div>
              <div className="detail">Buys older than 30 days</div>
            </div>
            <div className="metric-line">
              <div className="label">Unrealised P&L</div>
              <div
                className="value"
                style={{
                  color:
                    summary && summary.totalGainLoss >= 0
                      ? "var(--accent)"
                      : "#ff6878",
                }}
              >
                {summary ? formatCurrency(summary.totalGainLoss) : "—"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {flash && (
        <section style={{ paddingTop: 16 }}>
          <div className="wrap" style={{ maxWidth: 920 }}>
            <div
              style={{
                borderLeft: `2px solid ${flash.type === "success" ? "var(--accent)" : "#ff6878"}`,
                background: "var(--surface-2)",
                padding: "12px 16px",
                fontSize: "0.92rem",
              }}
            >
              {flash.text}
            </div>
          </div>
        </section>
      )}

      <section className="block">
        <div className="wrap" style={{ maxWidth: 920 }}>
          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {buys.map((tx) => {
              const quote = quotes[tx.ticker];
              const currentPrice = quote?.price ?? getCurrentPrice(tx.ticker);
              const buyPrice = tx.price;
              const pct =
                buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0;
              const positive = pct >= 0;
              const state = reviewState(tx);
              const isOpen = openReview === tx.id;
              const reviewCount = tx.reviews?.length ?? 0;

              return (
                <article
                  key={tx.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--stroke)",
                    padding: 26,
                    display: "grid",
                    gap: 20,
                  }}
                >
                  <header
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                    className="j-header"
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/stocks/${tx.ticker}`}
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontWeight: 600,
                            fontSize: "1.4rem",
                            letterSpacing: "0.03em",
                            color: "var(--foreground)",
                            textDecoration: "none",
                          }}
                        >
                          {tx.ticker}
                        </Link>
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Bought {formatDate(tx.createdAt)} ·{" "}
                          {daysAgo(tx.createdAt)}d ago
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.82rem",
                          color: "var(--muted)",
                          marginTop: 6,
                        }}
                      >
                        {formatCurrency(tx.amount)} · {tx.shares.toFixed(4)} sh
                        @ {formatCurrency(buyPrice)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Since buy
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontWeight: 600,
                          fontSize: "1.4rem",
                          color: positive ? "var(--accent)" : "#ff6878",
                          marginTop: 4,
                          lineHeight: 1,
                        }}
                      >
                        {positive ? "+" : ""}
                        {pct.toFixed(2)}%
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.78rem",
                          color: "var(--muted)",
                          marginTop: 4,
                        }}
                      >
                        {formatCurrency(currentPrice)} now
                      </p>
                    </div>
                  </header>

                  {/* Thesis */}
                  <div
                    style={{
                      borderLeft: "2px solid var(--accent)",
                      background: "var(--surface-2)",
                      padding: "14px 18px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: "0.62rem",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        marginBottom: 8,
                      }}
                    >
                      Thesis on buy day
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontStyle: "italic",
                        fontWeight: 500,
                        fontSize: "1.05rem",
                        lineHeight: 1.55,
                        color: "var(--foreground)",
                      }}
                    >
                      &ldquo;{tx.thesis}&rdquo;
                    </p>
                  </div>

                  {/* Reviews */}
                  {reviewCount > 0 && (
                    <div style={{ display: "grid", gap: 10 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Follow-up notes · {reviewCount}
                      </p>
                      {tx.reviews?.map((r, i) => (
                        <div
                          key={`${r.createdAt}-${i}`}
                          style={{
                            border: "1px solid var(--stroke)",
                            padding: "12px 16px",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.66rem",
                              letterSpacing: "0.14em",
                              color: "var(--muted)",
                              marginBottom: 6,
                            }}
                          >
                            {formatDate(r.createdAt)} · {daysAgo(r.createdAt)}d
                            ago
                          </p>
                          <p
                            style={{
                              fontSize: "0.94rem",
                              lineHeight: 1.6,
                              color: "var(--foreground)",
                            }}
                          >
                            {r.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review action */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {state === "needs-review" && !isOpen && (
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.66rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#ff6878",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 6,
                            height: 6,
                            background: "#ff6878",
                            transform: "rotate(45deg)",
                            display: "inline-block",
                          }}
                        />
                        Needs review
                      </span>
                    )}
                    {state === "fresh" && !isOpen && (
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.66rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Fresh · check back in{" "}
                        {30 - daysAgo(tx.createdAt)} day
                        {30 - daysAgo(tx.createdAt) === 1 ? "" : "s"}
                      </span>
                    )}
                    {state === "reviewed" && !isOpen && (
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.66rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--accent)",
                        }}
                      >
                        ● Reviewed
                      </span>
                    )}
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        if (isOpen) {
                          setOpenReview(null);
                          setReviewDraft("");
                        } else {
                          setOpenReview(tx.id);
                          setReviewDraft("");
                        }
                      }}
                      style={{
                        padding: "0.55em 1em",
                        fontSize: "0.82rem",
                      }}
                      type="button"
                    >
                      {isOpen
                        ? "Cancel"
                        : reviewCount > 0
                        ? "Add another note"
                        : "Add review note"}
                    </button>
                  </div>

                  {isOpen && (
                    <div style={{ display: "grid", gap: 10 }}>
                      <label style={{ display: "grid", gap: 8 }}>
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.62rem",
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "var(--muted)",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Was your reasoning right? What changed?</span>
                          <span
                            style={{
                              color:
                                reviewDraft.length > 480
                                  ? "#ff6878"
                                  : "var(--muted)",
                            }}
                          >
                            {reviewDraft.length} / 480
                          </span>
                        </span>
                        <textarea
                          autoFocus
                          maxLength={480}
                          onChange={(e) => setReviewDraft(e.target.value)}
                          placeholder="e.g. 'Right on direction (AI demand stayed strong) but wrong on speed — took longer to play out than I expected.'"
                          rows={3}
                          style={{
                            width: "100%",
                            background: "var(--surface-2)",
                            border: "1px solid var(--stroke)",
                            color: "var(--foreground)",
                            padding: "12px 14px",
                            fontFamily: "var(--font-inter)",
                            fontSize: "0.94rem",
                            lineHeight: 1.55,
                            outline: "none",
                            resize: "vertical",
                          }}
                          value={reviewDraft}
                        />
                      </label>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSubmitReview(tx.id)}
                          style={{ padding: "0.65em 1.2em", fontSize: "0.88rem" }}
                          type="button"
                        >
                          Save review
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          .j-header {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
