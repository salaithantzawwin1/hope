#!/usr/bin/env node
/**
 * Generate SQL that seeds a LOCAL D1 database with the sample content from
 * lib/fallback-data.ts.
 *
 * Why: with the Worker running, /api/news and /api/events are reachable but
 * empty, and lib/db.ts only falls back to sample data when the API is
 * *unreachable* — so a fresh local D1 would show an empty News/Events page.
 * Seeding keeps local dev looking like the static export does today.
 *
 * Usage (needs Node >= 22.6, which can import a .ts module directly):
 *   node scripts/generate-local-sample-data.mjs > worker/seed-local.sql
 *   npx wrangler d1 execute hope-db --local --file worker/seed-local.sql
 *
 * `on conflict (id) do nothing` keeps it idempotent and never overwrites
 * content added through the admin portal. The gallery is intentionally not
 * seeded: FALLBACK_GALLERY rows have empty image_url values.
 */
import { FALLBACK_EVENTS, FALLBACK_NEWS } from "../lib/fallback-data.ts";

/** SQL literal for a value, or NULL. Doubles single quotes — the sample text has apostrophes. */
const sql = (value) => (value == null ? "NULL" : `'${String(value).replace(/'/g, "''")}'`);

const lines = [
  "-- GENERATED FILE — do not edit by hand.",
  "-- Regenerate: node scripts/generate-local-sample-data.mjs > worker/seed-local.sql",
  "-- Source: lib/fallback-data.ts",
  "",
];

for (const n of FALLBACK_NEWS) {
  const columns = ["id", "title_en", "title_my", "body_en", "body_my", "image_url", "published_at"];
  const values = [n.id, n.title_en, n.title_my, n.body_en, n.body_my, n.image_url, n.published_at];
  lines.push(
    `insert into news (${columns.join(", ")}) values (${values.map(sql).join(", ")}) on conflict (id) do nothing;`,
  );
}

for (const e of FALLBACK_EVENTS) {
  const columns = [
    "id",
    "title_en",
    "title_my",
    "date",
    "time",
    "location_en",
    "location_my",
    "description_en",
    "description_my",
    "image_url",
  ];
  const values = [
    e.id,
    e.title_en,
    e.title_my,
    e.date,
    e.time,
    e.location_en,
    e.location_my,
    e.description_en,
    e.description_my,
    e.image_url,
  ];
  lines.push(
    `insert into events (${columns.join(", ")}) values (${values.map(sql).join(", ")}) on conflict (id) do nothing;`,
  );
}

lines.push("");
console.log(lines.join("\n"));
