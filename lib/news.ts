import type { NewsItem } from "@/types/news";

const REVALIDATE_SECONDS = 1800;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

type YahooNewsItem = {
  uuid?: string;
  title?: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
  thumbnail?: { resolutions?: Array<{ url?: string; width?: number; tag?: string }> };
  relatedTickers?: string[];
  type?: string;
};

type YahooSearchResponse = {
  news?: YahooNewsItem[];
};

function pickThumbnail(item: YahooNewsItem): string | null {
  const resolutions = item.thumbnail?.resolutions;
  if (!resolutions || resolutions.length === 0) return null;
  const small = resolutions.find((r) => r.tag === "140x140");
  return small?.url ?? resolutions[0]?.url ?? null;
}

function normalize(item: YahooNewsItem, fallbackTicker: string): NewsItem | null {
  if (!item.uuid || !item.title || !item.link || !item.providerPublishTime) {
    return null;
  }

  return {
    id: item.uuid,
    title: item.title,
    publisher: item.publisher ?? "Yahoo Finance",
    link: item.link,
    publishedAt: item.providerPublishTime * 1000,
    thumbnail: pickThumbnail(item),
    tickers:
      item.relatedTickers && item.relatedTickers.length > 0
        ? item.relatedTickers
        : [fallbackTicker],
  };
}

export async function fetchTickerNews(
  ticker: string,
  limit = 8,
): Promise<NewsItem[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=${limit}&quotesCount=0`;
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) return [];

    const json: YahooSearchResponse = await response.json();
    const items = json.news ?? [];

    return items
      .map((item) => normalize(item, ticker.toUpperCase()))
      .filter((item): item is NewsItem => item !== null && item.title.length > 0);
  } catch {
    return [];
  }
}

export async function fetchPortfolioNews(
  tickers: string[],
  limit = 8,
): Promise<NewsItem[]> {
  if (tickers.length === 0) return [];

  const results = await Promise.all(
    tickers.map((ticker) => fetchTickerNews(ticker, 6)),
  );

  const seen = new Set<string>();
  const combined: NewsItem[] = [];

  for (const list of results) {
    for (const item of list) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      combined.push(item);
    }
  }

  combined.sort((a, b) => b.publishedAt - a.publishedAt);
  return combined.slice(0, limit);
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 0) return "just now";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

const topicHints: Array<{ keywords: RegExp; hint: string }> = [
  {
    keywords: /\b(earnings|q[1-4]|quarterly|revenue beat|results)\b/i,
    hint: "Earnings can move stocks sharply — they're a check on whether expectations were met.",
  },
  {
    keywords: /\b(downgrade|cut rating|lowered)\b/i,
    hint: "Analyst downgrades lower expectations and often pressure the stock short-term.",
  },
  {
    keywords: /\b(upgrade|raised price target|raised target|outperform|buy rating)\b/i,
    hint: "Analyst upgrades raise expectations and tend to attract new buyers.",
  },
  {
    keywords: /\b(buyback|repurchase)\b/i,
    hint: "Buybacks reduce shares outstanding, which can lift earnings per share.",
  },
  {
    keywords: /\b(dividend|payout)\b/i,
    hint: "Dividend changes are signals about a company's cash flow and confidence in future earnings.",
  },
  {
    keywords: /\b(lawsuit|sued|settlement|investigation|fine|antitrust)\b/i,
    hint: "Legal and regulatory news adds uncertainty — markets often discount until resolved.",
  },
  {
    keywords: /\b(fed|federal reserve|interest rate|rate cut|rate hike|cpi|inflation)\b/i,
    hint: "Macro signals like rates and inflation affect every stock — growth and tech are usually most sensitive.",
  },
  {
    keywords: /\b(ai|artificial intelligence|gpu|data center|nvidia|chip)\b/i,
    hint: "AI infrastructure news can ripple across chipmakers, cloud providers, and large-cap tech.",
  },
  {
    keywords: /\b(layoffs|job cuts|restructur)\b/i,
    hint: "Layoffs cut costs short-term but can signal weaker growth — the market reaction depends on which.",
  },
  {
    keywords: /\b(acquisition|acquires|buy out|merger|takeover)\b/i,
    hint: "M&A news typically lifts the target's stock and pressures the acquirer's — the deal terms matter.",
  },
];

export function getTopicHint(title: string): string | null {
  for (const topic of topicHints) {
    if (topic.keywords.test(title)) return topic.hint;
  }
  return null;
}
