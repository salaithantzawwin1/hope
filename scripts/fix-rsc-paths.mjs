#!/usr/bin/env node
/**
 * fix-rsc-paths.mjs — work around the Next.js 16 static-export RSC path
 * mismatch (vercel/next.js#85374).
 *
 * With `output: "export"`, Next 16 writes prefetch payloads in *folder*
 * form, e.g.
 *
 *   out/en/academics/__next.$d$locale/academics/__PAGE__.txt
 *
 * but the client router requests the same payload in *dot* form:
 *
 *   out/en/academics/__next.$d$locale.academics.__PAGE__.txt
 *
 * The resulting 404s are harmless (the client falls back to fetching the
 * page's HTML), but they flood the console and make navigation slower.
 * This script copies each folder-form payload next to itself under the
 * dot-form name so both forms exist. Idempotent; run after `next build`.
 */
import { readdirSync, copyFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "out";
let copied = 0;
let skipped = 0;

/** Recursively find directories whose name starts with "__next." — each
 *  holds segment payloads like `<segment>/__PAGE__.txt`. */
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry.startsWith("__next.")) {
        emitDotForm(full, dir, entry);
      } else {
        walk(full);
      }
    }
  }
}

/** For every payload inside a `__next.*` directory, copy it next to the
 *  directory under the dot-form name. Two layouts exist:
 *    - inner pages: `__next.$d$locale/<segment>/__PAGE__.txt`
 *      → `<dirName>.<segment>.<file>` (e.g. `__next.$d$locale.about.__PAGE__.txt`)
 *    - root pages:  `__next.$d$locale/__PAGE__.txt` (no segment folder)
 *      → `<dirName>.<file>` (e.g. `__next.$d$locale.__PAGE__.txt`)
 */
function emitDotForm(nextDir, parentDir, dirName) {
  for (const entry of readdirSync(nextDir)) {
    const entryPath = join(nextDir, entry);
    if (statSync(entryPath).isDirectory()) {
      for (const file of readdirSync(entryPath)) {
        if (!file.endsWith(".txt")) continue;
        copyIfMissing(join(entryPath, file), join(parentDir, `${dirName}.${entry}.${file}`));
      }
    } else if (entry.endsWith(".txt")) {
      copyIfMissing(entryPath, join(parentDir, `${dirName}.${entry}`));
    }
  }
}

function copyIfMissing(source, target) {
  if (existsSync(target)) {
    skipped++;
  } else {
    copyFileSync(source, target);
    copied++;
  }
}

walk(OUT);
console.log(`fix-rsc-paths: copied ${copied}, already present ${skipped}`);
