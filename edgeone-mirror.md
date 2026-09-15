# EdgeOne Pages — Myanmar-reachable mirror (documentation)

Myanmar ISPs block Cloudflare's customer-edge IP ranges (both `workers.dev`
and Worker custom domains resolve to blocked IPs) and Vercel's edge. Tencent
EdgeOne's nodes are reachable from Myanmar (verified 2026-09 via
`EO-Cache-Status: HIT` served to an MM network), so EdgeOne Pages mirrors the
site for Myanmar visitors at no cost.

## Architecture

```
Myanmar visitor → mm mirror (EdgeOne edge) ─┬─ pages & assets: served from repo build
                                            └─ /api/* → edge function proxy →
                                                hope.iyfmyanmar-admin.workers.dev (Worker → D1 + R2)
Rest of world → www.mmgoodnewshr.online → Cloudflare Worker (direct)
```

## Files

- `edge-functions/api/[[default]].js` — catch-all edge function proxying
  `/api/*` (all methods) to the Worker origin. Preserves multiple
  `Set-Cookie` headers (staff login), rewrites absolute upstream redirects,
  strips hop-by-hop headers.

## Deploying the mirror

1. Sign up at https://pages.edgeone.ai (free plan — no card required).
2. Import the GitHub repo (`salaithantzawwin1/hope`).
3. Build settings: static export already lands in `out/` via `npm run build`
   (`node >= 20`, install command `npm ci`).
4. Add the mirror domain in EdgeOne (Domain Management) and point DNS at the
   EdgeOne CNAME (grey-cloud / DNS only in Cloudflare).

## Known limits (EdgeOne free plan)

- Edge-function request body ≤ **1 MB** — CV uploads through the mirror are
  capped at 1 MB (the primary site still accepts 10 MB).
- Edge functions: JavaScript only, 200 ms CPU per request (proxying is I/O,
  so this is ample).
