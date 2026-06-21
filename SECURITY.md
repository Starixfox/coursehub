# CourseHub — Security

CourseHub treats the **server and database as the only sources of truth for
access**. The browser is assumed hostile: it can call any RPC, replay any
request, and forge any client-side state. Every protection below is enforced
server-side (RLS policy, route handler, or signed token), never in React.

## Threat model

| Asset | Threat | Primary mitigation |
|---|---|---|
| Paid lesson content & video | A free/anon user reads premium content directly (REST, RPC, or hot-linked HLS) | RLS on `lesson_content` via `private.can_access_lesson`; signed, short-lived media tokens minted only after a server entitlement check |
| Entitlement (`subscriptions`) | A client fabricates or upgrades its own tier | No client write policy at all; only the signature-verified Stripe webhook (service role) writes it |
| Another user's data (progress, certificates, profile) | IDOR — reading/writing rows you don't own | RLS `user_id = auth.uid()` on every owned table; ownership re-checked in mutations |
| Creator content | A creator edits a course they don't own | RLS `private.course_is_editable` (creator-of-course or admin) on courses/modules/lessons/content and storage objects |
| Auth | Credential stuffing, brute force, session theft | Supabase Auth (bcrypt), rate limiting, httpOnly SSR cookies, `sameSite` + origin checks |
| Rich text | Stored XSS via creator lesson HTML | `sanitizeLessonHtml` strips scripts/handlers/dangerous URLs **before storage** |
| Payments | Forged/replayed webhooks granting access | Stripe signature verification + idempotency table (`stripe_events`) |
| Privilege escalation | A user makes themselves admin | `profiles` update policy pins `role` to its current value; role changes require the service role |
| Secrets | `service_role` key reaching the browser | `server-only` import guard + `security:audit` grep of the client bundle |

## Protections implemented

### Database / authorization

- **RLS on every table.** `profiles`, `subscriptions`, `courses`, `modules`,
  `lessons`, `lesson_content`, `enrollments`, `lesson_progress`, `certificates`,
  `stripe_events`, and `audit_log` all have `row level security` enabled.
  `stripe_events` additionally carries an explicit deny-all policy for
  `anon`/`authenticated` (service role bypasses RLS).
- **`SECURITY DEFINER` helpers in a non-exposed `private` schema.** The
  entitlement/visibility/ownership functions (`is_admin`, `current_tier`,
  `has_tier_access`, `course_is_visible`, `course_is_editable`,
  `can_access_lesson`, `issue_certificate`, `log_audit_event`, `safe_uuid`, …)
  live in `private`, which is **not** in the API's exposed schemas. Migration 08
  moved them out of `public` so they cannot be probed with arbitrary `uid`
  arguments over PostgREST. Each is `set search_path = ''` to defeat search-path
  hijacking.
- **The entitlement gate.** `private.has_tier_access(required, uid)` and
  `private.can_access_lesson(lesson, uid)` are used by **both** RLS policies and
  server code, so the database and the app can never disagree. Tier order:
  `free < basic < pro < premium`.
- **Safe public RPC wrappers.** The only access feature code gets is via
  `SECURITY INVOKER` wrappers hard-bound to `auth.uid()` —
  `my_current_tier()`, `my_course_progress()`, `can_i_access_lesson()`,
  `claim_certificate()` — so a caller can never ask "what is *another* user's
  tier / progress / access?".
- **Entitlement is webhook-only.** `subscriptions` has read policies but **no**
  client insert/update/delete policy. Only the Stripe webhook (service role)
  mutates it. Clients literally cannot fabricate a paid tier.
- **Certificates are server-verified.** Issued only by
  `private.issue_certificate`, which requires the Premium tier *and* full course
  completion; there is no client insert policy.

### Application / transport

- **Server-side enforcement everywhere.** Pages and route handlers re-derive the
  user (`getUser`, verified against the Auth server) and tier
  (`getCurrentTier` → `my_current_tier` RPC). UI gating in `entitlements.ts` is
  cosmetic only.
- **zod validation on all input.** Every request body / form payload is parsed
  with a schema from `src/lib/validation/schemas.ts` before use.
- **Security headers in middleware** (`src/lib/security/headers.ts`): a strict
  **Content-Security-Policy** allow-listing only Supabase, Stripe, and
  Cloudflare Stream origins; **HSTS** (`max-age=63072000; includeSubDomains;
  preload`); `X-Frame-Options: DENY` + `frame-ancestors 'none'`;
  `X-Content-Type-Options: nosniff`; a locked-down `Permissions-Policy`; and
  `Referrer-Policy: strict-origin-when-cross-origin`.
- **Rate limiting** (`src/lib/security/rate-limit.ts`) on auth and sensitive API
  routes, keyed by client IP (in-memory fixed-window by default; swap to Upstash
  Redis for multi-instance prod via `UPSTASH_REDIS_*`).
- **CSRF defense.** Auth cookies are `httpOnly` + `sameSite`; state-changing
  routes validate the request origin and rely on Supabase's SSR cookie handling
  rather than ambient credentials.
- **Signed media URLs.** Video is uploaded to Cloudflare Stream as
  *require-signed-URLs*. Playback tokens are short-lived (~1h) and minted
  server-side **only after** `can_access_lesson` passes, so content can't be
  hot-linked or scraped. The mock provider is demo-only.
- **Idempotent, signature-verified Stripe webhook.** Every event's signature is
  verified against `STRIPE_WEBHOOK_SECRET`; the event id is recorded in
  `stripe_events` so replays/duplicates are no-ops.
- **XSS sanitization.** Creator HTML is run through `sanitizeLessonHtml`
  (allow-list of tags/attributes, `https`/`mailto` schemes only, `rel`/`target`
  forced on links) **before** it is stored. Interpolated strings use
  `escapeHtml`.
- **IDOR / ownership checks.** Beyond RLS, mutations re-verify ownership
  (`creator_id = auth.uid()` or admin) so a forged id can't act on another
  user's resource.
- **Audit log.** Sensitive actions are recorded via `private.log_audit_event`
  (or the service role) into `audit_log`, readable only by admins.
- **Least-privilege service role.** `SUPABASE_SERVICE_ROLE_KEY` is `server-only`
  and used solely for trusted ops the user cannot do themselves (webhook sync,
  admin role changes, signed-URL minting). It never reaches the client bundle —
  `npm run security:audit` greps `.next/` to prove it.

### SSRF note

Outbound server requests target only fixed, hard-coded hosts (Stripe's API and
Cloudflare's Stream API). No user-supplied URL is ever fetched server-side, so
there is no SSRF surface. If a future feature fetches a user-provided URL (e.g.
remote thumbnails), it must use an allow-list and block private/link-local IP
ranges.

## Verifying the posture

```bash
npm run security:audit   # RLS on every table · no service-role key in client bundle · gated content unreadable by anon
```

The Supabase security advisor (`get_advisors type=security`) reports **0**
issues for the schema and functions.

## Residual / open item

- **Enable "Leaked Password Protection" (HaveIBeenPwned)** in
  Supabase Dashboard → **Authentication → Policies**. This is the **only**
  remaining advisor warning. It checks new/changed passwords against the
  HaveIBeenPwned breach corpus and must be toggled in the hosted Auth dashboard
  (it is not expressible as a migration).
  Docs: <https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection>

## Reporting a vulnerability

Please do not open a public issue for security reports. Email the maintainers
privately with steps to reproduce and impact, and allow reasonable time for a
fix before any disclosure.
