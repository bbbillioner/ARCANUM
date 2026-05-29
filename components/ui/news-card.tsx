import { formatRelativeTime, getTopicHint } from "@/lib/news";
import type { NewsItem } from "@/types/news";

type NewsCardProps = {
  item: NewsItem;
  highlightTickers?: string[];
};

export function NewsCard({ item, highlightTickers = [] }: NewsCardProps) {
  const hint = getTopicHint(item.title);
  const highlightSet = new Set(highlightTickers.map((t) => t.toUpperCase()));
  const yourTickers = item.tickers.filter((t) =>
    highlightSet.has(t.toUpperCase()),
  );
  const otherTickers = item.tickers
    .filter((t) => !highlightSet.has(t.toUpperCase()))
    .slice(0, 4);

  return (
    <a
      className="news-card"
      href={item.link}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="news-meta">
        <span className="news-publisher">{item.publisher}</span>
        <span className="news-dot">·</span>
        <span className="news-time">{formatRelativeTime(item.publishedAt)}</span>
      </div>

      <h3 className="news-title">{item.title}</h3>

      {hint && (
        <p className="news-hint">
          <span className="news-hint-label">Why this matters</span>
          {hint}
        </p>
      )}

      {(yourTickers.length > 0 || otherTickers.length > 0) && (
        <div className="news-tickers">
          {yourTickers.map((ticker) => (
            <span className="ticker-pill ticker-pill-strong" key={ticker}>
              {ticker}
            </span>
          ))}
          {otherTickers.map((ticker) => (
            <span className="ticker-pill" key={ticker}>
              {ticker}
            </span>
          ))}
          <span className="news-read">
            Read <span className="arrow">→</span>
          </span>
        </div>
      )}

      <style>{`
        .news-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--surface);
          border: 1px solid var(--stroke);
          padding: 24px;
          transition: border-color 0.2s ease, background 0.2s ease;
          text-decoration: none;
          color: inherit;
          height: 100%;
        }
        .news-card:hover {
          border-color: var(--accent);
          background: var(--surface-2);
        }
        .news-card:hover .arrow {
          transform: translateX(3px);
        }
        .news-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-jetbrains-mono);
          font-size: 0.66rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .news-publisher {
          color: var(--accent);
          font-weight: 600;
        }
        .news-dot {
          color: var(--stroke-strong);
        }
        .news-time {
          color: var(--muted);
        }
        .news-title {
          font-family: var(--font-fraunces);
          font-weight: 600;
          font-size: 1.18rem;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: var(--foreground);
        }
        .news-hint {
          font-size: 0.86rem;
          line-height: 1.55;
          color: var(--muted);
          border-left: 2px solid var(--accent);
          padding: 4px 0 4px 12px;
        }
        .news-hint-label {
          display: block;
          font-family: var(--font-jetbrains-mono);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 4px;
        }
        .news-tickers {
          margin-top: auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }
        .ticker-pill {
          font-family: var(--font-jetbrains-mono);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 4px 10px;
          border: 1px solid var(--stroke);
          color: var(--muted);
        }
        .ticker-pill-strong {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(0, 229, 168, 0.06);
        }
        .news-read {
          margin-left: auto;
          font-family: var(--font-jetbrains-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: var(--muted);
        }
        .news-card:hover .news-read {
          color: var(--accent);
        }
        .arrow {
          display: inline-block;
          transition: transform 0.25s ease;
        }
      `}</style>
    </a>
  );
}
