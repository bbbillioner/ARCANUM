import type { DailyBriefCard } from "@/types/investing";

export const dailyBriefs: DailyBriefCard[] = [
  {
    title: "Interest-rate expectations moved again",
    whatHappened:
      "Investors adjusted expectations for future central bank rate cuts after fresh inflation and employment data.",
    whyItMatters:
      "Rates affect borrowing costs, stock valuations, bond yields, and how much investors are willing to pay for future growth.",
    affectedSectors: ["Technology", "Real estate", "Banks", "Consumer discretionary"],
    affectedHoldings: ["QQQ", "MSFT", "NVDA", "VOO"],
    beginnerTranslation:
      "When rates look higher for longer, expensive growth stocks can become more volatile because their future profits are discounted more heavily.",
  },
  {
    title: "Large-cap technology led the market",
    whatHappened:
      "A small group of profitable mega-cap technology companies drove a large share of the index move.",
    whyItMatters:
      "Market-cap weighted indexes can look diversified while still depending heavily on their biggest holdings.",
    affectedSectors: ["Technology", "Communication services", "Semiconductors"],
    affectedHoldings: ["VOO", "QQQ", "MSFT", "NVDA"],
    beginnerTranslation:
      "Owning an index fund spreads risk, but the largest companies can still have an outsized impact on your daily returns.",
  },
  {
    title: "Consumer spending showed mixed signals",
    whatHappened:
      "Retail and company commentary suggested consumers are still spending, but becoming more selective on price.",
    whyItMatters:
      "Consumer demand influences company revenue, margins, and the outlook for businesses tied to household budgets.",
    affectedSectors: ["Consumer staples", "Consumer discretionary", "Retail"],
    affectedHoldings: ["COST", "VOO"],
    beginnerTranslation:
      "A company can be strong and still face pressure if customers become more cautious or trade down to cheaper options.",
  },
  {
    title: "Semiconductor demand stayed in focus",
    whatHappened:
      "Investors watched chip supply, AI infrastructure spending, and data-center demand for signs of continued growth.",
    whyItMatters:
      "Semiconductors sit behind many technology trends, but the industry can swing between shortage, overbuild, and normalization.",
    affectedSectors: ["Semiconductors", "Cloud infrastructure", "Technology hardware"],
    affectedHoldings: ["NVDA", "QQQ", "VOO"],
    beginnerTranslation:
      "Fast-growing chip companies can be excellent businesses, but their stocks often react sharply when growth expectations change.",
  },
  {
    title: "Earnings quality mattered more than headlines",
    whatHappened:
      "Investors focused on revenue growth, margins, guidance, and cash flow instead of only whether companies beat estimates.",
    whyItMatters:
      "A stock can fall after a profitable quarter if management signals weaker demand or margin pressure ahead.",
    affectedSectors: ["Technology", "Consumer staples", "Broad market"],
    affectedHoldings: ["MSFT", "COST", "VOO", "QQQ"],
    beginnerTranslation:
      "Earnings are not just a scoreboard. The important part is whether the business is becoming stronger, weaker, or simply more expensive.",
  },
];
