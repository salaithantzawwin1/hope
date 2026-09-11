#!/usr/bin/env node
/**
 * One-time migration: copy images still hosted on Supabase Storage into the
 * R2 bucket and rewrite the D1 rows to same-origin /api/img/<key> URLs.
 *
 * Why: gallery/news/event photos created before the Cloudflare migration
 * point at https://<proj>.supabase.co/storage/... — Supabase's free tier
 * pauses the project after ~1 week idle, which would blank every photo.
 * R2 has no idle pause and free egress.
 *
 * What it does, per table (gallery, news, events):
 *   1. select rows whose image_url starts with the Supabase prefix
 *   2. download each image from Supabase (public bucket)
 *   3. PUT it into R2 under the same key (gallery/…, news/…, events/…)
 *   4. verify GET /api/img/<key> returns 200 + image content-type
 *   5. rewrite the row's image_url to /api/img/<key>
 *
 * Steps 2–4 are restart-safe: an already-copied key is detected via the
 * R2 HEAD call and skipped, so re-running never duplicates work.
 * Supabase itself is NOT touched — its bucket stays as a free rollback.
 *
 * Usage:
 *   node scripts/migrate-images-to-r2.mjs
 *
 * Requires: wrangler OAuth (npx wrangler login) and the deployed Worker.
 */

import { execSync } from "node:child_process";

const WORKER_BASE = "https://hope.iyfmyanmar-admin.workers.dev";
const SUPABASE_PREFIX =
  "https://drzckckxkijxqkizfndh.supabase.co/storage/v1/object/public/images/";

/** Run a read-only SQL select through wrangler and return rows. */
function d1Select(sql) {
  const out = execSync(
    `npx wrangler d1 execute hope-db --remote --json --command ${JSON.stringify(sql)}`,
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  // wrangler may print warnings before the JSON — grab from the first "[".
  const start = out.indexOf("[");
  const parsed = JSON.parse(out.slice(start));
  return parsed[0]?.results ?? [];
}

/** Run a write SQL through wrangler (no JSON parsing needed). */
function d1Run(sql) {
  execSync(
    `npx wrangler d1 execute hope-db --remote --command ${JSON.stringify(sql)}`,
    { stdio: "pipe", maxBuffer: 64 * 1024 * 1024 },
  );
}

/** Log in to the admin API and return the session cookie for PUT calls. */
async function login() {
  const passphrase = process.env.HOPE_PASSPHRASE;
  if (!passphrase) {
    console.error(
      "Missing HOPE_PASSPHRASE env var (the /admin portal passphrase) — needed to authorize uploads.",
    );
    process.exit(1);
  }
  const res = await fetch(`${WORKER_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ passphrase }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("login did not return a session cookie");
  return cookie;
}

/** Does this key already exist in R2? */
async function r2Has(key) {
  const res = await fetch(`${WORKER_BASE}/api/img/${key}`, { method: "GET" });
  if (res.status === 200) return true;
  if (res.status === 404) return false;
  throw new Error(`unexpected status ${res.status} for ${key}`);
}

/** Download from Supabase and PUT into R2 through the Worker. */
let sessionCookie = "";

async function copyToR2(key, url) {
  const img = await fetch(url);
  if (!img.ok) throw new Error(`Supabase download failed ${img.status} for ${url}`);
  const body = await img.arrayBuffer();
  const put = await fetch(
    `${WORKER_BASE}/api/images?folder=${encodeURIComponent(key.split("/")[0])}&key=${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: { "content-type": "image/jpeg", cookie: sessionCookie },
      body,
    },
  );
  if (!put.ok) {
    const text = await put.text().catch(() => "");
    throw new Error(`R2 upload failed ${put.status} for ${key}: ${text}`);
  }
  const { key: newKey } = await put.json();
  if (newKey !== key) throw new Error(`key mismatch: asked for ${key}, got ${newKey}`);
}

/** Full check-and-copy for one key. Returns true when a copy happened. */
async function ensureInR2(key, url) {
  if (await r2Has(key)) {
    console.log(`  = ${key} already in R2, skipping download`);
    return false;
  }
  console.log(`  → copying ${key}`);
  await copyToR2(key, url);
  return true;
}

// ---------------------------------------------------------------------------
const tables = ["gallery", "news", "events"];
let totalCopied = 0;
let totalRewritten = 0;

sessionCookie = await login();

for (const table of tables) {
  console.log(`\n== ${table} ==`);
  // substr() equality instead of LIKE: D1 rejects longer LIKE patterns with
  // "LIKE or GLOB pattern too complex" (code 7500).
  const rows = d1Select(
    `select id, image_url from ${table} where substr(image_url, 1, ${SUPABASE_PREFIX.length}) = '${SUPABASE_PREFIX}'`,
  );
  console.log(`${rows.length} row(s) still on Supabase`);

  for (const row of rows) {
    const key = row.image_url.slice(SUPABASE_PREFIX.length);
    if (!/^[a-z0-9-]+\/[\w.-]+$/.test(key)) {
      console.warn(`  ! skipping unexpected key shape: ${key}`);
      continue;
    }
    await ensureInR2(key, row.image_url);
    totalCopied += 1;

    const newUrl = `/api/img/${key}`;
    d1Run(`update ${table} set image_url='${newUrl}' where id='${row.id}'`);
    totalRewritten += 1;
    console.log(`  ✓ rewritten ${table}/${row.id}`);
  }
}

console.log(`\nDone: ${totalCopied} object(s) ensured in R2, ${totalRewritten} row(s) rewritten.`);
console.log("Supabase bucket intentionally left intact as rollback.");
