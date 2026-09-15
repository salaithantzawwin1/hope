# Vercel Proxy for Myanmar Access

This project proxies all requests to your Cloudflare Worker (`hope.iyfmyanmar-admin.workers.dev`) so that visitors in Myanmar can access your site without a VPN.

## How it works

```
Myanmar visitor → Vercel (this proxy) → Cloudflare Worker API → D1 + R2
```

## Setup

1. Push this project to a GitHub/GitLab repository
2. Import it into Vercel: https://vercel.com/new
3. Add custom domain `mm.mmgoodnewshr.online` in Vercel project settings
4. Deploy

## Environment Variables

Set these in Vercel project settings (Settings → Environment Variables):

| Variable | Value | Required |
|---|---|---|
| `UPSTREAM_URL` | `https://hope.iyfmyanmar-admin.workers.dev` | Yes |

## How to use

- Myanmar visitors go to `https://mm.mmgoodnewshr.online`
- Vercel proxies all requests to your Cloudflare Worker
- The Worker handles API, database, images, and static assets

## Limitations

- **CV uploads through the proxy are capped at ~4.5 MB** (Vercel serverless
  request-body limit). The Worker itself accepts CVs up to 10 MB, so large
  CVs fail with 413 on `mm.mmgoodnewshr.online` but still work on the
  workers.dev domain. Most text PDF CVs are well under the limit.
- Pages served through the proxy are HTML documents generated per request;
  static assets (`/_next/static/*`, images) keep the Worker's immutable
  cache headers, so browser caching still works normally.
