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
import type { PriceBar, PriceDataset, Timeframe } from "@/types/prices";

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
