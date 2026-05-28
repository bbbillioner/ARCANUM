"use client";

import { useEffect, useMemo, useState } from "react";

import { AllocationBar } from "@/components/ui/allocation-bar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartFull } from "@/components/ui/chart-full";
import { ChartPanel } from "@/components/ui/chart-panel";
import { MetricCard } from "@/components/ui/metric-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Term } from "@/components/ui/term";
import { stockProfiles } from "@/data/stocks";
import { allocationColors } from "@/lib/portfolio";
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
import { cn } from "@/lib/utils";
import type { AllocationSegment, SimulatorState } from "@/types/investing";

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
  const [selectedTicker, setSelectedTicker] = useState(stockProfiles[0]?.ticker ?? "VOO");
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

  const allocationSegments: AllocationSegment[] = useMemo(
    () =>
      simulator
        ? simulator.holdings.map((holding, index) => ({
            label: holding.ticker,
            percentage: holding.allocationPercent,
            colorClass: allocationColors[index % allocationColors.length],
          }))
        : [],
    [simulator],
  );

  const selectedProfile = stockProfiles.find(
    (profile) => profile.ticker === selectedTicker,
  );

  function handleSelectAsset(ticker: string) {
    setSelectedTicker(ticker);
    setMessage(null);
  }

  function handleStartSimulation() {
    const nextSimulator = resetSimulator(startingCash);
    setSimulator(nextSimulator);
    setMessage({
      type: "success",
      text: `Simulation started with ${formatCurrency(startingCash)} in fake cash.`,
    });
  }

  function handleReset() {
    const nextSimulator = resetSimulator(startingCash);
    setSimulator(nextSimulator);
    setMessage({
      type: "success",
      text: "Simulation reset. All positions and history cleared.",
    });
  }

  function handleBuy() {
    const result = buyHolding(selectedTicker, Number(amount));
    setSimulator(result.state);
    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });
  }

  function handleSell() {
    const result = sellHolding(selectedTicker, Number(amount));
    setSimulator(result.state);
    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <Badge>Simulator</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  Practice investing with fake money.
                </h1>
                <p className="max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                  Use the simulator to understand allocation, risk, and
                  portfolio behavior before investing real money.
                </p>
              </div>
            </div>

            <ButtonLink
              className="w-full sm:w-auto"
              href="/dashboard"
              variant="secondary"
            >
              Back to dashboard
            </ButtonLink>
          </div>

          <Card className="border-amber-200/15 bg-amber-200/[0.045]">
            <div className="grid gap-2 text-sm leading-6 text-amber-50/80">
              <p>
                <span className="font-semibold text-amber-50">Fake money.</span>{" "}
                The simulator is a practice environment — no broker, no real
                trades, no real cash.
              </p>
              <p>
                Buys and sells settle against the last close price from the
                historical dataset, so practice fills are realistic but not live.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {!hasLoaded && (
        <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <Card>
            <p className="text-sm text-zinc-400">Loading simulator...</p>
          </Card>
        </section>
      )}

      {hasLoaded && !simulator && (
        <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:px-10">
          <Card className="p-5 sm:p-7">
            <SectionHeader
              eyebrow="Setup"
              title="Choose your starting fake balance."
              description="Start small to practice position sizing, or choose a larger balance to experiment with allocation."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {startingCashOptions.map((option) => (
                <button
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-background",
                    startingCash === option
                      ? "border-teal-300/60 bg-teal-300/12 text-teal-50"
                      : "border-white/10 bg-white/[0.035] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]",
                  )}
                  key={option}
                  onClick={() => setStartingCash(option)}
                  type="button"
                >
                  <span className="block text-lg font-semibold">
                    {formatCurrency(option)}
                  </span>
                  {option === 1000 && (
                    <span className="mt-1 block text-xs text-teal-100">
                      Recommended
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Button className="mt-8 w-full sm:w-auto" onClick={handleStartSimulation}>
              Start simulation
            </Button>
          </Card>
        </section>
      )}

      {hasLoaded && simulator && summary && (
        <>
          <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                eyebrow="Portfolio Summary"
                title="Your fake-money portfolio."
                description={
                  <>
                    Buying and selling are dollar-based and support{" "}
                    <Term>fractional shares</Term>.
                  </>
                }
              />
              <Button
                className="w-full sm:w-auto"
                onClick={handleReset}
                variant="secondary"
              >
                Reset simulation
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total value"
                value={formatCurrency(summary.totalPortfolioValue)}
                detail="Cash plus holdings"
              />
              <MetricCard
                label="Cash balance"
                value={formatCurrency(summary.cashBalance)}
                detail={`${formatPercent(summary.cashAllocationPercent)} cash`}
              />
              <MetricCard
                label="Invested value"
                value={formatCurrency(summary.investedValue)}
                detail={`${formatPercent(summary.investedAllocationPercent)} invested`}
              />
              <MetricCard
                label="Total gain/loss"
                value={formatCurrency(summary.totalGainLoss)}
                detail={formatPercent(summary.totalGainLossPercent)}
              />
            </div>
          </section>

          <section className="border-y border-white/10 bg-white/[0.025]">
            <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
              <SectionHeader
                eyebrow="Explore Assets"
                title="Browse before you practice."
                description="Compare ETFs and individual stocks, then select an asset to see the educational chart and trade with fake money."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {stockProfiles.map((profile) => {
                  const isSelected = profile.ticker === selectedTicker;
                  const currentPrice = getCurrentPrice(profile.ticker);
                  const changeSixMonths = getTimeframeChangePercent(
                    profile.ticker,
                    "6M",
                  );
                  const isPositive = changeSixMonths >= 0;
                  const panelBars = sliceByTimeframe(
                    getPriceBars(profile.ticker),
                    "6M",
                  );

                  return (
                    <Card
                      className={cn(
                        "flex h-full flex-col gap-4 p-4 transition",
                        isSelected
                          ? "border-teal-300/45 bg-teal-300/[0.08]"
                          : "hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                      key={profile.ticker}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-2xl font-semibold text-white">
                            {profile.ticker}
                          </p>
                          <h3 className="mt-1 text-sm font-medium leading-5 text-zinc-300">
                            {profile.name}
                          </h3>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-zinc-200">
                          {profile.assetType}
                        </span>
                      </div>

                      <ChartPanel
                        bars={panelBars}
                        height={90}
                        positive={isPositive}
                      />

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold text-white">
                            {formatCurrency(currentPrice)}
                          </p>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isPositive ? "text-teal-100" : "text-rose-100",
                            )}
                          >
                            {formatChangePercent(changeSixMonths)}{" "}
                            <span className="text-zinc-500">6M</span>
                          </p>
                        </div>
                        <p className="text-xs leading-5 text-zinc-500">
                          {profile.sector}
                        </p>
                        <RiskBadge level={profile.beginnerRiskLevel} />
                      </div>

                      <p className="min-h-20 text-sm leading-6 text-zinc-400">
                        {profile.beginnerSummary}
                      </p>

                      <div className="mt-auto grid gap-2">
                        <Button
                          className="w-full"
                          onClick={() => handleSelectAsset(profile.ticker)}
                          variant={isSelected ? "primary" : "secondary"}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                        <ButtonLink
                          className="w-full"
                          href={`/stocks/${profile.ticker}`}
                          variant="secondary"
                        >
                          Research
                        </ButtonLink>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <Card title="Selected asset" variant="primary">
              {selectedProfile ? (
                <div className="grid gap-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl font-semibold text-white">
                          {selectedProfile.ticker}
                        </h2>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-zinc-200">
                          {selectedProfile.assetType}
                        </span>
                        <RiskBadge level={selectedProfile.beginnerRiskLevel} />
                      </div>
                      <p className="mt-2 text-lg font-semibold text-zinc-100">
                        {selectedProfile.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {selectedProfile.beginnerSummary}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-zinc-500">Last close</p>
                      <p className="text-2xl font-semibold text-white">
                        {formatCurrency(getCurrentPrice(selectedProfile.ticker))}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-sm font-semibold",
                          getTimeframeChangePercent(selectedProfile.ticker, "6M") >= 0
                            ? "text-teal-100"
                            : "text-rose-100",
                        )}
                      >
                        {formatChangePercent(
                          getTimeframeChangePercent(selectedProfile.ticker, "6M"),
                        )}{" "}
                        <span className="text-zinc-500">6M</span>
                      </p>
                    </div>
                  </div>

                  <ChartFull
                    bars={getPriceBars(selectedProfile.ticker)}
                    defaultTimeframe="1Y"
                  />

                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm font-medium text-zinc-300">
                      Dollar amount
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-zinc-500">
                          $
                        </span>
                        <input
                          className="h-12 w-full rounded-2xl border border-white/15 bg-white/[0.06] pl-8 pr-4 text-base font-semibold text-white shadow-inner shadow-black/30 outline-none transition focus:border-teal-300/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-teal-300/40"
                          min="0"
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="100"
                          step="1"
                          type="number"
                          value={amount}
                        />
                      </div>
                    </label>

                    {message && (
                      <p
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm leading-6",
                          message.type === "success"
                            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                            : "border-rose-300/20 bg-rose-300/10 text-rose-100",
                        )}
                      >
                        {message.text}
                      </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button className="w-full" onClick={handleBuy}>
                        Buy
                      </Button>
                      <Button
                        className="w-full"
                        onClick={handleSell}
                        variant="secondary"
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-6 text-zinc-400">
                  Select an asset to view its static chart and practice a fake
                  buy or sell.
                </p>
              )}
            </Card>

            <Card title="Allocation">
                {simulator.holdings.length > 0 ? (
                  <>
                    <AllocationBar segments={allocationSegments} />
                    <div className="mt-6 grid gap-3">
                      {simulator.holdings.map((holding) => (
                        <div
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                          key={holding.ticker}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold text-white">
                              {holding.ticker}
                            </p>
                            <p className="text-sm font-semibold text-teal-100">
                              {formatPercent(holding.allocationPercent)}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-zinc-400">
                            {formatCurrency(holding.marketValue)} market value
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-zinc-400">
                    No holdings yet. Buy a small dollar amount to see your
                    allocation appear here.
                  </p>
                )}
              </Card>
          </section>

          <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
            <SectionHeader
              eyebrow="Holdings"
              title="Positions you are practicing with."
              description={
                <>
                  The simulator keeps <Term>cost basis</Term>, market value,
                  and unrealized gain/loss visible.
                </>
              }
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {simulator.holdings.length > 0 ? (
                simulator.holdings.map((holding) => (
                  <Card className="p-5" key={holding.ticker}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-3xl font-semibold text-white">
                          {holding.ticker}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-zinc-100">
                          {holding.name}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          holding.unrealizedGainLoss >= 0
                            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                            : "border-rose-300/20 bg-rose-300/10 text-rose-100",
                        )}
                      >
                        {formatCurrency(holding.unrealizedGainLoss)}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <MetricCard
                        label="Shares"
                        value={holding.shares.toFixed(4)}
                        detail="Fractional"
                      />
                      <MetricCard
                        label="Avg cost"
                        value={formatCurrency(holding.averageCost)}
                        detail="Per share"
                      />
                      <MetricCard
                        label="Market value"
                        value={formatCurrency(holding.marketValue)}
                        detail={formatPercent(holding.unrealizedGainLossPercent)}
                      />
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-sm leading-6 text-zinc-400">
                    Your simulator portfolio is empty. Start with a small ETF or
                    stock purchase to practice.
                  </p>
                </Card>
              )}
            </div>
          </section>

          <section className="border-y border-white/10 bg-white/[0.025]">
            <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
              <SectionHeader
                eyebrow="Transaction History"
                title="Your practice trades."
                description="Every buy or sell is recorded locally in this browser."
              />
              <div className="mt-8 grid gap-3">
                {simulator.transactions.length > 0 ? (
                  simulator.transactions.map((transaction) => (
                    <Card className="p-4" key={transaction.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                            {transaction.type}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {transaction.ticker} - {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="text-sm leading-6 text-zinc-400 sm:text-right">
                          <p>{transaction.shares.toFixed(6)} shares</p>
                          <p>
                            {formatCurrency(transaction.price)} per share -{" "}
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <p className="text-sm leading-6 text-zinc-400">
                      No transactions yet. Your first buy or sell will appear
                      here.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
