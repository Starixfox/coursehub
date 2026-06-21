import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to `limit` requests, then blocks", () => {
    const key = `k-allow-${Math.random()}`;
    const opts = { limit: 3, windowMs: 1000 };

    const r1 = rateLimit(key, opts);
    const r2 = rateLimit(key, opts);
    const r3 = rateLimit(key, opts);
    const r4 = rateLimit(key, opts);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r4.success).toBe(false); // 4th over a limit of 3 is blocked
  });

  it("decrements `remaining` and never goes negative", () => {
    const key = `k-remaining-${Math.random()}`;
    const opts = { limit: 2, windowMs: 1000 };

    expect(rateLimit(key, opts).remaining).toBe(1);
    expect(rateLimit(key, opts).remaining).toBe(0);
    expect(rateLimit(key, opts).remaining).toBe(0); // blocked, clamped at 0
  });

  it("resets the window after windowMs elapses", () => {
    const key = `k-reset-${Math.random()}`;
    const opts = { limit: 1, windowMs: 1000 };

    expect(rateLimit(key, opts).success).toBe(true);
    expect(rateLimit(key, opts).success).toBe(false);

    // Advance past the window — the bucket should reset.
    vi.advanceTimersByTime(1001);

    const after = rateLimit(key, opts);
    expect(after.success).toBe(true);
    expect(after.remaining).toBe(0);
  });

  it("tracks distinct keys independently", () => {
    const opts = { limit: 1, windowMs: 1000 };
    const a = `k-a-${Math.random()}`;
    const b = `k-b-${Math.random()}`;

    expect(rateLimit(a, opts).success).toBe(true);
    expect(rateLimit(a, opts).success).toBe(false);
    // A different key has its own fresh budget.
    expect(rateLimit(b, opts).success).toBe(true);
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" },
    });
    expect(clientIp(req)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("https://x.test", {
      headers: { "x-real-ip": "198.51.100.9" },
    });
    expect(clientIp(req)).toBe("198.51.100.9");
  });

  it("returns 'unknown' when no proxy headers are present", () => {
    const req = new Request("https://x.test");
    expect(clientIp(req)).toBe("unknown");
  });
});
