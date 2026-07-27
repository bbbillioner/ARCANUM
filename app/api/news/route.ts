import { NextResponse } from "next/server";

import { parseKnownTickers } from "@/lib/api/tickers";
import { fetchPortfolioNews } from "@/lib/news";

export const revalidate = 1800;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("tickers") ?? "";
  const parsed = parseKnownTickers(raw, 10);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  if (parsed.tickers.length === 0) {
    return NextResponse.json({ news: [] });
  }

  const news = await fetchPortfolioNews(parsed.tickers, 9);
  return NextResponse.json(
    { news },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    },
  );
}
