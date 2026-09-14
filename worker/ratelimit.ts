/**
 * Minimal rate limiter for the Worker's public write endpoints.
 *
 * Cloudflare Workers run concurrently in many isolates, so a module-global
 * map is per-isolate only. It is still an effective cheap brake: a brute
 * force or spam burst from one client lands in whatever isolate serves it,
 * and each isolate independently counts and blocks. It is not a distributed
 * quota — but it raises the cost of abuse enormously (from "unlimited" to
 * "a few requests per isolate per window") with zero infrastructure.
 * If stricter guarantees are ever needed, swap this for a DO or a KV/Turnstile
 * check — the call sites already treat "rate limited" as a plain 429.
 */

interface Entry {
  count: number;
  resetAt: number;
}

/** One bucket per isolate. Keyed by scope + client fingerprint. */
const buckets = new Map<string, Entry>();

/** Periodically drop expired buckets so the map cannot grow unbounded. */
function sweep(now: number): void {
  if (buckets.size < 64) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Short, non-reversible client key: CF edge IP when present (it always is on
 * Cloudflare), falling back to the User-Agent hash for local dev.
 */
function clientKey(request: Request): string {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";
  if (ip) return ip;
  const ua = request.headers.get("user-agent") ?? "unknown";
  let hash = 0;
  for (let i = 0; i < ua.length; i += 1) {
    hash = (hash * 31 + ua.charCodeAt(i)) | 0;
  }
  return `ua-${hash}`;
}

/**
 * Returns true when the request should be rejected.
 *
 * @param scope   logical bucket ("login", "public-post", …)
 * @param limit   allowed requests per window
 * @param windowMs window length in milliseconds
 */
export async function rateLimit(
  request: Request,
  _env: unknown,
  scope: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  void _env;
  const now = Date.now();
  sweep(now);
  const key = `${scope}:${clientKey(request)}`;
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
