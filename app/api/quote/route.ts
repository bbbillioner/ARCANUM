import { NextResponse } from "next/server";

import { fetchQuotes } from "@/lib/quote";

export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("tickers") ?? "";
  const tickers = raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0 && t !== "CASH");

  if (tickers.length === 0) {
    return NextResponse.json({ quotes: {} });
  }

  const quotes = await fetchQuotes(tickers);
  return NextResponse.json({ quotes });
}
