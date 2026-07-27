import { requestCloudSync } from "@/lib/cloud-sync";

const STORAGE_KEY = "arcanum-watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.toUpperCase());
  } catch {
    return [];
  }
}

function write(tickers: string[]): void {
  if (typeof window === "undefined") return;
  const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase())));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  requestCloudSync();
}

export function getWatchlist(): string[] {
  return read();
}

export function isWatched(ticker: string): boolean {
  return read().includes(ticker.toUpperCase());
}

export function addToWatchlist(ticker: string): string[] {
  const list = read();
  const upper = ticker.toUpperCase();
  if (list.includes(upper)) return list;
  const next = [...list, upper];
  write(next);
  return next;
}

export function removeFromWatchlist(ticker: string): string[] {
  const upper = ticker.toUpperCase();
  const next = read().filter((t) => t !== upper);
  write(next);
  return next;
}

export function toggleWatchlist(ticker: string): string[] {
  return isWatched(ticker)
    ? removeFromWatchlist(ticker)
    : addToWatchlist(ticker);
}
