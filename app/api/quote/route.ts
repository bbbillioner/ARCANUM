import { NextResponse } from "next/server";

import { parseKnownTickers } from "@/lib/api/tickers";
import { fetchQuotes } from "@/lib/quote";

export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("tickers") ?? "";
  const parsed = parseKnownTickers(raw, 20);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  if (parsed.tickers.length === 0) {
    return NextResponse.json({ quotes: {} });
  }

  const quotes = await fetchQuotes(parsed.tickers);
  return NextResponse.json(
    { quotes },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
