import { NextResponse } from "next/server";

import { fetchPortfolioNews } from "@/lib/news";

export const revalidate = 1800;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("tickers") ?? "";
  const tickers = raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0 && t !== "CASH");

  if (tickers.length === 0) {
    return NextResponse.json({ news: [] });
  }

  const news = await fetchPortfolioNews(tickers, 9);
  return NextResponse.json({ news });
}
