# Local environment setup

Real credentials are intentionally absent from this repository. The ignored
`.env.local` file is machine-specific and must never be committed.

## New laptop setup

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Replace the placeholders using the Supabase dashboard and the local or
   deployed site URL.
5. Run `npm run check` and `npm run build`, then start with `npm run dev`.

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL. Browser-safe.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/publishable key.
  Browser-safe and constrained by Row Level Security.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only administrative credential used by
  server routes. Never expose it to browser code.
- `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` locally; the canonical HTTPS
  URL in production.

For deployment, configure the same variables in Vercel rather than uploading a
local environment file.

## Rules for developers and AI assistants

- Never commit `.env.local`.
- Never replace template placeholders with real values.
- Never print the service-role key in logs, screenshots, chat, or test output.
- Use `.env.example` as the canonical variable-name reference.
- If a secret may have been exposed, rotate it in the Supabase dashboard.
