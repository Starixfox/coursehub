/**
 * scripts/seed.ts — idempotent demo seed.
 *
 * Run with: `npx tsx scripts/seed.ts`  (or `npm run seed`).
 *
 * Mirrors migration `07_seed_demo_data.sql`: the same 4 demo accounts, 3 courses,
 * curriculum, gated content, the Pro subscription, and Pat Pro's enrollment +
 * progress. On a project provisioned from the migrations this data already
 * exists — this script lets you (re-)create it against a fresh/local project or
 * repair it after manual edits. It is SAFE TO RE-RUN: every write is an upsert
 * keyed on a stable id, so re-running converges instead of duplicating.
 *
 * Uses the service-role client (BYPASSES RLS) because it writes auth users,
 * profiles roles, and subscriptions — none of which a normal client may touch.
 * Dependency-light: only `@supabase/supabase-js` (already a project dep).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./_env";

loadEnv();

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const DEMO_PASSWORD = "CourseHubDemo!2026";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface DemoUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "creator" | "subscriber";
}

const USERS: DemoUser[] = [
  { id: "11111111-1111-1111-1111-111111111111", email: "admin@coursehub.dev", fullName: "Avery Admin", role: "admin" },
  { id: "22222222-2222-2222-2222-222222222222", email: "creator@coursehub.dev", fullName: "Casey Creator", role: "creator" },
  { id: "33333333-3333-3333-3333-333333333333", email: "pro@coursehub.dev", fullName: "Pat Pro", role: "subscriber" },
  { id: "44444444-4444-4444-4444-444444444444", email: "free@coursehub.dev", fullName: "Finley Free", role: "subscriber" },
];

const CREATOR_ID = "22222222-2222-2222-2222-222222222222";

const COURSES = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    creator_id: CREATOR_ID,
    creator_name: "Casey Creator",
    title: "Modern Web Development with Next.js",
    slug: "modern-web-dev-nextjs",
    subtitle: "Build production React apps with the App Router",
    description: "A hands-on path from zero to a deployed full-stack Next.js application, covering routing, data, and styling.",
    category: "Development",
    level: "beginner",
    required_tier: "basic",
    status: "published",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    creator_id: CREATOR_ID,
    creator_name: "Casey Creator",
    title: "Designing for the Web",
    slug: "designing-for-the-web",
    subtitle: "Visual hierarchy, color, and layout for product teams",
    description: "Learn the design fundamentals that make interfaces feel premium, from spacing systems to color theory.",
    category: "Design",
    level: "intermediate",
    required_tier: "pro",
    status: "published",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    creator_id: CREATOR_ID,
    creator_name: "Casey Creator",
    title: "Launch and Scale a SaaS",
    slug: "launch-and-scale-a-saas",
    subtitle: "From first customer to repeatable revenue",
    description: "The operator playbook for taking a software product to market and scaling it sustainably.",
    category: "Business",
    level: "advanced",
    required_tier: "premium",
    status: "published",
  },
] as const;

const MODULES = [
  { id: "b0000000-0000-0000-0000-000000000011", course_id: "a0000000-0000-0000-0000-000000000001", title: "Getting Started", position: 0 },
  { id: "b0000000-0000-0000-0000-000000000012", course_id: "a0000000-0000-0000-0000-000000000001", title: "Building the UI", position: 1 },
  { id: "b0000000-0000-0000-0000-000000000021", course_id: "a0000000-0000-0000-0000-000000000002", title: "Design Foundations", position: 0 },
  { id: "b0000000-0000-0000-0000-000000000031", course_id: "a0000000-0000-0000-0000-000000000003", title: "Go To Market", position: 0 },
] as const;

const LESSONS = [
  { id: "c0000000-0000-0000-0000-000000000101", module_id: "b0000000-0000-0000-0000-000000000011", course_id: "a0000000-0000-0000-0000-000000000001", title: "Welcome and Course Overview", slug: "welcome", position: 0, duration_seconds: 212, is_preview: true, has_video: true },
  { id: "c0000000-0000-0000-0000-000000000102", module_id: "b0000000-0000-0000-0000-000000000011", course_id: "a0000000-0000-0000-0000-000000000001", title: "Setting Up Your Environment", slug: "setup", position: 1, duration_seconds: 540, is_preview: false, has_video: true },
  { id: "c0000000-0000-0000-0000-000000000103", module_id: "b0000000-0000-0000-0000-000000000012", course_id: "a0000000-0000-0000-0000-000000000001", title: "Components and Props", slug: "components", position: 0, duration_seconds: 720, is_preview: false, has_video: true },
  { id: "c0000000-0000-0000-0000-000000000104", module_id: "b0000000-0000-0000-0000-000000000012", course_id: "a0000000-0000-0000-0000-000000000001", title: "Styling with Tailwind", slug: "styling", position: 1, duration_seconds: 660, is_preview: false, has_video: true },
  { id: "c0000000-0000-0000-0000-000000000201", module_id: "b0000000-0000-0000-0000-000000000021", course_id: "a0000000-0000-0000-0000-000000000002", title: "Why Hierarchy Matters", slug: "hierarchy", position: 0, duration_seconds: 300, is_preview: true, has_video: true },
  { id: "c0000000-0000-0000-0000-000000000202", module_id: "b0000000-0000-0000-0000-000000000021", course_id: "a0000000-0000-0000-0000-000000000002", title: "Building a Color System", slug: "color", position: 1, duration_seconds: 840, is_preview: false, has_video: true },
  { id: "c0000000-0000-0000-0000-000000000301", module_id: "b0000000-0000-0000-0000-000000000031", course_id: "a0000000-0000-0000-0000-000000000003", title: "Finding Your First Customers", slug: "first-customers", position: 0, duration_seconds: 360, is_preview: true, has_video: true },
  { id: "c0000000-0000-0000-0000-000000000302", module_id: "b0000000-0000-0000-0000-000000000031", course_id: "a0000000-0000-0000-0000-000000000003", title: "Pricing and Packaging", slug: "pricing", position: 1, duration_seconds: 900, is_preview: false, has_video: true },
] as const;

const CONTENT = [
  { lesson_id: "c0000000-0000-0000-0000-000000000101", content_html: "<h2>Welcome</h2><p>This short overview walks through what you will build and how the course is structured.</p>", cf_stream_uid: "demo-sample-portrait" },
  { lesson_id: "c0000000-0000-0000-0000-000000000102", content_html: "<h2>Setup</h2><p>Install Node, create your project, and run the development server.</p>", cf_stream_uid: "demo-sample-1" },
  { lesson_id: "c0000000-0000-0000-0000-000000000103", content_html: "<h2>Components</h2><p>Compose your interface from small, reusable components and pass data with props.</p>", cf_stream_uid: "demo-sample-2" },
  { lesson_id: "c0000000-0000-0000-0000-000000000104", content_html: "<h2>Styling</h2><p>Use utility classes to build a consistent, responsive design quickly.</p>", cf_stream_uid: "demo-sample-3" },
  { lesson_id: "c0000000-0000-0000-0000-000000000201", content_html: "<h2>Hierarchy</h2><p>Guide the eye with size, weight, and spacing so the most important thing reads first.</p>", cf_stream_uid: "demo-sample-1" },
  { lesson_id: "c0000000-0000-0000-0000-000000000202", content_html: "<h2>Color</h2><p>Build an accessible palette with semantic roles and consistent contrast.</p>", cf_stream_uid: "demo-sample-2" },
  { lesson_id: "c0000000-0000-0000-0000-000000000301", content_html: "<h2>First Customers</h2><p>Talk to users early and find the smallest valuable thing you can ship.</p>", cf_stream_uid: "demo-sample-1" },
  { lesson_id: "c0000000-0000-0000-0000-000000000302", content_html: "<h2>Pricing</h2><p>Package value into tiers and price for the outcome you deliver.</p>", cf_stream_uid: "demo-sample-2" },
] as const;

function ok(label: string) {
  console.log(`  ✓ ${label}`);
}
function fail(label: string, error: unknown): never {
  console.error(`\n✗ ${label}`);
  console.error(error);
  process.exit(1);
}

/** Create the auth user if absent; always (re)assert email + confirmed + password. */
async function ensureUser(client: SupabaseClient, u: DemoUser) {
  const { data: existing } = await client.auth.admin.getUserById(u.id);
  if (existing?.user) {
    const { error } = await client.auth.admin.updateUserById(u.id, {
      email: u.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.fullName },
    });
    if (error) fail(`update auth user ${u.email}`, error);
    ok(`auth user ${u.email} (updated)`);
    return;
  }
  const { error } = await client.auth.admin.createUser({
    // Force the stable demo id so all FKs line up across re-runs.
    // (supabase-js admin.createUser accepts `id` even though it is not typed.)
    id: u.id,
    email: u.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.fullName },
  } as Parameters<typeof client.auth.admin.createUser>[0] & { id: string });
  if (error) fail(`create auth user ${u.email}`, error);
  ok(`auth user ${u.email} (created)`);
}

async function main() {
  console.log("Seeding CourseHub demo data (idempotent)…\n");

  console.log("Accounts:");
  for (const u of USERS) await ensureUser(admin, u);

  // The handle_new_user trigger creates the profile row; upsert role + name.
  const { error: profErr } = await admin.from("profiles").upsert(
    USERS.map((u) => ({ id: u.id, email: u.email, full_name: u.fullName, role: u.role })),
    { onConflict: "id" },
  );
  if (profErr) fail("upsert profiles", profErr);
  ok("profiles (roles + names)");

  console.log("\nSubscription:");
  const { error: subErr } = await admin.from("subscriptions").upsert(
    [
      {
        user_id: "33333333-3333-3333-3333-333333333333",
        stripe_customer_id: "cus_demo_pro",
        stripe_subscription_id: "sub_demo_pro",
        tier: "pro",
        status: "active",
        billing_interval: "month",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        seats: 1,
      },
    ],
    { onConflict: "user_id" },
  );
  if (subErr) fail("upsert subscription", subErr);
  ok("Pat Pro → pro (active)");

  console.log("\nCatalog:");
  const courseRows = COURSES.map((c) => ({ ...c, published_at: new Date().toISOString() }));
  const { error: cErr } = await admin.from("courses").upsert(courseRows, { onConflict: "id" });
  if (cErr) fail("upsert courses", cErr);
  ok(`${COURSES.length} courses`);

  const { error: mErr } = await admin.from("modules").upsert([...MODULES], { onConflict: "id" });
  if (mErr) fail("upsert modules", mErr);
  ok(`${MODULES.length} modules`);

  const { error: lErr } = await admin.from("lessons").upsert([...LESSONS], { onConflict: "id" });
  if (lErr) fail("upsert lessons", lErr);
  ok(`${LESSONS.length} lessons`);

  const { error: contentErr } = await admin
    .from("lesson_content")
    .upsert([...CONTENT], { onConflict: "lesson_id" });
  if (contentErr) fail("upsert lesson_content", contentErr);
  ok(`${CONTENT.length} lesson_content rows`);

  console.log("\nProgress:");
  const { error: enErr } = await admin.from("enrollments").upsert(
    [{ user_id: "33333333-3333-3333-3333-333333333333", course_id: "a0000000-0000-0000-0000-000000000001" }],
    { onConflict: "user_id,course_id" },
  );
  if (enErr) fail("upsert enrollment", enErr);
  ok("Pat Pro enrolled in Next.js course");

  const { error: prErr } = await admin.from("lesson_progress").upsert(
    [
      { user_id: "33333333-3333-3333-3333-333333333333", lesson_id: "c0000000-0000-0000-0000-000000000101", course_id: "a0000000-0000-0000-0000-000000000001", completed: true, last_position_seconds: 212, completed_at: new Date().toISOString() },
      { user_id: "33333333-3333-3333-3333-333333333333", lesson_id: "c0000000-0000-0000-0000-000000000102", course_id: "a0000000-0000-0000-0000-000000000001", completed: false, last_position_seconds: 120, completed_at: null },
    ],
    { onConflict: "user_id,lesson_id" },
  );
  if (prErr) fail("upsert lesson_progress", prErr);
  ok("Pat Pro progress (1 done, 1 in-progress)");

  console.log("\n✓ Seed complete. Demo password for all accounts: " + DEMO_PASSWORD);
}

main().catch((e) => fail("seed failed", e));
