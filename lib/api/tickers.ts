import { allProfiles } from "@/lib/stocks";

const knownTickers = new Set(allProfiles.map((profile) => profile.ticker));

export type TickerParseResult =
  | { ok: true; tickers: string[] }
  | { ok: false; message: string };

export function parseKnownTickers(
  raw: string,
  maxTickers: number,
): TickerParseResult {
  if (raw.length > 300) {
    return { ok: false, message: "Ticker query is too long." };
  }

  const requested = Array.from(
    new Set(
      raw
        .split(",")
        .map((ticker) => ticker.trim().toUpperCase())
        .filter((ticker) => ticker.length > 0 && ticker !== "CASH"),
    ),
  );

  if (requested.length > maxTickers) {
    return {
      ok: false,
      message: `Request up to ${maxTickers} tickers at a time.`,
    };
  }

  const unsupported = requested.filter(
    (ticker) => !/^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker) || !knownTickers.has(ticker),
  );
  if (unsupported.length > 0) {
    return {
      ok: false,
      message: `Unsupported ticker${unsupported.length === 1 ? "" : "s"}: ${unsupported.join(", ")}.`,
    };
  }

  return { ok: true, tickers: requested };
}
