/**
 * Pluggable rate limiter. Default is an in-memory fixed-window counter — fine
 * for a single instance / local dev. For multi-instance production, wire the
 * UPSTASH_REDIS_* env vars and swap the store (documented in SECURITY.md).
 */
type Bucket = { count: number; reset: number };
const store = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.reset < now) {
    const reset = now + opts.windowMs;
    store.set(key, { count: 1, reset });
    return { success: true, limit: opts.limit, remaining: opts.limit - 1, reset };
  }

  existing.count += 1;
  const remaining = Math.max(0, opts.limit - existing.count);
  return {
    success: existing.count <= opts.limit,
    limit: opts.limit,
    remaining,
    reset: existing.reset,
  };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

// Opportunistic cleanup so the map does not grow unbounded.
let lastSweep = 0;
export function sweepExpired() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of store) if (v.reset < now) store.delete(k);
}
