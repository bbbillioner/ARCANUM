import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_DIR = join(__dirname, "..", "data", "prices");

const TICKERS = [
  // Deep profiles
  "VOO", "QQQ", "MSFT", "NVDA", "COST",
  // Lite profiles — ETFs
  "SPY", "VTI", "VEA", "SCHD", "BND",
  // Lite profiles — Mega-cap tech
  "AAPL", "GOOGL", "AMZN", "META", "TSLA",
  // Lite profiles — Consumer
  "WMT", "HD", "MCD", "KO", "DIS",
  // Lite profiles — Finance
  "JPM", "V", "MA",
  // Lite profiles — Healthcare
  "JNJ", "UNH", "LLY",
  // Lite profiles — Other
  "BRK-B", "BA", "XOM", "NKE",
];

mkdirSync(OUT_DIR, { recursive: true });

async function fetchTicker(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=5y&interval=1d&includeAdjustedClose=true`;
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "application/json,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`${ticker}: HTTP ${response.status}`);
  }

  const json = await response.json();
  const result = json.chart?.result?.[0];

  if (!result) {
    throw new Error(`${ticker}: no result in payload`);
  }

  const timestamps = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0] ?? {};
  const adjclose = result.indicators?.adjclose?.[0]?.adjclose ?? [];

  const bars = [];

  for (let i = 0; i < timestamps.length; i += 1) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    const volume = quote.volume?.[i];
    const adj = adjclose?.[i];

    if (
      open == null ||
      high == null ||
      low == null ||
      close == null ||
      volume == null
    ) {
      continue;
    }

    const date = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);

    bars.push({
      date,
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      adjClose: adj == null ? round(close) : round(adj),
      volume: Math.round(volume),
    });
  }

  const lastBar = bars[bars.length - 1];
  const fetchedAt = lastBar
    ? `${lastBar.date}T20:00:00Z`
    : new Date().toISOString();

  return {
    ticker,
    fetchedAt,
    currency: result.meta?.currency ?? "USD",
    exchange: result.meta?.exchangeName ?? "",
    bars,
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

async function main() {
  for (const ticker of TICKERS) {
    try {
      process.stdout.write(`Fetching ${ticker}... `);
      const data = await fetchTicker(ticker);
      const outPath = join(OUT_DIR, `${ticker}.json`);
      writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`ok (${data.bars.length} bars)`);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

main();
