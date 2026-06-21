# CourseHub — Progress

Status of each subsystem and what each build agent delivered.

## Phase 0 — Foundation ✅ (architect + auth/security + backend)

- [x] New `coursehub` repo (Next.js 16 + TS + Tailwind v4), CI-ready.
- [x] Live Supabase project provisioned (isolated, free tier).
- [x] Schema + RLS on **every** table (migrations 01–08).
- [x] Entitlement engine (`has_tier_access`, `can_access_lesson`) + safe RPC wrappers.
- [x] Security hardening: `SECURITY DEFINER` helpers moved to non-exposed `private`
      schema — **0 advisor warnings** except the optional leaked-password toggle.
- [x] Demo seed: 4 accounts, 3 courses (all tiers), preview lessons, a Pro sub.
- [x] Shared lib contract: env, supabase clients, auth/session, entitlements,
      stripe, media provider, security (headers/rate-limit/sanitize/audit), zod.
- [x] Design system (dark indigo/violet) + UI primitives.
- [x] Middleware: session refresh + auth gate + security headers.

## Phase 1 — Subsystems (parallel) ✅

Built by 10 parallel agents (~828K tokens) on the fixed contract; 100 files.

- [x] **Auth** — login / register / reset / verify-email / MFA scaffold + server actions (rate-limited, audited, no email enumeration).
- [x] **Payments** — pricing page, Checkout, Customer Portal, signature-verified idempotent webhook, service-role sync.
- [x] **Media** — direct-upload route, signed playback-token route (post-entitlement), `<VideoPlayer>` (hls.js) + uploader.
- [x] **Public** — landing, catalog (search/filter), course detail w/ curriculum + preview player.
- [x] **Subscriber** — dashboard (continue learning), course player w/ progress + resume + complete, account.
- [x] **Creator** — course/module/lesson CRUD, media upload, sanitized rich content, publish.
- [x] **Admin** — users, courses, subscriptions, analytics (active subs, est. MRR, popular courses).
- [x] **Shared** — SiteShell / Navbar / Footer / UserMenu / UpgradeDialog + UI primitives.

## Phase 2 — Integration & QA ✅

- [x] `npm run build` green — **27 routes** compile + typecheck + page-data collection.
- [x] `typecheck` (tsc) and `lint` (eslint) green.
- [x] Vitest: **37 tests pass** (entitlements, stripe config, schemas, sanitize, rate-limit).
- [x] Client bundle scanned — **no service-role/Stripe secret / admin client leaked**.
- [x] Supabase security advisors clean (only the optional leaked-password toggle remains).
- [x] Runtime verified: public/catalog/detail/pricing/auth render with live data; **entitlement gating proven with a real Pro session** (basic lesson allowed, premium lesson + its content blocked).
- [x] Playwright e2e smoke spec + CI workflow (lint/typecheck/test/build/audit on push).
- [x] Docs: README, SECURITY, ARCHITECTURE, this file, `.env.example`.

> Pending the user's keys (documented in `.env.example`): real Stripe charges, real Cloudflare
> streaming, and `SUPABASE_SERVICE_ROLE_KEY` (one-line copy) for webhook sync / admin tooling /
> the full `npm run security:audit`. Everything else runs against the live DB today.

## Demo accounts (password `CourseHubDemo!2026`)

| Email | Role | Tier |
|---|---|---|
| admin@coursehub.dev | admin | — |
| creator@coursehub.dev | creator | — |
| pro@coursehub.dev | subscriber | pro |
| free@coursehub.dev | subscriber | free |
