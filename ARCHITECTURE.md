# CourseHub — Architecture

A subscription-based online learning platform. Creators publish courses
(text + images + video); subscribers learn based on their subscription tier.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (dark, indigo→violet theme) |
| Database / Auth / Storage | Supabase (Postgres 17 + RLS) |
| Server logic | Next.js Route Handlers + Server Actions (Node runtime) |
| Payments | Stripe (Checkout + Customer Portal + webhooks) |
| Video | Cloudflare Stream (signed playback) with a mock provider fallback |

The server is the single source of truth for access. The frontend never
decides what a user may read — RLS + server checks do.

## Directory layout

```
src/
  app/                      # routes (App Router)
    (marketing)/            # public: landing, pricing
    (auth)/                 # login, register, reset, verify-email
    catalog/                # public course catalog + course detail
    dashboard/              # subscriber home
    learn/[courseSlug]/     # course player
    account/                # profile, subscription, MFA
    creator/                # creator dashboard (CRUD + uploads)
    admin/                  # admin dashboard
    api/                    # route handlers (stripe, media, progress…)
  components/
    ui/                     # primitives: button, card, input, label, badge
    …                       # feature components
  lib/
    env.ts / env.server.ts  # validated env (public vs server-only)
    supabase/               # client / server / admin / middleware / types
    auth/session.ts         # getUser, getProfile, getCurrentTier, requireRole
    entitlements.ts         # Tier model, TIER_PLANS, hasTierAccess
    stripe/                 # client + config (price↔tier mapping)
    media/                  # MediaProvider interface + cloudflare + mock
    security/               # headers (CSP), rate-limit, sanitize, audit
    validation/schemas.ts   # zod schemas (shared client+server)
  middleware.ts             # session refresh + auth gate + security headers
supabase/migrations/        # the applied SQL (source of truth for the schema)
scripts/                    # security-audit, seed, stripe setup
tests/                      # vitest unit + playwright e2e
```

## Data model (Postgres, RLS on every table)

- `profiles` — id→auth.users, role (`admin`|`creator`|`subscriber`).
- `subscriptions` — **entitlement source of truth** (tier, status, period). Only
  the Stripe webhook (service role) writes it; clients can never fabricate it.
- `courses` → `modules` → `lessons`. Lesson **metadata** is public for published
  courses; lesson **content + video** lives in `lesson_content`, gated by RLS.
- `lesson_progress`, `enrollments`, `certificates`, `stripe_events`
  (webhook idempotency), `audit_log`.

### The entitlement gate

`private.has_tier_access(required, uid)` and `private.can_access_lesson(lesson, uid)`
are the heart of access control. They live in a **non-exposed `private` schema**
and are used by both RLS policies and server code. The app calls the safe public
wrappers, each hard-bound to `auth.uid()` (no arbitrary-uid probing):

- `my_current_tier()` → current effective tier
- `my_course_progress(course_id)` → `{ total, completed, percent }`
- `can_i_access_lesson(lesson_id)` → boolean
- `claim_certificate(course_id)` → issues a certificate (premium + full completion)

Tier order: `free < basic < pro < premium`. A lesson is accessible if it is a
`is_preview` lesson, the caller owns/admins the course, or the caller's tier ≥
the lesson's effective required tier.

## lib API the feature code imports

```ts
// auth (server)
import { getUser, getProfile, getCurrentTier, requireUser, requireRole } from "@/lib/auth/session";
// supabase
import { createClient } from "@/lib/supabase/server";   // RLS-scoped (server)
import { createClient } from "@/lib/supabase/client";    // RLS-scoped (browser)
import { createAdminClient } from "@/lib/supabase/admin"; // service role (trusted ops only)
// entitlements
import { TIER_PLANS, hasTierAccess, tierRank, type Tier } from "@/lib/entitlements";
// media (server)
import { getMediaProvider } from "@/lib/media";
// stripe (server)
import { getStripe } from "@/lib/stripe/client";
import { priceId, tierForPrice, mapStripeStatus } from "@/lib/stripe/config";
// security
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { sanitizeLessonHtml } from "@/lib/security/sanitize";
import { logAudit } from "@/lib/security/audit";
// validation
import { loginSchema, courseSchema, lessonSchema, checkoutSchema } from "@/lib/validation/schemas";
// ui
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Badge, TierBadge } from "@/components/ui/badge";
```

## Routing & ownership

| Area | Routes | Owner |
|---|---|---|
| Auth | `/(auth)/login`, `/register`, `/reset`, `/verify-email`, `/api/auth/*` | Auth |
| Billing | `/(marketing)/pricing`, `/api/stripe/{checkout,portal,webhook}` | Payments |
| Media | `/api/media/{upload,token}`, `<VideoPlayer/>` | Media |
| Public | `/`, `/catalog`, `/catalog/[slug]` | Frontend |
| Subscriber | `/dashboard`, `/learn/[slug]`, `/account` | Frontend |
| Creator | `/creator/**` | Creator |
| Admin | `/admin/**` | Admin |

## Security posture

RLS on every table · server-side enforcement · zod validation · CSP/HSTS &
security headers in middleware · rate limiting on auth/APIs · signed media URLs ·
idempotent + signature-verified Stripe webhook · sanitized rich content · audit
log. See `SECURITY.md` for the full threat model.
