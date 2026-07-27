import { getLatestBar, getPriceBars } from "@/lib/prices";
import type { Quote, QuoteMap } from "@/types/quote";

const REVALIDATE_SECONDS = 300;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

type YahooChartMeta = {
  symbol?: string;
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketTime?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{ meta?: YahooChartMeta }>;
    error?: unknown;
  };
};

function historicalFallback(ticker: string): Quote | null {
  const bars = getPriceBars(ticker);
  if (bars.length === 0) return null;
  const last = bars[bars.length - 1];
  const prev = bars.length >= 2 ? bars[bars.length - 2] : last;
  const change = last.close - prev.close;
  const changePercent = prev.close > 0 ? (change / prev.close) * 100 : 0;
  return {
    ticker: ticker.toUpperCase(),
    price: last.close,
    previousClose: prev.close,
    change,
    changePercent,
    dayHigh: last.high,
    dayLow: last.low,
    volume: last.volume,
    updatedAt: Date.parse(`${last.date}T20:00:00Z`),
    source: "historical",
  };
}

async function fetchSingleQuote(ticker: string): Promise<Quote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ticker,
    )}?range=1d&interval=1m`;
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) return historicalFallback(ticker);

    const json: YahooChartResponse = await response.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== "number") {
      return historicalFallback(ticker);
    }

    const previousClose =
      typeof meta.previousClose === "number"
        ? meta.previousClose
        : typeof meta.chartPreviousClose === "number"
        ? meta.chartPreviousClose
        : getLatestBar(ticker)?.close ?? meta.regularMarketPrice;

    const price = meta.regularMarketPrice;
    const change = price - previousClose;
    const changePercent =
      previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      ticker: ticker.toUpperCase(),
      price,
      previousClose,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? null,
      dayLow: meta.regularMarketDayLow ?? null,
      volume: meta.regularMarketVolume ?? null,
      updatedAt:
        typeof meta.regularMarketTime === "number"
          ? meta.regularMarketTime * 1000
          : Date.now(),
      source: "live",
    };
  } catch {
    return historicalFallback(ticker);
  }
}

export async function fetchQuotes(tickers: string[]): Promise<QuoteMap> {
  if (tickers.length === 0) return {};
  const unique = Array.from(
    new Set(tickers.map((t) => t.toUpperCase()).filter((t) => t !== "CASH")),
  );
  const results = await Promise.all(unique.map(fetchSingleQuote));
  const map: QuoteMap = {};
  for (let i = 0; i < unique.length; i += 1) {
    const q = results[i];
    if (q) map[unique[i]] = q;
  }
  return map;
}

export async function fetchQuote(ticker: string): Promise<Quote | null> {
  const upper = ticker.toUpperCase();
  if (upper === "CASH") return null;
  return fetchSingleQuote(upper);
}
