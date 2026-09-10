#!/usr/bin/env node
/**
 * audit-spacing.mjs  (v2 — section-only)
 *
 * Flags ONLY <section> elements whose className carries py-* tokens
 * outside the approved set.  Buttons, alerts, footer internals, and
 * other small components are ignored.
 *
 * Approved section-level vertical padding values:
 *   py-6   sm:py-8   — PageHeader (compact)
 *   py-10  sm:py-12  — accent / banner sections
 *   py-12  sm:py-16  — standard content sections
 *
 * Usage:  node scripts/audit-spacing.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// ── file discovery ──────────────────────────────────────────────────

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkDir(full, files);
    } else if (/\.(tsx|jsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const ROOT = process.cwd();

const pageFiles = walkDir(join(ROOT, "app")).filter(
  (f) => f.includes("page.tsx") && !f.includes("admin"),
);
const componentFiles = walkDir(join(ROOT, "components")).filter(
  (f) => !f.includes("admin"),
);

const tsxFiles = [...pageFiles, ...componentFiles];

// ── approved tokens ─────────────────────────────────────────────────

const APPROVED = new Set([
  // PageHeader (compact)
  "py-6", "sm:py-8",
  // Accent / banner
  "py-10", "sm:py-12",
  // Standard content
  "py-12", "sm:py-16",
]);

// ── extraction ──────────────────────────────────────────────────────

function extractSectionClasses(filePath) {
  const lines = readFileSync(filePath, "utf-8").split("\n");
  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Only match <section> elements
    if (!/<section\b/.test(line)) continue;

    const classMatch = line.match(/className="([^"]*)"/);
    if (!classMatch) continue;
    const cls = classMatch[1];
    if (!/\bpy-\d/.test(cls)) continue;

    results.push({ line: i + 1, className: cls });
  }

  return results;
}

// ── audit ───────────────────────────────────────────────────────────

let violations = 0;
let total = 0;

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║      Vertical Rhythm Audit — <section> Padding       ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

for (const file of tsxFiles) {
  const entries = extractSectionClasses(file);
  for (const { line, className } of entries) {
    total++;
    const tokens = className.split(/\s+/);
    const pyTokens = tokens.filter((t) => /^(sm:)?py-\d+$/.test(t));
    const bad = pyTokens.filter((t) => !APPROVED.has(t));

    if (bad.length === 0) continue;

    violations++;
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    console.log(`  ⚠  ${rel}:${line}`);
    console.log(`     className: ${className}`);
    console.log(`     bad tokens: ${bad.join(", ")}`);
    console.log();
  }
}

console.log("──────────────────────────────────────────────────────");
if (violations === 0) {
  console.log(`  ✅  All ${total} <section> padding values are approved.\n`);
} else {
  console.log(`  ❌  ${violations} violation(s) found across ${total} sections.\n`);
}
process.exit(violations > 0 ? 1 : 0);
