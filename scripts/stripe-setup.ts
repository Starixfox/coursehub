/**
 * scripts/stripe-setup.ts — create Stripe products + prices for every paid tier.
 *
 * Run with: `npx tsx scripts/stripe-setup.ts`  (or `npm run stripe:setup`).
 *
 * For each paid tier (basic / pro / premium) it ensures a Product exists and a
 * monthly + yearly recurring Price exists, then prints the `STRIPE_PRICE_*`
 * lines to paste into `.env.local`. Prices mirror `TIER_PLANS` in
 * `src/lib/entitlements.ts` (the marketed display prices).
 *
 * IDEMPOTENT: products are keyed by a stable `metadata.coursehub_tier`, and
 * prices by `lookup_key`, so re-running reuses existing objects instead of
 * creating duplicates. Requires a TEST-mode `STRIPE_SECRET_KEY`.
 * Dependency-light: only `stripe` (already a project dep).
 */
import Stripe from "stripe";
import { loadEnv, requireEnv } from "./_env";

loadEnv();

const secret = requireEnv("STRIPE_SECRET_KEY");
if (!secret.startsWith("sk_test_") && !secret.startsWith("rk_test_")) {
  console.warn(
    "⚠ STRIPE_SECRET_KEY does not look like a TEST key (sk_test_…). " +
      "Refusing to create live products would be safer — double-check before continuing.",
  );
}

const stripe = new Stripe(secret, { typescript: true });

interface PlanDef {
  tier: "basic" | "pro" | "premium";
  name: string;
  description: string;
  monthly: number; // USD whole dollars
  yearly: number;
}

// Mirrors TIER_PLANS in src/lib/entitlements.ts.
const PLANS: PlanDef[] = [
  { tier: "basic", name: "CourseHub Basic", description: "A focused learning path — full access to Basic-tier courses.", monthly: 12, yearly: 120 },
  { tier: "pro", name: "CourseHub Pro", description: "The whole catalog (Basic + Pro), 1080p video, downloadable resources.", monthly: 29, yearly: 290 },
  { tier: "premium", name: "CourseHub Premium", description: "Everything in Pro plus certificates, early access, team seats, 4K.", monthly: 59, yearly: 590 },
];

/** Find a product by our stable tier tag, or create it. */
async function ensureProduct(plan: PlanDef): Promise<Stripe.Product> {
  const search = await stripe.products.search({
    query: `metadata['coursehub_tier']:'${plan.tier}'`,
    limit: 1,
  });
  if (search.data[0]) {
    return stripe.products.update(search.data[0].id, {
      name: plan.name,
      description: plan.description,
    });
  }
  return stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { coursehub_tier: plan.tier },
  });
}

/** Find a recurring price by lookup_key, or create it. Prices are immutable, so
 *  if amount/interval changed we create a fresh one (the old one is left inactive). */
async function ensurePrice(
  product: Stripe.Product,
  plan: PlanDef,
  interval: "month" | "year",
): Promise<Stripe.Price> {
  const amount = (interval === "month" ? plan.monthly : plan.yearly) * 100;
  const lookupKey = `coursehub_${plan.tier}_${interval}`;

  const existing = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const match = existing.data.find(
    (p) =>
      p.lookup_key === lookupKey &&
      p.unit_amount === amount &&
      p.recurring?.interval === interval,
  );
  if (match) return match;

  // Release the lookup_key from any stale price so we can re-attach it.
  for (const p of existing.data) {
    if (p.lookup_key === lookupKey) {
      await stripe.prices.update(p.id, { lookup_key: "" });
    }
  }

  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: amount,
    recurring: { interval },
    lookup_key: lookupKey,
    nickname: `${plan.name} (${interval}ly)`,
    metadata: { coursehub_tier: plan.tier, coursehub_interval: interval },
  });
}

async function main() {
  console.log("Setting up Stripe products + prices for CourseHub…\n");

  const envLines: string[] = [];

  for (const plan of PLANS) {
    const product = await ensureProduct(plan);
    console.log(`• ${plan.name}  (product ${product.id})`);

    const monthly = await ensurePrice(product, plan, "month");
    const yearly = await ensurePrice(product, plan, "year");
    console.log(`    monthly: ${monthly.id}  ($${plan.monthly}/mo)`);
    console.log(`    yearly:  ${yearly.id}  ($${plan.yearly}/yr)`);

    const T = plan.tier.toUpperCase();
    envLines.push(`STRIPE_PRICE_${T}_MONTHLY=${monthly.id}`);
    envLines.push(`STRIPE_PRICE_${T}_YEARLY=${yearly.id}`);
  }

  console.log("\n────────────────────────────────────────────────────────");
  console.log("Paste these into .env.local:\n");
  console.log(envLines.join("\n"));
  console.log("────────────────────────────────────────────────────────\n");
  console.log("✓ Stripe setup complete.");
}

main().catch((e) => {
  console.error("\n✗ Stripe setup failed:");
  console.error(e);
  process.exit(1);
});
