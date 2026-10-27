import { stockProfiles } from "@/data/stocks";
import { requestCloudSync } from "@/lib/cloud-sync";
import { getLatestBar } from "@/lib/prices";
import {
  applyBuy,
  applySell,
  revalueState,
  roundCurrency,
  summarizeState,
  type PriceMap,
  type TradeQuote,
  type TradeResult,
} from "@/lib/simulator-math";
import type {
  SimulatorActionResult,
  SimulatorState,
  SimulatorSummary,
  StockProfile,
} from "@/types/investing";
import type { QuoteMap } from "@/types/quote";

export type { PriceMap, TradeQuote } from "@/lib/simulator-math";

const SIMULATOR_STORAGE_KEY = "arcanum-simulator";

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createTransactionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStockProfile(ticker: string): StockProfile | undefined {
  return stockProfiles.find(
    (profile) => profile.ticker.toUpperCase() === ticker.toUpperCase(),
  );
}

/** Latest prices from a quote map, for valuing holdings. */
export function pricesFromQuotes(quotes: QuoteMap): PriceMap {
  const prices: PriceMap = {};
  for (const [ticker, quote] of Object.entries(quotes)) {
    if (quote.price > 0) prices[ticker.toUpperCase()] = quote.price;
  }
  return prices;
}

/**
 * The price a trade settles at: the live quote when one is loaded, otherwise
 * the latest daily close from the snapshot. Valuation uses the same quotes,
 * so a trade never shows an instant gain or loss.
 */
export function tradeQuoteFor(ticker: string, quotes: QuoteMap): TradeQuote | null {
  const quote = quotes[ticker.toUpperCase()];
  if (quote && quote.price > 0) {
    return {
      price: quote.price,
      source: quote.source,
      asOf: new Date(quote.updatedAt).toISOString(),
    };
  }

  const bar = getLatestBar(ticker);
  return bar && bar.close > 0
    ? { price: bar.close, source: "historical", asOf: bar.date }
    : null;
}

export function createSimulator(startingCash: number): SimulatorState {
  const now = new Date().toISOString();
  const cash = roundCurrency(Math.max(startingCash, 0));

  return {
    startingCash: cash,
    cashBalance: cash,
    holdings: [],
    transactions: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function getSimulator(prices: PriceMap = {}): SimulatorState | null {
  if (!hasBrowserStorage()) {
    return null;
  }

  const storedState = window.localStorage.getItem(SIMULATOR_STORAGE_KEY);

  if (!storedState) {
    return null;
  }

  try {
    const parsedState = JSON.parse(storedState) as SimulatorState;
    return revalueState(parsedState, prices);
  } catch {
    return null;
  }
}

export function saveSimulator(state: SimulatorState): SimulatorState {
  const updatedState = revalueState({
    ...state,
    updatedAt: new Date().toISOString(),
  });

  if (hasBrowserStorage()) {
    window.localStorage.setItem(
      SIMULATOR_STORAGE_KEY,
      JSON.stringify(updatedState),
    );
    requestCloudSync();
  }

  return updatedState;
}

export function resetSimulator(startingCash: number): SimulatorState {
  return saveSimulator(createSimulator(startingCash));
}

export function calculateSimulatorSummary(
  state: SimulatorState,
  prices: PriceMap = {},
): SimulatorSummary {
  return summarizeState(state, prices);
}

function persist(result: TradeResult, fallback: SimulatorState): SimulatorActionResult {
  if (!result.ok) {
    return { success: false, message: result.message, state: fallback };
  }
  return { success: true, message: result.message, state: saveSimulator(result.state) };
}

export function buyHolding(
  ticker: string,
  amount: number,
  quote: TradeQuote | null,
  thesis?: string,
  preMortem?: string,
): SimulatorActionResult {
  const state = getSimulator();
  const profile = getStockProfile(ticker);

  if (!state) {
    return { success: false, message: "Start a simulation before buying.", state: null };
  }
  if (!profile) {
    return {
      success: false,
      message: "This asset is not available in the simulator yet.",
      state,
    };
  }
  if (!quote) {
    return {
      success: false,
      message: "Price data is unavailable for this asset right now.",
      state,
    };
  }

  return persist(
    applyBuy(state, {
      ticker: profile.ticker,
      name: profile.name,
      amount,
      quote,
      thesis,
      preMortem,
      id: createTransactionId(),
      now: new Date().toISOString(),
    }),
    state,
  );
}

export function sellHolding(
  ticker: string,
  amount: number | "all",
  quote: TradeQuote | null,
): SimulatorActionResult {
  const state = getSimulator();

  if (!state) {
    return { success: false, message: "Start a simulation before selling.", state: null };
  }
  if (!quote) {
    return {
      success: false,
      message: "Price data is unavailable for this asset right now.",
      state,
    };
  }

  return persist(
    applySell(state, {
      ticker,
      amount,
      quote,
      id: createTransactionId(),
      now: new Date().toISOString(),
    }),
    state,
  );
}

export function addThesisReview(
  transactionId: string,
  note: string,
): SimulatorActionResult {
  const state = getSimulator();
  if (!state) {
    return {
      success: false,
      message: "Start a simulation before reviewing theses.",
      state: null,
    };
  }
  const trimmed = note.trim();
  if (trimmed.length < 5) {
    return {
      success: false,
      message: "Add at least a short note — even five words helps next time.",
      state,
    };
  }
  if (trimmed.length > 480) {
    return {
      success: false,
      message: "Keep the review under 480 characters.",
      state,
    };
  }

  const review = { note: trimmed, createdAt: new Date().toISOString() };
  const transactions = state.transactions.map((tx) =>
    tx.id === transactionId
      ? { ...tx, reviews: [...(tx.reviews ?? []), review] }
      : tx,
  );

  const updatedState = saveSimulator({ ...state, transactions });

  return {
    success: true,
    message: "Review saved.",
    state: updatedState,
  };
}
