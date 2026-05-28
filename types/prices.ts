export type PriceBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
};

export type PriceDataset = {
  ticker: string;
  fetchedAt: string;
  currency: string;
  exchange: string;
  bars: PriceBar[];
};

export type Timeframe = "1M" | "3M" | "6M" | "1Y" | "5Y" | "ALL";
