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

## Phase 1 — Subsystems (parallel)

- [ ] **Auth** — login / register / reset / verify-email / MFA scaffold + actions.
- [ ] **Payments** — pricing page, Checkout, Customer Portal, idempotent webhook.
- [ ] **Media** — direct-upload route, signed playback-token route, `<VideoPlayer>`.
- [ ] **Public** — landing, catalog (search/filter), course detail.
- [ ] **Subscriber** — dashboard, course player w/ progress + resume + complete.
- [ ] **Creator** — course/module/lesson CRUD, media upload, publish.
- [ ] **Admin** — users, courses, subscriptions, analytics.
- [ ] **Shared** — app shell / nav / footer / upgrade modal.

## Phase 2 — Integration & QA

- [ ] `npm run build` + `typecheck` + `lint` green.
- [ ] Vitest unit tests (entitlements, webhook sync, schemas, sanitize).
- [ ] `scripts/security-audit.ts` (RLS on every table, no service key in client, gating).
- [ ] Playwright e2e: signup → verify → subscribe → access → cancel.
- [ ] Final docs: README, SECURITY, this file.

## Demo accounts (password `CourseHubDemo!2026`)

| Email | Role | Tier |
|---|---|---|
| admin@coursehub.dev | admin | — |
| creator@coursehub.dev | creator | — |
| pro@coursehub.dev | subscriber | pro |
| free@coursehub.dev | subscriber | free |
