import type { StockProfile } from "@/types/investing";

export const stockProfiles: StockProfile[] = [
  {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    sector: "Diversified U.S. large-cap equities",
    beginnerRiskLevel: "low",
    portfolioRole: "Core portfolio anchor",
    companySummary:
      "VOO is an ETF that tracks the S&P 500, giving investors exposure to roughly 500 of the largest public companies in the United States.",
    businessModel:
      "The fund collects a small expense ratio and aims to mirror the index rather than pick individual winners.",
    whyPeopleInvest: [
      "Broad diversification in one holding",
      "Low cost compared with many actively managed funds",
      "Simple way to participate in long-term U.S. equity growth",
    ],
    keyRisks: [
      "Still exposed to stock market drawdowns",
      "Heavily influenced by the largest companies in the index",
      "Does not protect against short-term losses",
    ],
    bullCase:
      "U.S. large companies continue growing earnings over time and the index compounds steadily.",
    baseCase:
      "Returns track the broader U.S. market, with periodic declines and recoveries.",
    bearCase:
      "A recession, valuation reset, or prolonged weak earnings cycle leads to a meaningful drawdown.",
    beginnerMetrics: [
      {
        label: "Expense ratio",
        value: "Low",
        explanation:
          "Lower fees leave more of the portfolio return for the investor.",
      },
      {
        label: "Diversification",
        value: "High",
        explanation:
          "The fund owns many companies across sectors, reducing single-company risk.",
      },
      {
        label: "Volatility",
        value: "Market-like",
        explanation:
          "VOO can decline sharply when the overall stock market falls.",
      },
    ],
    whatToResearchNext: [
      "What companies make up the S&P 500?",
      "How market-cap weighting works",
      "How often an index fund should be rebalanced in a portfolio",
    ],
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    sector: "Growth and technology-heavy equities",
    beginnerRiskLevel: "moderate",
    portfolioRole: "Growth tilt",
    companySummary:
      "QQQ is an ETF that tracks the Nasdaq-100, a growth-oriented index with heavy exposure to technology and communication companies.",
    businessModel:
      "The fund seeks to track its index and earns a management fee through its expense ratio.",
    whyPeopleInvest: [
      "Exposure to many leading growth companies",
      "Simple way to add a technology tilt",
      "Potential for higher growth than the broad market",
    ],
    keyRisks: [
      "More concentrated than a broad market ETF",
      "Sensitive to technology valuations",
      "Can underperform when investors prefer defensive or value stocks",
    ],
    bullCase:
      "Large technology platforms keep expanding earnings and the market rewards their growth.",
    baseCase:
      "QQQ grows faster than the market in some periods but remains more volatile.",
    bearCase:
      "High expectations compress, technology spending slows, or rates pressure growth valuations.",
    beginnerMetrics: [
      {
        label: "Concentration",
        value: "Medium-high",
        explanation:
          "A smaller group of large technology companies drives much of the fund's return.",
      },
      {
        label: "Growth exposure",
        value: "High",
        explanation:
          "The fund leans toward companies expected to grow revenue and earnings faster.",
      },
      {
        label: "Dividend focus",
        value: "Low",
        explanation:
          "QQQ is usually owned for growth, not income.",
      },
    ],
    whatToResearchNext: [
      "Top holdings and their weights",
      "How QQQ differs from VOO",
      "Why interest rates can affect growth stocks",
    ],
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    sector: "Technology",
    beginnerRiskLevel: "moderate",
    portfolioRole: "Quality compounder",
    companySummary:
      "Microsoft is a global software, cloud, gaming, and productivity company with products used by consumers, developers, and enterprises.",
    businessModel:
      "Microsoft earns revenue from cloud infrastructure, business software subscriptions, Windows licensing, devices, gaming, and advertising.",
    whyPeopleInvest: [
      "Strong recurring revenue from enterprise software",
      "Large cloud platform with long-term growth potential",
      "High profitability and strong cash generation",
    ],
    keyRisks: [
      "Cloud growth could slow",
      "Regulatory scrutiny may increase",
      "Valuation can become demanding when expectations are high",
    ],
    bullCase:
      "Cloud, AI tools, and productivity subscriptions keep expanding while margins remain strong.",
    baseCase:
      "Microsoft grows steadily as a mature but high-quality technology business.",
    bearCase:
      "Enterprise spending slows, AI returns disappoint, or valuation compresses.",
    beginnerMetrics: [
      {
        label: "Revenue quality",
        value: "Strong",
        explanation:
          "Subscription and enterprise contracts can make revenue more durable.",
      },
      {
        label: "Profit margin",
        value: "High",
        explanation:
          "High margins show that a large share of revenue turns into operating profit.",
      },
      {
        label: "Balance sheet",
        value: "Strong",
        explanation:
          "A strong balance sheet gives a company flexibility during weaker markets.",
      },
    ],
    whatToResearchNext: [
      "Azure growth rate",
      "Operating margin trends",
      "How much AI spending converts into revenue",
    ],
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    sector: "Semiconductors",
    beginnerRiskLevel: "elevated",
    portfolioRole: "High-growth semiconductor exposure",
    companySummary:
      "NVIDIA designs graphics processors, data-center accelerators, networking products, and software used in AI, gaming, and professional computing.",
    businessModel:
      "NVIDIA sells chips, systems, software, and related platforms to data centers, device makers, gamers, and enterprise customers.",
    whyPeopleInvest: [
      "Leadership in AI infrastructure",
      "High revenue growth when demand for accelerators is strong",
      "Large market opportunity across data centers and accelerated computing",
    ],
    keyRisks: [
      "Semiconductor demand can be cyclical",
      "Competition and customer in-house chips may pressure growth",
      "High expectations can make the stock sensitive to any slowdown",
    ],
    bullCase:
      "AI infrastructure demand stays strong and NVIDIA maintains pricing power and technical leadership.",
    baseCase:
      "Growth remains impressive but gradually slows as the business becomes larger.",
    bearCase:
      "Demand normalizes, competition rises, or customers reduce spending after a buildout cycle.",
    beginnerMetrics: [
      {
        label: "Revenue growth",
        value: "Very high",
        explanation:
          "Fast growth can be powerful, but the market may already expect it.",
      },
      {
        label: "Cyclicality",
        value: "High",
        explanation:
          "Chip demand can move in cycles tied to customer spending and inventory.",
      },
      {
        label: "Valuation sensitivity",
        value: "High",
        explanation:
          "Stocks with high expectations can fall even after good results if growth slows.",
      },
    ],
    whatToResearchNext: [
      "Data center revenue growth",
      "Gross margin trends",
      "Customer concentration and competition",
    ],
  },
  {
    ticker: "COST",
    name: "Costco Wholesale",
    sector: "Consumer staples",
    beginnerRiskLevel: "moderate",
    portfolioRole: "Defensive quality business",
    companySummary:
      "Costco operates membership warehouses that sell groceries, household goods, fuel, and other products at low markups.",
    businessModel:
      "Costco earns retail sales and high-margin membership fees by offering value, high inventory turnover, and strong customer loyalty.",
    whyPeopleInvest: [
      "Recurring membership fees support profitability",
      "Customer loyalty can make results more resilient",
      "The business model is simple and durable",
    ],
    keyRisks: [
      "The stock can trade at a premium valuation",
      "Retail margins are naturally thin",
      "Growth depends on store expansion and membership renewal strength",
    ],
    bullCase:
      "Membership renewal remains strong, new warehouses perform well, and pricing discipline deepens customer loyalty.",
    baseCase:
      "Costco compounds steadily with moderate growth and resilient demand.",
    bearCase:
      "Valuation falls, consumer spending weakens, or expansion returns slow.",
    beginnerMetrics: [
      {
        label: "Membership renewal",
        value: "Important",
        explanation:
          "Renewal rates show whether customers still see value in the model.",
      },
      {
        label: "Margins",
        value: "Low but stable",
        explanation:
          "Costco keeps product markups low, so consistency matters more than high margins.",
      },
      {
        label: "Valuation",
        value: "Often premium",
        explanation:
          "A great company can still be risky if the price assumes too much growth.",
      },
    ],
    whatToResearchNext: [
      "Membership renewal rates",
      "Comparable-store sales",
      "How valuation compares with long-term growth",
    ],
  },
];
