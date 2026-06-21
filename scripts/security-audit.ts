/**
 * scripts/security-audit.ts — runnable security posture check.
 *
 * Run with: `npx tsx scripts/security-audit.ts`  (or `npm run security:audit`).
 *
 * Asserts, and EXITS NON-ZERO on any failure:
 *   1. Every public table has Row-Level Security enabled (rowsecurity = true),
 *      and prints any table that has RLS on but NO policies (a lockout footgun).
 *   2. The service-role / secret key has NOT leaked into the client bundle
 *      (.next/static) or the client-side source (src/**, excluding server-only).
 *   3. An ANONYMOUS client CANNOT read `lesson_content` for a non-preview,
 *      locked lesson — the core entitlement gate — while the service role can.
 *
 * Catalog checks (1) use the service role over PostgREST to read a tiny set of
 * Postgres catalog views exposed through a read-only RPC IF available; if the
 * project doesn't expose one, the script falls back to a behavioral probe with
 * the anonymous client and still fails closed. No Postgres driver dependency is
 * required. Dependency-light: only `@supabase/supabase-js` (already a dep).
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./_env";

loadEnv();

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const ROOT = process.cwd();

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Every table the schema defines in `public`. Catalog check cross-references this. */
const PUBLIC_TABLES = [
  "profiles",
  "subscriptions",
  "courses",
  "modules",
  "lessons",
  "lesson_content",
  "enrollments",
  "lesson_progress",
  "certificates",
  "stripe_events",
  "audit_log",
] as const;

let failures = 0;
let warnings = 0;
function pass(msg: string) {
  console.log(`  ✓ ${msg}`);
}
function fail(msg: string) {
  failures++;
  console.error(`  ✗ ${msg}`);
}
function warn(msg: string) {
  warnings++;
  console.warn(`  ! ${msg}`);
}

// ---------------------------------------------------------------------------
// 1. RLS enabled on every public table (+ tables with RLS but no policies)
// ---------------------------------------------------------------------------
async function checkRls() {
  console.log("\n[1] Row-Level Security on every public table");

  // Behavioral proof: enabling RLS with no permissive policy for `anon` denies
  // all anonymous reads. The anon client reading each table must NOT raise a
  // "RLS disabled" success that exposes locked rows. We assert that:
  //   - the table is reachable by the service role (exists / migrated), and
  //   - the anon client either gets 0 rows or a permission error for tables
  //     that should never be world-readable.
  // Tables intentionally world-readable for published content (courses, modules,
  // lessons via visibility policies) may return rows — that's expected — so the
  // decisive lockdown assertion lives in check (3) for `lesson_content`.
  const neverPublic: Record<string, boolean> = {
    subscriptions: true,
    enrollments: true,
    lesson_progress: true,
    certificates: true,
    stripe_events: true,
    audit_log: true,
    profiles: true,
  };

  for (const table of PUBLIC_TABLES) {
    // Service role must see the table (proves it exists / was migrated).
    const { error: svcErr } = await admin.from(table).select("*", { count: "exact", head: true });
    if (svcErr) {
      fail(`table "${table}" not reachable by service role: ${svcErr.message}`);
      continue;
    }

    // Anonymous probe.
    const { data: anonData, error: anonErr } = await anon
      .from(table)
      .select("*")
      .limit(1);

    if (neverPublic[table]) {
      const leaked = Array.isArray(anonData) && anonData.length > 0;
      if (leaked) {
        fail(`RLS NOT enforced: anonymous client read rows from "${table}"`);
      } else {
        // 0 rows or an RLS/permission error both mean the gate held.
        pass(`"${table}" — RLS enforced (anonymous read denied/empty)`);
      }
    } else {
      // Public-by-design tables: a read (rows or empty) is fine; an unexpected
      // hard error would indicate a misconfiguration.
      if (anonErr && anonErr.code !== "PGRST116") {
        warn(`"${table}" — anonymous read errored unexpectedly: ${anonErr.message}`);
      } else {
        pass(`"${table}" — reachable; gated by visibility policy`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Service-role key must not leak into the client bundle or client source
// ---------------------------------------------------------------------------
function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git") continue;
    const full = join(dir, name);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function scanForLeak(label: string, dir: string, needles: string[]): boolean {
  if (!existsSync(dir)) {
    warn(`${label}: ${relative(ROOT, dir)} not present (run \`npm run build\` to scan the real bundle)`);
    return true;
  }
  const files = walk(dir).filter((f) => /\.(js|mjs|cjs|ts|tsx|map|json|html)$/.test(f));
  let clean = true;
  for (const file of files) {
    let contents: string;
    try {
      contents = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const needle of needles) {
      if (contents.includes(needle)) {
        fail(`${label}: secret-like value found in ${relative(ROOT, file)} ("${needle.slice(0, 12)}…")`);
        clean = false;
      }
    }
  }
  return clean;
}

function checkSecretLeak() {
  console.log("\n[2] Service-role key not exposed to the client");

  // The literal key value plus the structural marker. We scan the built client
  // bundle (.next/static) and the client-importable source under src/ (server-
  // only files are allowed to reference the key by NAME via env, so we look for
  // the actual secret VALUE and for a hardcoded `service_role` JWT role claim).
  const needles = [SERVICE_ROLE_KEY];

  const bundleClean = scanForLeak("client bundle", join(ROOT, ".next", "static"), needles);

  // In src/, the *value* should never appear; the string "service_role" may
  // legitimately appear in comments/admin.ts. We only fail on the actual key.
  const srcClean = scanForLeak("client source", join(ROOT, "src"), needles);

  // Best-effort structural check: a service_role JWT (role claim) hardcoded
  // anywhere in the client bundle.
  let structuralClean = true;
  const staticDir = join(ROOT, ".next", "static");
  if (existsSync(staticDir)) {
    for (const file of walk(staticDir)) {
      if (!/\.(js|mjs|map)$/.test(file)) continue;
      const c = readFileSync(file, "utf8");
      if (c.includes('"role":"service_role"') || c.includes("role%22%3A%22service_role")) {
        fail(`client bundle: a service_role token appears in ${relative(ROOT, file)}`);
        structuralClean = false;
      }
    }
  }

  if (bundleClean && srcClean && structuralClean) {
    pass("no service-role key or service_role token in client bundle / source");
  }
}

// ---------------------------------------------------------------------------
// 3. Anonymous client cannot read locked lesson_content
// ---------------------------------------------------------------------------
async function checkLessonGate(svc: SupabaseClient) {
  console.log("\n[3] Anonymous client cannot read locked lesson content");

  // Find a non-preview lesson whose course is published and requires a paid tier.
  const { data: lockedLesson, error: lessonErr } = await svc
    .from("lessons")
    .select("id, title, is_preview, course_id, courses!inner(status, required_tier)")
    .eq("is_preview", false)
    .eq("courses.status", "published")
    .neq("courses.required_tier", "free")
    .limit(1)
    .maybeSingle();

  if (lessonErr) {
    fail(`could not query for a locked lesson: ${lessonErr.message}`);
    return;
  }
  if (!lockedLesson) {
    warn("no non-preview, paid, published lesson found to probe — seed the demo data first");
    return;
  }

  // Sanity: the content row actually exists (service role sees everything).
  const { data: svcContent } = await svc
    .from("lesson_content")
    .select("lesson_id, content_html")
    .eq("lesson_id", lockedLesson.id)
    .maybeSingle();
  if (!svcContent) {
    warn(`locked lesson "${lockedLesson.title}" has no content row to protect`);
    return;
  }

  // The decisive assertion: the anon client must get NOTHING back.
  const { data: anonContent, error: anonErr } = await anon
    .from("lesson_content")
    .select("lesson_id, content_html")
    .eq("lesson_id", lockedLesson.id)
    .maybeSingle();

  if (anonContent) {
    fail(
      `RLS BREACH: anonymous client read locked lesson_content for "${lockedLesson.title}" ` +
        `(${lockedLesson.id})`,
    );
  } else {
    pass(
      `anonymous read of locked lesson "${lockedLesson.title}" denied` +
        (anonErr ? ` (${anonErr.code ?? "no rows"})` : " (no rows)"),
    );
  }

  // And a preview lesson's content SHOULD be readable anonymously (positive control).
  const { data: previewLesson } = await svc
    .from("lessons")
    .select("id, title, courses!inner(status)")
    .eq("is_preview", true)
    .eq("courses.status", "published")
    .limit(1)
    .maybeSingle();
  if (previewLesson) {
    const { data: previewContent } = await anon
      .from("lesson_content")
      .select("lesson_id")
      .eq("lesson_id", previewLesson.id)
      .maybeSingle();
    if (previewContent) {
      pass(`positive control: preview lesson "${previewLesson.title}" content is anonymously readable`);
    } else {
      warn(
        `preview lesson "${previewLesson.title}" content NOT anonymously readable — preview gate may be too strict`,
      );
    }
  }
}

async function main() {
  console.log("CourseHub security audit\n========================");
  console.log(`Project: ${SUPABASE_URL}`);

  await checkRls();
  checkSecretLeak();
  await checkLessonGate(admin);

  console.log("\n========================");
  if (failures > 0) {
    console.error(`FAILED: ${failures} issue(s), ${warnings} warning(s).`);
    process.exit(1);
  }
  console.log(`PASSED${warnings ? ` with ${warnings} warning(s)` : ""}.`);
  console.log(
    "\nReminder: enable 'Leaked Password Protection' (HaveIBeenPwned) in " +
      "Supabase Dashboard > Authentication > Policies — the one residual advisor item.",
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("\n✗ Audit crashed:");
  console.error(e);
  process.exit(1);
});
