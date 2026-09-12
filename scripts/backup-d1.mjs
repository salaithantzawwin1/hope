#!/usr/bin/env node
/**
 * Export the PRODUCTION D1 database (site content) into backups/.
 *
 * Why: content saved from the /admin portal lives only in Cloudflare D1 —
 * git history never sees it. Committing periodic SQL snapshots gives us
 * point-in-time recovery for staff edits (news, events, gallery rows,
 * site_content). Photos live in R2 and are intentionally NOT included:
 * the SQL references them by key/URL and R2 is not touched by a restore.
 *
 * Usage:
 *   npm run backup:d1
 *
 * Requires Cloudflare auth: either `npx wrangler login` (interactive) or
 * CLOUDFLARE_API_TOKEN set in the environment (CI).
 *
 * Output: backups/d1-YYYYMMDD-HHMMSS.sql (+ a `latest.sql` copy for easy
 * diffing. Both paths are committed to git on schedule by GitHub Actions.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DB_NAME = "hope-db";
const BACKUP_DIR = "backups";

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`
  );
}

mkdirSync(BACKUP_DIR, { recursive: true });
const outPath = join(BACKUP_DIR, `d1-${stamp()}.sql`);

console.log(`Exporting production D1 "${DB_NAME}" → ${outPath} …`);
execFileSync(
  "npx",
  ["wrangler", "d1", "export", DB_NAME, "--remote", "--output", outPath],
  { stdio: "inherit", shell: process.platform === "win32" },
);

if (!existsSync(outPath)) {
  console.error(`Export failed: ${outPath} was not created.`);
  process.exit(1);
}
copyFileSync(outPath, join(BACKUP_DIR, "latest.sql"));

console.log(`\nDone. Snapshot: ${outPath}`);
console.log("Restore later with:");
console.log(
  `  npx wrangler d1 execute ${DB_NAME} --remote --file ${outPath}  # upserts existing ids`,
);
console.log(
  "  (For a full point-in-time restore, clear the tables first — see README “Backing up site content”.)",
);
