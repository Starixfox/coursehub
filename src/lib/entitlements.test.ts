import { describe, it, expect } from "vitest";
import { tierRank, hasTierAccess, TIER_ORDER, TIER_PLANS } from "./entitlements";

describe("entitlements", () => {
  it("orders tiers free < basic < pro < premium", () => {
    expect(TIER_ORDER).toEqual(["free", "basic", "pro", "premium"]);
    expect(tierRank("free")).toBeLessThan(tierRank("basic"));
    expect(tierRank("pro")).toBeLessThan(tierRank("premium"));
  });

  it("grants access at or above the required tier", () => {
    expect(hasTierAccess("pro", "pro")).toBe(true);
    expect(hasTierAccess("premium", "pro")).toBe(true);
    expect(hasTierAccess("basic", "pro")).toBe(false);
    expect(hasTierAccess("free", "basic")).toBe(false);
  });

  it("defines a plan for every tier", () => {
    for (const tier of TIER_ORDER) {
      expect(TIER_PLANS[tier]).toBeDefined();
      expect(TIER_PLANS[tier].name).toBeTruthy();
    }
  });
});
