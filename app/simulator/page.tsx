"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ChartFull } from "@/components/ui/chart-full";
import { ChartPanel } from "@/components/ui/chart-panel";
import { stockProfiles } from "@/data/stocks";
import {
  getCurrentPrice,
  getPriceBars,
  getTimeframeChangePercent,
  sliceByTimeframe,
} from "@/lib/prices";
import {
  buyHolding,
  calculateSimulatorSummary,
  getSimulator,
  resetSimulator,
  sellHolding,
} from "@/lib/simulator";
import type { SimulatorState } from "@/types/investing";

const startingCashOptions = [100, 500, 1000, 5000, 10000, 100000];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatChangePercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SimulatorPage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [simulator, setSimulator] = useState<SimulatorState | null>(null);
  const [startingCash, setStartingCash] = useState(1000);
  const [selectedTicker, setSelectedTicker] = useState(
    stockProfiles[0]?.ticker ?? "VOO",
  );
  const [amount, setAmount] = useState("100");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setSimulator(getSimulator());
        setHasLoaded(true);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const summary = useMemo(
    () => (simulator ? calculateSimulatorSummary(simulator) : null),
    [simulator],
  );

  const selectedProfile = stockProfiles.find(
    (p) => p.ticker === selectedTicker,
  );

  function handleSelectAsset(ticker: string) {
    setSelectedTicker(ticker);
    setMessage(null);
  }

  function handleStartSimulation() {
    const next = resetSimulator(startingCash);
    setSimulator(next);
    setMessage({
      type: "success",
      text: `Simulation started with ${formatCurrency(startingCash)} in fake cash.`,
    });
  }

  function handleReset() {
    const next = resetSimulator(startingCash);
    setSimulator(next);
    setMessage({
      type: "success",
      text: "Simulation reset. All positions and history cleared.",
    });
  }

  function handleBuy() {
    const result = buyHolding(selectedTicker, Number(amount));
    setSimulator(result.state);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
  }

  function handleSell() {
    const result = sellHolding(selectedTicker, Number(amount));
    setSimulator(result.state);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
  }

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">
            <span className="gem" />
            Simulator · Fake money
          </span>
          <h1>
            Practice <em>before</em> you commit.
          </h1>
          <p className="lede">
            Use the simulator to understand allocation, risk, and portfolio
            behavior. Buys and sells settle at the last close from the
            historical dataset — realistic, but not live.
          </p>
          <div
            style={{
              borderLeft: "2px solid var(--accent)",
              background: "var(--surface-2)",
              padding: "12px 16px",
              marginTop: 24,
              maxWidth: 640,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 6,
              }}
            >
              Fake money
            </p>
            <p style={{ fontSize: "0.92rem", color: "var(--foreground)", lineHeight: 1.6 }}>
              No broker, no real trades, no real cash. Reset any time.
            </p>
          </div>
        </div>
      </section>

      {!hasLoaded && (
        <section className="block">
          <div className="wrap">
            <p style={{ color: "var(--muted)" }}>Loading simulator…</p>
          </div>
        </section>
      )}

      {hasLoaded && !simulator && (
        <section className="block">
          <div className="wrap" style={{ maxWidth: 720 }}>
            <div className="sec-head">
              <span className="eyebrow">
                <span className="gem" />
                Setup
              </span>
              <h2>
                Choose your <em>starting balance.</em>
              </h2>
              <p>
                Start small to practice position sizing, or pick a larger
                balance to experiment with allocation.
              </p>
            </div>
            <div
              className="card-line"
              style={{ padding: 28 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 10,
                }}
              >
                {startingCashOptions.map((option) => {
                  const selected = startingCash === option;
                  return (
                    <button
                      className="cash-option"
                      data-selected={selected}
                      key={option}
                      onClick={() => setStartingCash(option)}
                      type="button"
                    >
                      <span className="value">{formatCurrency(option)}</span>
                      {option === 1000 && (
                        <span className="rec">Recommended</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                className="btn btn-primary"
                onClick={handleStartSimulation}
                style={{ marginTop: 24 }}
                type="button"
              >
                Start simulation <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {hasLoaded && simulator && summary && (
        <>
          {/* PORTFOLIO SUMMARY */}
          <section className="block">
            <div className="wrap">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: 24,
                  flexWrap: "wrap",
                  marginBottom: 32,
                }}
              >
                <div className="sec-head" style={{ marginBottom: 0 }}>
                  <span className="eyebrow">
                    <span className="gem" />
                    Portfolio summary
                  </span>
                  <h2>
                    Your <em>fake-money</em> portfolio.
                  </h2>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={handleReset}
                  type="button"
                >
                  Reset simulation
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14,
                }}
              >
                <div className="metric-line">
                  <div className="label">Total value</div>
                  <div className="value" style={{ color: "var(--accent)" }}>
                    {formatCurrency(summary.totalPortfolioValue)}
                  </div>
                  <div className="detail">Cash plus holdings</div>
                </div>
                <div className="metric-line">
                  <div className="label">Cash balance</div>
                  <div className="value">
                    {formatCurrency(summary.cashBalance)}
                  </div>
                  <div className="detail">
                    {formatPercent(summary.cashAllocationPercent)} cash
                  </div>
                </div>
                <div className="metric-line">
                  <div className="label">Invested value</div>
                  <div className="value">
                    {formatCurrency(summary.investedValue)}
                  </div>
                  <div className="detail">
                    {formatPercent(summary.investedAllocationPercent)} invested
                  </div>
                </div>
                <div className="metric-line">
                  <div className="label">Total gain/loss</div>
                  <div
                    className="value"
                    style={{
                      color:
                        summary.totalGainLoss >= 0
                          ? "var(--accent)"
                          : "#ff6878",
                    }}
                  >
                    {formatCurrency(summary.totalGainLoss)}
                  </div>
                  <div className="detail">
                    {formatPercent(summary.totalGainLossPercent)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ASSET BROWSER */}
          <section className="block" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <span className="eyebrow">
                  <span className="gem" />
                  Explore assets
                </span>
                <h2>
                  Browse, then <em>practice.</em>
                </h2>
                <p>
                  Compare ETFs and individual stocks, then select an asset to
                  see the chart and trade with fake money.
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 1,
                  background: "var(--stroke)",
                  border: "1px solid var(--stroke)",
                }}
              >
                {stockProfiles.map((profile) => {
                  const isSelected = profile.ticker === selectedTicker;
                  const currentPrice = getCurrentPrice(profile.ticker);
                  const change6M = getTimeframeChangePercent(profile.ticker, "6M");
                  const isPositive = change6M >= 0;
                  const panelBars = sliceByTimeframe(
                    getPriceBars(profile.ticker),
                    "6M",
                  );
                  return (
                    <button
                      className="asset-card"
                      data-selected={isSelected}
                      key={profile.ticker}
                      onClick={() => handleSelectAsset(profile.ticker)}
                      type="button"
                    >
                      <div className="ac-header">
                        <div>
                          <p className="ac-ticker">{profile.ticker}</p>
                          <p className="ac-type">{profile.assetType}</p>
                        </div>
                        <p
                          className="ac-change"
                          style={{
                            color: isPositive ? "var(--accent)" : "#ff6878",
                          }}
                        >
                          {formatChangePercent(change6M)}
                        </p>
                      </div>
                      <ChartPanel
                        bars={panelBars}
                        height={70}
                        positive={isPositive}
                      />
                      <div className="ac-price">
                        <span>{formatCurrency(currentPrice)}</span>
                        <span className="ac-tf">6M</span>
                      </div>
                      <p className="ac-name">{profile.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* TRADE TICKET + ALLOCATION */}
          <section className="block" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.8fr",
                  gap: 18,
                }}
                className="sim-2col"
              >
                {/* Selected asset / trade */}
                <div
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--stroke)",
                    padding: 26,
                  }}
                >
                  {selectedProfile ? (
                    <div style={{ display: "grid", gap: 20 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 16,
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
                              marginBottom: 6,
                            }}
                          >
                            Selected asset
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontWeight: 600,
                              fontSize: "2rem",
                              letterSpacing: "0.03em",
                              lineHeight: 1,
                            }}
                          >
                            {selectedProfile.ticker}
                          </p>
                          <p
                            style={{
                              fontSize: "0.92rem",
                              color: "var(--muted)",
                              marginTop: 6,
                            }}
                          >
                            {selectedProfile.name}
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
                            Last close
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontWeight: 600,
                              fontSize: "1.5rem",
                              color: "var(--accent)",
                              marginTop: 6,
                            }}
                          >
                            {formatCurrency(getCurrentPrice(selectedProfile.ticker))}
                          </p>
                        </div>
                      </div>

                      <ChartFull
                        bars={getPriceBars(selectedProfile.ticker)}
                        defaultTimeframe="1Y"
                      />

                      <div style={{ display: "grid", gap: 14 }}>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.66rem",
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              color: "var(--muted)",
                            }}
                          >
                            Dollar amount
                          </span>
                          <div style={{ position: "relative" }}>
                            <span
                              style={{
                                position: "absolute",
                                inset: "0 auto 0 16px",
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "var(--font-jetbrains-mono)",
                                color: "var(--muted)",
                                pointerEvents: "none",
                              }}
                            >
                              $
                            </span>
                            <input
                              className="trade-input"
                              min="0"
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="100"
                              step="1"
                              type="number"
                              value={amount}
                            />
                          </div>
                        </label>

                        {message && (
                          <div
                            style={{
                              borderLeft: `2px solid ${message.type === "success" ? "var(--accent)" : "#ff6878"}`,
                              background: "var(--surface-2)",
                              padding: "10px 14px",
                              fontSize: "0.88rem",
                              color: "var(--foreground)",
                            }}
                          >
                            {message.text}
                          </div>
                        )}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 10,
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            onClick={handleBuy}
                            type="button"
                          >
                            Buy
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={handleSell}
                            type="button"
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "var(--muted)" }}>
                      Select an asset to trade.
                    </p>
                  )}
                </div>

                {/* Allocation */}
                <div
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--stroke)",
                    padding: 26,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.66rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: 18,
                    }}
                  >
                    Allocation
                  </p>
                  {simulator.holdings.length > 0 ? (
                    <div style={{ display: "grid", gap: 14 }}>
                      {simulator.holdings.map((holding) => (
                        <div key={holding.ticker}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-jetbrains-mono)",
                                fontWeight: 600,
                              }}
                            >
                              {holding.ticker}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-jetbrains-mono)",
                                color: "var(--accent)",
                              }}
                            >
                              {formatPercent(holding.allocationPercent)}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 2,
                              background: "var(--stroke)",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: `${holding.allocationPercent}%`,
                                background: "var(--accent)",
                              }}
                            />
                          </div>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.72rem",
                              color: "var(--muted)",
                              marginTop: 4,
                            }}
                          >
                            {formatCurrency(holding.marketValue)} market value
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
                      No holdings yet. Buy a small dollar amount to see your
                      allocation appear here.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* HOLDINGS */}
          <section className="block" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <span className="eyebrow">
                  <span className="gem" />
                  Holdings
                </span>
                <h2>
                  Positions you&apos;re <em>practicing with.</em>
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {simulator.holdings.length > 0 ? (
                  simulator.holdings.map((holding) => (
                    <div className="card-line" key={holding.ticker}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 14,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontWeight: 600,
                              fontSize: "1.6rem",
                              lineHeight: 1,
                            }}
                          >
                            {holding.ticker}
                          </p>
                          <p
                            style={{
                              fontSize: "0.88rem",
                              color: "var(--muted)",
                              marginTop: 4,
                            }}
                          >
                            {holding.name}
                          </p>
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.85rem",
                            padding: "3px 9px",
                            border: `1px solid ${holding.unrealizedGainLoss >= 0 ? "var(--accent)" : "#ff6878"}`,
                            color:
                              holding.unrealizedGainLoss >= 0
                                ? "var(--accent)"
                                : "#ff6878",
                          }}
                        >
                          {formatCurrency(holding.unrealizedGainLoss)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 0,
                          borderTop: "1px solid var(--stroke)",
                          paddingTop: 14,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.6rem",
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              color: "var(--muted)",
                            }}
                          >
                            Shares
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.92rem",
                              marginTop: 4,
                            }}
                          >
                            {holding.shares.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.6rem",
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              color: "var(--muted)",
                            }}
                          >
                            Avg cost
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.92rem",
                              marginTop: 4,
                            }}
                          >
                            {formatCurrency(holding.averageCost)}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.6rem",
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              color: "var(--muted)",
                            }}
                          >
                            Value
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: "0.92rem",
                              color: "var(--accent)",
                              marginTop: 4,
                            }}
                          >
                            {formatCurrency(holding.marketValue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card-line">
                    <p style={{ color: "var(--muted)" }}>
                      Your simulator portfolio is empty. Start with a small ETF
                      or stock purchase to practice.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* TRANSACTION HISTORY */}
          <section className="block" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <span className="eyebrow">
                  <span className="gem" />
                  Transaction history
                </span>
                <h2>
                  Your <em>practice</em> trades.
                </h2>
              </div>
              <div style={{ display: "grid", gap: 1, background: "var(--stroke)", border: "1px solid var(--stroke)" }}>
                {simulator.transactions.length > 0 ? (
                  simulator.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        background: "var(--surface)",
                        padding: "16px 24px",
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: 18,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.66rem",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: tx.type === "buy" ? "var(--accent)" : "#ff6878",
                          fontWeight: 600,
                        }}
                      >
                        {tx.type}
                      </span>
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontWeight: 600,
                            fontSize: "1.05rem",
                          }}
                        >
                          {tx.ticker} · {formatCurrency(tx.amount)}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: "0.78rem",
                            color: "var(--muted)",
                            marginTop: 2,
                          }}
                        >
                          {tx.shares.toFixed(6)} sh @{" "}
                          {formatCurrency(tx.price)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: "0.78rem",
                          color: "var(--muted)",
                        }}
                      >
                        {formatDate(tx.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ background: "var(--surface)", padding: 24 }}>
                    <p style={{ color: "var(--muted)" }}>
                      No transactions yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <style>{`
        .cash-option {
          background: transparent;
          border: 1px solid var(--stroke);
          padding: 18px 16px;
          color: var(--foreground);
          cursor: pointer;
          text-align: left;
          font-family: var(--font-inter);
          transition: all 0.2s ease;
        }
        .cash-option:hover {
          border-color: var(--stroke-strong);
          background: var(--surface-2);
        }
        .cash-option[data-selected="true"] {
          border-color: var(--accent);
          background: rgba(0, 229, 168, 0.06);
        }
        .cash-option .value {
          display: block;
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 1.05rem;
        }
        .cash-option .rec {
          display: block;
          font-family: var(--font-jetbrains-mono);
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-top: 6px;
        }
        .asset-card {
          background: var(--surface);
          border: none;
          padding: 22px 20px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: inherit;
          font-family: var(--font-inter);
          transition: background 0.2s ease;
        }
        .asset-card:hover {
          background: var(--surface-2);
        }
        .asset-card[data-selected="true"] {
          background: var(--surface-2);
          box-shadow: inset 2px 0 0 var(--accent);
        }
        .ac-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .ac-ticker {
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 1.3rem;
          letter-spacing: 0.03em;
        }
        .ac-type {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 4px;
        }
        .ac-change {
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 0.85rem;
        }
        .ac-price {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-family: var(--font-jetbrains-mono);
          font-weight: 600;
          font-size: 1.05rem;
        }
        .ac-tf {
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .ac-name {
          font-size: 0.82rem;
          color: var(--muted);
          line-height: 1.5;
        }
        .trade-input {
          width: 100%;
          height: 48px;
          background: var(--surface-2);
          border: 1px solid var(--stroke);
          color: var(--foreground);
          padding: 0 16px 0 28px;
          font-family: var(--font-jetbrains-mono);
          font-size: 1.05rem;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .trade-input:focus {
          border-color: var(--accent);
          background: var(--surface);
        }
        @media (max-width: 880px) {
          .sim-2col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
