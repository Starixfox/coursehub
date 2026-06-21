# CourseHub

A subscription-based online learning platform. Creators publish courses
(text + images + video); subscribers learn based on their plan. Built with
Next.js 16, React 19, TypeScript, Tailwind v4 (dark, indigo→violet theme) and
Supabase (Postgres 17 + Row-Level Security). Payments via Stripe; video via
Cloudflare Stream with a zero-config mock fallback.

> The server is the single source of truth for access. The frontend never
> decides what a user may read — RLS policies + server checks do. See
> [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`SECURITY.md`](./SECURITY.md).

## Features

- **Tiered subscriptions** — `free < basic < pro < premium`, enforced in the
  database. Entitlement lives in one `subscriptions` table that only the Stripe
  webhook (service role) can write — clients can never fabricate access.
- **Course catalog** — public landing + searchable/filterable catalog and course
  detail pages. Lesson *metadata* is public for published courses; lesson
  *content + video* is gated row-by-row.
- **Course player** — resume position, mark-complete, per-course progress, and
  Premium completion certificates issued by a server-verified function.
- **Creator studio** — course / module / lesson CRUD, rich-text lessons
  (sanitized before storage), and direct video upload.
- **Admin** — users, courses, subscriptions, and an audit log.
- **Secure media** — videos require short-lived signed playback tokens minted
  only after the server verifies entitlement. `MEDIA_PROVIDER=mock` plays a
  public sample HLS stream so the player works with no video account.
- **Hardened by default** — RLS on every table, CSP/HSTS security headers, zod
  validation, rate limiting, idempotent + signature-verified Stripe webhooks,
  XSS sanitization, an audit trail, and IDOR ownership checks.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (dark indigo→violet) |
| Database / Auth / Storage | Supabase (Postgres 17 + RLS) |
| Server logic | Next.js Route Handlers + Server Actions (Node runtime) |
| Payments | Stripe (Checkout + Customer Portal + webhooks) |
| Video | Cloudflare Stream (signed playback) with a mock provider fallback |

## Local setup

### Prerequisites

- **Node.js 20+** and npm.
- A **Supabase** project (the schema lives in `supabase/migrations/`). You can
  point at the shared hosted demo project or run your own local stack with the
  [Supabase CLI](https://supabase.com/docs/guides/local-development).

### 1. Clone & install

```bash
git clone <your-fork-url> coursehub
cd coursehub
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it | Required? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → **API** → Project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page → **Project API keys** → `anon` / publishable | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | same page → **`service_role` / secret key** (server-only, bypasses RLS) | for webhook sync, seeding, admin tooling |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev | ✅ |
| `MEDIA_PROVIDER` | leave as `mock` to play a sample video with no account | ✅ |
| Stripe / Cloudflare keys | see [Stripe](#enable-stripe) / [Cloudflare](#enable-cloudflare-stream) below | optional |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security. It is **server-only**
> (guarded by `server-only`) and must never be committed or exposed to the
> browser. `.env.local` is git-ignored; only `.env.example` is committed.

### 3. Apply the database schema (only if using your own project)

The hosted demo project is already migrated and seeded. For a fresh project,
replay the migrations with the Supabase CLI:

```bash
supabase link --project-ref <your-ref>
supabase db push          # applies supabase/migrations/* in order (01 → 08)
```

Migration `07_seed_demo_data` already inserts the demo accounts and courses. You
can also (re-)seed idempotently with `npm run seed` (see [Scripts](#scripts)).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

All demo accounts share the password **`CourseHubDemo!2026`**.

| Email | Role | Tier |
|---|---|---|
| `admin@coursehub.dev` | admin | — |
| `creator@coursehub.dev` | creator | — |
| `pro@coursehub.dev` | subscriber | pro |
| `free@coursehub.dev` | subscriber | free |

## Enable Stripe

Billing runs in **mock mode** until you add Stripe test keys. To enable real
Checkout + Customer Portal + webhooks:

1. Create a [Stripe](https://dashboard.stripe.com) account and grab your **test**
   keys → set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Create products + prices for each paid tier (monthly + yearly) and paste the
   price ids into `.env.local`. The fastest way:
   ```bash
   npm run stripe:setup     # creates products/prices, prints STRIPE_PRICE_* lines
   ```
3. Forward webhooks to your local server and set the signing secret:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
   ```

The webhook is the **only** writer of the `subscriptions` table; it is
idempotent (deduped via `stripe_events`) and signature-verified.

## Enable Cloudflare Stream

Video runs in **mock mode** (`MEDIA_PROVIDER=mock`) by default, which plays a
public sample HLS stream so the `<VideoPlayer>` works end-to-end with no account.
For real, signed playback:

1. In Cloudflare, enable **Stream** and create an API token with Stream
   read/write.
2. Set `MEDIA_PROVIDER=cloudflare`, `CLOUDFLARE_ACCOUNT_ID`,
   `CLOUDFLARE_STREAM_API_TOKEN` (and the signing key vars) in `.env.local`.

Videos are uploaded as *require-signed-URLs*; playback tokens are short-lived and
minted server-side only after entitlement is verified, so content cannot be
hot-linked.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack). |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest unit tests. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run security:audit` | Asserts RLS is on every table, no service-role key leaks into the client bundle, and that an anonymous client cannot read gated lesson content. Exits non-zero on failure. |
| `npm run seed` | Idempotent seed of the demo accounts/courses (mirrors migration 07; safe to re-run). |
| `npm run stripe:setup` | Create Stripe products + prices for every tier and print the `STRIPE_PRICE_*` env lines. |

> `seed`, `stripe:setup`, and `security:audit` are run with
> [`tsx`](https://github.com/privatenumber/tsx): `npx tsx scripts/<name>.ts`.
> Add the matching npm scripts to `package.json` if they are not present.

## Deployment

**App → Vercel.** Import the repo, add every variable from `.env.example` as a
Vercel Environment Variable (mark `SUPABASE_SERVICE_ROLE_KEY` and the Stripe
secrets as **server-only / secret**), and set `NEXT_PUBLIC_SITE_URL` to your
production URL. The Node runtime is required for the webhook and media routes.

**Database → Supabase.** Use a dedicated project; apply migrations with
`supabase db push` from CI. After deploy, point your Stripe webhook endpoint at
`https://<your-domain>/api/stripe/webhook` and add the production
`STRIPE_WEBHOOK_SECRET`.

**One post-deploy security step:** enable **Leaked Password Protection**
(HaveIBeenPwned) in Supabase Dashboard → Authentication → Policies. This is the
single remaining open item flagged by the Supabase security advisor — see
[`SECURITY.md`](./SECURITY.md).
