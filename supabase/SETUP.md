# Supabase production setup

These steps require access to the Supabase and Vercel dashboards and cannot be
completed from the repository alone.

## 1. Run the database schema

1. Open the Supabase project dashboard.
2. Open **SQL Editor** and create a new query.
3. Paste the complete contents of `supabase/schema.sql`.
4. Run the query.
5. In **Table Editor**, verify these tables exist:
   `profiles`, `watchlist`, `transactions`, `thesis_reviews`,
   `simulator_state`, and `goals`.
6. Verify Row Level Security is enabled on every table.

The schema is designed to be safe to run again when bringing an existing
project up to date.

## 2. Configure passwordless email authentication

In **Authentication > URL Configuration**:

- Local Site URL: `http://localhost:3000`
- Local redirect URL: `http://localhost:3000/auth/callback`
- Preview redirect URL: `https://*.vercel.app/auth/callback`
- Production redirect URL: `https://YOUR-DOMAIN/auth/callback`

Before public launch, set the Site URL to the canonical production domain while
retaining localhost and preview URLs in the allowed redirect list.

Send a real magic link and verify that it returns to `/auth/callback`, creates a
session, and redirects to `/today`.

## 3. Configure environment variables

Create local `.env.local` from `.env.example`. Add the same variables in Vercel
under **Project Settings > Environment Variables**:

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Publishable browser key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server-only account deletion |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical app origin |

Set `NEXT_PUBLIC_SITE_URL` separately when preview and production environments
use different canonical origins. Redeploy after changing any `NEXT_PUBLIC_`
value because Next.js embeds public values at build time.

## 4. Rotate exposed secrets

Rotate any service-role or secret key that has ever appeared in chat, a commit,
a screenshot, or logs. Update both `.env.local` and Vercel after rotation. Never
place the real service-role key in a `NEXT_PUBLIC_` variable.

## 5. Production verification

Use two browsers or devices to verify:

1. Anonymous onboarding, watchlist, and simulator data persist after refresh.
2. Signing in migrates existing local data to the account.
3. The same account on a second device receives the synchronized data.
4. A simulator trade and journal review appear on the other device after focus
   or refresh.
5. Clearing product data removes synchronized copies.
6. Export downloads a JSON file.
7. Permanent account deletion signs the user out and removes their Supabase
   authentication user and related rows.

## 6. Security verification

Create two test users. Confirm in the application and Supabase SQL tools that
neither can read, update, or delete the other user's rows. Keep Row Level
Security enabled and do not use the admin client for normal product reads or
writes.
