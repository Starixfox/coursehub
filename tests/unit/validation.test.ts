import { describe, it, expect } from "vitest";
import {
  registerSchema,
  courseSchema,
  checkoutSchema,
} from "@/lib/validation/schemas";

describe("registerSchema", () => {
  const valid = {
    email: "user@example.com",
    password: "averylongpassword",
    fullName: "Ada Lovelace",
  };

  it("accepts a well-formed registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a password shorter than 10 characters", () => {
    const r = registerSchema.safeParse({ ...valid, password: "short" });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const r = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const r = registerSchema.safeParse({ ...valid, fullName: "" });
    expect(r.success).toBe(false);
  });
});

describe("courseSchema", () => {
  const valid = { title: "Intro to TS", slug: "intro-to-ts" };

  it("accepts a valid slug and defaults requiredTier to 'basic'", () => {
    const r = courseSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.requiredTier).toBe("basic");
  });

  it("rejects slugs with uppercase letters or spaces", () => {
    expect(courseSchema.safeParse({ ...valid, slug: "Intro-TS" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...valid, slug: "intro ts" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...valid, slug: "intro_ts" }).success).toBe(false);
  });

  it("rejects slugs shorter than 3 characters", () => {
    expect(courseSchema.safeParse({ ...valid, slug: "ab" }).success).toBe(false);
  });

  it("rejects an invalid requiredTier", () => {
    const r = courseSchema.safeParse({ ...valid, requiredTier: "platinum" });
    expect(r.success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  it("accepts a paid tier and defaults interval to 'month'", () => {
    const r = checkoutSchema.safeParse({ tier: "pro" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.interval).toBe("month");
  });

  it("accepts an explicit yearly interval", () => {
    const r = checkoutSchema.safeParse({ tier: "premium", interval: "year" });
    expect(r.success).toBe(true);
  });

  it("rejects the free tier (not purchasable)", () => {
    expect(checkoutSchema.safeParse({ tier: "free" }).success).toBe(false);
  });

  it("rejects an invalid interval", () => {
    const r = checkoutSchema.safeParse({ tier: "basic", interval: "weekly" });
    expect(r.success).toBe(false);
  });
});
