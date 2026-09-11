/**
 * Cloudflare Worker entry point — Hope International School.
 *
 * Phase 1 of the migration plan (docs/cloudflare-migration-plan.md §4):
 * /api/images is live — R2-backed uploads/list/delete for staff. `run_worker_first:
 * ["/api/*"]` in wrangler.jsonc routes just the API paths here; every other
 * request is served from the static assets in ./out before this module ever
 * runs, so site behavior is unchanged. The D1 routes (/api/news, /api/events,
 * /api/gallery, /api/content) land in Phase 2.
 */

import { handleImages } from "./images";

export interface Env {
  /** D1 database (news, events, site_content, gallery) — schema: worker/schema.sql */
  DB: D1Database;
  /** R2 bucket holding gallery/news/event photos */
  IMAGES: R2Bucket;
  /** Static assets binding, auto-provided by the `assets` config block */
  ASSETS: Fetcher;
  /**
   * Supabase JWT secret (supabase.com → Project Settings → API → JWT Secret),
   * used to verify staff access tokens on write routes until Phase 3.
   * Set with: npx wrangler secret put SUPABASE_JWT_SECRET
   */
  SUPABASE_JWT_SECRET: string;
  /**
   * Public base URL images are served from, e.g.
   * https://images.hopeinternationalschool.com (R2 bucket custom domain).
   * Optional: when unset, PUT returns the bare R2 key.
   */
  IMAGE_PUBLIC_BASE_URL?: string;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/images") return handleImages(request, env);

    if (!pathname.startsWith("/api/")) {
      // Static assets have run_worker_first for /api/* only, so this line is
      // just a safety net for manual dev/preview runs.
      return env.ASSETS.fetch(request);
    }

    return json({ error: "not_found", path: pathname }, 404);
  },
} satisfies ExportedHandler<Env>;
