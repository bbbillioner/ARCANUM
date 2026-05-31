-- ARCANUM database schema
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste this whole file → Run

-- ============================================
-- 1. PROFILES (extends auth.users with onboarding answers)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,

  -- Onboarding answers (free-text to mirror the question options exactly)
  budget text,
  goal text,
  time_horizon text,
  risk_comfort text,
  experience text,
  interests text[] default '{}',
  portfolio_style text,
  investment_approach text,
  onboarding_completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. WATCHLIST (followed tickers per user)
-- ============================================
create table if not exists public.watchlist (
  user_id uuid references auth.users on delete cascade not null,
  ticker text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, ticker)
);

alter table public.watchlist enable row level security;

create policy "Users can manage their own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- 3. TRANSACTIONS (real + simulator buys/sells with thesis + pre-mortem)
-- ============================================
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,

  -- 'real' = logged manually from user's actual broker
  -- 'simulator' = paper-trade in ARCANUM's simulator
  kind text not null check (kind in ('real', 'simulator')),
  type text not null check (type in ('buy', 'sell')),

  ticker text not null,
  shares numeric(20, 6) not null,
  price numeric(20, 4) not null,
  amount numeric(20, 4) not null,

  thesis text,
  pre_mortem text,

  -- When the trade actually happened (user can backdate real trades)
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx
  on public.transactions (user_id, occurred_at desc);
create index if not exists transactions_user_ticker_idx
  on public.transactions (user_id, ticker);

alter table public.transactions enable row level security;

create policy "Users can manage their own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- 4. THESIS REVIEWS (30-day follow-up notes on past buys)
-- ============================================
create table if not exists public.thesis_reviews (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists thesis_reviews_transaction_idx
  on public.thesis_reviews (transaction_id, created_at);

alter table public.thesis_reviews enable row level security;

create policy "Users can manage their own thesis reviews"
  on public.thesis_reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- 5. SIMULATOR STATE (cash balance — positions derived from transactions)
-- ============================================
create table if not exists public.simulator_state (
  user_id uuid references auth.users on delete cascade primary key,
  starting_cash numeric(20, 4) not null default 1000,
  cash_balance numeric(20, 4) not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.simulator_state enable row level security;

create policy "Users can manage their own simulator state"
  on public.simulator_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- 6. GOALS (Phase 1 — user-defined financial goals to track against)
-- ============================================
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  label text not null,                          -- e.g. "House down payment"
  target_amount numeric(20, 2) not null,        -- e.g. 50000
  monthly_contribution numeric(20, 2),          -- e.g. 200
  target_date date,                             -- e.g. 2029-12-31
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can manage their own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- Done.
-- After running this, your Supabase Tables section should show:
-- profiles, watchlist, transactions, thesis_reviews, simulator_state, goals
-- All with RLS enabled (the small lock icon next to the table name).
-- ============================================
