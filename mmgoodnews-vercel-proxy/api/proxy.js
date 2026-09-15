import { readFileSync } from 'node:fs';

// Vercel Serverless Function — Proxy to Cloudflare Worker
// This proxies ALL requests from Vercel to your Cloudflare Worker,
// so Myanmar visitors can access the site without VPN.

const UPSTREAM = process.env.UPSTREAM_URL || "https://hope.iyfmyanmar-admin.workers.dev";

const config = {
  runtime: 'nodejs20.x',
  maxDuration: 60,
};

export default async function handler(req, res) {
  // Build the upstream URL (preserve path + query string)
  const url = new URL(req.url, UPSTREAM);
  const upstreamUrl = `${UPSTREAM}${url.pathname}${url.search}`;

  // Copy request headers, but fix the Host header
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() === "host") continue; // Vercel sets this
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }
  // Set the Host header to the upstream domain
  headers.set("Host", new URL(UPSTREAM).host);

  // Read request body (if any)
  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }

  try {
    // Forward the request to the Cloudflare Worker
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: Object.fromEntries(headers),
      body: body,
      redirect: "manual", // Don't follow redirects — pass them through
    });

    // Copy response headers
    const responseHeaders = {};
    upstreamRes.headers.forEach((value, key) => {
      // Skip headers that Vercel handles or that need special treatment
      if (key.toLowerCase() === "content-encoding") return; // Vercel handles compression
      if (key.toLowerCase() === "transfer-encoding") return;
      if (key.toLowerCase() === "set-cookie") return; // handled below via getSetCookie()
      // Keep visitors on the proxy domain: if upstream redirects back to the
      // workers.dev origin, rewrite to a relative path instead.
      if (key.toLowerCase() === "location" && value.startsWith(UPSTREAM)) {
        responseHeaders[key] = value.slice(UPSTREAM.length) || "/";
        return;
      }
      responseHeaders[key] = value;
    });

    // Multiple Set-Cookie headers must not be comma-merged (breaks auth cookies)
    const setCookies = upstreamRes.headers.getSetCookie?.();
    if (setCookies?.length) responseHeaders["set-cookie"] = setCookies;

    // Get response body
    const responseBody = await upstreamRes.arrayBuffer();

    res.status(upstreamRes.status);
    for (const [key, value] of Object.entries(responseHeaders)) {
      res.setHeader(key, value);
    }
    if (responseHeaders["set-cookie"]) res.setHeader("Set-Cookie", responseHeaders["set-cookie"]);
    res.end(Buffer.from(responseBody));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Bad Gateway",
      message: "Unable to reach upstream server",
      upstream: UPSTREAM,
    }));
  }
}
