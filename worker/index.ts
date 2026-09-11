/**
 * Cloudflare Worker entry point — Hope International School.
 *
 * Phase 3 of the migration plan (docs/cloudflare-migration-plan.md): the site
 * no longer uses Supabase. Static pages are served from ./out; the Worker
 * serves the same-origin API on /api/*:
 *
 *   /api/auth/*   — staff passphrase login (signed session cookie)
 *   /api/images   — R2 image upload/list/delete        (was Supabase Storage)
 *   /api/news     — D1 CRUD                            (was Supabase Postgres)
 *   /api/events   — D1 CRUD
 *   /api/gallery  — D1 CRUD + batch album ops
 *   /api/content  — site_content key/value CRUD
 *
 * `run_worker_first: ["/api/*"]` keeps every other request on static assets,
 * so page rendering is unchanged. Auth details in worker/auth.ts.
 */

import {
  handleAuthCheck,
  handleLogin,
  handleLogout,
} from "./auth";
import { handleContent, handleEvents, handleGallery, handleNews } from "./data";
import { handleImages } from "./images";

export interface Env {
  /** D1 database (news, events, site_content, gallery) — schema: worker/schema.sql */
  DB: D1Database;
  /** R2 bucket holding gallery/news/event photos */
  IMAGES: R2Bucket;
  /** Static assets binding, auto-provided by the `assets` config block */
  ASSETS: Fetcher;
  /** Shared staff passphrase for the admin portal (secret). */
  STAFF_PASSPHRASE: string;
  /** Secret used to sign admin session cookies (secret; e.g. openssl rand -hex 32). */
  SESSION_SECRET: string;
  /**
   * Public base URL images are served from, e.g.
   * https://images.hopeinternationalschool.com (R2 bucket custom domain).
   * Optional: when unset, PUT /api/images returns the bare R2 key.
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

    if (pathname === "/api/auth/login") return handleLogin(request, env);
    if (pathname === "/api/auth/logout") return handleLogout(request);
    if (pathname === "/api/auth/check") return handleAuthCheck(request, env);

    if (pathname === "/api/images") return handleImages(request, env);
    if (pathname === "/api/news") return handleNews(request, env);
    if (pathname === "/api/events") return handleEvents(request, env);
    if (pathname === "/api/gallery") return handleGallery(request, env);
    if (pathname === "/api/content") return handleContent(request, env);

    if (!pathname.startsWith("/api/")) {
      // Static assets have run_worker_first for /api/* only, so this line is
      // just a safety net for manual dev/preview runs.
      return env.ASSETS.fetch(request);
    }

    return json({ error: "not_found", path: pathname }, 404);
  },
} satisfies ExportedHandler<Env>;
