import { formatRelativeTime, getTopicHint } from "@/lib/news";
import { cn } from "@/lib/utils";
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
      className="group flex h-full flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 backdrop-blur transition hover:border-teal-300/30 hover:bg-white/[0.07]"
      href={item.link}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-teal-200">{item.publisher}</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-500">
          {formatRelativeTime(item.publishedAt)}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-6 text-white transition group-hover:text-teal-100 sm:text-lg sm:leading-7">
        {item.title}
      </h3>

      {hint && (
        <p className="text-sm leading-6 text-zinc-400">
          <span className="font-semibold text-zinc-200">Why this matters: </span>
          {hint}
        </p>
      )}

      {(yourTickers.length > 0 || otherTickers.length > 0) && (
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {yourTickers.map((ticker) => (
            <span
              className="rounded-full border border-teal-300/30 bg-teal-300/15 px-2.5 py-0.5 text-xs font-semibold text-teal-100"
              key={ticker}
            >
              {ticker}
            </span>
          ))}
          {otherTickers.map((ticker) => (
            <span
              className={cn(
                "rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold text-zinc-300",
              )}
              key={ticker}
            >
              {ticker}
            </span>
          ))}
          <span className="ml-auto text-xs font-medium text-zinc-500 transition group-hover:text-teal-200">
            Read →
          </span>
        </div>
      )}
    </a>
  );
}
