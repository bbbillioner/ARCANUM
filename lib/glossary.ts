export const glossary: Record<string, string> = {
  etf: "An exchange-traded fund — a single holding that owns many underlying stocks or bonds, giving instant diversification.",
  diversification:
    "Spreading money across different holdings so one mistake or one bad outcome doesn't dominate the portfolio.",
  allocation:
    "The percentage of your portfolio assigned to each asset, sector, or holding. Allocation, more than picks, drives portfolio behavior.",
  "concentration risk":
    "The risk of having too much of the portfolio tied to one company, sector, or theme.",
  "p/e ratio":
    "Price-to-earnings: the stock price divided by earnings per share. A rough signal of how much investors are paying for each dollar of earnings.",
  "market cap":
    "Total value the market assigns to a company (share price × shares outstanding). Used to compare company sizes and index weights.",
  "revenue growth":
    "How quickly a company's sales are increasing. Strong growth can be good, but valuation already prices in expectations.",
  "portfolio thesis":
    "A clear reason why a holding belongs in the portfolio and what role it plays.",
  "bull case":
    "The optimistic scenario where the investment performs well because key things go right.",
  "bear case":
    "The negative scenario where the investment struggles because key risks show up.",
  "base case":
    "The middle-of-the-road scenario — what you'd reasonably expect if nothing dramatically good or bad happens.",
  "risk level":
    "How much the holding can move up or down, and how much that affects sleep at night.",
  "time horizon":
    "How long you plan to hold the investment before needing the money. Longer horizons can absorb more volatility.",
  "main exposure":
    "The single sector or theme that the portfolio leans on most heavily.",
  "diversification score":
    "A quick read on how spread-out the portfolio is across holdings and sectors.",
  "sector exposure":
    "How much of the portfolio is invested in each industry sector.",
  "cost basis":
    "What you originally paid for a holding — used to calculate gain or loss.",
  "average cost":
    "The blended price-per-share of a holding when you've bought it at multiple prices.",
  "avg cost":
    "The blended price-per-share of a holding when you've bought it at multiple prices.",
  "market value":
    "The current dollar value of a holding — shares × current price.",
  "expense ratio":
    "The annual fee a fund charges, as a percent of assets. Lower fees mean more return stays with you.",
  "unrealized gain":
    "Profit on paper — the holding has gone up but you haven't sold yet.",
  "unrealized loss":
    "Loss on paper — the holding has gone down but you haven't sold yet.",
  "fractional shares":
    "Buying part of a share. Lets you invest a dollar amount even if one share is expensive.",
  volatility:
    "How much the price swings up and down. Higher volatility means bigger highs and bigger lows.",
  dividend:
    "A cash payment some companies make to shareholders out of their profits.",
};

export function getDefinition(term: string): string | null {
  return glossary[term.toLowerCase()] ?? null;
}
