import AAPL from "@/data/prices/AAPL.json";
import AMZN from "@/data/prices/AMZN.json";
import BA from "@/data/prices/BA.json";
import BND from "@/data/prices/BND.json";
import BRK_B from "@/data/prices/BRK-B.json";
import COST from "@/data/prices/COST.json";
import DIS from "@/data/prices/DIS.json";
import GOOGL from "@/data/prices/GOOGL.json";
import HD from "@/data/prices/HD.json";
import JNJ from "@/data/prices/JNJ.json";
import JPM from "@/data/prices/JPM.json";
import KO from "@/data/prices/KO.json";
import LLY from "@/data/prices/LLY.json";
import MA from "@/data/prices/MA.json";
import MCD from "@/data/prices/MCD.json";
import META from "@/data/prices/META.json";
import MSFT from "@/data/prices/MSFT.json";
import NKE from "@/data/prices/NKE.json";
import NVDA from "@/data/prices/NVDA.json";
import QQQ from "@/data/prices/QQQ.json";
import SCHD from "@/data/prices/SCHD.json";
import SPY from "@/data/prices/SPY.json";
import TSLA from "@/data/prices/TSLA.json";
import UNH from "@/data/prices/UNH.json";
import V from "@/data/prices/V.json";
import VEA from "@/data/prices/VEA.json";
import VOO from "@/data/prices/VOO.json";
import VTI from "@/data/prices/VTI.json";
import WMT from "@/data/prices/WMT.json";
import XOM from "@/data/prices/XOM.json";
import type {
  ClosePoint,
  IndexPoint,
  PriceBar,
  PriceDataset,
  Timeframe,
} from "@/types/prices";

const datasets: Record<string, PriceDataset> = {
  AAPL: AAPL as PriceDataset,
  AMZN: AMZN as PriceDataset,
  BA: BA as PriceDataset,
  BND: BND as PriceDataset,
  "BRK-B": BRK_B as PriceDataset,
  COST: COST as PriceDataset,
  DIS: DIS as PriceDataset,
  GOOGL: GOOGL as PriceDataset,
  HD: HD as PriceDataset,
  JNJ: JNJ as PriceDataset,
  JPM: JPM as PriceDataset,
  KO: KO as PriceDataset,
  LLY: LLY as PriceDataset,
  MA: MA as PriceDataset,
  MCD: MCD as PriceDataset,
  META: META as PriceDataset,
  MSFT: MSFT as PriceDataset,
  NKE: NKE as PriceDataset,
  NVDA: NVDA as PriceDataset,
  QQQ: QQQ as PriceDataset,
  SCHD: SCHD as PriceDataset,
  SPY: SPY as PriceDataset,
  TSLA: TSLA as PriceDataset,
  UNH: UNH as PriceDataset,
  V: V as PriceDataset,
  VEA: VEA as PriceDataset,
  VOO: VOO as PriceDataset,
  VTI: VTI as PriceDataset,
  WMT: WMT as PriceDataset,
  XOM: XOM as PriceDataset,
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

/** When the snapshot script ran. Not a market date: use getLastBarDate for "as of" labels. */
export function getFetchedAt(ticker: string): string | null {
  return getPriceDataset(ticker)?.fetchedAt ?? null;
}

/** Date (YYYY-MM-DD) of the last completed session in the snapshot. */
export function getLastBarDate(ticker: string): string | null {
  return getLatestBar(ticker)?.date ?? null;
}

/** Oldest last-bar date across tickers, so a combined "as of" never overstates freshness. */
export function getOldestLastBarDate(tickers: string[]): string | null {
  let oldest: string | null = null;
  for (const ticker of tickers) {
    const date = getLastBarDate(ticker);
    if (date && (oldest === null || date < oldest)) oldest = date;
  }
  return oldest;
}

/** Formats a bar date (YYYY-MM-DD) as "Oct 26, 2026", with no time-zone drift. */
export function formatBarDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

const TIMEFRAME_DAYS: Record<Timeframe, number | null> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "5Y": 1825,
  ALL: null,
};

function timeframeCutoff(bars: PriceBar[], timeframe: Timeframe): string | null {
  const days = TIMEFRAME_DAYS[timeframe];
  if (days === null || bars.length === 0) return null;

  const cutoff = new Date(`${bars[bars.length - 1].date}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff.toISOString().slice(0, 10);
}

/** Bars dated on or after the timeframe's start, for charting. */
export function sliceByTimeframe(
  bars: PriceBar[],
  timeframe: Timeframe,
): PriceBar[] {
  const cutoff = timeframeCutoff(bars, timeframe);
  if (cutoff === null) return bars;
  return bars.filter((bar) => bar.date >= cutoff);
}

/**
 * Bars for measuring a timeframe's return. Starts at the last close on or
 * before the timeframe's start date (e.g. the Friday before a weekend
 * cutoff), so the first day's move is counted.
 */
function sliceForReturn(bars: PriceBar[], timeframe: Timeframe): PriceBar[] {
  const cutoff = timeframeCutoff(bars, timeframe);
  if (cutoff === null) return bars;
  let start = 0;
  for (let i = 0; i < bars.length && bars[i].date <= cutoff; i += 1) start = i;
  return bars.slice(start);
}

function percentChange(first: number, last: number): number {
  if (!(first > 0)) return 0;
  return ((last - first) / first) * 100;
}

/** Price return: change in split-adjusted close. Excludes dividends. */
export function computePriceReturnPercent(bars: PriceBar[]): number {
  if (bars.length < 2) return 0;
  return percentChange(bars[0].close, bars[bars.length - 1].close);
}

/** Total return: change in adjClose, i.e. with dividends reinvested. */
export function computeTotalReturnPercent(bars: PriceBar[]): number {
  if (bars.length < 2) return 0;
  return percentChange(bars[0].adjClose, bars[bars.length - 1].adjClose);
}

/**
 * @deprecated Price return only (excludes dividends). Use
 * computeTotalReturnPercent for performance figures, or
 * computePriceReturnPercent where price return is intended (and label it).
 */
export const computeChangePercent = computePriceReturnPercent;

/** @deprecated Use formatBarDate(getLastBarDate(ticker)) for "as of" labels. */
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

/** Last snapshot session vs the one before it (a daily price change). */
export function getDailyChangePercent(ticker: string): number {
  const bars = getPriceBars(ticker);
  if (bars.length < 2) return 0;
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  return ((last.close - prev.close) / prev.close) * 100;
}

/** Price return over a timeframe (excludes dividends). Label it "price return". */
export function getTimeframePriceReturnPercent(
  ticker: string,
  timeframe: Timeframe,
): number {
  return computePriceReturnPercent(
    sliceForReturn(getPriceBars(ticker), timeframe),
  );
}

/** Total return over a timeframe (dividends reinvested). Use for performance figures. */
export function getTimeframeTotalReturnPercent(
  ticker: string,
  timeframe: Timeframe,
): number {
  return computeTotalReturnPercent(
    sliceForReturn(getPriceBars(ticker), timeframe),
  );
}

/**
 * @deprecated Price return only (excludes dividends). Use
 * getTimeframeTotalReturnPercent for performance figures, or
 * getTimeframePriceReturnPercent where price return is intended (and label it).
 */
export const getTimeframeChangePercent = getTimeframePriceReturnPercent;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Evenly thinned closes for small sparklines. Always keeps the first and the
 * last bar, so the line starts and ends on real closes.
 */
export function toSparkline(bars: PriceBar[], maxPoints = 64): ClosePoint[] {
  const points = bars.map((bar) => ({ date: bar.date, close: bar.close }));
  if (points.length <= maxPoints || maxPoints < 2) return points;

  const step = (points.length - 1) / (maxPoints - 1);
  const sampled: ClosePoint[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    sampled.push(points[Math.round(i * step)]);
  }
  return sampled;
}

// Monday-based week number counted from the Unix epoch (a Thursday).
function weekKey(date: string): number {
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  return Math.floor((day + 3) / 7);
}

/** The first bar, then the last bar of each calendar week (weekly closes). */
export function sampleWeekly<T extends { date: string }>(bars: T[]): T[] {
  if (bars.length <= 2) return bars;
  const sampled: T[] = [bars[0]];
  for (let i = 1; i < bars.length; i += 1) {
    const isLast = i === bars.length - 1;
    if (isLast || weekKey(bars[i].date) !== weekKey(bars[i + 1].date)) {
      sampled.push(bars[i]);
    }
  }
  return sampled;
}

/**
 * Growth of 100 with dividends reinvested (adjClose), starting at the first
 * bar. A value of 182 means 100 grew to 182 in total return.
 */
export function computeTotalReturnIndex(bars: PriceBar[]): IndexPoint[] {
  const base = bars[0]?.adjClose;
  if (!base || base <= 0) return [];
  return bars.map((bar) => ({
    date: bar.date,
    value: round2((bar.adjClose / base) * 100),
  }));
}

/**
 * Weekly total-return indexes for two tickers over their common date range,
 * both starting at 100 on the same date.
 */
export function getTotalReturnComparison(
  aTicker: string,
  bTicker: string,
): { a: IndexPoint[]; b: IndexPoint[] } {
  const aBars = getPriceBars(aTicker);
  const bBars = getPriceBars(bTicker);
  if (aBars.length === 0 || bBars.length === 0) return { a: [], b: [] };

  const start = aBars[0].date > bBars[0].date ? aBars[0].date : bBars[0].date;
  const toIndex = (bars: PriceBar[]) =>
    sampleWeekly(
      computeTotalReturnIndex(bars.filter((bar) => bar.date >= start)),
    );
  return { a: toIndex(aBars), b: toIndex(bBars) };
}
