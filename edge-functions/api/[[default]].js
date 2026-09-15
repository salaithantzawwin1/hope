/**
 * EdgeOne Pages edge function — Myanmar-reachable mirror of the public API.
 *
 * Myanmar ISPs block both the Cloudflare customer-edge IPs (workers.dev and
 * the Worker custom domains) and Vercel's edge, but Tencent EdgeOne's nodes
 * are reachable (verified 2026-09: EO-Cache-Status: HIT from an MM network).
 * This catch-all proxies /api/* to the Worker origin so the EdgeOne mirror
 * of the site has working news/events/gallery/content APIs and staff login.
 *
 * Route mapping (EdgeOne Pages convention):
 *   edge-functions/api/[[default]].js  →  /api/*  (all methods, any depth)
 *
 * Limits to be aware of (EdgeOne Pages free plan):
 *   - request body ≤ 1 MB (CV uploads through this mirror are capped; the
 *     primary site still accepts 10 MB)
 *   - 200 ms CPU time per invocation (proxying is I/O, so this is ample)
 */

// Hop-by-hop and connection-scoped headers must not be forwarded.
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length", // recomputed by fetch from the actual body
]);

export default async function onRequest(context) {
  const UPSTREAM = context?.env?.UPSTREAM_URL || "https://hope.iyfmyanmar-admin.workers.dev";
  const { request } = context;
  const incoming = new URL(request.url);
  const upstreamUrl = UPSTREAM + incoming.pathname + incoming.search;

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k)) continue;
    // The origin must see its own hostname, or workers.dev routing fails.
    if (k === "x-forwarded-host") continue;
    headers.set(key, value);
  }

  // Forward the request with the original body when applicable.
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const upstreamRes = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const [key, value] of upstreamRes.headers.entries()) {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k)) continue;
    if (k === "set-cookie") continue; // handled below via getSetCookie()
    // Keep visitors on the mirror domain if upstream ever redirects
    // to an absolute workers.dev URL.
    if (k === "location" && value.startsWith(UPSTREAM)) {
      responseHeaders.set("location", value.slice(UPSTREAM.length) || "/");
      continue;
    }
    responseHeaders.set(key, value);
  }
  // Multiple Set-Cookie headers must not be comma-merged (staff login cookies).
  const cookies = upstreamRes.headers.getSetCookie?.();
  if (cookies?.length) {
    for (const c of cookies) responseHeaders.append("set-cookie", c);
  }

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: responseHeaders,
  });
}

export const onRequestGet = onRequest;
export const onRequestPost = onRequest;
export const onRequestPut = onRequest;
export const onRequestPatch = onRequest;
export const onRequestDelete = onRequest;
export const onRequestHead = onRequest;
export const onRequestOptions = onRequest;
