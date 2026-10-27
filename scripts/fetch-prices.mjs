import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
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

// The long daily series is what we store. Yahoo's 5y series can lag the most
// recent completed session (after the close it may omit that day, or return
// it with null fields), so we also pull a short window and merge it in,
// preferring the short window's bars for overlapping dates.
const LONG_RANGE = "5y";
const SHORT_RANGE = "5d";

// Treat a session as complete only a little after the regular close, so the
// closing auction print has settled.
const SESSION_SETTLE_SECONDS = 15 * 60;
// Used only if Yahoo omits currentTradingPeriod: 16:15 exchange time.
const FALLBACK_CLOSE_MINUTES = 16 * 60 + 15;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

mkdirSync(OUT_DIR, { recursive: true });

async function fetchChart(ticker, range) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker,
  )}?range=${range}&interval=1d&includeAdjustedClose=true`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`${ticker} (${range}): HTTP ${response.status}`);
  }

  const json = await response.json();
  const result = json.chart?.result?.[0];

  if (!result) {
    throw new Error(`${ticker} (${range}): no result in payload`);
  }

  return result;
}

// YYYY-MM-DD in the exchange's own time zone.
function exchangeDate(epochSeconds, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(epochSeconds * 1000));
}

function exchangeMinutesOfDay(epochSeconds, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(epochSeconds * 1000));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

// Raw (unrounded) bars keyed by exchange-local date. Bars with any missing
// field are skipped, so an incomplete bar never enters the snapshot.
function extractBars(result, timeZone) {
  const timestamps = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0] ?? {};
  const adjclose = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const bars = new Map();

  for (let i = 0; i < timestamps.length; i += 1) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    const volume = quote.volume?.[i];
    const adj = adjclose[i];

    if (
      open == null ||
      high == null ||
      low == null ||
      close == null ||
      volume == null ||
      adj == null
    ) {
      continue;
    }

    const date = exchangeDate(timestamps[i], timeZone);
    bars.set(date, { date, open, high, low, close, adjClose: adj, volume });
  }

  return bars;
}

// A bar is a completed session unless it is dated "today" on the exchange and
// the regular session has not closed (plus a short settle window).
function isCompletedSession(date, meta, nowSeconds, timeZone) {
  const today = exchangeDate(nowSeconds, timeZone);
  if (date < today) return true;
  if (date > today) return false;

  const regular = meta.currentTradingPeriod?.regular;
  if (
    regular &&
    typeof regular.start === "number" &&
    typeof regular.end === "number" &&
    exchangeDate(regular.start, timeZone) === date
  ) {
    return nowSeconds >= regular.end + SESSION_SETTLE_SECONDS;
  }

  return exchangeMinutesOfDay(nowSeconds, timeZone) >= FALLBACK_CLOSE_MINUTES;
}

async function fetchTicker(ticker) {
  const longResult = await fetchChart(ticker, LONG_RANGE);
  const shortResult = await fetchChart(ticker, SHORT_RANGE);
  const fetchedAt = new Date();
  const nowSeconds = Math.floor(fetchedAt.getTime() / 1000);

  const meta = shortResult.meta ?? longResult.meta ?? {};
  const timeZone = meta.exchangeTimezoneName ?? "America/New_York";

  const longBars = extractBars(longResult, timeZone);
  const shortBars = extractBars(shortResult, timeZone);

  // adjClose is relative to dividends known at fetch time. If the short window
  // knows about a dividend the long series hasn't absorbed yet, rescale the
  // long-only history so total-return math has no artificial jump.
  const overlap = [...shortBars.keys()].filter((d) => longBars.has(d)).sort();
  if (overlap.length > 0) {
    const first = overlap[0];
    const ratio = shortBars.get(first).adjClose / longBars.get(first).adjClose;
    if (Number.isFinite(ratio) && Math.abs(ratio - 1) > 1e-6) {
      console.warn(
        `\n  ${ticker}: rescaling long-range adjClose by ${ratio.toFixed(6)} to match ${SHORT_RANGE} window`,
      );
      for (const bar of longBars.values()) bar.adjClose *= ratio;
    }
  }

  const merged = new Map(longBars);
  for (const [date, bar] of shortBars) merged.set(date, bar);

  const bars = [...merged.values()]
    .filter((bar) => isCompletedSession(bar.date, meta, nowSeconds, timeZone))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((bar) => ({
      date: bar.date,
      open: round(bar.open),
      high: round(bar.high),
      low: round(bar.low),
      close: round(bar.close),
      adjClose: round(bar.adjClose),
      volume: Math.round(bar.volume),
    }));

  if (bars.length === 0) {
    throw new Error(`${ticker}: no complete bars`);
  }

  // Surface any remaining lag: the current trading period has closed but
  // neither window returned its bar.
  const regular = meta.currentTradingPeriod?.regular;
  if (typeof regular?.start === "number" && typeof regular?.end === "number") {
    const sessionDate = exchangeDate(regular.start, timeZone);
    if (
      nowSeconds >= regular.end + SESSION_SETTLE_SECONDS &&
      !bars.some((bar) => bar.date === sessionDate)
    ) {
      console.warn(`\n  ${ticker}: no complete bar yet for the ${sessionDate} session`);
    }
  }

  return {
    ticker,
    fetchedAt: fetchedAt.toISOString(),
    lastBarDate: bars[bars.length - 1].date,
    currency: meta.currency ?? "USD",
    exchange: meta.exchangeName ?? "",
    bars,
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function readExisting(outPath) {
  if (!existsSync(outPath)) return null;
  try {
    return JSON.parse(readFileSync(outPath, "utf8"));
  } catch {
    return null;
  }
}

async function main() {
  for (const ticker of TICKERS) {
    try {
      process.stdout.write(`Fetching ${ticker}... `);
      const data = await fetchTicker(ticker);
      const outPath = join(OUT_DIR, `${ticker}.json`);
      // Skip the write when no bar changed, so a run that finds nothing new
      // (e.g. a market holiday) doesn't create a commit and a deploy.
      const existing = readExisting(outPath);
      if (
        existing?.lastBarDate === data.lastBarDate &&
        JSON.stringify(existing.bars) === JSON.stringify(data.bars)
      ) {
        console.log(`unchanged (${data.bars.length} bars, last ${data.lastBarDate})`);
        continue;
      }
      writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`ok (${data.bars.length} bars, last ${data.lastBarDate})`);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

main();
