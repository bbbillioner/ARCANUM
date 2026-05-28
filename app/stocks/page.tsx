import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartPanel } from "@/components/ui/chart-panel";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { stockProfiles } from "@/data/stocks";
import {
  formatFetchedAt,
  getCurrentPrice,
  getFetchedAt,
  getPriceBars,
  getTimeframeChangePercent,
  sliceByTimeframe,
} from "@/lib/prices";
import type { StockProfile } from "@/types/investing";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatChangePercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function StockCard({ profile }: { profile: StockProfile }) {
  const currentPrice = getCurrentPrice(profile.ticker);
  const change1Y = getTimeframeChangePercent(profile.ticker, "1Y");
  const change6M = getTimeframeChangePercent(profile.ticker, "6M");
  const change1M = getTimeframeChangePercent(profile.ticker, "1M");
  const panelBars = sliceByTimeframe(getPriceBars(profile.ticker), "1Y");
  const positive = change1Y >= 0;

  return (
    <Link
      className="group block rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07]"
      href={`/stocks/${profile.ticker}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-white">{profile.ticker}</p>
          <p className="mt-1 text-sm font-medium text-zinc-300">
            {profile.name}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{profile.sector}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-zinc-200">
            {profile.assetType}
          </span>
          <RiskBadge level={profile.beginnerRiskLevel} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold text-white">
          {formatCurrency(currentPrice)}
        </p>
        <p
          className={`text-sm font-semibold ${positive ? "text-teal-200" : "text-rose-200"}`}
        >
          {formatChangePercent(change1Y)}{" "}
          <span className="text-zinc-500">1Y</span>
        </p>
      </div>

      <div className="mt-4">
        <ChartPanel bars={panelBars} height={110} positive={positive} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "1M", value: change1M },
          { label: "6M", value: change6M },
          { label: "1Y", value: change1Y },
        ].map((tf) => (
          <div
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2"
            key={tf.label}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              {tf.label}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${tf.value >= 0 ? "text-teal-100" : "text-rose-100"}`}
            >
              {formatChangePercent(tf.value)}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
        {profile.beginnerSummary}
      </p>

      <p className="mt-4 text-xs font-medium text-teal-200 transition group-hover:text-teal-100">
        Open research →
      </p>
    </Link>
  );
}

export default function StocksPage() {
  const etfs = stockProfiles.filter((p) => p.assetType === "ETF");
  const stocks = stockProfiles.filter((p) => p.assetType === "Stock");

  const firstTicker = stockProfiles[0]?.ticker;
  const fetchedAt = firstTicker ? getFetchedAt(firstTicker) : null;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <Badge>Research</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  Stock and ETF research.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                  Browse the stocks and ETFs ARCANUM uses to teach portfolio
                  decisions. Real five-year prices from Yahoo Finance.
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

          {fetchedAt && (
            <p className="text-xs text-zinc-500">
              Prices are historical snapshots from Yahoo Finance as of{" "}
              <span className="text-zinc-300">{formatFetchedAt(fetchedAt)}</span>.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="ETFs"
          title="Diversified building blocks."
          description="Exchange-traded funds give exposure to many companies in one holding. ARCANUM uses these as the structural foundation of starter portfolios."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {etfs.map((profile) => (
            <StockCard key={profile.ticker} profile={profile} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Individual stocks"
            title="Single companies, single theses."
            description="Owning one company concentrates outcome on that company's decisions, market, and execution. Each profile explains the thesis and risk."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stocks.map((profile) => (
              <StockCard key={profile.ticker} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <Card className="p-7 text-center" variant="primary">
          <Badge>Next step</Badge>
          <h2 className="mt-6 text-3xl font-semibold text-white">
            Practice using these in a portfolio.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            The simulator lets you allocate fake cash across any of these assets
            and watch cost basis, market value, and unrealized gain or loss
            update against real historical prices.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/simulator">Open simulator</ButtonLink>
            <ButtonLink href="/learn" variant="secondary">
              Learn the concepts first
            </ButtonLink>
          </div>
        </Card>
      </section>
    </main>
  );
}
