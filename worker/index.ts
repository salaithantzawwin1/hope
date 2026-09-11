/**
 * Cloudflare Worker entry point — Hope International School.
 *
 * Phase 0 of the migration plan (docs/cloudflare-migration-plan.md §3):
 * groundwork only. `run_worker_first: ["/api/*"]` in wrangler.jsonc routes
 * just the API paths here; every other request is served from the static
 * assets in ./out before this module ever runs, so site behavior is
 * unchanged. Real route handlers (/api/images, /api/news, /api/events,
 * /api/gallery, /api/content) land in Phases 1–2.
 */

export interface Env {
  /** D1 database (news, events, site_content, gallery) — schema: worker/schema.sql */
  DB: D1Database;
  /** R2 bucket holding gallery/news/event photos */
  IMAGES: R2Bucket;
  /** Static assets binding, auto-provided by the `assets` config block */
  ASSETS: Fetcher;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (!pathname.startsWith("/api/")) {
      // Static assets have run_worker_first for /api/* only, so this line is
      // just a safety net for manual dev/preview runs.
      return env.ASSETS !== undefined
        ? env.ASSETS.fetch(request)
        : new Response("Not found", { status: 404 });
    }

    return json({ error: "not_found", path: pathname }, 404);
  },
} satisfies ExportedHandler<Env>;
