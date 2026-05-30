import { stockProfiles } from "@/data/stocks";
import { getCurrentPrice } from "@/lib/prices";
import type {
  SimulatorActionResult,
  SimulatorHolding,
  SimulatorState,
  SimulatorSummary,
  StockProfile,
} from "@/types/investing";

const SIMULATOR_STORAGE_KEY = "arcanum-simulator";
const MIN_HOLDING_VALUE = 0.01;

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundShares(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
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

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return roundCurrency(Math.max(amount, 0));
}

function recalculateState(state: SimulatorState): SimulatorState {
  const holdings = state.holdings
    .map((holding) => {
      const profile = getStockProfile(holding.ticker);
      const livePrice = profile ? getCurrentPrice(profile.ticker) : 0;
      const currentPrice = livePrice > 0 ? livePrice : holding.currentPrice;
      const shares = roundShares(holding.shares);
      const investedAmount = roundCurrency(holding.averageCost * shares);
      const marketValue = roundCurrency(shares * currentPrice);
      const unrealizedGainLoss = roundCurrency(marketValue - investedAmount);
      const unrealizedGainLossPercent =
        investedAmount > 0
          ? roundPercent((unrealizedGainLoss / investedAmount) * 100)
          : 0;

      return {
        ...holding,
        name: profile?.name ?? holding.name,
        shares,
        currentPrice,
        investedAmount,
        marketValue,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        allocationPercent: 0,
      };
    })
    .filter((holding) => holding.marketValue >= MIN_HOLDING_VALUE);

  const investedValue = holdings.reduce(
    (total, holding) => total + holding.marketValue,
    0,
  );
  const totalPortfolioValue = roundCurrency(state.cashBalance + investedValue);

  return {
    ...state,
    cashBalance: roundCurrency(state.cashBalance),
    holdings: holdings.map((holding) => ({
      ...holding,
      allocationPercent:
        totalPortfolioValue > 0
          ? roundPercent((holding.marketValue / totalPortfolioValue) * 100)
          : 0,
    })),
  };
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

export function getSimulator(): SimulatorState | null {
  if (!hasBrowserStorage()) {
    return null;
  }

  const storedState = window.localStorage.getItem(SIMULATOR_STORAGE_KEY);

  if (!storedState) {
    return null;
  }

  try {
    const parsedState = JSON.parse(storedState) as SimulatorState;
    return recalculateState(parsedState);
  } catch {
    return null;
  }
}

export function saveSimulator(state: SimulatorState): SimulatorState {
  const updatedState = recalculateState({
    ...state,
    updatedAt: new Date().toISOString(),
  });

  if (hasBrowserStorage()) {
    window.localStorage.setItem(
      SIMULATOR_STORAGE_KEY,
      JSON.stringify(updatedState),
    );
  }

  return updatedState;
}

export function resetSimulator(startingCash: number): SimulatorState {
  return saveSimulator(createSimulator(startingCash));
}

export function calculateSimulatorSummary(
  state: SimulatorState,
): SimulatorSummary {
  const recalculatedState = recalculateState(state);
  const investedValue = roundCurrency(
    recalculatedState.holdings.reduce(
      (total, holding) => total + holding.marketValue,
      0,
    ),
  );
  const totalPortfolioValue = roundCurrency(
    recalculatedState.cashBalance + investedValue,
  );
  const totalGainLoss = roundCurrency(
    recalculatedState.holdings.reduce(
      (total, holding) => total + holding.unrealizedGainLoss,
      0,
    ),
  );
  const totalGainLossPercent =
    recalculatedState.startingCash > 0
      ? roundPercent((totalGainLoss / recalculatedState.startingCash) * 100)
      : 0;

  return {
    totalPortfolioValue,
    cashBalance: recalculatedState.cashBalance,
    investedValue,
    totalGainLoss,
    totalGainLossPercent,
    cashAllocationPercent:
      totalPortfolioValue > 0
        ? roundPercent((recalculatedState.cashBalance / totalPortfolioValue) * 100)
        : 0,
    investedAllocationPercent:
      totalPortfolioValue > 0
        ? roundPercent((investedValue / totalPortfolioValue) * 100)
        : 0,
  };
}

export function buyHolding(
  ticker: string,
  amount: number,
  tradePrice?: number,
): SimulatorActionResult {
  const state = getSimulator();
  const normalizedAmount = normalizeAmount(amount);
  const profile = getStockProfile(ticker);

  if (!state) {
    return {
      success: false,
      message: "Start a simulation before buying.",
      state: null,
    };
  }

  if (!profile) {
    return {
      success: false,
      message: "This asset is not available in the simulator yet.",
      state,
    };
  }

  if (normalizedAmount <= 0) {
    return {
      success: false,
      message: "Enter a dollar amount greater than $0.",
      state,
    };
  }

  if (normalizedAmount > state.cashBalance) {
    return {
      success: false,
      message: "You do not have enough fake cash for that purchase.",
      state,
    };
  }

  const currentPrice =
    typeof tradePrice === "number" && tradePrice > 0
      ? tradePrice
      : getCurrentPrice(profile.ticker);

  if (currentPrice <= 0) {
    return {
      success: false,
      message: "Price data is unavailable for this asset right now.",
      state,
    };
  }

  const sharesBought = roundShares(normalizedAmount / currentPrice);
  const existingHolding = state.holdings.find(
    (holding) => holding.ticker === profile.ticker,
  );
  let holdings: SimulatorHolding[];

  if (existingHolding) {
    const previousCostBasis = existingHolding.averageCost * existingHolding.shares;
    const shares = roundShares(existingHolding.shares + sharesBought);
    const costBasis = previousCostBasis + normalizedAmount;

    holdings = state.holdings.map((holding) =>
      holding.ticker === profile.ticker
        ? {
            ...holding,
            shares,
            averageCost: roundCurrency(costBasis / shares),
          }
        : holding,
    );
  } else {
    holdings = [
      ...state.holdings,
      {
        ticker: profile.ticker,
        name: profile.name,
        shares: sharesBought,
        averageCost: currentPrice,
        currentPrice,
        investedAmount: normalizedAmount,
        marketValue: normalizedAmount,
        unrealizedGainLoss: 0,
        unrealizedGainLossPercent: 0,
        allocationPercent: 0,
      },
    ];
  }

  const updatedState = saveSimulator({
    ...state,
    cashBalance: roundCurrency(state.cashBalance - normalizedAmount),
    holdings,
    transactions: [
      {
        id: createTransactionId(),
        type: "buy",
        ticker: profile.ticker,
        shares: sharesBought,
        price: currentPrice,
        amount: normalizedAmount,
        createdAt: new Date().toISOString(),
      },
      ...state.transactions,
    ],
  });

  return {
    success: true,
    message: `Bought $${normalizedAmount.toFixed(2)} of ${profile.ticker}.`,
    state: updatedState,
  };
}

export function sellHolding(
  ticker: string,
  amount: number,
  tradePrice?: number,
): SimulatorActionResult {
  const state = getSimulator();
  const normalizedAmount = normalizeAmount(amount);

  if (!state) {
    return {
      success: false,
      message: "Start a simulation before selling.",
      state: null,
    };
  }

  const holding = state.holdings.find(
    (currentHolding) => currentHolding.ticker.toUpperCase() === ticker.toUpperCase(),
  );

  if (!holding) {
    return {
      success: false,
      message: "You do not own this asset in the simulator.",
      state,
    };
  }

  if (normalizedAmount <= 0) {
    return {
      success: false,
      message: "Enter a dollar amount greater than $0.",
      state,
    };
  }

  if (normalizedAmount > holding.marketValue) {
    return {
      success: false,
      message: "You cannot sell more than the holding is worth.",
      state,
    };
  }

  const livePrice =
    typeof tradePrice === "number" && tradePrice > 0
      ? tradePrice
      : getCurrentPrice(holding.ticker);
  const currentPrice = livePrice > 0 ? livePrice : holding.currentPrice;
  const sharesSold = roundShares(normalizedAmount / currentPrice);
  const remainingShares = roundShares(Math.max(holding.shares - sharesSold, 0));
  const holdings = state.holdings
    .map((currentHolding) =>
      currentHolding.ticker === holding.ticker
        ? {
            ...currentHolding,
            shares: remainingShares,
          }
        : currentHolding,
    )
    .filter((currentHolding) => {
      const live = getCurrentPrice(currentHolding.ticker);
      const price = live > 0 ? live : currentHolding.currentPrice;
      return currentHolding.shares * price >= MIN_HOLDING_VALUE;
    });

  const updatedState = saveSimulator({
    ...state,
    cashBalance: roundCurrency(state.cashBalance + normalizedAmount),
    holdings,
    transactions: [
      {
        id: createTransactionId(),
        type: "sell",
        ticker: holding.ticker,
        shares: sharesSold,
        price: currentPrice,
        amount: normalizedAmount,
        createdAt: new Date().toISOString(),
      },
      ...state.transactions,
    ],
  });

  return {
    success: true,
    message: `Sold $${normalizedAmount.toFixed(2)} of ${holding.ticker}.`,
    state: updatedState,
  };
}
