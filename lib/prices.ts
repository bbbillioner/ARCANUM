import COST from "@/data/prices/COST.json";
import MSFT from "@/data/prices/MSFT.json";
import NVDA from "@/data/prices/NVDA.json";
import QQQ from "@/data/prices/QQQ.json";
import VOO from "@/data/prices/VOO.json";
import type { PriceBar, PriceDataset, Timeframe } from "@/types/prices";

const datasets: Record<string, PriceDataset> = {
  VOO: VOO as PriceDataset,
  QQQ: QQQ as PriceDataset,
  MSFT: MSFT as PriceDataset,
  NVDA: NVDA as PriceDataset,
  COST: COST as PriceDataset,
};

export function getPriceDataset(ticker: string): PriceDataset | null {
  return datasets[ticker.toUpperCase()] ?? null;
}

export function getPriceBars(ticker: string): PriceBar[] {
  return getPriceDataset(ticker)?.bars ?? [];
}

export function getLatestBar(ticker: string): PriceBar | null {
  const bars = getPriceBars(ticker);
  return bars.length > 0 ? bars[bars.length - 1] : null;
}

export function getFetchedAt(ticker: string): string | null {
  return getPriceDataset(ticker)?.fetchedAt ?? null;
}

const TIMEFRAME_DAYS: Record<Timeframe, number | null> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "5Y": 1825,
  ALL: null,
};

export function sliceByTimeframe(
  bars: PriceBar[],
  timeframe: Timeframe,
): PriceBar[] {
  const days = TIMEFRAME_DAYS[timeframe];
  if (days === null || bars.length === 0) return bars;

  const lastBar = bars[bars.length - 1];
  const cutoff = new Date(lastBar.date);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return bars.filter((bar) => bar.date >= cutoffStr);
}

export function computeChangePercent(bars: PriceBar[]): number {
  if (bars.length < 2) return 0;
  const first = bars[0].close;
  const last = bars[bars.length - 1].close;
  return ((last - first) / first) * 100;
}

export function formatFetchedAt(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getCurrentPrice(ticker: string): number {
  return getLatestBar(ticker)?.close ?? 0;
}

export function getDailyChangePercent(ticker: string): number {
  const bars = getPriceBars(ticker);
  if (bars.length < 2) return 0;
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  return ((last.close - prev.close) / prev.close) * 100;
}

export function getTimeframeChangePercent(
  ticker: string,
  timeframe: Timeframe,
): number {
  const sliced = sliceByTimeframe(getPriceBars(ticker), timeframe);
  return computeChangePercent(sliced);
}
