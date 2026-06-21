import { env } from "@/lib/env";

const supabaseHost = (() => {
  try {
    return new URL(env.NEXT_PUBLIC_SUPABASE_URL).host;
  } catch {
    return "";
  }
})();

/**
 * Content-Security-Policy. Allows exactly the origins CourseHub talks to:
 * Supabase (API + realtime + storage), Stripe (checkout/js), Cloudflare Stream.
 *
 * NOTE: `'unsafe-inline'` on script-src is required by Next's hydration inline
 * scripts. The documented production hardening step (SECURITY.md) is to switch
 * to a per-request nonce. Everything else is locked down.
 */
export function contentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV !== "production";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "https://js.stripe.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      `https://${supabaseHost}`,
      "https://*.supabase.co",
      "https://*.cloudflarestream.com",
    ],
    "media-src": [
      "'self'",
      "blob:",
      "https://*.cloudflarestream.com",
      // Mock provider sample HLS (demo mode only):
      "https://devstreaming-cdn.apple.com",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      `https://${supabaseHost}`,
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.stripe.com",
      "https://*.cloudflarestream.com",
      "https://devstreaming-cdn.apple.com",
    ],
    "frame-src": [
      "'self'",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://*.cloudflarestream.com",
      "https://iframe.cloudflarestream.com",
    ],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  };
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

/** Full set of security headers applied to every response in middleware. */
export function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": contentSecurityPolicy(),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-DNS-Prefetch-Control": "off",
  };
}
