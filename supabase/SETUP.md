# Supabase setup — for you to do

These are the two things only you can do (clicking buttons in dashboards I
can't reach). Do them in order. ~10 minutes total.

---

## 1 · Run the database schema

The schema lives at [`schema.sql`](./schema.sql) in this folder. It creates
the six tables ARCANUM needs (profiles, watchlist, transactions,
thesis_reviews, simulator_state, goals) plus row-level security so users
can only see their own data.

1. Open your Supabase project dashboard
2. Left sidebar → **SQL Editor**
3. Click **+ New query**
4. Open `supabase/schema.sql` in this repo, **copy the whole file**
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)

You should see "Success. No rows returned." If you see an error, send it to
me — most likely a typo I need to fix.

**To verify:** Left sidebar → **Table Editor**. You should see all six
tables listed. Each should have a small **🔒 lock icon** next to it
indicating Row Level Security is enabled.

---

## 2 · Set the redirect URL for auth

Magic-link emails need to know where to send users back. By default they go
to localhost, which won't work in production.

1. Supabase dashboard → **Authentication** (left sidebar)
2. Click **URL Configuration** (or **Settings**)
3. **Site URL**: set to `http://localhost:3000` for now (we change to your
   real domain on launch day)
4. **Redirect URLs**: add both of these on separate lines:
   ```
   http://localhost:3000/auth/callback
   https://*.vercel.app/auth/callback
   ```
   (The wildcard lets your Vercel preview deploys also work.)
5. **Save**

When you deploy to a real domain (e.g. `arcanum.app`), add that to both
fields. Until then, only localhost and Vercel preview URLs work.

---

## 3 · Push the same env vars to Vercel

Locally I created `.env.local` with the three Supabase keys. Vercel
production needs them too.

1. Open your project in the Vercel dashboard
2. **Settings** → **Environment Variables**
3. Add three variables (one at a time). For each, leave all environments
   ticked (Production, Preview, Development):

   | Name | Where to find the value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API → "Project URL" |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API → Publishable key (`sb_publishable_…`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API → Secret key (`sb_secret_…`) — reveal first |

   The exact values are already saved in your local `.env.local`. Copy
   each one from there into Vercel, one at a time.

4. Also add `NEXT_PUBLIC_SITE_URL` pointing at your Vercel deployment URL
   (or your custom domain when you add one).
5. **Save**. Vercel will redeploy automatically and the new env vars take
   effect on the next deploy.

---

## 4 · Rotate the secret key (security hygiene)

You shared the `service_role` secret in our chat. The actual risk is near
zero (the DB has no real user data yet), but the right habit is to rotate
any secret that's ever been shared anywhere.

1. Supabase dashboard → **Project Settings** → **API Keys**
2. In the **Secret keys** section, click the **⋮** next to your current key
3. Choose **Roll** (or click **+ New secret key** and delete the old one)
4. **Copy the new value**
5. Go back to Vercel → Environment Variables → edit
   `SUPABASE_SERVICE_ROLE_KEY` → paste the new value → Save
6. Also update your local `.env.local` with the new value
7. Done. The old key is dead, the new one works in both places.

Going forward, never paste a secret in chat. Generate → paste directly
into `.env.local` and Vercel.

---

## When you're done with 1, 2, and 3

Tell me and I'll do the next round of work: wiring the auth-aware data
hooks (so logged-in users get cloud sync for their portfolio, watchlist,
journal, and onboarding answers; anonymous users keep using localStorage).

You can do #4 (rotation) any time after — doesn't block anything.
