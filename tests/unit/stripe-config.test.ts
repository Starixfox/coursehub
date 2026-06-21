import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * `@/lib/stripe/config` resolves Stripe Price ids from `serverEnv`, which is
 * frozen from `process.env` the first time `env.server` is imported. To test
 * the env-driven lookups deterministically we set the price vars BEFORE a fresh
 * (module-registry-reset) dynamic import.
 *
 * `mapStripeStatus` is pure (no env), so it can be imported normally.
 */

const PRICE_ENV = {
  STRIPE_PRICE_BASIC_MONTHLY: "price_basic_m",
  STRIPE_PRICE_BASIC_YEARLY: "price_basic_y",
  STRIPE_PRICE_PRO_MONTHLY: "price_pro_m",
  STRIPE_PRICE_PRO_YEARLY: "price_pro_y",
  STRIPE_PRICE_PREMIUM_MONTHLY: "price_premium_m",
  STRIPE_PRICE_PREMIUM_YEARLY: "price_premium_y",
} as const;

async function loadConfig() {
  vi.resetModules();
  for (const [k, v] of Object.entries(PRICE_ENV)) process.env[k] = v;
  // Required by env schemas so the module graph parses cleanly.
  process.env.MEDIA_PROVIDER = "mock";
  return import("@/lib/stripe/config");
}

describe("stripe/config: mapStripeStatus", () => {
  let mapStripeStatus: typeof import("@/lib/stripe/config").mapStripeStatus;

  beforeEach(async () => {
    ({ mapStripeStatus } = await loadConfig());
  });

  it("passes through every known Stripe status unchanged", () => {
    const known = [
      "trialing",
      "active",
      "past_due",
      "canceled",
      "incomplete",
      "incomplete_expired",
      "unpaid",
      "paused",
    ] as const;
    for (const s of known) {
      expect(mapStripeStatus(s)).toBe(s);
    }
  });

  it("maps unknown / empty statuses to 'incomplete'", () => {
    expect(mapStripeStatus("something_new")).toBe("incomplete");
    expect(mapStripeStatus("")).toBe("incomplete");
    expect(mapStripeStatus("ACTIVE")).toBe("incomplete"); // case-sensitive
  });
});

describe("stripe/config: tierForPrice (reverse lookup)", () => {
  it("resolves each configured Price id back to its tier", async () => {
    const { tierForPrice } = await loadConfig();
    expect(tierForPrice(PRICE_ENV.STRIPE_PRICE_BASIC_MONTHLY)).toBe("basic");
    expect(tierForPrice(PRICE_ENV.STRIPE_PRICE_BASIC_YEARLY)).toBe("basic");
    expect(tierForPrice(PRICE_ENV.STRIPE_PRICE_PRO_MONTHLY)).toBe("pro");
    expect(tierForPrice(PRICE_ENV.STRIPE_PRICE_PRO_YEARLY)).toBe("pro");
    expect(tierForPrice(PRICE_ENV.STRIPE_PRICE_PREMIUM_MONTHLY)).toBe("premium");
    expect(tierForPrice(PRICE_ENV.STRIPE_PRICE_PREMIUM_YEARLY)).toBe("premium");
  });

  it("returns null for an unknown Price id", async () => {
    const { tierForPrice } = await loadConfig();
    expect(tierForPrice("price_does_not_exist")).toBeNull();
    expect(tierForPrice("")).toBeNull();
  });
});

describe("stripe/config: priceId (forward lookup)", () => {
  it("resolves (tier, interval) to the configured Price id", async () => {
    const { priceId } = await loadConfig();
    expect(priceId("basic", "month")).toBe(PRICE_ENV.STRIPE_PRICE_BASIC_MONTHLY);
    expect(priceId("basic", "year")).toBe(PRICE_ENV.STRIPE_PRICE_BASIC_YEARLY);
    expect(priceId("pro", "month")).toBe(PRICE_ENV.STRIPE_PRICE_PRO_MONTHLY);
    expect(priceId("premium", "year")).toBe(PRICE_ENV.STRIPE_PRICE_PREMIUM_YEARLY);
  });

  it("priceId and tierForPrice are consistent round-trips", async () => {
    const { priceId, tierForPrice } = await loadConfig();
    const id = priceId("pro", "month");
    expect(id).toBeDefined();
    expect(tierForPrice(id as string)).toBe("pro");
  });
});
