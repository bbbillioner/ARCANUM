import { describe, expect, it } from "vitest";

import {
  applyBuy,
  applySell,
  rebuildHoldings,
  revalueState,
  summarizeState,
  type TradeQuote,
} from "@/lib/simulator-math";
import type { SimulatorState } from "@/types/investing";

const NOW = "2026-10-27T15:00:00.000Z";
const THESIS = "Broad, low-cost exposure to the US market.";

function fresh(cash = 10_000): SimulatorState {
  return {
    startingCash: cash,
    cashBalance: cash,
    holdings: [],
    transactions: [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function live(price: number): TradeQuote {
  return { price, source: "live", asOf: NOW };
}

let nextId = 0;
function buy(state: SimulatorState, ticker: string, amount: number, price: number) {
  const result = applyBuy(state, {
    ticker,
    name: ticker,
    amount,
    quote: live(price),
    thesis: THESIS,
    id: `tx-${(nextId += 1)}`,
    now: NOW,
  });
  if (!result.ok) throw new Error(result.message);
  return result.state;
}

function sell(
  state: SimulatorState,
  ticker: string,
  amount: number | "all",
  price: number,
) {
  return applySell(state, {
    ticker,
    amount,
    quote: live(price),
    id: `tx-${(nextId += 1)}`,
    now: NOW,
  });
}

describe("buying", () => {
  it("moves cash into shares at the fill price", () => {
    const state = buy(fresh(), "VOO", 100, 700.59);

    expect(state.cashBalance).toBe(9_900);
    expect(state.holdings).toHaveLength(1);
    expect(state.holdings[0].shares).toBeCloseTo(100 / 700.59, 6);
  });

  it("shows no gain or loss right after a buy (regression: phantom gain)", () => {
    // The old simulator filled at the live quote but valued at the previous
    // close, so a $100 buy showed +$1.45 immediately.
    const state = buy(fresh(), "VOO", 100, 700.59);
    const summary = summarizeState(state, { VOO: 700.59 });

    expect(summary.totalPortfolioValue).toBe(10_000);
    expect(summary.totalGainLoss).toBe(0);
    expect(summary.unrealizedGainLoss).toBe(0);
    expect(state.holdings[0].unrealizedGainLoss).toBe(0);
  });

  it("records where and when the price came from", () => {
    const state = buy(fresh(), "VOO", 100, 700.59);
    const [tx] = state.transactions;

    expect(tx).toMatchObject({
      type: "buy",
      price: 700.59,
      amount: 100,
      priceSource: "live",
      priceAsOf: NOW,
      thesis: THESIS,
    });
  });

  it("averages cost across buys at different prices", () => {
    let state = buy(fresh(), "QQQ", 100, 100); // 1 share
    state = buy(state, "QQQ", 100, 50); // 2 shares

    const [holding] = state.holdings;
    expect(holding.shares).toBe(3);
    expect(holding.averageCost).toBeCloseTo(200 / 3, 10);

    const summary = summarizeState(state, { QQQ: 60 });
    expect(summary.unrealizedGainLoss).toBe(-20);
    expect(summary.totalGainLoss).toBe(-20);
  });

  it.each([
    ["more than the cash balance", 10_001, THESIS, 100],
    ["zero dollars", 0, THESIS, 100],
    ["a negative amount", -5, THESIS, 100],
    ["a thesis under 10 characters", 100, "short", 100],
    ["a thesis over 240 characters", 100, "x".repeat(241), 100],
    ["a missing price", 100, THESIS, 0],
  ])("rejects %s and leaves the state unchanged", (_label, amount, thesis, price) => {
    const state = fresh();
    const result = applyBuy(state, {
      ticker: "VOO",
      name: "VOO",
      amount,
      quote: live(price),
      thesis,
      id: "x",
      now: NOW,
    });

    expect(result.ok).toBe(false);
    expect(state.cashBalance).toBe(10_000);
    expect(state.transactions).toHaveLength(0);
  });
});

describe("selling", () => {
  it("credits the proceeds and records the realized gain", () => {
    let state = buy(fresh(), "MSFT", 1_000, 100); // 10 shares @ 100
    const result = sell(state, "MSFT", 550, 110); // 5 shares @ 110

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    state = result.state;

    expect(state.cashBalance).toBe(9_550);
    expect(state.holdings[0].shares).toBe(5);
    expect(state.transactions[0]).toMatchObject({
      type: "sell",
      shares: 5,
      amount: 550,
      realizedGainLoss: 50,
    });

    const summary = summarizeState(state, { MSFT: 110 });
    expect(summary.realizedGainLoss).toBe(50);
    expect(summary.unrealizedGainLoss).toBe(50);
    expect(summary.totalGainLoss).toBe(100);
  });

  it("rejects selling more than the position is worth at the trade price (regression)", () => {
    // The old guard compared against the snapshot value but sold at the live
    // price, which could credit more cash than the shares were worth.
    const state = buy(fresh(), "NVDA", 100, 100); // 1 share
    const result = sell(state, "NVDA", 90, 80); // worth $80 now

    expect(result.ok).toBe(false);
    expect(state.cashBalance).toBe(9_900);
  });

  it("closes the position when selling its full displayed value", () => {
    let state = buy(fresh(), "VOO", 100, 700.59);
    const worth = Math.round(state.holdings[0].shares * 710 * 100) / 100;
    const result = sell(state, "VOO", worth, 710);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    state = result.state;

    expect(state.holdings).toHaveLength(0);
    expect(state.cashBalance).toBe(9_900 + worth);
  });

  it('"all" closes the position and the gain becomes fully realized', () => {
    let state = buy(fresh(), "COST", 500, 1_000);
    const result = sell(state, "COST", "all", 1_100);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    state = result.state;

    const summary = summarizeState(state);
    expect(state.holdings).toHaveLength(0);
    expect(state.cashBalance).toBe(10_050);
    expect(summary.totalGainLoss).toBe(50);
    expect(summary.realizedGainLoss).toBe(50);
    expect(summary.unrealizedGainLoss).toBe(0);
  });

  it("rejects selling something you don't own", () => {
    expect(sell(fresh(), "VOO", 10, 100).ok).toBe(false);
  });
});

describe("valuation", () => {
  it("values holdings at the quotes provided and keeps the last price otherwise", () => {
    let state = buy(fresh(), "VOO", 1_000, 100);
    state = buy(state, "QQQ", 1_000, 100);

    const valued = revalueState(state, { VOO: 110 });
    const voo = valued.holdings.find((h) => h.ticker === "VOO");
    const qqq = valued.holdings.find((h) => h.ticker === "QQQ");

    expect(voo?.marketValue).toBe(1_100);
    expect(voo?.unrealizedGainLoss).toBe(100);
    expect(qqq?.marketValue).toBe(1_000);
  });

  it("total gain/loss is portfolio value minus starting cash, as a % of starting cash", () => {
    const state = buy(fresh(1_000), "VOO", 500, 100);
    const summary = summarizeState(state, { VOO: 90 });

    expect(summary.totalPortfolioValue).toBe(950);
    expect(summary.totalGainLoss).toBe(-50);
    expect(summary.totalGainLossPercent).toBe(-5);
    expect(summary.cashAllocationPercent).toBeCloseTo((500 / 950) * 100, 2);
  });
});

describe("rebuilding from transactions (cloud restore)", () => {
  it("reproduces the same shares and average cost as live trading", () => {
    let state = buy(fresh(), "VOO", 300, 100);
    state = buy(state, "VOO", 200, 80);
    const result = sell(state, "VOO", 150, 90);
    if (!result.ok) throw new Error(result.message);
    state = result.state;

    const rebuilt = rebuildHoldings(state.transactions);
    const original = state.holdings[0];

    expect(rebuilt).toHaveLength(1);
    expect(rebuilt[0].shares).toBeCloseTo(original.shares, 6);
    expect(rebuilt[0].averageCost).toBeCloseTo(original.averageCost, 6);
    expect(rebuilt[0].currentPrice).toBe(90);
  });

  it("drops positions that were fully sold", () => {
    const state = buy(fresh(), "VOO", 100, 100);
    const result = sell(state, "VOO", "all", 100);
    if (!result.ok) throw new Error(result.message);

    expect(rebuildHoldings(result.state.transactions)).toHaveLength(0);
  });
});
