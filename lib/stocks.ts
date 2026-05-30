import { liteStockProfiles, type LiteStockProfile } from "@/data/stocks-lite";
import { stockProfiles } from "@/data/stocks";
import type { StockProfile } from "@/types/investing";

export type AnyProfile = {
  ticker: string;
  name: string;
  assetType: StockProfile["assetType"];
  sector: string;
  beginnerRiskLevel: StockProfile["beginnerRiskLevel"];
  beginnerSummary: string;
  deep: StockProfile | null;
};

const deepByTicker = new Map(stockProfiles.map((p) => [p.ticker, p]));

const liteOnly: LiteStockProfile[] = liteStockProfiles.filter(
  (p) => !deepByTicker.has(p.ticker),
);

export const allProfiles: AnyProfile[] = [
  ...stockProfiles.map((p) => ({
    ticker: p.ticker,
    name: p.name,
    assetType: p.assetType,
    sector: p.sector,
    beginnerRiskLevel: p.beginnerRiskLevel,
    beginnerSummary: p.beginnerSummary,
    deep: p,
  })),
  ...liteOnly.map((p) => ({
    ticker: p.ticker,
    name: p.name,
    assetType: p.assetType,
    sector: p.sector,
    beginnerRiskLevel: p.beginnerRiskLevel,
    beginnerSummary: p.beginnerSummary,
    deep: null,
  })),
];

const profileByTicker = new Map(allProfiles.map((p) => [p.ticker, p]));

export function getAnyProfile(ticker: string): AnyProfile | null {
  return profileByTicker.get(ticker.toUpperCase()) ?? null;
}

export function getDeepProfile(ticker: string): StockProfile | null {
  return deepByTicker.get(ticker.toUpperCase()) ?? null;
}

export function searchProfiles(query: string, limit = 12): AnyProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return allProfiles.slice(0, limit);
  const scored: Array<{ profile: AnyProfile; score: number }> = [];
  for (const profile of allProfiles) {
    const ticker = profile.ticker.toLowerCase();
    const name = profile.name.toLowerCase();
    const sector = profile.sector.toLowerCase();
    let score = 0;
    if (ticker === q) score = 100;
    else if (ticker.startsWith(q)) score = 80;
    else if (ticker.includes(q)) score = 60;
    else if (name.toLowerCase().startsWith(q)) score = 50;
    else if (name.includes(q)) score = 30;
    else if (sector.includes(q)) score = 10;
    if (score > 0) scored.push({ profile, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.profile);
}
