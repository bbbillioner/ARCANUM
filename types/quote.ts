export type Quote = {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  updatedAt: number;
  source: "live" | "historical";
};

export type QuoteMap = Record<string, Quote>;
