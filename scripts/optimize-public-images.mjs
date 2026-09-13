#!/usr/bin/env node
/**
 * optimize-public-images.mjs — shrink the images shipped in `public/`.
 *
 * The site is a static export with `images.unoptimized: true`, so whatever
 * sits in `public/` is served byte-for-byte at the size it was committed.
 * The two bundled defaults had grown far past what the layout needs:
 *
 *   public/Logo.jpg      2048×2048, 204 KB → drawn at 40×40 (header) and 28×28
 *   public/Bunner/01.jpg 2048×1536, 470 KB → hero background + welcome photo
 *
 * Re-encoding those with the browser's own JPEG encoder (no new dependency —
 * puppeteer-core is already a devDependency) cuts roughly 85% of the bytes
 * with no visible difference, since the hero sits under a 75% dark overlay.
 *
 * Files already within the target size are skipped, so re-running is safe.
 *
 * Usage:
 *   node scripts/optimize-public-images.mjs            # the bundled defaults
 *   node scripts/optimize-public-images.mjs public/Bunner/02.jpg
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  // macOS / Linux (for anyone running this outside the school's Windows box)
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

/** `max` is the longest edge in px; the logo only ever renders at 40×40. */
const DEFAULT_JOBS = [
  { file: "public/Logo.jpg", max: 256, quality: 0.92 },
  // The hero sits under a dark overlay, so a lower quality is invisible
  // there; the same file doubles as the (undarkened) welcome photo, which
  // keeps this from going any lower.
  { file: "public/Bunner/01.jpg", max: 1600, quality: 0.66 },
];

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chrome/Edge found — set executablePath manually.");
  process.exit(2);
}

const cliFiles = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const jobs = cliFiles.length
  ? cliFiles.map((file) => {
      const known = DEFAULT_JOBS.find((j) => j.file === file);
      // Ad-hoc files reuse the banner settings unless they are the logo.
      return known ?? { file, max: 1920, quality: 0.72 };
    })
  : DEFAULT_JOBS;

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

console.log("\n╔════════════════════════════════════════════════════╗");
console.log("║        Public image optimisation (JPEG)           ║");
console.log("╚════════════════════════════════════════════════════╝\n");

let saved = 0;

for (const { file, max, quality } of jobs) {
  const full = join(ROOT, file);
  if (!existsSync(full)) {
    console.log(`  ⚠  ${file} — not found, skipped`);
    continue;
  }

  const before = readFileSync(full);
  const dataUrl = `data:image/jpeg;base64,${before.toString("base64")}`;

  const result = await page.evaluate(
    async (src, maxEdge, q) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxEdge / Math.max(w, h));
      const outW = Math.max(1, Math.round(w * scale));
      const outH = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, outW, outH);
      return {
        srcW: w,
        srcH: h,
        outW,
        outH,
        skipped: scale === 1,
        dataUrl: canvas.toDataURL("image/jpeg", q),
      };
    },
    dataUrl,
    max,
    quality,
  );

  if (result.skipped) {
    console.log(
      `  ✓  ${file} — ${result.srcW}×${result.srcH}, ${kb(before.length)}: already within ${max}px, skipped\n`,
    );
    continue;
  }

  const after = Buffer.from(result.dataUrl.split(",")[1], "base64");
  writeFileSync(full, after);
  const delta = before.length - after.length;
  saved += delta;
  console.log(`  ✓  ${file}`);
  console.log(
    `     ${result.srcW}×${result.srcH} ${kb(before.length)}  →  ${result.outW}×${result.outH} ${kb(after.length)}`,
  );
  console.log(`     saved ${kb(delta)} (${Math.round((delta / before.length) * 100)}%)\n`);
}

await browser.close();

console.log("────────────────────────────────────────────────────");
console.log(`  Total saved: ${kb(saved)}\n`);
