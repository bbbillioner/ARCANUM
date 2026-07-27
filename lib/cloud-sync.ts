"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getCurrentPrice } from "@/lib/prices";
import { getAnyProfile } from "@/lib/stocks";
import type {
  OnboardingAnswers,
  SimulatorHolding,
  SimulatorState,
  SimulatorTransaction,
  ThesisReview,
} from "@/types/investing";

export const ARCANUM_DATA_CHANGED_EVENT = "arcanum:data-changed";
export const ARCANUM_CLOUD_DATA_LOADED_EVENT = "arcanum:cloud-data-loaded";

const ONBOARDING_KEY = "arcanum-onboarding";
const ONBOARDING_UPDATED_KEY = "arcanum-onboarding-updated-at";
const SIMULATOR_KEY = "arcanum-simulator";
const WATCHLIST_KEY = "arcanum-watchlist";
const SYNC_STATUS_KEY = "arcanum-sync-status";
const CLOUD_USER_KEY = "arcanum-cloud-user";

export type CloudSyncStatus = {
  state: "idle" | "syncing" | "synced" | "error";
  updatedAt: string;
  message?: string;
};

type SyncMode = "initial" | "push";

type ProfileRow = {
  budget: string | null;
  goal: string | null;
  time_horizon: string | null;
  risk_comfort: string | null;
  experience: string | null;
  interests: string[] | null;
  portfolio_style: string | null;
  investment_approach: string | null;
  onboarding_completed_at: string | null;
  updated_at: string | null;
};

type SimulatorStateRow = {
  starting_cash: number | string;
  cash_balance: number | string;
  created_at: string;
  updated_at: string;
};

type TransactionRow = {
  id: string;
  type: "buy" | "sell";
  ticker: string;
  shares: number | string;
  price: number | string;
  amount: number | string;
  thesis: string | null;
  pre_mortem: string | null;
  occurred_at: string;
};

type ReviewRow = {
  transaction_id: string;
  note: string;
  created_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

function setSyncStatus(status: CloudSyncStatus) {
  window.localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
  window.dispatchEvent(new CustomEvent("arcanum:sync-status", { detail: status }));
}

export function getCloudSyncStatus(): CloudSyncStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SYNC_STATUS_KEY);
    return raw ? (JSON.parse(raw) as CloudSyncStatus) : null;
  } catch {
    return null;
  }
}

export function requestCloudSync() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ARCANUM_DATA_CHANGED_EVENT));
}

function isOnboardingAnswers(value: unknown): value is OnboardingAnswers {
  if (!value || typeof value !== "object") return false;
  const answers = value as Partial<OnboardingAnswers>;
  return (
    typeof answers.budget === "string" &&
    typeof answers.goal === "string" &&
    typeof answers.timeHorizon === "string" &&
    typeof answers.riskComfort === "string" &&
    typeof answers.experience === "string" &&
    Array.isArray(answers.interests) &&
    answers.interests.every((interest) => typeof interest === "string") &&
    typeof answers.portfolioStyle === "string" &&
    typeof answers.investmentApproach === "string"
  );
}

function readOnboarding(): OnboardingAnswers | null {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isOnboardingAnswers(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function profileToAnswers(profile: ProfileRow | null): OnboardingAnswers | null {
  if (
    !profile?.onboarding_completed_at ||
    !profile.budget ||
    !profile.goal ||
    !profile.time_horizon ||
    !profile.risk_comfort ||
    !profile.experience ||
    !profile.portfolio_style ||
    !profile.investment_approach
  ) {
    return null;
  }

  return {
    budget: profile.budget,
    goal: profile.goal,
    timeHorizon: profile.time_horizon,
    riskComfort: profile.risk_comfort,
    experience: profile.experience,
    interests: profile.interests ?? [],
    portfolioStyle: profile.portfolio_style,
    investmentApproach: profile.investment_approach,
  };
}

async function pushOnboarding(
  supabase: SupabaseClient,
  userId: string,
  answers: OnboardingAnswers,
  completedAt: string,
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      budget: answers.budget,
      goal: answers.goal,
      time_horizon: answers.timeHorizon,
      risk_comfort: answers.riskComfort,
      experience: answers.experience,
      interests: answers.interests,
      portfolio_style: answers.portfolioStyle,
      investment_approach: answers.investmentApproach,
      onboarding_completed_at: completedAt,
      updated_at: nowIso(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

async function clearCloudOnboarding(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      budget: null,
      goal: null,
      time_horizon: null,
      risk_comfort: null,
      experience: null,
      interests: [],
      portfolio_style: null,
      investment_approach: null,
      onboarding_completed_at: null,
      updated_at: nowIso(),
    })
    .eq("id", userId);
  if (error) throw error;
}

async function syncOnboarding(
  supabase: SupabaseClient,
  userId: string,
  mode: SyncMode,
): Promise<boolean> {
  const local = readOnboarding();
  const localUpdatedAt = window.localStorage.getItem(ONBOARDING_UPDATED_KEY);
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "budget,goal,time_horizon,risk_comfort,experience,interests,portfolio_style,investment_approach,onboarding_completed_at,updated_at",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;

  const remote = profileToAnswers(data as ProfileRow | null);
  if (mode === "push") {
    if (local) await pushOnboarding(supabase, userId, local, localUpdatedAt ?? nowIso());
    else await clearCloudOnboarding(supabase, userId);
    return false;
  }

  if (local && !remote) {
    const completedAt = localUpdatedAt ?? nowIso();
    await pushOnboarding(supabase, userId, local, completedAt);
    window.localStorage.setItem(ONBOARDING_UPDATED_KEY, completedAt);
    return false;
  }

  if (!local && remote) {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(remote));
    window.localStorage.setItem(
      ONBOARDING_UPDATED_KEY,
      (data as ProfileRow).updated_at ?? (data as ProfileRow).onboarding_completed_at ?? nowIso(),
    );
    return true;
  }

  if (local && remote) {
    const remoteUpdatedAt = (data as ProfileRow).updated_at;
    if (
      localUpdatedAt &&
      (!remoteUpdatedAt || Date.parse(localUpdatedAt) >= Date.parse(remoteUpdatedAt))
    ) {
      await pushOnboarding(supabase, userId, local, localUpdatedAt);
      return false;
    }

    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(remote));
    window.localStorage.setItem(
      ONBOARDING_UPDATED_KEY,
      remoteUpdatedAt ?? (data as ProfileRow).onboarding_completed_at ?? nowIso(),
    );
    return JSON.stringify(local) !== JSON.stringify(remote);
  }

  return false;
}

function readWatchlist(): string[] {
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(
        parsed
          .filter((ticker): ticker is string => typeof ticker === "string")
          .map((ticker) => ticker.toUpperCase()),
      ),
    );
  } catch {
    return [];
  }
}

function readSimulator(): SimulatorState | null {
  try {
    const raw = window.localStorage.getItem(SIMULATOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SimulatorState>;
    if (
      typeof parsed.startingCash !== "number" ||
      typeof parsed.cashBalance !== "number" ||
      !Array.isArray(parsed.holdings) ||
      !Array.isArray(parsed.transactions) ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }
    return parsed as SimulatorState;
  } catch {
    return null;
  }
}

async function replaceCloudWatchlist(
  supabase: SupabaseClient,
  userId: string,
  tickers: string[],
) {
  const { error: deleteError } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId);
  if (deleteError) throw deleteError;
  if (tickers.length === 0) return;
  const { error: insertError } = await supabase.from("watchlist").insert(
    tickers.map((ticker) => ({ user_id: userId, ticker })),
  );
  if (insertError) throw insertError;
}

async function syncWatchlist(
  supabase: SupabaseClient,
  userId: string,
  mode: SyncMode,
  mergeLocalOnInitial: boolean,
): Promise<boolean> {
  const local = readWatchlist();
  if (mode === "push") {
    await replaceCloudWatchlist(supabase, userId, local);
    return false;
  }

  const { data, error } = await supabase
    .from("watchlist")
    .select("ticker")
    .eq("user_id", userId);
  if (error) throw error;
  const remote = (data ?? []).map((row) => String(row.ticker).toUpperCase());
  const resolved = mergeLocalOnInitial
    ? Array.from(new Set([...remote, ...local])).sort()
    : Array.from(new Set(remote)).sort();
  if (mergeLocalOnInitial) {
    await replaceCloudWatchlist(supabase, userId, resolved);
  }
  if (JSON.stringify([...local].sort()) === JSON.stringify(resolved)) return false;
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(resolved));
  return true;
}

function numberValue(value: number | string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, places: number) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function buildHoldings(
  transactions: SimulatorTransaction[],
  cashBalance: number,
): SimulatorHolding[] {
  const positions = new Map<string, { shares: number; averageCost: number }>();
  const chronological = [...transactions].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );

  for (const transaction of chronological) {
    const current = positions.get(transaction.ticker) ?? {
      shares: 0,
      averageCost: transaction.price,
    };
    if (transaction.type === "buy") {
      const shares = current.shares + transaction.shares;
      const cost = current.averageCost * current.shares + transaction.amount;
      positions.set(transaction.ticker, {
        shares,
        averageCost: shares > 0 ? cost / shares : transaction.price,
      });
    } else {
      const shares = Math.max(0, current.shares - transaction.shares);
      if (shares < 0.000001) positions.delete(transaction.ticker);
      else positions.set(transaction.ticker, { ...current, shares });
    }
  }

  const holdings = Array.from(positions.entries()).map(([ticker, position]) => {
    const currentPrice = getCurrentPrice(ticker) || position.averageCost;
    const investedAmount = position.averageCost * position.shares;
    const marketValue = currentPrice * position.shares;
    const unrealizedGainLoss = marketValue - investedAmount;
    return {
      ticker,
      name: getAnyProfile(ticker)?.name ?? ticker,
      shares: round(position.shares, 6),
      averageCost: round(position.averageCost, 2),
      currentPrice: round(currentPrice, 2),
      investedAmount: round(investedAmount, 2),
      marketValue: round(marketValue, 2),
      unrealizedGainLoss: round(unrealizedGainLoss, 2),
      unrealizedGainLossPercent:
        investedAmount > 0 ? round((unrealizedGainLoss / investedAmount) * 100, 2) : 0,
      allocationPercent: 0,
    };
  });
  const totalValue = cashBalance + holdings.reduce((sum, item) => sum + item.marketValue, 0);
  return holdings.map((holding) => ({
    ...holding,
    allocationPercent:
      totalValue > 0 ? round((holding.marketValue / totalValue) * 100, 2) : 0,
  }));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeTransactionIds(state: SimulatorState): SimulatorState {
  let changed = false;
  const transactions = state.transactions.map((transaction) => {
    if (isUuid(transaction.id)) return transaction;
    changed = true;
    return { ...transaction, id: crypto.randomUUID() };
  });
  if (!changed) return state;
  const normalized = { ...state, transactions };
  window.localStorage.setItem(SIMULATOR_KEY, JSON.stringify(normalized));
  return normalized;
}

async function pullCloudSimulator(
  supabase: SupabaseClient,
  userId: string,
  stateRow: SimulatorStateRow,
): Promise<SimulatorState> {
  const { data: transactionData, error: transactionError } = await supabase
    .from("transactions")
    .select("id,type,ticker,shares,price,amount,thesis,pre_mortem,occurred_at")
    .eq("user_id", userId)
    .eq("kind", "simulator")
    .order("occurred_at", { ascending: false });
  if (transactionError) throw transactionError;

  const transactionRows = (transactionData ?? []) as TransactionRow[];
  const transactionIds = transactionRows.map((transaction) => transaction.id);
  let reviewRows: ReviewRow[] = [];
  if (transactionIds.length > 0) {
    const { data: reviewData, error: reviewError } = await supabase
      .from("thesis_reviews")
      .select("transaction_id,note,created_at")
      .eq("user_id", userId)
      .in("transaction_id", transactionIds);
    if (reviewError) throw reviewError;
    reviewRows = (reviewData ?? []) as ReviewRow[];
  }

  const reviewsByTransaction = new Map<string, ThesisReview[]>();
  for (const review of reviewRows) {
    const existing = reviewsByTransaction.get(review.transaction_id) ?? [];
    existing.push({ note: review.note, createdAt: review.created_at });
    reviewsByTransaction.set(review.transaction_id, existing);
  }

  const transactions: SimulatorTransaction[] = transactionRows.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    ticker: transaction.ticker,
    shares: numberValue(transaction.shares),
    price: numberValue(transaction.price),
    amount: numberValue(transaction.amount),
    createdAt: transaction.occurred_at,
    thesis: transaction.thesis ?? undefined,
    preMortem: transaction.pre_mortem ?? undefined,
    reviews: reviewsByTransaction.get(transaction.id) ?? [],
  }));
  const cashBalance = numberValue(stateRow.cash_balance);
  return {
    startingCash: numberValue(stateRow.starting_cash),
    cashBalance,
    holdings: buildHoldings(transactions, cashBalance),
    transactions,
    createdAt: stateRow.created_at,
    updatedAt: stateRow.updated_at,
  };
}

async function pushSimulator(
  supabase: SupabaseClient,
  userId: string,
  sourceState: SimulatorState | null,
) {
  const state = sourceState ? normalizeTransactionIds(sourceState) : null;
  const { error: transactionDeleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId)
    .eq("kind", "simulator");
  if (transactionDeleteError) throw transactionDeleteError;

  if (!state) {
    const { error } = await supabase
      .from("simulator_state")
      .delete()
      .eq("user_id", userId);
    if (error) throw error;
    return;
  }

  const { error: stateError } = await supabase.from("simulator_state").upsert(
    {
      user_id: userId,
      starting_cash: state.startingCash,
      cash_balance: state.cashBalance,
      created_at: state.createdAt,
      updated_at: state.updatedAt,
    },
    { onConflict: "user_id" },
  );
  if (stateError) throw stateError;

  if (state.transactions.length === 0) return;
  const { error: transactionError } = await supabase.from("transactions").insert(
    state.transactions.map((transaction) => ({
      id: transaction.id,
      user_id: userId,
      kind: "simulator",
      type: transaction.type,
      ticker: transaction.ticker,
      shares: transaction.shares,
      price: transaction.price,
      amount: transaction.amount,
      thesis: transaction.thesis ?? null,
      pre_mortem: transaction.preMortem ?? null,
      occurred_at: transaction.createdAt,
      created_at: transaction.createdAt,
    })),
  );
  if (transactionError) throw transactionError;

  const reviews = state.transactions.flatMap((transaction) =>
    (transaction.reviews ?? []).map((review) => ({
      transaction_id: transaction.id,
      user_id: userId,
      note: review.note,
      created_at: review.createdAt,
    })),
  );
  if (reviews.length > 0) {
    const { error: reviewError } = await supabase.from("thesis_reviews").insert(reviews);
    if (reviewError) throw reviewError;
  }
}

async function syncSimulator(
  supabase: SupabaseClient,
  userId: string,
  mode: SyncMode,
): Promise<boolean> {
  const local = readSimulator();
  if (mode === "push") {
    await pushSimulator(supabase, userId, local);
    return false;
  }

  const { data, error } = await supabase
    .from("simulator_state")
    .select("starting_cash,cash_balance,created_at,updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  const remoteState = data as SimulatorStateRow | null;

  if (local && !remoteState) {
    await pushSimulator(supabase, userId, local);
    return false;
  }
  if (!local && remoteState) {
    const remote = await pullCloudSimulator(supabase, userId, remoteState);
    window.localStorage.setItem(SIMULATOR_KEY, JSON.stringify(remote));
    return true;
  }
  if (local && remoteState) {
    if (Date.parse(local.updatedAt) >= Date.parse(remoteState.updated_at)) {
      await pushSimulator(supabase, userId, local);
      return false;
    }
    const remote = await pullCloudSimulator(supabase, userId, remoteState);
    window.localStorage.setItem(SIMULATOR_KEY, JSON.stringify(remote));
    return true;
  }
  return false;
}

export async function syncArcanumData(
  supabase: SupabaseClient,
  userId: string,
  mode: SyncMode,
): Promise<{ localChanged: boolean }> {
  setSyncStatus({ state: "syncing", updatedAt: nowIso() });
  try {
    const linkedUserId = window.localStorage.getItem(CLOUD_USER_KEY);
    let accountSwitchClearedLocal = false;
    if (mode === "initial" && linkedUserId && linkedUserId !== userId) {
      window.localStorage.removeItem(ONBOARDING_KEY);
      window.localStorage.removeItem(ONBOARDING_UPDATED_KEY);
      window.localStorage.removeItem(SIMULATOR_KEY);
      window.localStorage.removeItem(WATCHLIST_KEY);
      accountSwitchClearedLocal = true;
    }
    const shouldMergeAnonymousWatchlist = mode === "initial" && !linkedUserId;
    const results = await Promise.all([
      syncOnboarding(supabase, userId, mode),
      syncWatchlist(supabase, userId, mode, shouldMergeAnonymousWatchlist),
      syncSimulator(supabase, userId, mode),
    ]);
    window.localStorage.setItem(CLOUD_USER_KEY, userId);
    const status = { state: "synced" as const, updatedAt: nowIso() };
    setSyncStatus(status);
    return { localChanged: accountSwitchClearedLocal || results.some(Boolean) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloud sync failed.";
    setSyncStatus({ state: "error", updatedAt: nowIso(), message });
    throw error;
  }
}
