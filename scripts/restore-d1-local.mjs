#!/usr/bin/env node
/**
 * Load backups/latest.sql into the LOCAL D1 database.
 *
 * Use case: content snapshots are committed to git by `npm run backup:d1` /
 * the nightly workflow. After cloning or pulling on any computer, run
 * `npm run restore:d1` so the local admin portal (npx wrangler dev) shows
 * the same content the production site serves.
 *
 * Semantics: exact point-in-time restore. The four content tables are
 * dropped and recreated from the snapshot, so the local content mirrors the
 * snapshot exactly (rows deleted in production disappear locally too).
 * Only the local dev database is touched — PRODUCTION IS NEVER MODIFIED.
 *
 * Usage: npm run restore:d1   (requires backups/latest.sql to exist — run
 * `npm run backup:d1` or `git pull` first)
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";

const DB_NAME = "hope-db";
const SNAPSHOT = "backups/latest.sql";

if (!existsSync(SNAPSHOT)) {
  console.error(
    `No ${SNAPSHOT} found.\n` +
      "Get a snapshot first: `git pull` (committed by the nightly workflow)\n" +
      "or create one now: `npm run backup:d1`.",
  );
  process.exit(1);
}

// The snapshot contains `CREATE TABLE news (…)` statements, which fail if the
// local tables already exist. Since this is a restore, dropping first is the
// correct semantic — prepend the drops to a copy of the snapshot and load
// that single file.
const wrapper = "backups/.restore-local.sql";
writeFileSync(
  wrapper,
  [
    "drop table if exists news;",
    "drop table if exists events;",
    "drop table if exists gallery;",
    "drop table if exists site_content;",
    "",
    readFileSync(SNAPSHOT, "utf8"),
  ].join("\n"),
);

console.log(`Restoring LOCAL ${DB_NAME} from ${SNAPSHOT} …`);
try {
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", DB_NAME, "--local", "--file", wrapper],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  console.log("\nDone. Local content now mirrors backups/latest.sql.");
  console.log("Start the local admin portal with: npx wrangler dev");
} finally {
  rmSync(wrapper, { force: true });
}
