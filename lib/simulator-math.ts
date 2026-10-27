import type {
  PriceSource,
  SimulatorHolding,
  SimulatorState,
  SimulatorSummary,
  SimulatorTransaction,
} from "@/types/investing";

/**
 * Pure simulator accounting. No storage, no network, no price lookups:
 * every price comes in as an argument, so the same price that fills a trade
 * is the one used to value the holding afterwards.
 *
 * Accounting method: average cost. Total gain/loss is always
 * (cash + market value) - starting cash, which splits exactly into
 * realized + unrealized.
 */

/** Latest price per ticker. Missing tickers keep their last known price. */
export type PriceMap = Record<string, number>;

/** The price a trade settles at, with where and when it was observed. */
export type TradeQuote = {
  price: number;
  source: PriceSource;
  /** ISO timestamp (live quote) or date (daily close). */
  asOf: string;
};

export type TradeResult =
  | { ok: true; state: SimulatorState; message: string }
  | { ok: false; message: string };

export const MIN_HOLDING_VALUE = 0.01;
const THESIS_MIN = 10;
const NOTE_MAX = 240;

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function roundShares(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

function percentOf(part: number, whole: number) {
  return whole > 0 ? roundPercent((part / whole) * 100) : 0;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Same formatting as the UI, so messages and tables show the same cents. */
function formatUsd(value: number) {
  return usd.format(value);
}

function valueHolding(holding: SimulatorHolding, prices: PriceMap): SimulatorHolding {
  const quoted = prices[holding.ticker.toUpperCase()];
  const currentPrice = quoted > 0 ? quoted : holding.currentPrice;
  const shares = roundShares(holding.shares);
  const investedAmount = roundCurrency(holding.averageCost * shares);
  const marketValue = roundCurrency(shares * currentPrice);
  const unrealizedGainLoss = roundCurrency(marketValue - investedAmount);

  return {
    ...holding,
    shares,
    currentPrice,
    investedAmount,
    marketValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent: percentOf(unrealizedGainLoss, investedAmount),
    allocationPercent: 0,
  };
}

/** Re-prices every holding and recomputes allocation. */
export function revalueState(
  state: SimulatorState,
  prices: PriceMap = {},
): SimulatorState {
  const holdings = state.holdings
    .map((holding) => valueHolding(holding, prices))
    .filter((holding) => holding.shares > 0 && holding.marketValue >= MIN_HOLDING_VALUE);

  const cashBalance = roundCurrency(state.cashBalance);
  const investedValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalValue = cashBalance + investedValue;

  return {
    ...state,
    cashBalance,
    holdings: holdings.map((holding) => ({
      ...holding,
      allocationPercent: percentOf(holding.marketValue, totalValue),
    })),
  };
}

export function summarizeState(
  state: SimulatorState,
  prices: PriceMap = {},
): SimulatorSummary {
  const valued = revalueState(state, prices);
  const investedValue = roundCurrency(
    valued.holdings.reduce((sum, h) => sum + h.marketValue, 0),
  );
  const totalPortfolioValue = roundCurrency(valued.cashBalance + investedValue);
  const totalGainLoss = roundCurrency(totalPortfolioValue - valued.startingCash);
  const unrealizedGainLoss = roundCurrency(
    valued.holdings.reduce((sum, h) => sum + h.unrealizedGainLoss, 0),
  );

  return {
    totalPortfolioValue,
    cashBalance: valued.cashBalance,
    investedValue,
    totalGainLoss,
    totalGainLossPercent: percentOf(totalGainLoss, valued.startingCash),
    unrealizedGainLoss,
    realizedGainLoss: roundCurrency(totalGainLoss - unrealizedGainLoss),
    cashAllocationPercent: percentOf(valued.cashBalance, totalPortfolioValue),
    investedAllocationPercent: percentOf(investedValue, totalPortfolioValue),
  };
}

type BuyInput = {
  ticker: string;
  name: string;
  amount: number;
  quote: TradeQuote;
  thesis?: string;
  preMortem?: string;
  id: string;
  now: string;
};

export function applyBuy(state: SimulatorState, input: BuyInput): TradeResult {
  const amount = Number.isFinite(input.amount) ? roundCurrency(input.amount) : 0;
  const { price } = input.quote;
  const thesis = (input.thesis ?? "").trim();
  const preMortem = (input.preMortem ?? "").trim();

  if (amount <= 0) {
    return { ok: false, message: "Enter a dollar amount greater than $0." };
  }
  if (amount > state.cashBalance) {
    return { ok: false, message: "You do not have enough fake cash for that purchase." };
  }
  if (thesis.length < THESIS_MIN) {
    return {
      ok: false,
      message:
        "Write one sentence on why you're buying — at least 10 characters. This is the part that builds the skill.",
    };
  }
  if (thesis.length > NOTE_MAX) {
    return { ok: false, message: "Keep the thesis under 240 characters — one clear sentence." };
  }
  if (preMortem.length > NOTE_MAX) {
    return { ok: false, message: "Keep the pre-mortem under 240 characters too." };
  }
  if (!(price > 0)) {
    return { ok: false, message: "Price data is unavailable for this asset right now." };
  }

  const ticker = input.ticker.toUpperCase();
  const sharesBought = roundShares(amount / price);
  const existing = state.holdings.find((h) => h.ticker === ticker);
  let holdings: SimulatorHolding[];

  if (existing) {
    const shares = roundShares(existing.shares + sharesBought);
    const costBasis = existing.averageCost * existing.shares + amount;
    holdings = state.holdings.map((h) =>
      h.ticker === ticker
        ? { ...h, shares, averageCost: costBasis / shares, currentPrice: price }
        : h,
    );
  } else {
    holdings = [
      ...state.holdings,
      {
        ticker,
        name: input.name,
        shares: sharesBought,
        averageCost: amount / sharesBought,
        currentPrice: price,
        investedAmount: amount,
        marketValue: amount,
        unrealizedGainLoss: 0,
        unrealizedGainLossPercent: 0,
        allocationPercent: 0,
      },
    ];
  }

  const transaction: SimulatorTransaction = {
    id: input.id,
    type: "buy",
    ticker,
    shares: sharesBought,
    price,
    amount,
    createdAt: input.now,
    priceSource: input.quote.source,
    priceAsOf: input.quote.asOf,
    thesis,
    preMortem: preMortem.length > 0 ? preMortem : undefined,
    reviews: [],
  };

  return {
    ok: true,
    state: revalueState({
      ...state,
      cashBalance: roundCurrency(state.cashBalance - amount),
      holdings,
      transactions: [transaction, ...state.transactions],
      updatedAt: input.now,
    }),
    message: `Bought ${formatUsd(amount)} of ${ticker} at ${formatUsd(price)}. Thesis saved to your journal.`,
  };
}

type SellInput = {
  ticker: string;
  /** Dollar amount to sell, or "all" to close the position. */
  amount: number | "all";
  quote: TradeQuote;
  id: string;
  now: string;
};

export function applySell(state: SimulatorState, input: SellInput): TradeResult {
  const ticker = input.ticker.toUpperCase();
  const holding = state.holdings.find((h) => h.ticker === ticker);
  const { price } = input.quote;

  if (!holding || holding.shares <= 0) {
    return { ok: false, message: "You do not own this asset in the simulator." };
  }
  if (!(price > 0)) {
    return { ok: false, message: "Price data is unavailable for this asset right now." };
  }

  const positionValue = holding.shares * price;
  const requested =
    input.amount === "all"
      ? positionValue
      : Number.isFinite(input.amount)
        ? roundCurrency(input.amount)
        : 0;

  if (requested <= 0) {
    return { ok: false, message: "Enter a dollar amount greater than $0." };
  }
  if (requested > roundCurrency(positionValue) + 0.005) {
    return {
      ok: false,
      message: `You can sell at most ${formatUsd(roundCurrency(positionValue))} of ${ticker} at ${formatUsd(price)}.`,
    };
  }

  // Selling the full displayed value (to the cent) closes the position, so no
  // unsellable fraction of a share is left behind.
  const closesPosition = requested >= roundCurrency(positionValue) - 0.005;
  const sharesSold = closesPosition
    ? holding.shares
    : Math.min(roundShares(requested / price), holding.shares);
  const proceeds = closesPosition ? roundCurrency(positionValue) : requested;
  const realizedGainLoss = roundCurrency(proceeds - sharesSold * holding.averageCost);
  const remainingShares = closesPosition ? 0 : roundShares(holding.shares - sharesSold);

  const holdings = state.holdings
    .map((h) =>
      h.ticker === ticker ? { ...h, shares: remainingShares, currentPrice: price } : h,
    )
    .filter((h) => h.shares > 0);

  const transaction: SimulatorTransaction = {
    id: input.id,
    type: "sell",
    ticker,
    shares: sharesSold,
    price,
    amount: proceeds,
    createdAt: input.now,
    priceSource: input.quote.source,
    priceAsOf: input.quote.asOf,
    realizedGainLoss,
  };

  const outcome =
    realizedGainLoss === 0
      ? "break-even"
      : `${realizedGainLoss > 0 ? "a realized gain" : "a realized loss"} of ${formatUsd(Math.abs(realizedGainLoss))}`;

  return {
    ok: true,
    state: revalueState({
      ...state,
      cashBalance: roundCurrency(state.cashBalance + proceeds),
      holdings,
      transactions: [transaction, ...state.transactions],
      updatedAt: input.now,
    }),
    message: `Sold ${formatUsd(proceeds)} of ${ticker} at ${formatUsd(price)}: ${outcome}.`,
  };
}

/**
 * Rebuilds holdings by replaying transactions oldest-first (used when a
 * simulator is restored from the cloud). Each holding's last known price is
 * its most recent trade price; callers revalue with fresh quotes.
 *
 * `transactions` is newest-first, as stored locally and as pulled from the
 * cloud. Reversing before the (stable) time sort keeps trades that share a
 * timestamp in the order they happened, so a sell never replays before its buy.
 */
export function rebuildHoldings(
  transactions: SimulatorTransaction[],
  nameFor: (ticker: string) => string = (ticker) => ticker,
): SimulatorHolding[] {
  const positions = new Map<
    string,
    { shares: number; averageCost: number; lastPrice: number }
  >();
  const chronological = [...transactions]
    .reverse()
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  for (const tx of chronological) {
    const ticker = tx.ticker.toUpperCase();
    const current = positions.get(ticker) ?? { shares: 0, averageCost: 0, lastPrice: tx.price };
    if (tx.type === "buy") {
      const shares = roundShares(current.shares + tx.shares);
      const cost = current.averageCost * current.shares + tx.amount;
      positions.set(ticker, {
        shares,
        averageCost: shares > 0 ? cost / shares : tx.price,
        lastPrice: tx.price,
      });
    } else {
      const shares = roundShares(Math.max(0, current.shares - tx.shares));
      if (shares <= 0) positions.delete(ticker);
      else positions.set(ticker, { ...current, shares, lastPrice: tx.price });
    }
  }

  return Array.from(positions.entries()).map(([ticker, position]) => ({
    ticker,
    name: nameFor(ticker),
    shares: position.shares,
    averageCost: position.averageCost,
    currentPrice: position.lastPrice,
    investedAmount: 0,
    marketValue: 0,
    unrealizedGainLoss: 0,
    unrealizedGainLossPercent: 0,
    allocationPercent: 0,
  }));
}
