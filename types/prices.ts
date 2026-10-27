export type PriceBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  /** Split-adjusted price only. Use for price charts and daily changes. */
  close: number;
  /** Split- and dividend-adjusted. Use for total-return performance. */
  adjClose: number;
  volume: number;
};

export type PriceDataset = {
  ticker: string;
  /** When the snapshot script fetched this file (ISO timestamp). */
  fetchedAt: string;
  /** Date of the last completed session in `bars` (YYYY-MM-DD). */
  lastBarDate?: string;
  currency: string;
  exchange: string;
  bars: PriceBar[];
};

export type Timeframe = "1M" | "3M" | "6M" | "1Y" | "5Y" | "ALL";

/** Minimal close series, e.g. for sparklines. A PriceBar satisfies it. */
export type ClosePoint = Pick<PriceBar, "date" | "close">;

/** A value on a growth-of-100 index (e.g. total return, dividends reinvested). */
export type IndexPoint = {
  date: string;
  value: number;
};
