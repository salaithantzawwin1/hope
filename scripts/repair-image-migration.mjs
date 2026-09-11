#!/usr/bin/env node
/**
 * One-time repair for the interrupted image migration.
 *
 * scripts/migrate-images-to-r2.mjs first ran against a Worker whose PUT
 * always minted a NEW key, so:
 *   - D1 rows were rewritten to /api/img/<original-key>, but
 *   - R2 received the bytes under freshly minted keys ("strays").
 *
 * This script (idempotent, safe to re-run):
 *   1. For every gallery/news/events row pointing at /api/img/<key>:
 *        - skip when R2 already has <key>
 *        - else re-download the ORIGINAL bytes from the Supabase URL
 *          (built back from <key>) and PUT with ?key=<key> so the bytes
 *          land under the exact key the row references
 *        - 404 from Supabase on an otherwise-fine key = hard error, abort
 *   2. Delete stray R2 objects that no D1 row references.
 *
 * Requires HOPE_PASSPHRASE (admin passphrase) and wrangler OAuth.
 */

import { execSync } from "node:child_process";

const WORKER_BASE = "https://hope.iyfmyanmar-admin.workers.dev";
const SUPABASE_PREFIX =
  "https://drzckckxkijxqkizfndh.supabase.co/storage/v1/object/public/images/";

function d1Select(sql) {
  const out = execSync(
    `npx wrangler d1 execute hope-db --remote --json --command ${JSON.stringify(sql)}`,
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const start = out.indexOf("[");
  return JSON.parse(out.slice(start))[0]?.results ?? [];
}

async function login() {
  const passphrase = process.env.HOPE_PASSPHRASE;
  if (!passphrase) {
    console.error("Missing HOPE_PASSPHRASE env var.");
    process.exit(1);
  }
  const res = await fetch(`${WORKER_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ passphrase }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("no session cookie returned");
  return cookie;
}

/** GET /api/img/<key> status — 200 (present) or 404 (absent). */
async function r2Status(key) {
  const res = await fetch(`${WORKER_BASE}/api/img/${key}`);
  if (res.status === 200 || res.status === 404) return res.status;
  throw new Error(`unexpected ${res.status} checking ${key}`);
}

/** PUT bytes into R2 under an exact key. */
async function putExact(key, body, cookie) {
  const folder = key.split("/")[0];
  const put = await fetch(
    `${WORKER_BASE}/api/images?folder=${encodeURIComponent(folder)}&key=${encodeURIComponent(key)}`,
    { method: "PUT", headers: { "content-type": "image/jpeg", cookie }, body },
  );
  if (!put.ok) {
    const text = await put.text().catch(() => "");
    throw new Error(`PUT ${key} failed ${put.status}: ${text}`);
  }
  const { key: got } = await put.json();
  if (got !== key) throw new Error(`key mismatch: asked ${key} got ${got}`);
}

/** List every object key currently in R2. */
async function listR2Keys() {
  const res = await fetch(`${WORKER_BASE}/api/images`);
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  const { images } = await res.json();
  return images.map((i) => i.key);
}

// ---------------------------------------------------------------------------

const cookie = await login();
const tables = ["gallery", "news", "events"];

// Pass 1 — collect the keys the rows actually reference.
const wanted = new Set();
for (const table of tables) {
  const rows = d1Select(
    `select id, image_url from ${table} where image_url like '/api/img/%'`,
  );
  for (const row of rows) {
    const key = row.image_url.slice("/api/img/".length);
    if (!/^[a-z0-9-]+\/[\w.-]+$/.test(key)) {
      console.warn(`! ${table}/${row.id}: unexpected key shape "${key}" — skipping`);
      continue;
    }
    wanted.add(key);
  }
}
console.log(`Rows reference ${wanted.size} key(s).`);

// Pass 2 — ensure each wanted key exists in R2 with the original bytes.
let fixed = 0;
for (const key of wanted) {
  const status = await r2Status(key);
  if (status === 200) {
    console.log(`= ${key} present`);
    continue;
  }
  const supabaseUrl = SUPABASE_PREFIX + key;
  console.log(`→ restoring ${key} from Supabase`);
  const img = await fetch(supabaseUrl);
  if (!img.ok) {
    throw new Error(
      `Supabase returned ${img.status} for ${supabaseUrl} — original bytes unavailable, aborting before any deletion.`,
    );
  }
  await putExact(key, await img.arrayBuffer(), cookie);
  fixed += 1;
}
console.log(`Restored ${fixed} object(s).`);

// Pass 3 — delete strays (objects R2 holds that no row references).
const r2Keys = await listR2Keys();
const strays = r2Keys.filter((k) => !wanted.has(k));
console.log(`R2 holds ${r2Keys.length} object(s); ${strays.length} stray(s).`);
let deleted = 0;
for (const key of strays) {
  const del = await fetch(
    `${WORKER_BASE}/api/images?key=${encodeURIComponent(key)}`,
    { method: "DELETE", headers: { cookie } },
  );
  if (!del.ok) throw new Error(`DELETE ${key} failed ${del.status}`);
  deleted += 1;
  console.log(`✓ deleted stray ${key}`);
}

console.log(`\nDone: ${fixed} restored, ${deleted} stray(s) deleted.`);
