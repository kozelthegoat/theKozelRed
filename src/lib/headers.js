// One source of truth for the response security headers.
//
// Delivered two ways, because Cloudflare serves prebuilt assets without running the
// Worker (no assets.run_worker_first), so Astro middleware never sees static pages:
//   - public/_headers      → static asset responses (/ , /schedule/, /privacy/, ...)
//   - src/middleware.js    → Worker/SSR responses (/me, /api/*)
// tests/headers.test.js asserts public/_headers still matches this module.
//
// No script hashes: every script is same-origin (the weekday accent is /accent.js,
// the rest is bundled), so script-src 'self' covers all of them and nothing rots
// when the scripts change.
// style-src needs 'unsafe-inline' for the inline style attributes on the reveal list.
//
// no-transform rides along on HTML responses (see middleware + public/_headers) so the
// Cloudflare edge cannot rewrite the markup it serves. Without it the edge injects the
// Web Analytics RUM beacon (static.cloudflareinsights.com) into every page, which this
// CSP blocks — RUM is intentionally not used, and byte-identical HTML is worth more.
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'"
].join('; ');

export const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  // Every host in the zone is Proxied HTTPS; no preload (that stays a deliberate choice).
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
