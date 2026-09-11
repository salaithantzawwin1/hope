#!/usr/bin/env node
/**
 * audit-responsive.mjs — cross-device responsive audit (Mobile / Tablet /
 * Laptop / Desktop).
 *
 * Serves the static `out/` export locally, then for every public page at
 * every device width checks:
 *   1. Horizontal overflow (document wider than viewport).
 *   2. Tap targets smaller than ~40px (a11y on touch screens).
 *   3. Inputs whose font-size < 16px (iOS Safari auto-zoom trigger).
 *   4. Screenshot capture per page/width (screens/ folder).
 *
 * Usage:
 *   npm run build                     (out/ must exist)
 *   node scripts/audit-responsive.mjs
 */

import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const PORT = 4173 + Math.floor(Math.random() * 100);
const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chrome/Edge found — set executablePath manually.");
  process.exit(2);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  let file = join(OUT, path);
  if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
  if (!existsSync(file)) {
    file = join(OUT, "404.html");
    if (!existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
  }
  res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});

await new Promise((r) => server.listen(PORT, r));

// Device profiles: width x height, mobile flag, DPR.
const DEVICES = [
  { name: "Mobile S (375×667)", width: 375, height: 667, mobile: true },
  { name: "Mobile L (414×896)", width: 414, height: 896, mobile: true },
  { name: "Tablet (768×1024)", width: 768, height: 1024, mobile: true },
  { name: "Tablet L (1024×768)", width: 1024, height: 768, mobile: false },
  { name: "Laptop (1440×900)", width: 1440, height: 900, mobile: false },
  { name: "Desktop (1920×1080)", width: 1920, height: 1080, mobile: false },
];

const PAGES = [
  "en/",
  "my/",
  "en/about/",
  "en/academics/",
  "en/admissions/",
  "en/news/",
  "en/gallery/",
  "en/carrier/",
  "en/contact/",
  "en/register/",
];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});

const shotDir = join(ROOT, "screens");
mkdirSync(shotDir, { recursive: true });

const problems = [];
let checks = 0;

for (const device of DEVICES) {
  const page = await browser.newPage();
  await page.setViewport({
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.mobile ? 2 : 1,
    isMobile: device.mobile,
    hasTouch: device.mobile,
  });

  for (const path of PAGES) {
    // Supabase fetches can hang — don't wait for network idle.
    await page.goto(`http://localhost:${PORT}/${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500)); // settle client fetches

    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const out = { overflowEls: [], smallTaps: 0, smallTapSample: [], zoomInputs: 0 };

      // 1. Horizontal overflow — elements sticking out of the viewport.
      const docW = document.documentElement.scrollWidth;
      if (docW > vw + 1) {
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const style = getComputedStyle(el);
          if (style.position === "fixed" || style.position === "absolute") continue;
          if (r.right > vw + 8 || r.left < -8) {
            out.overflowEls.push(
              `${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/).slice(0, 3).join(".")}`,
            );
            if (out.overflowEls.length >= 3) break;
          }
        }
      }

      // 2. Tap targets under 40px (links + buttons only; icons inside larger
      //    buttons are naturally smaller).
      for (const el of document.querySelectorAll("a, button")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") continue;
        if (r.height < 40 || Math.min(r.width, r.height) < 40) {
          out.smallTaps++;
          if (out.smallTapSample.length < 3) {
            out.smallTapSample.push(
              `${el.tagName.toLowerCase()}:${(el.textContent ?? "").trim().slice(0, 22) || el.getAttribute("aria-label") || "?"} (${Math.round(r.width)}×${Math.round(r.height)})`,
            );
          }
        }
      }

      // 3. iOS zoom trigger: visible text inputs below 16px.
      for (const el of document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=file]), select, textarea")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 16) out.zoomInputs++;
      }

      out.docW = docW;
      out.vw = vw;
      return out;
    });

    checks++;
    const rel = path.replace(/\/$/, "");
    if (result.overflowEls.length > 0) {
      problems.push(`[overflow] ${device.name} ${rel}: docW=${result.docW} vw=${result.vw} → ${result.overflowEls.join(", ")}`);
    }
    if (device.mobile && result.smallTaps > 0) {
      problems.push(`[tap] ${device.name} ${rel}: ${result.smallTaps} small tap targets, e.g. ${result.smallTapSample.join(" | ")}`);
    }
    if (device.mobile && result.zoomInputs > 0) {
      problems.push(`[zoom] ${device.name} ${rel}: ${result.zoomInputs} inputs < 16px (iOS auto-zoom)`);
    }

    await page.screenshot({
      path: join(shotDir, `${device.name.split(" ")[0].replace(/[()]/g, "")}-${rel.replace(/\//g, "_") || "home"}.png`),
      fullPage: device.mobile, // full page on mobile to catch everything
    });
  }
  await page.close();
}

await browser.close();
server.close();

console.log(`\n╔══════════════════════════════════════════════════════╗`);
console.log(`║   Responsive audit — ${PAGES.length} pages × ${DEVICES.length} widths = ${checks} checks   ║`);
console.log(`╚══════════════════════════════════════════════════════╝\n`);

if (problems.length === 0) {
  console.log("  ✅ No overflow, no tap-target or iOS-zoom issues found.\n");
} else {
  const groups = {};
  for (const p of problems) {
    const key = p.split("] ")[0] + "]";
    (groups[key] ??= []).push(p);
  }
  for (const [kind, list] of Object.entries(groups)) {
    console.log(`  ${kind === "[overflow]" ? "❌" : kind === "[tap]" ? "⚠️ " : "ℹ️ "} ${kind} ${list.length} finding(s):`);
    for (const p of list.slice(0, 12)) console.log(`     ${p}`);
    if (list.length > 12) console.log(`     … and ${list.length - 12} more`);
    console.log();
  }
  console.log(`  Screenshots: ${relative(ROOT, shotDir)}\\n`);
}
process.exit(0);
