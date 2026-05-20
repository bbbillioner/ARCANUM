import type { LearningCard } from "@/types/investing";

export const learningCards: LearningCard[] = [
  {
    term: "ETF",
    simpleMeaning:
      "An exchange-traded fund is a basket of investments that trades like a stock.",
    whyItMatters:
      "ETFs can give beginners instant diversification without needing to pick many individual companies.",
    example:
      "VOO owns the companies in the S&P 500, so one share gives exposure to many large U.S. businesses.",
  },
  {
    term: "Diversification",
    simpleMeaning:
      "Spreading money across different holdings so one mistake does not control the whole outcome.",
    whyItMatters:
      "Diversification helps reduce single-company risk and makes a portfolio easier to hold through volatility.",
    example:
      "Owning VOO plus a cash reserve is more diversified than putting the entire portfolio into one chip stock.",
  },
  {
    term: "Allocation",
    simpleMeaning:
      "The percentage of your portfolio assigned to each asset, sector, or holding.",
    whyItMatters:
      "Allocation determines the actual risk you are taking, often more than the names in the portfolio.",
    example:
      "A 5% NVDA position and a 40% NVDA position can produce very different portfolio behavior.",
  },
  {
    term: "P/E Ratio",
    simpleMeaning:
      "Price-to-earnings compares a company's stock price with its earnings per share.",
    whyItMatters:
      "It helps beginners ask whether expectations may already be high, though it should never be used alone.",
    example:
      "A company with a high P/E may need strong future growth to justify its current price.",
  },
  {
    term: "Market Cap",
    simpleMeaning:
      "The total value the stock market assigns to a company.",
    whyItMatters:
      "Market cap helps explain company size, index weight, and how much a holding can move an index.",
    example:
      "Mega-cap companies like Microsoft can meaningfully affect both VOO and QQQ because they are large index weights.",
  },
  {
    term: "Revenue Growth",
    simpleMeaning:
      "How quickly a company is increasing the money it brings in from selling products or services.",
    whyItMatters:
      "Revenue growth can show demand, but investors also need to check margins, cash flow, and valuation.",
    example:
      "A software company growing revenue 15% may still be risky if the stock price assumes 30% growth for years.",
  },
  {
    term: "Portfolio Thesis",
    simpleMeaning:
      "A clear reason for why a holding belongs in the portfolio and what role it plays.",
    whyItMatters:
      "A thesis helps beginners avoid buying random tickers without a plan for sizing, risk, or review.",
    example:
      "MSFT could be held as a quality compounder, while QQQ could be held as a diversified growth tilt.",
  },
  {
    term: "Bull Case",
    simpleMeaning:
      "The optimistic scenario where the investment performs well because key things go right.",
    whyItMatters:
      "Writing the bull case helps investors identify what success depends on.",
    example:
      "For NVIDIA, a bull case might depend on continued AI infrastructure demand and strong margins.",
  },
  {
    term: "Bear Case",
    simpleMeaning:
      "The negative scenario where the investment struggles because key risks show up.",
    whyItMatters:
      "A bear case helps beginners prepare emotionally and decide whether the position size is reasonable.",
    example:
      "For Costco, a bear case might include slower store growth and a falling valuation multiple.",
  },
  {
    term: "Concentration Risk",
    simpleMeaning:
      "The risk of having too much of the portfolio tied to one company, sector, or theme.",
    whyItMatters:
      "Concentration can increase gains when you are right, but it can also make losses harder to recover from.",
    example:
      "A portfolio built mostly from QQQ, MSFT, and NVDA may be more technology-heavy than it first appears.",
  },
];
